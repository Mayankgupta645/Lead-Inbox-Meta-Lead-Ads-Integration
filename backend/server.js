const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');
const leadRouter = require('./router/lead.router');
const webhookRouter = require('./router/webhook.router');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = Number(process.env.PORT) || 4000;

app.set('io', io);
app.use(express.json({
  verify: (req, res, buffer) => {
    req.rawBody = Buffer.from(buffer);
  },
}));

app.get('/system', (req, res) => {
  res.status(200).send('System is running');
});

app.use('/api', leadRouter);
app.use('/', webhookRouter);

async function start() {
  try {
    await connectDB();
    server.listen(port, '0.0.0.0', () => {
      console.log(`Lead inbox server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to MongoDB:', error.message);
    process.exitCode = 1;
  }
}

start();
