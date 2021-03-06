angular.module('lunchCorgi.events', [])

.controller('EventsController', function ($scope, $window, $location, Events, Event) {

  $scope.event = {}



  $scope.createMap = function(){
    return Event.createMap(30.2958, -97.8101, "map-submit", $scope)
  }()

  //if $scope.invalid is true, it will display an error message in the view
  $scope.invalid = false

  $scope.joinEvent = function(evt) {
    $scope.event = evt;
    var userToken = $window.localStorage.getItem('com.corgi');
    Events.joinEvent(evt, userToken, $scope.viewAllEvents);
    //Events.joinEvent(evt, userToken);
  }

  $scope.eventDetails = function(evt) {
    Event.eventDetails(evt);
    $location.path('/event');
  }


  $scope.addEvent = function() {
    // check that all fields in the events.html form are filled out
    // need to add a check to make sure user is logged in
    if ($scope.newEvent.description !== "" &&
        $scope.newEvent.location !== "" &&
        $scope.newEvent.datetime !== "" &&
        $scope.newEvent.lat !== "" &&
        $scope.newEvent.lng !== "") {
          $scope.invalid = false
          var userToken = $window.localStorage.getItem('com.corgi');
          Events.getLatAndLong($scope);
          Events.addEvent($scope.newEvent, userToken)
          .then(function(newEvent) {
            // need a better way to notify people, but this is simple for now
            //alert('Your event has been created: ', newEvent.description);
            // return to defaults
            $scope.viewAllEvents();
            $scope.initNewEventForm()
          });
        } else {
          $scope.invalid = true
        }
  }

  // first page of events is page number 0; when more events are viewed, the page number is increased
  $scope.pageNumber = 0

  // eventsList is an array used in the template (with ng-repeat) to populate the list of events.
  $scope.eventsList = {}

  $scope.initNewEventForm = function() {
    $scope.newEvent = {}
    //$scope.newEvent.description = ''
    //$scope.newEvent.location = ''
    $scope.newEvent.time = (new Date()).toTimeString().substr(0,5)
    $scope.newEvent.date = new Date().toISOString().substr(0,10)
    Events.getLocation($scope);
  }

  $scope.viewAllEvents = function() {
    // send request to services.js, which in turn sends the actual http request to events-controller in the server.

    if ( $window.localStorage.getItem('com.corgi') ) {
      Events.getEvents($scope.pageNumber)
      .then(function(data) {
        // set $scope.eventsList equal to the data we get back from our http request - that's how we
        // populate the actual event views in the template.
        $scope.eventsList = data;
      });
    } else {
      $location.path('/signin');
    }
  };

  $scope.nextPage = function() {
    // need some way to limit how many pages people can go forward; it seems to get messed up if people
    // navigate past where there are no more results to show.
    $scope.pageNumber++
    $scope.viewAllEvents()
  };

  $scope.prevPage = function() {
    // only go back a page if the page number is greater than 0
    if ($scope.pageNumber > 0) {
      $scope.pageNumber--
      $scope.viewAllEvents()
    }
  };

  // show events when the page is first loaded.
  $scope.viewAllEvents()
  // populate new event form with default values
  $scope.initNewEventForm()
})

.directive('smallMap', function (Event, Events)  {
  return{

    template:'<div class = "small-map" id="map-canvas{{count}}"></div>',
    compile: function(element, attr) {
      return{
        pre: function preLink($scope, element, attr) {
          Events.incrementMap($scope);
        },

        post: function postLink($scope, element, attr) {
          var divID = 'map-canvas'+ $scope.count
          Event.createMap($scope.event.lat, $scope.event.lng, divID, $scope, element);
        }
      }
    }
  }
})
