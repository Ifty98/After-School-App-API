const express = require('express');
const bodyParser = require('body-parser');
const { connectToDatabase, getDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectToDatabase();

app.use(bodyParser.json());

app.get('/lessons', async (req, res) => {
  try {
    const db = getDb();
    
    const result = await db.collection('lessons').find({}).toArray();

    res.json(result);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/orders', async (req, res) => {
  try {
    const db = getDb();
    const { name, phoneNumber, lessonIDs, numberOfSpaces } = req.body;
    if (!name || !phoneNumber || !lessonIDs || !numberOfSpaces) {
      return res.status(400).json({ error: 'Please provide all the data requested.' });
    }

    const lessonIDsArray = Array.isArray(lessonIDs) ? lessonIDs : [lessonIDs];

    const newOrder = {
      name,
      phoneNumber,
      lessonIDs: lessonIDsArray,
      numberOfSpaces,
    };

    const result = await db.collection('orders').insertOne(newOrder);

    res.status(201).json({ message: 'Order created successfully', orderId: result.insertedId });
  } catch (error) {
    console.error('Error handling POST request:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.put('/lessons/:lessonId', async (req, res) => {
  try {
    const db = getDb();

    const { lessonId } = req.params;
    const { numberOfSpaces } = req.body;

    if (!lessonId || !numberOfSpaces || isNaN(numberOfSpaces)) {
      return res.status(400).json({ error: 'Invalid request. Please provide lessonId and valid numberOfSpaces.' });
    }

    const result = await db.collection('lessons').updateOne(
      { _id: lessonId },
      { $set: { space: numberOfSpaces } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    res.json({ message: 'Number of available spaces updated successfully.' });
  } catch (error) {
    console.error('Error handling PUT request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
