// フッターからのタスク追加モーダルで即時反映させるための記述
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await apiFetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    };
    fetchTasks();
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, setTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
