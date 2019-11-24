bcf = open("bitcoindata.html", "r")
bcs = bcf.read()
bcf.close()

class BTCDay:
	def __init__(self, d_day, d_open, d_high, d_low, d_close, d_volume, d_mc):
		self.day = d_day
		self.open = float(d_open)
		self.high = float(d_high)
		self.low = float(d_low)
		self.close = float(d_close)

#<Date, Open, High, Low, Close, Volume, Market Cap>

bcsf = ""
for line in bcs.split("\n"):
	if line.startswith("<td>"):
		bcsf += line[4:-5] + "\n"

bcsfl = bcsf.split("\n")
btcdl = []
for i in range(0, len(bcsfl)-1, 6):
	btcdl.append(BTCDay(i, bcsfl[i+0], bcsfl[i+1], bcsfl[i+2], bcsfl[i+3], bcsfl[i+4], bcsfl[i+5]))

for thing in btcdl:
	print(thing.high)