import React from 'react';
import Header from './Header';
import FooterNav from './FooterNav';

const PageLayout = ({ user, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-14">
      <Header user={user} />
      <main className="flex-grow px-3 pb-6" style={{ paddingTop: 'calc(3rem + env(safe-area-inset-top))' }}>
        {children}
      </main>
      {user && <FooterNav user={user} className="block md:hidden" />}
    </div> // 👆 md以上で非表示
  );
};

export default PageLayout;
