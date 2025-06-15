/**
 * AppProviders.jsx
 * アプリ全体に必要なコンテキストプロバイダーをまとめて適用するコンポーネント。
 *
 * - ModalProvider：モーダルのグローバル管理
 * - ToastProvider：トースト通知のグローバル管理
 * - MemoProvider：フッターからのノート追加でノート一覧に即時反映させるためのグローバル管理
 * - TaskProvider：フッターからのタスク追加でタスク一覧に即時反映させるためのグローバル管理
 * - これらのラップで children を囲む
 */

import React from 'react';
import { ModalProvider } from './contexts/ModalContext';
import { ToastProvider } from './contexts/ToastContext';
import { MemoProvider } from './contexts/MemoContext';
import { TaskProvider } from './contexts/TaskContext';



const AppProviders = ({ children }) => {
  return (
    <ModalProvider>
      <ToastProvider>
        <MemoProvider>
          <TaskProvider>
            {children}
          </TaskProvider>
        </MemoProvider>
      </ToastProvider>
    </ModalProvider>
  );
};

export default AppProviders;
