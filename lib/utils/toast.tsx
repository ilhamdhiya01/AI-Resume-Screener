'use client';

import toast from 'react-hot-toast';

import Icon, { IconProps } from '@/components/ui/icon';

type NotifyType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'confirm';

interface NotifyOptions {
  type: NotifyType;
  title: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  duration?: number | typeof Infinity;
}

const TOAST_CONFIG: Record<
  Exclude<NotifyType, 'confirm'>,
  { color: string; icon: IconProps['icon'] }
> = {
  success: { color: '#10b981', icon: 'TbCircleCheck' },
  error: { color: '#ef4444', icon: 'TbCircleX' },
  warning: { color: '#f59e0b', icon: 'TbAlertTriangle' },
  info: { color: '#3b82f6', icon: 'TbInfoCircle' },
  loading: { color: '#3b82f6', icon: 'TbLoader' },
};

/**
 * @description Shows a structured toast with title, optional description, and optional confirm actions.
 * @param {NotifyOptions} options - Toast configuration.
 * @returns {string} Toast ID.
 */
export const notify = ({
  type,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  duration = 4000,
}: NotifyOptions) => {
  const isConfirm = type === 'confirm' || onConfirm !== undefined;
  const { color, icon } = isConfirm
    ? { color: '#3b82f6', icon: 'TbInfoCircle' as IconProps['icon'] }
    : TOAST_CONFIG[type as Exclude<NotifyType, 'confirm'>];

  return toast.custom(
    (t) => (
      <div
        className="relative flex max-w-md min-w-[330px] gap-3 rounded-lg bg-white p-4 shadow-lg"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div className="shrink-0" style={{ color }}>
          <Icon icon={icon} size={20} />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
          {isConfirm && (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onConfirm?.();
                  toast.dismiss(t.id);
                }}
                className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
              >
                {confirmLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onCancel?.();
                  toast.dismiss(t.id);
                }}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                {cancelLabel}
              </button>
            </div>
          )}
        </div>
        {!isConfirm && (
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="absolute top-2 right-2 shrink-0 text-sm text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>
    ),
    { duration }
  );
};
