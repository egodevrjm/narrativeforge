import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import SimpleSupabaseCheck from './SimpleSupabaseCheck';
import DirectCheck from './DirectCheck';
import SupabaseService from '../../services/supabase/supabaseService';
import './AdminStyles.css';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log('Admin component loaded');

  // Check if user is already authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const user = await SupabaseService.getCurrentUser();
      
      if (user) {
        const isAdmin = await SupabaseService.isAdmin();
        setIsAuthenticated(isAdmin);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await SupabaseService.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f44336', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
        ADMIN PAGE
      </div>
      <DirectCheck />
      {isAuthenticated ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </div>
  );
};

export default Admin;