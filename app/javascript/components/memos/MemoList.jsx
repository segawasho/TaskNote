import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { ToastContext } from '../contexts/ToastContext';
import { ModalContext } from '../contexts/ModalContext';
import { useMemos } from '../contexts/MemoContext';
import MemoEditor from './MemoEditor'
import SelectBox from '../common/SelectBox';

const MemoSection = (　{user}　) => {
  const [isLoading, setIsLoading] = useState(true);

  const { memos, setMemos } = useMemos();

  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const customerOptions = useMemo(() => customers, [customers]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [filters, setFilters] = useState({ customerId: '', title: '', body: ''});
  const [newMemo, setNewMemo] = useState({ title: '', memo_date: '', customer_id: '' });
  const [newMemoBody, setNewMemoBody] = useState('');
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [editMemo, setEditMemo] = useState({ title: '', body: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [createError, setCreateError] = useState('');

  const { showModal, hideModal } = useContext(ModalContext);
  const { showToast } = useContext(ToastContext);

  const [showFilter, setShowFilter] = useState(false);


  // 企業マスタ取得
  useEffect(() => {
    apiFetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
      })
  }, []);

  // ノート一覧取得（フィルタ反映）
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.customerId) params.append('customer_id', filters.customerId);
    if (filters.title) params.append('title', filters.title);
    if (filters.body) params.append('body', filters.body);

    setIsLoading(true);

    apiFetch(`/api/memos?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setMemos(data);
        setIsLoading(false);  // 読み込み完了
      });
  }, [filters]);

  // ノート作成処理
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
          throw new Error(err.errors ? err.errors.join(', ') : 'ノート作成に失敗しました');
        });
      }
      return res.json();
      })
      .then(created => {
        setMemos([...memos, created]);
        setNewMemo({ title: '', memo_date: '', customer_id: '' });
        setNewMemoBody('');
        showToast('ノートを作成しました', 'success');
      })
      .catch(error => {
        console.error('Create error:', error);
        setCreateError(error.message);
        showToast('ノートの作成に失敗しました', 'error');
      });
  };



  // ノート編集保存（PATCH）
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
        showToast('ノートを更新しました', 'success');
      });
  };

  // 削除モーダル
  const confirmDeleteMemo = (id) => {
    showModal({
      message: 'このノートを削除しますか？',
      onConfirm: () => handleDeleteMemo(id),
    });
  };

  // ノート削除処理
  const handleDeleteMemo = (id) => {
    apiFetch(`/api/memos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then(() => {
        setMemos(memos.filter(m => m.id !== id));
        setSelectedMemo(null);
        showToast('ノートを削除しました', 'success');  // ← 追加
      })
      .catch((error) => {
        console.error('Delete error:', error);
        showToast('ノートの削除に失敗しました', 'error');  // ← 失敗時も追加
      });
  };


  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">ノート一覧</h2>
        <button
          onClick={() => navigate('/memos/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          ＋ 新規追加
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow space-y-3 mt-8">

        {/* フィルターのヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/filter.png" alt="Filter" className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-700">検索フィルター</h2>
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-400"
          >
            {showFilter ? '非表示' : '表示'}
          </button>
        </div>

        {/* フィルター中身（トグルで表示制御） */}
        {showFilter && (
          <div className="space-y-3">
            <SelectBox
              label="企業"
              options={customerOptions}
              value={filters.customerId}
              onChange={(value) => setFilters({ ...filters, customerId: value })}
              placeholder="すべて"
            />

            <div>
              <label className="block font-medium mb-1">タイトル</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-2 py-1"
                value={filters.title}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">本文</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-2 py-1"
                value={filters.body}
                onChange={(e) => setFilters({ ...filters, body: e.target.value })}
              />
            </div>
            <div className="text-right mt-2">
              <button
                onClick={() => setFilters({ customerId: '', title: '', body: '' })}
                className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                フィルターをクリア
              </button>
            </div>
          </div>
        )}
      </div>



      {/* ノート一覧の描画 */}
      {isLoading ? (
        <p>読み込み中...</p>
      ) : memos.length === 0 ? (
        <p>ノートがまだありません。</p>
      ) : (
        <ul className="space-y-2 mt-6">
        {[...memos]
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .map((memo) => (
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
