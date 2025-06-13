// このコンポーネントは、FooterNevのaddIcon→AddModal→から描画するコンポーネント

import React, { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../api';
import { ToastContext } from '../contexts/ToastContext';

const NewTaskForm = ({ user, onComplete }) => {
  const { showToast } = useContext(ToastContext);

  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [statusId, setStatusId] = useState('');

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    const [customersRes, categoriesRes, statusesRes] = await Promise.all([
      apiFetch('/api/customers'),
      apiFetch('/api/categories'),
      apiFetch('/api/statuses'),
    ]);
    setCustomers(await customersRes.json());
    setCategories(await categoriesRes.json());
    setStatuses(await statusesRes.json());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      task: {
        title,
        description,
        due_date: dueDate,
        customer_id: customerId || null,
        category_id: categoryId || null,
        status_id: statusId || null,
      },
    };
    const res = await apiFetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showToast('タスク追加完了');
      onComplete();
    } else {
      const err = await res.json();
      showToast(err.errors?.join(', ') || '追加失敗', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" value={title} onChange={e => setTitle(e.target.value)}
        className="w-full border rounded px-3 py-2" placeholder="タイトル" required />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="詳細（任意）"
          rows={4}
        />
      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm" />
      <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
        <option value="">企業を選択</option>
        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
        <option value="">カテゴリを選択</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select value={statusId} onChange={e => setStatusId(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
        <option value="">ステータスを選択</option>
        {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      <div className="flex justify-between mt-4">
        <button type="button" onClick={onComplete} className="px-4 py-2 bg-gray-300 rounded text-sm">戻る</button>
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded text-sm">登録</button>
      </div>
    </form>
  );
};

export default NewTaskForm;
