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
