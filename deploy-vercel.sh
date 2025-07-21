#!/bin/bash

echo "🚀 Deploying NYC Taxi Analytics to Vercel..."

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod --yes

echo "✅ Deployment complete!"
echo "🔗 Your app will be available at the URL shown above"
echo ""
echo "📝 Next steps:"
echo "1. Set up environment variables in Vercel dashboard:"
echo "   - DB_HOST (your PostgreSQL host)"
echo "   - DB_PORT (5432)"
echo "   - DB_NAME (nyc_taxi_data)"
echo "   - DB_USER (your database user)"
echo "   - DB_PASSWORD (your database password)"
echo "2. Connect your database to the deployed app"
echo "3. Test the application" 