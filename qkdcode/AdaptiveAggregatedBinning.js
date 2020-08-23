
class AdaptiveAggregatedBinning extends SimpleBinning {
	
	constructor() {
		super();
		this.publicChannel = new BitStream();
	}
	
	getPublicChannel() {
		return this.publicChannel;
	}
	
	handleOutput() {
		
		if(this.length()>=this.n) {
			let frame = this.toArray(this.n);
			let l = 0;
			for(let i=0;i<frame.length;i++) {
				if(frame[i]) {
					l++;
				}
			}
			if(l>this.n/2) {
				l = this.n-l;
			}
			if(l>0) {
				this.k = log2ceil(l);
				let index = 0;
				for(let i=this.n/this.k;i>1;i>>>=1) {
					let outBit = Math.random()>.5;
					this.output.write(outBit);
					this.analysis.write(outBit);
					if(outBit) {
						index += 1;
					}
					index <<= 1;
					this.bitsOut++;
				}
				//publicChannel.write(index);
			}
		}
		
	}
	
	getName() {
		return "aab";
	}
	
}