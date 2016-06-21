var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var currDate = new Date();

var date = currDate.getDate();
var month = months[currDate.getMonth()];
var day = weekdays[currDate.getDay()];


currDate = new Date(currDate.getYear()+1900, currDate.getMonth(), currDate.getDate(), 0, 0, 0, 0);

angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state, $ionicActionSheet, ParseService, $ionicLoading, scopeService, $ionicPopup, $ionicModal, $timeout) {

  //current user
  $scope.currentUser = JSON.parse(localStorage.getItem('currentPaceUser'));

  // Date stuff

  //this is temporary for testing ---> must return 41 deliveries for this date
  var tmpDate = new Date(2016, 3, 13, 0, 0, 0, 0);
  $scope.currDate = tmpDate;
  //$scope.currDate = currDate;
  scopeService.updateCurrDate($scope.currDate);

  $scope.weekday = weekdays;
  $scope.monthNames = months;
  $scope.currDate = currDate;
  $scope.currDate.date = date;
  $scope.currDate.month = month;
  $scope.day = day;
  
  $ionicLoading.show({
    template: 'Loading...'
  });
  ParseService.fetchDrivers()
  .then(function(response) {
     $scope.drivers = response;
     scopeService.updateAlldriversArray(response);
     var allDriversMap = new Map();
     for (var i = 0; i < response.length; i++) { 
      allDriversMap.set(response[i].id,response[i]);
     }
     scopeService.updateAllDriversMap(allDriversMap);
     $ionicLoading.hide();
  });

  $scope.viewPharmacy = function(pharmacy, currPharmacyOrdersDetailArray) {
    $scope.currentPharmacy = pharmacy;
    $scope.currPharmacyOrdersDetailArray = currPharmacyOrdersDetailArray;
    scopeService.updatecurrentPharmacy(pharmacy);
    scopeService.updateCurrPharmacyOrdersDetailArray(currPharmacyOrdersDetailArray);
    $state.go("app.viewPharmacy");
  };
})

.controller('statsCtrl', function($scope, $state, $ionicActionSheet, $ionicLoading, ParseService, scopeService, $ionicPopup) {
  $scope.title = "Daily Stats";
  $ionicLoading.show({
    template: 'Loading...'
  });
  ParseService.fetchDataForSpecificDate(scopeService.getCurrDate())
  .then(function(response) {
    $scope.deliveries = response;
    var allDeliveriesForTodayMap = new Map();
    for (var i = 0; i < response.length; i++) { 
      allDeliveriesForTodayMap.set(response[i].id,response[i]);
     }
     scopeService.updateAllDeliveriesForTodayMap(allDeliveriesForTodayMap);
    $scope = loadMaps($scope);
    $ionicLoading.hide();
  });
})

.controller('viewPharmacyCtrl', function($scope, $state, $ionicActionSheet, $ionicLoading, ParseService, scopeService, $ionicPopup) {
  $scope.currentPharmacy = scopeService.getCurrentPharmacy();
  
  $scope.currPharmacyOrdersDetailArray = scopeService.getCurrPharmacyOrdersDetailArray();
  $scope.currDate = scopeService.getCurrDate();
  
  //set UI ng-show flags
  $scope.showPending = false;
  $scope.showInProgress = false;
  $scope.showCompleted = false;
  $scope.noPendingOrdersCard = false;
  $scope.noInProgressOrdersCard = false;
  $scope.noCompletedOrdersCard = false;
  $scope.details = false;

  if($scope.currentPharmacy != null){
    $scope.title = $scope.currentPharmacy.get("pharmacyInfo").get("businessName");
    $ionicLoading.show({template: 'Loading...'});
    ParseService.fetchDataForSpecificDatePharmacy($scope.currDate, $scope.currentPharmacy)
    .then(function(response) {
      $scope.deliveries = response;
      $scope = loadMaps($scope);
      $scope.drivers = scopeService.getAllDriversArray;
      $ionicLoading.hide();
      $scope.title = $scope.pharmacyInfoArray[0].object.get("businessName");
    });
  }else{
    window.location.replace("home.html");
  }

  $scope.assignDriver = function(ordersArray){
    scopeService.updateCurrentOrders(ordersArray);
    $state.go("app.assignDriver");
  };

  $scope.assignDriverSingleDelivery = function(order){
    var allDeliveriesForTodayMap = scopeService.getAllDeliveriesForTodayMap();
    var tmpArray = [allDeliveriesForTodayMap.get(order.objectId)];
    scopeService.updateCurrentOrders(tmpArray);
    $state.go("app.viewSingleDelivery");
  }

  $scope.flipShowPending = function(){
    if($scope.currPharmacyOrdersDetailArray.pending.length == 0){
      $scope.noPendingOrdersCard = !$scope.noPendingOrdersCard;
    }else{
      $scope.showPending = !$scope.showPending;
    }
  }

  $scope.flipShowInProgress = function(){
    
    if($scope.currPharmacyOrdersDetailArray.inProgress.length == 0){
      $scope.noInProgressOrdersCard = !$scope.noInProgressOrdersCard;
    }else{
      $scope.showInProgress = !$scope.showInProgress;
    }
  }

  $scope.flipShowCompleted = function(){
    
    if($scope.currPharmacyOrdersDetailArray.completed.length == 0){
      $scope.noCompletedOrdersCard = !$scope.noCompletedOrdersCard;
    }else{
      $scope.showCompleted = !$scope.showCompleted;
    }
  }
  $scope.flipDetails = function(){
    $scope.details = !$scope.details;
  }

})

.controller('assignDriverCtrl', function($scope, $state, $ionicActionSheet, ParseService, scopeService, $ionicPopup, $ionicLoading) {  

  $scope.title = "Assign Driver";
  $scope.currentOrders = scopeService.getCurrentOrders();
  $scope.currentPharmacy = scopeService.getCurrentPharmacy();

  if($scope.currentOrders != null){ 
    $ionicLoading.show({template: 'Loading...'});
    ParseService.fetchDrivers()
    .then(function(response) {
      $scope.drivers = response;
      $scope.filterDriverCondition={
        driverSelected: ''
      }
      $scope.showDriverCardDiv = false;
      $ionicLoading.hide();
    });
  }else{
    window.location.replace("home.html");
  }
  $scope.driverSelected = function(){
    $scope.showDriverCardDiv = true;
    $scope.currentDriverSelected = JSON.parse($scope.filterDriverCondition.driverSelected);
    scopeService.updateCurrDriver($scope.currentDriverSelected);
  }

  $scope.assigneDriverFinalize = function(){
    var driver = scopeService.getAllDriversMap().get(scopeService.getCurrDriver().objectId);
    var orders = scopeService.getCurrentOrders();
    for(var i=0; i<orders.length; i++){
      orders[i].set('driverId',driver);
      orders[i].set('deliveryStatus','In progress');
      orders[i].save();
    }
    //send notification here
    notification = {};
    
    notification.type = "notifyDriver";
    notification.params = {};
    notification.params.driver = driver;
    notification.params.orders = orders;

    sendNotification(notification);
    window.location.replace("home.html");
  }
})

.controller('viewSingleDeliveryCtrl', function($scope, $state, $ionicActionSheet, ParseService, scopeService, $ionicPopup, $ionicLoading) { 
  $scope.title = "Order Details";
  $scope.currentAvatar = "img/blackwidow.jpg";
  $scope.currentOrders = scopeService.getCurrentOrders();
  $scope.currentPharmacy = scopeService.getCurrentPharmacy();

  $scope.filterDriverCondition={
    driverSelected: ''
  }
  $scope.showDriverCardDiv = false;

  $scope.showDriver = false;
  $scope.showSignature = false;
  $scope.isCompleted = false;
  $scope.isInProgress = false;
  $scope.isPending = false;
  $scope.showDriverSelector = false;
  $scope.deliveryStatusColor = "assertive"



  if($scope.currentOrders != null){ 
    $scope.cost = $scope.currentOrders[0].get("cost");
    $scope.deliveryDate = $scope.currentOrders[0].get("deliveryDate");
    $scope.patient = $scope.currentOrders[0].get("patientId");
    $scope.distanceFromPharmacy = $scope.patient.get("distanceFromPharmacy");
    $scope.pharmacyInfo = $scope.currentOrders[0].get("pharmacyID").get("pharmacyInfo");

    if($scope.cost == undefined){
      checkCost($scope.currentOrders[0]);
    }

    if($scope.currentOrders[0].get("driverId") != undefined){
      $scope.showDriver = true;
    }

    if($scope.currentOrders[0].get("deliveryStatus") == "pending"){
      $scope.deliveryStatusColor = "assertive"
      $scope.isPending = true;
      $scope.showSignature = false;
      $scope.showDriverSelector = true;;
    } 

    if($scope.currentOrders[0].get("deliveryStatus") == "In progress"){
      $scope.deliveryStatusColor = "energized"
      $scope.isInProgress = true;
      $scope.showSignature = false;
      $scope.showDriverSelector = false;
    }

    if($scope.currentOrders[0].get("deliveryStatus") == "Completed"){
      $scope.deliveryStatusColor = "balanced"
      $scope.isCompleted = true;
      $scope.showSignature = true;
      $scope.signatureImage = $scope.currentOrders[0].get("patientSignature");
      $scope.signatureTimeStamp = $scope.currentOrders[0].get("patientSignatureTimeStamp");
      $scope.showDriverSelector = false;
    }

  }else{
    window.location.replace("home.html");
  }

  $scope.driverSelected = function(){
    $scope.showDriverCardDiv = true;
    $scope.currentDriverSelected = JSON.parse($scope.filterDriverCondition.driverSelected);
    scopeService.updateCurrDriver($scope.currentDriverSelected); 
  }
  $scope.assigneDriverFinalize = function(){
    var driver = scopeService.getAllDriversMap().get(scopeService.getCurrDriver().objectId);
    var orders = scopeService.getCurrentOrders();
    for(var i=0; i<orders.length; i++){
      scopeService.getCurrentOrders()[i].set('driverId',driver);
      scopeService.getCurrentOrders()[i].set('deliveryStatus','In progress');
      scopeService.getCurrentOrders()[i].save();
    }
    //send notification here
    notification = {};
    
    notification.type = "notifyDriver";
    notification.params = {};
    notification.params.driver = driver;
    notification.params.orders = orders;

    sendNotification(notification);
    window.location.replace("home.html");
  }
  $scope.loadMap = function() {
    loadMap();
  }
})
  
.controller('pharmacyCtrl', function($scope, $state, $ionicActionSheet, ParseService, scopeService, $ionicPopup) {
  $scope.title = "Add pharmacy";
})

.controller('driverCtrl', function($scope, $state, $ionicActionSheet, ParseService, scopeService, $ionicPopup) {
  $scope.title = "Add Driver";
})

function loadMaps($scope){
  
  var deliveries = $scope.deliveries;

  var pharmacyInfoMap = new Map();
  var pharmacyInfoArray = [], pharmacyUserItem;
  var pharmacyUserMap = new Map();
  var pharmacyUserArray = [], pharmacyInfoItem;
  var pharmacyOrdersMap = new Map();
  var pharmacyOrdersArray = [], pharmacyInfoItem;

  var totalPending = [0,0];
  var totalInProgress = [0,0];
  var totalCompleted = [0,0];
  
  var driverMap = new Map();
  var patientMap = new Map();

  for (var i = 0; i < deliveries.length; i++) {

      //required for backwards integration
      checkCost(deliveries[i]);

      pharmacyInfoMap.set(deliveries[i].get("pharmacyID").id, deliveries[i].get("pharmacyID").get("pharmacyInfo"));
      pharmacyUserMap.set(deliveries[i].get("pharmacyID").id, deliveries[i].get("pharmacyID"));

      if(deliveries[i].get("driverId") != undefined){
        driverMap.set(deliveries[i].get("driverId").id, deliveries[i].get("driverId"));
      }

      if(deliveries[i].get("patientId") != undefined){
        patientMap.set(deliveries[i].get("patientId").id, deliveries[i].get("patientId"));
      }

      if(pharmacyOrdersMap.get(deliveries[i].get("pharmacyID").id) == undefined){
        pharmacyOrdersMap.set(deliveries[i].get("pharmacyID").id, [deliveries[i]]);
      }else{
        var tempValue = pharmacyOrdersMap.get(deliveries[i].get("pharmacyID").id);
        tempValue.push(deliveries[i]);
        pharmacyOrdersMap.set(deliveries[i].get("pharmacyID").id, tempValue);
      }

      if(deliveries[i].get("deliveryStatus") == "pending"){
        totalPending[0]++;
        totalPending[1] += deliveries[i].get("cost");
      }
      if(deliveries[i].get("deliveryStatus") == "In progress"){
        totalInProgress[0]++;
        totalInProgress[1] += deliveries[i].get("cost");
      }
      if(deliveries[i].get("deliveryStatus") == "Completed"){
        totalCompleted[0]++;
        totalCompleted[1] += deliveries[i].get("cost");
      }

  }
  pharmacyInfoMap.forEach(function (item, key, mapObj) {
      pharmacyUserItem = {};
      pharmacyUserItem.id = key;
      pharmacyUserItem.object = item;
      pharmacyInfoArray.push(pharmacyUserItem);
  });
  pharmacyOrdersMap.forEach(function (item, key, mapObj) {
      pharmacyInfoItem = {};
      pharmacyInfoItem.id = key;
      pharmacyInfoItem.object = item;

      pharmacyInfoItem.pending = [];
      pharmacyInfoItem.inProgress = [];
      pharmacyInfoItem.completed = [];
      
      pharmacyInfoItem.totalCost = 0;

      pharmacyInfoItem.under10Km = [0,0];
      pharmacyInfoItem.under20Km = [0,0];
      pharmacyInfoItem.under30Km = [0,0];
      pharmacyInfoItem.over30Km = [0,0];


      for(var x=0; x<item.length; x++){
        
        //update cost
        pharmacyInfoItem.totalCost += item[x].get("cost");

        //update distance counter
        var distanceFromPharmacy = item[x].get("patientId").get("distanceFromPharmacy");
        if(distanceFromPharmacy < 10){
          pharmacyInfoItem.under10Km[0]++;
          pharmacyInfoItem.under10Km[1] += item[x].get("cost");
        }else if(distanceFromPharmacy < 20){
          pharmacyInfoItem.under20Km[0]++;
          pharmacyInfoItem.under20Km[1] += item[x].get("cost");
        }else if(distanceFromPharmacy < 30){
          pharmacyInfoItem.under30Km[0]++;
          pharmacyInfoItem.under30Km[1] += item[x].get("cost");
        }else if(distanceFromPharmacy > 29){
          pharmacyInfoItem.over30Km[0]++;
          pharmacyInfoItem.over30Km[1] += item[x].get("cost");
        }

        if(item[x].get("deliveryStatus") == "pending"){
          pharmacyInfoItem.pending.push(item[x]);
        }
        if(item[x].get("deliveryStatus") == "In progress"){
          pharmacyInfoItem.inProgress.push(item[x]);
        }
        if(item[x].get("deliveryStatus") == "Completed"){
          pharmacyInfoItem.completed.push(item[x]);
        }
      }
      
      pharmacyOrdersArray.push(pharmacyInfoItem);
  });

  $scope.pharmacyInfoArray = pharmacyInfoArray;
  $scope.pharmacyInfoMap = pharmacyInfoMap;
  $scope.pharmacyOrdersArray = pharmacyOrdersArray;
  $scope.pharmacyOrdersMap = pharmacyOrdersMap;
  $scope.pharmacyUserMap = pharmacyUserMap;
  $scope.activeDriversMap = driverMap;
  $scope.patientsMap = patientMap;

  $scope.totalPending = totalPending;
  $scope.totalInProgress = totalInProgress;
  $scope.totalCompleted = totalCompleted;
  

  return $scope;
}

function loadMap (){
  var myLatlng = new google.maps.LatLng(37.3000, -120.4833);

  var mapOptions = {
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById("map"), mapOptions);

  navigator.geolocation.getCurrentPosition(function(pos) {
      map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      var myLocation = new google.maps.Marker({
          position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
          map: map,
          title: "My Location"
      });
  });
}

function checkCost(order){
  if(order.get("cost") == undefined){
    var cost = order.get("cost");
    var deliveryDate = order.get("deliveryDate");
    var patient = order.get("patientId");
    var distanceFromPharmacy = patient.get("distanceFromPharmacy");
    var pharmacyInfo = order.get("pharmacyID").get("pharmacyInfo");

    if(distanceFromPharmacy < 10){
      cost = ( pharmacyInfo.get("priceRate"));
    }else if(distanceFromPharmacy < 20){
      cost = ( pharmacyInfo.get("priceRateOver10Km"));
    }else if(distanceFromPharmacy < 30){
      cost = ( pharmacyInfo.get("priceRateOver20Km"));
    }else if(distanceFromPharmacy > 29){
      cost = ( pharmacyInfo.get("priceRateOver30Km"));
    }

    if(order.get("noShow") == true && order.get("numberOfNoShows") != undefined){
      cost = cost * order.get("numberOfNoShows");
    }
    order.set("cost",cost);
    order.save();
  }
}

function sendNotification(notification){
  switch (notification.type) {
    case 'notifyDriver':
        notifyDriver(notification.params);
        break;
    case 'someOtherFunction':
        notifyDriver(notification.params);
        break;
  }

}

//notification functions

function notifyDriver(params){

  Parse.Cloud.run('notifyDriver', { params: JSON.stringify(params)}, {
    success: function(result) {
      var jsonResult = JSON.stringify(result);
    },
    error: function(error) {
      var jsonResult = JSON.stringify(error);
    }
  });
}

function someOtherFunction(params){}