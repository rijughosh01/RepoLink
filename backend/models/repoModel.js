const mongoose = require("mongoose");
const { Schema } = mongoose;

const RepositorySchema = new Schema({
  // timestamps: true,
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  content: [
    {
      type: String,
    },
  ],
  visibility: {
    type: String,
    enum: ["public", "private"],
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  issues: [
    {
      type: Schema.Types.ObjectId,
      ref: "Issue",
    },
  ],
  stars: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Repository = mongoose.model("Repository", RepositorySchema);
module.exports = Repository;
