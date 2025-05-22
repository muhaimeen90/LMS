'use client';

import { useState, useEffect } from 'react';

/**
 * Fetches and tracks user progress, XP, level, badges, and streak.
 * Returns { data, loading, error }.
 */
export default function useUserProgress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    // Fetch user progress from backend API
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/progress`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch progress');
        return res.json();
      })
      .then(json => {
        if (mounted) {
          setData(json.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
}
