const express = require("express");
const router = express.Router();

var auth = require("../services/auth");

bordreau = require("../controllers/bordreau-d-envoiController");

router.post("/add", bordreau.add);
router.get("/addSeal/:file", bordreau.addSeal);

router.post("/chefLaboSign", bordreau.chefLaboSign);
router.post("/sousDirecteurSign", bordreau.sousDirecteurSign);
router.post("/dspSign", bordreau.dspSign);

router.get("/getNotSignedFilesForCl", bordreau.getNotSignedFilesForCl);
router.get("/getNotSignedFilesForSd", bordreau.getNotSignedFilesForSd);
router.get("/getNotSignedFilesForDsp", bordreau.getNotSignedFilesForDsp);
router.get("/getAllSignedFiles", bordreau.getAllSignedFiles);

module.exports = router;
