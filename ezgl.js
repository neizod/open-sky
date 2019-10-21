/** since i don't know any of html5 3d graphics library, i created my own for this propose only.
 *  this gl also include some useful utilites that not exist in javascript.
 */

var ezGL

function EzGL () {
  this.toRadian = function (angle) {
    return (angle * Math.PI) / 180
  }
  this.switchCoordinateSystem = function (xyz) {
    var xyz = this.rotateY(xyz, 180)
    return xyz
  }
  this.checkCircleRound = function (checkValue) {
    if (checkValue > 180) checkValue -= 360
    else if (checkValue < -180) checkValue += 360
    return checkValue
  }
  this.getZenith = function () {
    xyz = compassSet.plotSet[8].cartesian
    xyz = this.switchCoordinateSystem(xyz)
    xyz = this.rotateX(xyz, 90)

    xyz = this.rotateY(xyz, console.azimuth)
    xyz = this.rotateX(xyz, console.altitude)

    var angle = Math.atan(
      Math.sqrt(Math.pow(xyz[0], 2) + Math.pow(xyz[2], 2)) / Math.abs(xyz[1])
    )
    if (xyz[1] < 0) angle = Math.PI - angle
    angle *= 2 / Math.PI
    var posAng = Math.atan(xyz[2] / xyz[0])

    var xy = []
    xy[0] = this.sgn(xyz[0]) * angle * Math.cos(posAng)
    xy[1] = this.sgn(xyz[0]) * angle * Math.sin(posAng)

    xy = this.scale(xy, console.scale)
    return xy[1]
  }

  this.scale = function (xyz, scaling) {
    return [scaling * xyz[0], scaling * xyz[1], scaling * xyz[2]]
  }
  this.rotateX = function (xyz, angle) {
    var angle = this.toRadian(angle)
    var cX = xyz[0]
    var cY = xyz[1] * Math.cos(angle) - xyz[2] * Math.sin(angle)
    var cZ = xyz[1] * Math.sin(angle) + xyz[2] * Math.cos(angle)
    return [cX, cY, cZ]
  }
  this.rotateY = function (xyz, angle) {
    var angle = this.toRadian(angle)
    var cX = xyz[2] * Math.sin(angle) + xyz[0] * Math.cos(angle)
    var cY = xyz[1]
    var cZ = xyz[2] * Math.cos(angle) - xyz[0] * Math.sin(angle)
    return [cX, cY, cZ]
  }
  this.rotateZ = function (xyz, angle) {
    var angle = this.toRadian(angle)
    var cX = xyz[0] * Math.cos(angle) - xyz[1] * Math.sin(angle)
    var cY = xyz[0] * Math.sin(angle) + xyz[1] * Math.cos(angle)
    var cZ = xyz[2]
    return [cX, cY, cZ]
  }

  this.drawPolygon = function (polygonSet, fill) {
    ctx.save()
    ctx.fillStyle = fill
    ctx.beginPath()
    ctx.moveTo(polygonSet[0][0], polygonSet[0][1])
    for (var i = 1; i < polygonSet.length; i++) {
      ctx.lineTo(polygonSet[i][0], polygonSet[i][1])
    }
    ctx.fill()
    ctx.restore()
  }
  this.clipPolygon = function (polygonSet) {
    ctx.beginPath()
    ctx.moveTo(polygonSet[0][0], polygonSet[0][1])
    for (var i = 1; i < polygonSet.length; i++) {
      ctx.lineTo(polygonSet[i][0], polygonSet[i][1])
    }
    ctx.clip()
  }

  this.sgn = function (value) {
    if (value >= 0) return 1
    else return -1
  }
  this.compare = function (arrayA, arrayB) {
    if (typeof arrayB !== 'object') { arrayB = this.createArray(arrayB, arrayA.length) } else if (arrayA.length !== arrayB.length) return false

    for (var i = 0; i < arrayA.length; i++) { if (arrayA[i] !== arrayB[i]) return false }
    return true
  }
  this.createArray = function (each, times) {
    var output = []
    for (var i = 0; i < times; i++) output.push(each)
    return output
  }
}
