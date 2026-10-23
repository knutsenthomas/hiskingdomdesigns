// Helper to safely extract phone from Wix member object across various schema versions
const getMemberPhone = (member) => {
  const cdPhones = member?.contactDetails?.phones || [];
  if (cdPhones[0]) {
    return typeof cdPhones[0] === "object" ? cdPhones[0].phone : cdPhones[0];
  }

  const cPhones = member?.contact?.phones || [];
  if (cPhones[0]) {
    return typeof cPhones[0] === "object" ? cPhones[0].phone : cPhones[0];
  }

  return member?.contact?.phone || member?.contactDetails?.phone || null;
};

export { getMemberPhone };
