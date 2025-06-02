import React from 'react';
import { createPortal } from 'react-dom';

const modalRoot = document.getElementById('modal-root');

const Modal = ({ title, message, onConfirm, onCancel }) => {
  if (!modalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full">
        {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onCancel} className="text-gray-600">キャンセル</button>
          <button
            onClick={onConfirm}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
