// components/projects/
//   ProjectDetail.jsx    ← 状態管理
//   ProjectTimeline.jsx  ← 描画の大枠まとめ
//   DraggableTaskBar.jsx ← DND本体＋リサイズ群
//   projectUtils.js      ← 共通ロジック

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
dayjs.extend(minMax);
import {
  DndContext,
  useDraggable,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";


// ズーム倍率設定（1日あたりのpx幅）
const ZOOM_LEVELS = {
  day: 50,
  week: 20,
  month: 8
};

// Taskを保存API（start_date, due_date, progress_rateのみ保存）
const saveTask = async (task) => {
  try {
    const res = await apiFetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: {
          start_date: task.start_date,
          due_date: task.due_date,
          progress_rate: task.progress_rate
        }
      })
    });

    if (!res.ok) {
      console.error("API保存失敗", await res.json());
    }
  } catch (err) {
    console.error("通信エラー", err);
  }
};

// 以下、ProjectDetail定義部分
// メインコンポーネント
const ProjectDetail = ({ user }) => {
  const { id } = useParams();
  const sensors = useSensors(useSensor(PointerSensor));

  // 各種state
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [zoom, setZoom] = useState('day'); // デフォルト日ビュー

  // 初回マウント時にAPI取得
  useEffect(() => {
    fetchProject();
  }, []);

  // プロジェクト詳細＆タスク一覧API取得
  const fetchProject = async () => {
    const res = await apiFetch(`/api/projects/${id}`);
    if (res.ok) {
      const data = await res.json();
      const safeTasks = prepareTasks(data.tasks || []);
      setProject(data);
      setTasks(safeTasks);
      calcDateRange(safeTasks);
    }
  };

  // 日付未登録のタスクにtodayを補完する前処理
  const prepareTasks = (taskList) => {
    const today = dayjs().format("YYYY-MM-DD");
    return taskList.map(t => ({
      ...t,
      start_date: (!t.start_date || t.start_date === "null") ? today : t.start_date,
      due_date: (!t.due_date || t.due_date === "null") ? today : t.due_date
    }));
  };

  // 全タスクの最小〜最大日付範囲を決定
  const calcDateRange = (taskList) => {
    if (taskList.length === 0) {
      const today = dayjs();
      setStartDate(today);
      setEndDate(today);
      return;
    }
    const starts = taskList.map(t => dayjs(t.start_date));
    const ends = taskList.map(t => dayjs(t.due_date));
    const min = dayjs.min(starts);
    const max = dayjs.max(ends);
    setStartDate(min);
    setEndDate(max);
  };

  // 全体日数を計算
  const getTotalDays = () => {
    return endDate.diff(startDate, 'day') + 1;
  };

  // 1タスクの横位置＆横幅計算（px）
  const calcBarStyle = (task) => {
    const taskStart = dayjs(task.start_date);
    const taskEnd = dayjs(task.due_date);
    const offset = taskStart.diff(startDate, 'day');
    const width = taskEnd.diff(taskStart, 'day') + 1;
    return {
      left: `${offset * ZOOM_LEVELS[zoom]}px`,
      width: `${width * ZOOM_LEVELS[zoom]}px`
    };
  };


  // DNDドラッグバー（ドラッグ可能な本体）
  const DraggableBar = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: task.id,
    });

    const offsetX = transform ? transform.x : 0;

    const calcStyle = () => {
      const base = calcBarStyle(task);
      return {
        ...base,
        transform: `translateX(${offsetX}px)`
      };
    };

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`absolute h-6 rounded cursor-pointer ${task.status?.fixed ? 'bg-gray-400' : 'bg-blue-500'}`}
        style={calcStyle()}
      >
        {/* 進捗バー */}
        <div
          className={`h-full rounded-l flex items-center justify-center text-white text-xs font-bold
            ${task.status?.fixed ? 'bg-gray-300' : 'bg-green-400'}`}
          style={{ width: `${getProgressRate(task)}%` }}
        >
          {getProgressRate(task)}%
        </div>

        {/* 両サイドリサイズハンドル＆進捗(progress_rate)リサイズハンドル */}
        <LeftResizeHandle task={task} zoom={zoom} />
        <RightResizeHandle task={task} zoom={zoom} />
        <ProgressResizeHandle task={task} zoom={zoom} startDate={startDate} />
      </div>
    );
  };


  // ドラッグイベント処理（DND側全統括処理）
  const handleDragEnd = (event) => {
    const { active, delta } = event;
    const movedDays = Math.round(delta.x / ZOOM_LEVELS[zoom]);

    // ① 左（start_date）リサイズ
    if (String(active.id).startsWith("resize-left-")) {
      const taskId = Number(active.id.replace("resize-left-", ""));

      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.id === taskId) {
            const newStart = dayjs(task.start_date).add(movedDays, 'day');
            const updatedTask = {
              ...task,
              start_date: newStart.format("YYYY-MM-DD"),
            };

            saveTask(updatedTask);
            return updatedTask;
          } else {
            return task;
          }
        })
      );

    // ② 右(due_date)リサイズ
    } else if (String(active.id).startsWith("resize-right-")) {
      const taskId = Number(active.id.replace("resize-right-", ""));

      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.id === taskId) {
            const newDue = dayjs(task.due_date).add(movedDays, 'day');
            const updatedTask = {
              ...task,
              due_date: newDue.format("YYYY-MM-DD"),
            };

            saveTask(updatedTask);
            return updatedTask;
          } else {
            return task;
          }
        })
      );

    // ③ 進捗率バーリサイズ
    } else if (String(active.id).startsWith("resize-progress-")) {
      const taskId = Number(active.id.replace("resize-progress-", ""));
      const task = tasks.find(t => t.id === taskId);

      const taskStart = dayjs(task.start_date);
      const taskEnd = dayjs(task.due_date);
      const totalDays = taskEnd.diff(taskStart, 'day') + 1;
      const totalWidth = totalDays * ZOOM_LEVELS[zoom];

      const movedPx = delta.x;
      const movedPercent = (movedPx / totalWidth) * 100;

      let newProgress = (task.progress_rate ?? 0) + movedPercent;
      newProgress = Math.max(0, Math.min(100, Math.round(newProgress)));

      const updatedTask = {
        ...task,
        progress_rate: newProgress
      };

      setTasks(prev =>
        prev.map(t => t.id === taskId ? updatedTask : t)
      );

      saveTask(updatedTask);

    // ④ 通常移動(Task全体)
    } else {
      const taskId = Number(active.id);

      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.id === taskId) {
            const newStart = dayjs(task.start_date).add(movedDays, 'day');
            const duration = dayjs(task.due_date).diff(dayjs(task.start_date), 'day');
            const updatedTask = {
              ...task,
              start_date: newStart.format("YYYY-MM-DD"),
              due_date: newStart.add(duration, 'day').format("YYYY-MM-DD"),
            };

            saveTask(updatedTask);
            return updatedTask;
          } else {
            return task;
          }
        })
      );
    }
  };

  // 進捗率取得関数（完了なら常に100%固定）
  const getProgressRate = (task) => {
    return task.status?.fixed ? 100 : (task.progress_rate ?? 0);
  };


  // 左ハンドル
  const LeftResizeHandle = ({ task, zoom }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: `resize-left-${task.id}`
    });

    const offsetX = transform ? transform.x : 0;

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`absolute left-0 top-0 w-2 h-full bg-blue-700 rounded-l cursor-ew-resize ${isDragging ? 'opacity-70' : ''}`}
        style={{
          transform: `translateX(${offsetX}px)`
        }}
      />
    );
  };

  // 右ハンドル
  const RightResizeHandle = ({ task, zoom, onResizeEnd }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: `resize-right-${task.id}`
    });

    const offsetX = transform ? transform.x : 0;

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`absolute right-0 top-0 w-2 h-full bg-blue-700 rounded-r cursor-ew-resize ${isDragging ? 'opacity-70' : ''}`}
        style={{
          transform: `translateX(${offsetX}px)`
        }}
      />
    );
  };


  // 進捗率ハンドル
  const ProgressResizeHandle = ({ task, zoom, startDate }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: `resize-progress-${task.id}`,
    });

    const offsetX = transform ? transform.x : 0;

    // 本体全体の日数
    const taskStart = dayjs(task.start_date);
    const taskEnd = dayjs(task.due_date);
    const totalDays = taskEnd.diff(taskStart, 'day') + 1;
    const totalWidth = totalDays * ZOOM_LEVELS[zoom];

    // progressBarの横幅
    const progressWidth = (task.progress_rate ?? 0) / 100 * totalWidth;

    if (task.status?.fixed) {
      return;

    } else {

      return (
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          className="absolute right-0 top-0 w-2 h-full bg-green-700 rounded-r cursor-ew-resize"
          style={{
            left: `${progressWidth}px`,
            transform: `translateX(${offsetX}px)`
          }}
        />
      );
    }
  };


  // 日付ヘッダー描画ロジック（ズームモード別）
  const renderHeader = () => {
    if (zoom === 'day') {
      return (
        <div className="flex mb-2" style={{ width: `${getTotalDays() * ZOOM_LEVELS[zoom]}px` }}>
          {Array.from({ length: getTotalDays() }).map((_, i) => (
            <div key={i} style={{ width: `${ZOOM_LEVELS[zoom]}px` }} className="text-[10px] text-center text-gray-500 whitespace-nowrap">
              {startDate.add(i, 'day').format('M/D')}
            </div>
          ))}
        </div>
      );
    } else if (zoom === 'week') {
      const totalWeeks = Math.ceil(getTotalDays() / 7);
      return (
        <div className="flex mb-2" style={{ width: `${totalWeeks * ZOOM_LEVELS[zoom] * 7}px` }}>
          {Array.from({ length: totalWeeks }).map((_, i) => {
            const weekStart = startDate.add(i * 7, 'day');
            return (
              <div key={i} style={{ width: `${ZOOM_LEVELS[zoom] * 7}px` }} className="text-[10px] text-center text-gray-500 whitespace-nowrap">
                {weekStart.format('M/D')}週
              </div>
            );
          })}
        </div>
      );
    } else if (zoom === 'month') {
      const totalMonths = endDate.diff(startDate, 'month') + 1;
      return (
        <div className="flex mb-2" style={{ width: `${totalMonths * ZOOM_LEVELS[zoom] * 30}px` }}>
          {Array.from({ length: totalMonths }).map((_, i) => {
            const monthStart = startDate.add(i, 'month');
            return (
              <div key={i} style={{ width: `${ZOOM_LEVELS[zoom] * 30}px` }} className="text-[10px] text-center text-gray-500 whitespace-nowrap">
                {monthStart.format('YYYY/MM')}
              </div>
            );
          })}
        </div>
      );
    }
  };

  // 読み込み判定
  if (!project || !startDate || !endDate) return <p>Loading...</p>;

   // レンダリング本体
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>

    <div className="p-4">
      <h2 className="text-xl mb-2">{project.name}</h2>
      <p className="mb-4 text-gray-700">{project.description}</p>

      {/* ズーム切替UI */}
      <div className="mb-2 flex gap-2">
        <button onClick={() => setZoom('day')} className={`px-3 py-1 rounded ${zoom === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          日
        </button>
        <button onClick={() => setZoom('week')} className={`px-3 py-1 rounded ${zoom === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          週
        </button>
        <button onClick={() => setZoom('month')} className={`px-3 py-1 rounded ${zoom === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          月
        </button>
      </div>

      <div className="overflow-x-auto border p-2">
        {/* ヘッダー（日付軸） */}
        {renderHeader()}

        {/* タスクバー */}
        <div className="relative" style={{ width: `${getTotalDays() * ZOOM_LEVELS[zoom]}px` }}>
          {/* 縦グリッド背景 */}
          <div className="absolute top-0 left-0 h-full" style={{ width: `${getTotalDays() * ZOOM_LEVELS[zoom]}px` }}>
            {Array.from({ length: getTotalDays() }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${i * ZOOM_LEVELS[zoom]}px`,
                  top: 0,
                  bottom: 0,
                  width: "1px",
                  backgroundColor: "#e2e8f0"  // 薄いグレー
                }}
              />
            ))}
          </div>
          {/* タスク群 */}
          {tasks.map(task => (
            <div key={task.id} className="mb-4">
              <div className="text-sm mb-1 px-2 py-1 bg-white shadow rounded w-fit relative z-10">
                {task.title}
              </div>
              {/* DNDドラッグバー */}
              <div className="relative h-6 bg-gray-100">
                <DraggableBar task={task} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </DndContext>
  );
};

export default ProjectDetail;
