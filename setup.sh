#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "=========================================="
echo "   NeuralMesh 3D Planner Setup Script     "
echo "=========================================="
echo ""

echo "📦 Installing project dependencies..."
npm install

echo ""
echo "🏗️ Building the application (production bundle)..."
npm run build

echo ""
echo "=========================================="
echo "✅ Setup and Build completed successfully!"
echo "🚀 To run the application in production mode, use:"
echo "   npm start"
echo "=========================================="
