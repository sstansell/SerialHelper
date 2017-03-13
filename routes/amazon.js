var express = require('express');
var router = express.Router();
//var feed = "http://localhost:3000/spy1.xml";
var fs = require('fs');
//var request = require('request');
//var cheerio = require('cheerio');
var xray = require('x-ray');
var requestXray = require('request-x-ray')


var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
// Connection URL
var mongoUrl = 'mongodb://10.0.0.15:27017/reviews';  

var x = xray();

var testUrls = [
	{
		name: 'SP1 Live (all stars)',
		url: 'https://smile.amazon.com/Super-Powereds-Year-Drew-Hayes-ebook/product-reviews/B00BIJ05F2/ref=cm_cr_arp_d_show_all?reviewerType=all_reviews&pageNumber=1'
	},
	{
		name: 'SP1 Test (all stars)',
		url: 'http://localhost:3000/data/spReviews.html'
	},
	{
		name: 'SP1 Test (5 stars)',
		url: 'http://localhost:3000/data/reviews.html'
	},
	{
		name: 'CC Test (all stars)',
		url: 'http://localhost:3000/data/ccReviews.html'
	},
	{
		name: 'CC2 Test (all stars)',
		url: 'http://localhost:3000/data/cc2Reviews.html'
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




var xOptions = {
	method: 'GET',
	headers: {
    	'User-Agent': userAgent
  	}
}
var driver = requestXray(xOptions)
x.driver(driver)


/*router.get('/', function(req, res) {
	res.render('amazon', {title: "Search"});
});*/


router.get('/', function(req, res){
	var url = req.query.url;
	console.log(url);
	console.log(userAgent);
	if(url){
		var crawlAttempt = {
			url: url,
			userAgent: userAgent,
			timestamp: Date.now(),
		}

		x(url, {
			book:{
				title: '.product-title a',
				author: '.product-by-line',
				numberOfReviews: 'span[data-hook="total-review-count"]',
				averageRating: 'i[data-hook="average-star-rating"]',
				price: '.arp-price',
				link: 'a[data-hook="product-link"]@href' // /Critical-Failures-Caverns-Creatures-Book-ebook/dp/B00FU38J00/ref=cm_cr_arp_d_product_top?ie=UTF8
			},
			reviews: x(".a-section .celwidget", 
				[{
					author: '.review-byline .author',
					authorLink: 'a.author@href',
					authorBadge: '.a-declarative',
					rating: 'i[data-hook="review-star-rating"]',
					date: '.review-date',
					title: 'a[data-hook="review-title"]',
					body: 'span[data-hook="review-body"]',

				}]
			)
			//.write('./public/reviews.txt')
			//.paginate('.a-last a@href')
			//.limit(2)

		})(function(err, data) {
			if(err){
				console.log(err);
				crawlAttempt.error = err;
			}else{
				//format some of the book info
				var book = data.book;
				book.author = book.author.substring(2);
				//get the ASIN from the link
				book.asin = getAsin(book.link);
				book.averageRating = parseFloat(book.averageRating);

			  	//console.log(data) // Google
				function isValidAuthor(item){
					  		if(item.author){
					  			return true;
					  		}else{
					  			return false;
					  		}
					  	}


			  	var reviews = data.reviews.filter(isValidAuthor);
			  	badReview = reviews.shift();
			  	reviews.forEach(function(element) {
					element.rating = parseInt(element.rating);
					element.date = Date.parse(element.date);
					element.asin = book.asin;
				});
			  	//console.log(reviews);

			  	var package = {
			  		url: url,
			  		book: book,
			  		reviews: reviews,
			  		timestamp: Date.now()
			  	}

				MongoClient.connect(mongoUrl, function(err, db) {
				  assert.equal(null, err);
				  //console.log("Connected successfully to server");

				  insertDocument(db, package, "reviews", function() {
				    db.close();
				  });
				});	
				MongoClient.connect(mongoUrl, function(err, db) {
				  assert.equal(null, err);
				  //console.log("Connected successfully to server");

				  insertDocument(db, book, "books", function() {
				    db.close();
				  });
				});					

				crawlAttempt.title = data.title;
				crawlAttempt.reviewsFound = reviews.length;

			  	res.render('amazon', 
			  		{
			  				url: url,
			  				title:data.book.title, 
			  				reviews: reviews,
			  				testUrls: testUrls
			  		});			
			}
			MongoClient.connect(mongoUrl, function(err, db) {
			  assert.equal(null, err);
			  //console.log("Connected successfully to server");

			  insertDocument(db, crawlAttempt, "crawls", function() {
			    db.close();
			  });
			});	
		  
		});
	}else{
		res.render('amazon', {title: "Search", testUrls: testUrls});
	}


/*		title: '.product-title a',
		authors: ['.a-section .review'] {
			name: '.review-byline .author',
			link: '.a-size-base .a-link-normal .author@href'
		}
		*/
})

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