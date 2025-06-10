/**
 * App.jsx
 * アプリのルートエントリーポイントとなるコンポーネント。
 *
 * - React Router（BrowserRouter）でルーティングを定義
 * - AppProviders でコンテキストラップ
 * - AppRoutes を読み込んで実際の画面遷移を制御
 * - React 18 の createRoot を使用して描画
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppProviders from './AppProviders';
import AppRoutes from './AppRoutes';

const App = () => (
  <BrowserRouter>
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  </BrowserRouter>
);

export default App;
