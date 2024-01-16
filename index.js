// index.js
const express = require('express');
const { connectToDatabase, getDb } = require('./db'); // Adjust the path accordingly

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectToDatabase();

app.get('/', async (req, res) => {
  try {
    const db = getDb();
    
    // Perform MongoDB operations here
    const result = await db.collection('lessons').find({}).toArray();

    res.json(result);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
