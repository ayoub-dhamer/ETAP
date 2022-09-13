const connection = require("../utils/connection");
const jwt = require("jsonwebtoken");

require("dotenv").config();

exports.add = (req, res) => {
  let lab = req.body;
  query = "select * from lab where name = ?";
  connection.query(query, [lab.name], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        query = "insert into lab (name, cl_id) values(?,?)";
        connection.query(query, [lab.name, lab.cl_id], (err, results) => {
          if (!err)
            return res.status(200).json({ message: "Successfully Added" });
          else return res.status(500).json(err);
        });
      } else {
        return res.status(400).json({ message: "this Lab already exists" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
};

exports.get = (req, res) => {
  var query = "select * from lab";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results);
    else return res.status(500).json(err);
  });
};

exports.getLabById = (req, res) => {
  let id = req.params.id;
  var query = "select * from lab where id = ?";
  connection.query(query, [id], (err, results) => {
    if (!err) return res.status(200).json(results[0]);
    else return res.status(500).json(err);
  });
};

exports.update = (req, res) => {
  let lab = req.body;
  console.log(lab);
  var query = "update lab set name = ?, cl_id = ? where id = ?";
  connection.query(query, [lab.name, lab.cl_id, lab.id], (err, results) => {
    if (!err) {
      if (results.effectedRows == 0) {
        return res.status(404).json({ message: "Lab does not exist" });
      }
      return res.status(200).json({ message: "Lab updated successfully" });
    } else return res.status(500).json(err);
  });
};

exports.delete = (req, res) => {
  const id = req.params.id;
  var query = "delete from lab where id = ?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      if (results.effectedRows == 0) {
        return res.status(404).json({ message: "Lab does not exist" });
      }
      return res.status(200).json({ message: "Lab deleted successfully" });
    } else {
      return res.status(500).json(err);
    }
  });
};

exports.getLabStats = (req, res) => {
  var query = `select * from fiche`;
  connection.query(query, (err, results) => {
    if (!err) {
      if (results.length > 0) {
        var nb = [0, 0, 0, 0, 0];
        nbTest = 0;
        results.forEach((element) => {
          if (element.entite_concernee == 1) nb[0] = nb[0] + 1;
          if (element.entite_concernee == 2) nb[1] = nb[1] + 1;
          if (element.entite_concernee == 3) nb[2] = nb[2] + 1;
          if (element.entite_concernee == 4) nb[3] = nb[3] + 1;
          if (element.entite_concernee == 5) nb[4] = nb[4] + 1;

          nbTest = nbTest + 1;
          if (nbTest == results.length) {
            return res.status(200).json(nb);
          }
        });
      }
    } else return res.status(500).json(err);
  });
};
