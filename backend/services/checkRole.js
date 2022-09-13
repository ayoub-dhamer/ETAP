require("dotenv").config();
const jwt = require("jsonwebtoken");

function checkRole(req, res, next) {
  if (
    res.locals.role == "user" ||
    res.locals.role == "admin" ||
    res.locals.role == "SD" ||
    res.locals.role == "DSP" ||
    res.locals.role == "DG" ||
    res.locals.role == "financier" ||
    res.locals.role == "CL" ||
    res.locals.role == "BOC" ||
    res.locals.role == "DF"
  ) {
    res.sendStatus(401);
  } else {
    next();
  }
}

module.exports = { checkRole: checkRole };
