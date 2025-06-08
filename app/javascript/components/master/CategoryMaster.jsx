import React, { useEffect, useState, useContext } from 'react';
import { apiFetch } from '../api';
import { ToastContext } from '../contexts/ToastContext';
import { ModalContext } from '../contexts/ModalContext';


const CategoryMaster = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');

  const { showModal, hideModal } = useContext(ModalContext);
  const { showToast } = useContext(ToastContext);


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    apiFetch('/api/categories')
      .then(res => {
        if (!res.ok) throw new Error('取得失敗');
        return res.json();
      })
      .then(data => setCategories(data))
      .catch(err => {
        console.error('カテゴリ取得エラー:', err);
        showToast('カテゴリ一覧の取得に失敗しました', 'error');
      });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    apiFetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        category: {
          name: newCategoryName
        }
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('作成失敗');
        return res.json();
      })
      .then(() => {
        setNewCategoryName('');
        fetchCategories();
        showToast('カテゴリを追加しました', 'success');
      })
      .catch(err => {
        console.error('作成エラー:', err);
        showToast('カテゴリの追加に失敗しました', 'error');
      });
  };

  const handleEditClick = (category) => {
    setEditingCategoryId(category.id);
    setEditedCategoryName(category.name);
  };

  const handleUpdate = (id) => {
    apiFetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        category: {
          name: editedCategoryName
        }
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('更新失敗');
        return res.json();
      })
      .then(() => {
        setEditingCategoryId(null);
        setEditedCategoryName('');
        fetchCategories();
        showToast('カテゴリを更新しました', 'success');
      })
      .catch(err => {
        console.error('更新エラー:', err);
        showToast('カテゴリの更新に失敗しました', 'error');
      });
  };

  // 削除モーダル
  const confirmDeleteCategory = (id) => {
    showModal({
      message: 'このカテゴリを削除しますか？',
      onConfirm: () => handleDeleteCategory(id),
    });
  };

  // 削除処理
  const handleDeleteCategory = async (id) => {
    try {
      const res = await apiFetch(`/api/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || '削除に失敗しました', 'error');
        return;
      }

      showToast('削除しました', 'success');
      fetchCategories();
    } catch (err) {
      console.error('削除エラー:', err);
      showToast('削除に失敗しました', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800">カテゴリマスタ管理</h2>

      <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow space-y-4">
        {/* 顧客コード */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <p className="font-medium text-gray-800">カテゴリ</p>
          </div>
          <input className="w-full border rounded px-3 py-2"
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="新規カテゴリ名を入力"
            maxLength={10}
            autoComplete="off"
            required
          />
        </div>
        <div className="flex justify-end ml-auto">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center min-w-[80px]" type="submit">追加</button>
        </div>
      </form>

      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border px-4 py-2 rounded shadow-sm space-y-2 sm:space-y-0 sm:space-x-4">
            {editingCategoryId === category.id ? (
              <>
                <input className="w-full border rounded px-3 py-2"
                  type="text"
                  value={editedCategoryName}
                  onChange={(e) => setEditedCategoryName(e.target.value)}
                  maxLength={10}
                  autoComplete="off"
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400 text-center min-w-[80px]" type="button"
                    onClick={() => handleUpdate(category.id)}
                  >
                    保存
                  </button>
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400 text-center min-w-[80px]" type="button"
                    onClick={() => {
                      setEditingCategoryId(null);
                      setEditedCategoryName('');
                    }}>
                      キャンセル
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:space-x-4">
                <span className="text-gray-800">{category.name}</span>
                <div className="flex gap-2 justify-end ml-auto">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400" type="button"
                    onClick={() => handleEditClick(category)}
                  >
                    編集
                  </button>
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400" type="button"
                    onClick={() => confirmDeleteCategory(category.id)}
                  >
                    削除
                  </button>
                </div>
              </div>
              </>
            )}
          </li>
        ))}
      </ul>


    </div>
  );
};

export default CategoryMaster;
