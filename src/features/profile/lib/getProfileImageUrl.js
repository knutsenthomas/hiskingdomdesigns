import { media } from "@wix/sdk";

// Helper to safely extract and build profile image URL from Wix member object
const getProfileImageUrl = (member) => {
  const photo = member?.profile?.photo;
  if (!photo) return null;

  const url = photo.url || photo;
  if (!url || typeof url !== "string") return null;

  if (url.startsWith("wix:image://")) {
    try {
      return (
        media.getScaledToFillImageUrl(url, 160, 160) ||
        media.getImageUrl(url).url
      );
    } catch (e) {
      console.warn("Failed to parse Wix image URI using SDK:", e);
      const match = url.match(/wix:image:\/\/v1\/([^\/]+)/);
      if (match && match[1]) {
        return `https://static.wixstatic.com/media/${match[1]}`;
      }
    }
  }

  return url;
};

export { getProfileImageUrl };
