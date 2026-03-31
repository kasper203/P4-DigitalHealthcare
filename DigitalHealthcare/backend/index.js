const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

const journalsRouter = require('./routes/journals');
const testresultRouter = require('./routes/testresult');
const authRouter = require("./routes/auth");


app.use('/api/testresults', testresultRouter);
app.use('/api/journals', journalsRouter);
app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});