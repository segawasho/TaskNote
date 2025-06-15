import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from './icon/home.png';
import MemoIcon from './icon/memo.png';
import AddIcon from './icon/plus.png';
import TaskIcon from './icon/task.png';
import SettingIcon from './icon/setting.png';

import AddModal from './AddModal';
import NewTaskForm from './NewTaskForm';
import NewMemoForm from './NewMemoForm';

const FooterNav = ({ user }) => {
  const location = useLocation();

  const [showAddModal, setShowAddModal] = useState(false);
  const [mode, setMode] = useState(null); // 'task' or 'memo'

  const navItems = [
    { path: '/', label: 'ホーム', icon: HomeIcon },
    { path: '/memos', label: 'ノート', icon: MemoIcon },
    { path: null, label: '追加', icon: AddIcon, action: () => setShowAddModal(true) },
    { path: '/tasks', label: 'タスク', icon: TaskIcon },
    { path: '/settings', label: '設定', icon: SettingIcon },
  ];

  const handleSelect = (selectedMode) => {
    setMode(selectedMode);
  };

  const handleClose = () => {
    setShowAddModal(false);
    setMode(null);
  };

  const handleNavClick = (path) => {
    setShowAddModal(false);
    setMode(null);
  };


  return (
    <>
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-gray-100 border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
        <nav className="flex justify-between px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const handleClick = item.action || (() => {});

            return item.path ? (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 py-2 text-xs ${
                  isActive ? 'text-indigo-300 font-semibold' : 'text-gray-600'
                }`}
                onClick={() => handleNavClick(item.path)}
              >
                <img src={item.icon} alt={item.label} className="w-6 h-6 mb-1" />
                <span>{item.label}</span>
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center justify-center flex-1 py-2 text-xs text-gray-600"
              >
                <img src={item.icon} alt={item.label} className="w-6 h-6 mb-1" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </footer>

      {showAddModal && !mode && (
        <AddModal
          isOpen={showAddModal}
          onClose={handleClose}
          onSelect={handleSelect}
        />

      )}

      {showAddModal && mode === 'task' && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg flex flex-col h-[80%]">
            <div className="px-4 py-2 border-b">
              <h2 className="text-base font-bold">タスク追加</h2>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <NewTaskForm user={user} onComplete={handleClose} />
            </div>

            <div className="px-4 py-3 border-t flex justify-between">
              <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-300 rounded text-sm">戻る</button>
              <button form="taskForm" type="submit" className="px-6 py-2 bg-green-600 text-white rounded text-sm">登録</button>
            </div>
          </div>
        </div>
      )}




      {showAddModal && mode === 'memo' && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-lg flex flex-col h-[80%]">

            <div className="px-4 py-2 border-b">
              <h2 className="text-base font-bold">ノート追加</h2>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <NewMemoForm user={user} onComplete={handleClose} />
            </div>

            <div className="px-4 py-3 border-t flex justify-between">
              <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-300 rounded text-sm">戻る</button>
              <button form="memoForm" type="submit" className="px-6 py-2 bg-green-600 text-white rounded text-sm">登録</button>
            </div>
          </div>
        </div>
      )}


    </>
  );
};

export default FooterNav;
