import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    title: 'Transfer Land',
    description: 'Easily transfer land ownership with secure and transparent digital processes.',
    icon: '🔄',
  },
  {
    title: 'Add New Land',
    description: 'Register new land properties quickly and efficiently online.',
    icon: '🌍',
  },
  {
    title: 'Building Permission',
    description: 'Apply for and track building permissions for your land projects.',
    icon: '🏗️',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-100 to-white flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 text-center py-20 px-4 bg-gradient-to-br from-blue-700 to-blue-400 text-white relative">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg animate-fade-in">Empowering Your Land Management Journey</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-fade-in-delay">
          Experience seamless, secure, and digital land services—transfer ownership, register new land, and apply for building permissions all in one place.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center animate-fade-in-delay2">
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg shadow hover:bg-blue-100 transition-colors text-lg"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-700 border border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors text-lg"
          >
            Login
          </button>
        </div>
        {/* Decorative SVG */}
        <svg className="absolute bottom-0 left-0 w-full h-24 text-white opacity-30" viewBox="0 0 1440 320"><path fill="currentColor" fillOpacity="1" d="M0,224L48,197.3C96,171,192,117,288,117.3C384,117,480,171,576,197.3C672,224,768,224,864,197.3C960,171,1056,117,1152,101.3C1248,85,1344,107,1392,117.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-10">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-blue-50 rounded-xl p-8 shadow hover:shadow-lg transition-all text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-blue-700 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to experience digital government services?</h3>
        <button
          onClick={() => navigate('/register')}
          className="bg-white text-blue-700 font-semibold px-10 py-3 rounded-lg shadow hover:bg-blue-100 transition-colors text-lg"
        >
          Sign Up Now
        </button>
      </section>
    </div>
  );
};

export default LandingPage; 