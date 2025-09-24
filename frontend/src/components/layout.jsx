import React from 'react';
import Header from './header.jsx';
import Footer from './footer.jsx';

const Layout = ({ 
  children, 
  currentPage = 'home', 
  isLoggedIn = false, 
  onLogin, 
  onLogout,
  showHeader = true,
  showFooter = true
}) => {
  return (
    <div className="layout">
      {showHeader && (
        <Header 
          currentPage={currentPage}
          isLoggedIn={isLoggedIn}
          onLogin={onLogin}
          onLogout={onLogout}
        />
      )}
      
      <main className="main-content">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;