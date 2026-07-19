/**
 * Pagination helper — calculates skip/limit from query params
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build pagination meta for response
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Build sort object from query string (e.g. "name,-createdAt")
 */
const buildSort = (sortQuery, defaultSort = { createdAt: -1 }) => {
  if (!sortQuery) return defaultSort;
  const sort = {};
  sortQuery.split(',').forEach((field) => {
    if (field.startsWith('-')) {
      sort[field.slice(1)] = -1;
    } else {
      sort[field] = 1;
    }
  });
  return sort;
};

module.exports = { getPagination, buildPaginationMeta, buildSort };
