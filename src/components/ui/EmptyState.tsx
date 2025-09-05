import { clsx } from 'clsx';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={clsx('text-center py-12', className)}>
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="text-gray-400 text-4xl">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && action}
    </div>
  );
}