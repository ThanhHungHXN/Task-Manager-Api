const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        require: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid!');
            }
        }
    },
    password: {
        type: String,
        require: true,
        minLength: 7,
        trim: true,
        validate(value) {
            if (value && value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must a positive number!');
            }
        }
    },
    tokens: [
        {
            token: {
                type: String,
                require: true
            }
        }
    ],
    avatar: Buffer
}, { timestamps: true, toJSON: { virtuals: true } }); 


userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRECT, { expiresIn: '8h' });
    tokens = user.tokens || [];
    user.tokens = tokens.concat({ token });
    await user.save();
    return token;
};

userSchema.statics.findByCredentials =  async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        return new Error('Unauthenticated, Email not found!');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return new Error('Unauthenticated, Password is wrong!');
    }
    return user;
} 

const User = mongoose.model('User', userSchema);

module.exports = User;