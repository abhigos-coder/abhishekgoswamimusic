import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-mono tracking-wide uppercase',
        {
          'bg-primary/10 text-primary': variant === 'default',
          'bg-success/10 text-success': variant === 'success',
          'bg-primary/10 text-primary/80': variant === 'warning',
          'bg-danger/10 text-danger': variant === 'danger',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
