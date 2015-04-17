/**
 * Main Controller
 */
angular.module('app')
	.controller('mainController', ['$scope', '$location', 'socket', 'QueryTimes', 'growl', function($scope, $location, socket, QueryTimes, growl) {
		/*
			Set Up Graph 
		 */
		$scope.sizeChange = QueryTimes.getSize();
		$scope.chartTypes = QueryTimes.getChartTypes();

		$scope.chart = [];
		$scope.chart.type = $scope.chartTypes[0];

		$scope.fixed = QueryTimes.getFixed();

		/*
			Set Up Gauge
		 */
		$scope.alert_value = QueryTimes.getAlertValue();
		$scope.frequency = QueryTimes.getFrequency();
		$scope.gaugeValue = 0;

		/*
			Set up Statistics
		 */
		 $scope.average = QueryTimes.getAverageTime();
		 $scope.min_value = QueryTimes.getMinTime();
		 $scope.max_value = QueryTimes.getMaxTime();

		 //# of places after decimal
		 $scope.roundOff = QueryTimes.getRoundOff();

		 /*
			Set up Nav bar
		 */
	 	$scope.navItems = [{
	  		path: 'welcome',
	    	text: 'Welcome',
	      	hash: ''
		}, {
	    	path: 'dash',
	    	text: 'Dashboard',
	      	hash: '#go'
		}, {
	    	path: 'contact',
	    	text: 'Contact',
	      	hash: ''
	    }];

   		//push socket data to Query object
   		socket.on('data', function (datum) {
		 	QueryTimes.pushData(datum);

		  	//Alert graph to redraw with new value
		  	$scope.chart = {
		  		data: QueryTimes.getData(),
		  		type:  $scope.chart.type,
		  		max : QueryTimes.getSize()
		  	};	

		  	//Get New Statistical Data
		  	$scope.average = QueryTimes.getAverageTime();
		 	$scope.min_value = QueryTimes.getMinTime();
		 	$scope.max_value = QueryTimes.getMaxTime();

		  	//Alert gauge of new value		          
		  	$scope.gaugeValue = datum.value;    
		});

		$scope.selectType = function(type) {
		  $scope.chart.type = type;
		};

		$scope.setSize = function(i) {
			if(i > 0 && angular.isNumber(i)) {
				QueryTimes.setSize(i);
			}
			$scope.maxSize = QueryTimes.getSize();
		};

		$scope.toggleFixed = function() {
			QueryTimes.setFixed();
			$scope.fixed = QueryTimes.getFixed();
		};

		$scope.rewind = function() {
			QueryTimes.rewind();
		};

		$scope.fastForward = function() {
			QueryTimes.fastForward();
		};

		$scope.moveLeft = function(i) {
			if(i > 0 && angular.isNumber(i)) {
				QueryTimes.move(-i);
			}
		};

		$scope.moveRight = function(i) {
			if(i > 0 && angular.isNumber(i)) {
				QueryTimes.move(i);
			}
		};

		$scope.navClass = function (page) {
	        var currentRoute = $location.path().substring(1) || '';
	        return page === currentRoute ? 'active' : '';
	    };   

	}
]);