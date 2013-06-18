// -------------------------------------------------------------------------------
//  wisemove-logic.js defines the models, viewmodels and logic of the WiseMove app
// -------------------------------------------------------------------------------

window.wisemove = {};

(function (namespace) {
	
	function IdGenerator() {
		var self = this;
		
		self.nextId = 1;
		self.getNext = function() {
			var thisId = self.nextId;
			self.nextId++;
			
			return thisId;
		}

        self.ensureNextBeyond = function(id) {
            if (self.nextId <= id) {
                self.nextId = id + 1;
            }
        }
    }
	namespace.IdGenerator = IdGenerator;
	namespace.currentIdGenerator = new IdGenerator();
	
	function Configuration() {
		var self = this;
        self.APP_NAME = 'WiseMove';
        self.VERSION = '0.1.0';
        self.APP_NEWS_ENABLED = false; // set this flag to true to enable news
        self.APP_NEWS_URL = '[YourNewsURL]' + self.APP_NAME + '/' + self.VERSION;
        self.ANALYTICS_ENABLED = false; // set this to true to enable analytics tracking, false to disable it
        self.ANALYTICS_KEY = '[YourKey]'; // Set this to your analytics key
        self.ANALYTICS_MIN_WAIT_SECONDS = 10;
        self.MAX_CANDIDATE_LOCATIONS = 5;
        self.MAX_VISIT_LOCATIONS = 5;
    }

	namespace.Configuration = Configuration;
	
	function AppLevel(name, level, maximumVisitLocations, maximumCandidateLocations, maximumPeople, maximumMeasures) {
		var self = this;
		
		self.name = ko.observable(name);
		self.level = ko.observable(level);
		self.maximumVisitLocations = ko.observable(maximumVisitLocations);
		self.maximumCandidateLocations = ko.observable(maximumCandidateLocations);
		self.maximumPeople = ko.observable(maximumPeople);
		self.maximumMeasures = ko.observable(maximumMeasures);
	}
	namespace.AppLevel = AppLevel;

    function MapBounds(upperLat, upperLong, lowerLat, lowerLong) {
        var self = this;

        self.id = ko.observable(namespace.currentIdGenerator.getNext());

        self.upperLat = ko.observable(upperLat);
        self.upperLong= ko.observable(upperLong);
        self.lowerLat = ko.observable(lowerLat);
        self.lowerLong = ko.observable(lowerLong);
        self.zoomLevel = ko.observable(10);

        self.toPersistableObject = function() {
            var po = {};

            po.id = self.id();

            po.upperLat = self.upperLat();
            po.upperLong = self.upperLong();
            po.lowerLat = self.lowerLat();
            po.lowerLong = self.lowerLong();
            po.zoomLevel = self.zoomLevel();

            return po;
        };

        self.isInitialised = function(){
            return (self.upperLat() != 0 || self.upperLong() != 0 || self.lowerLat() != 0 || self.lowerLong() != 0);
        };

        self.getCenter = function(){
            var lat = 0;
            var long = 0;

            lat =  self.upperLat() + ((self.lowerLat() - self.upperLat()) / 2.0);
            long =  self.upperLong() + ((self.lowerLong() - self.upperLong()) / 2.0);

            var coord = new Coordinate(lat, long);

            return coord;
        }
    }
    MapBounds.fromPersistableObject = function(po, project) {

        if (po) {
            namespace.currentIdGenerator.ensureNextBeyond(po.id);

            var newInstance = new MapBounds(po.upperLat, po.upperLong, po.lowerLat, po.lowerLong);

            if ("zoomLevel" in po) {
                newInstance.zoomLevel(po.zoomLevel);
            }
            newInstance.id(po.id);
            return newInstance;
        }
    };
    namespace.MapBounds = MapBounds;

    function Coordinate(lat, lng) {
		var self = this;

        self.id = ko.observable(namespace.currentIdGenerator.getNext());
		self.lat = ko.observable(lat);
		self.lng = ko.observable(lng);

        self.toPersistableObject = function() {
            var po = {};

            po.id = self.id();
            po.lat = self.lat();
            po.lng = self.lng();

            return po;
        }
    }
	namespace.Coordinate = Coordinate;
    Coordinate.fromPersistableObject = function(po, project, msg) {

        if (po) {
        namespace.currentIdGenerator.ensureNextBeyond(po.id);

        var newInstance = new Coordinate(po.lat, po.lng);

        newInstance.id(po.id);
        return newInstance;
        } else {
            alert(msg);
        }
    };

	function ZoomLevel(level) {
		var self = this;
		
		self.level = ko.observable(level);
	}
	namespace.ZoomLevel = ZoomLevel;
	
	function Person() {
		var self = this;

        self.id = ko.observable(namespace.currentIdGenerator.getNext());
        self.name = ko.observable().extend({
                     required: true,
                     minLength: 1
                 });
        
        self.isBuiltin = ko.observable(false);
		
		self.copyFrom = function(other) {
            self.id(other.id());
            self.name(other.name());
			self.isBuiltin(other.isBuiltin());
		}
		
		self.clone = function(){
			var newClone = new Person();
			newClone.copyFrom(self);
			return newClone;
		}
		
		self.raiseValueHasMutated = function(){
			self.name.valueHasMutated();
		}
		
		self.isModelValid = ko.computed(function() { return (self.name.isValid());});

        self.toPersistableObject = function() {
            var po = {};

            po.id = self.id();
            po.name = self.name();
            po.isBuiltin= self.isBuiltin();

            return po;
        }
	}
	namespace.Person = Person;
    Person.fromPersistableObject = function(po, project) {
        namespace.currentIdGenerator.ensureNextBeyond(po.id);

        var newInstance = new Person();

        newInstance.name(po.name);
        newInstance.id(po.id);
        newInstance.isBuiltin(po.isBuiltin);

        return newInstance;
    };

	function Measure() {
		var self = this;

        self.id = ko.observable(namespace.currentIdGenerator.getNext());
        self.name = ko.observable().extend({
                     required: true,
                     minLength: 1
                 });
		self.weighting = ko.observable(5).extend({ 
                     required: true,
                     min: 0,
                     max: 10
                 });
		
		self.isBuiltin = ko.observable(false);
		
		self.copyFrom = function(other) {
            self.id(other.id());
            self.name(other.name());
			self.weighting(other.weighting());
			self.isBuiltin(other.isBuiltin());
		}
		
		self.clone = function(){
			var newClone = new Measure();
			newClone.copyFrom(self);
			return newClone;
		}
		
		self.raiseValueHasMutated = function(){
			self.name.valueHasMutated();
			self.weighting.valueHasMutated();
		}
		
		self.isModelValid = ko.computed(function() { return (self.name.isValid() && self.weighting.isValid());});

        self.toPersistableObject = function() {
            var po = {};

            po.id = self.id();
            po.name = self.name();
            po.weighting = self.weighting();
            po.isBuiltin= self.isBuiltin();

            return po;
        }
	}
	namespace.Measure = Measure;
    Measure.fromPersistableObject = function(po, project) {
        namespace.currentIdGenerator.ensureNextBeyond(po.id);

        var newInstance = new Measure();

        newInstance.name(po.name);
        newInstance.id(po.id);
        newInstance.weighting(po.weighting);
        newInstance.isBuiltin(po.isBuiltin);

        return newInstance;
    };

	function Location(coordinate, name) {
		var self = this;

        self.id = ko.observable(namespace.currentIdGenerator.getNext());
        self.coordinate = ko.observable(coordinate);
		self.name = ko.observable(name);

        self.toPersistableObject = function() {
            var po = {};

            po.id = self.id();
            po.name = self.name();
            po.coordinate= self.coordinate().toPersistableObject();

            return po;
        }
	}
	namespace.Location = Location;
    Location.fromPersistableObject = function(po, project) {

        namespace.currentIdGenerator.ensureNextBeyond(po.id);

        var newInstance = new Location();

        newInstance.name(po.name);
        newInstance.id(po.id);
        newInstance.coordinate(Coordinate.fromPersistableObject(po.coordinate, project));

        return newInstance;
    };

	function VisitLocation(coordinate, shape) {
		var self = this;

        self.id = ko.observable(namespace.currentIdGenerator.getNext());
        self.shape = ko.observable(shape);
		
		self.coordinate = ko.observable(coordinate).extend({ 
                     required: true
                 });
                 
		self.name = ko.observable().extend({ 
                     required: true,
                     minLength: 1,
                     maxLength: 15
                 });
                 
		self.frequency = ko.observable(1).extend({ 
                     required: true,
                     min: 1,
                     max: 10
                 });
	
		self.isCommitted = ko.observable(false);
		
		self.copyFrom = function(other) {
            self.id(other.id());
            self.name(other.name());
			self.shape(other.shape());
			self.coordinate(other.coordinate());
			self.frequency(other.frequency());
		}
		
		self.clone = function(){
			var newClone = new VisitLocation();
			newClone.copyFrom(self);
			return newClone;
		}

		self.raiseValueHasMutated = function(){
			self.name.valueHasMutated();
			self.frequency.valueHasMutated();
			self.coordinate.valueHasMutated();
			self.shape.valueHasMutated();
		}

		self.isModelValid = ko.computed(function() { return (self.coordinate.isValid() && self.name.isValid() && self.frequency.isValid());});

        self.toPersistableObject = function() {
            var po = {};

            po.id = self.id();
            po.name = self.name();
            // po.shape = self.shape();
            po.coordinate = self.coordinate().toPersistableObject();
            po.frequency = self.frequency();

            return po;
        }
    }
	namespace.VisitLocation = VisitLocation;
    VisitLocation.fromPersistableObject = function(po, project) {

        namespace.currentIdGenerator.ensureNextBeyond(po.id);

        var newInstance = new VisitLocation();

        newInstance.shape(po.shape);
        newInstance.name(po.name);
        newInstance.id(po.id);
        newInstance.coordinate(Coordinate.fromPersistableObject(po.coordinate, project, 'vl'));
        newInstance.frequency(po.frequency);

        return newInstance;
    };

	function CandidateLocation(coordinate, shape) {
		var self = this;

        self.id = ko.observable(namespace.currentIdGenerator.getNext());
        self.shape = ko.observable(shape);
		
		self.coordinate = ko.observable(coordinate).extend({ 
                     required: true
                 });
                 
		self.name = ko.observable(null).extend({ 
                     required: true,
                     minLength: 1,
                     maxLength: 15
                 });
                 
        self.isCommitted = ko.observable(false);
         
        self.isModelValid = ko.computed(function() { return (self.coordinate.isValid() && self.name.isValid());});
        
        self.copyFrom = function(other) {
            self.id(other.id());
            self.name(other.name());
			self.shape(other.shape());
			self.coordinate(other.coordinate());
		}
		
        self.clone = function(){
			var newClone = new CandidateLocation();
			newClone.copyFrom(self);
			return newClone;
		}
		
        self.routeDataArray = ko.observableArray([]);

        self.raiseValueHasMutated = function(){
			self.name.valueHasMutated();
			self.coordinate.valueHasMutated();
			self.shape.valueHasMutated();
		}

        self.convertArrayToPersistableObject = function(array){
            var po = [];

            if (array){
                for(var i=0;i<array.length;i++) {
                    var item = array[i];

                    po.push(item.toPersistableObject());
                }
            }

            return po;
        }

        self.toPersistableObject = function() {
            var po = {};

            po.id = self.id();
            po.name = self.name();
            // po.shape = self.shape();
            po.coordinate = self.coordinate().toPersistableObject();
            po.isCommitted = self.isCommitted();
            po.routeDataArray = self.convertArrayToPersistableObject(self.routeDataArray());

            return po;
        }
	}
	namespace.CandidateLocation = CandidateLocation;
    CandidateLocation.fromPersistableObject = function(po, project) {

        namespace.currentIdGenerator.ensureNextBeyond(po.id);

        var newInstance = new CandidateLocation();

        newInstance.shape(po.shape);
        newInstance.name(po.name);
        newInstance.id(po.id);
        newInstance.coordinate(Coordinate.fromPersistableObject(po.coordinate, project, 'cl'));

        if (typeof po.routeDataArray !== 'undefined') {
            for(var i = 0; i < po.routeDataArray.length; i++) {
                var entry = po.routeDataArray[i];
                var convertedEntry = RouteData.fromPersistableObject(entry, project, newInstance);

                newInstance.routeDataArray.push(convertedEntry);
            }
        }

        return newInstance;
    };

	function RouteData(candidateLocation, visitLocation) {
		var self = this;

        self.id = ko.observable(namespace.currentIdGenerator.getNext());
        self.configuration = new Configuration();
		self.candidateLocation = ko.observable(candidateLocation);
		self.visitLocation = ko.observable(visitLocation);
		self.durationMinutes = ko.observable(null);
		self.overrideDurationMinutes = ko.observable(null).extend({
            required: false,
            min: 1
        });
		self.isLookupInProgress = ko.observable(false);
		self.routeLookupAttempted = ko.observable(false);
		self.routeLookupFailed = ko.observable(false);
		self.routeLookupSucceeded = ko.observable(false);
		self.routeLookupAttemptTime = ko.observable(null);
		
		self.effectiveDurationMinutes = ko.computed(function() {
			return (self.overrideDurationMinutes() || self.durationMinutes());
		});

        self.displayDurationMinutes = ko.computed(function() {
            var minutesText = null;

            minutesText = self.durationMinutes();

            if (minutesText && typeof minutesText === "number"){
                minutesText = minutesText.toFixed(2);
            }

            else if (self.isLookupInProgress()){
                minutesText = "L";
            }
            else {
                minutesText = "-";
            }

            return minutesText;
        });

		self.displayMinutes = ko.computed(function() { 
			var minutesText = null;
			
			minutesText = (self.overrideDurationMinutes() || self.durationMinutes());
			
			if (minutesText){
                if (typeof minutesText === "number") {
                    minutesText = minutesText.toFixed(2);
                }
			}
			else if (self.isLookupInProgress()){
				minutesText = "L";
			}
			else {
				minutesText = "-";
			}
			return minutesText;
		});

        self.dataDisplayStatus = ko.computed(function() {
            var returnValue = "";
            if (self.isLookupInProgress()){
                returnValue = "Retrieving...";
            }
            else if (self.routeLookupFailed())  {
                returnValue = "Error retrieving...";
            }

            if (self.overrideDurationMinutes() > 0) {
                returnValue = returnValue + "Override";
            }

            return returnValue;
        });

		self.isNumber = function(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		}
		
		self.scoreMinutes = ko.computed(function() { 
			var score = -1;
		
			var value = ko.utils.unwrapObservable(self.effectiveDurationMinutes());
			var freq = null;

            if (self.visitLocation()) {
                freq = ko.utils.unwrapObservable(self.visitLocation().frequency());
            }

            if (value && freq) {
                if (typeof value === "string") {
                    value = parseFloat(value);
                }

                if (typeof freq === "string") {
                    freq = parseFloat(freq);
                }

                score = value * freq;
            }

			return score;
		});
		
		self.displayScoreMinutes = ko.computed(function() { 
			var value = ko.utils.unwrapObservable(self.scoreMinutes());
			
			if (self.isNumber(value)){
				value = value.toFixed(2);
			}
			
			return value;
		});
		
		self.numberToRad = function(val) {
			return val * Math.PI / 180;
		}

        self.lookupRoute = function(directionsService){
            /*
            var newURL = self.configuration.ROUTE_POST + "&from="
                + self.candidateLocation().coordinate().lat()
                + ','
                + self.candidateLocation().coordinate().lng()
                + '&to='
                + self.visitLocation().coordinate().lat()
                + ','
                + self.visitLocation().coordinate().lng();
            */
            self.isLookupInProgress(true);
            /*
            $.ajax({

                type: 'GET',
                url: newURL,
                dataType: 'jsonp',
                success: function(response) { self.lookupRouteComplete(response); }
            });
            */

            var start = new google.maps.LatLng(self.candidateLocation().coordinate().lat(), self.candidateLocation().coordinate().lng());
            var end = new google.maps.LatLng(self.visitLocation().coordinate().lat(), self.visitLocation().coordinate().lng());

            var request = {
                origin:start,
                destination:end,
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            };
            directionsService.route(request, self.lookupRouteComplete);
        }

        self.lookupRouteComplete = function(response, status) {
            self.isLookupInProgress(false);

            if (status == google.maps.DirectionsStatus.OK) {
                var duration = 0;
                for (var i in response.routes) {
                    var rt = response.routes[i];

                    for (var j in rt.legs) {
                        var leg = rt.legs[j];

                        if (typeof leg.duration !== 'undefined' && typeof leg.duration.value !== 'undefined') {
                            duration += leg.duration.value;
                        }
                    }
                }

                if (duration > 0) {
                    self.durationMinutes(duration/ 60.0);
                }
            }
        }
		
		self.calculateLatLongDistance = function(){
			var result = null;
			
			if (self.visitLocation() && self.visitLocation().coordinate() && self.candidateLocation() && self.candidateLocation().coordinate()) {
				var lat1 = self.visitLocation().coordinate().lat();
				var lng1 = self.visitLocation().coordinate().lng();
				
				var lat2 = self.candidateLocation().coordinate().lat();
				var lng2 = self.candidateLocation().coordinate().lng();
			
				if (lat1 && !isNaN(lat1) && lng1 && !isNaN(lng1) && lat2 && !isNaN(lat2) && lng2 && !isNaN(lng2)){
					// formula from: http://www.movable-type.co.uk/scripts/latlong.html
					var R = 6371; // km
					var dLat = self.numberToRad(lat2-lat1);
					var dLon = self.numberToRad(lng2-lng1);
					var lat1 = self.numberToRad(lat1);
					var lat2 = self.numberToRad(lat2);

					var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
							Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
					var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
					result = R * c;		
				}
			}
			
			return result;
		}

        self.isModelValid = ko.computed(function() { return (self.overrideDurationMinutes.isValid()); });

        self.copyFrom = function(other) {
            self.id(other.id());
            self.candidateLocation(other.candidateLocation());
            self.visitLocation(other.visitLocation());
            self.durationMinutes(other.durationMinutes());
            self.overrideDurationMinutes(other.overrideDurationMinutes());
            self.isLookupInProgress(other.isLookupInProgress());
            self.routeLookupAttempted(other.routeLookupAttempted());
            self.routeLookupFailed(other.routeLookupFailed());
            self.routeLookupSucceeded(other.routeLookupSucceeded());
            self.routeLookupAttemptTime(other.routeLookupAttemptTime());
        }

        self.clone = function(){
            var newClone = new RouteData(self.candidateLocation(), self.visitLocation());
            newClone.copyFrom(self);
            return newClone;
        }

        self.toPersistableObject = function() {
            var po = {};

            po.id = self.id();
            po.candidateLocationId = self.candidateLocation().id();
            po.visitLocationId = self.visitLocation().id();
            po.durationMinutes = self.durationMinutes();
            po.overrideDurationMinutes = self.overrideDurationMinutes();
            po.isLookupInProgress = self.isLookupInProgress();
            po.routeLookupAttempted = self.routeLookupAttempted();
            po.routeLookupFailed = self.routeLookupFailed();
            po.routeLookupSucceeded = self.routeLookupSucceeded();
            po.routeLookupAttemptTime = self.routeLookupAttemptTime();

            return po;
        }
	}
	namespace.RouteData = RouteData;
    RouteData.fromPersistableObject = function(po, project, candidateLocation) {

        namespace.currentIdGenerator.ensureNextBeyond(po.id);

        var visitLocation = Project.getArrayItem(project.visitLocations(), po.visitLocationId);
        var newInstance = new RouteData(candidateLocation, visitLocation);

        newInstance.durationMinutes(po.durationMinutes);
        newInstance.id(po.id);
        newInstance.overrideDurationMinutes(po.overrideDurationMinutes);
        newInstance.isLookupInProgress(po.isLookupInProgress);
        newInstance.routeLookupAttempted(po.routeLookupAttempted);
        newInstance.routeLookupFailed(po.routeLookupFailed);
        newInstance.routeLookupSucceeded(po.routeLookupSucceeded);
        newInstance.routeLookupAttemptTime(po.routeLookupAttemptTime);

        return newInstance;
    };

	function Score(person, measure, candidateLocation) {
        var self = this;

        self.id = ko.observable(namespace.currentIdGenerator.getNext());
        self.person = ko.observable(person);
		self.measure = ko.observable(measure);
		self.candidateLocation = ko.observable(candidateLocation);
		self.scoreValue = ko.observable(-1);
		self.isFirstInCategory = ko.observable(false);

        self.toPersistableObject = function() {
            var po = {};

            po.id = self.id();
            po.measureId = self.measure().id();
            po.personId = self.person().id();
            po.scoreValue = self.scoreValue();
            if (self.candidateLocation()) {
                po.candidateLocationId = self.candidateLocation().id();
            }
            po.isFirstInCategory = self.isFirstInCategory();

            return po;
        }
    }
	namespace.Score = Score;
    Score.fromPersistableObject = function(po, project) {

        namespace.currentIdGenerator.ensureNextBeyond(po.id);

        var measure = Project.getArrayItem(project.measures(), po.measureId);
        var person = Project.getArrayItem(project.people(), po.personId);
        var candidateLocation = Project.getArrayItem(project.candidateLocations(), po.candidateLocationId);

        var newInstance = new Score(person, measure, candidateLocation);

        newInstance.scoreValue(po.scoreValue);
        newInstance.isFirstInCategory(po.isFirstInCategory);
        newInstance.id(po.id);

        return newInstance;
    };

	function Project() {
		var self = this;

        self.id = ko.observable(namespace.currentIdGenerator.getNext());
        self.name = ko.observable('New Project');
		self.createdDateTime = ko.observable(new Date());
		self.mapBounds = ko.observable(new MapBounds(0, 0, 0, 0));
		self.visitLocations = ko.observableArray([]);
		self.candidateLocations = ko.observableArray([]);
		self.measures = ko.observableArray([]);
		self.people = ko.observableArray([]);
		self.configuration = new Configuration();
		self.scores = ko.observableArray([]);
		self.changeCount = ko.observable(0);
        self.disableRouteLookup = ko.observable(false);
        self.directionsService = ko.observable(null);

        self.createDefaultMeasures = function() {
			var travelTimeMeasure = new Measure();
			travelTimeMeasure.name("Travel Time");
			travelTimeMeasure.isBuiltin(true);
			self.addMeasure(travelTimeMeasure);
			
			var straightLineDistanceMeasure = new Measure();
			straightLineDistanceMeasure.name("Straight Line Distance");
			straightLineDistanceMeasure.isBuiltin(true);
            straightLineDistanceMeasure.weighting(0);
			self.addMeasure(straightLineDistanceMeasure);

            var subjectiveRatingMeasure = new Measure();
            subjectiveRatingMeasure.name("Subjective Rating");
            subjectiveRatingMeasure.isBuiltin(false);
            subjectiveRatingMeasure.weighting(5);
            self.addMeasure(subjectiveRatingMeasure);
		}
		
		self.createDefaultPeople = function() {
			var systemScorer = new Person();
			systemScorer.name("System Scorer");
			systemScorer.isBuiltin(true);
			self.addPerson(systemScorer);
			
			var person1 = new Person();
			person1.name("Person 1");
			person1.isBuiltin(false);
			self.addPerson(person1);
		}
		
		self.addMeasure = function(measure) {
			for (var i = 0; i < self.candidateLocations().length; i++) {
				var candidate = self.candidateLocations()[i];
				for (var j = 0; j < self.people().length; j++) {
					var person = self.people()[j];
					if ((measure.isBuiltin() && person.isBuiltin()) || !measure.isBuiltin()) {
						self.scores.push(new Score(person, measure, candidate));
					}
				}
			}
			
			self.measures.push(measure);
			self.changeCount(self.changeCount() + 1);
		}
		
		self.removeMeasure = function(measure){
			self.measures.splice(self.measures.indexOf(measure),1);
			self.removeMatchingScores(function(score) { return score.measure == measure; });
			self.changeCount(self.changeCount() + 1);
		}
		
		self.addPerson = function(person) {
			for (var i = 0; i < self.candidateLocations().length; i++) {
				var candidate = self.candidateLocations()[i];
				for (var j = 0; j < self.measures().length; j++) {
					var measure = self.measures()[j];
					
					if ((measure.isBuiltin() && person.isBuiltin()) || !measure.isBuiltin()) {
						self.scores.push(new Score(person, measure, candidate));
					}
				}
			}
			
			self.people.push(person);
			self.changeCount(self.changeCount() + 1);
		};
		
		self.removePerson = function(person){
			self.people.splice(self.people.indexOf(person),1);
			self.removeMatchingScores(function(score) { return score.person == person; });
			self.changeCount(self.changeCount() + 1);
		};
		
		self.addCandidateLocation = function(candidateLocation) {
			for (var i = 0; i < self.visitLocations().length; i++) {
				var visit = self.visitLocations()[i];
				
				var newRouteData = new RouteData(candidateLocation, visit);
				candidateLocation.routeDataArray.push(newRouteData);
				
				self.lookupRoute(newRouteData);
			}
			
			self.candidateLocations.push(candidateLocation);
			candidateLocation.isCommitted(true);
			
			for (var i = 0; i < self.people().length; i++) {
				var person = self.people()[i];
				for (var j = 0; j < self.measures().length; j++) {
					var measure = self.measures()[j];
					if ((measure.isBuiltin() && person.isBuiltin()) || !measure.isBuiltin()) {
						self.scores.push(new Score(person, measure, candidateLocation));
					}
				}
			}
			
			self.changeCount(self.changeCount() + 1);
		};
		
		self.removeCandidateLocation = function(candidateLocation){
			self.candidateLocations.splice(self.candidateLocations.indexOf(candidateLocation),1);
			self.removeMatchingScores(function(score) { return score.candidateLocation == candidateLocation; });
			
			self.changeCount(self.changeCount() + 1);
		};
		
		self.removeMatchingScores = function(shouldRemoveScoreFunction){
			var scoresToRemove = [];
			
			for (var i = 0; i < self.scores().length; i++){
				var score = self.scores()[i];
				
				if (shouldRemoveScoreFunction(score)){
					scoresToRemove.push(i);
				}
			}
			
			if (scoresToRemove.length > 0){
				for (var i = scoresToRemove.length - 1; i >= 0; i--){
					var scoreIndexToRemove = scoresToRemove[i];
					
					self.scores.splice(scoreIndexToRemove,1);
				}
			}
			
			self.changeCount(self.changeCount() + 1);
		};
		
		self.addVisitLocation = function(visitLocation) {
			for (var i = 0; i < self.candidateLocations().length; i++) {
				var candidate = self.candidateLocations()[i];
				
				var newRouteData = new RouteData(candidate, visitLocation);
				candidate.routeDataArray.push(newRouteData);
				
				self.lookupRoute(newRouteData);
			}
			self.visitLocations.push(visitLocation);
			visitLocation.isCommitted(true);
			
			self.changeCount(self.changeCount() + 1);
		};
		
		self.removeVisitLocation = function(visitLocation){
			self.visitLocations.splice(self.visitLocations().indexOf(visitLocation),1);

            for (var i = 0; i < self.candidateLocations().length; i++) {
                var candidate = self.candidateLocations()[i];

                var indexToRemove = null;

                for (var j=0; j < candidate.routeDataArray().length; j++){
                    var entry = candidate.routeDataArray()[j];

                    if (entry.visitLocation() == visitLocation) {
                        indexToRemove = j;
                        break;
                    }
                }

                if (indexToRemove >= 0) {
                    candidate.routeDataArray().splice(indexToRemove, 1);
                }
            }

			self.changeCount(self.changeCount() + 1);
		};
		
		self.findBuiltinScorer = function(){
			var builtinScorer = null;
			for(var i = 0; i < self.people().length; i++) {
				var person = self.people()[i];
				
				if (person.isBuiltin()){
					builtinScorer = person;
					break;
				}
			}
			
			return builtinScorer;
		};
		
		self.removePersonScores = function(person){
			var scoresToRemove = [];
			for (var j = 0; j < self.scores().length; j++){
				var score = self.scores()[j];
				if (score.person() == person){
					scoresToRemove.push(j);
				} 
			}
			
			if (scoresToRemove.length > 0){
				for (var i = scoresToRemove.length - 1; i >= 0; i--){
					var scoreIndexToRemove = scoresToRemove[i];
					self.scores.splice(scoreIndexToRemove,1);
				}
			}
		};
		
		self.collateMeasureScores = function(builtinScorer){
			for(var i = 0; i < self.measures().length; i++) {
				var measure = self.measures()[i];
				var measureScores = [];
				
				var allCandidatesHaveScoresForMeasure = true;
				
				for(var k = 0; k < self.candidateLocations().length; k++) {
					var candidateLocation = self.candidateLocations()[k];
					
					var scoresToAggregate = [];
					var totalScore = 0.0;
					var contributingScoreCount = 0;
					
					for (var j = 0; j < self.scores().length; j++){
						var score = self.scores()[j];
						
						if (score.measure() == measure && score.candidateLocation() == candidateLocation){
							if (score.scoreValue() >= 0){
								totalScore += score.scoreValue();
								contributingScoreCount++;
							}
						}
					}
					
					if (contributingScoreCount > 0){
						var measureScore = new Score(builtinScorer, measure, candidateLocation);
						measureScore.scoreValue((totalScore * 1.0) / contributingScoreCount);
                        measureScores.push(measureScore);
					}
					else{
                        allCandidatesHaveScoresForMeasure = false;
					}
				}
				
				if (allCandidatesHaveScoresForMeasure){
                    self.scores().addRange(measureScores);
				}
			}
		};
		
		self.collateRouteScores = function(builtinScorer){
			var travelTimeMeasure = null;
			var distanceMeasure = null;
			
			for(var i = 0; i < self.measures().length; i++) {
				var measure = self.measures()[i];
				
				if (measure.name() == "Travel Time"){
					travelTimeMeasure = measure;
				}
				
				if (measure.name() == "Straight Line Distance"){
					distanceMeasure = measure;
				}
			}
			
			// first parse.. determine which routes to include
			var routeDataToInclude = [];
			
			for(var i = 0; i < self.visitLocations().length; i++) {
				var visitLocation = self.visitLocations()[i];
				var visitRouteData = [];
				var allLocationsHaveRouteData = true;
				
				for(var k = 0; k < self.candidateLocations().length; k++) {
					var candidateLocation = self.candidateLocations()[k];
					var hasRouteData = false;
					
					for (var j = 0; j < candidateLocation.routeDataArray().length; j++){
						var routeData = candidateLocation.routeDataArray()[j];
						
						if (routeData.visitLocation() == visitLocation && routeData.effectiveDurationMinutes() > 0){
							hasRouteData = true;
							visitRouteData.push(routeData);
							break;
						}
					}
					
					if (!hasRouteData){
						allLocationsHaveRouteData = false;
						break;
					}
				}
				
				if (allLocationsHaveRouteData){
					routeDataToInclude.addRange(visitRouteData);
				}
			}
			
			// second parse... aggregate
			var minTotalDistance = null;
			var minTotalScore = null;
			
			var distanceScores = [];
			var travelTimeScores = [];
			
			for(var k = 0; k < self.candidateLocations().length; k++) {
				var candidateLocation = self.candidateLocations()[k];
				var totalDistance = 0;
				var totalScore = 0;
					
				for(var i = 0; i < routeDataToInclude.length; i++) {
					var rd = routeDataToInclude[i];
					if (rd.candidateLocation() == candidateLocation){
						totalDistance += rd.calculateLatLongDistance();
						totalScore += rd.scoreMinutes();
					}
				}
				
				if (minTotalDistance == null || totalDistance < minTotalDistance) {
					minTotalDistance = totalDistance;
				}
				
				if (minTotalScore == null || totalScore < minTotalScore) {
					minTotalScore = totalScore;
				}
				
				var travelTimeScore = new Score(builtinScorer, travelTimeMeasure, candidateLocation);
				var distanceScore = new Score(builtinScorer, distanceMeasure, candidateLocation);
				
				travelTimeScore.scoreValue(totalScore);
				distanceScore.scoreValue(totalDistance);
				
				distanceScores.push(distanceScore);
				travelTimeScores.push(travelTimeScore);
			}
			
			if (minTotalScore > 0){
				for(var i = 0; i < travelTimeScores.length; i++) {
					travelTimeScore = travelTimeScores[i];
					if (travelTimeScore.scoreValue() > 0){
						travelTimeScore.scoreValue(10 / ((travelTimeScore.scoreValue() * 1.0) / minTotalScore));
					}
				}
				
				self.scores().addRange(travelTimeScores);
			}
			
			if (minTotalDistance > 0){
				for(var i = 0; i < distanceScores.length; i++) {
					distanceScore = distanceScores[i];
					if (distanceScore.scoreValue() > 0){
						distanceScore.scoreValue(10 / ((distanceScore.scoreValue() * 1.0) / minTotalDistance));
					}
				}
				
				self.scores().addRange(distanceScores);
			}
		};
	
		self.collateScores = function(){
			
			// find the builtin scorer
			var builtinScorer = self.findBuiltinScorer();
			
			// remove aggregate scores
			self.removePersonScores(builtinScorer);
			
			// collate scores for each measure
			self.collateMeasureScores(builtinScorer);
			
			// collate travel time and distance scores
			self.collateRouteScores(builtinScorer);
		};
		
		self.lookupRoute = function(routeData){
            if (!self.disableRouteLookup()){
                routeData.lookupRoute(self.directionsService());
            }
		};

        self.convertArrayToPersistableObject = function(array){
            var po = [];

            if (array){
                for(var i=0;i<array.length;i++) {
                    var item = array[i];

                    po.push(item.toPersistableObject());
                }
            }

            return po;
        };

        self.toPersistableObject = function() {
            var po = {};

            po.id= self.id();
            po.name = self.name();
            po.createdDateTime = self.createdDateTime();

            po.mapBounds = self.mapBounds().toPersistableObject();

            po.changeCount = self.changeCount();

            po.visitLocations = self.convertArrayToPersistableObject(self.visitLocations());
            po.candidateLocations = self.convertArrayToPersistableObject(self.candidateLocations());
            po.measures = self.convertArrayToPersistableObject(self.measures());
            po.people = self.convertArrayToPersistableObject(self.people());
            po.scores = self.convertArrayToPersistableObject(self.scores());

            return po;
        };
	}
	namespace.Project = Project;
	Project.populateArrayFromPersistableArray = function(arrayToPopulate, poArray, classType, project) {
        if (poArray) {
            for (var i = 0; i < poArray.length; i++){
                po = poArray[i];
                arrayToPopulate.push(classType.fromPersistableObject(po, project));
            }
        }
    }

    Project.fromPersistableObject = function(po) {
        namespace.currentIdGenerator.ensureNextBeyond(po.id);

        var newInstance = new Project();

        newInstance.id(po.id);
        newInstance.name(po.name);
        newInstance.createdDateTime(po.createdDateTime);


        newInstance.mapBounds(MapBounds.fromPersistableObject(po.mapBounds, newInstance));

        newInstance.changeCount(po.changeCount);

        Project.populateArrayFromPersistableArray(newInstance.measures, po.measures, Measure, newInstance);
        Project.populateArrayFromPersistableArray(newInstance.people, po.people, Person, newInstance);
        Project.populateArrayFromPersistableArray(newInstance.visitLocations, po.visitLocations, VisitLocation, newInstance);
        Project.populateArrayFromPersistableArray(newInstance.candidateLocations, po.candidateLocations, CandidateLocation, newInstance);
        Project.populateArrayFromPersistableArray(newInstance.scores, po.scores, Score, newInstance);

        return newInstance;
    };
    Project.getArrayItem = function(arrayToSearch, id) {
        var item = null;

        if (arrayToSearch && id) {
            for (var i =0; i < arrayToSearch.length; i++) {
                var itemToCheck = arrayToSearch[i];
                if (itemToCheck.id && itemToCheck.id() == id) {

                    item = itemToCheck;
                    break;
                }
            }
        }

        return item;
    }

	function AnalysisViewModel(currentProject, plotElement) {
		var self = this;
		
		self.currentChartName = ko.observable("Chart");
		self.currentProject = ko.observable(currentProject);
		self.plotElement = plotElement;
        self.chartNote = ko.observable();
        self.hyphenChars = 7;

        self.hyphenate = function(text, hyphenChars) {
            var textOut = "";

            var countSinceLastSpaceOrHyphen = 0;

            for(var i = 0; i < text.length; i++) {
                var char = text[i];

                if (char == " " || char == "-") {
                    countSinceLastSpaceOrHyphen = 0;
                } else {
                    if (countSinceLastSpaceOrHyphen >= hyphenChars) {
                        textOut += "-";
                        countSinceLastSpaceOrHyphen = 0;
                    }   else {
                        countSinceLastSpaceOrHyphen++;
                    }
                }

                textOut += char;
            }

            return textOut;
        }

        self.changeProject = function(currentProject) {
            self.currentProject(currentProject);
        }

		self.plotStackedScores = function(){
            self.chartNote("This charts illustrates scores calculated from travel times and measures.  Higher scores are typically considered better.  A low travel-time results in a higher score.");

            self.currentProject().collateScores();
			self.currentChartName("Working...");

			self.plotElement.empty();
			
			var seriesArray = [];
			var xaxisTicks = [];
			var stack = 0, bars = true, lines = false, steps = false;
    
			for(var i = 0; i < self.currentProject().candidateLocations().length; i++){
				var candidateLocation = self.currentProject().candidateLocations()[i];
				xaxisTicks.push([i, self.hyphenate(candidateLocation.name(), self.hyphenChars)]);
			}
			
			var builtinScorer = self.currentProject().findBuiltinScorer();
			
			for(var j = 0; j < self.currentProject().measures().length; j++){
				var measure = self.currentProject().measures()[j];
                var allCandidatesHaveScoreData = true;
                var measureSeriesData = [];

                if (measure.weighting() > 0){
					for(var i = 0; i < self.currentProject().candidateLocations().length; i++){
						var candidateLocation = self.currentProject().candidateLocations()[i];
						var matchingScore = null;
						
						for (var k = 0; k < self.currentProject().scores().length; k++){
							var score = self.currentProject().scores()[k];
							
							if (score.candidateLocation() == candidateLocation && score.measure() == measure && score.person() == builtinScorer){
								matchingScore = score;
								break;
							}
						}
						
						if (matchingScore != null){
							var value = matchingScore.scoreValue();
							
							if (value && !isNaN(value)){
								var adjustedScore = value * measure.weighting();
                                measureSeriesData.push([i, adjustedScore]);
                            }
							else{
                                allCandidatesHaveScoreData = false;
							}
						}
						else{
                            allCandidatesHaveScoreData = false;
						}
					}

                    if (allCandidatesHaveScoreData){
                        var measureSeries = {
                            stack: stack,
                            label: measure.name(),
                            data: measureSeriesData,
                            lines: { show: lines, fill: true, steps: steps },
                            bars: { show: bars, barWidth: 0.6 }
                        }

                        seriesArray.push(measureSeries);
                    }
				}
			}

            var maxScore = 0.0;

            for(var i = 0; i < self.currentProject().candidateLocations().length; i++){
                var candidateScore = 0;

                for (var j in seriesArray) {
                    var measureSeriesItem = seriesArray[j];
                    if (measureSeriesItem.data && typeof measureSeriesItem.data !== 'undefined') {
                        if (measureSeriesItem.data.length > i) {
                            candidateScore += measureSeriesItem.data[i][1];
                        }
                    }
                }

                if (candidateScore > maxScore){
                    maxScore =  candidateScore;
                }
            }

            var yAxisMax = (maxScore / 2.0) * 3.0;

			$.plot(self.plotElement, seriesArray, {
				legend: { show: true },
				xaxis: { show: true, ticks: xaxisTicks },
                yaxis: {show: false, max: yAxisMax }
			});
			
			self.currentChartName("Scores");
			return true;
		};
		
		self.plotStackedTravelTimes = function(){
            self.chartNote("This chart plots travel times in minutes between candidate and visit locations (adjusted for frequency).");
			self.currentChartName("Working...");
			self.plotRouteDataStacked(function(routeData){ return routeData.scoreMinutes(); });
			self.currentChartName("Travel Times");
			return true;
		};
		
		self.plotStackedSingleTrip = function(){
            self.chartNote("This chart plots travel times in minutes between candidate and visit locations (not frequency adjusted).");
            self.currentChartName("Working...");
			self.plotRouteDataStacked(function(routeData){ return routeData.durationMinutes(); });
			self.currentChartName("Travel Times (single trip)");
			return true;
		};
		
		self.plotStackedDistance = function(){
            self.chartNote("This chart plots distances between candidate and visit locations (adjusted for frequency).");
            self.currentChartName("Working...");
			self.plotRouteDataStacked(function(routeData){ 
				var result = routeData.calculateLatLongDistance();
				if (routeData.visitLocation().frequency() && isNaN(routeData.visitLocation().frequency())){
					result = result *  routeData.visitLocation().frequency();
				}
				
				return result; 
			});
			self.currentChartName("Distance (straight-line, frequency adjusted)");
			return true;
		};
		
		self.plotStackedDistanceSingle = function(){
            self.chartNote("This chart plots travel distances between candidate and visit locations (not frequency adjusted).");
            self.currentChartName("Working...");
			
			self.plotRouteDataStacked(function(routeData){ 
				return routeData.calculateLatLongDistance(); 
			});
			
			self.currentChartName("Distance (straight-line, single trip)");
			return true;
		};
						
		self.plotRouteDataStacked = function(valueFunction){
			self.currentProject().collateScores();
			var seriesArray = [];
			var xaxisTicks = [];
			var stack = 0, bars = true, lines = false, steps = false;
    
			for(var i = 0; i < self.currentProject().candidateLocations().length; i++){
				var candidateLocation = self.currentProject().candidateLocations()[i];
				xaxisTicks.push([i, "from:<br/>" + self.hyphenate(candidateLocation.name(), self.hyphenChars)]);
			}
			
			for(var j = 0; j < self.currentProject().visitLocations().length; j++){
				var visitLocation = self.currentProject().visitLocations()[j];
				
				var visitLocationSeriesData = [];
				var allCandidatesHaveVisitLocationData = true;
				
				for(var i = 0; i < self.currentProject().candidateLocations().length; i++){
					var candidateLocation = self.currentProject().candidateLocations()[i];
					
					var matchingRouteData = null;
					
					for (var k = 0; k < candidateLocation.routeDataArray().length; k++){
						var routeDataEntry = candidateLocation.routeDataArray()[k];
						
						if (routeDataEntry.visitLocation() && routeDataEntry.visitLocation().name() == visitLocation.name()){
							matchingRouteData = routeDataEntry;
							break;
						}
					}
					
					if (matchingRouteData != null){
						var value = valueFunction(matchingRouteData);
						
						if (value && !isNaN(value)){
							visitLocationSeriesData.push([i, value]);
						}
						else{
							allCandidatesHaveVisitLocationData = false;
						}
					}
					else{
						allCandidatesHaveVisitLocationData = false;
					}
				}
				
				if (allCandidatesHaveVisitLocationData){
					var newSeries = {
						stack: stack,
						label: "to: " + visitLocation.name(),
						data: visitLocationSeriesData,
						lines: { show: lines, fill: true, steps: steps },
						bars: { show: bars, barWidth: 0.6 }
					}
					
					seriesArray.push(newSeries);
				}
			}

            var maxScore = 0.0;

            for(var i = 0; i < self.currentProject().candidateLocations().length; i++){
                var candidateScore = 0;

                for (var j in seriesArray) {
                    var seriesItem = seriesArray[j];
                    if (seriesItem.data && typeof seriesItem.data !== 'undefined') {
                        if (seriesItem.data.length > i) {
                            candidateScore += seriesItem.data[i][1];
                        }
                    }
                }

                if (candidateScore > maxScore){
                    maxScore =  candidateScore;
                }
            }

            var yAxisMax = (maxScore / 2.0) * 3.0;

            $.plot(self.plotElement, seriesArray, {
				legend: { show: true },
				xaxis: { show: true, ticks: xaxisTicks },
                yaxis: { max: yAxisMax }
			});
		}
	}
	namespace.AnalysisViewModel = AnalysisViewModel;
	
	function GenericAddUpdateDeleteViewModel(createNew, performAdd, performUpdate, performDelete, createClone) {
		var self = this;
		
		self.createNew = createNew;
		self.performAdd = performAdd;
		self.performUpdate = performUpdate;
		self.performDelete = performDelete;
		self.createClone = createClone;
		
		self.newItem = ko.observable(self.createNew());
		self.updateDeleteItem = ko.observable(null);
		self.updateDeleteItemClone = ko.observable(null);
		
		self.isAddingItem = ko.observable(false);
		self.isUpdatingDeletingItem = ko.observable(false);
		
		self.beginAddNewItem = function(){
			self.isAddingItem(true);
			self.isUpdatingDeletingItem(false);
			self.newItem().raiseValueHasMutated();
		}
		
		self.addNewItem = function(){
			self.performAdd(self.newItem());
			self.isAddingItem(false);
			self.newItem(self.createNew());
		}
		
		self.cancelAddNewItem = function(){
			self.isAddingItem(false);
			self.newItem(self.createNew());
		}
		
		self.beginUpdateDeleteItem = function (item) {
            self.isAddingItem(false);
            self.isUpdatingDeletingItem(true);
            self.updateDeleteItem(item);
            self.updateDeleteItemClone(self.createClone(item));
        };
		
		self.cancelUpdateDeleteItem = function(item){
			self.isAddingItem(false);
			self.isUpdatingDeletingItem(false);
			self.updateDeleteItem(null);
			self.updateDeleteItemClone(null);
		};
		
		self.updateItem = function(){
			self.performUpdate(self.updateDeleteItem(), self.updateDeleteItemClone());
			self.isUpdatingDeletingItem(false);
			self.updateDeleteItem(null);
			self.updateDeleteItemClone(null);
		};
		
		self.deleteItem = function(){
			self.performDelete(self.updateDeleteItem());
			self.isUpdatingDeletingItem(false);
			self.updateDeleteItem(null);
			self.updateDeleteItemClone(null);
		};
	}
	namespace.GenericAddUpdateDeleteViewModel = GenericAddUpdateDeleteViewModel;

    function TravelTimeViewModel(currentProject) {
        var self = this;

        self.currentProject = ko.observable(currentProject);
        self.itemToUpdate = ko.observable(null);
        self.updateItemClone = ko.observable(null);
        self.isUpdatingItem = ko.observable(false);

        self.changeProject = function(currentProject) {
            self.currentProject(currentProject);
        }

        self.beginUpdateItem = function (item) {
            self.isUpdatingItem(true);
            self.itemToUpdate(item);
            self.updateItemClone(item.clone());
        };

        self.cancelUpdateItem = function(item){
            self.isUpdatingItem(false);
            self.itemToUpdate(null);
            self.updateItemClone(null);
        };

        self.updateItem = function(){
            self.itemToUpdate().copyFrom(self.updateItemClone());
            self.isUpdatingItem(false);
            self.itemToUpdate(null);
            self.updateItemClone(null);
        };

        self.lookupRoute = function(routeData) {
            routeData.lookupRoute(self.currentProject().directionsService());
        };
    }
    namespace.TravelTimeViewModel = TravelTimeViewModel;

	function ScoreViewModel(currentProject) {
		var self = this;
		self.currentProject = ko.observable(currentProject);
		self.selectedScorer = ko.observable(null);
		self.selectedMeasure = ko.observable(null);
		self.selectedCandidateLocation = ko.observable(null);
		
		self.filteredScores = ko.observable(null);

        self.changeProject = function(currentProject) {
            self.currentProject(currentProject);
            self.filterScores();
        }

        self.filterScores = function(){
			var selectedScores = [];
			
			for(var i=0; i<self.currentProject().scores().length;i++){
				var score = self.currentProject().scores()[i];
				
				if ( (self.selectedScorer() == null || self.selectedScorer() == score.person())
					&& (self.selectedMeasure() == null || self.selectedMeasure() == score.measure())
					&& (self.selectedCandidateLocation() == null || self.selectedCandidateLocation() == score.candidateLocation())){
					
					if(score.measure().isBuiltin() == false && score.person().isBuiltin() == false){
						selectedScores.push(score);
					}
				}
			}
			
			selectedScores.sort(function(first,second){
				var returnValue = -1;
				
				if (first.person().name() > second.person().name()){
					returnValue = 1;
				}
				else if (first.person().name() == second.person().name()){
					if(first.candidateLocation() != null && second.candidateLocation()!= null) {
                        if (first.candidateLocation().name() > second.candidateLocation().name()){
                            returnValue = 1;
                        }
                        else if (first.candidateLocation().name() == second.candidateLocation().name()){
                            if (first.measure().name() > second.measure().name()){
                                returnValue = 1;
                            }
                            else if (first.measure().name() == second.measure().name()){
                                returnValue = 0;
                            }
                        }
                    }
				}
			});
			
			
			var lastPersonName = "";
			var lastlocationName = "";
			
			for(var i=0;i<selectedScores.length;i++){
				var score = selectedScores[i];
				var isFirstInCategory = false;
				
				if (lastPersonName != score.person().name()
					|| (score.candidateLocation() != null && lastlocationName != score.candidateLocation().name())){
					isFirstInCategory = true;
				}
			
				score.isFirstInCategory(isFirstInCategory);
				
				lastPersonName = score.person().name();
				lastlocationName = "";

                if (score.candidateLocation() != null) {
                    lastlocationName = score.candidateLocation().name();
                }
            }
			
			self.filteredScores(selectedScores);
		}
	}
    namespace.ScoreViewModel = ScoreViewModel;

	function MapViewModel(currentProject, mapElement) {
		var self = this;
		
		self.currentProject = ko.observable(currentProject);
		self.mapControl = null;
		self.mapElement = mapElement;
		self.configuration = new Configuration();
		
		self.searchAddress = ko.observable('');
		self.searchAddressEntered = ko.computed(function() { return (self.searchAddress() && self.searchAddress().length > 0);});

        self.defaultLat = ko.observable(39.743943);
        self.defaultLng = ko.observable(-105.020089500);

		self.searchCoordinate = ko.observable(new Coordinate(self.defaultLat(), self.defaultLng()));
		self.candidateLocation = ko.observable(null);
		self.visitLocation = ko.observable(null);
		self.candidateLocationClone = ko.observable(null);
		self.visitLocationClone = ko.observable(null);
		
		self.isPlacingCandidateLocation = ko.observable(false);
		self.isPlacingVisitLocation = ko.observable(false);
		self.isAddingCandidate = ko.observable(false);
		self.isAddingVisit = ko.observable(false);
		self.isUpdatingDeletingCandidate = ko.observable(false);
		self.isUpdatingDeletingVisit = ko.observable(false);
        self.isShowingGuidance = ko.observable(false);
        self.isMapInitialised = ko.observable(false);

        self.initialiseMap = function() {
            self.isMapInitialised(true);

            var coord = self.searchCoordinate();
            var centerLatLng =  new google.maps.LatLng(coord.lat(), coord.lng());

            if (self.currentProject()) {
                var bounds = self.currentProject().mapBounds();

                if (bounds && bounds.isInitialised()){
                    var center = bounds.getCenter();
                    centerLatLng =  new google.maps.LatLng(center.lat(), center.lng());
                }
            }

            var mapOptions = {
                zoom: 8,
                center: centerLatLng,
                zoomControl: false,
                streetViewControl: false,
                scaleControl: true,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            self.mapControl = new google.maps.Map(self.mapElement, mapOptions);
            self.geocoder = new google.maps.Geocoder();

            google.maps.event.addListener(self.mapControl, 'center_changed', function() {
                self.saveMapPosition();
            });

            google.maps.event.addListener(self.mapControl, 'zoom_changed', function() {
                self.saveMapPosition();
            });

            google.maps.event.addListener(self.mapControl, 'click', self.mapClicked);

            self.handleResize();
			self.changeProject(self.currentProject());
        };

        self.setInitialSearchCoordinate = function() {
            // Try HTML5 geolocation
            if(navigator && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    if (!self.isMapInitialised()) {
                        self.searchCoordinate = ko.observable(new Coordinate(position.coords.latitude, position.coords.longitude));
                    }
                }, function() {
                    console.log("No geolocation available");
                });
            }
        }

        self.onPageShow = function() {
            if (!self.isMapInitialised()) {
                self.initialiseMap();
            }

            self.handleResize();

            if (self.currentProject() && self.currentProject().candidateLocations().length == 0 && self.currentProject().visitLocations().length == 0) {
                self.isShowingGuidance(true);
            }
        };

        self.handleResize = function() {
            //self.mapElement.style.width ='100%';
            //self.mapElement.style.height ='100%';
            //self.mapControl.setSize();
        };

        self.saveMapPosition = function(evt) {
            if (self.mapControl && self.currentProject()) {
                var bounds = self.mapControl.getBounds();

                if (bounds != null) {
                    var ne = bounds.getNorthEast();
                    var sw = bounds.getSouthWest();
                    self.currentProject().mapBounds(new MapBounds(ne.lat(), ne.lng(), sw.lat(), sw.lng()));
                    self.currentProject().mapBounds().zoomLevel(self.mapControl.getZoom());

                    console.log("saving zoom level: " + self.mapControl.getZoom());
                }
            }
        }

        self.resetMapPosition = function()  {
            if (self.mapControl && self.currentProject()) {
                var bounds = self.currentProject().mapBounds();

                if (bounds && bounds.isInitialised()){
                    var center = bounds.getCenter();

                    console.log("resetting zoom level: " + bounds.zoomLevel());

                    self.mapControl.setZoom(bounds.zoomLevel());
                    self.mapControl.setCenter(new google.maps.LatLng(center.lat(), center.lng()));
                }
            }
        }

        self.changeProject = function(currentProject) {
            var previousProject = self.currentProject();
            if (previousProject) {
                if (previousProject.candidateLocations()) {
                   for (var i=0;i<previousProject.candidateLocations().length;i++) {
                       var location = previousProject.candidateLocations()[i];
                       if (location && location.shape()) {
                           location.shape().setMap(null);
                       }
                   }
                }

                if (previousProject.visitLocations()) {
                    for (var i=0;i<previousProject.visitLocations().length;i++) {
                        var location = previousProject.visitLocations()[i];
                        if (location && location.shape()) {
                            location.shape().setMap(null);
                        }
                    }
                }
            }

            self.currentProject(currentProject);
            self.cancelCurrentActions();

            if (currentProject) {
                if (currentProject.candidateLocations()) {
                    for (var i=0;i<currentProject.candidateLocations().length;i++) {
                        var location = currentProject.candidateLocations()[i];

                        if (location) {
                           var rawCoord = { lat: location.coordinate().lat(), lng: location.coordinate().lng() };
                           var cdt = self.createCandidateShape(rawCoord);

                           location.shape(cdt);
                           self.setShapeName(location);
                        }
                    }
                }

                if (currentProject.visitLocations()) {
                    for (var i=0;i<currentProject.visitLocations().length;i++) {
                        var location = currentProject.visitLocations()[i];
                        if (location) {
                            var rawCoord = { lat: location.coordinate().lat(), lng: location.coordinate().lng() };
                            var vst = self.createVisitShape(rawCoord);

                            location.shape(vst);
                            self.setShapeName(location);
                        }
                    }
                }

                self.resetMapPosition();
            }
        }
		
		self.beginSearch = function(){
			self.cancelCurrentActions();
            $(self.mapElement).focus();
            self.geocoder.geocode( { 'address': self.searchAddress()}, self.searchComplete);
        }
		
		self.searchComplete = function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                self.mapControl.setCenter(results[0].geometry.location);
                self.searchCoordinate(new Coordinate(results[0].geometry.location.lat(), results[0].geometry.location.lng()));
                self.saveMapPosition();
            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        };
		
		self.cancelCurrentActions = function(){
			self.isPlacingCandidateLocation(false);
			self.isPlacingVisitLocation(false);
			self.isAddingCandidate(false);
			self.isAddingVisit(false);
			self.isUpdatingDeletingCandidate(false);
			self.isUpdatingDeletingVisit(false);
            self.isShowingGuidance(false);
			
			if (self.candidateLocation() != null && self.candidateLocation().shape() && !self.candidateLocation().isCommitted()){
				self.candidateLocation().shape().setMap(null);
			}
			
			if (self.visitLocation() != null && self.visitLocation().shape() && !self.visitLocation().isCommitted()){
			    self.visitLocation().shape().setMap(null);
			}
			
			self.candidateLocation(null);
			self.visitLocation(null);
			self.candidateLocationClone(null);
			self.visitLocationClone(null);
		};
		
		self.beginPlaceCandidate = function(){
            if (self.configuration.MAX_CANDIDATE_LOCATIONS <= self.currentProject().candidateLocations().length) {
                alert("The maximum number of candidate locations has been reached.  Navigate to the home page and 'start new' in order to evaluate other locations.");
            }
            else {
                self.cancelCurrentActions();
                self.isPlacingCandidateLocation(true);
            }
		};
		
		self.beginPlaceVisit = function(){
            if (self.configuration.MAX_VISIT_LOCATIONS <= self.currentProject().visitLocations().length) {
                alert("The maximum number of visit locations has been reached.  Navigate to the home page and 'start new' in order to evaluate other locations.");
            }
            else {
                self.cancelCurrentActions();
			    self.isPlacingVisitLocation(true);
            }
		};
		
		self.beginAddCandidate = function(coordinate, shape){
            self.cancelCurrentActions();
			self.isAddingCandidate(true);
			self.candidateLocation(new CandidateLocation(coordinate, shape));
			self.candidateLocation().raiseValueHasMutated();
		};
		
		self.beginAddVisit = function(coordinate, shape){
            self.cancelCurrentActions();
			self.isAddingVisit(true);
			self.visitLocation(new VisitLocation(coordinate, shape));
			self.visitLocation().raiseValueHasMutated();
		};
		
		self.addCandidate = function(){
			var candidate = self.candidateLocation();
		
			self.currentProject().addCandidateLocation(candidate);
            self.setShapeName(candidate);

            self.cancelCurrentActions();
		};
		
		self.addVisit = function(){
			var visit = self.visitLocation();
			
			self.currentProject().addVisitLocation(visit);
            self.setShapeName(visit);

            self.cancelCurrentActions();
		};
		
		self.beginUpdateDeleteVisitLocation = function(location){
			self.cancelCurrentActions();
			
			self.isUpdatingDeletingVisit(true);
			self.visitLocation(location);
			self.visitLocationClone(self.visitLocation().clone());
		};
		
		self.beginUpdateDeleteCandidateLocation = function(location){
			self.cancelCurrentActions();
			
			self.candidateLocation(location);
			self.candidateLocationClone(self.candidateLocation().clone());
		
			self.isUpdatingDeletingCandidate(true);
			
		};
		
		self.updateVisitLocation = function(){
			self.visitLocation().copyFrom(self.visitLocationClone());
            self.setShapeName(self.visitLocation());
            self.cancelCurrentActions();
		};
		
		self.updateCandidateLocation = function(){
			self.candidateLocation().copyFrom(self.candidateLocationClone());
            self.setShapeName(self.candidateLocation());
            self.cancelCurrentActions();
		};
		
		self.deleteVisitLocation = function(){
			self.currentProject().removeVisitLocation(self.visitLocation());
			self.visitLocation().shape().setMap(null);
            self.cancelCurrentActions();
		};

        self.deleteCandidateLocation = function(){
			self.currentProject().removeCandidateLocation(self.candidateLocation());
            self.candidateLocation().shape().setMap(null);
			self.cancelCurrentActions();
		};

        self.setShapeName = function(location) {
            location.shape().displayName = location.name();
        }

        self.createShape = function(rawCoord, image) {
            var latLng = new google.maps.LatLng(rawCoord.lat, rawCoord.lng);
            var marker = new google.maps.Marker({
                position: latLng,
                map: self.mapControl,
                icon: image
            });

            google.maps.event.addListener(marker, 'click', function() {
                if (typeof marker.displayName !== 'undefined') {
                    var infowindow = new google.maps.InfoWindow({
                        content: '<p>' + marker.displayName + '<br/><br/><a href="#locationPage">View Locations</a></p>'
                    });

                    infowindow.open(self.mapControl,marker);
                }
            });

            return marker;
        };

        self.createVisitShape = function(rawCoord) {
            var image = "images/map-marker-visit.png";
            return self.createShape(rawCoord, image);
        };

        self.createCandidateShape = function(rawCoord) {
            var image = "images/map-marker-candidate.png";
            return self.createShape(rawCoord, image);
        };

        self.mapClicked = function(evt){
			var clickCoordinate = new Coordinate(evt.latLng.lat(), evt.latLng.lng());
			var rawCoord = { lat: evt.latLng.lat(), lng: evt.latLng.lng() };
			if (self.isPlacingCandidateLocation()) {
				var cdt = self.createCandidateShape(rawCoord);
;
				self.beginAddCandidate(clickCoordinate, cdt);
			}
	
			if (self.isPlacingVisitLocation()) {

				var vst = self.createVisitShape(rawCoord);

				self.beginAddVisit(clickCoordinate, vst);
			}
	
			nextClickAction = 'None';
		};
	}
	namespace.MapViewModel = MapViewModel;

	function ApplicationViewModel(mapElement, onInitCallback) {
		var self = this;

        self.projectAwareViewModels = [];
        self.currentProject = ko.observable();
        self.hasInitialised = false;
        self.canContinue = ko.observable(false);

        self.directionsService = new google.maps.DirectionsService();

        self.startNewExplicit = function() {
            self.makeNewProject();
            self.canContinue(true);
            self.navigate('#mapPage');
        }

        self.makeNewProject= function () {
            var project = new Project();
            project.createDefaultMeasures();
            project.createDefaultPeople();

            self.switchProject(project);
        };

        self.switchProject = function (project) {
            self.currentProject(project);
            self.currentProject().directionsService(self.directionsService);
            self.currentProject().changeCount.subscribe(self.handleProjectDataChange);

            for(var i=0; i<self.projectAwareViewModels.length; i++) {
                var viewModel = self.projectAwareViewModels[i];
                viewModel.changeProject(self.currentProject());
            }
        }

        self.saveCurrent= function(){
            if (self.currentProject()) {
                var po = self.currentProject().toPersistableObject();
                localStorage.setItem("currentProject", JSON.stringify(po));
            }
        };

        self.handleProjectDataChange= function(newValue){
            self.scoreViewModel.filterScores();
        };

        self.loadCurrent= function(){
            var project = null;

            try {
                var poString = localStorage.getItem("currentProject");
                if (poString)
                {
                    console.log(poString);
                    var po = JSON.parse(poString);
                    if (po){
                        project = Project.fromPersistableObject(po);
                    }
                }

            } catch(err){
                console.log("An error has occured while attempting to load previous progress.");
                console.log(err);
            }

            return project;
        };

        var project = self.loadCurrent();
        if (project){
            self.switchProject(project);
            self.canContinue(true);
        }
        else{
            self.makeNewProject();
        }

		self.scoreViewModel = new ScoreViewModel(self.currentProject());
        self.projectAwareViewModels.push(self.scoreViewModel);

        self.travelTimeViewModel = new TravelTimeViewModel(self.currentProject());
        self.projectAwareViewModels.push(self.travelTimeViewModel);

        self.measureAddUpdateDeleteViewModel = new GenericAddUpdateDeleteViewModel(
				function () { return new Measure(); },
				function (measure) { self.currentProject().addMeasure(measure); },
				function (measure, clone) { measure.copyFrom(clone); },
				function (measure) { self.currentProject().removeMeasure(measure); },
				function (measure) { return measure.clone(); }
			);

		self.personAddUpdateDeleteViewModel = new GenericAddUpdateDeleteViewModel(
				function () { return new Person(); },
				function (person) { self.currentProject().addPerson(person); },
				function (person, clone) { person.copyFrom(clone); },
				function (person) { self.currentProject().removePerson(person); },
				function (person) { return person.clone(); }
			);

		self.mapViewModel = new MapViewModel(self.currentProject(), mapElement);
        self.mapViewModel.setInitialSearchCoordinate();

        self.projectAwareViewModels.push(self.mapViewModel);
        self.analysisViewModel = new AnalysisViewModel(self.currentProject(), $("#plotChart"));
        self.projectAwareViewModels.push(self.analysisViewModel);

        self.navigate = function(panel){
            $.mobile.changePage(panel);
        }

        self.hasInitialised = true;

        if (onInitCallback) {
            onInitCallback(self);
        }
    }
	namespace.ApplicationViewModel = ApplicationViewModel;
	
	function App(mapElement) {
		var self = this;

        self.configuration = new Configuration();
		self.viewModel = null;
		self.mapElement = mapElement;
		
		// enable validation
		var validationOptions = { insertMessages: true, decorateElement: true };
		ko.validation.init(validationOptions);
		
		self.run = function() {
			self.viewModel = new ApplicationViewModel(self.mapElement, self.onViewModelInit);
		}

        self.onViewModelInit = function(viewModel) {
            var smallestDimension = Math.min($(window).width(), $(window).height());
            if (smallestDimension < 650) {
                viewModel.popupDialogOptions = { x: 0, y: 0 };
                viewModel.popupOptions = { x: 0, y: 0 };
            }
            else{
                viewModel.popupDialogOptions = { };
                viewModel.popupOptions = { x: 0, y: 0 };
            }

            ko.applyBindings(viewModel);
        }

	}
	
	namespace.App = App;
	
})(window.wisemove);
