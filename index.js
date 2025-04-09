const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Initialize Express
const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Parse incoming JSON requests

// MongoDB connection (Replace with your MongoDB URI)
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'game_db'
});

// Define the player schema
const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  level: { type: Number, required: true }
});

// Create the player model
const Player = mongoose.model('Player', playerSchema);

// API to save or update player's level
app.post('/savePlayerData', async (req, res) => {
  const { username, level } = req.body;

  if (!username || level === undefined) {
    return res.status(400).json({ message: 'Username and level are required' });
  }

  try {
    // Find player by username and update their level, or create new player
    let player = await Player.findOneAndUpdate(
      { username },
      { level },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Player data saved', player });
  } catch (error) {
    res.status(500).json({ message: 'Error saving player data', error });
  }
});

// API to get player's level
app.get('/getPlayerData/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const player = await Player.findOne({ username });

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    res.status(200).json({ username: player.username, level: player.level });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving player data', error });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
