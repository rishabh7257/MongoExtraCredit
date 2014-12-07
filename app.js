var crypto = require('crypto');
var fs = require('fs');
var express = require('express');
var Client = require('node-rest-client').Client;
console.log("hi");
var app = express();
app.use(express.bodyParser());
var http = require('http')
var path = require('path')

//test block 1
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('ip_address', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var os = require("os");
var hostname = os.hostname;

var os = require("os");
var hostname = os.hostname;

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var secretkey = "RishabhSanghvikey";

var get_hash = function(state,ts){

msg= state + "|" + ts + "|" + secretkey;
hmac = crypto.createHmac("sha256",secretkey);
hmac.setEncoding('base64');
hmac.write(msg);
hmac.end();
hash = hmac.read();
return hash;
}


var mongo = require('mongodb');


var Server = mongo.Server,
    Db = mongo.Db;
//    BSON = mongo.BSONPure;

var server = new Server('ds043180.mongolab.com',43180,{auto_reconnect: true});
db = new Db('mongodb', server);

db.open(function(err, db) {
	db.authenticate('rishabh', 'rishabh', function(err, success) {
		if(!err) {
			
	        console.log("Connected to 'gumballdb' database");
	       
	    }
    });
    
});

var page= function(req,res,state,ts){

	db.collection('mongoextra',function(err,collection){
					
		console.log("enteredhere");
		
		db.collection('mongoextra',
					function(err,collection){
					collection.find({serialNumber:1234}).toArray(function(err, results){
					console.log(results);

					var data = results[0];
					var rec_id = data.id;
					console.log("Fetched"+rec_id);
					var result= new Object();
					var hash=get_hash(state,ts);
					console.log(state);
					
					console.log(data);
                    count = data.countGumballs
                    console.log( "count = " + count ) ;
                    
                    var msg =   "\n\nRishabh Gumball, Inc.\n\nNodeJS-Version - 5"
                    			+ "\n\n" + "Implementing Security with hash function, stateless functionality and connecting the Mongo database "		+"\n"+"Model# " + 
                                data.modelNumber + "\n" +
                                "Serial# " + data.serialNumber + "\n" +
								"\n" + state + "\n"+ "Hash = "+hash+ "\n";
								
								
					result.msg = msg;
					result.ts = ts;
					result.hash = hash;
					result.state = state;
					
                    res.render('gumball',{
					state: result.state,
					ts: result.ts,
					hash: result.hash,
					message:result.msg
					});
					
					
				
				})
				});
	  			
	})
}
		
		
var order = function(req,res,state,ts){

	db.collection('mongoextra',function(err,collection){
					
		console.log("POST");
		
		db.collection('mongoextra',
					function(err,collection){
					collection.find({serialNumber:1234}).toArray(function(err, results){
					console.log(results);

					var data = results[0];
					var rec_id = data.id;
					console.log("Fetched"+rec_id);
					var result= new Object();
					hash=get_hash(state,ts);
					console.log(state);
					
					console.log(data);
                    count = data.countGumballs
                    console.log( "count_post = " + count ) ;
                    
                    			
                    if(count>0){
                		count--;
                		console.log("Before:"+count);
                		
                		console.log(rec_id);
                		collection.update({id : 1}, {$set : {countGumballs:count}},function(err,results){
                		
                			console.log("Count after gumball taken out 	="+count);
                			console.log("After:"+count);
                			page(req,res,state,ts);
                				}
                			);
                		}
                		else{
                		error(req,res,"no gumball left",ts);	
                			}						
					});
				});

	}
	)
};
	
var handle_post = function(req,res){
        
        console.log("Post:" + "Action: " + req.body.event + "State: " + req.body.state + "\n");
        console.log("HASH1"+req.body.hash);
        var hash1 = ""+req.body.hash;
        var state = "" + req.body.state ; 
        var action = "" + req.body.event ;
        var ts = parseInt(req.body.ts);
        var current = new Date().getTime();
        var difference= ((current-ts))/1000;
        hash2=get_hash(state,ts);
        console.log(hash1);
        console.log(hash2);
        if((difference > 120)||(hash1 != hash2)){
        	console.log("here is a problem!session expired")
        	//System.exit(0);        	
        	        }
        
        else if(action == "Insert Quarter" ){
        
        if( state == "no-coin" )
        page( req, res, "has-coin",ts ) ;
        else
        page( req, res, state,ts );
        }
        
        else if (action=="Turn Crank"){
        if(state == "has-coin"){
        hash = get_hash("no-coin",ts);	
        order(req, res,"no-coin",ts) ;
        }
        else
        page(req, res, state,ts);
        
        }
                    
        
    }
    
    var handle_get = function(req,res){
    console.log("GET");	
    var ts = new Date().getTime();
    state="no-coin";
    page(req,res,state,ts);
    
    }
    
        
app.post("*",handle_post);      
app.get("*",handle_get);
 
//console.log( "Server running on Port ..." + process.env.PORT ) ;

//app.listen( process.env.PORT );

app.listen(8090);
