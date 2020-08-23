
class AdaptiveFraming extends SimpleBinning {
	
	constructor() {
		this.publicChannel = new BitStream();
		this.bitQueue = 0;
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
				int m = n/l;
				int k = n%l;
				bitQueue += k*Math.log(m+1);
				bitQueue += (l-k)*Math.log(m);
				while(bitQueue>=1) {
					boolean outBit = Math.random()>.5;
					output.write(outBit);
					analysis.write(outBit);
					bitsOut++;
					bitQueue--;
				}
				//publicChannel.write(index);
			}
		}
		
	}
	
	getName() {
		return "af";
	}
	
}