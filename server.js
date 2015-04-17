var express        = require('express');
var app            = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/app')); 

var DATAPOINT_DELAY = 100; // ms

function clamp(i, min_val, max_val) {
	if (i > max_val)
		i = max_val
	if (i < min_val)
		i = min_val
	return i
}

function sine_wave(frequency, framerate, amplitude, sampleSize) {
	var amplitude = clamp(amplitude, 0.0, 1.0),
		freq = parseFloat(frequency),
		amp = parseFloat(amplitude),
		framerate = parseFloat(framerate),
		sample = [];
	
	for(var i = 0.0; i < parseFloat(sampleSize); i++) {
		var val = amp * Math.sin(2.0 * Math.PI * freq * (i/framerate));

		val += (amplitude * 2) + (Math.random());

		sample.push(val);
	}
		
	return sample;
}

function getTimeSeries() {
	var frequency = 450.0,
		framerate = 44100,
		amplitude = 1.0,
		sampleSize = 1400;

	var datum = sine_wave(frequency, framerate, amplitude, sampleSize);
	var labels = [];
	var outlierPoint = clamp(parseInt(datum.length * Math.random()), parseInt(datum.length / 2), parseInt(datum.length-datum.length/10));

	var badValueCount = clamp(parseInt(40 * Math.random()), 10, 40);
	var badMultipler = clamp(3.0 * Math.random(), 1.5, 2.0);
	for(var i = 0; i < badValueCount; i++) {
		datum[outlierPoint + i] *= badMultipler;
	}

	return datum;
}

//------------------------------------------------------------------

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
	var data = getTimeSeries(),
		idx = 0,
		len = data.length,
		intervalId = -1;
/*
	SEND TIMESTAMP FROM BACKEND
 */
	intervalId = setInterval(function() {
		socket.emit('data', {
			value : data[idx++ % len],
			timestamp : Date.now()
		});
	}, DATAPOINT_DELAY);

	socket.on('disconnect', function(){
		clearInterval(intervalId);
	});
});

http.listen(3000, function() {
  console.log('Listening on *:3000');
});

