import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchApprovedTestimonials } from '../src/lib/testimonials.js';

const review = (id, body = 'Review', status = 'APPROVED') => ({
  _id: id, content: { body }, moderation: { moderationStatus: status }
});
const clientFor = firstPage => ({ reviews: { queryReviews: () => ({
  descending: field => {
    assert.equal(field, '_createdDate');
    return { limit: size => {
      assert.equal(size, 100);
      return { find: async () => firstPage };
    } };
  }
}) } });

test('loads all review pages, filters moderation and empty text, and removes duplicates', async () => {
  const first = Array.from({ length: 100 }, (_, id) => review(String(id)));
  const lastPage = { items: [review('100'), review('0'), review('pending', 'Review', 'PENDING'), review('empty', '  ')], hasNext: () => false };
  const firstPage = { items: first, hasNext: () => true, next: async () => lastPage };
  const result = await fetchApprovedTestimonials(clientFor(firstPage));
  assert.equal(result.length, 101);
  assert.deepEqual(result.map(item => item._id), Array.from({ length: 101 }, (_, id) => String(id)));
});

test('pagination errors reject rather than returning an incomplete list', async () => {
  const firstPage = { items: [review('1')], hasNext: () => true, next: async () => { throw new Error('Wix unavailable'); } };
  await assert.rejects(fetchApprovedTestimonials(clientFor(firstPage)), /Wix unavailable/);
});
