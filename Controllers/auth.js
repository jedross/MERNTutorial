const User = require('../Models/user')
const jwt = require("jsonwebtoken"); //to generatesigned token
const expressJwt = require("express-jwt"); // for authorization check
const { errorHandler } = require("../Helpers/dbErrorHandler")


exports.signup = (req, res) => {
    //console.log("req.body", req.body);
    const user = new User(req.body);
    user.save((err, user) => {
        if(err) {
            return res.status(400).json({
                err: errorHandler(err)
            })
        }
        user.salt = undefined;
        user.hashed_pssword = undefined;
        res.json({
            user
        })
    })
};


exports.signin = (req,res) => {
    // find the user based on email
    const{email, password} = req.body;
    User.findOne({email}, (err, user) => {
        if(err || !user) {
            return res.status(400).json({
                error: "User with that email doesnt exist yet. Please sign up instead"
            })
        }
        // if user is found, make sure email and password match
        // create authernticate method in user model
        if(!user.authenticate(password)) {
            return res.status(401).json({
                error: 'Email and Password dont match'
            })
        }

        //generate a signed token with user id and secret
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
        //persist the token as 't' in the cookie with expire date
        res.cookie('t', token, { expire: new Date() + 9999});
        // return response with user and token frontend client
        const {_id, name, email,role} = user;
        return res.json({ token, user:{_id,email,name,role}});

    })
};

exports.signout = (req, res) => {
    res.clearCookie("t");
    res.json({ message: "Signout Successful" });

};

exports.requireSignin =  expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: "auth"

});

exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!user) {
        return res.status(403).json({
            error: 'Access denied'
        });
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    if(req.profile.role === 0) {
        return res.status(403).json( {
            error: "Admins only beyond this point"
        });
    }
    next();
};