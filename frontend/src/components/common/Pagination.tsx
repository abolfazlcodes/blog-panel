import { Button } from "./Button";

interface IPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Simple prev / next pager with a "Page X of Y" indicator. */
const Pagination: React.FC<IPaginationProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <Button
        size="sm"
        variant="outlined"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>

      <span className="text-secondary-text text-d-body2">
        Page {page} of {totalPages}
      </span>

      <Button
        size="sm"
        variant="outlined"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
