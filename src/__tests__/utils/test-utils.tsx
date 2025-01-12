import React from 'react';
import { NextUIProvider } from "@nextui-org/react";
import { render } from '@testing-library/react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  );
};

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render }; 