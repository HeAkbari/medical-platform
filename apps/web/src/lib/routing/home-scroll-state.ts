const HOME_SCROLL_STORAGE_KEY = 'medical-platform:home-scroll-y';

let lastHomeScrollTop = 0;

function readStoredScrollTop(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = sessionStorage.getItem(HOME_SCROLL_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  const scrollTop = Number(raw);
  return Number.isFinite(scrollTop) ? scrollTop : null;
}

export function saveHomeScrollTop(scrollTop: number) {
  if (!Number.isFinite(scrollTop) || scrollTop < 0) {
    return;
  }

  lastHomeScrollTop = scrollTop;
  sessionStorage.setItem(HOME_SCROLL_STORAGE_KEY, String(scrollTop));
}

export function getHomeScrollTop(): number {
  const stored = readStoredScrollTop();
  return Math.max(lastHomeScrollTop, stored ?? 0);
}

export function captureHomeScroll(container: HTMLElement | null) {
  if (!container) {
    return;
  }

  saveHomeScrollTop(container.scrollTop);
}

export function restoreHomeScroll(container: HTMLElement | null) {
  const scrollTop = getHomeScrollTop();

  if (!container || scrollTop <= 0) {
    return;
  }

  container.scrollTop = scrollTop;
}

export function restoreHomeScrollWithRetries(container: HTMLElement | null) {
  if (!container) {
    return () => undefined;
  }

  const scrollTop = getHomeScrollTop();

  if (scrollTop <= 0) {
    return () => undefined;
  }

  const apply = () => {
    container.scrollTop = scrollTop;
  };

  apply();
  window.requestAnimationFrame(apply);

  const timeoutIds = [0, 50, 150, 300].map((delay) =>
    window.setTimeout(apply, delay)
  );

  return () => {
    timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
  };
}
