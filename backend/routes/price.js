const express = require("express");
const router = express.Router();

price = require("../controllers/priceController");
var auth = require("../services/auth");

router.post("/add", price.add);
router.get("/get", price.get);
router.get("/getPriceById/:id", price.getPriceById);
router.get("/getNbOfServices", price.getNbOfServices);
router.patch("/update", price.update);
router.delete("/delete/:id", auth.authenticateToken, price.delete);

module.exports = router;
