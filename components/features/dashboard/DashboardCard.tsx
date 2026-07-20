import classNames from 'classnames';
import React from 'react';

interface DashboardCardProps extends React.ComponentPropsWithRef<'div'> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable card wrapper for dashboard sections.
 * Provides consistent, responsive padding and styling across the dashboard.
 */
const DashboardCard = ({
  children,
  className,
  ...props
}: DashboardCardProps) => (
  <div
    className={classNames(
      'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export default DashboardCard;
