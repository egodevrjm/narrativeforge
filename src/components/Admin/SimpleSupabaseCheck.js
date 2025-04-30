import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabase/supabaseClient';
import SupabaseService from '../../services/supabase/supabaseService';

const SimpleSupabaseCheck = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    url: false,
    key: false,
    healthCheck: false
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // First just check if the environment variables are present
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
        const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
        
        setDebugInfo(prev => ({
          ...prev,
          url: !!supabaseUrl,
          key: !!supabaseKey
        }));
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase environment variables are missing');
        }
        
        // Check if we can connect directly to a simple table
        let basicTableConnected = false;
        try {
          const { data, error } = await supabase.from('scenarios').select('id').limit(1);
          if (!error) {
            basicTableConnected = true;
          }
        } catch (tableError) {
          console.log('Basic table check failed:', tableError);
        }
        
        if (basicTableConnected) {
          setDebugInfo(prev => ({ ...prev, healthCheck: true }));
          setStatus('connected');
          return;
        }
        
        // Try to use the health check service
        try {
          const healthData = await SupabaseService.healthCheck();
          console.log('Health check successful:', healthData);
          setDebugInfo(prev => ({ ...prev, healthCheck: true }));
          setStatus('connected');
        } catch (healthErr) {
          console.error('All health checks failed:', healthErr);
          throw healthErr;
        }
      } catch (err) {
        console.error('Supabase connection error:', err);
        setStatus('error');
        setError(err.message);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="supabase-verification">
      <h2>Basic Supabase Connection Test</h2>
      
      {status === 'checking' && (
        <div className="status-checking">
          <p>Checking Supabase connection...</p>
        </div>
      )}
      
      {status === 'connected' && (
        <div className="status-connected">
          <p>✅ Successfully connected to Supabase!</p>
          <p>Your environment variables are correctly configured.</p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="status-error">
          <p>❌ Failed to connect to Supabase</p>
          <p>Error: {error}</p>
          <div className="debug-info">
            <h3>Debug Information:</h3>
            <p>SUPABASE_URL defined: {debugInfo.url ? 'Yes' : 'No'}</p>
            <p>SUPABASE_ANON_KEY defined: {debugInfo.key ? 'Yes' : 'No'}</p>
            <p>Health Check: {debugInfo.healthCheck ? 'Passed' : 'Failed'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleSupabaseCheck;