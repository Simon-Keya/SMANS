// tests/helpers/render-with-providers.tsx
import { AuthSessionProvider } from '@/components/providers/AuthSessionProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { render } from '@testing-library/react';

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <AuthSessionProvider>
        <ToastProvider>
          {ui}
        </ToastProvider>
      </AuthSessionProvider>
    </ThemeProvider>
  );
}

// For convenience with custom options
export * from '@testing-library/react';
export { renderWithProviders as render };
