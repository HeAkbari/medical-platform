'use client';

import { Drawer } from 'vaul';
import { cn } from '@/components/ui/cn';
import { useIsDesktop } from '@/hooks/use-media-query';

type DrawerDirection = 'bottom' | 'right';

interface ResponsiveDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /** `tall` — scrollable panels (auth, reviews). `fit` — compact content (filters). */
  variant?: 'tall' | 'fit';
}

function useDrawerDirection(): DrawerDirection {
  const isDesktop = useIsDesktop();
  return isDesktop ? 'right' : 'bottom';
}

export function ResponsiveDrawer({
  open,
  onOpenChange,
  children,
  variant = 'tall',
}: ResponsiveDrawerProps) {
  const direction = useDrawerDirection();

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction={direction}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-black/40" />
        <Drawer.Content
          className={cn(
            'fixed z-[100] flex flex-col bg-gray-100 outline-none',
            direction === 'bottom' &&
              cn(
                'bottom-0 left-0 right-0 mt-24 rounded-t-[10px]',
                variant === 'tall' ? 'h-fit max-h-[88vh]' : 'h-fit'
              ),
            direction === 'right' &&
              'top-0 right-0 bottom-0 h-full w-full max-w-md rounded-l-[10px]'
          )}
        >
          <div
            className={cn(
              'flex flex-col bg-white p-4',
              direction === 'bottom' &&
                cn('rounded-t-[10px]', variant === 'tall' && 'max-h-[88vh]'),
              direction === 'right' &&
                'h-full min-h-0 overflow-y-auto rounded-l-[10px]'
            )}
          >
            {direction === 'bottom' ? (
              <div className="mx-auto mb-6 h-1.5 w-12 shrink-0 rounded-full bg-gray-300" />
            ) : null}
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
