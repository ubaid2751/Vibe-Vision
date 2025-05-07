const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    analysisHistory: [{
        timestamp: { type: Date, default: Date.now },
        emotions: { type: Object, required: true } // Store emotions like { happy: 60, sad: 40 }
    }]
});

const userModel = mongoose.model("User", userSchema);

module.exports = { userModel };

