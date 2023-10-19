require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const cors = require("cors");

const session = require("express-session");
const passport = require("passport");
// no need to add passport local, since it is just required by passport-local-mongoose
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

const bcrypt = require('bcrypt')

const app = express();

// const userSchema = require("./models/UserSelf").userSchema

app.use(cors());

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser());

/**********************************************  chat  *************************************************/

import chat from "./controllers/chat"

const http = require("http").createServer(app);
chat(http);

/**********************************************  database  *************************************************/

const db_name = "CC-Database";
const password = process.env.DB_PASSWORD;
const mongoUrl = `mongodb+srv://Abhay:${password}@cc-cluster.cuuunr3.mongodb.net/${db_name}?retryWrites=true&w=majority`;

// app.use(express.urlencoded({extended:true}))
app.use(session({
   secret: "Our little $ecret.",
   resave: false,
   saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


// mongoose.connect(mongoUrl, { useNewUrlParser: true });
const connectToMongo = () => {
   mongoose.connect(mongoUrl, () => {
      console.log(`Connected To The Mongo ${db_name}   Successfully ^.^`);
   });
};

connectToMongo();
// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
   username: { type: String},
   password: { type: String},

});

userSchema.pre('save', async function (next) {
   if (!this.isModified("password")) {
     next();
   }
 
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);
   next();
 });


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// serialize & deserialize user
passport.serializeUser(function (user, done) {
   done(null, user.id);
});

passport.deserializeUser(function (id, done) {
   User.findById(id, function (err, user) {
      done(err, user);
   });
});

/********************************************  OAuth  ******************************************/

passport.use(new GoogleStrategy({
   clientID: process.env.CLIENT_ID,
   clientSecret: process.env.CLIENT_SECRET,
   callbackURL: "http://localhost:5000/auth/google/home",
   userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
   function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
         return cb(err, user);
      });
   }
));

/*********************************************  APIs  ********************************************/

app.get("/", function (req, res) {
   return res.status(200).json("Hello world");
});

app.get("/auth/google",
   passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/home",
   passport.authenticate("google", { failureRedirect: "/login" }),
   function (req, res) {
      // Successful authentication, redirect home.
      res.redirect("/home");
   });

app.get("/login", function (req, res) {
   res.render("login");
});



// app.get("/secrets", function (req, res) {
//    User.find({ "secret": { $ne: null } }, function (err, foundUser) {
//       if (err) {
//          console.log(err);
//       } else {
//          if (foundUser) {
//             res.render("secrets", { usersWithSecrets: foundUser });
//          }
//       }
//    });
// });

// app.get("/submit", function (req, res) {
//    if (req.isAuthenticated())
//       res.render("submit");
//    else
//       res.redirect("/login");
// });

// app.get("/logout", function (req, res) {
//    req.logout(function () {
//       res.redirect("/");
//    });
// });


app.post("/sign-up", function (req, res) {
   console.log(req.body);
   const {email , password} = req.body;

   User.findOne({username: email}, function (err, foundUser) {
      if (err) {
         console.log(err);
      } else {
         if (foundUser) {
            res.send({message: "User already exits. Please try logging in."});
         }

         const newUser = new User({
            username : email,
            password
         })

         // const user

         newUser.save(function (err, user) {
            if (err) {
               console.log(err);
               // res.redirect("/sign-up");
            }
            else {
               console.log("Hello world");
            
            }
         })
         
         // else{
            // User.register({ username: req.body.email }, req.body.password, function (err, user) {
            //    if (err) {
            //       console.log(err);
            //       // res.redirect("/sign-up");
            //    }
            //    else {
            //       passport.authenticate("local")(req, res, function () {
            //          // res.redirect("/");
            //          console.log("Hello world");
            //       });
            //    }
            // });
         // }
      }
   });

});

// app.post("/login", function (req, res) {
//    const user = new User({
//       email: req.body.email,
//       password: req.body.password
//    });

//    req.login(user, function (err) {
//       if (err)
//          console.log(err);
//       else {
//          passport.authenticate("local")(req, res, function () {
//             res.redirect("/secrets");
//          });
//       }
//    });

// });

// app.post("/submit", function (req, res) {
//    const newSecret = req.body.secret;

//    User.findById(req.user.id, function (err, foundUser) {
//       if (err) {
//          console.log(err);
//       } else {
//          if (foundUser) {
//             foundUser.secret = newSecret;
//             foundUser.save(function () {
//                res.redirect("/secrets");
//             });
//          }
//       }
//    });

// });


http.listen(5000, function () {
   console.log("Server running at port 5000");
});
