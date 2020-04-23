const express = require('express');
require('./db/mongoose');

const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

const auth = require('./middleware/auth');

const app = express();

const port = process.env.PORT;

app.use(express.json());

app.use('/auth', authRouter);
app.use(auth, userRouter);
app.use(auth, taskRouter);


app.listen(port, () => {
    console.log('Server is up on port ' + port);
});