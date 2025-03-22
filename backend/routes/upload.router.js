const express = require("express");
const uploadController = require("../controllers/uploadController");

const uploadRouter = express.Router();

uploadRouter.use("/", uploadController);

module.exports = uploadRouter;