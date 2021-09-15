const express = require('express')
const nodemailer = require('nodemailer');
const multer = require('multer');
const SMTP_CONFIG = require('./config/smtp')
const path = require('path');
const fs = require('fs');

const app = express()

const port = 3000

const dirPath = path.join(__dirname, '/images');

const fileStorageengine = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './images')
  },

  filename: (req, file, cb) => {
      cb(null, Date.now() + "--" + file.originalname)
  }
})
  
const upload = multer({ storage: fileStorageengine });

app.post('/single', upload.single('image'), (req, res)=> {
  const titulo = req.body.title
  console.log(titulo)
  const getMostRecentFile = (dirPath) => {
    const files = orderRecentFiles(dirPath);
    return files.length ? files[0] : undefined;
  };

  const orderRecentFiles = (dirPath) => {
    return fs
      .readdirSync(dirPath)
      .filter(file => fs.lstatSync(path.join(dirPath, file)).isFile())
      .map(file => ({ file, mtime: fs.lstatSync(path.join(dirPath, file)).mtime }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  };

  const arr = getMostRecentFile(dirPath).file
  
  console.log(getMostRecentFile(dirPath).file, 'file')
  console.log(getMostRecentFile(dirPath).mtime, 'mtime')

  const  transporter = nodemailer.createTransport({
    service: SMTP_CONFIG.service,
      auth: {
        user: SMTP_CONFIG.user,
        pass: SMTP_CONFIG.pass
      }
  });
    
  const email = {
    from: SMTP_CONFIG.user,
    to: 'rdg6design@gmail.com',
    subject: titulo,
    text: titulo,
    html: `<h1>Rodrigo Nogueira</h1>`,
    attachments: [
      {
        filename: arr,
        path: path.join(__dirname, `/images/${arr}`)
      }
    ]
  }
    
  transporter.sendMail(email, (err, result) => {
    if(err) return console.log(err)
    console.log('E-mail enviado com sucesso!!!')
  })
  
    res.send("Single file upload success...")
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
