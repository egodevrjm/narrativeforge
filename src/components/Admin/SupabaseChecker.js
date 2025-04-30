import React from 'react';
import SimpleSupabaseCheck from './SimpleSupabaseCheck';
import './AdminStyles.css';

const SupabaseChecker = () => {
  return (
    <div className="admin-container">
      <div className="admin-verification-page">
        <h1>NarrativeForge Supabase Connection Test</h1>
        <div className="admin-verification-card">
          <SimpleSupabaseCheck />
        </div>
        
        <div className="admin-verification-help">
          <h2>Having trouble with Supabase connection?</h2>
          <ol>
            <li>
              <strong>Check Environment Variables:</strong> Ensure you've added the following environment variables in Vercel:
              <ul>
                <li><code>REACT_APP_SUPABASE_URL</code> - Your Supabase project URL</li>
                <li><code>REACT_APP_SUPABASE_ANON_KEY</code> - Your Supabase anon key</li>
              </ul>
            </li>
            <li>
              <strong>Redeploy Your Project:</strong> After adding environment variables, redeploy your project in Vercel
            </li>
            <li>
              <strong>Check Supabase Settings:</strong> Make sure your Supabase tables are set up correctly and RLS policies are in place
            </li>
            <li>
              <strong>Verify Browser Console:</strong> Open your browser's developer tools to check for any errors
            </li>
          </ol>
        </div>
        
        <div className="admin-verification-actions">
          <a href="/" className="admin-button">Return to App</a>
          <a 
            href="https://vercel.com/egodevrjms-projects/narrativeforge/settings/environment-variables" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="admin-button primary"
          >
            Go to Vercel Environment Variables
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupabaseChecker;