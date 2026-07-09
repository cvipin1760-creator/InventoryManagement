const fs = require('fs');

function fixGrid(file) {
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/<Grid size=\{\{\s*xs:\s*12,\s*md:\s*6\s*\}\}/g, '<Grid item xs={12} md={6}');
    c = c.replace(/<Grid size=\{\{\s*xs:\s*12\s*\}\}/g, '<Grid item xs={12}');
    c = c.replace(/<Grid size=\{\{\s*xs:\s*12,\s*sm:\s*6,\s*md:\s*4\s*\}\}/g, '<Grid item xs={12} sm={6} md={4}');
    c = c.replace(/<Grid size=\{\{\s*xs:\s*12,\s*md:\s*4\s*\}\}/g, '<Grid item xs={12} md={4}');
    fs.writeFileSync(file, c);
}

function fixProps(file) {
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/slotProps=\{\{\s*input:/g, 'InputProps={{');
    c = c.replace(/slotProps=\{\{\s*htmlInput:/g, 'inputProps={{');
    // Ensure nested braces aren't left behind. Example: InputProps={{ { startAdornment: ... } }}
    // But since slotProps={{ input: { startAdornment: ... } }} -> InputProps={{ { startAdornment: ... } }} which is wrong.
    // The original was slotProps={{ input: { startAdornment: ... } }}
    // We want InputProps={{ startAdornment: ... }}
    c = c.replace(/slotProps=\{\{\s*input:\s*\{\s*(.*?)\s*\}\s*\}\}/gs, 'InputProps={{ $1 }}');
    c = c.replace(/slotProps=\{\{\s*htmlInput:\s*\{\s*(.*?)\s*\}\s*\}\}/gs, 'inputProps={{ $1 }}');
    fs.writeFileSync(file, c);
}

const files = [
    'src/pages/PredictiveAnalytics.tsx',
    'src/pages/Register.tsx',
    'src/pages/StockTransfers.tsx',
    'src/pages/SubscriptionBilling.tsx',
    'src/pages/SuperReports.tsx'
];

files.forEach(f => {
    fixGrid(f);
    fixProps(f);
});

console.log('Fixed');
