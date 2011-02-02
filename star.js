var star = [];

function Star(name, ra, dec) {
	this.name = name;
	this.ra = ra;
	this.dec = dec;

// ======= calculation section ==========
	this.rRA = this.ra*Math.PI/12
	this.rDec = this.dec*Math.PI/180
	this.cartesian = [Math.sin(this.rRA)*Math.cos(this.rDec), Math.cos(this.rRA)*Math.cos(this.rDec), Math.sin(this.rDec)]
// ======= information section ==========
	this.getName = function() {
		return this.name;
	}
	this.getRA = function() {
		return this.ra;
	}
	this.getDec = function() {
		return this.dec;
	}
}

function initStar() {
// ======================= Orion ============================
	star[0] = new Star("Betelgeuse", 5.919525, 7.407027777777775);
	star[1] = new Star("Rigel", 5.242297777777778, -8.364166666666666);
	star[2] = new Star("Bellatrix", 5.4188527777777775, 6.349722222222222);
	star[3] = new Star("Mintaka", 5.533444444444444, -0.299166666666664);
	star[4] = new Star("Alnilam", 5.603555555555555, -1.201916666666667);
	star[5] = new Star("Anitak", 5.679305555555556, -1.942777777777777);
	star[6] = new Star("Saiph", 5.795944444444444, -9.669722222222223);
	star[7] = new Star("Meissa", 5.585633333333333, 9.934155555555556);
// ===================== Usar Minor =========================
	star[8] = new Star("Polaris", 2.5297444444444444, 89.26413888888889);
	star[9] = new Star("Kochab", 14.845111111111111, 74.15547222222222);
	star[10] = new Star("Pherkad", 15.345486111111111, 71.83397222222223);
	star[11] = new Star("Yildun", 17.536916666666666, 86.58633333333333);
	star[12] = new Star("Urodelus", 16.766155555555557, 82.03725);
	star[13] = new Star("Alifa al Farkadain", 15.734294444444444, 77.7945);
	star[14] = new Star("Anwar al Farkadain", 16.291805555555555, 75,75469444444444);
// ==================== Draw Poor Line ========================
	for(j = 0; j <= 47 ;j++) {
		for(i = 0; i <= 36; i++) {
			k = 36*j + i + 1 + 14; // last parameter for last star index
			lnSymb = "|";
			if(i == 18) lnSymb = "-+-"; // higlight celestial equator
			star[k] = new Star(lnSymb, j/2, -90 + 5*i);
		}
	}
}