

/************** GRAPHICS **************/


function plot(data,x,y,w,h) {
	beginShape();
	for(let i=0;i<data.length;i++) {
		let u = x+i/(data.length-1)*w;
		let v = y-h*(Number.isNaN(data[i])?0:data[i]);
		vertex(u,v);
	}
	endShape();
}

// draw a grid with tickers and numbers
function grid(x, y, w, h,
		tileW, tileH,
		unitX, unitY) {
	
	stroke(64);
	for(let i=x;i<=x+w+1;i+=tileW) { line(i,y,i,y+h); }
	for(let i=y+h;i>=y-1;i-=tileH) { line(x,i,x+w,i); }
	
	stroke(255);
	fill(255);
	line(x,y,x,y+h);
	line(x,y+h,x+w,y+h);
	
	textAlign(CENTER,TOP);
	for(let i=0,u;(u=(x+i*tileW))<=(x+w+1);i++) {
		line(u,y+h,u,y+h+2);
		text(i==0?"0":(i*unitX).toFixed(2),u+1,y+h+2);
	}
	textAlign(RIGHT,CENTER);
	for(let i=0,v;(v=(y+h-i*tileH))>=y-1;i++) {
		line(x,v,x-2,v);
		text(i==0?"0":(i*unitY).toFixed(2),x-4,v-2);
	}
	
}

function labels(x, y, w, h, main, axisX, axisY) {
	fill(255);
	textAlign(CENTER,BOTTOM);
	push();
	translate(x,y+h/2);
	rotate(-HALF_PI);
	text(axisY,0,-32);
	pop();
	textAlign(CENTER,TOP);
	text(axisX,x+w/2,y+h+20);
	textAlign(CENTER,BOTTOM);
	text(main,x+w/2,y-8);
}


/************** MORE MATH **************/


function log2ceil(n) { // smallest integer m such that 2m >= n
	for(let m=1;;m*=2) {
		if(m>=n) {
			return m;
		}
	}
}

function fact(n) { // factorial
	return 0; // todo
}

function perm(n) { // permutations
	return 0; // todo
}

function comb(n) { // combinations
	return 0; // todo
}

function entropy(p, base) {
	if(base==null) {
		p = [p,1-p];
		base = 2;
	}
	let sum = 0;
	for(let i=0;i<p.length;i++) {
		sum += p[i]==0?0:(p[i]*Math.log(p[i]));
	}
	return -sum/Math.log(base);
}


/************** MAIN / USER INTERFACE **************/


let graphSamples = 1000;

let binTypes = [
	SimpleBinning.prototype,
	//AdaptiveBinning.prototype,
	//AdaptiveAggregatedBinning.prototype,
	//AdaptiveFraming.prototype,
	SimpleBinning.prototype,
	SimpleBinning.prototype,
	SimpleBinning.prototype,
];

let bins = Array(binTypes.length).fill(0).map((x,i)=>Array(graphSamples).fill(0).map(y=>new binTypes[i].constructor()))

let rateGraphs = Array(binTypes.length).fill(0).map(x=>Array(graphSamples).fill(0));
let randGraphs = Array(binTypes.length).fill(0).map(x=>Array(graphSamples).fill(0));

let palette;

let labelText = Array(binTypes.length);

let graphScaleX = 1;
let graphScaleY = 1;

let notif;
let notifTimer;

function updateGraphs() {
	
	for(let i=0;i<bins.length;i++) {
		for(let j=0;j<bins[0].length;j++) {
			
			let p = j/(bins[0].length-1);
			
			for(let k=0;k<2048;k++) {
				bins[i][j].write(Math.random()<p);
			}
			
			// empty the output
			while(bins[i][j].getOutput().ready()) {
				bins[i][j].getOutput().read();
			}
			
			let h = (keyPressed&&keyCode==CONTROL)?1:entropy(p);
			rateGraphs[i][j] = h==0?0:(bins[i][j].getRawKeyRate()/h);
			randGraphs[i][j] = bins[i][j].getAnalysis().getRandomness();
		}
	}
	
}

function reset() {
	for(let i=0;i<bins.length;i++) {
	for(let j=0;j<bins[0].length;j++) {
		bins[i][j].clear();
	}
	}
}

function notify(text) {
	notif = text;
	notifTimer = 512;
}

function setup() {
	createCanvas(840,640);
	let canvas = document.getElementById("defaultCanvas0");
	document.getElementById("canvas-holder").appendChild(canvas);
	
	//textFont(createFont("source code pro bold",12));
	
	for(let i=0;i<binTypes.length;i++) {
	for(let j=0;j<graphSamples;j++) {
		bins[i][j].deadTime = 0;
		bins[i][j].setFrameSize(8);
		//bins[i][j].setBinSize(1<<i);
		bins[i][j].setBinSize(1);
		bins[i][j].getAnalysis().setLetterSize(3);
		//bins[i][j].getAnalysis().setLetterSize(6-i);
	}
	}
	
	updateGraphs();
	
	for(let i=0;i<labelText.length;i++) {
		labelText[i] = bins[i][0].getName();
	}
	
	palette = [
		color(255,0,0),
		color(0,0,255),
		color(255,255,0),
		color(255,0,255),
	];
	
}

function keyPressed() {
	switch(key) {
		case 'r': {
			reset();
			notify("Data reset");
		} break;
		case 'c': {
			saveFrame("####.png");
			notify("Snapshot taken");
		} break;
		case 'n': {
			
		} break;
	}
}

function draw() {
	
	if(keyPressed) {
		switch(key) {
			case 's': {
				notify("Scaling mode");
				if(mousePressed) {
					if(mouseButton==LEFT) {
						graphScaleY *= exp(-(mouseY-pmouseY)*.01);
					} else if(mouseButton==RIGHT) {
						graphScaleY = 1;
					}
				}
			} break;
		}
	}
	
	background(0);
	
	if(notifTimer>0) {
		fill(min(255,notifTimer));
		notifTimer -= 4;
		textAlign(LEFT,TOP);
		text(notif,6,6);
	}
	
	let border = 100;
	
	let x = border;
	let y = border;
	let w = width-border*2;
	let h = height-border*2;
	grid(x,y,w,h,w*.1*graphScaleX,h*.1*graphScaleY,.1,.1);
	labels(x,y,w,h,"n=64","Probability (p)",
		(keyPressed&&keyCode==SHIFT)?"Randomness (H(X)h(p))":
		(keyPressed&&keyCode==CONTROL)?"Raw Key Rate (r)":
		"Photon Utilization (r/h(p))");
	for(let i=0;i<rateGraphs.length;i++) {
		noFill();
		stroke(palette[i]);
		plot((keyPressed&&keyCode==SHIFT)?randGraphs[i]:rateGraphs[i],
				border+1,h+border-1,w*graphScaleX-2,h*graphScaleY-2);
	}
	
	//surface.setTitle("FPS: "+frameRate);
	document.title = "QKD Binning Demo | FPS: "+frameRate().toFixed(1);
}
