const express = require('express');
const cors = require('cors')
const { check, validationResult} = require("express-validator")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());


// connect to database
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/simple-login-register', {useNewUrlParser: true});
const conn = mongoose.connection;
conn.on('connected', function() {console.log('database connected successfully')});
conn.on('disconnected',function(){console.log('database disconnected successfully')})
conn.on('error', console.error.bind(console, 'connection error:'));


// schemas and models
const { userSchema } = require("./schemas")
const userModel = mongoose.model('User', userSchema, 'users');

app.post("/api/signup",[
        check('fullname', 'Fullname is invalid').isLength({ min: 1 }),
        check('email', 'Email is invalid').isEmail(),
        check('password', 'Password is invalid').isLength( { min: 1 }),
    ],
    async (request, response) => {
    const fullname = request.body.fullname
    const email = request.body.email
    const password = request.body.password

    const errors = validationResult(request);

    // response have no errors
    if (errors.isEmpty()) {
        // check if email is already in use
        userModel.findOne({email}, (error, result) => {
            // available email address
            if (result == null) {
                // hash user password
                bcrypt.hash(password, 10, (error, hashedPassword) => {
                    if (!error) {
                        // create user
                        userModel.create({ fullname, email, password: hashedPassword }, (error, result) => {
                            // user created successfully
                            if (result != null) {
                                return response.status(200).json();
                            }
                            else {
                                return response.status(500).json({error: 'An error occurred while creating account'});
                            }
                        })
                    }
                    else {
                        return response.status(500).json({error: 'An error occurred while encrypting your password'});
                    }
                });
            }
            // email address is already in use
            else {
                return response.status(409).json({error: 'This email address is already in use'});
            }
        })
    }
    // response have errors
    else {
        return response.status(400).json({error: 'One or more fields are invalid'});
    }
}
);

app.post("/api/signin",[
        check('email', 'Email is invalid').isEmail(),
        check('password', 'Password is invalid').isLength( { min: 1 }),
    ],
    async (request, response) => {
        const errors = []

        const email = request.body.email
        const password = request.body.password

        const requestErrors = validationResult(request);

        // response have no errors
        if (requestErrors.isEmpty()) {

            // create the model
            const userModel = mongoose.model('User', userSchema, 'users');

            userModel.findOne({email}, (error, userData) => {
                // no user has been found with that email
                if (error) {
                    console.error(error);
                    return response.status(500).json({error: 'An error occurred during sign in process'});
                }
                else {
                    // user found with that email
                    if (userData !== null) {
                        // try to verify user password
                        const hashedPassword = userData['password']
                        bcrypt.compare(password, hashedPassword, (error, compareResult) => {
                            // invalid password
                            if (!compareResult) {
                                return response.status(401).json({error: 'Incorrect email or password'});
                            }
                            // valid password
                            else {
                                const payload = {
                                    id: userData['_id'],
                                    email: userData['email'],
                                };
                                const options = { expiresIn: '2d' };
                                const token = jwt.sign(payload, 'mysecretkey', options);
                                return response.status(200).json({token});
                            }
                        });
                    }
                    else {
                        return response.status(401).json({error: 'Incorrect email or password'});
                    }
                }
            });
        }
        // response have errors
        else {
            return response.status(400).json({error: 'One or more fields are invalid'});
        }
    });

app.post("/api/get-auth-data", (request, response) => {
    const res = {
        'isLogged': false,
        'userData': {}
    }

    // extract the token from the request header
    const token = request.headers['authorization'].split(' ')[1]

    // verify the token
    jwt.verify(token, 'mysecretkey', (error, decoded) => {
        if (!error) {
            // update flag
            res['isLogged'] = true

            // If the token is valid, the decoded payload will contain the original encrypted payload
            const decodedEmail = decoded['email']

            // get user data
            const userModel = mongoose.model('User', userSchema, 'users');

            userModel.findOne({email: decodedEmail}, (error, userData) => {
                // user data found
                if (userData != null) {
                    res['userData'] = userData
                    return response.status(200).json(res);
                }
                else {
                    res['isLogged'] = false
                    return response.status(500).json(res);
                }
            })
        }
        else {
            return response.status(401).json(res);
        }
    });
})

app.listen(3000, () => {
    console.log(`Example app listening on port ${3000}`)
})