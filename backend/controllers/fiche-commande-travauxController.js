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

  var query = "select * from lab where name = ?";
  connection.query(query, [data.entite_concernee], (err, result) => {
    if (!err) {
      var query = `select * from fiche where id like '%/${date_creation.getFullYear()}%'`;
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
            "insert into fiche (id, financier_id, cl_sign, sd_sign, dsp_sign, dg_sign, date_creation, file, objet, entite_concernee, client_id, cl_id, bon_commande_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
          connection.query(
            query,
            [
              id,
              data.financier_id,
              false,
              false,
              false,
              false,
              date_creation,
              generatedUuid,
              data.objet,
              result[0].id,
              data.client_id,
              result[0].cl_id,
              data.bon_commande_id,
            ],
            (err, results) => {
              if (!err) {
                var query =
                  "update bon_commande set processed = 1 where id = ?";
                connection.query(
                  query,
                  [data.bon_commande_id],
                  (err, results) => {}
                );
                console.log();
                ejs.renderFile(
                  path.join(
                    __dirname,
                    "",
                    "../models/fiche-commande-travaux.ejs"
                  ),
                  {
                    id: id,
                    client: "Ahmed",
                    date: new Date().toLocaleString().split(" ")[0],
                    objet: data.objet,
                    entite_concernee: data.entite_concernee,
                    cout: 300.0,
                  },
                  (err, results) => {
                    if (err) {
                      return res.status(500).json(err);
                    } else {
                      pdf
                        .create(results)
                        .toFile(
                          "./utils/fiche-commande-travaux/" +
                            generatedUuid +
                            ".pdf",
                          function (err, data) {
                            if (err) {
                              return res.status(500).json(err);
                            } else {
                              return res
                                .status(200)
                                .json({ uuid: generatedUuid });
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
    } else return res.status(500).json(err);
  });
};

exports.chefLaboSign = async (req, res) => {
  var data = req.body;
  console.log(data);
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync(
      `${__dirname}/../utils/fiche-commande-travaux/${data.file}.pdf`
    )
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
  fs.writeFileSync(
    `${__dirname}/../utils/fiche-commande-travaux/${data.file}.pdf`,
    pdfBytes
  );

  query = "update fiche set file = ?, cl_sign = ? where id = ?";
  connection.query(query, [data.file, 1, data.id], (err, results) => {
    if (!err) {
      return res.status(200).json({ message: "file updated successfully" });
    } else return res.status(500).json(err);
  });
};

//

exports.sousDirecteurSign = async (req, res) => {
  var data = req.body;
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync(
      `${__dirname}/../utils/fiche-commande-travaux/${data.file}.pdf`
    )
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
  fs.writeFileSync(
    `${__dirname}/../utils/fiche-commande-travaux/${data.file}.pdf`,
    pdfBytes
  );

  query = "update fiche set file = ?, sd_sign = ? where id = ?";
  connection.query(query, [data.file, 1, data.id], (err, results) => {
    if (!err) {
      return res.status(200).json({ message: "file updated successfully" });
    } else return res.status(500).json(err);
  });
};

///

exports.dgSign = async (req, res) => {
  var data = req.body;
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync(
      `${__dirname}/../utils/fiche-commande-travaux/${data.file}.pdf`
    )
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
  fs.writeFileSync(
    `${__dirname}/../utils/fiche-commande-travaux/${data.file}.pdf`,
    pdfBytes
  );

  query = "update fiche set file = ?, dg_sign = ? where id = ?";
  connection.query(query, [data.file, 1, data.id], (err, results) => {
    if (!err) {
      return res.status(200).json({ message: "file updated successfully" });
    } else return res.status(500).json(err);
  });
};

exports.dspSign = async (req, res) => {
  var data = req.body;
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync(
      `${__dirname}/../utils/fiche-commande-travaux/${data.file}.pdf`
    )
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
  fs.writeFileSync(
    `${__dirname}/../utils/fiche-commande-travaux/${data.file}.pdf`,
    pdfBytes
  );

  query = "update fiche set file = ?, dsp_sign = ? where id = ?";
  connection.query(query, [data.file, 1, data.id], (err, results) => {
    if (!err) {
      return res.status(200).json({ message: "file updated successfully" });
    } else return res.status(500).json(err);
  });
};

exports.getNotSignedFilesForCl = (req, res) => {
  var user = req.body;
  var query = "select * from fiche where cl_sign = 0";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results);
    else return res.status(500).json(err);
  });
};

exports.getNotSignedFilesForSd = (req, res) => {
  var user = req.body;
  var query = "select * from fiche where sd_sign = 0";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results);
    else return res.status(500).json(err);
  });
};

exports.getNotSignedFilesForDsp = (req, res) => {
  var user = req.body;
  var query = "select * from fiche where dsp_sign = 0";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results);
    else return res.status(500).json(err);
  });
};

exports.getNotSignedFilesForDg = (req, res) => {
  var user = req.body;
  var query = "select * from fiche where dg_sign = 0";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results);
    else return res.status(500).json(err);
  });
};

exports.getAllSignedFiles = (req, res) => {
  var user = req.body;
  var query =
    "select * from fiche where cl_sign = 1 and sd_sign = 1 and dsp_sign = 1 and dg_sign = 1";
  connection.query(query, (err, results) => {
    if (!err) {
      console.log(results);
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};
