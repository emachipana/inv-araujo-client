export interface Pageable<T> {
  content: T[],
  pageable: {},
  number: number,
  totalPages: number,
  totalElements: number,
}
