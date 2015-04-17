// public/core.js
app = angular.module('app', [
  'ngRoute',
  'ui.bootstrap',
  'angular-growl'
  ])

  .config(function ($routeProvider, growlProvider) {
    $routeProvider
      .when('/welcome', {
        templateUrl: 'views/welcome.html'
      })
      .when('/dash', {
        templateUrl: 'views/dashboard.html'
      })
      .when('/contact', {
        templateUrl: 'views/contact.html'
      })
      .otherwise('/welcome');

      //Set ttl for growl alerts
      growlProvider.globalTimeToLive(6000);
  })
//Ensure anchor scroll runs after dom loads
.run(function($rootScope, $location, $anchorScroll, $routeParams, $timeout) {
    $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
      $timeout(function() {
        $anchorScroll();  
      }, 300);
    });
});

//Load App After loading up google package
google.load('visualization', '1', {
  packages: ['corechart']
});
 
google.setOnLoadCallback(function() {
  angular.bootstrap(document.body, ['app']);
});
