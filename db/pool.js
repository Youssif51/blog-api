const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.connect()
  .then(client => {
    console.log('Connected to the database!');
    client.release();
  })
  .catch(err => {
    console.error('Connection error', err.stack);
    process.exit(1);
  });

module.exports = pool;
