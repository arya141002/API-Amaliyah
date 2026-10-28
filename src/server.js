require('dotenv').config();
const { port } = require('./config/env');
const app = require('./app');

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});