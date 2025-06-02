import React from 'react';
import { ModalProvider } from './contexts/ModalContext';
import { ToastProvider } from './contexts/ToastContext';

const AppProviders = ({ children }) => {
  return (
    <ModalProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ModalProvider>
  );
};

export default AppProviders;
