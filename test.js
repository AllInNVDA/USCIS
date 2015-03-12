var task = require("./task"),
	proxy = require("./proxy"),
	fs = require("fs"),
	batch_size=10;


var ips = proxy().load();
var current_id=91290340000 ;
var from=1290418149,to=1290424647,center="LIN";
var fails = [];

function get_message(str){
	var i_start = str.indexOf('<div class="rows text-center">') ;
	var i_end = str.indexOf('</div>',i_start)+6 ;
 	return str.slice(i_start,i_end);
}
function scan(id,ip,cb){
	ip.uses ++ ;
	var t = task(ip,"https://egov.uscis.gov/casestatus/mycasestatus.do?appReceiptNum="+center+id);		
	t.run(function(err,resp){		
		if(resp){					
			// if(resp.status===200){
			ip.successes+=1 ;
			return cb(null,{
				id:id,
				message:get_message(resp.body)
			});				
			// }
		}		
		return cb(err||"error",id);
	});		
}

function select_id(){
	console.log(fails);	
	
	var id = fails.shift();
	if(id) return id;
	if(current_id>from)
		return --current_id;	
	return null;
}

function select_ip(){
	if(Math.random()< 0.05){
		ips.sort(function(a,b){
			return a.uses/(a.successes+1) - b.uses/(b.successes+1) ;
		});		
		// console.log(ips.slice(0,10));
	}
		
	var p = Math.random()*Math.random()*ips.length | 0;
	return ips[p];
}
function scan_next(id,ip,cb){
	scan(id,ip,function(err,data){
		cb(err,data);
		var next_id = select_id();
		if(next_id)
			scan_next(next_id,select_ip(),cb);
	})
}
function batch_scan(cb){
	for(var i=0 ; i<batch_size ; i++){		
		current_id = to-i;
		scan(to-i,select_ip(),function(err,data){
			cb(err,data);
			scan_next(select_id(),select_ip(),cb);
		});
	}
		
}
function parse_case(data){
	var form = data.match(/I\-\d+/i);
	if(form) form=form[0];
	var b = data.indexOf("<h1>") + 4;
	var e = data.indexOf("</h1>") ;
	var status = data.substring(b,e);
	return {		
		form:form,
		status:status
	}
}

try{
	fs.unlinkSync("out.txt")
	fs.unlinkSync("cases.txt")	
}catch(e){

}

batch_scan(function(err,data){
	if(err) {
		fails.push(data.id || data);
		// console.log(data);
	}
	else{
		var ca = parse_case(data.message);
		if(!ca.status||ca.status.length===0)
			return fails.push(data.id || data);
		fs.appendFile("out.txt",data.id+"\n"+data.message+"\n============================\n",function(err){
			if(err) console.log(err);
		});
		
		fs.appendFile("cases.txt",data.id+","+ca.form+","+ca.status+"\n",function(err){
			if(err) console.log(err);
		});
	}		
});