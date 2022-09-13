const express = require("express");
const router = express.Router();

var auth = require("../services/auth");

bon_commande = require("../controllers/bon-commandeController");

router.post("/add", bon_commande.add);
router.get("/getNbOfContracts", bon_commande.getNbOfContracts);
router.get("/getContractStats", bon_commande.getContractStats);
router.get("/getProcessedDocStats", bon_commande.getProcessedDocStats);
router.get(
  "/getNotProcessedCommands/:id",
  bon_commande.getNotProcessedCommands
);
router.get("/getAllCommands", bon_commande.getAllCommands);
router.get(
  "/getNonDispatchedCommands/:id",
  bon_commande.getNonDispatchedCommands
);
router.get("/getFctForCommande/:nb/:year", bon_commande.getFctForCommande);
router.get(
  "/getBordreauForCommande/:nb/:year",
  bon_commande.getBordreauForCommande
);
router.get("/getBillForCommande/:nb/:year", bon_commande.getBillForCommande);
router.get("/getItems/:nb/:year", bon_commande.getItems);
router.get("/getCommandeById/:nb/:year", bon_commande.getCommandeById);
router.get("/getDispatchedCommands/:id", bon_commande.getDispatchedCommands);
router.get("/getFinishedCommands", bon_commande.getFinishedCommands);
router.get("/getCommandItems/:nb/:year", bon_commande.getCommandItems);

router.get("/addStamp/:file", bon_commande.addStamp);

module.exports = router;
