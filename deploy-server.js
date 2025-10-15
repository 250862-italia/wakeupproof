const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Handle all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'standalone.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 WakeUpProof Server running on port ${PORT}`);
    console.log(`📱 Open: http://localhost:${PORT}`);
    console.log(`🌐 Ready for deployment!`);
});
