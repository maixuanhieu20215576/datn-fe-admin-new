interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }
  
  const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
  }: PaginationProps) => {
    const getPageNumbers = () => {
      const delta = 1; // Number of pages to show around the current page
      const range: (number | string)[] = [];
      for (
        let i = Math.max(1, currentPage - delta);
        i <= Math.min(totalPages, currentPage + delta);
        i++
      ) {
        range.push(i);
      }
      if (typeof range[0] === "number" && range[0] > 1) {
        range.unshift(1);
        if (range[1] !== 2) range.splice(1, 0, "...");
      }
  
      if (
        typeof range[range.length - 1] === "number" &&
        (range[range.length - 1] as number) < totalPages
      ) {
        if (range[range.length - 1] !== totalPages - 1) range.push("...");
        range.push(totalPages);
      }
      return range;
    };
  
    const pageNumbers = getPageNumbers();
  
    return (
      <div className="flex justify-center space-x-4 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        Previous
      </button>
      {pageNumbers.map((number, index) =>
        number === "..." ? (
          <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-500">
            ...
          </span>
        ) : (
          <button
            // Ensuring unique key by prefixing with 'page-'
            key={`page-${number}`}
            onClick={() => onPageChange(number as number)}
            className={`px-4 py-2 rounded ${
              currentPage === number
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            {number}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        Next
      </button>
    </div>
    
    );
  };
  
  export default Pagination;
  