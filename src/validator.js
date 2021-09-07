const validator = require('validator');

const validateEmailAndPassword = (email, password, confirmPassword) => {
    let errors = {};
    if(validator.isEmpty(email)) {
        errors.email = 'Field cannot be empty';
        return res.json({email: errors.email})

    } else {
        if(!validator.isEmail(email)) {
            errors.email = 'This is not a valid email';
           return res.json({email: errors.email});
        }
    }

    if(validator.isEmpty(password)) {
        errors.password = 'Field cannot be empty';
        return res.json({password: errors.password});
    } else {
        if(validator.isLength(password, {max: 5})) {
            errors.password = 'Password should have at least 6 characters';
            return res.json({password: errors.password});
        } else {
            if(password !== confirmPassword) {
                errors.password = 'Passwords do not match';
                return res.json({password: errors.password});
            }
        }
    }
}

exports.validateEmailAndPassword = validateEmailAndPassword;