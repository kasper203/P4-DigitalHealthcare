const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const journalsRouter = require('./routes/journals');
const testresultRouter = require('./routes/testresult');

app.use('/api/testresults', testresultRouter);
app.use('/api/journals', journalsRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});