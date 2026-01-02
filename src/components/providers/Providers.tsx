"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ============================================================================
// Query Client
// ============================================================================

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
});

// ============================================================================
// Theme Context
// ============================================================================

type Theme = "light" | "dark";

type ThemeContextValue = {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

// ============================================================================
// Providers Component - Theme provider + QueryClient
// ============================================================================

type ProvidersProps = {
    children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
    // Force dark mode for now
    const theme: Theme = "dark";

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", "dark");
    }, []);

    // Disabled theme switching - always dark mode
    const toggleTheme = () => {
        // No-op: dark mode only for now
    };

    const setTheme = (_newTheme: Theme) => {
        // No-op: dark mode only for now
    };

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
                {children}
            </ThemeContext.Provider>
        </QueryClientProvider>
    );
}
