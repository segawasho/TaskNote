import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/current_user', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">プロフィール</h2>

      {error ? (
        <p className="text-red-500">エラー: {error}</p>
      ) : user ? (
        <div className="space-y-2">
          <p className="text-gray-700">👤 名前: {user.name}</p>
          <p className="text-gray-700">📧 ログインID: {user.email}</p>
          <p className="text-gray-700">🔑 パスワード: {user.is_admin ? '管理者' : '一般ユーザー'}</p>
          <p className="text-gray-700">🧑‍💼 職種: {user.role || '未設定'}</p>
          <p className="text-gray-700">🏭 業種: {user.industry || '未設定'}</p>
        </div>
      ) : (
        <p className="text-gray-500">読み込み中...</p>
      )}
    </div>
  );
};

export default Profile;
