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
  var total = 0;
  var query = `select * from bon_commande where id like '%/${date_creation.getFullYear()}%'`;
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
        "insert into bon_commande (id, file, id_client, date_creation, delivery_date, payment_terms, contact, user_id, processed) values (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      connection.query(
        query,
        [
          id,
          generatedUuid,
          data.client_id,
          date_creation,
          data.delivery_date,
          data.payment_terms,
          data.contact,
          data.user_id,
          false,
        ],
        (err, results) => {
          if (!err) {
            data.list.forEach((item) => {
              total += item.total;
            });
            var query = "select * from client where id = ?";
            connection.query(query, [data.client_id], (err, results) => {
              if (!err) {
                ejs.renderFile(
                  path.join(__dirname, "", "../models/bon-commande.ejs"),
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
                    contact: data.contact,
                    delivery_date: data.delivery_date.substring(0, 10),
                    payment_terms: data.payment_terms,
                    list: data.list,
                    total: total,
                    client: results[0],
                  },
                  (err, results) => {
                    if (err) {
                      return res.status(500).json(err);
                    } else {
                      pdf
                        .create(results)
                        .toFile(
                          "./utils/bon-commande/" + generatedUuid + ".pdf",
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
              } else return res.status(500).json(err);
            });
            data.list.forEach((element) => {
              query =
                "insert into bon_commande_items (id_commande, id_prix, quantite) values (?, ?, ?)";
              connection.query(
                query,
                [id, element.id, element.quantity],
                (err, results) => {
                  if (!err) {
                  } else {
                  }
                }
              );
            });
          } else {
            return res.status(500).json(err);
          }
        }
      );
    } else return res.status(500).json(err);
  });
};

exports.addStamp = async (req, res) => {
  var file = req.params.file;
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync(`${__dirname}/../utils/bon-commande/${file}.pdf`)
  );
  const img = await pdfDoc.embedPng(
    fs.readFileSync(`${__dirname}/../utils/img/etap_stamp.png`)
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
  fs.writeFileSync(`${__dirname}/../utils/bon-commande/${file}.pdf`, pdfBytes);
  return;
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

exports.getNbOfContracts = (req, res) => {
  var query = "select * from bon_commande";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results.length);
    else return res.status(500).json(err);
  });
};

exports.getContractStats = (req, res) => {
  var dc = new Date();

  var query = `select date_creation from bon_commande where date_creation like '%${dc.getFullYear()}-%' ORDER BY date_creation ASC`;
  connection.query(query, (err, results) => {
    if (!err) {
      if (results.length > 0) {
        var testMonth = JSON.parse(
          JSON.stringify(results[0])
        ).date_creation.split("-")[1];
        var nb = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        nbTest = 0;
        results.forEach((element) => {
          if (testMonth == "01") nb[0] = nb[0] + 1;
          if (testMonth == "02") nb[1] = nb[1] + 1;
          if (testMonth == "03") nb[2] = nb[2] + 1;
          if (testMonth == "04") nb[3] = nb[3] + 1;
          if (testMonth == "05") nb[4] = nb[4] + 1;
          if (testMonth == "06") nb[5] = nb[5] + 1;
          if (testMonth == "07") nb[6] = nb[6] + 1;
          if (testMonth == "08") nb[7] = nb[7] + 1;
          if (testMonth == "09") nb[8] = nb[8] + 1;
          if (testMonth == "10") nb[9] = nb[9] + 1;
          if (testMonth == "11") nb[10] = nb[10] + 1;
          if (testMonth == "12") nb[11] = nb[11] + 1;
          nbTest = nbTest + 1;
          if (nbTest == results.length) {
            return res.status(200).json(nb);
          }
        });
      }
    } else return res.status(500).json(err);
  });
};

exports.getProcessedDocStats = (req, res) => {
  var query = `select * from bon_commande`;
  connection.query(query, (err, results) => {
    if (!err) {
      if (results.length > 0) {
        var nb = [0, 0];
        nbTest = 0;
        results.forEach((element) => {
          if (element.processed == 0) nb[0] = nb[0] + 1;
          if (element.processed == 1) nb[1] = nb[1] + 1;

          nbTest = nbTest + 1;
          if (nbTest == results.length) {
            return res.status(200).json(nb);
          }
        });
      }
    } else return res.status(500).json(err);
  });
};

exports.getNotProcessedCommands = (req, res) => {
  var id = req.params.id;
  var query = "select * from bon_commande where processed = ? and user_id = ?";
  connection.query(query, [0, id], (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};

exports.getItems = (req, res) => {
  var nb = req.params.nb;
  var year = req.params.year;
  var query = "select * from bon_commande_items where id_commande = ?";
  connection.query(query, [nb + "/" + year], (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};

exports.getAllCommands = (req, res) => {
  var query = "select * from bon_commande";
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};

exports.getNonDispatchedCommands = (req, res) => {
  var query =
    "select * from bon_commande where id NOT IN (select bon_commande_id from bordreau) and user_id = ? and processed = 1";
  connection.query(query, [req.params.id], (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};

exports.getDispatchedCommands = (req, res) => {
  var query =
    "select * from bon_commande where id IN (select bon_commande_id from bordreau) and user_id = ? and processed = 1 and id NOT IN (select bon_commande from facture)";
  connection.query(query, [req.params.id], (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};

exports.getFinishedCommands = (req, res) => {
  var query =
    "select * from bon_commande where id IN (select bon_commande_id from bordreau) and processed = 1 and id IN (select bon_commande from facture where cl_sign = 1 and dsp_sign = 1 and sd_sign = 1)";
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};

exports.getFctForCommande = (req, res) => {
  var query = "select * from fiche where bon_commande_id = ?";
  connection.query(
    query,
    [req.params.nb + "/" + req.params.year],
    (err, results) => {
      if (!err) {
        return res.status(200).json(results);
      } else return res.status(500).json(err);
    }
  );
};

exports.getBordreauForCommande = (req, res) => {
  var query = "select * from bordreau where bon_commande_id = ?";
  connection.query(
    query,
    [req.params.nb + "/" + req.params.year],
    (err, results) => {
      if (!err) {
        return res.status(200).json(results);
      } else return res.status(500).json(err);
    }
  );
};

exports.getBillForCommande = (req, res) => {
  var query = "select * from facture where bon_commande = ?";
  connection.query(
    query,
    [req.params.nb + "/" + req.params.year],
    (err, results) => {
      if (!err) {
        return res.status(200).json(results);
      } else return res.status(500).json(err);
    }
  );
};

exports.getCommandeById = (req, res) => {
  var query = "select * from bon_commande where id = ?";
  connection.query(
    query,
    [req.params.nb + "/" + req.params.year],
    (err, results) => {
      if (!err) {
        return res.status(200).json(results);
      } else return res.status(500).json(err);
    }
  );
};

exports.getCommandItems = (req, res) => {
  var nb = req.params.nb;
  var year = req.params.year;
  var query = "select * from bon_commande_items where id_commande = ?";
  connection.query(query, [nb + "/" + year], (err, results) => {
    if (!err) {
      console.log(results);
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};
