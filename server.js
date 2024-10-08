require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const nodemailer = require("nodemailer");
const path = require("path");
const bodyParser = require("body-parser");

// Enable CORS for all routes
const corsOptions = {
   // origin: ['https://sri-sairam-crackers.web.app/','http://localhost:3000','https://sri-sairam-crackers.firebaseapp.com/','https://www.srimaheswarigroupofcompanies.in/','https://srisairamcrackers.netlify.app/'], // restrict to this specific domain
   orgin:'https://devacrackers.netlify.app/',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // limit allowed HTTP methods
  credentials: true, // enable cookies if necessary
  optionsSuccessStatus: 200 // response for successful OPTIONS request
};
app.use(cors(corsOptions));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (for images)
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse JSON and urlencoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/placeOrder", async (req, res) => {
  // console.log("hiii");
  // console.log(req.body);
  const {
    cart,
    userData,
    MrpPrice,
    DiscountPrice,
    totalprice,
    nonDiscountedItems,
    grandtotalPrice,
  discount} = req.body;
  // console.log(totalPrice + " " + discount);

  const billData = {
    cart,
    userData,
    MrpPrice,
    DiscountPrice,
    totalprice,
    nonDiscountedItems,
    grandtotalPrice,
    discount
  };

  try {
    // Render the HTML content using the template
    const htmlContent = await renderTemplate("bill", { bill: billData });

    // Send email with the HTML content
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use the service you're using, e.g. Gmail, Yahoo, etc.
      auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PASSWORD
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_ID, // Sender address
      to: [userData.email,process.env.GMAIL_ID], // Recipient's email
      subject: 'Your Order Receipt',
      html: htmlContent, // Set the HTML content as the email body
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).send({ error: "Failed to send email" });
      } else {
        console.log("Email sent: ");
        return res.status(200).send({ message: "Email sent successfully" });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: "Failed to generate email" });
  }
});
console.log(process.env.GMAIL_ID, process.env.GMAIL_PASSWORD);
const renderTemplate = (view, data) => {
  return new Promise((resolve, reject) => {
    app.render(view, data, (err, html) => {
      if (err) return reject(err);
      resolve(html);
    });
  });
};
app.listen(6000, () => {
  console.log("Server running on port 6000");
});
 
