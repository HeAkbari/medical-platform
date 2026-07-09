'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/cn';
import { HOME_MAP_CTA } from '@/features/app-home/data/home-navigation';

const MAP_TRANSITION_MS = 520;
const MAP_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';

const HomeMapPreview = dynamic(
  () =>
    import('@/features/app-home/ui/home-map-preview').then(
      (module) => module.HomeMapPreview,
    ),
  {
    ssr: false,
    loading: () => (
      <span className="absolute inset-0 bg-muted" aria-hidden="true" />
    ),
  },
);

const HomePage = dynamic(
  () => import('@/features/home/ui/home-page').then((module) => module.HomePage),
  { ssr: false },
);

function rectToPanelStyle(rect: DOMRect): CSSProperties {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    borderRadius: '1rem',
  };
}

const fullscreenPanelStyle: CSSProperties = {
  top: 0,
  left: 0,
  width: '100%',
  height: '100dvh',
  borderRadius: 0,
};

function HomeMapOverlay({
  open,
  originRect,
  onClose,
  onExited,
}: {
  open: boolean;
  originRect: DOMRect | null;
  onClose: () => void;
  onExited: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setExpanded(true);
        });
      });

      return () => cancelAnimationFrame(frame);
    }

    const frame = requestAnimationFrame(() => {
      setExpanded(false);
    });
    const timer = window.setTimeout(onExited, MAP_TRANSITION_MS);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [onExited, open]);

  useEffect(() => {
    if (!expanded) {
      const frame = requestAnimationFrame(() => {
        setMapReady(false);
      });

      return () => cancelAnimationFrame(frame);
    }

    const timer = window.setTimeout(() => {
      setMapReady(true);
    }, MAP_TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [expanded]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && open && mapReady) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mapReady, onClose, open]);

  const panelStyle =
    expanded || !originRect
      ? fullscreenPanelStyle
      : rectToPanelStyle(originRect);

  return createPortal(
    <>
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-200 bg-black/25 backdrop-blur-[1px] transition-opacity',
        )}
        style={{
          opacity: expanded ? 1 : 0,
          transitionDuration: `${MAP_TRANSITION_MS}ms`,
          transitionTimingFunction: MAP_EASING,
        }}
      />
      <div
        aria-hidden={mapReady}
        className={cn(
          'fixed z-201 overflow-hidden bg-background shadow-xl',
          mapReady && 'pointer-events-none opacity-0',
        )}
        style={{
          ...panelStyle,
          transitionProperty: 'top, left, width, height, border-radius, opacity',
          transitionDuration: `${MAP_TRANSITION_MS}ms`,
          transitionTimingFunction: MAP_EASING,
        }}
      >
        <HomeMapPreview />
      </div>
      {expanded ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Find care near you"
          className={cn(
            'fixed inset-0 z-202 bg-background transition-opacity',
            mapReady
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0',
          )}
          style={{
            transitionDuration: '220ms',
            transitionTimingFunction: MAP_EASING,
          }}
        >
          <HomePage onClose={onClose} showChrome={mapReady} />
        </div>
      ) : null}
    </>,
    document.body,
  );
}

export function HomeMapCard() {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapPresent, setMapPresent] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  const captureCardRect = useCallback(() => {
    return cardRef.current?.getBoundingClientRect() ?? null;
  }, []);

  const openMap = useCallback(() => {
    setOriginRect(captureCardRect());
    setMapPresent(true);
    setMapOpen(true);
  }, [captureCardRect]);

  const closeMap = useCallback(() => {
    setOriginRect(captureCardRect());
    setMapOpen(false);
  }, [captureCardRect]);

  const handleOverlayExited = useCallback(() => {
    setMapPresent(false);
    setOriginRect(null);
  }, []);

  return (
    <>
      <section aria-labelledby="home-map-cta-heading">
        <h2 id="home-map-cta-heading" className="sr-only">
          Find doctors nearby
        </h2>
        <button
          ref={cardRef}
          type="button"
          onClick={openMap}
          aria-label={`${HOME_MAP_CTA.title}. Open full map.`}
          aria-expanded={mapOpen}
          className={cn('block w-full text-left', mapPresent && 'invisible')}
        >
          <Card className="relative flex items-center gap-3 overflow-hidden border-brand-subtle p-4 shadow-sm transition hover:border-brand-light hover:shadow-md active:scale-[0.99]">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              <HomeMapPreview />
            </div>
            <span
              className="absolute inset-0 bg-linear-to-r from-brand-darker/55 dark:from-background/70 dark:via-brand-muted/40 dark:to-transparent"
              aria-hidden="true"
            />
            <span className="relative min-w-0 flex-1">
              <p className="font-semibold text-white drop-shadow-sm dark:text-foreground dark:drop-shadow-none">
                {HOME_MAP_CTA.title}
              </p>
              <p className="mt-0.5 text-sm text-white/85 drop-shadow-sm dark:text-muted-foreground dark:drop-shadow-none">
                {HOME_MAP_CTA.description}
              </p>
            </span>
            <span
              className="relative shrink-0 text-white dark:text-brand"
              aria-hidden="true"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  d="M9 6l6 6-6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Card>
        </button>
      </section>

      {mapPresent ? (
        <HomeMapOverlay
          open={mapOpen}
          originRect={originRect}
          onClose={closeMap}
          onExited={handleOverlayExited}
        />
      ) : null}
    </>
  );
}
