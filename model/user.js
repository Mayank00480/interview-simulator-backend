const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const userSchema = new mongoose.Schema({
    username : {
        type: String,
        required: true,
    },
    email : {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            },
            message: 'Please enter a valid email address'
        }
    },
    password : {
        type : String,
        required : true,
        validate: {
            validator: function (value) {
                return validator.isStrongPassword(value, {
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1
                });
            },
            message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
        }
    }
})

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
}

const User = mongoose.model('User', userSchema);
module.exports = User;