// For more sequelize commands see https://github.com/sequelize/cli#usage
// & https://sequelize.org/v6/manual/migrations.html

const pg = require('pg'); // eslint-disable-line @typescript-eslint/no-var-requires
require('dotenv/config');

module.exports = {
  dialectModule: pg,
  dialect: process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 5432,
  ...(['production'].includes(process.env.NODE_ENV)
    ? {
        dialectOptions: {
          ssl: {
            rejectUnauthorized: false,
            sslmode: 'no-verify',
          },
        },
      }
    : {}),

  seederStorage: 'sequelize',
  migrationStorageTableName: 'sequelize_migrations',
  seederStorageTableName: 'sequelize_seeders',
};
