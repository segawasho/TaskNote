// ProjectDetail.jsx
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



const ZOOM_LEVELS = {
  day: 50,
  week: 20,
  month: 8
};

const saveTask = async (task) => {
  try {
    const res = await apiFetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: {
          start_date: task.start_date,
          due_date: task.due_date
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

const ProjectDetail = ({ user }) => {
  const { id } = useParams();
  const sensors = useSensors(useSensor(PointerSensor));

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [zoom, setZoom] = useState('day'); // デフォルト日ビュー

  useEffect(() => {
    fetchProject();
  }, []);

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

  const prepareTasks = (taskList) => {
    const today = dayjs().format("YYYY-MM-DD");
    return taskList.map(t => ({
      ...t,
      start_date: (!t.start_date || t.start_date === "null") ? today : t.start_date,
      due_date: (!t.due_date || t.due_date === "null") ? today : t.due_date
    }));
  };

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

  const getTotalDays = () => {
    return endDate.diff(startDate, 'day') + 1;
  };

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


  // DNDドラッグ対応バー
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
        className="absolute bg-blue-500 h-6 rounded cursor-pointer"
        style={calcStyle()}
      >
        {/* 両サイドにハンドル追加 */}
        <LeftResizeHandle task={task} zoom={zoom} />
        <RightResizeHandle task={task} zoom={zoom} />
      </div>
    );
  };


  const handleDragEnd = (event) => {
    const { active, delta } = event;
    const movedDays = Math.round(delta.x / ZOOM_LEVELS[zoom]);

    // 通常移動 or リサイズの判定
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



  // 日付ヘッダー描画ロジック
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

  if (!project || !startDate || !endDate) return <p>Loading...</p>;

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
          {/* 背景の縦線 */}
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
          {/* バー */}
          {tasks.map(task => (
            <div key={task.id} className="mb-4">
              <div className="text-sm mb-1 px-2 py-1 bg-white shadow rounded w-fit relative z-10">
                {task.title}
              </div>
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
