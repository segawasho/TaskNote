import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { ToastContext } from '../contexts/ToastContext';
import { ModalContext } from '../contexts/ModalContext';
import MemoEditor from './MemoEditor'

const MemoSection = (　{user}　) => {
  const [memos, setMemos] = useState([]);
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [filters, setFilters] = useState({ customerId: '', title: '', body: ''});
  const [newMemo, setNewMemo] = useState({ title: '', memo_date: '', customer_id: '' });
  const [newMemoBody, setNewMemoBody] = useState('');
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [editMemo, setEditMemo] = useState({ title: '', body: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [createError, setCreateError] = useState('');



  // 企業マスタ取得
  useEffect(() => {
    apiFetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
      })
  }, []);

  // メモ一覧取得（フィルタ反映）
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.customerId) params.append('customer_id', filters.customerId);
    if (filters.title) params.append('title', filters.title);
    if (filters.body) params.append('body', filters.body);

    apiFetch(`/api/memos?${params.toString()}`)
      .then(res => res.json())
      .then(data => setMemos(data));
  }, [filters]);

  // メモ作成処理
  const handleCreate = () => {
    setCreateError(''); // エラー初期化

    apiFetch('/api/memos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ memo: { ...newMemo, body: newMemoBody } }),
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.errors ? err.errors.join(', ') : 'メモ作成に失敗しました');
        });
      }
      return res.json();
      })
      .then(created => {
        setMemos([...memos, created]);
        setNewMemo({ title: '', memo_date: '', customer_id: '' });
        setNewMemoBody('');
      })
      .catch(error => {
        console.error('Create error:', error);
        setCreateError(error.message);
      });
  };



  // メモ編集保存（PATCH）
  const handleUpdate = () => {
    apiFetch(`/api/memos/${selectedMemo.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ memo: editMemo })
    })
      .then(res => res.json())
      .then(updated => {
        setMemos(memos.map(m => m.id === updated.id ? updated : m));
        setSelectedMemo(updated);
        setIsEditing(false);
      });
  };

  // 削除モーダル
  const confirmDeleteMemo = (id) => {
    showModal({
      message: 'このメモを削除しますか？',
      onConfirm: () => handleDeleteMemo(id),
    });
  };

  // メモ削除処理
  const handleDeleteMemo = (id) => {
    apiFetch(`/api/memos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then(() => {
        setMemos(memos.filter(m => m.id !== id));
        setSelectedMemo(null);
      });
  };



  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">メモ一覧</h2>
        <button
          onClick={() => navigate('/memos/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          ＋ メモを追加
        </button>
      </div>

      {/* フィルターセクション */}
      <div className="border border-gray-300 bg-gray-50 rounded p-4 shadow-sm mb-6 space-y-2">
        <h3 className="text-lg font-medium">検索フィルター</h3>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center space-x-1">
            <span>企業：</span>
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={filters.customerId}
              onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
            >
              <option value="">すべて</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center space-x-1">
            <span>タイトル：</span>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1"
              value={filters.title}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
            />
          </label>

          <label className="flex items-center space-x-1">
            <span>本文：</span>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1"
              value={filters.body}
              onChange={(e) => setFilters({ ...filters, body: e.target.value })}
            />
          </label>
        </div>

      </div>


      {/* メモ一覧の描画 */}
      {memos.length === 0 ? (
        <p>メモがまだありません。</p>
      ) : (
        <ul className="space-y-2">
        {memos.map((memo) => (
          <li key={memo.id} className="relative border p-4 rounded shadow-sm bg-white">

            {/* 顧客コード＋名称（右上） */}
            {(() => {
              const customer = customers.find(c => c.id === memo.customer_id);
              return customer ? (
                <div className="absolute top-2 right-2 text-sm text-gray-500">
                  {customer.customer_code}：{customer.name}
                </div>
              ) : null;
            })()}

            {/* 更新日 */}
            <div className="text-gray-500 text-sm mb-1">
              {new Date(memo.updated_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}
            </div>

            {/* タイトル */}
            <div className="font-semibold text-lg mb-1">{memo.title}</div>

            {/* 本文 */}
            <div
              className="text-sm text-gray-700 line-clamp-2 mb-8"
              dangerouslySetInnerHTML={{ __html: memo.body }}
            />

            {/* 編集・削除ボタン　右下に配置 */}
            <div className="absolute bottom-2 right-2 flex space-x-2">
              <button
                onClick={() => navigate(`/memos/${memo.id}/edit`)}
                className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
              >
                編集
              </button>
              <button
                onClick={() => confirmDeleteMemo(memo.id)}
                className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600"
              >
                削除
              </button>
            </div>

          </li>
        ))}

        </ul>
      )}
    </div>
  );
};

export default MemoSection;
