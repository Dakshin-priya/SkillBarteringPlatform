import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-teal-600 text-white p-4 text-center">
        <h1 className="text-4xl font-bold">Skill Bartering Platform</h1>
        <p className="mt-2">Exchange skills with ease!</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 bg-white text-teal-600 p-2 rounded hover:bg-gray-200"
        >
          Get Started
        </button>
      </header>
      <section className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Welcome to the Marketplace</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Browse Services</h3>
            <p>Find skills to barter for.</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Offer Skills</h3>
            <p>Share your expertise.</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">Match & Trade</h3>
            <p>Connect with others.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;