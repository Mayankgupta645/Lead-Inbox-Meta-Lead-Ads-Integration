const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dns = require('dns');
const mongoose = require('mongoose');
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lead_inbox';

if (mongoUri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

function getDatabaseName(uri) {
    const configuredName = process.env.MONGODB_DB_NAME;
    if (configuredName && configuredName.trim()) {
        return configuredName.trim();
    }

    try {
        const pathName = new URL(uri).pathname.replace(/^\/+/, '');
        return decodeURIComponent(pathName.split('/')[0]) || 'lead_inbox';
    } catch (error) {
        throw new Error('MONGODB_URI must be a valid MongoDB connection URI');
    }
}

const mongoDbName = getDatabaseName(mongoUri);

async function connectDB() {
    return mongoose.connect(mongoUri, {
        dbName: mongoDbName,
        serverSelectionTimeoutMS: 10000,
    });
}

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
});

mongoose.connection.on('disconnected', () => {
    console.error('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});


module.exports = { mongoose, connectDB };