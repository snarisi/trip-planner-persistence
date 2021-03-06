$(function () {

    var map = initialize_gmaps();

    var days = [
        // []
    ];

    var mapMarkers = {};

    var currentDay = 1;

    var placeMapIcons = {
        activities: '/images/star-3.png',
        restaurants: '/images/restaurant.png',
        hotels: '/images/lodging_0star.png'
    };

    var $dayButtons = $('.day-buttons');
    var $addDayButton = $('.add-day');
    var $placeLists = $('.list-group');
    var $dayTitle = $('#day-title');
    var $addPlaceButton = $('.add-place-button');


    var createItineraryItem = function (placeName) {

        var $item = $('<li></li>');
        var $div = $('<div class="itinerary-item"></div>');

        $item.append($div);
        $div.append('<span class="title">' + placeName + '</span>');
        $div.append('<button class="btn btn-xs btn-danger remove btn-circle">x</button>');

        return $item;

    };

    var setDayButtons = function () {
        $dayButtons.find('button').not('.add-day').remove();
        days.forEach(function (day, index) {
            $addDayButton.before(createDayButton(day.number));
        });
    };

    var loadAllDays = function() {
        $.get('/api/days', function(data) {
            days = data;
			if (!days.length) {
				$addDayButton.trigger('click');
			}
			setDayButtons();
			setDay(1);
        });
    };

    // var getPlaceObject = function (typeOfPlace, nameOfPlace) {

    //     var placeCollection = window['all_' + typeOfPlace];

    //     return placeCollection.filter(function (place) {
    //         return place.name === nameOfPlace;
    //     })[0];

    // };

    var getIndexOfPlace = function (nameOfPlace, collection) {
        var i = 0;
        for (; i < collection.length; i++) {
            if (collection[i].place.name === nameOfPlace) {
                return i;
            }
        }
        return -1;
    };

    var createDayButton = function (dayNum) {
        return $('<button class="btn btn-circle day-btn"></button>').text(dayNum);
    };


    var reset = function () {

        var dayPlaces = days[currentDay - 1];
        if (!dayPlaces) return;

        $placeLists.empty();

        //TODO: dayPlaces is an object, not an array

        console.dir(dayPlaces);

        Object.keys(dayPlaces).forEach(function(key){
            if (key === 'hotel') {

            }

        });

        Object.keys(mapMarkers).forEach(function(markerKey){
             mapMarkers[markerKey].setMap(null);
         });

    };

    var removeDay = function (dayNum) {

        if (days.length === 1) return;

        reset();

//        days.splice(dayNum - 1, 1);
		$.ajax({
			url: '/api/days/' + dayNum.toString(),
			method: 'DELETE',
			success: function(data) {
				days = data;
				setDayButtons();
				setDay(1);			
			}
		});		
    };

    var mapFit = function () {

        var bounds = new google.maps.LatLngBounds();
        // var currentPlaces = days[currentDay - 1];

        //TODO: fix below to work with object rather than array

        // currentPlaces.forEach(function (place) {
        //     bounds.extend(place.marker.position);
        // });
        Object.keys(mapMarkers).forEach(function(markerKey){
            bounds.extend(mapMarkers[markerKey].position);
        });

        map.fitBounds(bounds);

    };

    var setDay = function (dayNum) {

        if (dayNum > days.length +1 || dayNum <= 0) {
            return;
        }

        // console.log("dayNum is " + dayNum);

        var placesForThisDay = days[dayNum - 1];
        var $dayButtons = $('.day-btn').not('.add-day');

        reset();

        currentDay = dayNum;
        // console.log("current day is " + currentDay);

        //TODO: placesForThisDay is an object, not an array

		
		$.get('/api/days/' + currentDay, function(data) {
			console.log('Data from get single day request:');
            var newMarker;
          
			if (data.hotel) {
              $('#hotel-list').find('ul').append(createItineraryItem(data.hotel.name));
              newMarker = drawLocation(map, data.hotel.place[0].location, {icon: placeMapIcons['hotels']});
              mapMarkers[data.hotel.name] = newMarker;
            }
			if (data.restaurants.length > 0) {
				data.restaurants.forEach(function(restaurant) {
					$('#restaurants-list').find('ul').append(createItineraryItem(restaurant.name));
                    newMarker = drawLocation(map, restaurant.place[0].location, {icon: placeMapIcons['restaurants']});
                    mapMarkers[restaurant.name] = newMarker;
				});
			}
			if (data.activities.length > 0) {
				data.activities.forEach(function(activity) {
					$('#activities-list').find('ul').append(createItineraryItem(activity.name));
                    newMarker = drawLocation(map, activity.place[0].location, {icon: placeMapIcons['activities']});
                    mapMarkers[activity.name] = newMarker;
				});
			}
            console.dir(mapMarkers);
            mapFit();
//            var createdMapMarker = drawLocation(map, place.place[0].location, {
//            icon: placeMapIcons[sectionName]
//
//           placesForThisDay.forEach(function (place) {
//               place.marker.setMap(map);
//           });
		})

        $dayButtons.removeClass('current-day');
        $dayButtons.eq(dayNum - 1).addClass('current-day');

        // console.log("day button: ");
        // console.dir($dayButtons.eq(dayNum - 1));

        $dayTitle.children('span').text('Day ' + dayNum.toString());

//        mapFit();

    };

    loadAllDays();

    $addPlaceButton.on('click', function () {
        var $this = $(this);
        var sectionName = $this.parent().attr('id').split('-')[0];
        var $listToAppendTo = $('#' + sectionName + '-list').find('ul');
        var placeName = $this.siblings('select').val();

        // console.log("sectionName: " + sectionName + " placeName: " + placeName + " currentDay: " + currentDay);

        // var placeObj = getPlaceObject(sectionName, placeName);



        // days[currentDay - 1].push({place: placeObj, marker: createdMapMarker, section: sectionName});

        $.post('/api/days/' + currentDay.toString() + '/' + sectionName,
                {placeName: placeName})
                .done(function(place){
                    // console.log("posting to /api/days");
                    // console.dir(data);

                    // Object.keys(place).forEach(function(key){
                    //     $listToAppendTo = $('#' + key + '-list').find('ul');
                    //     place[key].forEach(function(dataKey){
                    //         $listToAppendTo.append(createItineraryItem(dataKey.name));
                    //     })
                    // });
                    $listToAppendTo.append(createItineraryItem(place.name));
//                    console.log("adding an item, here's the place: ");
//                    console.dir(place);
                    if (sectionName === 'hotel') sectionName = 'hotels';

                    var createdMapMarker = drawLocation(map, place.place[0].location, {
            icon: placeMapIcons[sectionName]
        });
                    mapMarkers[place.name] = createdMapMarker;
                    mapFit();
                });  
    });

    $placeLists.on('click', '.remove', function (e) {

        var $this = $(this);
        var $listItem = $this.parent().parent();
		var sectionName = $listItem.parent().parent().attr('id').split('-')[0];
        var nameOfPlace = $this.siblings('span').text();
        var indexOfThisPlaceInDay = getIndexOfPlace(nameOfPlace, days[currentDay - 1]);
        var placeInDay = days[currentDay - 1][indexOfThisPlaceInDay];

        mapMarkers[nameOfPlace].setMap(null);
//        console.dir(mapMarkers);
        
        delete mapMarkers[nameOfPlace];
//        console.dir(mapMarkers);

        $.ajax({
			method: 'DELETE',
			url: '/api/days/' + currentDay + '/' + sectionName,
			data: { placeName: nameOfPlace },
			success: function(data) {
				$listItem.remove();				
			}
		})
//        days[currentDay - 1].splice(indexOfThisPlaceInDay, 1);

    });

    $dayButtons.on('click', '.day-btn', function () {
        setDay($(this).index() + 1);
    });

    $addDayButton.on('click', function () {
        $.post('/api/days', function(data){     
            days = data;
			var newDay = days[days.length - 1];
            var $newDayButton = createDayButton(newDay.number);
            $addDayButton.before($newDayButton);
            setDay(newDay.number);
        });
        
    });

    $dayTitle.children('button').on('click', function () {

        removeDay(currentDay);

    });

});

