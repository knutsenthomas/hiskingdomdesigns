// Wix's limit of 100 is a page size, never a history limit.
export const orderLanes = ['all', 'PENDING', 'REJECTED'];
export async function orderPage(searchOrders, { lane = 'all', cursor = '' } = {}) {
  if (!orderLanes.includes(lane) || typeof cursor !== 'string' || cursor.length > 16000) throw new Error('invalid-order-page');
  const result = await searchOrders({ filter: lane === 'all' ? {} : { status: lane }, cursorPaging: { limit: 100, ...(cursor ? { cursor } : {}) } });
  if (!Array.isArray(result.orders) || !result.metadata) throw new Error('invalid-order-response');
  const nextCursor = result.metadata.hasNext ? result.metadata.cursors?.next : null;
  if (result.metadata.hasNext && (!nextCursor || nextCursor === cursor)) throw new Error('order-pagination-stalled');
  return { orders: result.orders, nextCursor };
}
export async function allOrders(searchOrders) {
  const orders = new Map();
  for (const lane of orderLanes) {
    let cursor = '', seen = new Set();
    do {
      const page = await orderPage(searchOrders, { lane, cursor });
      for (const order of page.orders) { if (!order._id) throw new Error('order-id-missing'); orders.set(order._id, order); }
      cursor = page.nextCursor;
      if (cursor && seen.has(cursor)) throw new Error('order-pagination-cycle');
      if (cursor) seen.add(cursor);
    } while (cursor);
  }
  return [...orders.values()].sort((a,b)=>new Date(b._createdDate||0)-new Date(a._createdDate||0));
}
