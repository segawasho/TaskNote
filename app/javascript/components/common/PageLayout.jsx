import React from 'react';
import Header from './Header';
import FooterNav from './FooterNav';

const PageLayout = ({ user, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-14">
      <Header user={user} />
      <main className="min-h-[calc(100vh-3.5rem-3.5rem)] px-4 py-8">{children}</main>
      {user && <FooterNav user={user} className="block md:hidden" />}
    </div> // 👆 md以上で非表示
  );
};

export default PageLayout;
