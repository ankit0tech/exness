import dotenv from 'dotenv';

dotenv.config();

if(!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environmnet variables');
}

if(!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials are not defined');
}

if(!process.env.DATABASE_URL) {
    throw new Error('Database URL is not present');
}

if(!process.env.FRONTEND_URL) {
    throw new Error('Url for frontend app is not defined');
}

if(!process.env.CORS_ORIGINS) {
    throw new Error('cors origin urls are not defined');
}


export const config = {
    server: {
        port: process.env.PORT || 5555,
        nodeEnv: process.env.NODE_ENV || 'development'
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET,
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }
    },
    database: {
        url: process.env.DATABASE_URL
    },

    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:5173',
        origins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim()),
    },

};
