const express = require('express');
const app = express();

var session      = require('express-session');
var cookieParser = require('cookie-parser');
var compression = require('compression');
var _ = require("underscore");

const mainRoutes = require('./backend/mainRoutes');
var User = require('./backend/models.js')
var Chat = require('./backend/chatModel.js')
var http = require('http');
// We need this to build our post string
var querystring = require('querystring');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('port', process.env.PORT || 3000);
app.use(express.static('client'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/client/views');
app.use('/pdf', express.static(__dirname + '/pdf'));
const logger = require('morgan');
app.use(logger('dev'));
app.use(compression());
app.use(cookieParser());

app.use(session({ 
key:'user_sid',
secret: 'random',
resave:false,
saveUninitialized:false,
cookie:{
    expires:600000
} 

}));



// required for cookie session


app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var request = require('request-promise');


var server = require('http').createServer(app);
var io = require('socket.io')(server);

// user to socket.id
var userToSocket= {}
var socketToUser= {}

function chatBackup(postData){
	var options = {
			hostname: 'localhost',
			port: 4000,
			path: '/userconvo',
			method: 'POST',
			headers: {
	        	'Content-Type': 'application/json',
	        	'Content-Length': Buffer.byteLength(JSON.stringify(postData))
	    	}
		};
		console.log(postData);
		var id = postData.user_id
		var req = http.request(options, (res) => {
			res.setEncoding('utf8');
			console.log(`statusCode: ${res.statusCode}`)
	    	res.on('data', (chunk) => {
	    		console.log(chunk)
	    		try {
		        	var data = JSON.parse(chunk);
		        	// console.log(data['message']);    			
       				// store data for chat
       				console.log(data)

       				if(data.status == '200'){
						Chat.create({
							cid:id,
							problem:data.problem,
							chat: JSON.stringify({'chat':data.chat}),
							result: JSON.stringify({'result':data.result}),
							uid:data.uuid,
							name:data.uname
						})
					}else{
						console.log("can't add to chat")
					}

		        }catch ( e ) {
		        	console.log(e)
		        	// socket.emit('bot reply', {message:['server error'],mode:mode,status:'510'})
		        }

	    	});
	    	res.on('end', () => {
	        	console.log('No more data in response.');
	    	});
		});

		req.on('error', (e) => {
	    	console.error(`Problem occured with request: ${e.message}`);
		});

		req.write(JSON.stringify(postData));
		req.end(JSON.stringify(postData));
}

io.on('connection', function(socket){
	console.log("socket connected "+socket.id);

	socket.on('disconnect', function(e){
		console.log(e)
		console.log("socket disconnected : "+socket.id);
		var postData = {
			user_id: socket.id,
			message: 1,
			mode: 5,
		};
		
		chatBackup(postData);

	})

	socket.on('chat message', function(data){
		console.log(socket.id+" :: ");
		console.log(data);
		var mode = data.mode

		var postData;
		if(mode == -1){
			postData = {
				user_id: socket.id,
				message: 0,
				mode: 5,
			};
			chatBackup(postData);
		}


		postData = JSON.stringify({
			user_id: socket.id,
			message: data.message,
			mode: data.mode
		});
		console.log(postData);
		var options = {
			hostname: 'localhost',
			port: 4000,
			path: '/userconvo',
			method: 'POST',
			headers: {
	        	'Content-Type': 'application/json',
	        	'Content-Length': Buffer.byteLength(postData)
	    	}
		};

		var req = http.request(options, (res) => {
			res.setEncoding('utf8');
			console.log(`statusCode: ${res.statusCode}`)
	    	res.on('data', (chunk) => {
	    		console.log(chunk)
	    		try {
		        	var data = JSON.parse(chunk);
		        	// console.log(data['message']);
		        	socket.emit('bot reply', {message: data['message'],mode:mode,status:data['status']});	    			
		        }catch ( e ) {
		        	console.log(e)
		        	// socket.emit('bot reply', {message:['server error'],mode:mode,status:'510'})
		        }

	    	});
	    	res.on('end', () => {
	        	console.log('No more data in response.');
	    	});
		});

		req.on('error', (e) => {
	    	console.error(`Problem occured with request: ${e.message}`);
		});

		req.write(postData);
		req.end(postData);

	});


});

app.use('/', mainRoutes);

// var server = require('http').Server(app)
server.listen(app.get('port'), () => console.log('Application listening on port '+ app.get('port')));
