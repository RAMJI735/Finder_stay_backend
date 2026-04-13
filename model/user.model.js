const passportLocalMongoose = require('passport-local-mongoose').default;
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        unique:true
    },
    type:{
        type:String,
        enum:['user','admin'],
        default:'user'
    }
});
userSchema.plugin(passportLocalMongoose,
    {
        usernameField: 'username',
        errorMessages: {
            UserExistsError: 'A user with the given username is already registered'
        }
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
