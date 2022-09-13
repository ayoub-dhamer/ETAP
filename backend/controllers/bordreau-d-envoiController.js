let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
var uuid = require("uuid");
const connection = require("../utils/connection");

require("dotenv").config();

//
const fs = require("fs");

const assert = require("assert");
const { PDFDocument } = require("pdf-lib");

exports.add = (req, res) => {
  const generatedUuid = uuid.v1();
  let data = req.body;
  var date_creation = new Date();
  var dc = "" + date_creation;
  var id = "";

  var query = `select * from bordreau where id like '%/${date_creation.getFullYear()}%'`;
  connection.query(query, (err, results) => {
    if (!err) {
      if (results.length > 0) {
        var minimumId = Number(results[0].id.split("/")[0]);
        results.forEach((element) => {
          if (Number(minimumId < element.id.split("/")[0])) {
            minimumId = Number(element.id.split("/")[0]);
          }
        });
        id = "" + (minimumId + 1) + `/${date_creation.getFullYear()}`;
      } else {
        id = `1/${date_creation.getFullYear()}`;
      }
      query =
        "insert into bordreau (id, file, date_creation, cl_sign, sd_sign, dsp_sign, client_id, bon_commande_id) values (?, ?, ?, ?, ?, ?, ?, ?)";
      connection.query(
        query,
        [
          id,
          generatedUuid,
          date_creation,
          false,
          false,
          false,
          data.client[0].id,
          data.bon_commande_id,
        ],
        (err, results) => {
          if (!err) {
            ejs.renderFile(
              path.join(__dirname, "", "../models/bordreau-d-envoi.ejs"),
              {
                id: id,
                date:
                  dc.split(" ")[0] +
                  " " +
                  dc.split(" ")[1] +
                  " " +
                  dc.split(" ")[2] +
                  " " +
                  dc.split(" ")[3],
                auteur: data.auteur,
                phone: data.client[0].phone,
                fax: data.client[0].fax,
                date_creation: data.date_creation,
                bon_commande_id: data.bon_commande_id,
                clientName: data.client[0].fullName,
              },
              (err, results) => {
                if (err) {
                  return res.status(500).json(err);
                } else {
                  pdf
                    .create(results)
                    .toFile(
                      "./utils/bordreau/" + generatedUuid + ".pdf",
                      function (err, data) {
                        if (err) {
                          return res.status(500).json(err);
                        } else {
                          return res.status(200).json({ uuid: generatedUuid });
                        }
                      }
                    );
                }
              }
            );
          } else {
            return res.status(500).json(err);
          }
        }
      );
    } else return res.status(500).json(err);
  });
};

exports.addSeal = async (req, res) => {
  var file = req.params.file;
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync(`${__dirname}/../utils/bordreau/${file}.pdf`)
  );
  const img = await pdfDoc.embedPng(
    fs.readFileSync(`${__dirname}/../utils/img/etap_seal.png`)
  );

  const pages = await pdfDoc.getPages();
  const firstPage = pages[0];

  //const imagePage = pdfDoc.insertPage(0);
  firstPage.drawImage(img, {
    x: 100,
    y: 760,
    width: 150,
    height: 80,
  });

  const pdfBytes = await pdfDoc.save();
  //const newFilePath = `${__dirname}/../utils/fiche-commande-travaux/e8f33f90-1a68-11ed-9201-db4ddaa7e39c.pdf",".pdf")}-result.pdf`;
  fs.writeFileSync(`${__dirname}/../utils/bordreau/${file}.pdf`, pdfBytes);
  return;
};

exports.chefLaboSign = async (req, res) => {
  var data = req.body;
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync(`${__dirname}/../utils/bordreau/${data.file}.pdf`)
  );
  const img = await pdfDoc.embedJpg(
    fs.readFileSync(`${__dirname}/../utils/img/logo.jpg`)
  );

  const sign = await pdfDoc.embedPng(
    fs.readFileSync(`${__dirname}/../utils/img/sign-cl1.png`)
  );

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  //const imagePage = pdfDoc.insertPage(0);
  firstPage.drawImage(img, {
    x: 60,
    y: 750,
    width: 450,
    height: 66,
  });

  firstPage.drawImage(sign, {
    x: 225,
    y: 320,
    width: 50,
    height: 25,
  });

  const pdfBytes = await pdfDoc.save();
  //const newFilePath = `${__dirname}/../utils/fiche-commande-travaux/e8f33f90-1a68-11ed-9201-db4ddaa7e39c.pdf",".pdf")}-result.pdf`;
  fs.writeFileSync(`${__dirname}/../utils/bordreau/${data.file}.pdf`, pdfBytes);

  query = "update bordreau set file = ?, cl_sign = ? where id = ?";
  connection.query(query, [data.file, 1, data.id], (err, results) => {
    if (!err) {
      return res.status(200).json({ message: "Bordreau updated successfully" });
    } else return res.status(500).json(err);
  });
};

//

exports.sousDirecteurSign = async (req, res) => {
  var data = req.body;
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync(`${__dirname}/../utils/bordreau/${data.file}.pdf`)
  );
  const img = await pdfDoc.embedJpg(
    fs.readFileSync(`${__dirname}/../utils/img/logo.jpg`)
  );

  const sign = await pdfDoc.embedPng(
    fs.readFileSync(`${__dirname}/../utils/img/sign-sd.png`)
  );

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  //const imagePage = pdfDoc.insertPage(0);
  firstPage.drawImage(img, {
    x: 60,
    y: 750,
    width: 450,
    height: 66,
  });

  firstPage.drawImage(sign, {
    x: 320,
    y: 320,
    width: 50,
    height: 25,
  });

  const pdfBytes = await pdfDoc.save();
  //const newFilePath = `${path.basename("../utils/file/e8f33f90-1a68-11ed-9201-db4ddaa7e39c.pdf",".pdf")}-result.pdf`;
  fs.writeFileSync(`${__dirname}/../utils/bordreau/${data.file}.pdf`, pdfBytes);

  query = "update bordreau set file = ?, sd_sign = ? where id = ?";
  connection.query(query, [data.file, 1, data.id], (err, results) => {
    if (!err) {
      return res.status(200).json({ message: "Bordreau updated successfully" });
    } else return res.status(500).json(err);
  });
};

///

exports.dspSign = async (req, res) => {
  var data = req.body;
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync(`${__dirname}/../utils/bordreau/${data.file}.pdf`)
  );
  const img = await pdfDoc.embedJpg(
    fs.readFileSync(`${__dirname}/../utils/img/logo.jpg`)
  );

  const sign = await pdfDoc.embedPng(
    fs.readFileSync(`${__dirname}/../utils/img/sign-dsp.png`)
  );

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  //const imagePage = pdfDoc.insertPage(0);
  firstPage.drawImage(img, {
    x: 60,
    y: 750,
    width: 450,
    height: 66,
  });

  firstPage.drawImage(sign, {
    x: 410,
    y: 320,
    width: 50,
    height: 25,
  });

  const pdfBytes = await pdfDoc.save();
  //const newFilePath = `${path.basename("../utils/file/e8f33f90-1a68-11ed-9201-db4ddaa7e39c.pdf",".pdf")}-result.pdf`;
  fs.writeFileSync(`${__dirname}/../utils/bordreau/${data.file}.pdf`, pdfBytes);

  query = "update bordreau set file = ?, dsp_sign = ? where id = ?";
  connection.query(query, [data.file, 1, data.id], (err, results) => {
    if (!err) {
      return res.status(200).json({ message: "Bordreau updated successfully" });
    } else return res.status(500).json(err);
  });
};

exports.getNotSignedFilesForCl = (req, res) => {
  var user = req.body;
  var query = "select * from bordreau where cl_sign = 0";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results);
    else return res.status(500).json(err);
  });
};

exports.getNotSignedFilesForSd = (req, res) => {
  var user = req.body;
  var query = "select * from bordreau where sd_sign = 0";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results);
    else return res.status(500).json(err);
  });
};

exports.getNotSignedFilesForDsp = (req, res) => {
  var user = req.body;
  var query = "select * from bordreau where dsp_sign = 0";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results);
    else return res.status(500).json(err);
  });
};

exports.getAllSignedFiles = (req, res) => {
  var user = req.body;
  var query =
    "select * from bordreau where cl_sign = 1 and sd_sign = 1 and dsp_sign = 1";
  connection.query(query, (err, results) => {
    if (!err) {
      console.log(results);
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};
