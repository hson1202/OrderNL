// Script test Cloudinary connection ở local
const { v2: cloudinary } = require('cloudinary')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: './Backend/.env' })

console.log('🔍 Testing Cloudinary Configuration...\n')

// Check environment variables
console.log('📋 Environment Variables:')
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing')
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing')
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing')
console.log('')

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })
  
  console.log('⚙️ Cloudinary configured successfully!')
  
  // Test connection by getting account details
  cloudinary.api.ping()
    .then(result => {
      console.log('🎉 Cloudinary connection test:', result.status === 'ok' ? '✅ SUCCESS' : '❌ FAILED')
      
      // Get account info
      return cloudinary.api.usage()
    })
    .then(resources => {
      console.log('📊 Account Usage:')
      console.log('- Credits used:', resources.credits?.usage || 0)
      console.log('- Storage used:', Math.round((resources.storage?.usage || 0) / 1024 / 1024), 'MB')
      console.log('- Bandwidth used:', Math.round((resources.bandwidth?.usage || 0) / 1024 / 1024), 'MB')
    })
    .catch(error => {
      console.error('❌ Cloudinary connection failed:', error.message)
    })
  
} else {
  console.log('❌ Missing Cloudinary credentials!')
  console.log('\n📝 Setup Instructions:')
  console.log('1. Go to https://cloudinary.com and create account')
  console.log('2. Get your credentials from Dashboard')
  console.log('3. Create Backend/.env file with:')
  console.log('   CLOUDINARY_CLOUD_NAME=your-cloud-name')
  console.log('   CLOUDINARY_API_KEY=your-api-key')
  console.log('   CLOUDINARY_API_SECRET=your-api-secret')
}
