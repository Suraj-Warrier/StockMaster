import React from 'react';
import HomeHeader from '../components/HomeHeader'

const Layout = ({ children }) => {
  return (
    <div>
      <HomeHeader />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
