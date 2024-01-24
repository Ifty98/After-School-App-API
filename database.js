const { MongoClient } = require('mongodb');
//mongoDB atlas databse url
const url = 'mongodb+srv://ifty98:Iftynumber2@user1.spl3a5v.mongodb.net/';

let db;

//function to connect to the database
async function connectToDatabase() {
  try {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB');
    //connect to school app database
    db = client.db('school');

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}
//function to retrieve the MongoDB database instance
function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase first.');
  }
  return db;
}

module.exports = {
  connectToDatabase,
  getDb,
};
