const express = require('express');
const User = require('../models/user');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');

router.post('/users', async (req, res) => {
    try {
        const userModel = new User(req.body);
        const user = await userModel.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(500).send(error);
    } 
});

router.get('/users', async (_, res) => {
    try {
        const users = await User.find({}).populate('tasks').exec();
        res.status(200).send(users);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get('/users/me', async (req, res) => {
    try {
        const user = await (await User.findOne({ _id: req.user._id }).populate('tasks')).execPopulate();
        console.log(user);
        if (!user)
            return res.status(404).send(new Error('Not found'));
        // user.tasks = await user.populate('tasks').execPopulate();
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put('/users', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, req.body);
        if (!user)
            return res.status(404).send(new Error('Not found'));
        await user.populate('Task').execPopulate();
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/users', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);
        if (!user)
            return res.status(404).send(new Error('Not found'));
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

const upload = multer({
    limits: {
        fieldSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            cb(new Error("Your file must have extension format .png | .jpg | .jpeg"));
        }
        cb(undefined, true);
    }
})

router.post('/users/me/avatar', upload.single('avatar'), async (req, res, next) => {
    const buffer = await sharp(req.file.buffer).resize(250, 250).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.status(200).send(req.user);
}, (error, req, res, next) => {
    res.status(500).send(error);
});

router.get('/users/avatar/:id', async (req, res) => {
    try {
        res.set('Content-Type', 'image/png');
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            return res.status(404).send("Not found!");
        }
        res.status(200).send(user.avatar);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
})

module.exports = router;
