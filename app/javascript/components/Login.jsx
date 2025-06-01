import React, { useState } from 'react';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(form)
    });

    if (response.ok) {
      const data = await response.json();
      alert(`ようこそ、${data.user.name} さん！`);
      window.location.href = '/'; // トップページへ遷移
    } else {
      const err = await response.json();
      setError(err.error || 'ログインに失敗しました');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-md rounded p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-600">ログイン</h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="メールアドレス"
          required
          className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
        />

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="パスワード"
          required
          className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring focus:ring-blue-200"
        />

        <button
          type="submit"
          className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-600 transition"
        >
          ログイン
        </button>
      </form>
    </div>
  );

};

export default Login;
