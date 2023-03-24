const GoogleStrategy = require("passport-google-oauth20");
const GithubStrategy = require("passport-github2");
const FacebookStrategy = require("passport-facebook");
const passport = require("passport");
require("dotenv").config();
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

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const db = await connectDB();
      try {
        db.collection("register")
          .findOne({ googleId: profile.id })
          .then((currentUser) => {
            if (currentUser) {
              done(null, currentUser);
            } else {
              db.collection("register")
                .insertOne({
                  name: profile.displayName,
                  googleId: profile.id,
                  thumbnail: profile.photos[0].value,
                })
                .then((newUser) => {
                  done(null, newUser);
                });
            }
          });
      } catch (err) {
        console.log(err);
      }
      // callback(null, profile);
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
      scope: ["profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const db = await connectDB();
      db.collection("register")
        .findOne({ githubId: profile.id })
        .then((currentUser) => {
          if (currentUser) {
            done(null, currentUser);
          } else {
            db.collection("register")
              .insertOne({
                name: profile.displayName,
                githubId: profile.id,
                thumbnail: profile.photos[0].value,
              })
              .then((newUser) => {
                done(null, newUser);
              });
          }
        });
      // callback(null, profile);
    }
  )
);
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "/auth/facebook/callback",
      scope: ["profile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const db = await connectDB();

      db.collection("register")
        .findOne({ faceBookId: profile.id })
        .then((currentUser) => {
          if (currentUser) {
            done(null, currentUser);
          } else {
            db.collection("register")
              .insertOne({
                name: profile.displayName,
                faceBookId: profile.id,
                thumbnail: profile.photos[0].value,
              })
              .then((newUser) => {
                done(null, newUser);
              });
          }
        });
      // callback(null, profile);
    }
  )
);
