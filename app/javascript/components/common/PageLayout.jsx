import React from 'react';
import Header from './Header';
import FooterNav from './FooterNav';

const PageLayout = ({ user, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-10 pb-14">
      <Header user={user} />
      <main className="flex-grow px-4 pt-4 pb-6">{children}</main>
      {user && <FooterNav user={user} className="block md:hidden" />}
    </div> // 👆 md以上で非表示
  );
};

export default PageLayout;
