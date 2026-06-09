import { useNavigate } from "react-router";

import { Button } from "./Button";

interface IEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * Friendly empty / no-results placeholder: a tinted icon badge, a title and
 * description, and an optional call-to-action button.
 */
const EmptyState: React.FC<IEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}) => {
  const navigate = useNavigate();

  return (
    <div className="border-divider bg-bg-main flex w-full flex-col items-center justify-center gap-5 rounded-2xl border border-dashed px-6 py-16 text-center">
      <div className="bg-success/10 text-success flex h-20 w-20 items-center justify-center rounded-full">
        {icon}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-secondary-text text-d-body2 mx-auto max-w-sm">
          {description}
        </p>
      </div>

      {actionLabel && actionHref && (
        <Button
          colorType="success"
          size="lg"
          className="font-semibold"
          onClick={() => navigate(actionHref)}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
