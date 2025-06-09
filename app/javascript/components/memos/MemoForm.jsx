import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../api';
import MemoEditor from './MemoEditor';

const MemoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // editの場合のみIDあり
  const isEditMode = !!id;

  const [memo, setMemo] = useState({
    title: '',
    customer_id: '',
    body: '',
  });

  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState('');

  // customers取得
  useEffect(() => {
    apiFetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
      })
      .catch(err => {
        console.error('顧客取得エラー:', err);
      });
  }, []);

  // 編集モードなら既存データ取得
  useEffect(() => {
    if (isEditMode) {
      apiFetch(`/api/memos/${id}`)
        .then(res => res.json())
        .then(data => {
          setMemo({
            title: data.title || '',
            customer_id: data.customer_id || '',
            body: data.body || '',
          });
        })
        .catch(err => {
          console.error('メモ取得エラー:', err);
        });
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemo(prev => ({ ...prev, [name]: value }));
  };

  const handleBodyChange = (html) => {
    setMemo(prev => ({ ...prev, body: html }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors('');

    const method = isEditMode ? 'PATCH' : 'POST';
    const url = isEditMode ? `/api/memos/${id}` : '/api/memos';

    apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ memo }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.errors?.join(', ') || '保存に失敗しました');
          });
        }
        return res.json();
      })
      .then(() => {
        navigate('/memos');
      })
      .catch(err => {
        console.error('送信エラー:', err);
        setErrors(err.message);
      });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">{isEditMode ? 'メモ編集' : '新規メモ作成'}</h2>

      {errors && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{errors}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">タイトル</label>
          <input
            type="text"
            name="title"
            value={memo.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">企業</label>
          <select
            name="customer_id"
            value={memo.customer_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">選択してください（任意）</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">本文</label>
          <MemoEditor content={memo.body} onChange={handleBodyChange} />
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate('/memos')}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            ← 戻る
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditMode ? '更新する' : '登録する'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemoForm;
