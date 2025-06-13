import React, { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../api';
import { ToastContext } from '../contexts/ToastContext';
import MemoEditor from '../memos/MemoEditor';

const NewMemoForm = ({ user, onComplete }) => {
  const { showToast } = useContext(ToastContext);

  const [customers, setCustomers] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [customerId, setCustomerId] = useState('');

  useEffect(() => {
    apiFetch('/api/customers').then(res => res.json()).then(setCustomers);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { memo: { title, customer_id: customerId || null, body } };
    const res = await apiFetch('/api/memos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showToast('メモ追加完了');
      onComplete();
    } else {
      const err = await res.json();
      showToast(err.errors?.join(', ') || '追加失敗', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input type="text" value={title} onChange={e => setTitle(e.target.value)}
        className="w-full border rounded px-2 py-1" placeholder="タイトル" required />
      <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full border rounded px-2 py-1 text-sm">
        <option value="">企業を選択</option>
        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <MemoEditor content={body} onChange={setBody} />
      <div className="flex justify-between mt-4">
        <button type="button" onClick={onComplete} className="px-4 py-2 bg-gray-300 rounded text-sm">戻る</button>
        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded text-sm">登録</button>
      </div>
    </form>
  );
};

export default NewMemoForm;
