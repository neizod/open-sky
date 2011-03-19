function KeyboardControl() {
	this.control = true;

	this.keyControl = function(e) {
		this.key = (e.which) ? e.which : event.keyCode;
		switch(this.key) {
			// ================ navigation section ==================
			case 37: // left arrow
				console.addAzimuth(console.panFactor());
				break;
			case 38: // up arrow
				console.addAltitude(console.panFactor());
				break;
			case 39: // right arrow
				console.addAzimuth(-console.panFactor());
				break;
			case 40: // down arrow
				console.addAltitude(-console.panFactor());
				break;
			case 88: // x -- zoom in
				console.addScale(console.zoomFactor());
				break;
			case 90: // z -- zoom out
				console.addScale(-console.zoomFactor());
				break;
			// ================= sky setting section ================
			case 83: // s -- stop sky
				stopMoving = !stopMoving;
				break;
			case 67: // c -- constellation
				switch(console.constel) {
					case 0:
						starSet.changeLine(constal);
						break;
					case 1:
						starSet.changeLine(altconstal);
						break;
					default:
						starSet.changeLine([]);
				}
				console.changeConstel()
				break;
			case 76: // l -- show sky line
				if(!skylineSet.visible && !obslineSet.visible)
					skylineSet.changeVisible();
				else if(skylineSet.visible && !obslineSet.visible)
					obslineSet.changeVisible();
				else if(skylineSet.visible && obslineSet.visible)
					skylineSet.changeVisible();
				else
					obslineSet.changeVisible();
				break;
//			case 71: // g -- show grid line
//				obslineSet.changeVisible();
//				break;
			case 78: // n -- show name
				starSet.changeNameable();
				break;
			case 84: // t -- change star shape
				starSet.changeEachShape();
				break;
			case 85: // u -- show map under feet & unlock rotate under feet
				console.changeLockUnderFeet();
				break;
			case 70: // f -- show full map
				if(console.isTransit) return;
				if(!console.isFull) {
					console.save();
					console.forceSetScale(windowSize.getFullBall());
				} else console.restore();
				console.changeFullMap();
				break;
			case 81: // q -- optimize performance
				tool.performance(true);
				break;
			// =================== magnitude setting ==================
			case 49: // 1 -- magnitude 1
				starSet.checkEachVisible(1);
				break;
			case 50:
				starSet.checkEachVisible(2);
				break;
			case 51:
				starSet.checkEachVisible(3);
				break;
			case 52:
				starSet.checkEachVisible(4);
				break;
			case 53:
				starSet.checkEachVisible(5);
				break;
			case 54:
				starSet.checkEachVisible(6);
				break;
			case 55:
				starSet.checkEachVisible(7);
				break;
		}
	}
	this.changeControl = function() {
		this.control = !this.control;
	}
}

function MouseControl() {
	this.leftDown = false;

	this.xy = [];
	this.oxy = [0, 0];
	this.cxy = [];
	this.dxyO = [];
	this.dxyN = [];
	this.obsAltz = [];
	this.gotAltz = [0, 0]; // no longer use, still call at sky.js
	this.speedSet = [0, 0, 0, 0];

	this.zoomFull = 0;

	this.absolutePosition = function(e) {
		this.xy[0] = (e.offsetX) ? e.offsetX : e.layerX;
		this.xy[1] = (e.offsetY) ? e.offsetY : e.layerY;
		this.originPosition(this.xy);
	}
	this.originPosition = function(xy) {
		this.oxy = [xy[0] - windowSize.halfWidth, xy[1] - windowSize.halfHeight];
	}
	this.clickingPosition = function() {
		this.cxy = this.oxy.slice();
	}
	this.dragingPosition = function() {
		this.dxyO = this.dxyN.slice();
		this.dxyN = this.oxy.slice();
	}

	this.click = function() {
		if(console.isTransit) return;
	}
	this.right = function() {
		if(console.isTransit) return;

		// ---- just one of menu -----
		var url = "http://www.google.com/sky/";
		var radec = sky.position(this.oxy);
		
		url += "#latitude=" + radec[1];
		url += "&longitude=" + 15*(radec[0] - 12);
		url += "&zoom=4";

		window.open(url);
		// ---------------------------
	}
	this.dblclick = function() {
		if(console.isTransit) return;

		this.clickingPosition();

		var desAltz = observer.position(this.cxy);
		var cenAltz = observer.position([0, 0]);
		var dwnAltz = observer.position([0, 1]);

		var gotAltz = [-desAltz[0] + dwnAltz[0], desAltz[1] - cenAltz[1]];
		gotAltz[0] = ezGL.checkCircleRound(gotAltz[0]);

		var zoomSpeed = 0;
		var forceZoom = false;
		if(console.isFull) {
			zoomSpeed = windowSize.getRadius() - console.scale;
			forceZoom = true;
			console.changeFullMap();
			console.isTransit = true;
		} else if(console.scale > 10*windowSize.getRadius()) {
			zoomSpeed = windowSize.getRadius() - console.scale;
			zoomSpeed = zoomSpeed/2 - 1;
			gotAltz = [0, 0];
		} else if(this.farRadius() > 0) {
			zoomSpeed = this.farRadius()*console.scale;
		} else zoomSpeed = 0;

		animation.slow(2.5);

		animation.event.push(new AnimateGoto(gotAltz, zoomSpeed, forceZoom));
	}
	this.down = function(e) {
		if(console.isTransit) return;

		if(e.which == 1)
			this.drag();
	}
	this.up = function(e) {
		if(console.isTransit) return;

		if(e.which == 1)
			this.release();
		else if(e.which == 3)
			this.right();
	}
	this.out = function() {
		if(console.isTransit) return;

		if(this.leftDown) this.release();
	}
	this.wheel = function(e) {
		if(console.isTransit) return;

		e = e ? e : window.event;
		var zoom = e.detail ? -e.detail : e.wheelDelta / 40;
		
		if(zoom > 0) {
			if(console.isFull) {
				if(mouse.zoomFull < 2) {
					mouse.zoomFull++;
					animation.event.push(new AnimateReset());
				} else {
					mouse.zoomFull = 0;
					console.isTransit = true;
					console.changeFullMap();

					animation.event.length = 0;
					var gotOAltz = console.sw_altitude;
					var zoomSpeed = windowSize.getRadius() - console.scale;
					animation.event.push(new AnimateGoto([0, gotOAltz], zoomSpeed, true));
				}
			} else if(console.scale == console.mx_scale) {
				mouse.zoomFull = 0;
			} else {
				mouse.zoomFull = 0;
				animation.event.push(new AnimateGoto([0, 0], 0.28*console.scale, false));
			}
		} else {
			if(console.scale == windowSize.getRadius()) {
				if(mouse.zoomFull > -2) {
					mouse.zoomFull--;
					animation.event.push(new AnimateReset());
				} else {
					mouse.zoomFull = 0;
					console.isTransit = true;

					console.save();
					animation.event.length = 0;
					var gotZenith = -console.altitude;
					var zoomSpeed = windowSize.getFullBall() - console.scale;
					animation.event.push(new AnimateGoto([0, gotZenith], zoomSpeed, true));
				}
			} else if(console.isFull) {
				mouse.zoomFull = 0;
			} else {
				mouse.zoomFull = 0;
				animation.event.push(new AnimateGoto([0, 0], -0.11*console.scale, false));
			}
		}
	}

	this.drag = function() {
		animation.slow(1.4);

		this.dragingPosition();
		if(this.leftDown) {
			var dragVector = [this.dxyN[0] - this.dxyO[0], this.dxyN[1] - this.dxyO[1]];
			var dragSpeed = Math.sqrt(Math.pow(dragVector[0], 2) + Math.pow(dragVector[1], 2));
			this.speedHandler(dragSpeed);

			var obsAtzO = observer.position(this.dxyO);
			var obsAtzN = observer.position(this.dxyN);

			this.obsAltz = [obsAtzN[0] - obsAtzO[0], obsAtzN[1] - obsAtzO[1]];
			this.obsAltz[0] = ezGL.checkCircleRound(this.obsAltz[0]);

			if(this.dxyO[1] >= ezGL.getZenith()) this.obsAltz[1] = -this.obsAltz[1];
			console.addAzimuth(this.obsAltz[0]);
			console.addAltitude(this.obsAltz[1]);
		} else {
			this.speedHandler(0);
			this.obsAltz = [0, 0];
		}
		this.leftDown = true;
	}
	this.release = function() {
		if(!this.leftDown) return;
		this.leftDown = false;
		animation.event.push(new AnimateRelease(this.obsAltz, this.releaseSpeed));

		this.dxyO = [];
		this.dxyN = [];
		this.speedSet = [0, 0, 0, 0];
	}

	this.farRadius = function() {
		toMouse = Math.sqrt(Math.pow(this.oxy[0], 2) + Math.pow(this.oxy[1], 2));
		if(toMouse < windowSize.getRadius()/2)
			farFactor = Math.pow(Math.cos(toMouse*Math.PI/windowSize.getRadius()), 2);
		else farFactor = 0;
		return farFactor;
	}
	this.speedHandler = function(dragSpeed) {
		this.speedSet.shift();
		this.speedSet.push(dragSpeed);

		this.releaseSpeed = 0;
		for(var i = 0; i < 4; i++) {
			this.releaseSpeed = (this.speedSet[i] > this.releaseSpeed) ? this.speedSet[i] : this.releaseSpeed;
		}
	}
}

function Information() {
	this.focusObj = [];

	this.add = function(obj) {
		if(this.focusObj.length > 0 && this.focusObj[0].mag > obj.mag)
			this.focusObj.splice(0, 0, obj);
		else
			this.focusObj.push(obj);
	}
	this.clear = function() {
		this.focusObj.length = 0;
	}
}

function Animation() {
	this.event = [];

	this.animate = function() {
		for(var i = this.event.length - 1; i >= 0; i--) {
			if(this.event[i].turnLeft >= 0)
				this.event[i].animate();
			else
				this.event.splice(i, 1);
		}
	}
	this.slow = function(slowFactor) {
		for(var i = 0; i < this.event.length; i++) {
			this.event[i].slow(slowFactor);
		}
	}
}

function AnimateReset() {
	this.turnLeft = 15;
	this.turnAll = 15;

	this.animate = function() {
		if(this.turnLeft > 0) {
			this.turnLeft--;
		} else {
			mouse.zoomFull = 0;
			this.turnLeft--;
		}
	}
	this.slow = function(slowFactor) {
		mouse.zoomFull = 0;
		this.turnLeft = -1;
	}
}

function AnimateGoto(gotAltz, zoomSpeed, forceZoom) {
	this.gotAltz = gotAltz;
	this.zoomSpeed = zoomSpeed;
	this.forceZoom = forceZoom;

	this.turnLeft = 20;
	this.turnAll = 20;
	this.deriviate = 0;
	for(var i = 0; i <= this.turnLeft; i++)
		this.deriviate += Math.pow(Math.sin(i*Math.PI/this.turnAll), 2);
	this.deriviate = 1/this.deriviate;

	this.animate = function() {
		var speedFunction = Math.pow(Math.sin(Math.PI*this.turnLeft/this.turnAll), 2)*this.deriviate;

		if(this.turnLeft > 0) {
			if(this.forceZoom)
				console.forceAddScale(speedFunction*this.zoomSpeed);
			else
				console.addScale(speedFunction*this.zoomSpeed);
			console.addAzimuth(speedFunction*this.gotAltz[0]);
			console.addAltitude(speedFunction*this.gotAltz[1]);
			this.turnLeft--;
		} else {
			if(Math.floor(console.scale) <= windowSize.getFullBall() && console.isTransit)
				console.changeFullMap();
			if(console.isTransit)
				console.isTransit = false;
			this.turnLeft--;
		}
	}
	this.slow = function(slowFactor) {
		this.deriviate /= slowFactor;
	}
}

function AnimateRelease(obsAltz, releaseSpeed) {
	this.obsAltz = obsAltz;

	this.turnLeft = Math.floor(releaseSpeed) + 1;
	this.turnAll = this.turnLeft;
	this.deriviate = 1;

	this.animate = function() {
		var speedFunction = Math.pow(Math.E, -(this.turnAll - this.turnLeft)/2)*this.deriviate;

		if(speedFunction > 0.0001) {
			console.addAzimuth(speedFunction*this.obsAltz[0]);
			console.addAltitude(speedFunction*this.obsAltz[1]);
			this.turnLeft--;
		} else this.turnLeft = -1;
	}
	this.slow = function(slowFactor) {
		this.deriviate /= (slowFactor/1.2);
	}
}