import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';

const Signup = () => {

  const { showToast } = useContext(ToastContext);

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
  const [expandedCategories, setExpandedCategories] = useState({});
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
      showToast('会員登録完了', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } else {
      const err = await response.json();
      const errorMsg = err.errors?.join(', ') || err.error || '不明なエラーが発生しました';
      setError(errorMsg);
      showToast('登録に失敗しました', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const groupedRoles = roles
    .filter((r) => r.role_category && r.role_category.sort_order != null)
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
    }, {});

    return (
      <div className="max-w-2xl mx-auto mt-0 bg-white shadow-md rounded p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-600">新規登録</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">名前</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="例：山田 太郎"
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="example@example.com"
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">パスワード</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="パスワード"
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">パスワード（確認用）</label>
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="パスワード（確認用）"
              required
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>

          {/* 職種選択 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">職種を選択してください</h3>
            <div className="space-y-4">
              {Object.entries(groupedRoles).map(([category, roleList]) => (
                <div key={category} className="border border-gray-300 rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-2 text-left font-medium bg-gray-100 hover:bg-gray-200"
                  >
                    ◾️ {category}
                  </button>

                  {expandedCategories[category] && (
                    <div className="px-4 py-3">
                      {roleList.map((role) => (
                        <label
                          key={role.id}
                          className="flex items-center mb-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="role_id"
                            value={role.id}
                            checked={String(form.role_id) === String(role.id)}
                            onChange={handleChange}
                            required
                            className="w-5 h-5 text-blue-600 border-gray-300"
                          />
                          <span className="ml-3 text-gray-800">{role.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* その他が選ばれた場合 */}
            {(() => {
              const selectedRole = roles.find((r) => String(r.id) === String(form.role_id));
              const isOther = selectedRole?.name?.includes('その他');
              return isOther ? (
                <input
                  type="text"
                  name="custom_role_description"
                  value={form.custom_role_description}
                  placeholder="職種を自由に記述"
                  className="mt-3 w-full border border-gray-300 px-4 py-2 rounded-md"
                  onChange={handleChange}
                  required
                />
              ) : null;
            })()}
          </div>

          {/* 業種選択 */}
          <div>
            <h3 className="text-lg font-semibold">業種を選択してください</h3>
            <div className="mt-3">
              <button
                type="button"
                className="inline-block text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition"
                onClick={() => setShowIndustries(!showIndustries)}
              >
                業種を選ぶ（任意）
              </button>
            </div>

            {showIndustries && (
              <div className="mt-4 space-y-2">
                {industries.map((industry) => (
                  <label
                    key={industry.id}
                    className="flex items-center px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="industry_id"
                      value={industry.id}
                      checked={String(form.industry_id) === String(industry.id)}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300"
                    />
                    <span className="ml-3 text-gray-800">{industry.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-md font-semibold shadow"
          >
            登録する
          </button>
        </form>
      </div>
    );


};

export default Signup;
