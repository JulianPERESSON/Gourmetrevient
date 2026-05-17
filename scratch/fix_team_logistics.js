const fs = require('fs');

// 1. dashboard-premium.js
let dash = fs.readFileSync('dashboard-premium.js', 'utf8');
dash = dash.replace(
`    const deliveries = JSON.parse(localStorage.getItem('gourmet_deliveries') || '[]');
    if (deliveries.length === 0) {`,
`    const isDemo = localStorage.getItem('gourmet_demo_mode') === 'true';
    const deliveries = JSON.parse(localStorage.getItem('gourmet_deliveries') || '[]');
    if (deliveries.length === 0 && isDemo) {`
);
dash = dash.replace("const isDemo = localStorage.getItem('gourmet_demo_mode') === 'true';", "// isDemo defined above");

fs.writeFileSync('dashboard-premium.js', dash, 'utf8');
console.log('Updated dashboard-premium.js');

// 2. auth-ui.js
let auth = fs.readFileSync('auth-ui.js', 'utf8');

// Update toggleDemoMode
auth = auth.replace(
`  function toggleDemoMode(enabled) {
    localStorage.setItem('gourmet_demo_mode', enabled ? 'true' : 'false');
    if (!enabled) {
      localStorage.removeItem('gourmet_demo_seeded');
    }`,
`  function toggleDemoMode(enabled) {
    localStorage.setItem('gourmet_demo_mode', enabled ? 'true' : 'false');
    if (!enabled) {
      localStorage.removeItem('gourmet_demo_seeded');
      const userName = (localStorage.getItem('gourmet_current_user') || 'chef').toLowerCase();
      const demoKeys = [
          'gourmet_team_members', \`gourmet_team_members_\${userName}\`, 'gourmet_team_members_chef', 'gourmet_team_members_ju', 'gourmet_team_members_julian',
          'gourmet_staff_leaves', \`gourmet_staff_leaves_\${userName}\`, 'gourmet_staff_leaves_chef', 'gourmet_staff_leaves_ju', 'gourmet_staff_leaves_julian',
          'gourmet_deliveries', \`gourmet_deliveries_\${userName}\`, 'gourmet_deliveries_chef'
      ];
      demoKeys.forEach(k => localStorage.removeItem(k));
    }`
);

// Update resetUserData
auth = auth.replace(
`      // Force clear specific localstorage keys just in case
      const haccpKeys = ['gourmet_haccp_logs', 'gourmetrevient_haccp_temp', 'gourmetrevient_haccp_clean', 'gourmetrevient_haccp_trace', 'gourmetrevient_haccp_reception'];
      haccpKeys.forEach(k => {
          localStorage.removeItem(k);
          localStorage.removeItem(k + '_' + userName);
      });`,
`      // Force clear specific localstorage keys just in case
      const haccpKeys = ['gourmet_haccp_logs', 'gourmetrevient_haccp_temp', 'gourmetrevient_haccp_clean', 'gourmetrevient_haccp_trace', 'gourmetrevient_haccp_reception'];
      haccpKeys.forEach(k => {
          localStorage.removeItem(k);
          localStorage.removeItem(k + '_' + userName);
      });
      
      // Clear team and logistics keys
      const teamKeys = [
          'gourmet_team_members', \`gourmet_team_members_\${userName}\`, 'gourmet_team_members_chef', 'gourmet_team_members_ju', 'gourmet_team_members_julian',
          'gourmet_staff_leaves', \`gourmet_staff_leaves_\${userName}\`, 'gourmet_staff_leaves_chef', 'gourmet_staff_leaves_ju', 'gourmet_staff_leaves_julian',
          'gourmet_deliveries', \`gourmet_deliveries_\${userName}\`, 'gourmet_deliveries_chef'
      ];
      teamKeys.forEach(k => localStorage.removeItem(k));`
);

fs.writeFileSync('auth-ui.js', auth, 'utf8');
console.log('Updated auth-ui.js');
