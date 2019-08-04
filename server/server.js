require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const request = require('request');
const Auth0Strategy = require('passport-auth0');
const cors = require('cors');
const bodyParser = require('body-parser');
// const strategy = require(`${__dirname}/strategy.js`)
// const keys = require('./keys');
const connectionString = process.env.CONNECTION_STRING;
const myClientId = process.env.MY_CLIENT_ID;
const myClientSecret = process.env.MY_CLIENT_SECRET;

const app = (module.exports = express());
const massive = require('massive');
// const controller = require('./server/controllers/controllers')

// var React = require('react');
// var ReactDataGrid = require('react-data-grid/addons');

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(`${__dirname}/../build`));

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true
	})
);
app.use(passport.initialize());
app.use(passport.session());

massive(connectionString).then((db) => {
	app.set('db', db);

	passport.use(
		new Auth0Strategy(
			{
				domain: 'kelljohnson.auth0.com',
				clientID: process.env.MY_CLIENT_ID,
				clientSecret: process.env.MY_CLIENT_SECRET,
				callbackURL: '/auth/callback'
			},
			function(accessToken, refreshToken, extraParams, profile, done) {
				console.log('profile', profile);

				db.getUserByAuthId([ profile.id ]).then((user) => {
					//  console.log(user, 'hihihihihihihi')
					user = user[0];
					if (!user) {
						// if there isn't one, we'll create one!
						console.log('CREATING USER', profile);
						db
							.createUserByAuthID([
								profile.emails[0].value,
								profile.displayName,
								profile.name.givenName,
								profile.name.familyName,
								profile.picture,
								profile.id
							])
							.then((createdUser) => {
								console.log('USER CREATED', createdUser);
								return done(null, createdUser[0]); // GOES TO SERIALIZE USER
							})
							.catch((err) => console.log(err));
					} else {
						// when we find the user, return it
						console.log('FOUND USER', user);
						return done(null, user);
					}
				});
			}
		)
	);

	passport.serializeUser((user, done) => {
		// console.log('made it')
		done(null, user);
	});

	passport.deserializeUser((obj, done) => {
		console.log('deserializeUser');
		done(null, obj);
	});

	app.get('/auth', passport.authenticate('auth0'));
	app.get(
		'/auth/callback',
		passport.authenticate('auth0', {
			successRedirect: '/#/profile'
		})
	);
	app.get('/me', (req, res) => {
		console.log(req.user, 'this is req.user');
		res.send(req.user);
	});

	app.get('/getuser', (req, res) => {
		// console.log('req.user', req.user)
		console.log('server is working');
		if (req.user) {
			//creating an object for us to call and use
			var user = {
				user_id: req.user.user_id,
				name: req.user.name,
				profile_pic: req.user.imageurl
			};
			console.log('req.user', req.user.user_id);

			res.status(200).json(user);
		} else {
			// console.log('not logged in')
			res.status(200).send(false);
		}
	});

	// app.get('/login',
	//   passport.authenticate('auth0', {
	//     successRedirect: '/followers',
	//     failureRedirect: '/login',
	//     failureFlash: true
	//   })
	// );

	app.get('/me', (req, res, next) => {
		if (!req.user) {
			res.send(false);
			res.redirect('/login');
		} else {
			// req.user === req.session.passport.user
			// console.log( req.user )
			// console.log( req.session.passport.user );
			res.status(200).send(JSON.stringify(req.user, null, 10));
			res.send(req.user.id);
		}
	});

	//get weight workouts from db
	app.get('/api/exercises', (req, res, next) => {
		const dbInstance = req.app.get('db');
		console.log(dbInstance);
		dbInstance
			.getWeightWorkout([ req.query.category ])
			.then((weights) => res.status(200).send(weights))
			.catch(() => res.status(500).send());
	});

	//get cardio workouts from db
	app.get('/api/exercises', (req, res, next) => {
		const dbInstance = req.app.get('db');
		console.log(dbInstance);
		dbInstance
			.getWorkoutCardio([ req.query.category ])
			.then((cardio) => res.status(200).send(cardio))
			.catch(() => res.status(500).send());
	});

	app.post('/api/postWorkout', (req, res, next) => {
		const dbInstance = req.app.get('db');
		console.log(req.body);
		let arr = [];
		for (var j = 0; j < req.body.exercises.length; j++) {
			let element = req.body.exercises[j];
			for (var i = 0; i < element.length; i++) {
				delete element[i].id;
				element[i].user_id = req.body.user;
				element[i].timecompleted = new Date();
				arr.push(element[i]);
			}
		}
		console.log(arr);
		dbInstance.new_weights_table.insert(arr);
	});

	// dbInstance.update_weights([res.category])
	//   .then( () => res.status(200).send() )
	//   .catch( () => res.status(500).send() );
});

// app.get('/api/user', controller.getUserProfile);
// app.put('/api/editprofile', controller.updateProfile);
// app.post('/api/createTrip', controller.createTrip);
// app.get('/api/viewTrip', controller.viewTrip);
// app.post('/api/squad', controller.CreateSquad);
// app.get('/api/squadInfo', controller.displaySquadInfo);
// app.put('/api/updateSquad', controller.updateCurrentSquad);
// app.get('/api/getPastSquad', controller.getPastSquad);
// app.delete('/api/removeTrip/:id', controller.removeTrip);
// app.delete('/api/removeSquad/:id', controller.removeSquad);

// app.get('*', (req, res)=>{
//   res.sendFile(path.join(__dirname, '..','build','index.html'));
// })

const port = 3005;
app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
// });
