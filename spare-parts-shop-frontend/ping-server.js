const http = require('http');
const https = require('https');

const url = 'https://inventorymanagement-afhl.onrender.com/api'; // Your Render backend URL
const intervalMs = 5 * 60 * 1000; // 5 minutes in milliseconds

console.log('🚀 Starting ping service...');
console.log(`📡 Pinging ${url} every 5 minutes to keep Render awake`);
console.log('--------------------------------------------------------');

// Function to ping server
function pingServer() {
  const protocol = url.startsWith('https') ? https : http;
  
  const req = protocol.get(url, (res) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log(`✅ [${timestamp}] Ping successful - Status: ${res.statusCode}`);
    res.resume(); // Consume response body to complete the request
  });
  
  req.on('error', (e) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.error(`❌ [${timestamp}] Ping failed: ${e.message}`);
  });
  
  req.setTimeout(10000, () => {
    req.destroy();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.error(`❌ [${timestamp}] Ping failed: Request timed out`);
  });
}

// Initial ping
pingServer();

// Set up interval
setInterval(pingServer, intervalMs);

// Keep process alive
process.stdin.resume();
