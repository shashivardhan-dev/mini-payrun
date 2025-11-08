import React, { ReactNode } from 'react';
import Sidebar from "@components/Sidebar";
import "./Layout.css"; 


interface LayoutProps {
  children: ReactNode;
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-content">{children}</div>
    </div>
  );
};

export default Layout;
