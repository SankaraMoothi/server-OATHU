const GoogleStrategy = require("passport-google-oauth20");
const GithubStrategy = require("passport-github2");
const FacebookStrategy = require("passport-facebook");
const passport = require("passport");
const { connectDB } = require("./config");

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
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("callback fired");
      console.log(profile);

      const db = await connectDB();

      db.collection("register")
        .findOne({ googleId: profile.id })
        .then((currentUser) => {
          if (currentUser) {
            console.log("Current User :", currentUser);
            done(null, currentUser);
          } else {
            db.collection("register")
              .insertOne({
                name: profile.displayName,
                googleId: profile.id,
                thumbnail: profile.photos[0].value,
              })
              .then((newUser) => {
                console.log("New user created : ", newUser);
                done(null, newUser);
              });
          }
        });
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
      console.log("callback fired");
      console.log(profile);

      const db = await connectDB();

      db.collection("register")
        .findOne({ githubId: profile.id })
        .then((currentUser) => {
          if (currentUser) {
            console.log("Current User :", currentUser);
            done(null, currentUser);
          } else {
            db.collection("register")
              .insertOne({
                name: profile.displayName,
                githubId: profile.id,
                thumbnail: profile.photos[0].value,
              })
              .then((newUser) => {
                console.log("New user created : ", newUser);
                done(null, newUser);
              });
          }
        });
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
      console.log("callback fired");
      console.log(profile);

      const db = await connectDB();

      db.collection("register")
        .findOne({ faceBookId: profile.id })
        .then((currentUser) => {
          if (currentUser) {
            console.log("Current User :", currentUser);
            done(null, currentUser);
          } else {
            db.collection("register")
              .insertOne({
                name: profile.displayName,
                faceBookId: profile.id,
                thumbnail: profile.photos[0].value,
              })
              .then((newUser) => {
                console.log("New user created : ", newUser);
                done(null, newUser);
              });
          }
        });
    }
  )
);
