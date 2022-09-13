const express = require("express");
const router = express.Router();

client = require("../controllers/clientController");
var auth = require("../services/auth");

router.post("/add", client.add);
router.get("/get", client.get);
router.get("/getClientStats", client.getClientStats);
router.get("/getNbOfClients", client.getNbOfClients);
router.get("/getClientById/:id", client.getClientById);
router.patch("/update", client.update);
router.delete("/delete/:id", auth.authenticateToken, client.delete);
router.get("/getClientByName/:name", client.getClientByName);

module.exports = router;
