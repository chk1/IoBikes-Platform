/******************************************************************************
		Node Webserver for the "Internet of Bicycles"-Platform
*******************************************************************************
Table of Content

1. Basic Server Setup
2. Routes for API
*******************************************************************************/

/****************************
	1. Basic Server Setup
****************************/

// Load packages
var express = require('express');         // call express framework
var app = express();                      // define our app using express
var bodyParser = require('body-parser');  // important package for post method

// Database connection
var pg = require('pg'); // call PostgreSQL client (https://github.com/brianc/node-postgres)
// change username and password before starting the server 
var conString =  'postgres://username:password@localhost:5432/iob?ssl=true';
//process.env.DATABASE_URL ||
//var client = new pg.Client(conString);
//var Db   = require('./app/models/database');

// Public folder to upload media, etc. (not required yet)
app.set("view options", {layout: false});
app.use(express.static(__dirname + '/public'));

// Configure app to use bodyParser() - this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;      // set our port

/* Some stuff for later use
//var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('Hello, world! [helloworld sample; iisnode version is '
          + process.env.IISNODE_VERSION + ', node version is ' + process.version + ']');
}).listen(process.env.PORT);
*/

/****************************
	2. Routes for API
****************************/

var router = express.Router(); // get an instance of the express router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('There was an API request.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Yee-haw! Welcome to our IoB API!' });
});

// more routes for the API will follow...

/*
router.route('/messages')

    // get all the messages (accessed at GET http://localhost:8080/api/messages)
    .get(function(req, res) {
        Messages.find(function(err, messages) {
            if (err)
                res.send(err);

            res.json(messages);
        });
    });
*/

// GET all messages -  ORDER BY message_id ASC
router.get('/messages', function(req, res) {

    var results = [];

    // Grab data from http request
    var data = {text: req.body.text, complete: false};

    // Get a Postgres client from the connection pool
    pg.connect(conString, function(err, client, done) {

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM messages");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            client.end();
            return res.json(results);
        });

        // Handle Errors
        if(err) {
          console.log(err);
        }

    });
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
