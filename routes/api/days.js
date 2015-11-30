var express = require('express');
var router = express.Router();
var Models = require('../../models');
var Day = Models.Day;
var Restaurant = Models.Restaurant;
var Hotel = Models.Hotel;
var Activity = Models.Activity;

//get all days
router.get('/api/days', function (req, res, next) {
	Day.find({}).exec().then(function(days) {
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
	Day.remove({ _id: req.params.id }).exec().then(function () {
		res.send('Deletion successful');
	});
});

//add a new day
router.post('/api/days', function (req, res, next) {
	Day.find({})
	.sort({number: -1})
	.limit(1)
	.exec().then(function(days) {
		//console.log('DAYS: ', days);
		return Day.create({number: days[0].number + 1});
	}).then(function(day) {
		//console.log('day created');
		res.json(day);
	});
});

//add a new attraction to a day
router.post('/api/days/:id/:type', function (req, res, next) {
	if (req.params.type === 'restaurants') {
		Day.findById(req.params.id).exec().then(function(day) {
			day.restaurants.push(req.body.restaurant);
			return day.save();
		}).then(function() {
			res.send('Day updated.');
		});
	} else if (req.params.type === 'hotel') {
		Day.findById(req.params.id).exec().then(function(day) {
			day.hotel = req.body.hotel;
			return day.save();
		}).then(function() {
			res.send('Day updated.');
		});
		
	} else if (req.params.type === 'activities') {
		Day.findById(req.params.id).exec().then(function(day) {
			day.activities.push(req.body.activity);
			return day.save();
		}).then(function() {
			res.send('Day updated.');
		});
	}
});

//delete an attraction from a day
router.delete('/api/days/:id/:type', function (req, res, next) {
	if (req.params.type === 'restaurants') {
		Day.findById(req.params.id).exec().then(function(day) {
			var i = day.restaurants.indexOf(req.body.restaurant);
			day.restaurants.splice(i, 1);
			return day.save();
		}).then(function() {
			res.send('Day updated.');
		});
	} else if (req.params.type === 'hotel') {
		Day.findById(req.params.id).exec().then(function(day) {
			day.hotel = null;
			return day.save();
		}).then(function() {
			res.send('Day updated.');
		});
		
	} else if (req.params.type === 'activities') {
		Day.findById(req.params.id).exec().then(function(day) {
			var i = day.activities.indexOf(req.body.activity);
			day.activities.splice(i, 1);
			return day.save();
		}).then(function() {
			res.send('Day updated.');
		});
	}	
});

module.exports = router;