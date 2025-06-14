/**
 * AppRoutes.jsx
 * アプリ全体のルーティング設定を行うコンポーネント。
 *
 * - ログイン済ユーザーと非ログインユーザーでルートを切り替える
 * - 初期表示時に `/api/current_user` を叩き、認証状態を確認
 * - トークン失効時は `/api/refresh_token` により自動再認証を試みる
 * - 各画面は PageLayout に包まれて表示される
 */


import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { apiFetch } from './api';

import PageLayout from '../components/common/PageLayout';
import TopPage from '../components/pages/TopPage';
import Signup from '../components/pages/Signup';
import Login from '../components/pages/Login';
import Profile from '../components/pages/Profile';
import Settings from '../components/pages/Settings';
import TaskList from '../components/tasks/TaskList';
import CustomerMaster from '../components/master/CustomerMaster';
import CategoryMaster from '../components/master/CategoryMaster';
import StatusMaster from '../components/master/StatusMaster';
import MemoList from '../components/memos/MemoList';
import MemoForm from '../components/memos/MemoForm';
import ProjectList from '../components/projects/ProjectList';
import ProjectDetail from '../components/projects/ProjectDetail';
import AdminUserList from '../components/admin/AdminUserList';


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
                <Profile user={user} />
              </PageLayout>
            }
          />
          {/* 設定画面 */}
          <Route
            path="/settings"
            element={
              <PageLayout user={user}>
                <Settings user={user} />
              </PageLayout>
            }
          />
          {/* カスタマーマスタ */}
          <Route
            path="/customer_master"
            element={
              <PageLayout user={user}>
                <CustomerMaster user={user} />
              </PageLayout>
            }
          />
          {/* カテゴリマスタ */}
          <Route
            path="/category_master"
            element={
              <PageLayout user={user}>
                <CategoryMaster user={user} />
              </PageLayout>
            }
          />
          {/* ステータスマスタ */}
          <Route
            path="/status_master"
            element={
              <PageLayout user={user}>
                <StatusMaster user={user} />
              </PageLayout>
            }
          />
          {/* タスクリスト */}
          <Route
            path="/tasks"
            element={
              <PageLayout user={user}>
                <TaskList user={user} />
              </PageLayout>
            }
          />
          {/* プロジェクト一覧 */}
          <Route
            path="/projects"
            element={
              <PageLayout user={user}>
                <ProjectList user={user} />
              </PageLayout>
            }
          />

          {/* プロジェクト詳細（gantt-task-reactを使ってWBS表示） */}
          <Route
            path="/projects/:id"
            element={
              <PageLayout user={user}>
                <ProjectDetail user={user} />
              </PageLayout>
            }
          />
          {/* メモリスト */}
          <Route
            path="/memos"
            element={
              <PageLayout user={user}>
                <MemoList user={user} />
              </PageLayout>
            }
          />
          {/* メモ新規作成 */}
          <Route
            path="/memos/new"
            element={
              <PageLayout user={user}>
                <MemoForm mode="create" />
              </PageLayout>
            }
          />
          {/* メモ編集 */}
          <Route
            path="/memos/:id/edit"
            element={
              <PageLayout user={user}>
                <MemoForm mode="edit" />
              </PageLayout>
            }
          />
          {/* 管理者用画面（is_adminのときのみ表示） */}
          {user.is_admin && (
            <Route
              path="/admin/users"
              element={
                <PageLayout user={user}>
                  <AdminUserList />
                </PageLayout>
              }
            />
          )}
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
