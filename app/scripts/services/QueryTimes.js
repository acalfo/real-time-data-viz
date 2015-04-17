
angular.module('app')
  .factory('QueryTimes', function($filter) {

    var QueryTimes = function() {
        //local vars
        this.total_data = [];
        this.display_data = [];
        this.length = 0;

        /*
            Query Time Statistics
         */
         this.max_time = 0;
         this.min_time = 0;
         this.average = 0;
         this.runningCount = 0;

         //Configure # of places after decimal for stats
         this.roundOff = 2;

        /**
         * Query Times Alert/Gauge Config
         */
        
        //Frequency of outliers required before throwing an error msg 
        this.frequency = 5;

        //Configure weight that computed average holds towards producing determinant
        this.averageWeight = 30/100;

        //Configure weight max/min average hold towards producing determinant
        this.maxMinWeight = 30/100;

        /**
         * Query Times Graph Config
         */
        
        //Set Default for total amount of visible data points.
        this.size = 50;

        this.range = {
            left: 0,
            right: 0
        };

        this.legend = 'none';

        //set height  of axis
        this.vAxis = {
            minValue : 2,
            maxValue : this.max_time
        };

        //Chart area margins
        this.chartArea = {};
        this.chartArea.left = 30;
        this.chartArea.top = 20;
        this.chartArea.bottom = 0;
        this.chartArea.height = '88%';

        this.width = 1000;
        this.height = 500;

        //shape of lines (function = smooth/rounded)
        this.curveType = 'function';

        //Text Styles
        this.fontName = 'Times-Roman';
        this.fontSize = 18;
        this.bold = true;
        this.italic = true;

        // The color of the text.
        this.color = '#871b47';  

        // The color of the text outline.
        this.auraColor = '#d799ae'; 

        // The transparency of the text.
        this.opacity = 0.8;    


        //Max / Min Viewable Window (X Axis)
        this.max_x = 0;
        this.min_x = 0;  
        
        //Turn true to have graph stop moving past points less than the current range
        this.fixed = false;

        this.setChartData();
    };
    //Init Methods
    QueryTimes.prototype.initStats = function(value) {
        this.min_time = value;
        this.max_time = value;
        this.runningCount = value;
        this.average = value;
    };


    //Processing Methods
    QueryTimes.prototype.pushData = function(datum) {
        this.total_data.push(datum);
        this.processDisplayData(datum);
    };

    QueryTimes.prototype.processDisplayData = function(datum) {
        var display = this.display_data;

        display.push(datum);
       
        // move range with max size
        if((this.range.right-this.range.left) > this.size && !this.fixed) {
            this.range.left += 1;
        } 
        this.range.right +=1;
        this.display_data = angular.copy(this.total_data).slice(this.range.left, this.range.right);
        this.length++;

        //Init statistical Data
        if(!this.min_value && !this.max_value && !this.average) {
            this.initStats(datum.value);
        } else {
            this.setStats(datum.value);
        }
    };


    //Accessor Methods
    QueryTimes.prototype.getData = function() {
        return this.display_data;
    };

    QueryTimes.prototype.setData = function(data) {
        this.display_data = data;
    };

    QueryTimes.prototype.getSize = function() {
        return this.size;
    };

    QueryTimes.prototype.setSize = function(new_size) {
        if(new_size < (this.range.right-this.range.left)) {
            this.range.left = this.range.right - new_size;
        }
        else if(this.range.right - (new_size-this.size) < 0){
            this.range.left = 0;
        } else {
            this.range.right = this.length-1;
            if(this.range.right -new_size >=0) {
                this.range.left = this.range.right - new_size;
            } else {
                this.range.left = 0;
            }
        }

        this.size = new_size;
    };

    QueryTimes.prototype.setStats = function(value) {
        if(value < this.min_time) {
            this.min_time = value;
        } else if(value > this.max_time) {
            this.max_time = value;
        }

        this.runningCount = this.runningCount + value;
        this.average = this.runningCount / this.length;
    };

    QueryTimes.prototype.getRoundOff = function() {
        return this.roundOff;
    };

    QueryTimes.prototype.getMaxTime = function() {
        return this.max_time;
    };

    QueryTimes.prototype.getMinTime = function() {
        return this.min_time;
    };

    QueryTimes.prototype.getAverageTime = function() {
        return this.average;
    };

    QueryTimes.prototype.setFixed = function() {
        this.fixed = !this.fixed;
    };

    QueryTimes.prototype.getFixed = function() {
        return this.fixed;
    };

    QueryTimes.prototype.getAlertValue = function() {
        return this.alert_value;
    };

    QueryTimes.prototype.getFrequency = function() {
        return this.frequency;
    };

    //Determinant produces min value of an outlier
    QueryTimes.prototype.getDeterminant = function() { //compute weighted average with min, max, & total average to produce a less volatile value
        var average = this.getAverageTime(), max = this.getMaxTime(), min = this.getMinTime();
        return (average + max+ min)/3  + 
                (this.averageWeight * (average + max+ min)/3) + 
                (this.maxMinWeight * (max + min)/2);
    };

    QueryTimes.prototype.getViewWindow = function(size) {
        //Get Last Value to form new min/max for viewable window
        var last = this.total_data[this.range.right-1];
        var first = this.total_data[this.range.left];

        if (this.min_x === 0 && this.max_x === 0) {        
            this.max_x = new Date(last.timestamp + size * 1000);
            this.min_x = new Date(last.timestamp - size);
        }  
        else if(this.fixed || (this.range.right-this.range.left) <= this.size) {
            this.max_x = new Date(last.timestamp + size * 100);
            this.min_x = new Date(first.timestamp);
        }
        else {
            this.max_x = new Date(last.timestamp);
            this.min_x = new Date(first.timestamp);
        } 
        return {
            max : this.max_x,
            min : this.min_x
        };
    };

    QueryTimes.prototype.setChartData = function() {
        this.chartOptions = {
            legend: this.legend,
            vAxis: this.vAxis,
            width: this.width,
            height: this.height,
            curveType: this.curveType,
            chartArea : this.chartArea,
            annotations: {
                textStyle: {
                  fontName: this.fontName,
                  fontSize: this.fontSize,
                  bold: this.bold,
                  italic: this.italic,
                  color: this.color,    
                  auraColor: this.auraColor,    
                  opacity: this.opacity          
                }
            }
        };
    };

    QueryTimes.prototype.getChartOptions = function() {
        return this.chartOptions;
    };

    //Chart types available for graph 
    QueryTimes.prototype.getChartTypes = function() {
        return [
          {typeName: 'LineChart', typeValue: 'LineChart'},
          {typeName: 'ScatterChart', typeValue: 'ScatterChart'}
        ];
    };


    //Action Methods 
    //Move graph to beginning
    QueryTimes.prototype.rewind = function() {
        this.range.right = this.total_data.length -1 - this.range.left;
        this.range.left = 0;
    };
    //Move head of graph to the right most value
    QueryTimes.prototype.fastForward = function() {
        this.range.left = this.total_data.length - 1 - this.size;
        if(this.range.left < 0) {
            this.range.left = 0;
        }
        this.range.right = this.total_data.length -1;
    };
    //Move a specified amount
    QueryTimes.prototype.move = function(moveAmt) {
        this.range.left += moveAmt;
        if(this.range.left < 0) {
            this.range.right +=moveAmt -this.range.left;
            this.range.left = 0;
        } else {
            this.range.right += moveAmt;
            if(this.range.right >= this.total_data.length) {
                this.range.left -= this.range.right - this.total_data.length ;
                this.range.right = this.total_data.length-1;
            }
        }
    };

    return new QueryTimes();
});