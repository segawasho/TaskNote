import React, { useEffect, useState, useContext } from 'react';
import { apiFetch } from '../api';
import { ToastContext } from '../contexts/ToastContext';
import { ModalContext } from '../contexts/ModalContext';


const CustomerMaster = ({ user }) => {
  const [customers, setCustomers] = useState([]);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerCode, setNewCustomerCode] = useState('');
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [editedCustomerCode, setEditedCustomerCode] = useState('');
  const [editedCustomerName, setEditedCustomerName] = useState('');
  const [showCustomerCodeInput, setShowCustomerCodeInput] = useState(false);


  const { showModal, hideModal } = useContext(ModalContext);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    apiFetch('/api/customers')
      .then(res => {
        if (!res.ok) throw new Error('取得失敗');
        return res.json();
      })
      .then(data => setCustomers(data))
      .catch(err => {
        console.error('顧客取得エラー:', err);
        showToast('顧客一覧の取得に失敗しました', 'error');
      });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    apiFetch('/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        customer: {
          customer_code: newCustomerCode,
          name: newCustomerName
        }
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('作成失敗');
        return res.json();
      })
      .then(() => {
        setNewCustomerName('');
        setNewCustomerCode('');
        fetchCustomers();
        showToast('顧客を追加しました', 'success');
      })
      .catch(err => {
        console.error('作成エラー:', err);
        showToast('顧客の追加に失敗しました', 'error');
      });
  };


  const handleEditClick = (customer) => {
    setEditingCustomerId(customer.id);
    setEditedCustomerCode(customer.customer_code);
    setEditedCustomerName(customer.name);
  };

  const handleUpdate = (id) => {
    apiFetch(`/api/customers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        customer: {
          customer_code: editedCustomerCode,
          name: editedCustomerName
        }
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('更新失敗');
        return res.json();
      })
      .then(() => {
        setEditingCustomerId(null);
        setEditedCustomerName('');
        setEditedCustomerCode('');
        fetchCustomers();
        showToast('顧客情報を更新しました', 'success');
      })
      .catch(err => {
        console.error('更新エラー:', err);
        showToast('顧客情報の更新に失敗しました', 'error');
      });
  };

  // 削除モーダル
  const confirmDeleteCustomer = (id) => {
    showModal({
      message: 'この顧客を削除しますか？',
      onConfirm: () => handleDeleteCustomer(id),
    });
  };

  // 削除処理
  const handleDeleteCustomer = async (id) => {
    try {
      const res = await apiFetch(`/api/customers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || '削除に失敗しました', 'error');
        return;
      }

      showToast('削除しました', 'success');
      fetchCustomers();
    } catch (err) {
      console.error('削除エラー:', err);
      showToast('削除に失敗しました', 'error');
    }
  };





  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800">顧客マスタ管理</h2>

      <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow space-y-4">


        {/* 顧客名 */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <p className="font-medium text-gray-800">顧客名</p>
            <p className="text-sm text-gray-500">※（必須）最大15文字</p>
          </div>
          <input
            className="w-full border rounded px-3 py-2"
            type="text"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            placeholder="新規顧客名を入力"
            maxLength={15}
            autoComplete="off"
            required
          />
        </div>

        {/* 顧客コードトグル */}
        <div className="flex items-center gap-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showCustomerCodeInput}
              onChange={() => setShowCustomerCodeInput(prev => !prev)}
              className="mr-2"
            />
            管理番号も登録する（任意）
          </label>
        </div>

        {/* 顧客コード */}
        {showCustomerCodeInput && (
          <div className="space-y-1">
            <p className="text-sm text-gray-500">※ 最大6文字｜英数字と記号（- _ .）のみ</p>
            <input
              className="w-full border rounded px-3 py-2"
              type="text"
              value={newCustomerCode}
              onChange={(e) => setNewCustomerCode(e.target.value)}
              placeholder="例: A123-1"
              maxLength={6}
              pattern="[a-zA-Z0-9._-]*"
              title="英数字と記号（- _ .）のみ使用できます"
              autoComplete="off"
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400"
        >
          追加
        </button>
      </form>

      <h3 className="text-lg font-semibold text-gray-700">顧客一覧</h3>
      <ul className="space-y-2">
        {/* 見出し */}
        <li className="flex justify-between text-sm text-gray-500 font-medium px-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="min-w-[120px] border-r pr-2">顧客コード</div>
            <div className="pl-2">顧客名</div>
          </div>
          <div className="hidden sm:flex gap-2 pr-2">&nbsp;</div> {/* ボタン列と幅合わせ */}
        </li>
        {/* 一覧 */}
        {customers.map(customer => (
          <li key={customer.id} className="bg-white border px-4 py-2 rounded shadow-sm space-y-2 sm:space-y-0">
            {editingCustomerId === customer.id ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-2 w-full">
                <input
                  className="flex-1 border rounded px-3 py-2"
                  type="text"
                  value={editedCustomerCode}
                  onChange={(e) => setEditedCustomerCode(e.target.value)}
                  maxLength={6}
                  pattern="[a-zA-Z0-9._-]*"
                  autoComplete="off"
                  title="英数字と記号（- _ .）のみ使用できます"
                  placeholder="顧客コード"
                />
                <input
                  className="flex-1 border rounded px-3 py-2"
                  type="text"
                  value={editedCustomerName}
                  onChange={(e) => setEditedCustomerName(e.target.value)}
                  maxLength={15}
                  autoComplete="off"
                  placeholder="顧客名"
                />
                <div className="flex gap-2">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400"
                    onClick={() => handleUpdate(customer.id)}
                  >
                    保存
                  </button>
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400"
                    onClick={() => {
                      setEditingCustomerId(null);
                      setEditedCustomerName('');
                      setEditedCustomerCode('');
                    }}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap justify-between items-center w-full">
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="min-w-[120px] font-mono text-gray-800 border-r pr-2">
                    {customer.customer_code || ''}
                  </div>
                  <div className="pl-2 text-gray-800">{customer.name}</div>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400"
                    onClick={() => handleEditClick(customer)}
                  >
                    編集
                  </button>
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400"
                    onClick={() => confirmDeleteCustomer(customer.id)}
                  >
                    削除
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>


    </div>
  );
};

export default CustomerMaster;
