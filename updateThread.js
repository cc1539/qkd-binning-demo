
onmessage = (e)=>{
	console.log(e.data);
	JSON.parse(e.data)();
};
