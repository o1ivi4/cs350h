// run at http://149.130.15.5:3000/
// cd into the 'people' directory (the parent to server.js), then run 'node server.js' in the terminal
// use ctrl+c to reset

"use strict";

const express = require('express');
const bodyParser = require('body-parser');
//const MongoClient = require('mongodb').MongoClient;
const mongo = require('mongodb');
const app = express();
const port = 3000;

// Connection URL
const url = 'mongodb://localhost:27017';

// Create a new mongo client
const client = new mongo.MongoClient(url, { useUnifiedTopology: true} );

client.connect()
    .then( clientStatus => {
        console.log("connected successfully to server");

        const dbo = client.db('wmdb');
        const movie = dbo.collection('movie');
        const people = dbo.collection('people');
        const staff = dbo.collection('staff');

        var close = function () {
            client.close();
            console.log('after closing database');
        };

        app.set('view engine', 'ejs');
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(express.static('public'));

        app.get('/', (req, res) => {
            movie.find().toArray()
                .then(results => {
                    res.render('index.ejs', { movies: results});
                })
                .catch(error => console.error(error));
        });

        app.get('/movies', (req, res) => {
            // parse request url, pull out required info, create dynamic expression
            const query = new RegExp(req.query.movie, "i");
            // sort returned docs in asc order a-z
            const filter = {sort: {title: 1}};

            // query is case-sensitive??
            movie.find({title: { $regex: query}}, filter).toArray()
                .then(results => {
                    res.json(results);
                })
                .catch(error => console.error(error));
        });

        app.get('/tt/:tt', (req, res) => {
            // parsing the url
            var tt = parseInt(req.params.tt);
            console.log("lookup by tt", tt);
            dbo.collection("movie").find({"tt": tt}).toArray(function(err, result) {
                if (err) throw err;
                console.log(result);
                res.render('movie.ejs', { movie: result[0]});
            });
        });

        app.listen(port, '149.130.15.5', () => {
            console.log(`listening on port ${port}`);
        });
    })
    .catch(error => console.error(error));