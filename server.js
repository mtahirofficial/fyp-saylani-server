var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
var session = require("express-session")
var passport = require("passport")
var local = require("passport-local").Strategy
var server = express();

server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json());
// Mongoo Start
mongoose.connect("mongodb://tb:123qwe@ds123196.mlab.com:23196/tb") //Connection
// Create Schema
var users = new mongoose.Schema({
    fName: String,
    lName: String,
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

var createAccount = mongoose.model("createAccount", users) // Create Model
// Mongo End


// Passport Start
server.use(session({ // Session
    secret: "hackathon",
    resave: false,
    saveUninitialized: false
}))
passport.use(new local({ //local strategy
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
}, (request, email, password, done) => {
    createAccount.findOne({
        email: email,
        password: password
    },
        (error, record) => {
            if (record) {
                done(null, record, request)
            } else {
                done(null, null)
            }
        })
}))

passport.serializeUser((user, done) => { // Serialize
    done(null, user.id)
})

passport.deserializeUser((id, done) => { // Deserialize
    createAccount.findOne({
        _id: id
    }, (error, user) => {
        if (error) {
            done(error)
        } else if (!user) {
            done(null, false)
        } else {
            done(null, user)
        }
    })
})

server.use(passport.initialize()) // Passport Initialize
server.use(passport.session()) // Session Initialize





//Signup
server.post("/regist", (request, response) => {

    var saveUser = new createAccount(); // Create Object and save Data
    saveUser.fName = request.body.fName;
    saveUser.lName = request.body.lName;
    saveUser.email = request.body.email;
    saveUser.password = request.body.password;
    // Save Record
    saveUser.save((error, record) => {
        if (error) {
            console.log(error)
        } else {
            console.log(record)
        }
    })
    response.send('Data Recieved and Saved.')
})



// Login
server.post('/login', passport.authenticate('local'), (request, response) => {
    let loggedUser = {name: request.user.fName+" "+ request.user.lName, email: request.user.email}
    response.send({messag: "Logged User is ", user: loggedUser})
});

server.post("/check", (request, response) =>{
    if(request.isAuthenticated()){
    let loggedUser = {name: request.user.fName+" "+ request.user.lName, email: request.user.email}
    response.send({messag: "Logged User is ", user: loggedUser})
    } else {
    response.status(403).send({messag: "No user is  Logged.", })

    }
})


server.listen(8080, () => { console.log('running on 8080') })