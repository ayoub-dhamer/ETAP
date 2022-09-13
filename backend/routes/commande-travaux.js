const express = require("express");
const router = express.Router();

user = require("../controllers/userController");
var auth = require("../services/auth");

fiche_commande_travaux = require("../controllers/fiche-commande-travauxController");

router.post("/add", auth.authenticateToken, fiche_commande_travaux.add);

router.post("/chefLaboSign", fiche_commande_travaux.chefLaboSign);
router.post("/sousDirecteurSign", fiche_commande_travaux.sousDirecteurSign);
router.post("/dspSign", fiche_commande_travaux.dspSign);
router.post("/dgSign", fiche_commande_travaux.dgSign);

router.get(
  "/getNotSignedFilesForCl",
  fiche_commande_travaux.getNotSignedFilesForCl
);
router.get(
  "/getNotSignedFilesForSd",
  fiche_commande_travaux.getNotSignedFilesForSd
);
router.get(
  "/getNotSignedFilesForDsp",
  fiche_commande_travaux.getNotSignedFilesForDsp
);
router.get(
  "/getNotSignedFilesForDg",
  fiche_commande_travaux.getNotSignedFilesForDg
);
router.get("/getAllSignedFiles", fiche_commande_travaux.getAllSignedFiles);

module.exports = router;
