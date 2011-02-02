/** since i don't know any of html5 3d graphics library, i created my own for this popose only
 */

var ezGL;

function EzGL() {
	this.toRadian = function(angle){
		return angle*Math.PI/180;
	}
	this.toRealWorldCoordinate = function(xyz) {
		xyz = this.rotateY(xyz, 180);
		return xyz;
	}
	this.scale = function(xyz, scaling) {
		return [scaling*cX, scaling*cY, scaling*cZ];
	}
	this.rotateX = function(xyz, angle) {
		angle = this.toRadian(angle);
		cX = xyz[0];
		cY = xyz[1]*Math.cos(angle) - xyz[2]*Math.sin(angle);
		cZ = xyz[1]*Math.sin(angle) + xyz[2]*Math.cos(angle);
		return [cX, cY, cZ];
	}
	this.rotateY = function(xyz, angle) {
		angle = this.toRadian(angle);
		cX = xyz[2]*Math.sin(angle) + xyz[0]*Math.cos(angle);
		cY = xyz[1];
		cZ = xyz[2]*Math.cos(angle) - xyz[0]*Math.sin(angle);
		return [cX, cY, cZ];
	}
	this.rotateZ = function(xyz, angle) {
		angle = this.toRadian(angle);
		cX = xyz[0]*Math.cos(angle) - xyz[1]*Math.sin(angle);
		cY = xyz[0]*Math.sin(angle) + xyz[1]*Math.cos(angle);
		cZ = xyz[2];
		return [cX, cY, cZ];
	}
	this.drawPolygon = function(polygonSet, fill) {
		ctx.save();
		ctx.fillStyle = fill;
		ctx.beginPath();
		ctx.moveTo(polygonSet[0][0], polygonSet[0][1]);
		for(i = 1; i < polygonSet.length ; i++){
			ctx.lineTo(polygonSet[i][0], polygonSet[i][1]);
		}
		ctx.fill();
		ctx.restore();
	}
	this.clipPolygon = function(polygonSet) {
		ctx.beginPath();
		ctx.moveTo(polygonSet[0][0], polygonSet[0][1]);
		for(i = 1; i < polygonSet.length ; i++){
			ctx.lineTo(polygonSet[i][0], polygonSet[i][1]);
		}
		ctx.clip();
	}
}