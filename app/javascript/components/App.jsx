import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';

const TopPage = () => <h2>トップページ（仮）</h2>;

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<TopPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  </BrowserRouter>
);

export default App;
