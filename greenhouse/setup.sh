#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")"

echo "Setting up Greenhouse Monitoring System..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Initialize database
echo "Initializing database..."
mkdir -p db
node db/init.js

echo "Setup complete!"
echo "To start the server, run: npm start"
echo "To start the IoT simulator, run: npm run simulate"
