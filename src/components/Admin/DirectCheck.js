import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabase/supabaseClient';

const DirectCheck = () => {
  const [status, setStatus] = useState({
    url: 'Checking URL...',
    key: 'Checking key...',
    connection: 'Testing connection...'
  });

  useEffect(() => {
    const checkConnection = async () => {
      // 1. Check environment variables
      const url = process.env.REACT_APP_SUPABASE_URL;
      setStatus(prev => ({ 
        ...prev, 
        url: url ? 'URL is defined ✓' : 'URL is missing ✗' 
      }));

      const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
      setStatus(prev => ({ 
        ...prev, 
        key: key ? 'API key is defined ✓' : 'API key is missing ✗' 
      }));

      if (!url || !key) {
        setStatus(prev => ({ 
          ...prev, 
          connection: 'Cannot connect: missing credentials ✗' 
        }));
        return;
      }

      // 2. Try a very basic connection test
      try {
        // Most basic possible query
        await supabase.auth.getSession();
        setStatus(prev => ({ 
          ...prev, 
          connection: 'Connected to Supabase ✓' 
        }));
      } catch (error) {
        console.error('Connection error:', error);
        setStatus(prev => ({ 
          ...prev, 
          connection: `Connection failed: ${error.message} ✗` 
        }));
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="direct-check">
      <h3>Direct Supabase Connection Check</h3>
      <div className="status-list">
        <div className={`status-item ${status.url.includes('✓') ? 'success' : 'error'}`}>
          {status.url}
        </div>
        <div className={`status-item ${status.key.includes('✓') ? 'success' : 'error'}`}>
          {status.key}
        </div>
        <div className={`status-item ${status.connection.includes('✓') ? 'success' : 'error'}`}>
          {status.connection}
        </div>
      </div>
      
      {!status.connection.includes('✓') && (
        <div className="connection-help">
          <h4>Next Steps:</h4>
          <ol>
            <li>Check that you've added REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your Vercel environment variables</li>
            <li>Verify that your Supabase project is active</li>
            <li>Check the browser console for detailed error messages</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default DirectCheck;