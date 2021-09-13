const express = require('express')
const nodemailer = require('nodemailer');
const multer = require('multer');
const SMTP_CONFIG = require('./config/smtp')
const path = require('path');
const fs = require('fs');

const app = express()
const port = 3000

const dirPath = path.join(__dirname, '/images');

var arr = [];

var files = fs.readdirSync(dirPath);

files.forEach(file => {
  let fileStat = fs.statSync(dirPath + '/' + file).isDirectory();
  if(!fileStat) {
    arr.push(file);
  }
});

console.log(arr,'meu array');
console.log(arr.toString(),'meu array');

const fileStorageengine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images')
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "--" + file.originalname)
    }
})
  
const upload = multer({ storage: fileStorageengine });
console.log(upload, "upload")

app.post('/single', upload.single('image'), (req, res)=> {
    console.log(req.file)
    res.send("Single file upload success...")
})

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
  subject: 'nodemailer + outlook',
  text: 'email enviado com nodemailer.',
  html: '<h1>You can send html formatted content using Nodemailer with attachments</h1>',
  attachments: [
      {
          filename: arr.toString(),
          path: path.join(__dirname, '/images'+ '/' + arr.toString())
      }
    ]
  }
  
  transporter.sendMail(email, (err, result)=>{
    if(err) return console.log(err)
    console.log('Mensagem enviada!!!!')
  })
    

// const directory = 'images';

// fs.readdir(directory, (err, files) => {
//   if (err) throw err;

//   for (const file of files) {
//     fs.unlink(path.join(directory, file), err => {
//       if (err) throw err;
//     });
//   }
// });

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
