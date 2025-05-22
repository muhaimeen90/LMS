'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../utils/AuthContext';

export default function CreateLessonPage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'text',
    difficulty: 'beginner',
    grade: 'grade9',
    material: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { isAuthenticated, isTeacher, isAdmin, isLoading, user } = useAuth();
  const router = useRouter();

  // Debug logs
  useEffect(() => {
    console.log('User object:', user);
    console.log('isTeacher:', isTeacher);
    console.log('isAdmin:', isAdmin);
    console.log('user role:', user?.role);
  }, [user, isTeacher, isAdmin]);

  // Check if user has permission to access this page
  useEffect(() => {
    // Don't redirect if still loading
    if (isLoading) {
      return;
    }
    
    // Check if the user has proper roles
    const hasAccess = isTeacher || isAdmin;
    
    // Only redirect if the user definitely doesn't have access
    if (!hasAccess) {
      console.log('Access denied, redirecting to lessons page');
      router.push('/lessons');
    }
  }, [isTeacher, isAdmin, isLoading, router, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      material: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!isAuthenticated || (!isTeacher && !isAdmin)) {
      setError('You do not have permission to create lessons.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Create FormData for the API request
      const apiFormData = new FormData();
      apiFormData.append('title', formData.title);
      apiFormData.append('content', formData.content);
      apiFormData.append('type', formData.type);
      apiFormData.append('difficulty', formData.difficulty);
      apiFormData.append('grade', formData.grade);
      if (formData.material) {
        apiFormData.append('material', formData.material);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: apiFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to create lessons.');
        } else {
          throw new Error(data.message || 'Failed to create lesson');
        }
      }

      // Show success message and reset form
      setSuccess(true);
      setFormData({
        title: '',
        content: '',
        type: 'text',
        difficulty: 'beginner',
        grade: 'grade9',
        material: null,
      });
      
      // Redirect to lessons page after success
      setTimeout(() => {
        router.push('/lessons');
      }, 2000);
    } catch (error) {
      console.error('Error creating lesson:', error);
      setError(error.message || 'An error occurred while creating the lesson');
      
      // If authorization error, redirect to login
      if (error.message.includes('session') || error.message.includes('log in')) {
        setTimeout(() => {
          router.push('/auth');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Lesson</h1>
        
        {/* Access denied message */}
        {!isTeacher && !isAdmin && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>Access denied. You must be a teacher or administrator to create lessons.</p>
            <button 
              onClick={() => router.push('/lessons')}
              className="mt-2 text-blue-600 hover:underline"
            >
              Return to lessons
            </button>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>Lesson created successfully! You will be redirected to the lessons page shortly.</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {(isTeacher || isAdmin) && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter lesson title"
                minLength={3}
                maxLength={100}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter lesson content"
                minLength={10}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="video">Video</option>
                  <option value="interactive">Interactive</option>
                </select>
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level <span className="text-red-500">*</span>
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Grade dropdown */}
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                  Grade <span className="text-red-500">*</span>
                </label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="grade9">Grade 9</option>
                  <option value="grade10">Grade 10</option>
                  <option value="grade11">Grade 11</option>
                  <option value="grade12">Grade 12</option>
                  <option value="undergraduate">Undergraduate</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Material (optional)
              </label>
              <input
                type="file"
                id="material"
                name="material"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload files related to the lesson (videos, images, documents)
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/lessons')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating...' : 'Create Lesson'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}