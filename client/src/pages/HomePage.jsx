import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const ServiceCard = ({ title, description, icon, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
  >
    <div className="text-4xl text-blue-600 mb-4 group-hover:text-blue-700 transition-colors">
      {icon}
    </div>
    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  const handleServiceClick = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/register');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="container mx-auto px-4 h-full flex flex-col justify-center max-w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
            Welcome to Ministry of Transport & Logistics
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto animate-fade-in-delay">
            Your one-stop platform for all transportation services including vehicle registration, 
            driver's license applications, and public transport information.
          </p>
        </div>
          
        <div className="grid md:grid-cols-3 gap-4 mt-6 max-w-6xl mx-auto w-full">
          <ServiceCard
            title="Vehicle service"
            description="Register your vehicle and manage your registration documents online."
            icon="🚗"
            onClick={() => handleServiceClick('/services/vehicles')}
          />
          
          <ServiceCard
            title="Driver Service"
            description="Apply for new licenses, renewals, and track your application status."
            icon="📝"
            onClick={() => handleServiceClick('/services/licenses')}
          />
          
          <ServiceCard
            title="Public Transport"
            description="Get real-time information about public transportation services."
            icon="🚌"
            onClick={() => handleServiceClick('/services/transport')}
          />
        </div>

        <div className="text-center mt-3 animate-fade-in">
          {isAuthenticated ? (
            <>
              <p className="text-gray-600 mb-2">You are logged in</p>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-8 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Log Out Now
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-2">Sign up to access all services</p>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 