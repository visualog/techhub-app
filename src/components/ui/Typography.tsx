import React from 'react';
import { cn } from '@/lib/utils';

export type TypographyVariant =
    | 'display-xl'
    | 'display-lg'
    | 'heading-xl'
    | 'heading-lg'
    | 'heading-md'
    | 'heading-sm'
    | 'body-lg'
    | 'body-md'
    | 'body-sm'
    | 'label-md'
    | 'label-sm'
    | 'caption'
    | 'micro';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    variant?: TypographyVariant;
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
}

const variantMapping: Record<TypographyVariant, string> = {
    'display-xl': 'display-xl',
    'display-lg': 'display-lg',
    'heading-xl': 'heading-xl',
    'heading-lg': 'heading-lg',
    'heading-md': 'heading-md',
    'heading-sm': 'heading-sm',
    'body-lg': 'body-lg',
    'body-md': 'body-md',
    'body-sm': 'body-sm',
    'label-md': 'label-md',
    'label-sm': 'label-sm',
    'caption': 'caption',
    'micro': 'micro',
};

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
    ({ variant = 'body-md', as: Component = 'p', className, children, ...props }, ref) => {
        return (
            <Component
                ref={ref}
                className={cn(variantMapping[variant], className)}
                {...props}
            >
                {children}
            </Component>
        );
    }
);

Typography.displayName = 'Typography';
