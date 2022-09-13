let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
var uuid = require("uuid");
const connection = require("../utils/connection");

const fs = require("fs");
const docx = require("docx");
const {
  Document,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  ImageRun,
  Media,
  Packer,
  Paragraph,
  VerticalPositionAlign,
  VerticalPositionRelativeFrom,
} = docx;

const assert = require("assert");
const { PDFDocument } = require("pdf-lib");

require("dotenv").config();

exports.add = (req, res) => {
  const generatedUuid = uuid.v1();
  // const orderDetails = req.body;
  // var productDR = JSON.parse(orderDetails.productDetails);
  var cd = new Date();
  let data = req.body;
  var date_creation = new Date();
  var dc = "" + date_creation;
  var id = "";

  var query = `select * from facture where id like '%/${date_creation.getFullYear()}%'`;
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
        "insert into facture (id, facture, date_creation, cl_sign, sd_sign, dsp_sign, client_id, bon_commande) values (?,?,?,?,?,?,?,?)";
      connection.query(
        query,
        [
          id,
          generatedUuid,
          cd,
          false,
          false,
          false,
          data.client_id,
          data.bon_commande,
        ],
        (err, results) => {
          if (!err) {
            ejs.renderFile(
              path.join(__dirname, "", "../models/file.ejs"),
              {
                id: id,
                date: date_creation,
                clientName: data.clientName,
                list: data.list,
                total: data.total,
              },
              (err, results) => {
                if (err) {
                  return res.status(500).json(err);
                } else {
                  pdf
                    .create(results)
                    .toFile(
                      "./utils/file/" + generatedUuid + ".pdf",
                      function (err, data) {
                        if (err) {
                          return res.status(500).json(err);
                        } else {
                          console.log(data);
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

exports.generateFile = (req, res) => {
  const generatedUuid = uuid.v1();

  ejs.renderFile(
    path.join(__dirname, "", "../models/file.ejs"),
    {
      name: "ahmed",
      email: "ahmed@gmail.com",
    },
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      } else {
        pdf
          .create(results)
          .toFile("./utils/" + generatedUuid + ".pdf", function (err, data) {
            if (err) {
              return res.status(500).json(err);
            } else {
              return res.status(200).json({ uuid: generatedUuid });
            }
          });
      }
    }
  );
};

exports.docx = (req, res) => {
  // Documents contain sections, you can have multiple sections per document, go here to learn more about sections
  // This simple example will only contain one section
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                data: fs.readFileSync("utils/logo.jpg"),
                transformation: {
                  width: 500,
                  height: 100,
                },
              }),
            ],
          }),
        ],
      },
    ],
  });

  // Used to export the file into a .docx file
  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("My Document.docx", buffer);
  });
};

exports.getPdf = (req, res) => {
  const pdfPath = "./utils/" + req.body.uuid + ".pdf";
  if (fs.existsSync(pdfPath)) {
    res.contentType("application/pdf");
    fs.createReadStream(pdfPath).pipe(res);
  } else {
    ejs.renderFile(
      path.join(__dirname, "", "../models/file.ejs"),
      {
        name: 300,
      },
      (err, results) => {
        if (err) {
          return res.status(500).json(err);
        } else {
          pdf
            .create(results)
            .toFile("./utils/" + req.body.uuid + ".pdf", function (err, data) {
              if (err) {
                return res.status(500).json(err);
              } else {
                res.contentType("application/pdf");
                fs.createReadStream(pdfPath).pipe(res);
              }
            });
        }
      }
    );
  }
};

exports.getPdfSource = (req, res) => {
  var query = "select * from facture where facture = ?";
  connection.query(
    query,
    ["26205340-1801-11ed-adef-930e3e8617e3"],
    (err, results) => {
      if (!err) {
        return res.status(200).json(results);
      } else return res.status(500).json(err);
    }
  );
};

/*exports.cheLaboSign = async (req, res) => {
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync(
      `${__dirname}/../utils/file/fb9d04c0-18cc-11ed-ba54-e9c57f88f62b.pdf`
    )
  );
  const img = await pdfDoc.embedJpg(
    fs.readFileSync(`${__dirname}/../utils/img/logo.jpg`)
  );

  const sign = await pdfDoc.embedPng(
    fs.readFileSync(`${__dirname}/../utils/img/sign-cl.png`)
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
    x: 80,
    y: 420,
    width: 180,
    height: 50,
  });

  const pdfBytes = await pdfDoc.save();
  const newFilePath = `${path.basename(
    "../utils/file/df669ad0-18c9-11ed-bd44-bfd12587f8e6.pdf",
    ".pdf"
  )}-result.pdf`;
  fs.writeFileSync(newFilePath, pdfBytes);
};*/

exports.chefLaboSign = async (req, res) => {
  var data = req.body;
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync(`${__dirname}/../utils/file/${data.file}.pdf`)
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
  fs.writeFileSync(`${__dirname}/../utils/file/${data.file}.pdf`, pdfBytes);

  query = "update facture set facture = ?, cl_sign = ? where id = ?";
  connection.query(query, [data.file, 1, data.id], (err, results) => {
    if (!err) {
      return res.status(200).json({ message: "Bill updated successfully" });
    } else return res.status(500).json(err);
  });
};

//

exports.sousDirecteurSign = async (req, res) => {
  var data = req.body;
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync(`${__dirname}/../utils/file/${data.file}.pdf`)
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
  fs.writeFileSync(`${__dirname}/../utils/file/${data.file}.pdf`, pdfBytes);

  query = "update facture set facture = ?, sd_sign = ? where id = ?";
  connection.query(query, [data.file, 1, data.id], (err, results) => {
    if (!err) {
      return res.status(200).json({ message: "Bill updated successfully" });
    } else return res.status(500).json(err);
  });
};

///

exports.dspSign = async (req, res) => {
  var data = req.body;
  console.log(data);
  const pdfDoc = await PDFDocument.load(
    fs.readFileSync(`${__dirname}/../utils/file/${data.file}.pdf`)
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
  fs.writeFileSync(`${__dirname}/../utils/file/${data.file}.pdf`, pdfBytes);

  query = "update facture set facture = ?, dsp_sign = ? where id = ?";
  connection.query(query, [data.file, 1, data.id], (err, results) => {
    if (!err) {
      return res.status(200).json({ message: "Bill updated successfully" });
    } else return res.status(500).json(err);
  });
};

exports.getNotSignedFilesForCl = (req, res) => {
  var user = req.body;
  var query = "select * from facture where cl_sign = 0";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results);
    else return res.status(500).json(err);
  });
};

exports.getNotSignedFilesForSd = (req, res) => {
  var user = req.body;
  var query = "select * from facture where sd_sign = 0";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results);
    else return res.status(500).json(err);
  });
};

exports.getNotSignedFilesForDsp = (req, res) => {
  var user = req.body;
  var query = "select * from facture where dsp_sign = 0";
  connection.query(query, (err, results) => {
    if (!err) return res.status(200).json(results);
    else return res.status(500).json(err);
  });
};

exports.getAllSignedFiles = (req, res) => {
  var user = req.body;
  var query =
    "select * from facture where cl_sign = 1 and sd_sign = 1 and dsp_sign = 1";
  connection.query(query, (err, results) => {
    if (!err) {
      console.log(results);
      return res.status(200).json(results);
    } else return res.status(500).json(err);
  });
};
