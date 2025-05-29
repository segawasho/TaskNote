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
    <div>
      <h2>ログイン</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="メール" required />
        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="パスワード" required />
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
};

export default Login;
