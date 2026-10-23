// Helper to safely extract address details from Wix member object across various schema versions
const getMemberAddress = (member) => {
  const contact = member?.contactDetails || member?.contact;
  const addrObj = contact?.addresses?.[0];
  if (!addrObj) return null;

  const address = addrObj.address || addrObj;

  let addressLine =
    address.addressLine || address.addressLine1 || address.formatted || "";
  if (!addressLine && address.streetAddress) {
    if (typeof address.streetAddress === "object") {
      const name = address.streetAddress.name || "";
      const number = address.streetAddress.number || "";
      addressLine = `${name} ${number}`.trim();
    } else if (typeof address.streetAddress === "string") {
      addressLine = address.streetAddress;
    }
  }

  const postalCode = address.postalCode || address.zipCode || "";
  const city = address.city || "";
  const country = address.country || "NO";

  return { addressLine, postalCode, city, country };
};

export { getMemberAddress };
