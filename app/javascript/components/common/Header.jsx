import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './logo-tasknote-2.png';
import { ToastContext } from '../contexts/ToastContext';
import { ModalContext } from '../contexts/ModalContext';

const Header = ({ user }) => {
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
    // window.location.href = '/login';
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="h-12 flex items-center justify-between px-4 relative">
        {/* 中央ロゴ（常に中央に固定） */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-auto text-center">
          <Link to="/">
            <img src={logo} alt="TaskNote ロゴ" className="h-8 mx-auto cursor-pointer" />
          </Link>
        </div>

        {/* 左側スペース */}
        <div className="w-1/5"></div>

        {/* 右端ハンバーガー */}
        <div className="w-1/5 flex justify-end">
          <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
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
              <Link
                to="/profile"
                className="block px-4 py-3 text-gray-800 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                🙋‍♂️ プロフィール
              </Link>
              {user?.is_admin && (
                <Link
                  to="/admin/users"
                  className="block px-4 py-3 text-gray-800 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  👤 管理者画面
                </Link>
              )}
              <Link
                to="/projects"
                className="block px-4 py-3 text-gray-800 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                📓 プロジェクト
              </Link>
              <div
                className="block px-4 py-3 text-red-600 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setMenuOpen(false);
                  confirmLogout();
                }}
              >
                🔓 ログアウト
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-4 py-3 text-gray-800 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                🗒️ TaskNoteとは
              </Link>
              <Link
                to="/signup"
                className="block px-4 py-3 text-gray-800 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                👤 新規会員登録
              </Link>
              <Link
                to="/login"
                className="block px-4 py-3 text-gray-800 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                🔐 ログイン
              </Link>
            </>
          )}
        </div>
      )}

    </header>
  );

};

export default Header;
