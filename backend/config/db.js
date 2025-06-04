const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb+srv://wallissonsccp:<db_password>@cluster0.q71h2rv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    );
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erro: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
