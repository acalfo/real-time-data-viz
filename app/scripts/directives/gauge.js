angular.module('app')
.directive('gauge', function ($filter, QueryTimes, growl) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      label: '@',
      min: '=',
      value: '=',
      freq: '=',
      size: '=',
      alerter: '='
    },
    link: function postLink(scope, element, attrs) {
      var check_next = true;
      var freq_count = 0;
      var max_freq = scope.freq;
      
      var current_max = 0;

      var configure = function(max) {
        var config = {
          size: scope.size,
          label: attrs.label,
          min: undefined !== scope.min ? scope.min : 0,
          max: max,
          minorTicks: 5,
          max_freq: scope.freq,
          alerter : scope.alerter
        };
        
        var range = config.max - config.min;
        config.yellowZones = [
          { from: config.min + range * 0.75, to: config.min + range * 0.9 }
        ];
        config.redZones = [
          { from: config.min + range * 0.9, to: config.max }
        ];

        return config;
      };

      scope.$watch('value', function () {
        //Recreate/configure gauge if new value is > current_max
        if(scope.value > current_max) {
          current_max = scope.value;
          scope.gauge = new Gauge(element[0], configure($filter('setDecimal')(current_max, 2)));
          scope.gauge.render();
          scope.gauge.redraw(scope.value);
        }

        if(scope.alerter) {
          //use avg/max value to produce a determinant
          var determinant = QueryTimes.getDeterminant();

          //determine if new value is an outlier
          if(determinant  < scope.value) {
            freq_count++;
            check_next = true;
          } else if (check_next) { 
            //check next value before decrementing in case current value abnormal
            check_next = false;
          } else if(!check_next){
            //if already checked next decrement count & reset check var
            check_next = true;
            freq_count --;
            //keep freq floor @ 0;
            if(freq_count < 0) {
              freq_count = 0;
            }
          }

          //if frequency count > configured max. throw error message to user.
          if(freq_count >= max_freq) {
            growl.addErrorMessage("CRITICAL TABLE IN DANGER!");
            //reset slightly below 0 to create small cushion while user responds to error msg 
            freq_count = -2;
          }
        }
        //redraw
        if(scope.gauge) {
          scope.gauge.redraw(scope.value); 
        }
      });
    }
  };
});