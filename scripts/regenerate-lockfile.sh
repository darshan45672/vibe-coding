#!/bin/bash

# Script to regenerate package-lock.json with new dependencies

echo "🔧 Regenerating package-lock.json for React 19 compatibility..."

# Remove old lock file
rm -f package-lock.json

# Clear npm cache
npm cache clean --force

# Install dependencies fresh
echo "📦 Installing dependencies..."
npm install

echo "✅ Dependencies installed successfully!"
echo "📋 Installed packages:"
npm list --depth=0

echo ""
echo "🚀 Ready to commit and push to trigger CI/CD pipeline!"
echo ""
echo "Next steps:"
echo "1. git add ."
echo "2. git commit -m 'fix: regenerate package-lock.json for React 19 compatibility'"
echo "3. git push origin CICD"
