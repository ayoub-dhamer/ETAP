const express = require("express");
const router = express.Router();

sign = require("../controllers/signController");
var auth = require("../services/auth");
var checkRole = require("../services/checkRole");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "utils/img/");
  },
  filename: (req, file, callBack) => {
    console.log(file);
    callBack(null, `${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.get("/getSign/:id", sign.getSign);

router.post("/changeSign/:id", upload.single("file"), sign.changeSign);

module.exports = router;
