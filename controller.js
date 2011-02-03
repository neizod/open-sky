function KeyboardControl() {
	this.control = true;

	this.keyControl = function(e) {
		this.key = (e.which) ? e.which : event.keyCode;
		switch(this.key) {
			// ================ rotate sky section =================
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
				console.addScale(0.02*console.scale);
				break;
			case 90: // z -- zoom out
				console.addScale(-0.02*console.scale);
				break;
			// ================= sky setting section ================
			case 83: // s -- stop sky
				stopMoving = !stopMoving;
				break;
			case 76: // l -- show sky line
				skylineSet.changeVisible();
				break;
			case 71: // g -- show grid line
				obslineSet.changeVisible();
				break;
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
				if(console.forceZoom) return;
				if(!console.fullMap) {
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
	this.control = true;

	this.unclick = true;
	this.leftDown = false;
	this.dblGoto = false;

	this.xy = [];
	this.oxy = [0, 0];
	this.cxy = [];
	this.dxyO = [];
	this.dxyN = [];
	this.obsAltz = [0, 0];
	this.gotAltz = [0, 0];
	this.speedSet = [0, 0, 0, 0, 0];
	this.releaseSpeed = 0;
	this.nowSpeed = 0;
	this.gotSpeed = 0;

	this.absolutePosition = function(e) {
		this.xy[0] = (e.offsetX) ? e.offsetX : e.layerX;
		this.xy[1] = (e.offsetY) ? e.offsetY : e.layerY;
		this.originPosition(this.xy);
	}
	this.originPosition = function(xy) {
		this.oxy = [xy[0] - windowSize.halfWidth, xy[1] - windowSize.halfHeight];
	}
	this.clickingPosition = function() {
		this.cxy = [this.oxy[0], this.oxy[1]];
	}
	this.dragingPosition = function() {
		this.dxyO = [this.dxyN[0], this.dxyN[1]];
		this.dxyN = [this.oxy[0], this.oxy[1]];
	}

	this.click = function() {
		if(console.forceZoom) return;
		if(this.dblGoto) this.dblGoto = false;
	}
	this.right = function(e) { // !!!!!!!!!!!!!!! broke !!!!!!!!!!!!!!	
		if(e.button == 2) e.stopPropagation();
	}
	this.dblclick = function() {
		if(console.forceZoom) return;
		this.clickingPosition();

		this.desAltz = observer.position(this.cxy);
		this.cenAltz = observer.position([0, 0]);

		this.gotAltz = [-this.desAltz[0] + this.cenAltz[0], this.desAltz[1] - this.cenAltz[1]];
		if(this.gotAltz[0] > 180) this.gotAltz[0] -= 360;
		else if(this.gotAltz[0] < -180) this.gotAltz[0] += 360;

		this.gotSpeed = this.allSpeed = 20;
		this.deriviate = 0;
		for(i = 0; i <= this.gotSpeed; i++) {
			this.deriviate += Math.pow(Math.sin(i*Math.PI/this.allSpeed), 2);
		}
		this.deriviate = 1/this.deriviate;
		this.dblGoto = true;
	}
	this.drag = function() {
		if(console.forceZoom) return;
		this.dblGoto = false;
		if(!this.control) return;
		this.dragingPosition();
		this.leftDown = true;
		if(this.leftDown && !this.unclick) {
			dragVector = [this.dxyN[0] - this.dxyO[0], this.dxyN[1] - this.dxyO[1]];
			dragSpeed = Math.sqrt(Math.pow(dragVector[0], 2) + Math.pow(dragVector[1], 2));
			this.speedHandler(dragSpeed);

			obsAtzO = observer.position(this.dxyO);
			obsAtzN = observer.position(this.dxyN);

			this.obsAltz = [obsAtzN[0] - obsAtzO[0], obsAtzN[1] - obsAtzO[1]];
			if(this.obsAltz[0] > 180) this.obsAltz[0] -= 360;
			else if(this.obsAltz[0] < -180) this.obsAltz[0] += 360;

			if(this.dxyO[1] >= this.getZenith()) this.obsAltz[1] = -this.obsAltz[1];
			console.addAzimuth(this.obsAltz[0]);
			console.addAltitude(this.obsAltz[1]);
		} else {
			this.obsAltz = [0, 0];
		}
		this.unclick = false;
	}
	this.release = function() {
		if(console.forceZoom) return;
		if(!this.control || !this.leftDown) return;
		this.leftDown = false;
		this.unclick = true;
		this.dxyO = [];
		this.dxyN = [];
		this.speedSet = [0, 0, 0, 0, 0];
		this.releaseSpeed = Math.floor(this.releaseSpeed) + 1;
		this.nowSpeed = this.releaseSpeed;
	}
	this.out = function() {
		if(console.forceZoom) return;
		if(this.leftDown) this.release();
	}

	this.farRadius = function() {
		toMouse = Math.sqrt(Math.pow(this.oxy[0], 2) + Math.pow(this.oxy[1], 2));
		if(toMouse > windowSize.getRadius()/2);
		farFactor = Math.pow(Math.cos(toMouse*Math.PI/windowSize.getRadius()), 2);
		return farFactor;
	}
	this.getZenith = function() {
		xyz = compassSet.plotSet[8].cartesian;
		xyz = ezGL.switchCoordinateSystem(xyz);
		xyz = ezGL.rotateX(xyz, 90);

		xyz = ezGL.scale(xyz, console.scale);
		xyz = ezGL.rotateY(xyz, console.azimuth);
		xyz = ezGL.rotateX(xyz, console.altitude);
		return xyz[2];
	}
	this.speedHandler = function(dragSpeed) {
		for(i = 4; i > 0; i--) {
			this.speedSet[i] = this.speedSet[i-1];
		}
		this.speedSet[0] = dragSpeed;
		this.releaseSpeed = 0;
		for(i = 0; i < 4; i++) {
			this.releaseSpeed = (this.speedSet[i] > this.releaseSpeed) ? this.speedSet[i] : this.releaseSpeed;
		}
	}
	this.releaseHandler = function() {
		releaseSpeedFunction = Math.pow(Math.E, -(this.releaseSpeed - this.nowSpeed)/2);
		if(this.nowSpeed > 0) {
			console.addAzimuth(releaseSpeedFunction*this.obsAltz[0]);
			console.addAltitude(releaseSpeedFunction*this.obsAltz[1]);
			this.nowSpeed--;
		} else this.obsAltz = [0, 0];
	}
	this.gotoHandler = function() {
		if(this.gotSpeed == this.allSpeed) {
			if(console.fullMap) {
				zoomSpeed = windowSize.getRadius() - console.scale;
				console.changeFullMap();
				ground.changeFullMap();
				console.forceZoom = true;
			} else if(this.farRadius() > 0) {
				zoomSpeed = this.farRadius()*console.scale;
			} else zoomSpeed = 0;
		}

		gotoSpeedFunction = Math.pow(Math.sin(this.gotSpeed*Math.PI/this.allSpeed), 2)*this.deriviate;
		if(this.gotSpeed > 0) {
			if(console.scale < windowSize.getRadius()) {
				console.forceAddScale(gotoSpeedFunction*zoomSpeed);
			} else console.addScale(gotoSpeedFunction*zoomSpeed);
			console.addAzimuth(gotoSpeedFunction*this.gotAltz[0]);
			console.addAltitude(gotoSpeedFunction*this.gotAltz[1]);
			this.gotSpeed--;
		} else {
			this.dblGoto = false;
			if(console.forceZoom) {
				ground.changeFullMap();
				console.forceZoom = false;
			}
		}
	}

	this.changeControl = function() {
		this.control = !this.control;
	}
}