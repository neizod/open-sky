/** since i don't know any of html5 3d graphics library, i created my own for this propose only
 */

var ezGL;

function EzGL() {
	this.toRadian = function(angle){
		return angle*Math.PI/180;
	}
	this.switchCoordinateSystem = function(xyz) { // also from real wolrd to computer coordinate
		var xyz = this.rotateY(xyz, 180);
		return xyz;
	}
	this.scale = function(xyz, scaling) {
		return [scaling*xyz[0], scaling*xyz[1], scaling*xyz[2]];
	}
	this.rotateX = function(xyz, angle) {
		var angle = this.toRadian(angle);
		var cX = xyz[0];
		var cY = xyz[1]*Math.cos(angle) - xyz[2]*Math.sin(angle);
		var cZ = xyz[1]*Math.sin(angle) + xyz[2]*Math.cos(angle);
		return [cX, cY, cZ];
	}
	this.rotateY = function(xyz, angle) {
		var angle = this.toRadian(angle);
		var cX = xyz[2]*Math.sin(angle) + xyz[0]*Math.cos(angle);
		var cY = xyz[1];
		var cZ = xyz[2]*Math.cos(angle) - xyz[0]*Math.sin(angle);
		return [cX, cY, cZ];
	}
	this.rotateZ = function(xyz, angle) {
		var angle = this.toRadian(angle);
		var cX = xyz[0]*Math.cos(angle) - xyz[1]*Math.sin(angle);
		var cY = xyz[0]*Math.sin(angle) + xyz[1]*Math.cos(angle);
		var cZ = xyz[2];
		return [cX, cY, cZ];
	}
	this.drawPolygon = function(polygonSet, fill) {
		ctx.save();
		ctx.fillStyle = fill;
		ctx.beginPath();
		ctx.moveTo(polygonSet[0][0], polygonSet[0][1]);
		for(var i = 1; i < polygonSet.length ; i++){
			ctx.lineTo(polygonSet[i][0], polygonSet[i][1]);
		}
		ctx.fill();
		ctx.restore();
	}
	this.clipPolygon = function(polygonSet) {
		ctx.beginPath();
		ctx.moveTo(polygonSet[0][0], polygonSet[0][1]);
		for(var i = 1; i < polygonSet.length ; i++){
			ctx.lineTo(polygonSet[i][0], polygonSet[i][1]);
		}
		ctx.clip();
	}
}