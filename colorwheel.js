//initialize PAINTBRUSH module (controls drawing on canvas)
var PAINTBRUSH = (function() {

	//private Variables 
	//Canvas and context
	var canvas = document.getElementById("myCanvas");
	var context = canvas.getContext("2d");
	//Color,
	var newColor = "#000000";
	//Canvas scale
	var originX = canvas.width / 2;
	var originY = canvas.width / 2;
	//Brush shape
	var brushArray = [
	    [-1, -1],[-1, 0],[-1, 1],
	    [0, -1],[0, 0],[0, 1],
	    [1, -1],[1, 0],[1, 1]
	];
	//Brush scale
	var brushScale = 20;
	//Zoom
	var zoom = 1;

	//public functions: drawing functions
	return {

		setZoom: function(value) {
			console.log("setting zoom to " + value);
			if(value >= 0) { zoom = value; }
			return 0;
		},

		//gets the 
		getZoom: function() {
			return zoom;
		},

		//sets the scale of the brush
		setScale: function(value) {
			console.log("setting scale to " + value);
			if(value >= 0) { brushScale = value; }
			return 0;
		},

		//gets the scale of the brush
		getScale: function() {
			return brushScale;
		},

		calculateColorWheel: function(theta, distance) {
			var calc = (1 - (((Math.abs((theta - (Math.PI)) / zoom) / (Math.PI) / zoom) * distance ))) * 255;
			if(calc > 255)
			console.log("theta = " + theta + " distance = " + distance + " gen = " + calc);
			return calc;
		},

		colorize: function(color) {
			color = Math.floor(color);
			if(isNaN(color)) { color = 0; } //get rid of NAN
			if(color < 0) { color = 0;} //set min
			if(color > 255) { color = 255;} //set max
			color = color.toString(16); //convert to hex
			if(color.length < 2) {
				color = "0" + color; //add preceding zeroes if necessary
			}
			return color;
		},

		getColorVal: function(newX, newY) {
			var maxDistance = canvas.height / 2; //Max distance from origin - half of canvas height
			var dX = newX - canvas.originX; //X distance from origin
			var dY = newY - canvas.originY; //Y distance from origin
			var theta = Math.atan2(dY, dX); //angle (zero eastmost point, scale of -PI -> PI)
			var distance = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2)); //pythagorean theorem
			var overflow = 0;
		    distance = distance / maxDistance - .10; //ratio of distance from origin to max distance
		    if (distance > maxDistance + .10) { distance = maxDistance - (maxDistance - distance);} //allow for distance fallout
		    if (distance < 0) { distance = 0;} //adjust for possible negatives


	    	redTheta = theta + (Math.PI / 2); //adjust for loc of red (PI / 2)
	    	if(redTheta > Math.PI) { redTheta = Math.PI - (redTheta - Math.PI); } //adjust for overflow
	    	greenTheta = theta - (Math.PI / 6); //adjust for loc of green (PI / 6)
	    	if(greenTheta < -Math.PI) { greenTheta = -Math.PI - (greenTheta + Math.PI); } //adjust for overflow
	    	blueTheta = theta - (5 * Math.PI / 6); //adjust for loc of blue (5PI / 6)
	    	if(blueTheta < -Math.PI) { blueTheta = -Math.PI - (blueTheta + Math.PI); } //adjust for overflow

	    	//get absolute values of theta
	    	redTheta = Math.abs(redTheta);
	    	greenTheta = Math.abs(greenTheta);
	    	blueTheta = Math.abs(blueTheta);
		    
		    //find the place of each color on the wheel
		    red = PAINTBRUSH.calculateColorWheel(redTheta, distance);
		    green = PAINTBRUSH.calculateColorWheel(greenTheta, distance);
		    blue = PAINTBRUSH.calculateColorWheel(blueTheta, distance);

		    //calculate any overflow
		    if(red < 0) {overflow = overflow + red;}
		    if(green < 0) {overflow = overflow + green;}
		    if(blue < 0) {overflow = overflow + blue;}

		    //add overflow to color values
			red = PAINTBRUSH.colorize(red + overflow);
			green = PAINTBRUSH.colorize(green + overflow);
			blue = PAINTBRUSH.colorize(blue + overflow);

			//for debug
			console.log('#' + red + green + blue + " overflow = " + overflow);

			//return the color
			return '#' + red + green + blue;
		},

		//paint using the brush
		paint: function(positionX, positionY) {
			var rect = canvas.getBoundingClientRect();
			var brushScaleModX = 0;
			var brushScaleModY = 0;
			for(adjust of brushArray) {
				brushScaleModX = adjust[0] * brushScale * 1;
				brushScaleModY = adjust[1] * brushScale * 1;
				color = PAINTBRUSH.getColorVal(positionX + brushScaleModX, positionY + brushScaleModY);
				PAINTBRUSH.drawCircle(positionX + brushScaleModX, positionY + brushScaleModY, brushScale, color, true);
			}	
			return 0;
		},

		//resize the canvas to match the open window
		resizeCanvas: function() {
			var width = canvas.clientWidth;
			var height = canvas.clientHeight;
			if(canvas.width != width || canvas.height != height) {
				canvas.width = width;
				canvas.height = height;
			}
			canvas.originX = canvas.width / 2;
			canvas.originY = canvas.height / 2;
		},

		//draw a circle
		drawCircle: function(positionX, positionY, radius, color, fill) {
			context.strokeStyle = color;
			context.fillStyle = color;
			context.beginPath();
			context.arc(positionX, positionY, radius, 0, 2 * Math.PI);
			context.stroke();
			if(fill === true) {
				context.fill();
			}
			return 0;
		}
	};
})();

$('#myCanvas').mousemove(function(event) {
	PAINTBRUSH.paint(event.clientX, event.clientY);
})

//key presses to control brush size and zoom
$(document).keypress(function(e) {
	console.log("got keypress " + e.which);
	//arrow up: increase Zoom
   if(e.which == 119) {
      PAINTBRUSH.setZoom(PAINTBRUSH.getZoom() + .02);
   }
   //arrow down: decrease Zoom
   if(e.which == 115) {
      PAINTBRUSH.setZoom(PAINTBRUSH.getZoom() - .02);
   }
   //delete: reset Zoom & size
   if(e.which == 113) {
      PAINTBRUSH.setZoom(1);
      PAINTBRUSH.setScale(20);
   }
   //left arrow: decrease size
   if(e.which == 97) {   
      PAINTBRUSH.setScale(PAINTBRUSH.getScale() - 2);
   }
   //right arrow: increase size
   if(e.which == 100) {
      PAINTBRUSH.setScale(PAINTBRUSH.getScale() + 2);
   }
});

//resize the canvas on page load
PAINTBRUSH.resizeCanvas();
