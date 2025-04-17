import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Handshake } from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-white text-gray-800">
      <header className="bg-teal-600 text-white py-10 text-center shadow-md">
        <h1 className="text-5xl font-extrabold tracking-wide">Skill Barter</h1>
        <p className="mt-3 text-lg">Exchange skills. Grow together.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-6 px-6 py-2 bg-white text-teal-600 font-semibold rounded-lg shadow-md hover:bg-gray-200 transition"
        >
          Get Started
        </button>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-10">Explore the Marketplace</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <Users className="text-teal-600 w-8 h-8" />
              <h3 className="text-xl font-semibold">Browse Services</h3>
            </div>
            <p className="text-gray-600">Explore a wide range of skills you can exchange for your own.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <Briefcase className="text-teal-600 w-8 h-8" />
              <h3 className="text-xl font-semibold">Offer Skills</h3>
            </div>
            <p className="text-gray-600">List your skills and let others know what you can provide.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <Handshake className="text-teal-600 w-8 h-8" />
              <h3 className="text-xl font-semibold">Match & Trade</h3>
            </div>
            <p className="text-gray-600">Connect with users and make fair exchanges to grow together.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
