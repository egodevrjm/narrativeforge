const { execSync } = require('child_process');

// Force CI=false to prevent warnings from being treated as errors
process.env.CI = 'false';

// Run the build command
execSync('react-scripts build', { stdio: 'inherit' });
