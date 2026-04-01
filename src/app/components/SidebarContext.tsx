"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
} from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  setIsOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// localStorage key
const STORAGE_KEY = "sidebar-open";

// Create a store that works with useSyncExternalStore
function createSidebarStore() {
  let currentValue = true;
  const listeners = new Set<() => void>();

  // Only access localStorage on client
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    currentValue = saved === null ? true : saved === "true";
  }

  return {
    getSnapshot: () => currentValue,
    getServerSnapshot: () => true, // Default for SSR
    subscribe: (callback: () => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    setValue: (value: boolean) => {
      currentValue = value;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, value.toString());
      }
      listeners.forEach((cb) => cb());
    },
    getValue: () => currentValue,
  };
}

const sidebarStore = createSidebarStore();

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isOpen = useSyncExternalStore(
    sidebarStore.subscribe,
    sidebarStore.getSnapshot,
    sidebarStore.getServerSnapshot,
  );

  const setIsOpen = useCallback((value: boolean) => {
    sidebarStore.setValue(value);
  }, []);

  const toggle = useCallback(() => {
    sidebarStore.setValue(!sidebarStore.getValue());
  }, []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
