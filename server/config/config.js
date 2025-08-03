const config = {
  development: {
    port: process.env.PORT || 5003,
    mongodbUri: process.env.MONGODB_URI || 'mongodb+srv://ssswar367:dg3KCnDEGnsNO3Nl@cluster0.zm5ukgt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    jwtSecret: process.env.JWT_SECRET || 'transport_ministry_super_secret_key_2024_secure',
    jwtExpire: process.env.JWT_EXPIRE || '30d',
    cookieExpire: process.env.COOKIE_EXPIRE || 30,
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
  },
  production: {
    port: process.env.PORT || 5002,
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    cookieExpire: process.env.COOKIE_EXPIRE || 7,
    clientUrl: process.env.CLIENT_URL || 'https://ministryoftransport-client.vercel.app'
  }
};

const env = process.env.NODE_ENV || 'development';

module.exports = config[env]; 