var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/serialHelper';



function Stories() {

  var list = [];

  function getStoryList() {
  	console.log("Getting story list");
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  //console.log("Connected correctly to mongo server");
	    findDocuments(db, function(docs) {
			for (var i = 0, len = docs.length; i < len; i++) {
			  list.push(docs[i]);
			  //console.log(docs[i].title);
			}      
			
			db.close();
	    });
	});	
    return list;
  }

  return {
    getStoryList: getStoryList
  }
}

var findDocuments = function(db, callback) {
	// Get the documents collection
	var collection = db.collection('stories');
	// Find some documents
	collection.find({}).toArray(function(err, docs) {
	//console.log(err)
	assert.equal(err, null);
	//console.log("Found the following records");
	//console.log(docs)
	callback(docs);
	});
} 


module.exports = Stories