var express = require('express');
var router = express.Router();
var feed = "http://localhost:3000/spy1.xml";
var fs = require('fs');
var path = require('path');
var appRoot = require('app-root-path');
var request = require('request');
var cheerio = require('cheerio');
var storyList = require(path.join(appRoot.toString(), 'data/stories.js'));
var stories = storyList.list;

var posts = [];
/* GET home page. */
router.get('/fetch', function(req, res, next) {
	posts = [];
	fetch(feed,function(posts){
		res.render('story', { title: 'Super Powered', posts: posts });
	});
  	
});

router.get('/', function(req, res) {
  res.redirect('/read');
	//res.render('read', { stories: stories });
});

router.get('/s', function(req, res, next){
	url = "http://www.drewhayesnovels.com/spy3/21";
	var chapters = [];
    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html
    scrape(url, function(html){
    	var $ = cheerio.load(html);
    	var chapter = { title : "", content : ""};
		chapter.title = $(".post h1 a").text();
		chapter.body = $(".body").html();
		chapters.push(chapter);
		var nextUrl = $("#nextLink").attr('href');
		console.log(nextUrl  + " next");
		     	
    	res.render('scrape', {url: url, title: chapter.title, body: chapter.body, nextUrl: nextUrl});
    })

});


function scrape(url, cb) {
	var options = {
	  url: url,
	  headers: {
	    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
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

/* RSS FETCHING STUFF */

/*var FeedParser = require('feedparser')
  , Iconv = require('iconv').Iconv
  , zlib = require('zlib');

function fetch(feed, cb) {
  // Define our streams
  var req = request(feed, {timeout: 10000, pool: false});
  req.setMaxListeners(50);
  // Some feeds do not respond without user-agent and accept headers.
  req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
  req.setHeader('accept', 'text/html,application/xhtml+xml');

  var feedparser = new FeedParser();


  // Define our handlers
  req.on('error', done);
  req.on('response', function(res) {
    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
    var encoding = res.headers['content-encoding'] || 'identity'
      , charset = getParams(res.headers['content-type'] || '').charset;
    res = maybeDecompress(res, encoding);
    res = maybeTranslate(res, charset);
    res.pipe(feedparser);
  });

  feedparser.on('error', done);
  feedparser.on('end', function(){cb(posts);done});
  feedparser.on('readable', function() {
    var post;
    while (post = this.read()) {
      //console.log(post);
      posts.push(post);
      
    }
  });
}

function maybeDecompress (res, encoding) {
  var decompress;
  if (encoding.match(/\bdeflate\b/)) {
    decompress = zlib.createInflate();
  } else if (encoding.match(/\bgzip\b/)) {
    decompress = zlib.createGunzip();
  }
  return decompress ? res.pipe(decompress) : res;
}

function maybeTranslate (res, charset) {
  var iconv;
  // Use iconv if its not utf8 already.
  if (!iconv && charset && !/utf-*8/i.test(charset)) {
    try {
      iconv = new Iconv(charset, 'utf-8');
      console.log('Converting from charset %s to utf-8', charset);
      iconv.on('error', done);
      // If we're using iconv, stream will be the output of iconv
      // otherwise it will remain the output of request
      res = res.pipe(iconv);
    } catch(err) {
      res.emit('error', err);
    }
  }
  return res;
}

function getParams(str) {
  var params = str.split(';').reduce(function (params, param) {
    var parts = param.split('=').map(function (part) { return part.trim(); });
    if (parts.length === 2) {
      params[parts[0]] = parts[1];
    }
    return params;
  }, {});
  return params;
}

function done(err) {
  if (err) {
    console.log(err, err.stack);
    //return process.exit(1);
  }
  //server.close();
  //process.exit();
}

*/ 

module.exports = router;
