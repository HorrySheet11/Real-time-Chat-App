const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  message: String,
  sender: String,
  timestamp: { type: Date, default: Date.now },
});

// Cache for models per collection
const modelCache = new Map();

function getModel(collectionName) {
  if (!modelCache.has(collectionName)) {
    modelCache.set(collectionName, mongoose.connection.model(collectionName, chatSchema));
  }
  return modelCache.get(collectionName);
}

module.exports = { getModel, chatSchema };