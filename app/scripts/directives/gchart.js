angular.module('app')
.directive('gChart', function(QueryTimes) {
  return {
    restrict: 'A',
    link: function(iScope, element, attrs) {
      	var lineChart;
        element.css("height", "500px");
        
        function draw(chart) {
          if(chart.data.length > 0) {
            var data = chart.data;

            var table = new google.visualization.DataTable();
            table.addColumn('datetime');
            table.addColumn('number');
            table.addRows(data.length);

            var view = new google.visualization.DataView(table);
            for (var i = 0; i < data.length; i++) {
              var item = data[i];
              table.setCell(i, 0, new Date(item.timestamp));
              var value = parseFloat(item.value);
              table.setCell(i, 1, value);
            }

            var chartOptions = QueryTimes.getChartOptions();
              chartOptions.hAxis = { 
            	viewWindow: QueryTimes.getViewWindow(chart.max)
            };
            if(view && chartOptions) {
              lineChart.draw(view, chartOptions);
            }
          }
        }

        iScope.$watch('chart', function (chart) {
          if (chart && chart.data && chart.max) {
          	lineChart = new google.visualization[chart.type.typeValue](element[0]);
            draw(chart);
          }
        });
    }
  };
});