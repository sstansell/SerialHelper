var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/serialHelper';
var collectionName = "stories"


function Stories() {

  var list = [];

	function update(story){
		var ObjectID = require('mongodb').ObjectID;
		var storyId = new ObjectID(story._id);

		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
			//console.log("Connected correctly to mongo server");
			var collection = db.collection(collectionName)
			   collection.updateOne(
			      { "_id" : storyId },
			      { $set: 	{ 
				      			"id":story.id, 
				      			"title":story.title, 
				      			"author": story.author,
				      			"description": story.description,
				      			"outputFolder": story.outputFolder,
				      			"url": story.url,
				      			"baseUrl": story.baseUrl,
				      			"titleSelector": story.titleSelector,
				      			"bodySelector": story.bodySelector,
				      			"nextLinkSelector": story.nextLinkSelector,
				      			"titleCleaner": story.titleCleaner,
				      			"bodyCleaner": story.bodyCleaner
			      			} 
			      },
			      function(err){
			      	console.log("updated")
			      	return(err);
			      	db.close();
			      }
			   );
			
		});	 
	}

  function getStoryList() {
  	//console.log("Getting story list");
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
    getStoryList: getStoryList,
    update: update
  }
}

var findDocuments = function(db, callback) {
	// Get the documents collection
	var collection = db.collection(collectionName);
	// Find some documents
	collection.find({}).sort( { author: 1, title: 1 }).toArray(function(err, docs) {
	//console.log(err)
	assert.equal(err, null);
	//console.log("Found the following records");
	//console.log(docs)
	callback(docs);
	});
} 

var updateDocument = function(db, document, callback){

}


module.exports = Stories