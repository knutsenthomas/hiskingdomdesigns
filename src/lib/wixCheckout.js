import { toWixStreetAddress } from './checkoutAddress.js';

// Errors shown to customers carry a translation key; the UI translates them, the message stays Norwegian.
const customerError = (message, i18nKey, i18nParams = {}) => {
  const error = new Error(message);
  error.i18nKey = i18nKey;
  error.i18nParams = i18nParams;
  return error;
};

const stableObject = (value) => {
  if (Array.isArray(value)) return value.map(stableObject);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableObject(value[key])]));
  }
  return value;
};

const cartContents = (items = []) => {
  const contents = new Map();
  for (const item of items) {
    const ref = item.catalogReference;
    if (!ref?.appId || !ref?.catalogItemId || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw customerError('Handlekurven inneholder ugyldige varer eller antall.', 'checkout.errInvalidItems');
    }
    const options = ref.options || {};
    const key = JSON.stringify(stableObject({
      appId: ref.appId,
      catalogItemId: ref.catalogItemId,
      variantId: options.variantId || null,
      options: options.options || {},
      customTextFields: options.customTextFields || {},
    }));
    contents.set(key, (contents.get(key) || 0) + item.quantity);
  }
  return contents;
};

export const assertCheckoutMatches = (checkout, expectedItems) => {
  const expected = cartContents(expectedItems);
  const actual = cartContents(checkout?.lineItems);
  if (!checkout?._id || expected.size === 0 || actual.size !== expected.size ||
      [...expected].some(([key, quantity]) => actual.get(key) !== quantity)) {
    throw customerError('Wix-kassen mangler varer eller har andre produktvalg eller antall. Handlekurven er bevart. Prøv igjen.', 'checkout.errMismatch');
  }
  return checkout;
};

export const createVerifiedCheckout = async (wixClient, lineItems) => {
  if (!lineItems?.length) throw customerError('Handlekurven er tom.', 'checkout.errEmptyCart');
  cartContents(lineItems);
  const checkout = await wixClient.checkout.createCheckout({ lineItems, channelType: 'WEB' });
  return assertCheckoutMatches(checkout, lineItems);
};

export const verifyCheckout = async (wixClient, checkoutId, lineItems) => {
  const checkout = await wixClient.checkout.getCheckout(checkoutId);
  return assertCheckoutMatches(checkout, lineItems);
};

export const updateCheckoutDetails = async (wixClient, checkoutId, { buyerEmail, shippingAddress, selectedShippingRate } = {}) => {
  const updatePayload = {};

  if (buyerEmail) {
    updatePayload.buyerInfo = { email: buyerEmail };
  }

  if (shippingAddress || selectedShippingRate) {
    const shippingInfo = {};
    if (shippingAddress) {
      const address = {
        country: shippingAddress.country || 'NO',
        postalCode: shippingAddress.postalCode,
        city: shippingAddress.city
      };
      const street = shippingAddress.addressLine || shippingAddress.streetAddress || shippingAddress.address;
      if (street) {
        address.streetAddress = toWixStreetAddress(street);
      }

      if (shippingAddress.subdivision) address.subdivision = shippingAddress.subdivision;
      if (shippingAddress.addressLine2) address.addressLine2 = shippingAddress.addressLine2;
      const dest = { address };
      if (shippingAddress.firstName || shippingAddress.lastName || shippingAddress.phone) {
        dest.contactDetails = {};
        if (shippingAddress.firstName) dest.contactDetails.firstName = shippingAddress.firstName;
        if (shippingAddress.lastName) dest.contactDetails.lastName = shippingAddress.lastName;
        if (shippingAddress.phone) dest.contactDetails.phone = shippingAddress.phone;
      }
      shippingInfo.shippingDestination = dest;
    }
    if (selectedShippingRate?.code) {
      shippingInfo.selectedCarrierServiceOption = {
        code: selectedShippingRate.code
      };
    }
    updatePayload.shippingInfo = shippingInfo;
  }

  if (Object.keys(updatePayload).length > 0) {
    const updated = await wixClient.checkout.updateCheckout(checkoutId, updatePayload);
    return updated?._id || checkoutId;
  }
  return checkoutId;
};

export const applyCouponToCheckout = async (wixClient, checkoutId, couponCode) => {
  if (!couponCode) return checkoutId;
  const updated = await wixClient.checkout.updateCheckout(checkoutId, {}, {
    couponCode: couponCode.trim()
  });
  return updated?._id || checkoutId;
};

export const applyGiftCardToCheckout = async (wixClient, checkoutId, giftCardCode) => {
  if (!giftCardCode) return checkoutId;
  const updated = await wixClient.checkout.updateCheckout(checkoutId, {}, {
    giftCardCode: giftCardCode.trim()
  });
  return updated?._id || checkoutId;
};

export const enrichCheckout = async (wixClient, checkoutId, {
  buyerEmail,
  shippingAddress,
  selectedShippingRate,
  couponCode,
  giftCardCode
} = {}) => {
  let currentId = checkoutId;

  // 1. Update contact and shipping details
  if (buyerEmail || shippingAddress || selectedShippingRate) {
    try {
      currentId = await updateCheckoutDetails(wixClient, currentId, {
        buyerEmail,
        shippingAddress,
        selectedShippingRate
      });
    } catch (contactErr) {
      console.warn('Kunne ikke overføre kontakt/fraktinfo til kassen:', contactErr);
    }
  }

  // 2. Apply coupon if provided
  if (couponCode) {
    try {
      currentId = await applyCouponToCheckout(wixClient, currentId, couponCode);
    } catch (couponErr) {
      const appCode = couponErr?.details?.applicationError?.code || '';
      let msg = 'Rabattkoden kunne ikke aktiveres i kassen.';
      let key = 'coupon.checkoutFailed';
      if (appCode === 'ERROR_COUPON_DOES_NOT_EXIST') {
        msg = `Rabattkoden "${couponCode}" finnes ikke.`;
        key = 'coupon.checkoutNotFound';
      } else if (appCode === 'ERROR_COUPON_EXPIRED') {
        msg = `Rabattkoden "${couponCode}" er utløpt.`;
        key = 'coupon.checkoutExpired';
      } else if (appCode === 'ERROR_COUPON_MINIMUM_SUBTOTAL_NOT_REACHED') {
        msg = `Kjøpesummen er for lav for rabattkoden "${couponCode}".`;
        key = 'coupon.checkoutMinSubtotal';
      }
      throw customerError(`${msg} Fjern koden eller prøv en annen før du går til kassen.`, key, { code: couponCode });
    }
  }

  // 3. Apply gift card if provided
  if (giftCardCode) {
    try {
      currentId = await applyGiftCardToCheckout(wixClient, currentId, giftCardCode);
    } catch (giftCardErr) {
      throw customerError(`Gavekortet kunne ikke aktiveres i kassen: ${giftCardErr?.message || 'Ugyldig eller utløpt kode'}.`, 'giftcard.checkoutFailed');
    }
  }

  return currentId;
};

// Use the same redirect preferences for the initial attempt and expired-session recovery.
export const createCheckoutRedirectSession = (wixClient, checkoutId, { returnUrl, thankYouUrl, language = 'no' }) =>
  wixClient.redirects.createRedirectSession({
    ecomCheckout: { checkoutId },
    callbacks: { postFlowUrl: returnUrl, thankYouPageUrl: thankYouUrl },
    preferences: { additionalQueryParameters: { lang: ['no', 'en', 'es'].includes(language) ? language : 'no' } },
  });
