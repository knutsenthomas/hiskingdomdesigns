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
      throw new Error('Handlekurven inneholder ugyldige varer eller antall.');
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
    throw new Error('Wix-kassen mangler varer eller har andre produktvalg eller antall. Handlekurven er bevart. Prøv igjen.');
  }
  return checkout;
};

export const createVerifiedCheckout = async (wixClient, lineItems) => {
  if (!lineItems?.length) throw new Error('Handlekurven er tom.');
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
      shippingInfo.shippingDestination = {
        address: {
          country: shippingAddress.country || 'NO',
          postalCode: shippingAddress.postalCode,
          city: shippingAddress.city
        }
      };
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
      if (appCode === 'ERROR_COUPON_DOES_NOT_EXIST') {
        msg = `Rabattkoden "${couponCode}" finnes ikke.`;
      } else if (appCode === 'ERROR_COUPON_EXPIRED') {
        msg = `Rabattkoden "${couponCode}" er utløpt.`;
      } else if (appCode === 'ERROR_COUPON_MINIMUM_SUBTOTAL_NOT_REACHED') {
        msg = `Kjøpesummen er for lav for rabattkoden "${couponCode}".`;
      }
      throw new Error(`${msg} Fjern koden eller prøv en annen før du går til kassen.`);
    }
  }

  // 3. Apply gift card if provided
  if (giftCardCode) {
    try {
      currentId = await applyGiftCardToCheckout(wixClient, currentId, giftCardCode);
    } catch (giftCardErr) {
      throw new Error(`Gavekortet kunne ikke aktiveres i kassen: ${giftCardErr?.message || 'Ugyldig eller utløpt kode'}.`);
    }
  }

  return currentId;
};
