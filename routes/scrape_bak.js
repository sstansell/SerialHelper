//REQUIRES
var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var osmosis = require('osmosis');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// CONFIG
var mongoUrl = 'mongodb://10.0.0.15:27017/books';  
var testUrls = [
	{
		name: 'Super Powereds (Year 4) - Prologue',
		url: 'http://www.drewhayesnovels.com/spy4/p1'
	}

]
var userAgents = [
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11) AppleWebKit/601.1.39 (KHTML, like Gecko) Version/9.0 Safari/601.1.39',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/600.3.10 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.10',
	'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
	'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0'
] 
var userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
var chapters = [];


//ROUTES
router.get('/', function(req, res, next){
	//url = "http://www.drewhayesnovels.com/spy3/21";
	var scrapeUrl = req.query.url;
	console.log("URL: " + scrapeUrl);
	console.log("User Agent: " + userAgent);

	var chapters = [];

    fetch(scrapeUrl, userAgent, function(html){
    	var $ = cheerio.load(html);
    	var chapter = { title : "", content : ""};
		chapter.title = $(".post h1 a").text();
		chapter.body = $(".body").html();
		
		var nextUrl = $("#nextLink").attr('href');
		var bHasNext = false;
		if(nextUrl.length>0){
			bHasNext = true;
		}
		nextUrl = "http://drewhayesnovels.com" + nextUrl;
		console.log(nextUrl  + " next");
		
		cleanParagraphs(chapter.body, function(body){
	    	chapter.body = body;
	    	chapters.push(chapter);
	    	if(bHasNext){
	    		//res.send("Getting Next: " + nextUrl);
	    		
	    	}else{
		    	res.render('scrape', 
		    		{
		    			url: scrapeUrl, 
		    			title: chapter.title, 
						chapters: chapters,
						testUrls: testUrls
		    		});	    		
	    	}

			
		})


    })
});


//FUNCTIONS
function cleanParagraphs(text, cb){
	var badSpaces = /&nbsp;/gi;
	var ret = text.replace(badSpaces, '');
	var funkySpaces = /&#xA0;/gi;
	ret = ret.replace(funkySpaces, '');
	cb(ret);
	return ret;
}

function crawl(url, userAgent, cb){

}


function fetch(url, userAgent, cb) {
	var options = {
	  url: url,
	  headers: {
	    'User-Agent': userAgent,
	    'accept': 'text/html,application/xhtml+xml'
	  }
	};
	function callback(error, response, body) {
	  if (!error && response.statusCode == 200) {
	    //console.log(body);
	    cb(body);
	  }
	}
	request(options, callback);


}

var insertDocument = function(db, doc, col, callback) {
  // Get the documents collection
  var collection = db.collection(col);
  // Insert some documents
  collection.insert(doc
  , function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    assert.equal(1, result.ops.length);
    console.log("Inserted document into " + col);
    callback(result);
  });
}


var getAsin = function(link){
/*
/Critical-Failures-Caverns-Creatures-Book-ebook/dp/B00FU38J00/ref=cm_cr_arp_d_product_top?ie=UTF8
 */

var segments = link.split("/");
return segments[5];
}


module.exports = router;