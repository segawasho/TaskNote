import React, { useState, useEffect, useContext } from 'react';

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    industry_id: '',
    custom_role_description: ''
  });

  const [showIndustries, setShowIndustries] = useState(false);


  const [roles, setRoles] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [error, setError] = useState(null);


  useEffect(() => {
      const fetchMasterData = async () => {
        try {
          const resRoles = await fetch('/api/roles');
          const rolesData = await resRoles.json();
          setRoles(rolesData);

          const resIndustries = await fetch('/api/industries');
          const industriesData = await resIndustries.json();
          setIndustries(industriesData);
        } catch (e) {
          setError('マスターデータの取得に失敗しました');
        }
      };

      fetchMasterData();
    }, []);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // ← Cookie送受信のために必要！
      body: JSON.stringify({ user: form })
    });

    if (response.ok) {
      const data = await response.json();
      alert(`ようこそ、${data.user.name} さん！`);
      window.location.href = '/'; // トップページへリダイレクト
    } else {
      const err = await response.json();
      setError(err.errors?.join(', ') || '登録に失敗しました');
    }
  };

  return (
    <div>
      <h2>新規登録</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" className="w-full border px-3 py-2 rounded mb-2" value={form.name} onChange={handleChange} placeholder="名前" required />
        <input type="email" name="email" className="w-full border px-3 py-2 rounded mb-2" value={form.email} onChange={handleChange} placeholder="メール" required />
        <input type="password" name="password" className="w-full border px-3 py-2 rounded mb-2" value={form.password} onChange={handleChange} placeholder="パスワード" required />
        <input type="password" name="password_confirmation" className="w-full border px-3 py-2 rounded mb-2" value={form.password_confirmation} onChange={handleChange} placeholder="確認用パスワード" required />

        {/* 職種選択 */}
        <div>
          <p className="font-semibold mb-2">職種を選択してください（1つまで）</p>
          {Object.entries(
            roles
              .filter((r) => r.role_category && r.role_category.sort_order != null) // null除外
              .sort((a, b) => {
                const catSortA = a.role_category.sort_order ?? 0;
                const catSortB = b.role_category.sort_order ?? 0;
                const roleSortA = a.sort_order ?? 0;
                const roleSortB = b.sort_order ?? 0;
                return catSortA - catSortB || roleSortA - roleSortB;
              })
              .reduce((acc, role) => {
                const cat = role.role_category.name;
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(role);
                return acc;
              }, {})
          ).map(([category, roleList]) => (
            <div key={category} className="mb-2">
              <p className="font-medium text-gray-700">◾️{category}</p>
              <div className="flex flex-wrap gap-4 pl-4 mt-1">
                {roleList.map((role) => (
                  <label key={role.id} className="flex items-center space-x-1">
                    <input
                      type="radio"
                      name="role_id"
                      value={role.id}
                      checked={String(form.role_id) === String(role.id)}
                      onChange={handleChange}
                      required
                    />
                    <span>{role.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>


        {/* その他の職種記述欄 */}
        {(() => {
          const selectedRole = roles.find((r) => String(r.id) === String(form.role_id));
          const isOther = selectedRole && typeof selectedRole.name === 'string' && selectedRole.name.includes('その他');

          return isOther ? (
            <input
              type="text"
              name="custom_role_description"
              value={form.custom_role_description}
              placeholder="職種を自由に記述"
              className="mt-2 w-full border px-3 py-2 rounded"
              onChange={handleChange}
              required
            />
          ) : null;
        })()}


        {/* 業種選択（任意） */}
        <div className="mt-6">
          <button
            type="button"
            className="text-blue-600 underline text-sm"
            onClick={() => setShowIndustries((prev) => !prev)}
          >
            業種を選ぶ（任意）
          </button>

          {showIndustries && (
            <div className="mt-2">
              {Array.isArray(industries) && industries.map((industry) => (
                <label key={industry.id} className="block mb-1">
                  <input
                    type="radio"
                    name="industry_id"
                    value={industry.id}
                    checked={String(form.industry_id) === String(industry.id)}
                    onChange={handleChange}
                  />
                  <span className="ml-1">{industry.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button type="submit">登録</button>
      </form>
    </div>
  );
};

export default Signup;
