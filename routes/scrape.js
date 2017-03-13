//REQUIRES
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var appRoot = require('app-root-path');
var request = require('request');
var md = require('html-md');
//require('request-debug')(request);
var cheerio = require('cheerio');
var sanitize = require("sanitize-filename");

//get the list of stories
var storyList = require(path.join(appRoot.toString(), 'data/stories.js'));
var stories = storyList.list;


// CONFIG
var mongoUrl = 'mongodb://10.0.0.15:27017/books';  

var userAgents = [
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11) AppleWebKit/601.1.39 (KHTML, like Gecko) Version/9.0 Safari/601.1.39',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/600.3.10 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.10',
	'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
	'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0'
] 
var _userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];


var chapters = [];
//var _maxChapters = 2;

var config = {
	maxChapters:2,
	requestTimeout:30000,
	delay: 1000
}
config.filePath = path.join(appRoot.toString(), 'output');

//var _storyId = 2;
/*var _story = stories.filter(function( obj ) {
  return obj.id == _storyId;
})[0];*/



 
//ROUTES
router.get('/', function(req, res) {
	res.render('scrapeHome',{stories: stories});
});

router.post('/', function(req, res, next){
	//url = "http://www.drewhayesnovels.com/spy3/21";
	//var scrapeUrl = req.query.url;
	//reinitialize the global chapters
	chapters = [];
	var options = config;

	var maxChapters = req.body.maxChapters;
	if(maxChapters){
		options.maxChapters = maxChapters;
	}
	var timeout = req.body.timeout;
	if(timeout){
		options.requestTimeout = timeout;
	}
	var delay = req.body.delay;
	if(delay){
		options.delay = delay;
	} 


	var storyId = req.body.story;
	options.startingChapter = req.body.startingChapter;
	options.currentChapter = "";
	var story = stories.filter(function( obj ) {
	  return obj.id == storyId;
	})[0];

	var scrapeUrl = story.url;
	if(req.body.startUrl){
		scrapeUrl = req.body.startUrl;
	}

	if(scrapeUrl.length>0){
		console.log("URL: " + scrapeUrl);
		console.log("User Agent: " + _userAgent);
		//console.log("Creating File: " + _fileName);
		crawl(scrapeUrl, story, options, 
			function(success, chapters){		
				if(success){
					res.render('scrape', 
			    		{
			    			url: scrapeUrl,  
							chapters: chapters,
							testUrls: []
			    		});	
				}else{
					console.log("RENDER FAIL");
					res.send(chapters);
				}

			}
		)
		//res.send("Scraping");
	}else{
		res.render('scrape', {stories: stories})
	}
});


//FUNCTIONS


function writeChapter(path, contents, create){
	console.log("Writing to: " + path);
	if(create){
		//console.log("Creating File");
		fs.writeFileSync(path, contents);
	}else{
		//console.log("Updating File");
		fs.appendFileSync(path, contents);
	}
}

function crawl(url, story, options, cb){
	console.log("Crawling: " + url);
	console.log(options);
	var bFirstChapter = (url==story.url);

	fetch(url, 
		function(success, html){
			if(success){
				//console.log("PARSING");
				var $ = cheerio.load(html);
				var chapter = {};
				chapter.title = $(story.titleSelector).text();
				var rawBody = $(story.bodySelector).html();
				//clean the body using the story's custom function
				chapter.body = story.bodyCleaner(rawBody);

				chapter.bodyText = md(chapter.body);
			
				chapters.push(chapter);

				//write to the file
				var output = "#" + chapter.title + "\n" + chapter.bodyText + "\n";
				var htmlOutput = "<h1>" + chapter.title + "</h1>" + chapter.body;
				//write to the full file
				//var fullFile = path.join(options.filePath, story.outputFolder, story.fileName)
				//writeChapter(fullFile, output, bFirstChapter);
				
				//write to the chapter-specific file
				//var chapterIndex = chapters.length;
				if(!options.currentChapter){
					options.currentChapter = options.startingChapter
				}
				var chapterIndex = padLeft(options.currentChapter, 3)
				//var chapterFileName = sanitize(chapterIndex+"_"+chapter.title);
				var chapterFile = path.join(options.filePath, story.outputFolder, sanitize(chapterIndex+"_"+chapter.title + ".md"));
				var chapterHtmlFile = path.join(options.filePath, story.outputFolder, sanitize(chapterIndex+"_"+chapter.title + ".html"));
				writeChapter(chapterFile, output, true);
				writeChapter(chapterHtmlFile, htmlOutput, true);
				
				chapter.fileName = sanitize(chapterIndex+"_"+chapter.title + ".md");

				var nextUrl = $(story.nextLinkSelector).attr('href');
				console.log("NEXT URL: " + nextUrl);
				var bHasNext = false;
				if(nextUrl){
					bHasNext = true;
					if(!nextUrl.startsWith("http")){
						nextUrl = story.baseUrl + nextUrl;
					}					
				}
					
				if(bHasNext&&chapters.length<options.maxChapters){
					
					//fetch the next chapter
					setTimeout(
						function(){
							options.currentChapter++;
							crawl(nextUrl, story, options, cb)
						},
						options.delay);
				}else{
					//run the callback
					cb(true, chapters);
				}				
			}else{
				console.log("CRAWL FAIL");
				cb(false, html);
			}

		}
	)
}


function fetch(url, cb) {
	console.log("Fetching: " + url);
	var options = {
	  url: url,
	  timeout: config.requestTimeout,
	  headers: {
	    'User-Agent': _userAgent,
	    //'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	    //'accept-encoding':'gzip, deflate, sdch',
	    //'accept-language':'en-US,en;q=0.8',
	    //'cache-control': 'no-cache',
	    //'connection': 'keep-alive',
	    //'DNT': '1',
	    //'pragma': 'no-cache',
	    //'Upgrade-Insecure-Requests': '1',
	    //'cookie': 'crumb=BBEReEy8D04xMmRiYjYwODc4YzczYjliN2Q4ZWI1YjVkY2ZlODRk; SS_MID=cc1e6bb9-44c3-4ddb-b28c-8743e36e6869ivi6gxo7; __distillery=v20150227_fd8f9dbc-d722-4ed2-8bc3-f04bcfdfa5f8; ss_cid=1df5c45d-343b-4157-991d-6b9e8558745f; ss_cpvisit=1486140143549; JSESSIONID=HVbOJWjSnPEQ_Oq0Ag6jiw-_JDvbXQUBGu_yjzQpDxJv3VlBBJELJw; ss_cvr=6f1def0c-7877-403c-a442-1712e3fcdb99|1479134466884|1488816894282|1488823858814|62; ss_cvt=1488823858814'
	  }
	};
	function callback(error, response, body) {
	  if (!error && response.statusCode == 200) {
	    //console.log(body);
	    cb(true, body);
	  }else{
	  	console.log(false, error);
	  	cb(false, error);
	  }
	}
	request(options, callback);
}

function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}

module.exports = router;


