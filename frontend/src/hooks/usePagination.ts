import { useState, useMemo } from 'react'

export function usePagination<T>(items: T[], itemsPerPage: number = 12) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(items.length / itemsPerPage)
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return items.slice(start, start + itemsPerPage)
  }, [items, currentPage, itemsPerPage])
  const reset = () => setCurrentPage(1)
  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    reset
  }
}
