// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var http = require('http');
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var server = http.createServer(app);

//Configure db
var sql = require('mssql');
var config = {
    user: 'krishnanmahadevan',
    password: 'Depaul123',
    server: 'krishnanmahadevan.database.windows.net', // You can use 'localhost\\instance' to connect to named instance 
    database: 'StockMarketDb',
    options: {
        encrypt: true // Use this if you're on Windows Azure 
    }
}

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({ "error": message });
}

// more routes for our API will happen here
router.route('/testing')
    .get(function (req, res) {
        sql.connect(config).then(function () {
            // Query 
            var request = new sql.Request();
            request.input('input_parameter', sql.Int, 445);
            request.query('select * from SalesLT.Address where AddressId = @input_parameter').then(function (recordset) {
                console.dir(recordset);
                res.status(200).json(recordset);
            }).catch(function (err) {
                handleError(res, err.message, "failed getting test records");
            });
        }).catch(function (err) {
            handleError(res, err.message, "failed database connection");
        });
    });

router.route('/login/:username/:password')
    .get(function (req, res) {
        sql.connect(config).then(function () {
            // Query 
            var request = new sql.Request();
            request.input('username', sql.NVarChar, req.params.username);
            request.input('password', sql.NVarChar, req.params.password);
            request.query('select EmailAddress from StockMarketUser where EmailAddress = @username and Password=@password').then(function (recordset) {
                res.status(200).json(recordset);
            }).catch(function (err) {
                handleError(res, err.message, "failed login user");
            });
        }).catch(function (err) {
            handleError(res, err.message, "failed database connection");
        });
    });

router.route('/user/add')
    .post(function (req, res) {
        sql.connect(config).then(function () {
            var data = req.body;

            var request = new sql.Request();
            request.input('userName', sql.NVarChar, data.userName);
            request.input('emailAddress', sql.NVarChar, data.emailAddress);
            request.input('password', sql.NVarChar, data.password);
            request.input('gender', sql.Bit, data.gender);
            request.execute('uspInsertUser').then(function (recordset) {
                if (recordset.returnValue == 0) {
                    res.status(200).json(data.emailAddress);
                }
                else {
                    res.status(200).json('');
                }
            }).catch(function (err) {
                handleError(res, err.message, "failed adding user");
            });
        }).catch(function (err) {
            handleError(res, err.message, "failed database connection");
        });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// START THE SERVER
// =============================================================================
//app.listen(port);
//console.log('Magic happens on port ' + port);
server.listen(port, function () { // fifth and final change
});