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
	this.obsAltz = [];
	this.gotAltz = [];
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
		this.oxy[0] = xy[0] - windowSize.halfWidth;
		this.oxy[1] = xy[1] - windowSize.halfHeight;
	}
	this.clickingPosition = function() {
		this.cxy[0] = this.oxy[0];
		this.cxy[1] = this.oxy[1];
	}
	this.dragingPosition = function() {
		this.dxyO[0] = this.dxyN[0];
		this.dxyO[1] = this.dxyN[1];
		this.dxyN[0] = this.oxy[0];
		this.dxyN[1] = this.oxy[1];
	}

	this.click = function() {
		if(console.forceZoom) return;
		this.dblGoto = false;
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
			this.dragVector = [this.dxyN[0] - this.dxyO[0], this.dxyN[1] - this.dxyO[1]];
			this.dragSpeed = Math.sqrt(Math.pow(this.dragVector[0], 2) + Math.pow(this.dragVector[1], 2));
			this.speedHandler(this.dragSpeed);

			this.obsAtzO = observer.position(this.dxyO);
			this.obsAtzN = observer.position(this.dxyN);

			this.obsAltz = [this.obsAtzN[0] - this.obsAtzO[0], this.obsAtzN[1] - this.obsAtzO[1]];
			if(this.obsAltz[0] > 180) this.obsAltz[0] -= 360;
			else if(this.obsAltz[0] < -180) this.obsAltz[0] += 360;
			this.zenith = this.getZenith();

			if(this.dxyO[1] >= this.zenith) this.obsAltz[1] = -this.obsAltz[1];
			console.addAzimuth(this.obsAltz[0]);
			console.addAltitude(this.obsAltz[1]);
		}
		this.unclick = false;
	}
	this.release = function() {
		if(!this.control || !this.leftDown || console.forceZoom) return;
		this.leftDown = false;
		this.unclick = true;
		this.dxyN = [];
		this.dxyO = [];
		this.speedSet = [0, 0, 0, 0, 0];
		this.releaseSpeed = Math.floor(this.releaseSpeed) + 1;
		this.nowSpeed = this.releaseSpeed;
	}
	this.out = function() {
		if(console.forceZoom) return;
		if(this.leftDown) this.release();
	}

	this.checkCenterScreen = function(size) { // !!!!!!!!!!!! indicate by circle !!!!!!!!!!!
		this.centerArea = size
		if(this.oxy[0] < this.centerArea && this.oxy[0] > -this.centerArea &&
		   this.oxy[1] < this.centerArea && this.oxy[1] > -this.centerArea)
			return true;
		return false;
	}
	this.getZenith = function() {
		this.xyzZ = compassSet.plotSet[8].cartesian;
		this.xyzZ = ezGL.toRealWorldCoordinate(this.xyzZ);
		this.xyzZ = ezGL.rotateX(this.xyzZ, 90);

		this.xyzZ = ezGL.scale(this.xyzZ, console.scale);
		this.xyzZ = ezGL.rotateY(this.xyzZ, console.azimuth);
		this.xyzZ = ezGL.rotateX(this.xyzZ, console.altitude);
		return this.xyzZ[2];
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
		this.releaseSpeedFunction = Math.pow(Math.E, -(this.releaseSpeed - this.nowSpeed)/2);
		if(this.nowSpeed > 0) {
			console.addAzimuth(this.releaseSpeedFunction*this.obsAltz[0]);
			console.addAltitude(this.releaseSpeedFunction*this.obsAltz[1]);
			this.nowSpeed--;
		}
	}
	this.gotoHandler = function() {
		if(this.gotSpeed == this.allSpeed) {
			if(console.fullMap) {
				this.zoomSpeed = windowSize.getRadius() - console.scale;
				console.changeFullMap();
				ground.changeFullMap();
				console.forceZoom = true;
			} else if(this.checkCenterScreen(40)) this.zoomSpeed = 2*console.scale/3;
			else this.zoomSpeed = 0;
		}

		this.gotoSpeedFunction = Math.pow(Math.sin(this.gotSpeed*Math.PI/this.allSpeed), 2)*this.deriviate;
		if(this.gotSpeed > 0) {
			if(console.scale < windowSize.getRadius()) {
				console.forceAddScale(this.gotoSpeedFunction*this.zoomSpeed);
			} else console.addScale(this.gotoSpeedFunction*this.zoomSpeed);
			console.addAzimuth(this.gotoSpeedFunction*this.gotAltz[0]);
			console.addAltitude(this.gotoSpeedFunction*this.gotAltz[1]);
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