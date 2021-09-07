const { admin } = require('../firebase');

module.exports =  (req, res, next) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.log('No token found');
        return res.status(403).json({error: 'Unauthorized'});
    }

    admin.auth().verifyIdToken(idToken).then(decodedToken => {
        req.user = decodedToken; 
        return next();   
    }).catch(err => {
        console.log(err);
        return res.status(403).json(err);
    })
}