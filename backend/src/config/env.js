import dotenv from 'dotenv';
dotenv.config();
console.log('>>> STRIPE_SECRET_KEY cargada:', process.env.STRIPE_SECRET_KEY ? 'SÍ' : 'NO');
console.log('>>> STRIPE_SECRET_KEY prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 7));

export const config = {
  port: process.env.PORT || 4000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'fitflow2',
  },
  jwtSecret: process.env.JWT_SECRET || 'super_secret_fitflow',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripePrices: {
    ownerSubscription: 9200, // €92 EUR
    branchSubscription: 4500, // €45 EUR
  },
};