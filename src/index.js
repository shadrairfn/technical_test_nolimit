import app from './app.js';
import sequelize from './config/database.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('[database]: Connection to database has been established successfully.');

    await sequelize.sync();
    console.log('[database]: All database models synchronized.');

    app.listen(PORT, () => {
      console.log(`[server]: Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[database]: Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
