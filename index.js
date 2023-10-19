const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const nodemailer = require('nodemailer'); // Import nodemailer
const app = express();

// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name for storage
  },
});

// Create a multer instance with the storage options
const upload = multer({ storage: storage });

// Enable bodyParser middleware for parsing JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Enable CORS for your server (customize origin based on your needs)
app.use(cors());

app.get('/', (req, res) => {
  res.json({message: 'server up and running'});
});

// Define a route to handle the form submission
app.post('/zamangric-application-form', upload.fields([{ name: 'image' }, { name: 'document' }]), (req, res) => {
  // Access form fields and uploaded files in req.body and req.files
  const country = req.body.country;
  const membershipType = req.body.membershipType;
  const fullnames = req.body.fullnames;
  const email = req.body.email;
  const phone = req.body.phone;
  const address = req.body.address;
  const dob = req.body.dob;
  const imageFile = req.files.image[0]; // Access the image file
  const documentFile = req.files.document[0]; // Access the document file

  console.log('Processing Application Form (Server-side): ', req.body, req.files);

  try {
    // Save the files to your desired location, e.g., in the 'uploads/' directory
  fs.writeFileSync(`uploads/${imageFile.originalname}`, imageFile.buffer);
  fs.writeFileSync(`uploads/${documentFile.originalname}`, documentFile.buffer);

  } catch (error) {
    console.log('Error writing files: ', error)
  }finally{
      // Configure nodemailer to send the email
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: "katongobupe444@gmail.com",
      pass: "aqbm rche vjnf gbbu",
    },
  });

  const mailOptions = {
    from: 'katongobupe444@gmail.com', // Replace with your Hotmail email
    to: 'katongobupe@hotmail.com', // Recipient email
    subject: `ZAMANGRIC Membership Application: ${membershipType}`,
    html: `
      <html>
      <body>
        <h2>ZAMANGRIC Membership Application: ${membershipType}</h2>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Membership Type:</strong> ${membershipType}</p>
        <p><strong>Full Names:</strong> ${fullnames}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Date of Birth:</strong> ${dob}</p>
        <p><strong>Image:</strong></p>
        <img src="cid:unique-image-name" alt="Image">
      </body>
      </html>
    `,
    attachments: [
      { filename: imageFile.originalname, path: `uploads/${imageFile.originalname}`, cid: 'unique-image-name' },
      { filename: documentFile.originalname, path: `uploads/${documentFile.originalname}`, cid: 'unique-document-name' },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email could not be sent:', error);
      res.status(500).json({message: 'Error sending email', status: 'failed'});
    } else {
      console.log('Email sent:', info.response);
      res.status(200).json({message: 'Application Submitted!', status: 'success'});
    }
  });
  }
  

});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
