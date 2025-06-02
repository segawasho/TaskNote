import React, { createContext, useState, useCallback } from 'react';
import Toast from '../common/Toast';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </ToastContext.Provider>
  );
};

  // 呼び出す際は下記をコンポーネントreturn内にて記述
  // const { showToast } = useContext(ToastContext);
  // showToast('ログインしました', 'success');
