var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var db;

// Initialize connection once
MongoClient.connect("mongodb://localhost:27017", function(err, client) {
  if(err) throw err;

  db = client.db("hstarter");
});

/**
* find data according to query from db
* @param {string} coll the name of the collection
* @param {object} query the query object passed to find
* @param {function} cb the callback after searching
*/
dbfind = function(coll, query, cb){
  db.collection(coll).find(query).toArray(cb);
}

/**
* insert data according to query to db
* @param {string} coll the name of the collection
* @param {object} query the query object passed to insert
* @param {function} cb the callback after inserting
*/
dbinsert = function(coll, query, cb){
  db.collection(coll).insert(query,cb);
}

module.exports = {
  dbfind,
  dbinsert
};
