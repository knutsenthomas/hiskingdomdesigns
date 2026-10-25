export async function fetchApprovedTestimonials(wixClient) {
  let page = await wixClient.reviews.queryReviews()
    .descending('_createdDate')
    .limit(100)
    .find();
  const reviews = new Map();

  while (true) {
    for (const item of page.items) {
      if ((!item.moderation || item.moderation.moderationStatus === 'APPROVED') && item.content?.body?.trim()) {
        reviews.set(item._id, item);
      }
    }
    if (!page.hasNext()) break;
    page = await page.next();
  }

  return [...reviews.values()];
}
