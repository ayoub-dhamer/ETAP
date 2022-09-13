const nodemailer = require("nodemailer");
const connection = require("../utils/connection");
const jwt = require("jsonwebtoken");
var Cryptr = require("cryptr");
cryptr = new Cryptr("devnami");

require("dotenv").config();
exports.signup = (req, res) => {
  let user = req.body;
  query = "select * from user where email = ?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        query =
          "insert into user (fullName, email, phone, role, password) values(?,?,?,?,?)";
        connection.query(
          query,
          [
            user.fullName,
            user.email,
            user.phone,
            user.role,
            cryptr.encrypt(user.password),
          ],
          (err, results) => {
            if (!err)
              return res
                .status(200)
                .json({ message: "Successfully registred" });
            else return res.status(500).json(err);
          }
        );
      } else {
        return res.status(400).json({ message: "email already exists" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
};

exports.login = (req, res) => {
  const user = req.body;
  query = "select * from user where email = ?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (
        results.length <= 0 ||
        cryptr.decrypt(results[0].password) != user.password
      ) {
        return res
          .status(401)
          .json({ message: "incorrect user email or password" });
      } /*else if (results[0].status === "false") {
        return res.status(401).json({ message: "wait for admin approval" });
      }*/ else if (cryptr.decrypt(results[0].password) == user.password) {
        const response = {
          id: results[0].id,
          email: results[0].email,
          role: results[0].role,
          password: cryptr.decrypt(results[0].password),
          phone: results[0].phone,
          fullName: results[0].fullName,
          image: results[0].image,
        };
        const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {
          expiresIn: "8h",
        });
        res.status(200).json({ token: accessToken });
      } else {
        return res
          .status(400)
          .json({ message: "something went wrong, please try again" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
};

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

exports.forgotPassword = (req, res) => {
  const user = req.body;
  query = "select email, password from user where email = ?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res
          .status(200)
          .json({ message: "password sent successfully to your email" });
      } else {
        var mailOptions = {
          from: "ayoubdhamer5@gmail.com",
          to: results[0].email,
          subject: "New User",
          text: "New user just Signed up make sure to give them a role",
          html:
            "<p><b>Your Login details</b><br><b>Email :</b>" +
            results[0].email +
            "<br><b>Password :</b>" +
            cryptr.decrypt(results[0].password) +
            '<br><a href="http://localhost:4200/">Click here to login</a></p>',
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        return res
          .status(200)
          .json({ message: "Password was sent successfully to your email" });
      }
    } else return res.status(500).json(err);
  });
};

exports.get = (req, res) => {
  var query = "select * from user";
  connection.query(query, (err, results) => {
    if (!err) {
      for (var i = 0; i < results.length; i++) {
        results[i].password = cryptr.decrypt(results[i].password);
      }
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};

exports.getEmployees = (req, res) => {
  var query = "select * from user where role = 'user'";
  connection.query(query, (err, results) => {
    if (!err) {
      for (var i = 0; i < results.length; i++) {
        results[i].password = cryptr.decrypt(results[i].password);
      }
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};

exports.getUserById = (req, res) => {
  let id = req.params.id;
  var query = "select fullName from user where id = ?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      return res.status(200).json(results[0]);
    } else return res.status(500).json(err);
  });
};

exports.getSimpleUsers = (req, res) => {
  var query = "select * from user where role = 'user'";
  connection.query(query, (err, results) => {
    if (!err) {
      for (var i = 0; i < results.length; i++) {
        results[i].password = cryptr.decrypt(results[i].password);
      }
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};

exports.getUserByName = (req, res) => {
  const name = req.params.name;
  var query = "select * from user where fullName = ?";
  connection.query(query, [name], (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};

exports.getNbOfEmployees = (req, res) => {
  var query = "select * from user";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results.length);
    else return res.status(500).json(err);
  });
};

//here the not any query

exports.getChefLabs = (req, res) => {
  var query = "select * from user where role = 'CL'";
  connection.query(query, (err, results) => {
    if (!err) {
      for (var i = 0; i < results.length; i++) {
        results[i].password = cryptr.decrypt(results[i].password);
      }
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};

exports.getByEmail = (req, res) => {
  //const email = req.body.email;
  const email = "ayoubdhamer5@gmail.com";
  var query = "select * from user where email = ?";
  connection.query(query, [email], (err, results) => {
    if (!err) {
      return res.status(200).json(results[0]);
    } else return res.status(500).json(err);
  });
};

exports.update = (req, res) => {
  let user = req.body;
  var query = "update user set role = ? where id = ?";
  connection.query(query, [user.role, user.id], (err, results) => {
    if (!err) {
      if (results.effectedRows == 0) {
        return res.status(404).json({ message: "user id does not exist" });
      }
      return res.status(200).json({ message: "user updated successfully" });
    } else return res.status(500).json(err);
  });
};

exports.checkToken = (req, res) => {
  return res.status(200).json({ message: "true" });
};

exports.delete = (req, res) => {
  const id = req.params.id;
  var query = "delete from user where id = ?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      if (results.effectedRows == 0) {
        return res.status(404).json({ message: "user id does not exist" });
      }
      return res.status(200).json({ message: "user deleted successfully" });
    } else {
      return res.status(500).json(err);
    }
  });
};

exports.changePassword = (req, res) => {
  const user = req.body;
  const email = res.locals.email;

  var query = "select * from user where email = ?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res.status(400).json({ message: "Incorrect old Password" });
      } else if (cryptr.decrypt(results[0].password) == user.oldPassword) {
        query = "update user set password = ? where email = ?";
        connection.query(
          query,
          [cryptr.encrypt(user.newPassword), user.email],
          (err, results) => {
            if (!err) {
              return res
                .status(200)
                .json({ message: "Password updated successfully" });
            } else return res.status(500).json(err);
          }
        );
      } else
        return res
          .status(400)
          .json({ message: "Something went wrong, please try again" });
    } else return res.status(500).json(err);
  });
};

exports.changePhoneNumber = (req, res) => {
  const user = req.body;
  const email = res.locals.email;

  var query = "select * from user where email = ?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res.status(400).json({ message: "Incorrect old Password" });
      } else if (cryptr.decrypt(results[0].password) == user.password) {
        query = "update user set phone = ? where email = ?";
        connection.query(
          query,
          [user.newPhoneNumber, user.email],
          (err, results) => {
            if (!err) {
              return res
                .status(200)
                .json({ message: "Phone number updated successfully" });
            } else return res.status(500).json(err);
          }
        );
      } else
        return res
          .status(400)
          .json({ message: "Something went wrong, please try again" });
    } else return res.status(500).json(err);
  });
};

exports.changeName = (req, res) => {
  const user = req.body;
  const email = res.locals.email;
  var query = "select * from user where email = ?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res.status(400).json({ message: "Incorrect old Password" });
      } else if (cryptr.decrypt(results[0].password) == user.password) {
        query = "update user set fullName = ? where email = ?";
        connection.query(query, [user.newName, user.email], (err, results) => {
          if (!err) {
            return res
              .status(200)
              .json({ message: "Name updated successfully" });
          } else return res.status(500).json(err);
        });
      } else
        return res
          .status(400)
          .json({ message: "Something went wrong, please try again" });
    } else return res.status(500).json(err);
  });
};

//freq

//let upload = multer({ dest: 'uploads/' })

exports.changeImage = (req, res, next) => {
  const user = req.body;
  const file = req.file;
  if (!user.file) {
    const error = new Error("No File");
    error.httpStatusCode = 400;
    return next(error);
  }
  query = "update user set image = ? where email = ?";
  connection.query(query, [user.file.filename, user.email], (err, results) => {
    if (!err) {
      res.send(user.file);
    } else return res.status(500).json(err);
  });
};

exports.getFullName = (req, res) => {
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
};
