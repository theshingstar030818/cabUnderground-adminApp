var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var currDate = new Date();
var date = currDate.getDate();
var month = months[currDate.getMonth()];
var day = weekdays[currDate.getDay()];

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

// need to move to services.js
.service('ParseService', function() {
 return {
    fetchDataForSpecificDate: function(queryDate) {
      var Orders = Parse.Object.extend("Orders");
      var OrdersQuery = new Parse.Query(Orders);
      OrdersQuery.equalTo("deliveryDate", queryDate);
      OrdersQuery.include("pharmacyID");
      OrdersQuery.include("patientId");
      OrdersQuery.include("pharmacyID.pharmacyInfo");
      OrdersQuery.include("driverId");
      return OrdersQuery.find().then(function (response) {
         return response;
      });
    },
    fetchDataForSpecificDatePharmacy: function(queryDate,pharmacyIDObject) {
      var Orders = Parse.Object.extend("Orders");
      var OrdersQuery = new Parse.Query(Orders);
      OrdersQuery.equalTo("deliveryDate", queryDate);
      OrdersQuery.equalTo("pharmacyID", pharmacyIDObject);
      OrdersQuery.include("pharmacyID");
      OrdersQuery.include("patientId");
      OrdersQuery.include("pharmacyID.pharmacyInfo");
      OrdersQuery.include("driverId");
      return OrdersQuery.find().then(function (response) {
         return response;
      });
    },
    fetchDrivers: function(){
      var Drivers = Parse.Object.extend("Drivers");
      var DriversQuery = new Parse.Query(Drivers);
      return DriversQuery.find().then(function (response) {
         return response;
      });
    }
 };
})

.service('scopeService', function() {
 return {
   currentPharmacy: null,
   currDate: null,
   currentOrders: null,
   currDriver: null,
   allDriversArray: null,
   allDriversMap: null,
   allDeliveriesForTodayMap: null,
   currPharmacyOrdersDetailArray: null,

   getCurrentPharmacy: function() {
     return this.currentPharmacy;
   },
   getCurrDate: function() {
     return this.currDate;
   },
   getCurrentOrders: function() {
    return this.currentOrders;
   },
   getCurrDriver: function(){
    return this.currDriver;
   },
   getAllDriversArray: function(){
    return this.allDriversArray;
   },
   getAllDriversMap: function(){
    return this.allDriversMap;
   },
   getAllDeliveriesForTodayMap: function(){
    return this.allDeliveriesForTodayMap;
   },
   getCurrPharmacyOrdersDetailArray: function(){
    return this.currPharmacyOrdersDetailArray;
   },

   updatecurrentPharmacy: function(currentPharmacy) {
     this.currentPharmacy = currentPharmacy;
   },
   updateCurrDate: function(currDate) {
     this.currDate = currDate;
   },
  updateCurrentOrders:function(currentOrders) {
    this.currentOrders = currentOrders;
  },
  updateCurrDriver: function(currDriver) {
    this.currDriver = currDriver;
  },
  updateAlldriversArray: function(allDriversArray){
    this.allDriversArray = allDriversArray;
  },
  updateAllDriversMap: function(allDriversMap){
    this.allDriversMap = allDriversMap;
   },
   updateAllDeliveriesForTodayMap: function(allDeliveriesForTodayMap){
    this.allDeliveriesForTodayMap = allDeliveriesForTodayMap;
   },
   updateCurrPharmacyOrdersDetailArray: function(currPharmacyOrdersDetailArray){
    this.currPharmacyOrdersDetailArray = currPharmacyOrdersDetailArray;
   }

 }
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.stats', {
    url: '/stats',
    views: {
      'menuContent': {
        templateUrl: 'templates/stats.html',
        controller: 'statsCtrl'
      }
    }
  })

  .state('app.addPharmacy', {
   url: "/addPharmacy",
   views: {
     'menuContent': {
       templateUrl: "templates/addPharmacy.html",
       controller: 'pharmacyCtrl'
     }
   }
 })
 .state('app.assignDriver', {
   url: "/assignDriver",
   views: {
     'menuContent': {
       templateUrl: "templates/assignDriver.html",
       controller: 'assignDriverCtrl'
     }
   }
 })
 .state('app.viewPharmacy', {
   url: "/viewPharmacy",
   views: {
     'menuContent': {
       templateUrl: "templates/viewPharmacy.html",
       controller: 'viewPharmacyCtrl'
     }
   }
 })
 .state('app.viewSingleDelivery', {
   url: "/viewSingleDelivery",
   views: {
     'menuContent': {
       templateUrl: "templates/viewSingleDelivery.html",
       controller: 'viewSingleDeliveryCtrl'
     }
   }
 })
 .state('app.addDriver', {
     url: "/addDriver",
     views: {
       'menuContent': {
         templateUrl: "templates/addDriver.html",
         controller: 'driverCtrl'
       }
     }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/stats');
});





