'use client';

import { createContext, useContext } from 'react';

interface HomeScrollContextValue {
  captureScroll: () => void;
}

const HomeScrollContext = createContext<HomeScrollContextValue | null>(null);

export function HomeScrollProvider({
  captureScroll,
  children,
}: {
  captureScroll: () => void;
  children: React.ReactNode;
}) {
  return (
    <HomeScrollContext.Provider value={{ captureScroll }}>
      {children}
    </HomeScrollContext.Provider>
  );
}

export function useHomeScrollCapture() {
  return useContext(HomeScrollContext);
}
