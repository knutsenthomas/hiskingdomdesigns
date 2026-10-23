// Helper to safely extract email from Wix member object across various schema versions
const getMemberEmail = (member) => {
  if (member?.loginEmail) return member.loginEmail;

  const cdEmails = member?.contactDetails?.emails || [];
  if (cdEmails[0]) {
    return typeof cdEmails[0] === "object" ? cdEmails[0].email : cdEmails[0];
  }

  const cEmails = member?.contact?.emails || [];
  if (cEmails[0]) {
    return typeof cEmails[0] === "object" ? cEmails[0].email : cEmails[0];
  }

  return member?.contact?.email || member?.contactDetails?.email || null;
};

export { getMemberEmail };
