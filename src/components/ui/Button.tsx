import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed',
          {
            'bg-primary text-background hover:bg-primary-hover rounded':
              variant === 'primary',
            'bg-primary text-background hover:bg-primary-hover rounded font-semibold':
              variant === 'secondary',
            'border border-border text-text hover:border-primary rounded':
              variant === 'outline',
            'text-text-muted hover:text-text': variant === 'ghost',
            'bg-danger/10 text-danger hover:bg-danger/20 rounded': variant === 'danger',
          },
          {
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-5 py-2 text-sm': size === 'md',
            'px-6 py-2.5 text-sm': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export default Button;
