from constal import *
from fconstal import *
from pname import *
from greek import *
cname_to_num = {"And" : 0,"Ant" : 1,"Aps" : 2,"Aqr" : 3,"Aql" : 4,"Ara" : 5,"Ari" : 6,"Aur" : 7,"Boo" : 8,"Cae" : 9,"Cam" : 10,"Cnc" : 11,"CVn" : 12,"CMa" : 13,"CMi" : 14,"Cap" : 15,"Car" : 16,"Cas" : 17,"Cen" : 18,"Cep" : 19,"Cet" : 20,"Cha" : 21,"Cir" : 22,"Col" : 23,"Com" : 24,"CrA" : 25,"CrB" : 26,"Crv" : 27,"Crt" : 28,"Cru" : 29,"Cyg" : 30,"Del" : 31,"Dor" : 32,"Dra" : 33,"Equ" : 34,"Eri" : 35,"For" : 36,"Gem" : 37,"Gru" : 38,"Her" : 39,"Hor" : 40,"Hya" : 41,"Hyi" : 42,"Ind" : 43,"Lac" : 44,"Leo" : 45,"LMi" : 46,"Lep" : 47,"Lib" : 48,"Lup" : 49,"Lyn" : 50,"Lyr" : 51,"Men" : 52,"Mic" : 53,"Mon" : 54,"Mus" : 55,"Nor" : 56,"Oct" : 57,"Oph" : 58,"Ori" : 59,"Pav" : 60,"Peg" : 61,"Per" : 62,"Phe" : 63,"Pic" : 64,"Psc" : 65,"PsA" : 66,"Pup" : 67,"Pyx" : 68,"Ret" : 69,"Sge" : 70,"Sgr" : 71,"Sco" : 72,"Scl" : 73,"Sct" : 74,"Ser" : 75,"Sex" : 76,"Tau" : 77,"Tel" : 78,"Tri" : 79,"TrA" : 80,"Tuc" : 81,"UMa" : 82,"UMi" : 83,"Vel" : 84,"Vir" : 85,"Vol" : 86,"Vul" : 87}

def catalog():
	catalog = open("catalog")
	mycat = open("../stars.js", 'w')

	count = 0 # dbo
	db_cl = ""
	mycat.write("var star = [];\n\nfunction initStar() {\n")
	for i in range(9110):
		id = catalog.read(4)
		fm_name = catalog.read(3)
		by_name = catalog.read(3)
		by_indx = catalog.read(1)
		constel = catalog.read(3)
		catalog.read(61)
		ra_hour = catalog.read(2)
		if ra_hour == "  ":
			catalog.readline()
			continue
		ra_min = catalog.read(2)
		ra_sec = catalog.read(4)
		ra = to_decimal(int(ra_hour), int(ra_min), float(ra_sec))

		dec_sgn = catalog.read(1)
		dec_deg = catalog.read(2)
		dec_amin = catalog.read(2)
		dec_asec = catalog.read(2)
		dec = to_decimal(int(dec_deg), int(dec_amin), float(dec_asec))
		catalog.read(12)

		v_mag = catalog.read(5)
		catalog.read(2)
		co_bv = catalog.read(5)
		catalog.read(1)
		co_ub = catalog.read(5)
		catalog.read(1)
		co_ri = catalog.read(5)
		catalog.read(3)
		sp_type = catalog.read(1)
		colour = to_colour(sp_type)
		
		if colour == "#00ff00":
			db_cl += str(id) + " " +sp_type
		
		catalog.readline()

#		print(id + name + str(ra) + dec_sgn + str(dec) + v_mag)
#		name = str(id) # iden star for constellation lining propose
#		name = star_sym(float(v_mag)) # just for fun
#		mycat.write("new Star(\"" + name + "\", ")
		mycat.write("\tstar[" + id + "] = ")
		
		name = to_name(id, fm_name, by_name, by_indx, constel)
		prop_name = to_proper_name(id, fm_name, by_name, by_indx, constel)
		
		mycat.write("new Star(\"" + name + "\", ")
		mycat.write("\"" + prop_name + "\", ")
		
		mycat.write(str(ra) + ", " + dec_sgn + str(dec) +", ")
		mycat.write(v_mag + ", ")
		mycat.write("\"" + colour + "\")")
		mycat.write(";\n")
	mycat.write("}")
	mycat.close()
#	print(db_cl)
#	print(count)
#	print(pname)

def constal():
	count = [0 for i in range(88)]

#	mycat = open("../constal.js", 'w') ## enable this to use

	mycat.write("var constal = [];\nfor(i = 0; i < 88; i++) {\n\tconstal[i] = [];\n}\n\n")
	mycat.write("function initConstal() {\n")
	txt = ""
	for i in range(len(con)):
		for j in range(len(con[i])):
			txt += "\tconstal[" + str(i) + "][" + str(j) +"] = new Line("
			txt += str(con[i][j]) + ", ["
			#for k in range(len(con[i])):
			#	if j == k:
			#		continue
			#	txt += str(k) +", "
			txt += "]);\n"
			mycat.write(txt)
			txt = ""

	mycat.write("}")
	mycat.close()

def line():
#	mycat = open("../lll.js", 'w') ## enable this to use

	mycat.write("var line = [];\nline[0] = [];\n\n")
	mycat.write("function initLine() {\n")
	longitude = 48
	latitude = 36
	for j in range(longitude):
		for i in range(latitude+1):
			if i < 2 or i > 34:
				continue
			k = 36*j + i
			txt = "\tline[0][" + str(k) + "] = new Line(" + str(k) + ", ["

			if (i == 33 or i == 31 or i == 3 or i == 5) and (j%2 == 1):
				continue
			if (i == 31 or i == 3) and (j%4 == 2):
				continue

			if j%4 == 0:
				if i != 34:
					txt += str(k+1) + ", "
				if i != 2:
					txt += str(k-1) + ", "
			elif j%4 == 2 and (i > 4 and i < 32):
				if i != 32:
					txt += str(k+1) + ", "
				if i != 4:
					txt += str(k-1) + ", "
			elif (j%4 == 1 or j%4 == 3) and (i > 6 and i < 30):
				if i != 30:
					txt += str(k+1) + ", "
				if i != 6:
					txt += str(k-1) + ", "

			if i != 33 and i != 31 and i != 3 and i != 5:
				if j == 0:
					txt += str(k+36) + ", " + str(k+(longitude*latitude)-36)
				elif j ==47:
					txt += str(k+36-(longitude*latitude)) + ", " + str(k-36)
				else:
					txt += str(k+36) + ", " + str(k-36)



			txt += "]);\n"
			mycat.write(txt)
	mycat.write("}")
	mycat.close()

def pname_out():
	name = open("pname.txt")
	outfile = open("test", 'w')

	text = ""
	for i in range(371):
		t = name.read(2)
		while(t != "\""):
			text += t
			t = name.read(1)
		t1 = text + "\""
		text = ""

		t = name.read(3)
		t = name.read(2)
		while(t != "\n"):
			text += t
			t = name.read(1)
		t2 = text + "\""
		text = ""

		outfile.write(t2 + " : " + t1 + ",\n")

def dup():
	name = open("pname.py")
#	outfile = open("test", 'w')
	nodup = []
	count = 0

	name.readline()
	for i in range(325):
		name.read(2)

		text = name.read(7)
		if(text not in nodup):
			nodup.append(text)
		else:
			count += 1
			print(text)
		name.readline()
	print(count)

def cdic():
	name = open("con_dict.txt")
	outfile = open("test", 'w')

	text = ""
	for i in range(88):
		t = name.read(2)
		while(t != " "):
			text += t
			t = name.read(1)
		print(text)
		t1 = text
		
		text = ""
		name.read(2)
		t = name.read(2)
		while(t != ","):
			text += t
			t = name.read(1)
		t2 = text

		text = ""
		outfile.write(t2 + " : " + t1 + ",\n")
		
		name.readline()

def to_decimal(a, b, c):
	c /= 60
	b += c
	b /= 60
	a += b
	return a
def star_sym(mag):
	if mag < 1:
		return chr(79)
	elif mag < 2:
		return chr(43)
	elif mag < 4:
		return chr(42)
	else:
		return chr(46)
def to_colour(type):
	if type == 'O':
		return "#9bb0ff"
	elif type == 'B':
		return "#aabfff"
	elif type == 'A':
		return "#cad7ff"
	elif type == 'F':
		return "#f8f7ff"
	elif type == 'G':
		return "#fff4ea"
	elif type == 'K':
		return "#ffd2a1"
	elif type == 'M':
		return "#ffcc6f"
	elif type == 'W':
		return "#9bb0ff"
	elif type == 'p':
		return "#9bb0ff"
	elif type == 'S':
		return "#ffaa6f"
	elif type == 'C':
		return "#ff9090"
	elif type == 'N':
		return "#ff9090"
	else:
		return "#00ff00"
def to_proper_name(id, fm_name, by_name, by_indx, constel):
	name = ""
	if(by_name + by_indx + constel in pname):
		name = pname[by_name + by_indx + constel]
	elif(fm_name + "    " + constel in pname):
		name = pname[fm_name + "    " + constel]
	elif("HR" + id in pname):
		name = pname["HR" + id]
	return name
def to_name(id, fm_name, by_name, by_indx, constel):
	name = ""
	if(by_name in greek_unicode):
		name = greek_unicode[by_name]
		if(by_indx != " "):
			name += sup_num(by_indx)
	elif(fm_name != "   "):
		name = fm_name
	else:
		name = "HR " + str(int(id))
	return name
def sup_num(num):
	if(num == "1"):
		return "\\u00b9"
	elif(num == "2"):
		return "\\u00b2"
	elif(num == "3"):
		return "\\u00b3"
	else:
		return "\\u207" + num
