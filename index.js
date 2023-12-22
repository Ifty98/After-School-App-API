const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

const mongoURI = 'mongodb+srv://ifty98:Iftynumber2@user1.spl3a5v.mongodb.net/';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB Atlas', err);
  });

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello, MongoDB Atlas!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});