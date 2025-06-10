/**
 * AppProviders.jsx
 * アプリ全体に必要なコンテキストプロバイダーをまとめて適用するコンポーネント。
 *
 * - ModalProvider：モーダルのグローバル管理
 * - ToastProvider：トースト通知のグローバル管理
 * - これらのラップで children を囲む
 */

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
