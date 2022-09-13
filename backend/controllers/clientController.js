const nodemailer = require("nodemailer");
const connection = require("../utils/connection");
const jwt = require("jsonwebtoken");

require("dotenv").config();

exports.add = (req, res) => {
  let client = req.body;
  query = "select * from client where email = ? Or fullName = ?";
  connection.query(query, [client.email, client.fullName], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        query =
          "insert into client (fullName, phone, email, fax, adress) values(?,?,?,?,?)";
        connection.query(
          query,
          [
            client.fullName,
            client.phone,
            client.email,
            client.fax,
            client.adress,
          ],
          (err, results) => {
            if (!err)
              return res.status(200).json({ message: "Successfully Added" });
            else return res.status(500).json(err);
          }
        );
      } else {
        return res.status(400).json({ message: "this client already exists" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
};

exports.get = (req, res) => {
  var query = "select * from client";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results);
    else return res.status(500).json(err);
  });
};

exports.getNbOfClients = (req, res) => {
  var query = "select * from client";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results.length);
    else return res.status(500).json(err);
  });
};

exports.getClientStats = (req, res) => {
  var dc = new Date();

  var query = "select * from client";
  connection.query(query, (err, results) => {
    if (!err) {
      //nb = [2, 1, 6, 4, 2, 3, 6, 5, 4, 6, 1, 3];
      var nb = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      var nbTest = 0;
      results.forEach((element) => {
        var query = `select date_creation from bon_commande where id_client = ? and date_creation like '%${dc.getFullYear()}-%' ORDER BY date_creation ASC LIMIT 1`;
        connection.query(query, [element.id], (err, result) => {
          if (!err) {
            if (result.length > 0) {
              var testMonth = JSON.parse(
                JSON.stringify(result[0])
              ).date_creation.split("-")[1];
              if (testMonth == "01" || testMonth == 01) nb[0] = nb[0] + 1;
              if (testMonth == "02" || testMonth == 02) nb[1] = nb[1] + 1;
              if (testMonth == "03" || testMonth == 03) nb[2] = nb[2] + 1;
              if (testMonth == "04" || testMonth == 04) nb[3] = nb[3] + 1;
              if (testMonth == "05" || testMonth == 05) nb[4] = nb[4] + 1;
              if (testMonth == "06" || testMonth == 06) nb[5] = nb[5] + 1;
              if (testMonth == "07" || testMonth == 07) nb[6] = nb[6] + 1;
              if (testMonth == "08" || testMonth == 08) nb[7] = nb[7] + 1;
              if (testMonth == "09" || testMonth == 09) nb[8] = nb[8] + 1;
              if (testMonth == "10" || testMonth == 10) nb[9] = nb[9] + 1;
              if (testMonth == "11" || testMonth == 11) nb[10] = nb[10] + 1;
              if (testMonth == "12" || testMonth == 12) nb[11] = nb[11] + 1;
              nbTest = nbTest + 1;
              if (nbTest == results.length) {
                return res.status(200).json(nb);
              }
            }
          } else return res.status(500).json(err);
        });
      });
    } else return res.status(500).json(err);
  });
};

exports.getClientById = (req, res) => {
  let id = req.params.id;
  var query = "select * from client where id = ?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      return res.status(200).json(results[0]);
    } else return res.status(500).json(err);
  });
};

exports.update = (req, res) => {
  let client = req.body;
  var query =
    "update client set fullName = ?, email = ?, phone = ?, fax = ?, adress = ? where id = ?";
  connection.query(
    query,
    [
      client.fullName,
      client.email,
      client.phone,
      client.fax,
      client.adress,
      client.id,
    ],
    (err, results) => {
      if (!err) {
        if (results.effectedRows == 0) {
          return res.status(404).json({ message: "Client id does not exist" });
        }
        return res
          .status(200)
          .json({ message: "Client infos updated successfully" });
      } else return res.status(500).json(err);
    }
  );
};

exports.delete = (req, res) => {
  const id = req.params.id;
  var query = "delete from client where id = ?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      if (results.effectedRows == 0) {
        return res.status(404).json({ message: "Client id does not exist" });
      }
      return res.status(200).json({ message: "Client deleted successfully" });
    } else {
      return res.status(500).json(err);
    }
  });
};

exports.getClientByName = (req, res) => {
  const name = req.params.name;
  var query = "select * from client where fullName = ?";
  connection.query(query, [name], (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};
