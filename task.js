var http = require('http');

module.exports = function(proxy,url){	
	return {
		run: function(cb){
			var options = {
			  host: proxy.ip,
			  port: proxy.port,
			  path: url			  
			};			
			var body = '';			
			
			var req = http.get(options, function(res) {			  
				status = res.statusCode ;
				if(res.statusCode!=200) return cb(res.statusCode)
				res.on("data", function(chunk) {
					body += chunk;					
				}).on('end', function() {					
					cb(null,{status:res.statusCode,body:body});
				});
			}).on('error', function(e) {
			  	cb(e);
			});
			
		}
	}	
}

// var body = '';
//   res.on('data', function(chunk) {
//     body += chunk;
//   });
//   res.on('end', function() {
//     console.log(body);
//   });

// http.get(options, function(res) {
//   console.log("Got response: " + res.statusCode);

//   res.on("data", function(chunk) {
//     console.log("BODY: " + chunk);
//   });
// }).on('error', function(e) {
//   console.log("Got error: " + e.message);
// });

