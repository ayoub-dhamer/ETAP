const express = require("express");
var cors = require("cors");
const userRoute = require("./routes/user");
const fileRoute = require("./routes/file");
const priceRoute = require("./routes/price");
const clientRoute = require("./routes/client");
const signRoute = require("./routes/sign");
const labRoute = require("./routes/lab");
const bonCommandeRoute = require("./routes/bon-commande");
const bordreauRoute = require("./routes/bordreau");
const commandeTravauxRoute = require("./routes/commande-travaux");
const app = express();

const connection = require("./utils/connection");
const multer = require("multer");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/user", userRoute);
app.use("/file", fileRoute);
app.use("/price", priceRoute);
app.use("/client", clientRoute);
app.use("/sign", signRoute);
app.use("/lab", labRoute);
app.use("/bon-commande", bonCommandeRoute);
app.use("/bordreau", bordreauRoute);
app.use("/commande-travaux", commandeTravauxRoute);

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "uploads");
  },
  filename: (req, file, callBack) => {
    callBack(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

//let upload = multer({ dest: 'uploads/' })

app.post("/file/:email", upload.single("file"), (req, res, next) => {
  const email = req.params.email;

  const file = req.file;

  if (!file) {
    const error = new Error("No File");
    error.httpStatusCode = 400;
    return next(error);
  }
  query = "update user set image = ? where email = ?";
  connection.query(query, [file.filename, email], (err, results) => {
    if (!err) {
      res.send(file);
    } else return res.status(500).json(err);
  });
});

app.get("/getImage/:path", (req, res) => {
  res.download("uploads/" + req.params.path);
});

app.get("/getSign/:path", (req, res) => {
  res.download("utils/img/" + req.params.path);
});

app.get("/getImageSource/:email", (req, res) => {
  const email = req.params.email;
  var query = "select * from user where email = ?";
  connection.query(query, [email], (err, results) => {
    if (!err) {
      for (var i = 0; i < results.length; i++) {
        results[i].password = cryptr.decrypt(results[i].password);
      }
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
});

module.exports = app;
