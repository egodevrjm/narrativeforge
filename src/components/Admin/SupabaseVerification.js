import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabase/supabaseClient';

const SupabaseVerification = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if environment variables are defined
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
        const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase environment variables are missing');
        }
        
        // Try a simple Supabase query
        const { data, error } = await supabase.from('scenarios').select('count()', { count: 'exact' }).limit(1);
        
        if (error) throw error;
        
        setStatus('connected');
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
      <h2>Supabase Connection Status</h2>
      
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
            <p>SUPABASE_URL defined: {process.env.REACT_APP_SUPABASE_URL ? 'Yes' : 'No'}</p>
            <p>SUPABASE_ANON_KEY defined: {process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseVerification;