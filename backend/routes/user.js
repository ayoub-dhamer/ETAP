const express = require("express");
const router = express.Router();

user = require("../controllers/userController");
var auth = require("../services/auth");
var checkRole = require("../services/checkRole");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "uploads");
  },
  filename: (req, file, callBack) => {
    callBack(null, `pic_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

router.post("/signup", user.signup);
router.post("/login", user.login);
router.post("/forgotPassword", user.forgotPassword);
router.get("/get", auth.authenticateToken, user.get);
router.get("/getEmployees", user.getEmployees);
router.get("/getSimpleUsers", user.getSimpleUsers); //auth.authenticateToken,checkRole.checkRole,
router.get("/getByEmail", user.getByEmail);
router.get("/getUserById/:id", user.getUserById);
router.get("/getChefLabs", user.getChefLabs);
router.get("/getNbOfEmployees", user.getNbOfEmployees);
router.get("/getUserByName/:name", user.getUserByName);
router.delete("/delete/:id", auth.authenticateToken, user.delete); //auth.authenticateToken,checkRole.checkRole,
router.patch("/update", auth.authenticateToken, user.update); //auth.authenticateToken,checkRole.checkRole,
router.get("/checkToken", auth.authenticateToken, user.checkToken);
router.post("/changePassword", auth.authenticateToken, user.changePassword); //auth.authenticateToken,checkRole.checkRole,
router.post(
  "/changePhoneNumber",
  auth.authenticateToken,
  user.changePhoneNumber
);
router.post("/changeName", auth.authenticateToken, user.changeName);
router.post(
  "/changeImage",
  upload.single("file"),
  auth.authenticateToken,
  user.changeName
);
router.get("/getFullName/:email", auth.authenticateToken, user.getFullName);

module.exports = router;
