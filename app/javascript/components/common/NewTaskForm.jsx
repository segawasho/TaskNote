// このコンポーネントは、FooterNevのaddIcon→AddModal→から描画するコンポーネント

import React, { useState, useEffect, useContext, forwardRef, useMemo } from 'react';
import { apiFetch } from '../api';
import { ToastContext } from '../contexts/ToastContext';
import { useTasks } from '../contexts/TaskContext';

import SelectBox from './SelectBox';
import DateField from './DateField';

const NewTaskForm = ({ user, onComplete }) => {
  const { tasks, setTasks } = useTasks();

  const { showToast } = useContext(ToastContext);

  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [projects, setProjects] = useState([]);

  const customerOptions = useMemo(() => customers, [customers]);
  const categoryOptions = useMemo(() => categories, [categories]);
  const statusOptions = useMemo(() => statuses, [statuses]);
  const projectOptions = useMemo(() => projects, [projects]);


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [statusId, setStatusId] = useState('');
  const [projectId, setProjectId] = useState('');

  // タイトル以外の項目をオプション化
  const [showOptions, setShowOptions] = useState(false);


  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    const [customersRes, categoriesRes, statusesRes, projectsRes] = await Promise.all([
      apiFetch('/api/customers'),
      apiFetch('/api/categories'),
      apiFetch('/api/statuses'),
      apiFetch('/api/projects'),
    ]);
    const customersData = await customersRes.json();
    const categoriesData = await categoriesRes.json();
    const statusesData = await statusesRes.json();
    const projectsData = await projectsRes.json();

    setCustomers(customersData);
    setCategories(categoriesData);
    setStatuses(statusesData);
    setProjects(projectsData);

    // ✅ ステータスの1件目を初期選択にセット（空配列対策も含む）
    if (statusesData.length > 0) {
      setStatusId(statusesData[0].id);
    }
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
        project_id: projectId || null,
      },
    };
    const res = await apiFetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const created = await res.json();
      // ✅ ここでstatusオブジェクトを補完する
      const fullCreated = {
        ...created,
        status: statuses.find(s => s.id === created.status_id) || null,
      };

      setTasks([...tasks, fullCreated]);
      showToast('タスクを作成しました', 'success');
      onComplete(fullCreated);
    } else {
      const err = await res.json();
      showToast(err.errors?.join(', ') || 'タスクの作成に失敗しました', 'error');
    }
  };

  const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-2 flex items-center cursor-pointer" onClick={onClick}>
        <img src="/calendar_2343659.png" alt="カレンダー" className="w-5 h-5 opacity-70" />
      </div>
      <input
        readOnly
        value={value}
        onClick={onClick}
        ref={ref}
        className="w-full pl-10 pr-10 rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        placeholder="日付を選択"
      />
    </div>
  ));

  return (
    <form id="taskForm" onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div>
        <label className="block font-medium mb-1">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          placeholder="タイトル"
          required
        />
      </div>


      <div>
        <label className="block font-medium mb-1">詳細（任意）</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 resize-none"
          placeholder="詳細（任意）"
          rows={4}
        />
      </div>

      <DateField
        label="締切日"
        value={dueDate}
        onChange={setDueDate}
      />


      <div className="my-2">
        <button
          type="button"
          onClick={() => setShowOptions(prev => !prev)}
          className="text-blue-600 text-base font-medium"
        >
          {showOptions ? 'ー　任意オプション' : '＋　任意オプション'}
        </button>
      </div>


      {showOptions && (
        <>

          <SelectBox
            label="顧客"
            options={customerOptions}
            value={customerId}
            onChange={setCustomerId}
            placeholder="顧客を選択"
          />

          <SelectBox
            label="プロジェクト"
            options={projectOptions}
            value={projectId}
            onChange={setProjectId}
            placeholder="プロジェクトを選択"
          />

          <SelectBox
            label="カテゴリ"
            options={categoryOptions}
            value={categoryId}
            onChange={setCategoryId}
            placeholder="カテゴリを選択"
          />

          <SelectBox
            label="ステータス"
            options={statusOptions}
            value={statusId}
            onChange={setStatusId}
            placeholder="ステータスを選択"
          />

        </>
      )}


    </form>
  );
};

export default NewTaskForm;
