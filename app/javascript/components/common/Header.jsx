import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './logo-tasknote.png';
import Modal from './Modal';

const Header = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // ログアウト処理
  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'DELETE',
      credentials: 'include',
    });
    alert('ログアウトしました');
    window.location.href = '/login';
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2 relative">
        {/* 中央ロゴ（常に中央に固定） */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-auto text-center">
          <Link to="/">
            <img src={logo} alt="TaskNote ロゴ" className="h-10 mx-auto cursor-pointer" />
          </Link>
        </div>

        {/* 左側スペース */}
        <div className="w-1/5"></div>

        {/* 右端ハンバーガー（常に表示） */}
        <div className="w-1/5 flex justify-end">
          <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* ▼ ドロップダウンメニュー（userの有無で分岐） */}
      {menuOpen && (
        <div className="bg-white border-t border-gray-200 shadow-md">
          {user ? (
            <>
              <Link
                to="/"
                className="block px-4 py-3 text-gray-800 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                🏠 ホーム
              </Link>
              {user?.is_admin && (
                <Link
                  to="/admin/users"
                  className="block px-4 py-3 text-gray-800 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  👤 ユーザー管理
                </Link>
              )}
              <div
                className="block px-4 py-3 text-red-600 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  setShowLogoutModal(true);
                }}
              >
                🔓 ログアウト
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="block px-4 py-3 text-gray-800 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              🔐 ログイン
            </Link>
          )}
        </div>
      )}

      {/* ▼ ログアウト確認モーダル（ログイン中のみ） */}
      {user && showLogoutModal && (
        <Modal>
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold">ログアウトしますか？</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="w-32 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                はい
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-32 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </div>
        </Modal>
      )}
    </header>
  );

};

export default Header;
