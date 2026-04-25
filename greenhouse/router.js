const fs = require('fs');
const path = require('path');
const url = require('url');

const routes = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {}
};

function addRoute(method, path, handler) {
    routes[method][path] = handler;
}

function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    console.log(`${method} ${pathname}`);

    // Check for API routes
    if (pathname.startsWith('/api')) {
        const handler = routes[method][pathname];
        if (handler) {
            return handler(req, res, parsedUrl.query);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Endpoint not found' }));
        }
    }

    // Serve static files
    let filePath = path.join(__dirname, 'public', pathname === '/' ? 'pages/login.html' : pathname);
    
    // If requesting a page without .html, try adding it (for MPAs)
    if (!path.extname(filePath)) {
        filePath = path.join(__dirname, 'public', 'pages', pathname.substring(1) + '.html');
    }

    fs.exists(filePath, (exists) => {
        if (!exists) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
        }

        const ext = path.extname(filePath);
        let contentType = 'text/html';
        switch (ext) {
            case '.css': contentType = 'text/css'; break;
            case '.js': contentType = 'application/javascript'; break;
            case '.json': contentType = 'application/json'; break;
            case '.png': contentType = 'image/png'; break;
            case '.jpg': contentType = 'image/jpg'; break;
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                return res.end('Server Error');
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    });
}

module.exports = { addRoute, handleRequest };
