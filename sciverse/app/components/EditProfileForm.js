'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { announceToScreenReader } from '../utils/screenReaderAnnouncer';

export default function EditProfileForm({ onCancel, onSuccess }) {
  const { user, updateUserInfo, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    profile_image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rateLimited, setRateLimited] = useState(false);
  const [retryTime, setRetryTime] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        email: user.email || '',
        profile_image: user.profile_image || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Set up a countdown timer for rate limiting
  useEffect(() => {
    let countdown;
    if (rateLimited && retryTime) {
      countdown = setInterval(() => {
        const now = new Date().getTime();
        const timeLeft = retryTime - now;
        
        if (timeLeft <= 0) {
          setRateLimited(false);
          setRetryTime(null);
          clearInterval(countdown);
          setError('');
        }
      }, 1000);
    }
    
    return () => {
      if (countdown) clearInterval(countdown);
    };
  }, [rateLimited, retryTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rateLimited) {
      const timeLeftMs = retryTime - new Date().getTime();
      const minutes = Math.ceil(timeLeftMs / 60000);
      setError(`Please wait approximately ${minutes} minute${minutes !== 1 ? 's' : ''} before trying again.`);
      announceToScreenReader(`Rate limited. Please wait approximately ${minutes} minutes before trying again.`);
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to update your profile');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          setRateLimited(true);
          // Set retry time to 15 minutes from now
          const retryAfter = 15 * 60 * 1000; // 15 minutes in milliseconds
          setRetryTime(new Date().getTime() + retryAfter);
          throw new Error(responseData.error || 'Too many requests. Please try again later.');
        }
        throw new Error(responseData.message || responseData.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully');
      announceToScreenReader('Profile updated successfully');
      
      // Update user context with new data
      if (updateUserInfo && responseData.data) {
        updateUserInfo(responseData.data);
      }
      
      // Call onSuccess callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(responseData.data);
      }
      
      // Auto close edit form after successful update (optional)
      setTimeout(() => {
        if (onCancel) onCancel();
      }, 2000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
      announceToScreenReader(`Error: ${err.message || 'Failed to update profile'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format the retry time for display
  const formatRetryTime = () => {
    if (!retryTime) return '';
    
    const now = new Date().getTime();
    const timeLeft = retryTime - now;
    
    if (timeLeft <= 0) return '';
    
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
          {error}
          {rateLimited && (
            <div className="mt-1">
              <p>You can try again in: <span className="font-medium">{formatRetryTime()}</span></p>
            </div>
          )}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded" role="alert">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="fullname" className="block text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting || rateLimited}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting || isLoading || rateLimited}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="profile_image" className="block text-gray-700 mb-2">Profile Image URL</label>
          <input
            type="text"
            id="profile_image"
            name="profile_image"
            value={formData.profile_image}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting || rateLimited}
          />
        </div>
        
        {formData.profile_image && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
            <img 
              src={formData.profile_image} 
              alt="Profile Preview" 
              className="w-24 h-24 rounded-full object-cover border border-gray-300"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150?text=Invalid+URL";
                e.target.onerror = null;
              }}
            />
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 ${rateLimited ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            disabled={isSubmitting || rateLimited}
          >
            {isSubmitting ? 'Saving...' : rateLimited ? `Retry in ${formatRetryTime()}` : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}