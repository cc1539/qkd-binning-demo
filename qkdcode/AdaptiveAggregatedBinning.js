
class AdaptiveAggregatedBinning extends SimpleBinning {
	
	constructor() {
		this.publicChannel = new BitStream();
	}
	
	getPublicChannel() {
		return this.publicChannel;
	}
	
	handleOutput() {
		
		if(length()>=n) {
			boolean[] frame = toArray(n);
			int l = 0;
			for(int i=0;i<frame.length;i++) {
				if(frame[i]) {
					l++;
				}
			}
			if(l>n/2) {
				l = n-l;
			}
			if(l>0) {
				k = log2ceil(l);
				int index = 0;
				for(int i=n/k;i>1;i>>>=1) {
					boolean outBit = Math.random()>.5;
					output.write(outBit);
					analysis.write(outBit);
					if(outBit) {
						index += 1;
					}
					index <<= 1;
					bitsOut++;
				}
				//publicChannel.write(index);
			}
		}
		
	}
	
	getName() {
		return "aab";
	}
	
}