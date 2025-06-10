import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ToastContext } from '../contexts/ToastContext';
import { ModalContext } from '../contexts/ModalContext';

const Settings = ({ user }) => {
  const { showModal, hideModal } = useContext(ModalContext);
  const { showToast } = useContext(ToastContext);

  const settings = [
    { path: '/status_master', label: '🚦 ステータス管理' },
    { path: '/category_master', label: '📂 カテゴリ管理' },
    { path: '/customer_master', label: '🏢 顧客管理' },
    { path: '/profile', label: '🙋 プロフィール' },
    { path: '/password_setting', label: '🔑 パスワード変更' },
    { path: '/dashboard_setting', label: '📊 ダッシュボード管理' },
  ];

  return (
    <div className="bg-gray-100 px-4 py-8 min-h-screen">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-700 text-center mb-6">⚙️ 設定メニュー</h2>

        <div className="space-y-4">
          {settings.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="block w-full text-left bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-md px-4 py-3 transition"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
