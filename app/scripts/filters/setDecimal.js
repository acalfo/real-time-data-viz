angular.module('app')
.filter('setDecimal', function ($filter) {
    return function (input, places) {
        if (isNaN(input)) return input;
        // 1 decimal place mult/div by 10, 2 decimal places mult/div by 100, etc
        var factor = "1" + Array(+(places > 0 && places + 1)).join("0");
        return Math.round(input * factor) / factor;
    };
});