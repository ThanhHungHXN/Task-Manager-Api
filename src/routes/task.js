const express = require('express');
const Task = require('../models/task');

const router = express.Router();

router.post('/tasks', async (req, res) => {
    const task = {
        ...req.body,
        owner: req.user._id
    };
    const taskModel = new Task(task);
    try {
        await taskModel.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user._id }).populate('owner', 'name age');
        return res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get('/tasks/:id', async (req, res) => {
   try {
       const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
       if (!task)
           return res.status(404).send(new Error("Not found"));
       await task.populate('User').execPopulate();
       res.status(200).send(task);
   } catch (error) {
       res.status(500).send(error);
   } 
});

router.put('/tasks/:id', async (req, res) => {
    try {
        const task = {
            ...req.body,
            owner: req.user._id
        };
        await Task.findByIdAndUpdate(req.params.id, task);
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = Task.findByIdAndDelete(req.params.id);
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error);
    }
})

module.exports = router;