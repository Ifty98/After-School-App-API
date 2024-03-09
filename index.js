const express = require('express');
const { ObjectId } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { connectToDatabase, getDb } = require('./database');

const app = express();
//middleware function to keep track of all requests made to the server
const myLogger = function (req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectToDatabase();
    //serve static images
    const imagesFolder = path.join(__dirname, 'images');
    app.use('/lesson-images', express.static(imagesFolder));
    //handle not existing image files
    app.use('/lesson-images/:filename', (req, res) => {
      const filename = req.params.filename;
      const imagePath = path.join(imagesFolder, filename);

      res.status(404).send('Image not found');
    });

    app.use(bodyParser.json());
    app.use(cors());
    app.use(myLogger);

    //get request to retrieve all the lessons data
    app.get('/lessons', async (req, res) => {
      try {
        const db = getDb();
        //get all the data from lessons collection
        const result = await db.collection('lessons').find({}).toArray();
        //send the lessons data in json format 
        res.json(result);
      } catch (error) {
        //handle error
        res.status(500).json({ error: 'Server Error' });
      }
    });

    //post request to save a new order in the database
    app.post('/orders', async (req, res) => {
      try {
        const db = getDb();
        //get the data to save from request body
        const { name, phoneNumber, lessonIDs, numberOfSpaces } = req.body;
        const lessonIDsArray = Array.isArray(lessonIDs) ? lessonIDs : [lessonIDs];
        //create a new order object 
        const newOrder = {
          name,
          phoneNumber,
          lessonIDs: lessonIDsArray,
          numberOfSpaces,
        };
        //insert the new order into the orders collection
        const result = await db.collection('orders').insertOne(newOrder);
        res.status(201).json({ message: 'Order created successfully', orderId: result.insertedId });
      } catch (error) {
        res.status(500).json({ error: 'Server Error' });
        //handle error
      }
    });

    //put request to update the spaces of the lesssons
    app.put('/lessons/updateSpaces', async (req, res) => {
      try {
        const db = getDb();
        //get the array of IDs from the request body
        const { lessonIDs } = req.body;

        //convert lesson IDs to ObjectIds
        const lessonObjectIds = lessonIDs.map(id => new ObjectId(id));

        //update the number of spaces for each lesson ID in the array
        const result = await db.collection('lessons').updateOne(
          { _id: { $in: lessonObjectIds } },
          { $inc: { space: -1 } } //decrease the number of spaces by 1
        );

        res.json({ message: 'Number of available spaces updated successfully.' });
      } catch (error) {
        res.status(500).json({ error: 'Server Error' });
        //handle error
      }
    });

    //get request to retrieve all the lessons searched by the user
    app.get('/lessons/search', async (req, res) => {
      try {
        const db = getDb();

        //extract the user input from the query parameters
        const { userInput } = req.query;

        //use the $regex operator for case-insensitive search
        const result = await db.collection('lessons').find({
          $or: [
            { topic: { $regex: userInput, $options: 'i' } },
            { location: { $regex: userInput, $options: 'i' } }
          ]
        }).toArray();

        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        //handle error
      }
    });


    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startServer();