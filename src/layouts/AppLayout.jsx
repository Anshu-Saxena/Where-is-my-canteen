import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import BottomNavigation from '../components/layout/BottomNavigation';
import CartConflictModal from '../components/modal/CartConflictModal';
import { useAuth } from '../contexts/AuthContext';

export default function AppLayout() {
  const { role } = useAuth();
  const isStudentRole = ['student', 'staff', 'guest'].includes(role);

  return (
    <div className="min-h-screen bg-brandBg-light dark:bg-brandBg-dark flex text-brandText-primary dark:text-brandText-darkPrimary transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 xl:px-9 py-5 sm:py-7 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
      {isStudentRole && <BottomNavigation />}
      <CartConflictModal />
    </div>
  );
}
