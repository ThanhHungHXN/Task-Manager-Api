const express = require('express');
const User = require('../models/user');

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        const user = await User.findByCredentials(email, password);
        if (!user) {
            return res.status(401).send(new Error('Unauthenticated!'));
        }
        const token = await user.generateAuthToken();
        res.status(200).send({ user, token });
    } catch (error) {
        console.log(error.message);
        res.status(500).send(error.message);        
    }
});

router.post('/register', async (req, res) => {
    try {
        const userModel = new User(req.body);
        const user = await userModel.save();
        const token = await user.generateAuthToken();
        res.status(200).send({ user, token });
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/logout', async (req, res) => {
    req.user.tokens = req.user.tokens.filter(token => token != req.token);
    await req.user.save();
    res.status(200).send();
});

router.post('/logout-all', async (req, res) => {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send();
})

module.exports = router;