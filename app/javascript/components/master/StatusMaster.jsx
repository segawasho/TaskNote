import React, { useEffect, useState, useContext } from 'react';
import { apiFetch } from '../api';
import { ToastContext } from '../contexts/ToastContext';
import { ModalContext } from '../contexts/ModalContext';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({
  status, isEditing, onEdit, onUpdate, onDelete,
  editedStatusName, setEditedStatusName
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: String(status.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white shadow-sm rounded-xl px-4 py-3 mb-3 border border-gray-200 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div {...listeners} className="cursor-grab text-gray-400">☰</div>
        <div className="cursor-grab text-gray-400">{status.sort_order}：</div>

        {isEditing ? (
          <input
            type="text"
            value={editedStatusName}
            onChange={e => setEditedStatusName(e.target.value)}
            maxLength={6}
            className="border rounded px-2 py-1 w-36"
          />
        ) : (
          <span className="text-gray-800 font-medium">{status.name}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <button onClick={onUpdate} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">登録</button>
            <button onClick={() => onEdit(null)} className="text-sm bg-gray-400 text-white px-3 py-1 rounded">キャンセル</button>
          </>
        ) : (
          <>
            <button onClick={() => onEdit(status)} className="text-sm bg-green-500 text-white px-3 py-1 rounded">編集</button>
            <button onClick={onDelete} className="text-sm bg-red-500 text-white px-3 py-1 rounded">削除</button>
          </>
        )}
      </div>
    </div>
  );
};

const StatusMaster = () => {
  const [statuses, setStatuses] = useState([]);
  const [newStatusName, setNewStatusName] = useState('');
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [editedStatusName, setEditedStatusName] = useState('');

  const { showToast } = useContext(ToastContext);
  const { showModal } = useContext(ModalContext);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = () => {
    apiFetch('/api/statuses')
      .then(res => res.json())
      .then(data => {
        setStatuses([...data]); // スプレッド演算子で参照を切る（DnDのために重要）
      })
      .catch(() => showToast('ステータス一覧の取得に失敗しました', 'error'));
  };

  const notFixedStatuses = statuses.filter(s => !s.fixed);
  const fixedStatus = statuses.find(s => s.fixed);

  const handleAddStatus = () => {
    if (!newStatusName.trim()) {
      showToast('ステータス名を入力してください', 'error');
      return;
    }

    apiFetch('/api/statuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: { name: newStatusName } })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        setNewStatusName('');
        fetchStatuses();
        showToast('ステータスを追加しました', 'success');
      })
      .catch(() => showToast('ステータスの追加に失敗しました', 'error'));
  };

  const handleUpdate = (id) => {
    apiFetch(`/api/statuses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: { name: editedStatusName } })
    })
      .then(() => {
        setEditingStatusId(null);
        setEditedStatusName('');
        fetchStatuses();
        showToast('更新しました', 'success');
      })
      .catch(() => showToast('更新に失敗しました', 'error'));
  };

  const confirmDeleteStatus = (id) => {
    const nonFixedCount = statuses.filter(s => !s.fixed).length;
    if (nonFixedCount <= 1) {
      showToast('ステータスは「完了」を含めて最低2つ必要です', 'error');
      return;
    }
    showModal({
      message: 'このステータスを削除しますか？',
      onConfirm: () => handleDeleteStatus(id)
    });
  };

  const handleDeleteStatus = (id) => {
    apiFetch(`/api/statuses/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) throw new Error();
        fetchStatuses();
        showToast('削除しました', 'success');
      })
      .catch(() => showToast('削除に失敗しました', 'error'));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = notFixedStatuses.findIndex(s => String(s.id) === active.id);
    const newIndex = notFixedStatuses.findIndex(s => String(s.id) === over.id);
    const reordered = arrayMove(notFixedStatuses, oldIndex, newIndex);

    const payload = reordered.map((s, i) => ({ id: s.id, sort_order: i + 1 }));

    apiFetch('/api/statuses/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ statuses: payload })
    })
      .then(() => {
        fetchStatuses();
        showToast('並び順を更新しました', 'success');
      })
      .catch(() => showToast('並び順の更新に失敗しました', 'error'));
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800">ステータスマスタ管理</h2>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={notFixedStatuses.map(s => String(s.id))}
          strategy={verticalListSortingStrategy}
        >
          {notFixedStatuses.map(status => (
            <SortableItem
              key={status.id}
              status={status}
              isEditing={editingStatusId === status.id}
              onEdit={(s) => {
                setEditingStatusId(s ? s.id : null);
                setEditedStatusName(s?.name || '');
              }}
              onUpdate={() => handleUpdate(status.id)}
              onDelete={() => confirmDeleteStatus(status.id)}
              editedStatusName={editedStatusName}
              setEditedStatusName={setEditedStatusName}
            />
          ))}
        </SortableContext>
      </DndContext>

      {notFixedStatuses.length < 9 && (
        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            maxLength={6}
            placeholder="ステータス名"
            className="border rounded px-2 py-1 w-48"
          />
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleAddStatus}>追加</button>
        </div>
      )}

      {fixedStatus && (
        <div className="bg-white shadow-sm rounded-xl px-4 py-3 mt-6 border border-gray-200">
          <p className="text-gray-800">{fixedStatus.name}</p>
        </div>
      )}
    </div>
  );
};

export default StatusMaster;
