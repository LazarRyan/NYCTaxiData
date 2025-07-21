#!/bin/bash

echo "🔧 NYC Taxi Analytics Dashboard - Environment Setup"
echo "=================================================="
echo ""

echo "📋 To get your Supabase credentials:"
echo "1. Go to https://supabase.com/dashboard"
echo "2. Select your project (or create a new one)"
echo "3. Go to Settings > API"
echo "4. Copy the 'Project URL' and 'anon public' key"
echo ""

echo "🔗 Supabase Project URL:"
echo "   - This looks like: https://your-project-id.supabase.co"
read -p "Enter your Supabase Project URL: " supabase_url

echo ""
echo "🔑 Supabase Anon Key:"
echo "   - This is a long string starting with 'eyJ...'"
read -p "Enter your Supabase Anon Key: " supabase_key

echo ""
echo "📝 Updating .env.local file..."

# Create the .env.local file with the provided credentials
cat > .env.local << EOF
# Supabase Configuration
# Get these values from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=$supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_key

# Optional: Database connection for direct PostgreSQL access
# DATABASE_URL=postgresql://username:password@host:port/database
EOF

echo "✅ Environment variables updated!"
echo ""
echo "🔍 Verifying configuration..."
echo "NEXT_PUBLIC_SUPABASE_URL: $supabase_url"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabase_key:0:20}..."

echo ""
echo "🚀 You can now:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Run './deploy-to-vercel.sh' to deploy to Vercel"
echo ""
echo "📚 For more information, see: VERCEL_DEPLOYMENT.md" 