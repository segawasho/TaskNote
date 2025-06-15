import React from 'react';


const AddModal = ({ isOpen, onClose, onSelect }) => {

  const translateClass = isOpen ? 'translate-y-0' : 'translate-y-full';

  return (
    <>
      {/* 背景オーバーレイ */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* 下からスライドイン */}
      <div
        className={`fixed left-0 w-full bg-white rounded-t-2xl p-6 z-50 transform transition-transform duration-300 ${translateClass}`}
        style={{
          boxShadow: '0px -4px 12px rgba(0,0,0,0.1)',
          bottom: `calc(60px + env(safe-area-inset-bottom))`,
          paddingBottom: `calc(16px + env(safe-area-inset-bottom))`
        }}
      >
        <h2 className="text-lg font-bold mb-4">追加メニュー</h2>
        <div className="flex flex-col gap-4">
          <button onClick={() => onSelect('task')} className="w-full py-3 bg-blue-600 text-white rounded-lg text-base font-semibold">
            タスクを追加
          </button>
          <button onClick={() => onSelect('memo')} className="w-full py-3 bg-green-600 text-white rounded-lg text-base font-semibold">
            メモを追加
          </button>
          <button onClick={onClose} className="w-full py-3 bg-gray-300 text-gray-800 rounded-lg text-base font-semibold">
            キャンセル
          </button>
        </div>
      </div>
    </>
  );
};

export default AddModal;
