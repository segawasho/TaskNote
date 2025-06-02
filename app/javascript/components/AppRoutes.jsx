import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { apiFetch } from './api';

import PageLayout from '../components/common/PageLayout';
import TopPage from '../components/pages/TopPage';
import Signup from '../components/pages/Signup';
import Login from '../components/pages/Login';
import Profile from '../components/pages/Profile';

const AppRoutes = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ページロード時に useEffect で apiFetch('/api/current_user') を実行
    // APIが401返したら api.js 内で /api/refresh_token
    // これにより トークン切れでもログアウトさせずに自動リフレッシュ可能
    const fetchCurrentUser = async () => {
      if (['/login', '/signup'].includes(location.pathname)) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiFetch('/api/current_user');
        if (!res.ok) throw new Error('Unauthorized');

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.warn('認証エラー:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [location.pathname]);

  if (loading) return <p>Loading...</p>;

  return (
    <Routes>
      {/* 非ログインユーザー向けルート */}
      <Route path="/login" element={
        <PageLayout>
          <Login onLogin={setUser} />
        </PageLayout>
        }
      />
      <Route path="/signup" element={
        <PageLayout>
          <Signup onSignup={setUser} />
        </PageLayout>
        }
      />

      {/* ログイン済みユーザー向けルート */}
      {user ? (
        <>
          {/* トップページ */}
          <Route
            path="/"
            element={
              <PageLayout user={user}>
                <TopPage user={user} />
              </PageLayout>
            }
          />
          {/* プロフィール */}
          <Route
            path="/profile"
            element={
              <PageLayout user={user}>
                <Profile />
              </PageLayout>
            }
          />
          {/* 未定義ルートはトップへ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default AppRoutes;
