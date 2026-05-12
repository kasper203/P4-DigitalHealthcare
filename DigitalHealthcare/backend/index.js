const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^https:\/\/localhost:\d+$/.test(origin) ||
        origin === process.env.FRONTEND_ORIGIN
      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
  })
);

app.use(express.json());

const journalsRouter = require('./routes/journals');
const testresultRouter = require('./routes/testresult');
const authRouter = require('./routes/auth');
const patientInfoRouter = require('./routes/patientinfo');

app.use('/api/testresults', testresultRouter);
app.use('/api/journals', journalsRouter);
app.use('/api/auth', authRouter);
app.use('/api/patientinfo', patientInfoRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Backend is running' });
});