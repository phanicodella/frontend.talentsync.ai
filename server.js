// frontend/server.js
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static('public'));
app.use('/js', express.static(path.join(__dirname, 'src/js')));
app.use('/css', express.static(path.join(__dirname, 'src/css')));
app.use('/assets', express.static(path.join(__dirname, 'src/assets')));

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
});