import React, { useEffect, useState } from 'react';

const TopPage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // current_user を取得
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/current_user', {
          method: 'GET',
          credentials: 'include', // ← Cookie送信に必須
        });

        if (!res.ok) {
          throw new Error('Unauthorized');
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCurrentUser();
  }, []);

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
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">トップページテスト</h2>

      {error ? (
        <p className="text-red-500">エラー: {error}</p>
      ) : user ? (
        <div className="space-y-2">
          <p className="text-lg">👤 ようこそ、<span className="font-semibold">{user.name}</span> さん！</p>
          <p className="text-gray-700">📧 {user.email}</p>
          <p>🧑‍💼 職種ID: {user.role_id}</p>
          <p>🏭 業種ID: {user.industry_id || '未設定'}</p>

          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            ログアウト
          </button>
        </div>
      ) : (
        <p className="text-gray-500">ユーザー情報を取得中...</p>
      )}
    </div>
  );

};

export default TopPage;
