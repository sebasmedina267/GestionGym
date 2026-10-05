import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const databasePassword = process.env.DB_PASSWORD || process.env.DB_PASS || '';
const requiredProductionVariables = [
  ['DB_HOST', process.env.DB_HOST],
  ['DB_USER', process.env.DB_USER],
  ['DB_NAME', process.env.DB_NAME],
  ['DB_PASSWORD', databasePassword],
  ['JWT_SECRET', process.env.JWT_SECRET],
  ['STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY],
  ['STRIPE_WEBHOOK_SECRET', process.env.STRIPE_WEBHOOK_SECRET],
  ['SMTP_HOST', process.env.SMTP_HOST],
  ['SMTP_USER', process.env.SMTP_USER],
  ['SMTP_PASS', process.env.SMTP_PASS],
  ['FRONTEND_URL', process.env.FRONTEND_URL],
];
const missingProductionVariables = requiredProductionVariables
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (isProduction && missingProductionVariables.length > 0) {
  throw new Error(
    `Missing required production environment variables: ${missingProductionVariables.join(', ')}`
  );
}

if (isProduction && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must contain at least 32 characters in production');
}

const port = Number(process.env.PORT || 4000);
const databasePort = Number(process.env.DB_PORT || 3306);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

if (!Number.isInteger(databasePort) || databasePort < 1 || databasePort > 65535) {
  throw new Error('DB_PORT must be an integer between 1 and 65535');
}

export const config = {
  port,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: databasePort,
    user: process.env.DB_USER || 'root',
    password: databasePassword,
    database: process.env.DB_NAME || 'fitflow2',
  },
  jwtSecret: process.env.JWT_SECRET || 'super_secret_fitflow',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  frontendUrl: process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173',
  stripePrices: {
    ownerSubscription: 9200, // €92 EUR
    branchSubscription: 4500, // €45 EUR
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT || '587',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'FitFlow <noreply@fitflow.app>'
  }
};