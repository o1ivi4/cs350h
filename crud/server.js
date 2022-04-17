// followed tutorial at https://zellwk.com/blog/crud-express-mongodb/ 
// run at http://149.130.15.5:3000/
// cd into the 'crud' directory (the parent to server.js), then run 'npm run dev' in the terminal

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

        const db = client.db('og102');
        const quotesCollection = db.collection('quotes');

        var close = function () {
            client.close();
            console.log('after closing database');
        };

        app.set('view engine', 'ejs');
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(express.static('public'));

        app.get('/', (req, res) => {
            db.collection('quotes').find().toArray()
                .then(results => {
                    res.render('index.ejs', { quotes: results});
                })
                .catch(error => console.error(error));
        });

        app.get('/quotes', (req, res) => {
            // parse request url, pull out required info, create dynamic expression
            const query = new RegExp('.*'+req.query.quote+'.*');

            db.collection('quotes').find({quote: { $regex: query}}).toArray()
                .then(results => {
                    // res.render('index.ejs', { quotes: results})
                    console.log(results);
                    res.json(results);
                })
                .catch(error => console.error(error));
        });

        app.post('/quotes', (req, res) => {
            quotesCollection.insertOne(req.body)
                .then(result => {
                    res.redirect('/');
                })
                .catch(error => console.error(error));
        });

        app.put('/quotes', (req, res) => {
            quotesCollection.findOneAndUpdate(
                { id: req.body.id },
                {
                  $set: {
                    name: req.body.name,
                    quote: req.body.quote
                  }
                },
                {
                  upsert: true
                }
            )
            .then(result => res.json('success'))
            .catch(error => console.error(error));
        });
        
        app.delete('/quotes', (req, res) => {
            quotesCollection.deleteOne(
                { name: req.body.name }
            )
            .then(result => {
                if (result.deletedCount === 0) {
                    return res.json('No quotes to delete...');
                }
                res.json(`Deleted Scott's quote`);
            })
            .catch(error => console.error(error));
        });

        app.get('/quoteid/:id', (req, res) => {
            // parsing the url
            var id = new mongo.ObjectId(req.params.id);
            console.log("lookup by id", id);
            db.collection('quotes').find({"_id" : id}).toArray()
                .then(result => {
                    console.log(result);
                    res.render('quote.ejs', { quote: result[0]});
                })
                .catch(error => console.error(error));
        });

        app.post('/updatequote/:id', (req, res) => {
            var id = new mongo.ObjectId(req.params.id);
            console.log("updating quote id", req.params.id);
            quotesCollection.findOneAndUpdate(
                { id: req.body.id },
                {
                  $set: {
                    name: req.body.author,
                    quote: req.body.quote
                  }
                },
                {
                  upsert: true
                }
            )
            .then(result => {
                console.log(result['value']);
                res.render('quote.ejs', { quote: result['value']});})
            .catch(error => console.error(error));
        });

        app.listen(port, '149.130.15.5', () => {
            console.log(`listening on port ${port}`);
        });
    })
    .catch(error => console.error(error))