const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongodb = require("mongodb");
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

const connectDB = async () => {
  const connection = await mongoClient.connect(process.env.mongo_URL);
  const db = connection.db("AuthServer");

  return db;
};

const closeConnection = async () => {
  if (connection) {
    await connection.close();
  } else {
    console.log("No connection");
  }
};

const { authenticate } = require("../authenticate");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email,
    pass: process.env.PASSWORD,
  },
});

router.post("/login", async (req, res, next) => {
  try {
    const db = await connectDB();
    const user = await db
      .collection("register")
      .findOne({ email: req.body.email });

    if (user) {
      const compare = await bcrypt.compare(req.body.password, user.password);
      if (compare) {
        const token = await jwt.sign(
          { _id: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        res.json({ message: "success", token });
        // await closeConnection();
      } else {
        // console.log(res)
        res.status(422).json("Invalid credentials");
      }
    } else {
      res.status(403).json("User not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong");
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const db = await connectDB();
    var { name, email, password, cpassword } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const hash1 = await bcrypt.hash(cpassword, salt);

    const present = await db.collection("register").findOne({ email: email });

    if (!present) {
      const user = await db.collection("register").insertOne({
        name: name,
        email: email,
        password: hash,
        cpassword: hash1,
      });
      res.status(200).json({ message: "User Registered successfully" });
      //  await closeConnection();
    } else {
      res.status(403).json("User already exist");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

router.get("/validUser", authenticate, async (req, res) => {
  try {
    const db = await connectDB();

    const user = await db
      .collection("register")
      .findOne({ _id: mongodb.ObjectId(req.id) });

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Something went wrong on validate user" });
  }
});

router.post("/sendpasswordlink", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(401).json({ message: "Enter your email" });
  }

  try {
    const db = await connectDB();
    const user = await db.collection("register").findOne({ email: email });

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    // console.log("token",token);

    const setUser = await db
      .collection("register")
      .findOneAndUpdate(
        { _id: mongodb.ObjectId(user._id) },
        { $set: { verifyToken: token } }
      );

    // console.log(setUser);

    if (setUser) {
      const mailOption = {
        from: process.env.email,
        to: email,
        subject: "Password reset link",
        text: `Valid only upto 2 minutes :  https://socia-oauth.netlify.app/reset-password/${user._id}/${token}`,
      };

      transporter.sendMail(mailOption, (err, info) => {
        if (err) {
          console.log(err);
          res.status(401).json("Enter a valid email");
        } else {
          console.log("Email Send", info.response);
          res.status(200).json({ message: "email sent successfully" });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json(error);
  }
});

router.get("/resetpassword/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  try {
    const db = await connectDB();
    const validUser = db
      .collection("register")
      .findOne({ _id: mongodb.ObjectId(id) });

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

    console.log(verifyToken);
    if (validUser && verifyToken.email) {
      res.status(200).json({ message: "valid user" });
    } else {
      res.status(401).json({ message: "Invalid user" });
    }
  } catch (error) {
    res.status(401).json({ message: "Something went wrong" });
  }
});

router.post("/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  try {
    const db = await connectDB();
    const validUser = db
      .collection("register")
      .findOne({ _id: mongodb.ObjectId(id) });

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

    console.log(verifyToken);
    if (validUser && verifyToken._id) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      const hash1 = await bcrypt.hash(req.body.cpassword, salt);

      const setNewPassword = await db
        .collection("register")
        .findOneAndUpdate(
          { _id: mongodb.ObjectId(id) },
          { $set: { password: hash, cpassword: hash1 } }
        );

      res.status(201).json({ message: "Password reset successfull" });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ message: "Something went wrong" });
  }
});

module.exports = router;
