// tests/helpers/render-with-providers.tsx
import ThemeProvider from '@/components/providers/ThemeProvider';
import ToastProvider from '@/components/providers/ToastProvider';
import { render } from '@testing-library/react';

// Simple mock for AuthSessionProvider (since it's just a wrapper around SessionProvider)
function MockAuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <MockAuthSessionProvider>
        <ToastProvider>
          {ui}
        </ToastProvider>
      </MockAuthSessionProvider>
    </ThemeProvider>
  );
}

// Re-export testing-library utilities
export * from '@testing-library/react';
export { renderWithProviders as render };
