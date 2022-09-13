const express = require("express");
const router = express.Router();

user = require("../controllers/userController");
var auth = require("../services/auth");

facture = require("../controllers/file");

router.post("/generateFile", auth.authenticateToken, facture.generateFile);
router.post("/add", auth.authenticateToken, facture.add);
router.post("/docx", auth.authenticateToken, facture.docx);
router.get("/getPdf", auth.authenticateToken, facture.getPdf);
router.get("/getPdfSource", auth.authenticateToken, facture.getPdfSource);

router.post("/chefLaboSign", facture.chefLaboSign);
router.post("/sousDirecteurSign", facture.sousDirecteurSign);
router.post("/dspSign", facture.dspSign);

router.get("/getNotSignedFilesForCl", facture.getNotSignedFilesForCl);
router.get("/getNotSignedFilesForSd", facture.getNotSignedFilesForSd);
router.get("/getNotSignedFilesForDsp", facture.getNotSignedFilesForDsp);
router.get("/getAllSignedFiles", facture.getAllSignedFiles);

module.exports = router;
