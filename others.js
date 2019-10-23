var skyline = []
var obsline = []
var compass = []
var label = []

// var line = [];
// for(i = 0; i < 88; i++) {
//  line[i] = [];
// }

function initOthersPlot () {
  // ============================== Draw Poor Sky Line ====================================
  for (j = 0; j < 48; j++) {
    for (i = 2; i <= 34; i++) {
      //          if(j%2 !== 0 && (i === 34 || i === 2)) continue
      //          if(j%2 !== 0 && (i === 32 || i === 4)) continue
      //          if(i === 33 || i === 3) continue
      k = 36 * j + i
      lnSymb = '' // remove this
      //          if(i === 18) lnSymb = "-- " + j/2 + " --"; // higlight celestial equator
      lnSymb = k // debug only
      skyline[k] = new Star(lnSymb, '', j / 2, 90 - 5 * i, -10, '#005500')
    }
  }
  // ===================== Draw Poor Observer Line ====================================
  /*  for(j = 0; j <= 47 ;j++) {
        for(i = 1; i <= 35; i++) {
        if(j%2 !== 0 && i === 1 || i === 2) continue
        k = 36*j + i;
        lnSymb = "^";
        obsline[k] = new Star(lnSymb, j/2, -90 + 5*i, -10, "#005500");
        }
        } */
  // ================================== compass ====================================
  compassName = ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW']
  compassFullName = ['South', 'Southeast', 'East', 'Northeast', 'North', 'Northwest', 'West', 'Southwest']
  for (i = 0; i < 8; i++) {
    compass[i] = new Star(compassName[i], compassFullName[i], 3 * i, 0.00000000001, -10, '#ffff00')
  }
  compass[8] = new Star('Z', 'Zenith', 0, 90, -10, '#ffff00')
}
