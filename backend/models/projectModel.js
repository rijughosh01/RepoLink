const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProjectSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  fileId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  repoId: {
    type: Schema.Types.ObjectId,
    ref: "Repository",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Project = mongoose.model("Project", ProjectSchema);
module.exports = Project;