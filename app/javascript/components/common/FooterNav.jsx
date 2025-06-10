import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from './icon/home.png';
import MemoIcon from './icon/memo.png';
import AddIcon from './icon/plus.png';
import TaskIcon from './icon/task.png';
import SettingIcon from './icon/setting.png';


const FooterNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'ホーム', icon: HomeIcon },
    { path: '/memos', label: 'ノート', icon: MemoIcon },
    { path: '/add', label: '追加', icon: AddIcon },
    { path: '/tasks', label: 'タスク', icon: TaskIcon },
    { path: '/settings', label: '設定', icon: SettingIcon },
  ];

  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 bg-gray-100 border-t border-gray-200">
      <nav className="flex justify-between px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-2 text-xs ${
                isActive ? 'text-indigo-300 font-semibold' : 'text-gray-600'
              }`}
            >
              <img src={item.icon} alt={item.label} className="w-6 h-6 mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};

export default FooterNav;
