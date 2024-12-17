// frontend/server.js
const express = require('express');
const path = require('path');
const app = express();

// Serve static files with proper MIME types
app.use('/js', express.static(path.join(__dirname, 'src', 'js'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

app.use(express.static('public'));
app.use('/css', express.static(path.join(__dirname, 'src', 'css')));
app.use('/assets', express.static(path.join(__dirname, 'src', 'assets')));

// Handle all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
});
