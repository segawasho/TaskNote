import React, { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../api';
import { ToastContext } from '../contexts/ToastContext';
import { useMemos } from '../contexts/MemoContext';
import MemoEditor from '../memos/MemoEditor';
import SelectBox from './SelectBox';

const NewMemoForm = ({ user, onComplete }) => {
  const { showToast } = useContext(ToastContext);
  const { memos, setMemos } = useMemos();

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
      const created = await res.json();  // ← 新規作成されたmemoデータを受け取る
      setMemos([...memos, created]);
      showToast('ノートを作成しました', 'success');
      onComplete(created);  // ← 親に渡す
    } else {
      const err = await res.json();
      showToast(err.errors?.join(', ') || 'ノートの作成に失敗しました', 'error');
    }
  };

  return (
    <form id="memoForm" onSubmit={handleSubmit} className="space-y-2">
      <input type="text" value={title} onChange={e => setTitle(e.target.value)}
        className="w-full border rounded px-2 py-1" placeholder="タイトル" required />
      <SelectBox
        label="顧客"
        options={customers}
        value={customerId}
        onChange={setCustomerId}
        placeholder="顧客を選択"
      />
      <MemoEditor content={body} onChange={setBody} />

    </form>
  );
};

export default NewMemoForm;
