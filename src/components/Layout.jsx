// src/components/Layout.js
import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-indigo-600">SkillBarter</Link>
          <nav className="space-x-4">
            <Link to="/marketplace" className="text-gray-700 hover:text-indigo-600 transition">Marketplace</Link>
            <Link to="/profile" className="text-gray-700 hover:text-indigo-600 transition">Profile</Link>
            <Link to="/matches" className="text-gray-700 hover:text-indigo-600 transition">Matches</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow px-4 py-6">
        {children}
      </main>

      <footer className="bg-gray-100 text-center text-sm py-3 text-gray-500">
        © 2025 SkillBarter. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
