import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = process.env.NODE_ENV === 'test'
  ? new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    })
  : new Sequelize(
      process.env.DB_NAME || 'nolimit_intern',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        dialectOptions: {
          connectTimeout: 60000,
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
          evict: 1000 
        }
      }
    );

export default sequelize;
