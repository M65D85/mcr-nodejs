const express = require('express');
const firebase = require('firebase-admin');
const validator = require('validator');
const {firebase:admin, db} = require('../service/firebase');


const router = express.Router();

router.get('/getAllUsers', async (req, res) => {
    let users = [];
    const usersRef = db.collection('users');
    const snapShot = await usersRef.get();

    if(snapShot.empty) {
        console.log('No matching user records');
        return res.json({Error: 'No matching user records'});
    }

    snapShot.forEach(doc => {
        users.push(doc.data());
    })
    return res.json(users);
});

router.post('/signUp', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    };

    let errors = {};

    //Checks for input validations
    if(validator.isEmpty(newUser.email)) {
        errors.email = 'Field cannot be empty';
        return res.json({email: errors.email})

    } else {
        if(!validator.isEmail(newUser.email)) {
            errors.email = 'This is not a valid email';
           return res.json({email: errors.email});
        }
    }

    if(validator.isEmpty(newUser.password)) {
        errors.password = 'Field cannot be empty';
        return res.json({password: errors.password});
    } else {
        if(validator.isLength(newUser.password, {max: 5})) {
            errors.password = 'Password should have at least 6 characters';
            return res.json({password: errors.password});
        } else {
            if(newUser.password !== newUser.confirmPassword) {
                errors.password = 'Passwords do not match';
                return res.json({password: errors.password});
            }
        }
    }
   
    //Creates an authenticated user with email and password
    firebase.auth.createUserWithEmailAndPassword({
        email: 'user@example.com',
        emailVerified: false,
        phoneNumber: '+11234567890',
        password: 'secretPassword',
        displayName: 'John Doe',
        photoURL: 'http://www.example.com/12345678/photo.png',
        disabled: false,
    
    }).then(user => {
        
        //initializes user details to be added to "users" collection as a user record
        const createdUser = {
            email: user.user.email,
            uid: user.user.uid,
            creds: []
        };

        //Creates a user document in the "users" collection with initialized data
        db.collection('users').doc(createdUser.uid).set(createdUser).then(data => {
            return res.json(data);
        }).catch(err => {
            res.status(500).json({message: 'Something went wrong'});
            console.log(err);
        })
    }).catch(err => {
        res.status(500).json({message: 'Something went wrong'});
        console.log(err);
    })
});

router.post('/signIn', (req, res) => {
    const {email, password} = req.body;
    let uid;
    //Make request to db to authenticate user
    firebase.auth().signInWithEmailAndPassword(email, password).then(user => {
        uid = user.user.uid;
        return user.user.getIdToken();
    }).then(token => {
        admin.auth().verifyIdToken(token).then((claims) => {
            if (claims.admin === true) {
              return res.json({User: {token, uid, admin: true}});
            } else {
                return res.json({User: {token, uid, admin: false}});
            }
          }).catch(err => {
              console.log(err);
              res.status(400).json(err);
          })
    }).catch(err => {
        console.log(err);
        if(err.code == 'auth/user-not-found') {
            return res.status(500).json({error: 'User not found'});
        } 
        if(err.code == 'auth/invalid-email') {
            return res.status(500).json({error: 'Invalid Email'});
        }
        if(err.code == 'auth/wrong-password') {
            return res.status(500).json({error: 'Incorrect Password'});
        }
        else {
            return res.status(500).json({error: err.code});
        }
    })
});

router.post('/signOut', (req, res) => {
    firebase.auth().signOut().then(() => {
        return res.json('Log Out Successful');
    }).catch(err => {
        res.status(400).json(err);
    });
});

// Not used
router.post('/createdUser', (req, res) => {
    const data = {
        name: req.body.name,
        email: req.body.email
    };
      
    db.collection('users').add(data).then(data => {
        return res.json(data);
    }).catch(err => {
        res.status(500).json({message: 'Something went wrong'});
        console.log(err);
    })
});

router.post('/setAdminPriv', (req, res) => {
    let uid = req.query.uid;
    admin.auth().setCustomUserClaims(uid, {admin: true}).then((token) => {
        return res.json(token);
      }).catch(err => {
          console.log(err);
          res.status(400).json(err);
      })
});

router.get('/checAdminPriv', (req, res) => {
    let idToken = req.query.token;
    admin.auth().verifyIdToken(idToken).then((claims) => {
        if (claims.admin === true) {
          return res.json({Message: 'Admin token is there'});
        } else {
            return res.json({Message: 'No priv'});
        }
      }).catch(err => {
          console.log(err);
          res.status(400).json(err);
      })
});

module.exports = router;
