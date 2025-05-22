'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EditProfileForm from '../components/EditProfileForm';
import { getAllProgress, resetProgress } from '../utils/storageUtils';
import { announceToScreenReader } from '../utils/screenReaderAnnouncer';
import { useAuth } from '../utils/AuthContext';

export default function ProfilePage() {
  const [resetConfirm, setResetConfirm] = useState(false);
  const [progressData, setProgressData] = useState({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect unauthenticated users to login
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
      return;
    }
    
    // Only load data if authenticated
    if (isAuthenticated) {
      // Get progress data
      const allProgress = getAllProgress();
      setProgressData(allProgress);
      
      // Announce page loaded to screen readers
      announceToScreenReader("Profile page loaded");
    }
  }, [isAuthenticated, isLoading, router]);
  
  const handleResetProgress = () => {
    if (resetConfirm) {
      resetProgress();
      setProgressData({});
      setResetConfirm(false);
      announceToScreenReader("All progress has been reset");
      
      // Force reload to update all components
      window.location.reload();
    } else {
      setResetConfirm(true);
      announceToScreenReader("Warning: You are about to reset all your progress. Press the button again to confirm.");
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    announceToScreenReader("Profile editing form opened");
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    announceToScreenReader("Profile editing cancelled");
  };

  const handleProfileUpdated = (updatedUser) => {
    setIsEditingProfile(false);
    announceToScreenReader("Profile updated successfully");
  };
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated after loading, don't render the component
  // (the redirect will happen via the useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">My Profile</h1>
        
        {/* Profile Information Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24 relative">
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden">
                {user?.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full ${user?.profile_image ? 'hidden' : 'flex'} items-center justify-center bg-blue-100 text-blue-600`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-16 pb-6 px-6">
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.fullname || 'Anonymous User'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {user?.email || 'No email provided'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                  </span>
                  {user?.status && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-1 ${
                        user.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleEditProfile}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  aria-label="Edit profile information"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Edit Profile
                </button>
                
                <button 
                  onClick={handleResetProgress}
                  className={`inline-flex items-center px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                    resetConfirm 
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 focus:ring-gray-500 text-gray-800'
                  }`}
                  aria-label={resetConfirm ? "Confirm reset all progress" : "Reset all progress"}
                >
                  {resetConfirm ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                      Confirm Reset
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      Reset Progress
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {user?.created_at && (
              <div className="mt-4 text-sm text-gray-500">
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Member since {new Date(user.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditingProfile && (
          <EditProfileForm 
            onCancel={handleCancelEdit}
            onSuccess={handleProfileUpdated}
          />
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Accessibility Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="font-size" className="block text-gray-700">Font Size</label>
                <select 
                  id="font-size" 
                  className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                  aria-label="Select font size"
                >
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                  <option value="x-large">Extra Large</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="contrast" className="block text-gray-700">High Contrast</label>
                <div className="relative inline-block w-12 align-middle select-none">
                  <input 
                    type="checkbox" 
                    name="contrast" 
                    id="contrast" 
                    className="sr-only"
                    aria-label="Toggle high contrast mode" 
                  />
                  <div className="block bg-gray-300 w-12 h-6 rounded-full"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="animations" className="block text-gray-700">Reduce Animations</label>
                <div className="relative inline-block w-12 align-middle select-none">
                  <input 
                    type="checkbox" 
                    name="animations" 
                    id="animations" 
                    className="sr-only"
                    aria-label="Toggle reduced animations" 
                  />
                  <div className="block bg-gray-300 w-12 h-6 rounded-full"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Link 
                href="/accessibility"
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                More accessibility settings
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Quick Actions
            </h3>
            <div className="space-y-4">
              <Link 
                href="/lessons"
                className="block p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <div className="font-medium">Browse All Lessons</div>
                <div className="text-sm text-gray-600 mt-1">Explore our curriculum</div>
              </Link>
              
              <Link 
                href="/"
                className="block p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <div className="font-medium">Learning Dashboard</div>
                <div className="text-sm text-gray-600 mt-1">View your learning statistics</div>
              </Link>
              
              <Link 
                href="/accessibility"
                className="block p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <div className="font-medium">Accessibility Features</div>
                <div className="text-sm text-gray-600 mt-1">Customize your learning experience</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
