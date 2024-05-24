const express = require('express');
const bodyParser = require('body-parser');
const walletRoutes = require('./routes/walletRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api/wallet', walletRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
