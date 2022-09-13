const nodemailer = require("nodemailer");
const connection = require("../utils/connection");
const jwt = require("jsonwebtoken");

require("dotenv").config();

/*exports.getSign = (req, res) => {
  if (req.params.path == "CL") {
    res.download("utils/img/sign-cl.png");
  }
  if (req.params.path == "SD") {
    res.download("utils/img/sign-sd.png");
  }
  if (req.params.path == "DSP") {
    res.download("utils/img/sign-dsp.png");
  }
  res.download("utils/img/sign-dc.png");
};*/

exports.getSign = (req, res) => {
  const id = req.params.id;
  var query = "select * from sign where user_id = ?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return null;
      } else {
        res.download(`utils/img/${results[0].file}`);
      }
    } else return res.status(500).json(err);
  });
};

exports.changeSign = (req, res, next) => {
  const id = req.params.id;
  const file = req.file;
  if (!file) {
    const error = new Error("No File");
    error.httpStatusCode = 400;
    return next(error);
  }
  query = "update sign set file = ? where user_id = ?";
  connection.query(query, [file.filename, id], (err, results) => {
    if (!err) {
      res.send(user.file);
    } else return res.status(500).json(err);
  });
};
