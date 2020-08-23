
let graphUpdateInterval;

let bins;
let rateGraphs;
let randGraphs;

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

function updateGraphs(bins,rateGraphs,randGraphs) {
	
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

function updateGraphLoop() {
	clearInterval(graphUpdateInterval);
	updateGraphs(bins,rateGraphs,randGraphs);
	postMessage({
		bins:JSON.stringify(bins),
		rateGraphs:JSON.stringify(rateGraphs),
		randGraphs:JSON.stringify(randGraphs)});
	graphUpdateInterval = setInterval(updateGraphLoop,10);
}

onmessage = (e)=>{
	bins = JSON.parse(e.bins);
	rateGraphs = JSON.parse(e.rateGraphs);
	randGraphs = JSON.parse(e.randGraphs);
	graphUpdateInterval = setInterval(updateGraphLoop,10)
};
