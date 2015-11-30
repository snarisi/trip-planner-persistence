var express = require('express');
var router = express.Router();
var Models = require('../../models');
var Day = Models.Day;
var Restaurant = Models.Restaurant;
var Hotel = Models.Hotel;
var Activity = Models.Activity;
var Promise = require('bluebird');

//get all days
router.get('/api/days', function (req, res, next) {
	Day.find({}).sort({number: 1}).exec()
		.then(function(days) {
			res.json(days);
		});
});

//get one specific day
router.get('/api/days/:id', function(req, res, next) {
	Day.findById(req.params.id).exec().then(function(day) {
		res.json(day);
	});
});

//delete a day
router.delete('/api/days/:id', function (req, res, next) {
	Day.remove({ number: req.params.id }).exec()
	.then(function() {
		return Day.find({ number: {$gt: req.params.id } }).exec()
	})
	.then(function (days) {
		var promises = []
		days.forEach(function(day) {
			day.number--;
			promises.push(day.save());
		});
		return Promise.all(promises);
	})
	.then(function () {
		return Day.find({}).exec();
	})
	.then(function(days) {
		res.json(days);
	})
});

//add a new day
router.post('/api/days', function (req, res, next) {
	Day.find({})
	.sort({number: -1})
	.limit(1)
	.exec().then(function(days) {
		console.log('DAYS: ', days);
		var newDayNum = days[0] ? days[0].number + 1 : 1;
		return Day.create({number: newDayNum});
	})
	.then(function () {
		return Day.find({}).exec();
	})
	.then(function(days) {
		//console.log('day created');
		res.json(days);
	});
});

//middleware to make ID lookup easier
router.use('/api/days/:id/:type', function(req,res,next){
	if (req.params.type === 'restaurants') {
		Restaurant.findOne({name: req.body.placeName}).exec()
		.then(function(restaurant){
			req.body.place = restaurant;
			next();
		});
	} else if (req.params.type === 'hotel') {
		Hotel.findOne({name: req.body.placeName}).exec()
		.then(function(hotel){
			req.body.place = hotel;
			next();
		});
		
	} else if (req.params.type === 'activities') {
		Activity.findOne({name: req.body.placeName}).exec()
		.then(function(activity){
			req.body.place = activity;
			next();
		});
	}
});

//add a new attraction to a day
router.post('/api/days/:id/:type', function (req, res, next) {
	var number = parseInt(req.params.id,10);
	if (req.params.type === 'restaurants') {
		Day.findOne({number: number}).exec()
		.then(function(day) {
			day.restaurants.push(req.body.place._id);
			return day.save();
		})
		.then(function(){
			res.json(req.body.place)
		});
		// .then(function(day) {
		// 	return day.populate('restaurants')
		// 			  .execPopulate()
		// })
		// .then(function(popDay){
		// 	console.log(popDay);
		// 	res.json(popDay);
		// })
	} else if (req.params.type === 'hotel') {
		Day.findOne({number: number}).exec()
		.then(function(day) {
			day.hotel = req.body.place._id;
			return day.save();
		})
		.then(function(){
			res.json(req.body.place)
		});
		// .then(function(day) {
		// 	return day.populate('hotel')
		// 			  .execPopulate()
		// })
		// .then(function(popDay){
		// 	console.log(popDay);
		// 	res.json(popDay);
		// })
	} else if (req.params.type === 'activities') {
		Day.findOne({number: number}).exec()
		.then(function(day) {
			day.activities.push(req.body.place._id);
			return day.save();
		})
		.then(function(){
			res.json(req.body.place)
		});
		// .then(function(day) {
		// 	return day.populate('activities')
		// 			  .execPopulate()
		// })
		// .then(function(popDay){
		// 	console.log(popDay);
		// 	res.json(popDay);
		// })
	}
});


//delete an attraction from a day
router.delete('/api/days/:id/:type', function (req, res, next) {
	var number = parseInt(req.params.id, 10);
	if (req.params.type === 'restaurants') {
		Day.findOne({number: number}).exec().then(function(day) {
			var i = day.restaurants.indexOf(req.body.place._id);
			day.restaurants.splice(i, 1);
			return day.save();
		}).then(function() {
			res.send('Day updated.');
		});
	} else if (req.params.type === 'hotel') {
		Day.findOne({number: number}).exec().then(function(day) {
			day.hotel = null;
			return day.save();
		}).then(function() {
			res.send('Day updated.');
		});
		
	} else if (req.params.type === 'activities') {
		Day.findOne({number: number}).exec().then(function(day) {
			var i = day.activities.indexOf(req.body.place._id);
			day.activities.splice(i, 1);
			return day.save();
		}).then(function() {
			res.send('Day updated.');
		});
	}	
});

module.exports = router;