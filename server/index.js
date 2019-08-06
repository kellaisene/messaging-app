// Installed dependency for dotenv to hold environment variable
const dotenv = require('dotenv');

// Install Dependencies with 'yarn add express cors twilio'
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

// Twilio API requirements
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

const app = express(); // alias

app.use(cors()); // blocks the browser from restricting any data

// Welcome page for the server
app.get('/', (req, res) => {
	res.send('Welcome to the Express Server');
});

// Twilio Text
app.get('/send-text', (req, res) => {
	// _GET Variables, passed via query string
	const { recipient, textmessage } = req.query;

	// Send Text
	client.messages
		.create({
			body: textmessage,
			from: '+19893490063', // from Twilio
			to: recipient
		})
		.then((message) => console.log(message.body));
});

// Must have nodemon installed, http://localhost:8080
app.listen(8080, () => console.log('Running on Port 8080'));
