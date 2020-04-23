const sendGridEmail = require('@sendgrid/mail');

sendGridEmail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
    from: 'buihung160894@gmail.com',
    to: 'buihung160894@gmail.com',
    subject: 'test send sendGrid email',
    text: 'Nothing can not stop me'
};

const send = async () => {
    try {
        const result = await sendGridEmail.send(msg);
        console.log(result);
    } catch (error) {
        console.log(error);    
    }
}

send();