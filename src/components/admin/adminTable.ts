/** Shared table settings so every admin table has the same size, text and paging. */
export const ADMIN_TABLE_PROPS = {
  size: "small" as const,
  style: { fontSize: 13 },
  pagination: { pageSize: 10, hideOnSinglePage: true, showSizeChanger: false },
};
