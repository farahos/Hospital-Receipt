import React from 'react';
import Sidebar from './components/Sidebar';
import { Outlet } from 'react-router-dom';

const App = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar – FIXED, NO SCROLL */}
      <div className="w-64 bg-white shadow-lg h-screen overflow-hidden">
        <Sidebar />
      </div>

      {/* Main Content – scroll ONLY here */}
      <div className="flex-1 p-6 h-screen overflow-y-auto">
        <Outlet />
      </div>

    </div>
  );
};

export default App;
