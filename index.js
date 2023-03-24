require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const authRoute = require("./routes/auth");
const cookieSession = require("cookie-session");
const passportStrategy = require("./passport");
const app = express();
const usersRouter = require("./routes/users");
app.use(express.json());
app.set("trust proxy", 1);
app.use(
  cookieSession({
    name: "session",
    keys: ["Y13REASON"],
    maxAge: 24 * 60 * 60 * 100,
    sameSite: "none",
    secure: true,
    httpOnly: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "https://socia-oauth.netlify.app",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/auth", authRoute);
app.use("/users", usersRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listenting on port ${port}...`));
