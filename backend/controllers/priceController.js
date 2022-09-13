const connection = require("../utils/connection");
const jwt = require("jsonwebtoken");

require("dotenv").config();

exports.add = (req, res) => {
  let price = req.body;
  query = "select * from price where code = ? and des = ?";
  connection.query(query, [price.code, price.des], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        query = "insert into price (price, code, unit, des) values(?,?,?,?)";
        connection.query(
          query,
          [price.price, price.code, price.unit, price.des],
          (err, results) => {
            if (!err)
              return res.status(200).json({ message: "Successfully Added" });
            else return res.status(500).json(err);
          }
        );
      } else {
        return res.status(400).json({ message: "this service already exists" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
};

exports.get = (req, res) => {
  var query = "select * from price";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results);
    else return res.status(500).json(err);
  });
};

exports.update = (req, res) => {
  let user = req.body;
  var query =
    "update price set price = ?, code = ?, unit = ?, des = ? where id = ?";
  connection.query(
    query,
    [user.price, user.code, user.unit, user.des, user.id],
    (err, results) => {
      if (!err) {
        if (results.effectedRows == 0) {
          return res.status(404).json({ message: "Price does not exist" });
        }
        return res.status(200).json({ message: "Price updated successfully" });
      } else return res.status(500).json(err);
    }
  );
};

exports.getNbOfServices = (req, res) => {
  var query = "select * from price";
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results.length);
    } else return res.status(500).json(err);
  });
};

exports.delete = (req, res) => {
  const id = req.params.id;
  console.log(id);
  var query = "delete from price where id = ?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      if (results.effectedRows == 0) {
        return res.status(404).json({ message: "Price does not exist" });
      }
      return res.status(200).json({ message: "Price deleted successfully" });
    } else {
      return res.status(500).json(err);
    }
  });
};

exports.getPriceById = (req, res) => {
  let id = req.params.id;
  var query = "select * from price where id = ?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      return res.status(200).json(results[0]);
    } else return res.status(500).json(err);
  });
};
