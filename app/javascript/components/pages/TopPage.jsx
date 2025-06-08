import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContext } from '../contexts/ToastContext';
import { ModalContext } from '../contexts/ModalContext';


const TopPage = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const { showModal, hideModal } = useContext(ModalContext);
  const { showToast } = useContext(ToastContext);

  const navigate = useNavigate();

  // ログアウトモーダル
  const confirmLogout = () => {
    showModal({
      title: 'ログアウト確認',
      message: 'ログアウトしますか？',
      onConfirm: handleLogout,
    });
  };


  // ログアウト処理
  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'DELETE',
      credentials: 'include',
    });
    showToast('ログアウトしました', 'success');
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-4 flex items-center justify-center py-12 px-4">


      {/* メインコンテンツ */}
      <div className="max-w-3xl w-full space-y-10">


        {/* メイン機能 */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">TaskNote</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link to="/tasks" className="block bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-6 text-center shadow transition">
              <div className="text-xl font-semibold">📋 タスク一覧</div>
              <div className="text-sm mt-1">タスク管理・コメント</div>
            </Link>
            <Link to="/memos" className="block bg-green-500 hover:bg-green-600 text-white rounded-lg p-6 text-center shadow transition">
              <div className="text-xl font-semibold">📝 メモ一覧</div>
              <div className="text-sm mt-1">企業別メモを閲覧・編集</div>
            </Link>
            <Link to="/company_dashboard" className="block bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-6 text-center shadow transition sm:col-span-2">
              <div className="text-xl font-semibold">🏢 企業一覧</div>
              <div className="text-sm mt-1">企業ごとのタスク・メモを一覧表示</div>
            </Link>
          </div>
        </div>

        {/* サブ機能 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">マスタ管理</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/customer_master" className="block border border-gray-300 rounded-md p-4 text-center hover:bg-gray-100 transition">
              <div className="font-medium text-gray-800">🏢 企業マスタ</div>
            </Link>
            <Link to="/category_master" className="block border border-gray-300 rounded-md p-4 text-center hover:bg-gray-100 transition">
              <div className="font-medium text-gray-800">📂 カテゴリマスタ</div>
            </Link>
            <Link to="/status_master" className="block border border-gray-300 rounded-md p-4 text-center hover:bg-gray-100 transition">
              <div className="font-medium text-gray-800">🚦 ステータスマスタ</div>
            </Link>
          </div>
        </div>

        {/* パスワード変更 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">ユーザー設定</h2>

          <div className="mt-6 space-y-4 text-center">
            <Link to="/settings/password"
              className="inline-block px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              🔑 パスワード変更
            </Link>

            {user?.is_admin && (
              <Link to="/admin/users"
                className="inline-block ml-4 px-4 py-2 bg-yellow-200 rounded hover:bg-yellow-300"
              >
                👥 ユーザー管理
              </Link>
            )}
          </div>
        </div>

        {/* ようこそ表示 */}
        {user?.name && (
          <p className="text-center text-gray-600 mb-4">
            ログイン中：{user.name}
          </p>
        )}

        {/* ログアウト */}
        {user?.name && (
          <div className="flex justify-end mb-4">
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              onClick={confirmLogout}
            >
              ログアウト
            </button>
          </div>
        )}

      </div>

    </div>
  );

};

export default TopPage;
