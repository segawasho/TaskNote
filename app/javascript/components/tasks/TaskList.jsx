import React, { useEffect, useState, useContext, useMemo } from 'react';
import CommentSection from './CommentSection';
import AddModal from '../common/AddModal';
import NewTaskForm from '../common/NewTaskForm';
import SelectBox from '../common/SelectBox';
import DateField from '../common/DateField';
import { apiFetch } from '../api';
import { ToastContext } from '../contexts/ToastContext';
import { ModalContext } from '../contexts/ModalContext';
import { useTasks } from '../contexts/TaskContext';




const TaskList = ({user}) => {
  const { tasks, setTasks } = useTasks();

  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [projects, setProjects] = useState([]);

  const customerOptions = useMemo(() => customers, [customers]);
  const projectOptions = useMemo(() => projects, [projects]);
  const categoryOptions = useMemo(() => categories, [categories]);
  const statusOptions = useMemo(() => statuses, [statuses]);


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

  const [showFilter, setShowFilter] = useState(false);

  const [showDoneFilter, setShowDoneFilter] = useState('not_done'); // デフォルト：未完了のみ

  const [sortKey, setSortKey] = useState('updated_desc');

  const { showModal, hideModal } = useContext(ModalContext);
  const { showToast } = useContext(ToastContext);


  const [showAddModal, setShowAddModal] = useState(false); // Task追加用モーダル

  const [expandedTaskIds, setExpandedTaskIds] = useState([]);　// Taskカード折りたたみ用


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
      })
      .catch((error) => {
        console.error('Error deleting task:', error);
        showToast('タスクの削除に失敗しました', 'error');
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


  // 並び替えオプション定義
  const sortOptions = [
    { key: 'updated_desc', label: '更新順' },
    { key: 'due_date_asc', label: '締切順' }
  ];




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

  // Task折りたたみ用
  const toggleExpand = (taskId) => {
    setExpandedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const clearFilters = () => {
    setFilterCustomerId('');
    setFilterProjectId('');
    setFilterCategoryId('');
    setFilterStatusId('');
    setShowDoneFilter('not_done');  // ← 初期状態
  };



  return (
    <>
      {/* 追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg flex flex-col h-[80%]">
            <div className="px-4 py-2 border-b">
              <h2 className="text-base font-bold">タスク追加</h2>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <NewTaskForm user={user} onComplete={() => { fetchTasks(); setShowAddModal(false); }} />
            </div>

            <div className="px-4 py-3 border-t flex justify-between">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-300 rounded text-sm">戻る</button>
              <button form="taskForm" type="submit" className="px-6 py-2 bg-green-600 text-white rounded text-sm">登録</button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">タスク一覧</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            ＋ 新規追加
          </button>
        </div>


        {/* フィルターカード全体 */}
        <div className="bg-white p-4 rounded shadow space-y-3 mt-8">

          {/* ヘッダー（内包化） */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/filter.png" alt="Filter" className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-gray-700">フィルター</h2>
            </div>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-400"
            >
              {showFilter ? '非表示' : '表示'}
            </button>
          </div>

          {/* 中身はトグルで制御 */}
          {showFilter && (
            <div className="space-y-3">

              {/* フィルター選択項目 */}
              <div className="space-y-3">
                <SelectBox
                  label="顧客"
                  options={customerOptions}
                  value={filterCustomerId}
                  onChange={setFilterCustomerId}
                  placeholder="すべて"
                />

                <SelectBox
                  label="プロジェクト"
                  options={projectOptions}
                  value={filterProjectId}
                  onChange={setFilterProjectId}
                  placeholder="すべて"
                />

                <SelectBox
                  label="カテゴリ"
                  options={categoryOptions}
                  value={filterCategoryId}
                  onChange={setFilterCategoryId}
                  placeholder="すべて"
                />

                <SelectBox
                  label="ステータス"
                  options={statusOptions}
                  value={filterStatusId}
                  onChange={setFilterStatusId}
                  placeholder="すべて"
                />
              </div>

              {/* 完了状態フィルター */}
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
                        ? 'bg-gray-500 text-white border-gray-400'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="text-right mt-2">
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition"
                >
                  フィルターをクリア
                </button>
              </div>


            </div>
          )}
        </div>

        {/* 並び替えボタン (フィルターカードの外に独立配置) */}
        <div className="flex gap-2 mt-4">
          {sortOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`px-3 py-1 rounded border text-sm transition
                ${sortKey === key
                  ? 'bg-gray-500 text-white border-gray-400'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}
              `}
            >
              {label}
            </button>
          ))}
        </div>


        {/* タスクリスト */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
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
            })
            .map(task => (
              <li key={task.id} className="bg-white border border-gray-300 rounded-xl p-4 shadow-md space-y-3 flex flex-col justify-between">
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
                  <DateField
                    label="締切日"
                    value={editedDueDate}
                    onChange={setEditedDueDate}
                  />
                  <div className="flex flex-wrap gap-2">
                    <SelectBox
                      label="顧客"
                      options={customerOptions}
                      value={editedCustomerId}
                      onChange={setEditedCustomerId}
                      placeholder="顧客を選択"
                    />

                    <SelectBox
                      label="プロジェクト"
                      options={projectOptions}
                      value={editedProjectId}
                      onChange={setEditedProjectId}
                      placeholder="プロジェクトを選択"
                    />

                    <SelectBox
                      label="カテゴリ"
                      options={categoryOptions}
                      value={editedCategoryId}
                      onChange={setEditedCategoryId}
                      placeholder="カテゴリを選択"
                    />

                    <SelectBox
                      label="ステータス"
                      options={statusOptions}
                      value={editedStatusId}
                      onChange={setEditedStatusId}
                      placeholder="ステータスを選択"
                    />
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

                      {/* ▼ 折りたたみボタン */}
                      <button
                        onClick={() => toggleExpand(task.id)}
                        className="ml-auto text-blue-500 text-sm"
                      >
                        {expandedTaskIds.includes(task.id) ? '▲ 詳細を隠す' : '▼ 詳細を表示'}
                      </button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 break-words">{task.title}</h3>

                    {expandedTaskIds.includes(task.id) && (
                      <>
                        {/* ここから先が折りたたみ内部 */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                            {task.category?.name || 'カテゴリ: 未設定'}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                            {task.status?.name || 'ステータス: 未設定'}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-sm text-gray-700 leading-relaxed break-words">
                            {task.description}
                          </p>
                        )}

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
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default TaskList;
