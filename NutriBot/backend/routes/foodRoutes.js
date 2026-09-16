const express = require("express");
const { getFoods } = require("../controllers/foodController");

const router = express.Router();

router.get("/", getFoods);

module.exports = router;
