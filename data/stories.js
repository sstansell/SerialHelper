var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/serialHelper';



function Stories() {

  var list = [];

  function getStoryList() {
    console.log('walking...')
    list = []
  }


  return {
    getStoryList: getStoryList
  }
}

module.exports = Stories