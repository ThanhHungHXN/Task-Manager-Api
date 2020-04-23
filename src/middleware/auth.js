const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization)
            return res.status(401).send(new Error('Not authorized to access this resource'));
        const token = authorization.replace('Bearer ', '');
        const data = await jwt.verify(token, process.env.JWT_SECRECT);
        if (!data) {
            return res.status(401).send(new Error('Not authorized to access this resource'));
        }
        const user = await User.findOne({ _id: data._id, 'tokens.token': token });
        if (!user)
            return res.status(401).send(new Error('Not authorized to access this resource'));
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }   
}

module.exports = auth;