// フッターからのノート追加モーダルで即時反映させるための記述
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api';

const MemoContext = createContext();

export const MemoProvider = ({ children }) => {
  const [memos, setMemos] = useState([]);

  useEffect(() => {
    const fetchMemos = async () => {
      const res = await apiFetch('/api/memos');
      const data = await res.json();
      setMemos(data);
    };
    fetchMemos();
  }, []);

  return (
    <MemoContext.Provider value={{ memos, setMemos }}>
      {children}
    </MemoContext.Provider>
  );
};

export const useMemos = () => useContext(MemoContext);
