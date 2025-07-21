#!/bin/bash

# NYC Taxi Analytics Dashboard - Vercel Deployment Script
# This script automates the deployment process to Vercel

echo "🚀 NYC Taxi Analytics Dashboard - Vercel Deployment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp env.example .env.local
    echo "📝 Please edit .env.local with your Supabase credentials:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo ""
    echo "🔗 Get your Supabase credentials from:"
    echo "   https://supabase.com/dashboard/project/[YOUR_PROJECT]/settings/api"
    echo ""
    read -p "Press Enter after you've updated .env.local..."
fi

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "📝 You'll be prompted to:"
echo "   1. Login to Vercel (if not already logged in)"
echo "   2. Link to existing project or create new one"
echo "   3. Configure environment variables"
echo ""

vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo "📊 Your dashboard should be live at the URL provided above."
echo ""
echo "📈 Next steps:"
echo "   1. Set up environment variables in Vercel dashboard"
echo "   2. Configure custom domain (optional)"
echo "   3. Enable Vercel Analytics"
echo "   4. Set up monitoring and alerts"
echo ""
echo "📚 For detailed instructions, see: VERCEL_DEPLOYMENT.md" 