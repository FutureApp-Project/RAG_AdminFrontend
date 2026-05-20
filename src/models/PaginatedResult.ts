export default interface PaginatedResult<T> {
  items: T[];
  page: number;
  totalCount: number;
  pageSize: number;
}