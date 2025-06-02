import React, { createContext, useState, useCallback } from 'react';
import Modal from '../common/Modal';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalProps, setModalProps] = useState(null);

  const showModal = useCallback(({ title, message, onConfirm }) => {
    setModalProps({ title, message, onConfirm });
  }, []);

  const hideModal = useCallback(() => setModalProps(null), []);

  const handleConfirm = () => {
    if (modalProps?.onConfirm) modalProps.onConfirm();
    hideModal();
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modalProps && (
        <Modal
          title={modalProps.title}
          message={modalProps.message}
          onConfirm={handleConfirm}
          onCancel={hideModal}
        />
      )}
    </ModalContext.Provider>
  );
};
