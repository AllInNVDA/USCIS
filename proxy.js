var fs = require("fs");


module.exports = function(){
	var ips = [];
	return{
		load : function(){
			var s = fs.readFileSync("ips.txt",{encoding:"utf8"});
			var m = s.match(/\d+\.\d+\.\d+\.\d+\t\d+/g);
			m.forEach(function(r){
				ips.push({
					ip:r.split('\t')[0],
					port:r.split('\t')[1],
					uses:0,
					successes:0
				});
			});
			return ips;
		}
	}
}