var ctx;
var tool;
var console;
var windowSize;
var starSet, skylineSet, obslineSet, compassSet, labelSet;

var stopMoving = false; // just debug
var moveIndex;

function Tool() {
	this.secO = this.secN = 60;
	this.countFrame = 0;
	this.frame;

	this.drawingObject;
	this.liningObject;

	this.fps = function() {
		this.time = new Date();
		this.secO = this.secN;
		this.secN = this.time.getSeconds();
		if(this.secO == this.secN) {
			this.countFrame++
		} else {
			this.frame = this.countFrame;
			this.countFrame = 0;
		}
		return "fps = " + this.frame;
	}
	this.performance = function(hipfm) {
		if(hipfm) {
//			if(this.fps < 10) {
				starSet.checkEachVisible(4);
				skylineSet.visible = false;
				obslineSet.visible = false;
//			}
		}
	}
	this.resizeHandler = function() {
		windowSize = new WindowSize();
		ctx.canvas.width = windowSize.width;
		ctx.canvas.height = windowSize.height;
		if(console.fullMap) console.forceSetScale(windowSize.getFullBall());
		else console.setScale(windowSize.getRadius());
	}
}
function currentTime() {
	time = new Date();
	hourTime = time.getHours();
	minTime = time.getMinutes();
	secTime = time.getSeconds();
	msecTime = time.getMilliseconds();
	// getDay, getDate, getMonth, getYear
	return (60*minTime + secTime + msecTime/1000)%360;
}
function WindowSize() {
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	this.halfWidth = Math.floor(this.width/2);
	this.halfHeight = Math.floor(this.height/2);

	this.getRadius = function() {
		var radius = Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2));
		radius *= 1/2; // 1.2/2;
		radius = Math.floor(radius);
		return radius;
	}
	this.getFullBall = function() {
		var radius = (this.width < this.height) ? this.width : this.height;
		radius *= 0.950/2;
		return radius;
	}
}

function Sky(rotation) {
	this.rotation = rotation;

	this.position = function(xy) {
		var radec = [];
		var xyz = [0, 0, 0];

		var angle = Math.sqrt(Math.pow(xy[0], 2) + Math.pow(xy[1], 2));
		angle /= console.scale;
		if(angle > 1) return;
		angle *= Math.PI/2;
		var posAng = Math.atan(xy[1]/xy[0]);
		if(isNaN(posAng)) posAng = 0;
		var sgn = xy[0]/Math.abs(xy[0]);
		if(isNaN(sgn)) sgn = 1;
		xyz[1] = Math.cos(angle);
		xyz[0] = sgn*Math.sqrt(1 - Math.pow(xyz[1], 2))*Math.cos(posAng);
		xyz[2] = sgn*Math.sqrt(1 - Math.pow(xyz[1], 2))*Math.sin(posAng);
		
		xyz = ezGL.rotateX(xyz, -console.altitude);
		xyz = ezGL.rotateY(xyz, -console.azimuth);

		if(this.rotation) {
			xyz = ezGL.rotateX(xyz, -console.latitude);
			xyz = ezGL.rotateZ(xyz, -moveIndex); // rotate sky by celestial-pole-axis.
		} else {
			xyz = ezGL.rotateX(xyz, -90);
		}
		var ref = ezGL.rotateZ(xyz, 90); // create ref point at 90 degree ahead

		xyz = ezGL.switchCoordinateSystem(xyz);
		ref = ezGL.switchCoordinateSystem(ref);

		var rDec = Math.asin(xyz[2]);
		if(xyz[0] / Math.cos(rDec) <= 1)
			var rRA = Math.asin(xyz[0] / Math.cos(rDec));
		else
			var rRA = Math.asin(1);

		var refDec = Math.asin(ref[2]);
		if(ref[0] / Math.cos(refDec) <= 1)
			var refRA =  Math.asin(ref[0] / Math.cos(refDec));
		else
			var refRA =  Math.asin(1);

		var radec = [rRA*12/Math.PI, rDec*180/Math.PI];
		refRA = refRA*12/Math.PI;

		if(refRA < 0) radec[0] = 12 - radec[0];
		else if(radec[0] < 0) radec[0] = 24 + radec[0];

		if(isNaN(radec[0])) radec[0] = 180;
		if(!this.rotation) {
			radec[0] = (36 - radec[0])%24;
			radec[0] *= 15;
		}
		return radec;
	}
	this.stringPosition = function(xy) {
		if(!this.position(xy)) return;
		radec = this.position(xy);
		if(this.rotation) { // ra dec
			var text = "RA " + this.toDegree(radec[0], false);
			text += ",   Dec " + this.toDegree(radec[1], true);
		} else { // atz, att
			var text = this.toDegree(radec[0], true);
			text += ",   " + this.toDegree(radec[1], true);
		}
		return text;
	}
	this.toDegree = function(decimal, type) {
		if(type) var separator = ["d ", "' ","\""]; // !!!!!!!!!!!! need degree symbol (small o)
		else var separator = ["h ", "m ", "s"];

		var minusSign = false
		var text = "";
		if(decimal < 0) {
			decimal = -decimal;
			minusSign = true;
		}
		var abc = [];
		abc[0] = Math.floor(decimal);
		abc[1] = decimal - abc[0];
		abc[1] *= 60;
		abc[2] = abc[1];
		abc[1] = Math.floor(abc[1]);
		abc[2] = abc[2] - abc[1];
		abc[2] *= 60
		abc[2] = Math.floor(abc[2]*10)/10;

		if(!(abc[0] == 0 && abc[1] == 0 && abc[2] == 0) && minusSign) text += "-";
		// !!!!!!!!!!!!!!!!! seriously, how to compare Each value in array???
		for(i = 0; i < 3; i++) {
			text += abc[i] + separator[i];
		}
		return text;
	}
}
function Star(name, ra, dec, mag, colour) {
	this.name = name;
	this.ra = ra;
	this.dec = dec;
	this.mag = mag;
	this.colour = colour;

	this.visible = true;
	this.nameable = false;
	this.selectable = false;
	this.mouseOn = false;

	this.shape = 0;

// ======= calculation section ==========
	this.rRA = this.ra*Math.PI/12;
	this.rDec = this.dec*Math.PI/180;
	this.cartesian = [Math.sin(this.rRA)*Math.cos(this.rDec),
					  Math.cos(this.rRA)*Math.cos(this.rDec),
					  Math.sin(this.rDec)];
	this.getRadius = function() {
		var radius = (6 - this.mag > 0.5) ? 6 - this.mag : 0.5;
		radius *= Math.pow(1.03, (console.scale-windowSize.getRadius())/windowSize.getRadius());
		return radius;
	}

	this.plotSky = function(skyRotation) {
		if(!this.visible) return;
		if(!this.plotPosition(skyRotation)) return;
		var xy = this.plotPosition(skyRotation)
		if(!this.checkOnScreen(xy)) return;
		this.checkMouseOver(xy)
		if(this.mag != -10) {
			this.plotStar(xy);
		} else {
			if(this.name == "") return;
			ctx.save();
			ctx.fillStyle = this.colour;
			ctx.fillText(this.name, xy[0], xy[1]);
			ctx.restore();
		}
		tool.drawingObject++;
	}
	this.plotPosition = function(skyRotation) {
		// =========== init sky section ============
		var xyz = this.cartesian;
		xyz = ezGL.switchCoordinateSystem(xyz);
		if(skyRotation) {
			xyz = ezGL.rotateZ(xyz, moveIndex); // rotate sky by celestial-pole-axis. -- use -20 to see orion
			xyz = ezGL.rotateX(xyz, console.latitude);
		} else {
			xyz = ezGL.rotateX(xyz, 90);
		}
		if(console.lockUnderFeet) {
			if(xyz[1] + 0.2 < 0) return; // draw star above earth surface only.
		}

		// =========== show sky section ============
		xyz = ezGL.rotateY(xyz, console.azimuth);
		xyz = ezGL.rotateX(xyz, console.altitude);
		if(xyz[1] + 0.3 < 0) return;

		var angle = Math.atan(Math.sqrt(Math.pow(xyz[0], 2) + Math.pow(xyz[2], 2))/Math.abs(xyz[1]));
		if(xyz[1] < 0) angle = Math.PI - angle;
		angle *= 2/Math.PI;
		var posAng = Math.atan(xyz[2]/xyz[0]);
		var sgn = xyz[0] / Math.abs(xyz[0]);
		if(isNaN(sgn)) sgn = 1;
		var xy = [];
		xy[0] = sgn*angle*Math.cos(posAng);
		xy[1] = sgn*angle*Math.sin(posAng);
		xy = ezGL.scale(xy, console.scale);

		return xy;
	}
	this.plotName = function(xy) {
		if(this.nameable) {
			ctx.save();
			ctx.fillStyle = this.colour;
			ctx.fillText(this.name, xy[0] + 2, xy[1] - 6);
			ctx.restore();
//			ctx.fillText(this.shape, this.xy[0] -5, this.xy[1] - 6); // get star info here
		}
	}
	this.plotStar = function(xy) {
		ctx.save();
		ctx.translate(xy[0], xy[1]);
		ctx.scale(this.getRadius(),this.getRadius());
		ctx.fillStyle = this.colour;
		switch(this.shape) {
			case 2:
				ctx.fillStyle = "white";
				ctx.beginPath();
				ctx.arc(0, 0, 1, 0, 2*Math.PI);
				ctx.fill();
				break;
			case 0:
				ctx.fillStyle = this.colour;
				ctx.beginPath();
				ctx.arc(0, 0, 1, 0, 2*Math.PI);
				ctx.fill();

				var radgrad = ctx.createRadialGradient(0, 0, 0.2, 0, 0, 1);
				radgrad.addColorStop(0.0, "rgba(255, 255, 255, 0.9)");
				radgrad.addColorStop(0.9, "rgba(255, 255, 255, 0.1)");
				radgrad.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");

				ctx.fillStyle = radgrad;
				ctx.fillRect(-1, -1, 2, 2);
				break;
			case 1:
				ctx.beginPath();
				ctx.moveTo(-3, 0);
				ctx.lineTo(3, 0);
				ctx.lineTo(-2, 2);
				ctx.lineTo(0, -2);
				ctx.lineTo(2, 2);
				ctx.fill();
				break;
		}
		ctx.restore();
	}

	this.checkMouseOver = function(xy) {
		if(!this.selectable) return;
		var overSize = 2;// 2.5
		mouseX = mouse.oxy[0] - xy[0];
		mouseY = mouse.oxy[1] - xy[1];

		if(Math.sqrt(Math.pow(mouseX, 2) + Math.pow(mouseY, 2)) < overSize*this.getRadius()) {
			this.mouseOn = true;
			this.coulor = "yellow";
			this.plotName(xy);
			ctx.fillText(this.mag, xy[0] - 34, xy[1] + 5) // for constal line's propose only!
		} else {
			this.mouseOn = false;
			this.coulor = "darkblue";
		}
	}
	this.checkOnScreen = function(xy) {
		overSize = 1.03 + 0.05*(console.scale/windowSize.getRadius());
		if(xy[0] > overSize*windowSize.halfWidth || xy[0] < -overSize*windowSize.halfWidth ||
		   xy[1] > overSize*windowSize.halfHeight || xy[1] < -overSize*windowSize.halfHeight)
			return false;
		return true;
	}
	this.checkVisible = function(min_mag) {
		this.visible = (this.mag < min_mag);
	}
	this.checkSignificant = function(min_mag) {
		this.nameable = (this.mag < min_mag);
		this.selectable = (this.mag < min_mag);
	}
}
function Console() {
	this.longtitude; // !!!!!!!!!!!!!!!!!!! emergency !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	this.latitude;

	this.scale;
	this.azimuth;
	this.altitude;

	this.sw_scale;
	this.sw_altitude;

	this.constel = 1;
	this.fullMap = false;
	this.forceZoom = false;
	this.trackStar = false;
	this.lockUnderFeet = true;

	this.setLatitude = function(latitude) {
		this.latitude = latitude;
	}

	this.setScale = function(scale) {
		if(scale < windowSize.getRadius()) return;
		this.scale = scale;
	}
	this.forceSetScale = function(scale) {
		this.scale = scale;
		this.setAltitude(90);
	}
	this.setAzimuth = function(azimuth) {
		this.azimuth = 180 - azimuth;
	}
	this.setAltitude = function(altitude) {
		if(altitude < 0 || altitude > 90) return;
		this.altitude = altitude - 90;
	}

	this.save = function() {
		this.sw_scale = this.scale;
		this.sw_azimuth = this.azimuth;
		this.sw_altitude = this.altitude;
	}
	this.restore = function() {
		this.scale = (windowSize.getRadius() > this.sw_scale) ? windowSize.getRadius() : this.sw_scale;
		this.altitude = this.sw_altitude;
	}

	this.addScale = function(zoom) {
		if(this.fullMap) return;
		var maxZoom = 50000;
		this.scale += zoom
		if(this.scale + zoom < windowSize.getRadius()) this.scale = windowSize.getRadius();
		else if(this.scale + zoom > maxZoom) this.scale = maxZoom;
		else this.scale += zoom;
	}
	this.forceAddScale = function(zoom) {
		this.scale += zoom;
	}
	this.addAzimuth = function(angle) {
		this.azimuth += angle;
	}
	this.addAltitude = function(angle) {
		if(this.fullMap) return;
		if(this.altitude + angle < -90) this.altitude = -90;
		else if(this.altitude + angle > 0) this.altitude = 0;
		else this.altitude += angle;
	}

	this.panFactor = function() {
		var angle = 1.5*windowSize.getRadius()/this.scale;
		return angle;
	}
	this.changeFullMap = function() {
		this.fullMap = !this.fullMap;
		mouse.changeControl();
	}
	this.starTraking = function() {
		this.trackStar = !this.trackStar;
	}
	this.changeConstel = function() {
		this.constel = (this.constel+1)%3
	}
	this.changeLockUnderFeet = function() {
		this.lockUnderFeet = !this.lockUnderFeet;
	}
}
function PlotSet(plotSet, lineSet, colour, rotation) {
	this.plotSet = plotSet;
	this.lineSet = lineSet;
	this.colour = colour;
	this.rotation = rotation;

	this.visible = true;
	this.nameable = true;

	this.plotSky = function() {
		if(!this.visible) return;
		for(i = 0; i < this.plotSet.length; i++) {
			if(this.plotSet[i] == null) continue;
			this.plotSet[i].plotSky(this.rotation);
			if(this.nameable)
				this.plotSet[i].plotName();
		}
	}
	this.plotLine = function() {
		if(!this.visible) return;
		for(var c = 0; c < this.lineSet.length; c++) {
			for(var i = 0; i < this.lineSet[c].length; i++) {
				if(!this.lineSet[c][i]) continue;
				this.lineSet[c][i].setConnection();
			}
		}
		for(var c = 0; c < this.lineSet.length; c++) {
			ctx.save();
			ctx.strokeStyle = this.colour;
			for(var i = 0; i < this.lineSet[c].length; i++) {
				if(!this.lineSet[c][i]) continue;
				if(!this.plotSet[this.lineSet[c][i].id].plotPosition(this.rotation)) continue;
				var myxy = this.plotSet[this.lineSet[c][i].id].plotPosition(this.rotation);
				if(!this.plotSet[this.lineSet[c][i].id].checkOnScreen(myxy)) continue; // performance problem?
				for(var j = 0; j < this.lineSet[c][i].nbh.length; j++) {
					if(this.lineSet[c][i].connected[j]) continue;
					var ij = this.lineSet[c][i].nbh[j];
					if(!this.lineSet[c][ij]) continue;
					if(!this.plotSet[this.lineSet[c][ij].id].plotPosition(this.rotation)) continue;
					var desxy = this.plotSet[this.lineSet[c][ij].id].plotPosition(this.rotation);
					ctx.beginPath();
					ctx.moveTo(myxy[0], myxy[1]);
					ctx.lineTo(desxy[0], desxy[1]);
					ctx.closePath();
					ctx.stroke();
					tool.liningObject++;
					this.lineSet[c][i].connected[j] = true;
					for(var k = 0; k < this.lineSet[c][ij].nbh.length; k++) {
						if(this.lineSet[c][ij].nbh[k] == i) this.lineSet[c][ij].connected[k] = true;
					}
				}
			}
			ctx.restore()
		}
	}

	this.changeLine = function(lineSet) {
		this.lineSet = lineSet;
	}
	this.changeVisible = function() {
		this.visible = !this.visible;
	}
	this.changeNameable = function() {
		this.nameable = !this.nameable;
	}
	this.checkEachVisible = function(min_mag) {
		for(i = 0; i < this.plotSet.length; i++) {
			if(this.plotSet[i] == null) continue;
			this.plotSet[i].checkVisible(min_mag);
		}
	}
	this.checkEachNameable = function(min_mag) {
		for(i = 0; i < this.plotSet.length; i++) {
			if(this.plotSet[i] == null) continue;
			this.plotSet[i].checkSignificant(min_mag);
		}
	}
	this.changeEachShape = function() {
		for(i = 0; i < this.plotSet.length; i++) {
			if(this.plotSet[i] == null) continue;
			this.plotSet[i].shape++
			this.plotSet[i].shape %= 3
		}
	}
}

function Line(id, nbh) {
	this.id = id;
	this.nbh = nbh;
	this.connected = [];

	this.getPosition = function(skyRotation) {
		// =========== init sky section ============
		var xyz = this.cartesian;
		xyz = ezGL.switchCoordinateSystem(xyz);
		if(skyRotation) {
			xyz = ezGL.rotateZ(xyz, -20)//moveIndex); // rotate sky by celestial-pole-axis. -- use 20 to see orion
			xyz = ezGL.rotateX(xyz, console.latitude);
		} else {
			xyz = ezGL.rotateX(xyz, 90);
		}

		// =========== show sky section ============
		xyz = ezGL.scale(xyz, console.scale);
		xyz = ezGL.rotateY(xyz, console.azimuth);
		xyz = ezGL.rotateX(xyz, console.altitude);
//		if(xyz[1] < 0) return false;

		this.xy = [xyz[0], xyz[2]];
		return this.xy;
	}
	this.setConnection = function() {
		for(var i = 0; i < this.nbh.length; i++) {
			this.connected[i] = false;
		}
	}
}

function Background() {
	this.groundFill = "rgb(50, 0, 0)";//"rgba(15, 0, 5, 1)"; // change last value for alpha
	this.skyFill = "#050505";//"black";//"gray";

	this.plotBackground = function() {
		ctx.fillStyle = this.skyFill;
		ctx.fillRect(-windowSize.halfWidth, -windowSize.halfHeight, windowSize.width, windowSize.height);
	}
	this.plotGround = function() {
		this.plotUnderGround();
		if(console.altitude != -90 && console.scale < windowSize.getRadius())
			this.plotOverGround();
	}
	this.plotUnderGround = function() {
		var polygonNum = 24;
		var groundSet = [];
		for(var i = 0; i <= polygonNum; i++) {
			groundSet[i] = (2178 - 36*i)%1728;
		}
		var plotGroundSet = [];
		for(var i = 0; i <= polygonNum; i++) {
			plotGroundSet[i] = this.groundPosition(skyline[groundSet[i]].cartesian);
		}
		plotGroundSet[++polygonNum] = [windowSize.halfWidth, 0];
		plotGroundSet[++polygonNum] = [windowSize.halfWidth, windowSize.halfHeight + 1];
		plotGroundSet[++polygonNum] = [-windowSize.halfWidth, windowSize.halfHeight + 1];
		plotGroundSet[++polygonNum] = [-windowSize.halfWidth, 0];
		ezGL.drawPolygon(plotGroundSet, this.groundFill);
	}
	this.plotOverGround = function() {
		var polygonNum = 24;
		var groundSet = [];
		for(var i = 0; i <= polygonNum; i++) {
			groundSet[i] = (2178 + 36*i)%1728;
		}
		var plotGroundSet = [];
		for(var i = 0; i <= polygonNum; i++) {
			plotGroundSet[i] = this.groundPosition(skyline[groundSet[i]].cartesian);
		}
		plotGroundSet[++polygonNum] = [windowSize.halfWidth, 0];
		plotGroundSet[++polygonNum] = [windowSize.halfWidth, -windowSize.halfHeight - 1];
		plotGroundSet[++polygonNum] = [-windowSize.halfWidth, -windowSize.halfHeight - 1];
		plotGroundSet[++polygonNum] = [-windowSize.halfWidth, 0];
		ezGL.drawPolygon(plotGroundSet, this.groundFill);
	}
	this.groundPosition = function(cartesian) {
		var xyz = cartesian;
		xyz = ezGL.switchCoordinateSystem(xyz);
		xyz = ezGL.rotateX(xyz, 90);
		xyz = ezGL.rotateX(xyz, console.altitude);

		var angle = Math.atan(Math.sqrt(Math.pow(xyz[0], 2) + Math.pow(xyz[2], 2))/Math.abs(xyz[1]));
		if(xyz[1] < 0) angle = Math.PI - angle;
		angle *= 2/Math.PI;
		var posAng = Math.atan(xyz[2]/xyz[0]);
		var sgn = xyz[0] / Math.abs(xyz[0]);
		if(isNaN(sgn)) sgn = 1;
		var xy = [];
		xy[0] = sgn*angle*Math.cos(posAng);
		xy[1] = sgn*angle*Math.sin(posAng);
		xy = ezGL.scale(xy, console.scale);

		return xy;
	}
}

// +++++++++++++++++ chang parameters here to see what's going on +++++++++++++++++++
function initUtil() {
	tool = new Tool();

	mouse = new MouseControl();
	keyboard = new KeyboardControl();
}
function initConsole() {
	console = new Console();
	tool.resizeHandler();

	console.setLatitude(30); // where you live? ^__^
	console.setScale(windowSize.getRadius()); // old parameter = 750, need to be re calculate
	console.setAzimuth(90); // move mouse in vertical. parameter between 0 (north) round to 360
	console.setAltitude(20); // move mouse in horizental. parameter between 0 to 90 (zenith)
}
function initPlot() {
	ezGL = new EzGL();

	initStar();
	initConstal();
	initAltConstal();
	initOthersPlot();
	initLine();

	
	sky = new Sky(true);
	observer = new Sky(false);
	background = new Background();

	newCon = false;
	starSet = new PlotSet(star, constal, "rgba(150, 0, 0, 0.9)", true);
	skylineSet = new PlotSet(skyline, line, "rgba(0, 50, 0, 0.5)", true);
	obslineSet = new PlotSet(skyline, line, "rgba(80, 80, 0, 0.5)", false);
	compassSet = new PlotSet(compass, line, "black", false);
//	labelSet = new PlotSet(label, true);
	starSet.checkEachVisible(4);
	starSet.checkEachNameable(7);
	starSet.nameable = false;

	skylineSet.visible = false;
	obslineSet.visible = false;
}

function drawSky() {
	ctx.save();
	ctx.clearRect(0, 0, windowSize.width, windowSize.height);
	ctx.translate(windowSize.halfWidth, windowSize.halfHeight);
	ctx.fillStyle = "white";
	ctx.strokeStyle = "white";

	// ===================== control handler ==================
	window.addEventListener("keydown", keyboard.keyControl, true);
	window.onmousewheel = mouse.wheel;

	test = 0 //= true;
	// ==================== animation handler =================
	if(mouse.leftDown) mouse.drag();
	else mouse.releaseHandler();
	if(mouse.dblGoto) mouse.gotoHandler();

	// ===================== skyyy ===========================
	if(!stopMoving) {
		moveIndex = 0;
//		moveIndex = -currentTime();
	} else {
		moveIndex = 180;
	}
	ctx.save(); // after clip, anything out there will be unseen (but still calculate)
	background.plotBackground();

	tool.drawingObject = 0;
	tool.liningObject = 0;

	skylineSet.plotLine();
	obslineSet.plotLine();
//	skylineSet.plotSky();
//	obslineSet.plotSky();

	starSet.plotLine();
	starSet.plotSky();

//	labelSet.plotSky();
	ctx.restore(); // unclip

	background.plotGround();
	compassSet.plotSky();


	if(true) {// ================ hud ========================
		ctx.fillText("mouse = " + sky.stringPosition(mouse.oxy), -500, 20);
		ctx.fillText("origin = " + sky.stringPosition([0, 0]), -500, 40);

		ctx.fillText("mouse = " + observer.stringPosition(mouse.oxy), -500, 70);
		ctx.fillText("origin = " + observer.stringPosition([0, 0]), -500, 90);

			ctx.fillText(mouse.gotAltz[0], -550, -50);
			ctx.fillText(mouse.gotAltz[1], -550, -35);
			ctx.fillText(mouse.oxy, -500, -70);
			ctx.fillText(mouse.cxy, -500, -60);
			
//				ctx.fillText(observer.position(mouse.cxy), -400, -50);
				ctx.fillText(observer.position([0, 0]), -400, -35);
				ctx.fillText(observer.position([0, 1]), -400, -20);
			
//			ctx.fillText(mouse.unclick, 500, -35);
			ctx.fillText(mouse.leftDown, 500, -20);
			ctx.fillText(mouse.dblGoto, 500, -5);
	}
	// ======================= dev zone =======================
	ctx.fillText(console.scale, 0, 0); // use this to check where to debug
	ctx.fillText(windowSize.halfWidth, 0, 20); // use this to check where to debug
	ctx.fillText((console.scale > windowSize.getRadius()/2), 0, 40); // use this to check where to debug
	ctx.fillText(tool.fps(), 525, -300);
//	ctx.fillText(keyboard.arrowDown, 400, -50);
//	ctx.fillText(keyboard.panning, 400, -35);

//	ctx.fillText(console.scale, 0, 0);
	ctx.fillText("object draw = " + tool.drawingObject, -575, -280);
	ctx.fillText("object lined = " + tool.liningObject, -575, -265);
	ctx.fillText("draw complete!", -575, -300); // use this to check if canvas has no problems
	ctx.restore();
}

function init() {
//	alert() // test somthing here!! (only 1 time alert)
	var canvas = document.getElementById("sky");
	if(canvas.getContext) {
		ctx = canvas.getContext("2d");
		initUtil()
		initConsole();
		initPlot();
		// todo: initRestore() for localStorage that save user's setting.
		setInterval("drawSky();", 15);
	}
}