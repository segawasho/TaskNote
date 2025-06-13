import React, { useEffect, useState, useContext } from 'react';
import { apiFetch } from '../api';
import { ToastContext } from '../contexts/ToastContext';
import { ModalContext } from '../contexts/ModalContext';
import PageLayout from '../common/PageLayout';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState({});
  const [errors, setErrors] = useState({});

  const { showToast } = useContext(ToastContext);
  const { showModal, hideModal } = useContext(ModalContext);

  // 初回読み込み
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await apiFetch('/api/admin_users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
      const initialEdit = {};
      data.forEach(user => {
        initialEdit[user.id] = { name: user.name, email: user.email, is_admin: user.is_admin };
      });
      setEditing(initialEdit);
    }
  };

  const handleChange = (id, field, value) => {
    setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleConfirmSave = (user) => {
    showModal({
      title: 'ユーザー情報更新',
      message: `「${editing[user.id].name}」さんの情報を更新してよろしいですか？`,
      onConfirm: () => handleSave(user)
    });
  };

  const handleSave = async (user) => {
    setErrors({});
    const updated = editing[user.id];

    const res = await apiFetch(`/api/admin_users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: updated }),
    });

    if (res.ok) {
      hideModal();
      showToast('更新しました', 'success');
      fetchUsers();
    } else {
      const data = await res.json();
      setErrors(prev => ({ ...prev, [user.id]: data.errors?.join(', ') || '更新失敗' }));
    }
  };

  return (
    <PageLayout>
      <div className="p-4 max-w-5xl mx-auto">
        <h2 className="text-xl font-bold mb-4">👤 ユーザー管理</h2>

        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">名前</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">管理者</th>
                <th className="p-2 border">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const edited = editing[user.id];
                const changed =
                  edited?.name !== user.name ||
                  edited?.email !== user.email ||
                  edited?.is_admin !== user.is_admin;

                return (
                  <tr key={user.id} className="border-t">
                    <td className="p-2 text-center">{user.id}</td>
                    <td className="p-2">
                      <input type="text" value={edited?.name || ''} className="border w-full p-1"
                        onChange={e => handleChange(user.id, 'name', e.target.value)} />
                    </td>
                    <td className="p-2">
                      <input type="text" value={edited?.email || ''} className="border w-full p-1"
                        onChange={e => handleChange(user.id, 'email', e.target.value)} />
                    </td>
                    <td className="p-2 text-center">
                      <input type="checkbox" checked={edited?.is_admin || false}
                        onChange={e => handleChange(user.id, 'is_admin', e.target.checked)} />
                    </td>
                    <td className="p-2 text-center">
                      <button className={`px-3 py-1 rounded ${changed ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                        onClick={() => changed && handleConfirmSave(user)} disabled={!changed}>
                        保存
                      </button>
                      {errors[user.id] && <div className="text-red-500 text-sm mt-1">{errors[user.id]}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </PageLayout>
  );
};

export default AdminUserList;
