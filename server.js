/*
* Main entry point for the boilerplate
*/

// Port
var appPort = (process.env.PORT || 5001);

// Dependencies
var express = require('express'),
	routes = require('./routes'),
	socket = require('./routes/socket.js')
	app = express(),
	fs = require('fs'),
	http = require('http'),
	session = require('express-session'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	expressSession = require('express-session'),
	bodyParser = require('body-parser'),
	server = http.createServer(app),
	GitHubApi = require("github"),
	myModels = require('./node_models/myModel.js'),
	io = require('socket.io').listen(server);

// Set up app
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {
	layout: false
});
app.use(methodOverride());
app.use(bodyParser());
app.use(cookieParser());
app.use(expressSession({
	secret: 'codereviewsession'
}));
app.use(express.static(__dirname + '/public'));


//github api
var github = new GitHubApi({
    	// required
    	version: "3.0.0",
    	// optional
    	debug: true,
    	protocol: "https",
    	host: "api.github.com", // should be api.github.com for GitHub
    	pathPrefix: "", // for some GHEs; none for GitHub
    	timeout: 5000,
    	headers: {
        	"user-agent": "My-Cool-GitHub-App" // GitHub is happy with a unique user agent
    	}
	});
github.authenticate({
    type: "basic",
    username: "code-review-tool",
    password: "codereviewtool1"
});

// Routes
app.get('/', routes.index);
app.get('/partials/:name/', routes.partials);
//app.get('*', routes.index);
app.get('/git/get_all_repos', function(req, res){
	//var GitHubApi = require("github");
	github.repos.getAll({
	    // headers: {
	    //     "cookie": "blahblah"
	    // },
    	//user: "code-review-tool"
	}, function(err, res) {
    	console.log(JSON.stringify(res));
	});
});

app.get('/git/pullrequests/getcomments', function(req, res){
	//var GitHubApi = require("github");
	github.pullRequests.getComments({
	    // headers: {
	    //     "cookie": "blahblah"
	    // },
    	//user: "code-review-tool"
			user: "alexmoldovan",
			repo: "SimpleJavaJerseyServer",
			number: "1"
	}, function(err, res) {
    	console.log(JSON.stringify(res));
	});
});

// Configure socket.io route
io.set('log level', 1); // Remove debug messages from socket.io
io.sockets.on('connection', socket);
io.sockets.on('disconnect', function () { console.log("Disconnect!!!");})

// Start listening on default webserver port or 5000
server.listen(appPort)
console.log("Server started on port " + appPort);
