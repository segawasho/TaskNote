import React, { useEffect, useState, useContext } from 'react';
import CommentSection from './CommentSection';
import { apiFetch } from '../api';
import { ToastContext } from '../contexts/ToastContext';
import { ModalContext } from '../contexts/ModalContext';

const TaskList = ({user}) => {
  const [tasks, setTasks] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [projects, setProjects] = useState([]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [newTaskProjectId, setNewTaskProjectId] = useState('');
  const [newTaskCustomerId, setNewTaskCustomerId] = useState('');
  const [newTaskCategoryId, setNewTaskCategoryId] = useState('');
  const [newTaskStatusId, setNewTaskStatusId] = useState('');

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');

  const [editedProjectId, setEditedProjectId] = useState('');
  const [editedCustomerId, setEditedCustomerId] = useState('');
  const [editedCategoryId, setEditedCategoryId] = useState('');
  const [editedStatusId, setEditedStatusId] = useState('');

  const [filterProjectId, setFilterProjectId] = useState('');
  const [filterCustomerId, setFilterCustomerId] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterStatusId, setFilterStatusId] = useState('');

  const [showDoneFilter, setShowDoneFilter] = useState('not_done'); // デフォルト：未完了のみ

  const [sortKey, setSortKey] = useState('created_desc');

  const [showCreateForm, setShowCreateForm] = useState(true);

  const [showFilter, setShowFilter] = useState(true);

  const { showModal, hideModal } = useContext(ModalContext);
  const { showToast } = useContext(ToastContext);


  useEffect(() => {
    fetchTasks();
    fetchMasterData();
  }, []);

  const fetchTasks = () => {
    apiFetch('/api/tasks')
      .then(response => response.json())
      .then(data => {
        // 自分のタスクのみ
        setTasks(data.filter(task => task.user_id === user.id));
      })
      .catch(error => console.error('Error fetching tasks:', error));
  };

  const handleCreateTask = (e) => {
    e.preventDefault();

    const payload = {
      task: {
        title: newTaskTitle,
        description: newTaskDescription,
        due_date: newTaskDueDate,
        customer_id: newTaskCustomerId ? Number(newTaskCustomerId) : null,
        category_id: newTaskCategoryId ? Number(newTaskCategoryId) : null,
        status_id: newTaskStatusId ? Number(newTaskStatusId) : null,
        project_id: newTaskProjectId ? Number(newTaskProjectId) : null
      }
    };

    console.log("📤 payload", payload);

    apiFetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          console.error('⛔️ サーバエラー:', data);
          throw new Error(JSON.stringify(data.errors || data));
        }
        return data;
      })
      .then(() => {
        // フォームリセット
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskDueDate('');
        setNewTaskCustomerId('');
        setNewTaskCategoryId('');
        setNewTaskStatusId('');
        showToast('新規タスクを追加しました', 'success');
        fetchTasks();
      })
      .catch((error) => {
        console.error('⚠️ タスク作成エラー:', error);
        showToast(`追加失敗: ${error.message}`, 'error');
      });
  };


  const handleUpdate = (id) => {
    apiFetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        task: {
          title: editedTitle,
          description: editedDescription,
          due_date: editedDueDate,
          customer_id: editedCustomerId ? Number(editedCustomerId) : null,
          category_id: editedCategoryId ? Number(editedCategoryId) : null,
          status_id: editedStatusId ? Number(editedStatusId) : null,
          project_id: editedProjectId ? Number(editedProjectId) : null
        }
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(() => {
      setEditingTaskId(null);
      setEditedTitle('');
      setEditedDescription('');
      setEditedDueDate('');
      setEditedCustomerId('');
      setEditedCategoryId('');
      setEditedStatusId('');
      showToast('タスクを更新しました', 'success');
      fetchTasks();
    })
    .catch(error => {
      console.error('Error updating task:', error);
      showToast('タスクの更新に失敗しました', 'error');
    });
  };

  // 削除モーダル
  const confirmDelete = (id) => {
    showModal({
      title: 'タスク削除',
      message: 'このタスクを削除してもよろしいですか？',
      onConfirm: () => handleDelete(id)
    });
  };

  const handleDelete = (id) => {
    apiFetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
        showToast('タスクを削除しました', 'success');
        closeModal();
      })
      .catch((error) => {
        console.error('Error deleting task:', error);
        showToast('タスクの削除に失敗しました', 'error');
        closeModal();
      });
  };

  const fetchMasterData = async () => {
    try {
      const [customersRes, categoriesRes, statusesRes, projectsRes] = await Promise.all([
        apiFetch('/api/customers'),
        apiFetch('/api/categories'),
        apiFetch('/api/statuses'),
        apiFetch('/api/projects'),
      ]);
      const [customers, categories, statuses, projects] = await Promise.all([
        customersRes.json(),
        categoriesRes.json(),
        statusesRes.json(),
        projectsRes.json(),
      ]);
      setCustomers(customers.filter(c => c.user_id === user.id));
      setCategories(categories.filter(c => c.user_id === user.id));
      setStatuses(statuses.filter(s => s.user_id === user.id));
      setProjects(projects.filter(p => p.user_id === user.id));
    } catch (error) {
      console.error('マスタデータの取得に失敗しました:', error);
      showToast('マスタデータの取得に失敗しました', 'error');
    }
  };



  // 締切日の色分け（本日以前）
  const getDueDateClass = (dueDate) => {
    if (!dueDate) return 'bg-gray-100 text-gray-800';

    const today = new Date();
    today.setHours(0, 0, 0, 0); // 時刻を 00:00 にリセット

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0); // 同様にリセット

    const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 'bg-red-100 text-red-800'; // 今日以前
    } else if (diffDays === 1) {
      return 'bg-yellow-100 text-yellow-800'; // 明日
    } else {
      return 'bg-gray-100 text-gray-800'; // それ以外
    }
  };



  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">タスク一覧</h1>

      {/* 新規登録 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">新規タスク作成</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-400"
        >
          {showCreateForm ? '非表示' : '表示'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateTask} className="space-y-4 bg-white p-4 rounded shadow mt-2">
          <h2 className="text-lg font-semibold text-gray-700">新規タスク作成</h2>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="新しいタスク名を入力"
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="タスク詳細（任意）"
            className="w-full border rounded px-3 py-2"
          ></textarea>
          <div className="flex flex-wrap gap-3">
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <select value={newTaskProjectId} onChange={(e) => setNewTaskProjectId(Number(e.target.value))} className="border rounded px-3 py-2">
              <option value="">プロジェクトを選択</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            <select value={newTaskCustomerId} onChange={(e) => setNewTaskCustomerId(Number(e.target.value))} className="border rounded px-3 py-2">
              <option value="">企業を選択</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
            <select value={newTaskCategoryId} onChange={(e) => setNewTaskCategoryId(Number(e.target.value))} className="border rounded px-3 py-2">
              <option value="">カテゴリを選択</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select value={newTaskStatusId} onChange={(e) => setNewTaskStatusId(Number(e.target.value))} className="border rounded px-3 py-2">
              <option value="">ステータスを選択</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            追加
          </button>
        </form>
      )}

      {/* フィルター */}
      <div className="flex items-center justify-between mt-8">
        <h2 className="text-lg font-semibold text-gray-700">フィルター</h2>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-400"
        >
          {showFilter ? '非表示' : '表示'}
        </button>
      </div>

      {showFilter && (

        <div className="bg-white p-4 rounded shadow space-y-3 mt-2">
          <h2 className="text-lg font-semibold text-gray-700">フィルター</h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col text-sm text-gray-600">
              プロジェクト
              <select value={filterProjectId} onChange={(e) => setFilterProjectId(e.target.value)} className="border rounded px-2 py-1">
                <option value="">すべて</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm text-gray-600">
              企業
              <select value={filterCustomerId} onChange={(e) => setFilterCustomerId(e.target.value)} className="border rounded px-2 py-1">
                <option value="">すべて</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm text-gray-600">
              カテゴリ
              <select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)} className="border rounded px-2 py-1">
                <option value="">すべて</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm text-gray-600">
              ステータス
              <select value={filterStatusId} onChange={(e) => setFilterStatusId(e.target.value)} className="border rounded px-2 py-1">
                <option value="">すべて</option>
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </label>
          </div>


          <label className="block text-sm text-gray-600">
            並び替え
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="border rounded px-2 py-1">
              <option value="created_desc">登録順</option>
              <option value="updated_desc">更新順</option>
              <option value="due_date_asc">締切日順</option>
            </select>
          </label>

          <div className="flex gap-2 mt-4">
            {[
              { key: 'not_done', label: '未完了' },
              { key: 'done', label: '完了' },
              { key: 'all', label: 'すべて' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setShowDoneFilter(key)}
                className={`px-3 py-1 rounded border text-sm transition
                  ${showDoneFilter === key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}
                `}
              >
                {label}
              </button>
            ))}
          </div>

        </div>
      )}


      {/* タスクリスト */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tasks
          .filter(task => {
            return (
              (filterProjectId === '' || task.project_id === Number(filterProjectId)) &&
              (filterCustomerId === '' || task.customer_id === Number(filterCustomerId)) &&
              (filterCategoryId === '' || task.category_id === Number(filterCategoryId)) &&
              (filterStatusId === '' || task.status_id === Number(filterStatusId)) &&
              (showDoneFilter === 'not_done' ? !(task.status && task.status.fixed) :
               showDoneFilter === 'done' ? (task.status && task.status.fixed) : true)
            );
          })
          .sort((a, b) => {
            if (sortKey === 'updated_desc') {
              return new Date(b.updated_at) - new Date(a.updated_at);
            }
            if (sortKey === 'due_date_asc') {
              return new Date(a.due_date || '9999-12-31') - new Date(b.due_date || '9999-12-31');
            }
            return b.id - a.id; // 登録順
          })
          .map(task => (
            <li key={task.id} className="bg-white border border-gray-300 rounded-xl p-4 shadow-md space-y-3 flex flex-col justify-between min-h-[480px]">
            {editingTaskId === task.id ? (
              <div className="space-y-3">
                {/* 編集モード */}
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="タイトル"
                />
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm resize-none"
                  placeholder="詳細"
                  rows={3}
                />
                <input
                  type="date"
                  value={editedDueDate}
                  onChange={(e) => setEditedDueDate(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <select value={editedProjectId} onChange={(e) => setEditedProjectId(Number(e.target.value))} className="border rounded px-2 py-1 text-sm w-full sm:w-auto">
                    <option value="">プロジェクトを選択</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                  <select value={editedCustomerId} onChange={(e) => setEditedCustomerId(Number(e.target.value))} className="border rounded px-2 py-1 text-sm w-full sm:w-auto">
                    <option value="">企業を選択</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                  <select value={editedCategoryId} onChange={(e) => setEditedCategoryId(Number(e.target.value))} className="border rounded px-2 py-1 text-sm w-full sm:w-auto">
                    <option value="">カテゴリを選択</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <select value={editedStatusId} onChange={(e) => setEditedStatusId(Number(e.target.value))} className="border rounded px-2 py-1 text-sm w-full sm:w-auto">
                    <option value="">ステータスを選択</option>
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleUpdate(task.id)} className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                    更新
                  </button>
                  <button onClick={() => setEditingTaskId(null)} className="px-4 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm">
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 表示モード */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`px-2 py-1 rounded ${getDueDateClass(task.due_date)}`}>
                      締切: {task.due_date || '未設定'}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                      {task.customer?.name || '企業: 未設定'}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                      {task.category?.name || 'カテゴリ: 未設定'}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                      {task.status?.name || 'ステータス: 未設定'}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 break-words">{task.title}</h3>

                  {task.description && (
                    <p className="text-sm text-gray-700 leading-relaxed break-words">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingTaskId(task.id);
                      setEditedTitle(task.title);
                      setEditedDescription(task.description || '');
                      setEditedDueDate(task.due_date || '');
                      setEditedProjectId(task.project_id || '');
                      setEditedCustomerId(task.customer_id || '');
                      setEditedCategoryId(task.category_id || '');
                      setEditedStatusId(task.status_id || '');
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => confirmDelete(task.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    削除
                  </button>
                </div>

                <div className="mt-3 border-t pt-3">
                  <CommentSection taskId={task.id} user={user} />
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>

  );
};

export default TaskList;
