/**
 * 轻量 UI 基础组件库（Tailwind 实现，替代 MUI）
 * 颜色统一走 index.css 中的主题 token（primary/paper/fg/line 等），自动适配暗色模式
 */
import { useRef, useEffect, createContext, useContext } from 'react';

const cx = (...cls) => cls.filter(Boolean).join(' ');

/* ---------- 布局 ---------- */

export function Container({ className, children, ...rest }) {
  return (
    <div className={cx('mx-auto w-full max-w-5xl px-4', className)} {...rest}>
      {children}
    </div>
  );
}

export function Card({ className, children, ...rest }) {
  return (
    <div
      className={cx(
        'rounded-xl bg-paper border border-line shadow-sm transition-shadow',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subheader, action, className }) {
  return (
    <div className={cx('flex items-start justify-between gap-2 px-4 pt-4 pb-2', className)}>
      <div>
        {title && <div className="text-base font-semibold text-fg">{title}</div>}
        {subheader && <div className="text-sm text-fg-secondary mt-0.5">{subheader}</div>}
      </div>
      {action}
    </div>
  );
}

export function CardContent({ className, children, ...rest }) {
  return (
    <div className={cx('px-4 py-3', className)} {...rest}>
      {children}
    </div>
  );
}

export function Divider({ className }) {
  return <hr className={cx('border-0 border-t border-line my-4', className)} />;
}

/* ---------- 按钮 ---------- */

const btnVariants = {
  contained: 'bg-primary text-primary-fg hover:bg-primary-hover disabled:bg-muted disabled:text-fg-tertiary',
  outlined: 'border border-primary text-primary hover:bg-primary/10 disabled:border-line disabled:text-fg-tertiary',
  text: 'text-primary hover:bg-primary/10 disabled:text-fg-tertiary',
  danger: 'bg-danger text-white hover:opacity-90',
};

const btnSizes = {
  small: 'h-8 px-3 text-sm',
  medium: 'h-9 px-4 text-sm',
  large: 'h-11 px-5 text-base',
};

export function Button({
  variant = 'contained',
  size = 'medium',
  startIcon,
  endIcon,
  fullWidth,
  className,
  children,
  ...rest
}) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium cursor-pointer',
        'transition-colors disabled:cursor-not-allowed select-none whitespace-nowrap',
        btnVariants[variant] || btnVariants.contained,
        btnSizes[size] || btnSizes.medium,
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
}

export function IconButton({ className, children, ...rest }) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center rounded-full p-2 text-fg-secondary',
        'hover:bg-muted hover:text-fg transition-colors cursor-pointer',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- 表单 ---------- */

const inputBase =
  'w-full rounded-lg border border-line bg-paper text-fg placeholder:text-fg-tertiary ' +
  'px-3 py-2 text-sm outline-none transition-colors ' +
  'focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-muted disabled:text-fg-tertiary';

export function Input({ className, label, error, helperText, ...rest }) {
  return (
    <Labeled label={label} error={error} helperText={helperText}>
      <input className={cx(inputBase, error && 'border-danger focus:border-danger focus:ring-danger/20', className)} {...rest} />
    </Labeled>
  );
}

export function Textarea({ className, label, error, helperText, rows = 4, ...rest }) {
  return (
    <Labeled label={label} error={error} helperText={helperText}>
      <textarea
        rows={rows}
        className={cx(inputBase, 'resize-y font-mono', error && 'border-danger focus:border-danger focus:ring-danger/20', className)}
        {...rest}
      />
    </Labeled>
  );
}

export function Select({ className, label, error, helperText, children, ...rest }) {
  return (
    <Labeled label={label} error={error} helperText={helperText}>
      <select className={cx(inputBase, 'cursor-pointer', className)} {...rest}>
        {children}
      </select>
    </Labeled>
  );
}

function Labeled({ label, error, helperText, children }) {
  if (!label && !helperText) return children;
  return (
    <label className="block w-full">
      {label && <span className="mb-1 block text-sm font-medium text-fg-secondary">{label}</span>}
      {children}
      {helperText && (
        <span className={cx('mt-1 block text-xs', error ? 'text-danger' : 'text-fg-tertiary')}>{helperText}</span>
      )}
    </label>
  );
}

export function Checkbox({ label, className, ...rest }) {
  return (
    <label className={cx('inline-flex items-center gap-2 cursor-pointer text-sm text-fg', className)}>
      <input type="checkbox" className="size-4 accent-[var(--primary)] cursor-pointer" {...rest} />
      {label}
    </label>
  );
}

export function Switch({ checked, onChange, label, className }) {
  return (
    <label className={cx('inline-flex items-center gap-2 cursor-pointer text-sm text-fg', className)}>
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={cx(
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-line'
        )}
      >
        <span
          className={cx(
            'inline-block size-4 rounded-full bg-white shadow transform transition-transform',
            checked ? 'translate-x-4.5' : 'translate-x-0.5'
          )}
        />
      </span>
      {label}
    </label>
  );
}

export function Slider({ className, ...rest }) {
  return <input type="range" className={cx('w-full accent-[var(--primary)] cursor-pointer', className)} {...rest} />;
}

/* ---------- 反馈 ---------- */

const alertStyles = {
  success: 'border-transparent bg-success/10 text-success',
  error: 'border-transparent bg-danger/5 text-danger',
  warning: 'border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400',
  info: 'border-transparent bg-primary/5 text-fg-secondary',
};

export function Alert({ severity = 'info', className, children, ...rest }) {
  return (
    <div
      role="alert"
      className={cx('rounded-lg border px-3 py-2 text-sm', alertStyles[severity] || alertStyles.info, className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Spinner({ size = 32, className }) {
  return (
    <span
      className={cx('inline-block animate-spin rounded-full border-2 border-primary border-t-transparent', className)}
      style={{ width: size, height: size }}
      role="progressbar"
    />
  );
}

export function LinearProgress({ value, className }) {
  return (
    <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}>
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }}
      />
    </div>
  );
}

export function Chip({ label, color, onDelete, className, children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        color === 'primary' ? 'bg-primary/15 text-primary'
          : color === 'success' ? 'bg-success/15 text-success'
          : color === 'error' ? 'bg-danger/15 text-danger'
          : 'bg-muted text-fg-secondary',
        className
      )}
    >
      {label ?? children}
      {onDelete && (
        <button type="button" onClick={onDelete} className="ml-0.5 cursor-pointer hover:opacity-70">×</button>
      )}
    </span>
  );
}

export function Skeleton({ className, ...rest }) {
  return <div className={cx('animate-pulse rounded-md bg-muted', className)} {...rest} />;
}

export function Tooltip({ title, children }) {
  return (
    <span className="relative inline-flex group">
      {children}
      {title && (
        <span
          className={cx(
            'pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap',
            'rounded-md bg-fg px-2 py-1 text-xs text-bg opacity-0 transition-opacity group-hover:opacity-100'
          )}
        >
          {title}
        </span>
      )}
    </span>
  );
}

export function Modal({ open, onClose, className, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className={cx('max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-paper p-5 shadow-xl', className)}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------- Tabs ---------- */

const TabsContext = createContext(null);

export function Tabs({ value, onChange, className, children }) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={cx('flex gap-1 border-b border-line', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function Tab({ value: tabValue, label, className }) {
  const ctx = useContext(TabsContext);
  const active = ctx?.value === tabValue;
  return (
    <button
      type="button"
      onClick={e => ctx?.onChange?.(e, tabValue)}
      className={cx(
        'px-4 py-2 text-sm font-medium cursor-pointer border-b-2 -mb-px transition-colors',
        active ? 'border-primary text-primary' : 'border-transparent text-fg-secondary hover:text-fg',
        className
      )}
    >
      {label}
    </button>
  );
}

/* ---------- ToggleButtonGroup ---------- */

export function ToggleButtonGroup({ value, onChange, className, children, options }) {
  const items = options ?? [];
  return (
    <div className={cx('inline-flex rounded-lg border border-line overflow-hidden', className)}>
      {items.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={e => onChange?.(e, opt.value)}
          className={cx(
            'px-3 py-1.5 text-sm cursor-pointer transition-colors border-r border-line last:border-r-0',
            value === opt.value ? 'bg-primary text-primary-fg' : 'bg-paper text-fg-secondary hover:bg-muted'
          )}
        >
          {opt.label}
        </button>
      ))}
      {children}
    </div>
  );
}

/* ---------- 表格 ---------- */

export function Table({ className, children }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-line">
      <table className={cx('w-full border-collapse text-sm', className)}>{children}</table>
    </div>
  );
}

export const TableHead = ({ children }) => <thead className="bg-muted text-left">{children}</thead>;
export const TableBody = ({ children }) => <tbody>{children}</tbody>;
export const TableRow = ({ children, className }) => (
  <tr className={cx('border-b border-line last:border-b-0', className)}>{children}</tr>
);
export const TableCell = ({ children, header, className }) =>
  header
    ? <th className={cx('px-3 py-2 font-semibold text-fg', className)}>{children}</th>
    : <td className={cx('px-3 py-2 text-fg-secondary', className)}>{children}</td>;

/* ---------- Snackbar（简易 toast） ---------- */

export function Snackbar({ open, message, severity = 'success', onClose, autoHideDuration = 2000 }) {
  const timer = useRef();
  useEffect(() => {
    if (open && autoHideDuration) {
      timer.current = setTimeout(() => onClose?.(), autoHideDuration);
      return () => clearTimeout(timer.current);
    }
  }, [open, autoHideDuration, onClose]);
  if (!open) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <Alert severity={severity} className="shadow-lg bg-paper">{message}</Alert>
    </div>
  );
}
