var line = []
for (i = 0; i < 48 + 36; i++) {
  line[i] = []
}

function initLine () {
  var latitude = []
  var longtitude = []

  for (var i = 0; i < 48; i++) latitude[i] = []
  for (var i = 0; i < 36; i++) longtitude[i] = []

  for (var j = 0; j < 48; j++) {
    if (j % 2 !== 0) continue
    for (var i = 0; i <= 36; i++) {
      if (i < 2 || i > 34) continue
      if (j % 4 === 2) if (i < 4 || i > 32) continue
      var ij = 36 * j + i
      latitude[j].push(ij)
    }
    for (var i = 0; i <= 36; i++) {
      if (i < 2 || i > 34) continue
      if (j % 4 === 2) if (i < 4 || i > 32) continue
      var ij = 36 * j + i
      line[j][ij] = new Line(
        ij,
        lineNbh(i - (latitude[j][0] % 36), latitude[j], false)
      )
    }
  }
  for (var i = 0; i <= 36; i++) {
    if (i < 2 || i > 34) continue
    if (i % 2 !== 0) continue
    for (var j = 0; j < 48; j++) {
      var ij = 36 * j + i
      longtitude[i].push(ij)
    }
    for (var j = 0; j < 48; j++) {
      var ij = 36 * j + i
      line[48 + i][ij] = new Line(ij, lineNbh(j, longtitude[i], true))
    }
  }
}

function lineNbh (pointer, lineSet, loop) {
  var nbh = []
  var next = (pointer + 1) % lineSet.length
  var prev = (pointer + lineSet.length - 1) % lineSet.length

  if (loop) {
    nbh.push(lineSet[next])
    nbh.push(lineSet[prev])
  } else {
    if (pointer === 0) nbh.push(lineSet[next])
    else if (pointer === lineSet.length - 1) nbh.push(lineSet[prev])
    else {
      nbh.push(lineSet[next])
      nbh.push(lineSet[prev])
    }
  }

  return nbh
}
