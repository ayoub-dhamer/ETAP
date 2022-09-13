const express = require("express");
const router = express.Router();

lab = require("../controllers/labController");
var auth = require("../services/auth");

router.post("/add", lab.add);
router.get("/get", lab.get);
router.get("/getLabById/:id", lab.getLabById);
router.patch("/update", lab.update);
router.delete("/delete/:id", auth.authenticateToken, lab.delete);
router.get("/getLabStats", lab.getLabStats);
module.exports = router;
