const http = require('http');
const https = require('https');

const url = 'https://inventorymanagement-afhl.onrender.com/api'; // Your Render backend URL
const intervalMs = 5 * 60 * 1000; // 5 minutes in milliseconds

console.log('� Ping service started - Pinging every 5 mins');

// Function to ping server
function pingServer() {
  const protocol = url.startsWith('https') ? https : http;
  
  const req = protocol.get(url, (res) => {
    res.resume(); // Consume response body to complete the request
  });
  
  req.on('error', (e) => {
    console.error(`🔴 Ping failed: ${e.message.substring(0, 50)}...`);
  });
  
  req.setTimeout(10000, () => {
    req.destroy();
    console.error('🔴 Ping failed: Request timed out');
  });
}

// Initial ping
pingServer();

// Set up interval
setInterval(pingServer, intervalMs);

// Keep process alive
process.stdin.resume();
