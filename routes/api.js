//REQUIRES
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var appRoot = require('app-root-path');
var showdown  = require('showdown')
var dir = require('node-dir');

var s = require(path.join(appRoot.toString(), 'modules/stories.js'));
var storyList = s();
var stories = storyList.getStoryList();

var _filePath = path.join(appRoot.toString(), 'output');

//ROUTERS
router.get('/', function(req, res) {

	res.json(
		stories
	)
});



router.get('/story/:storyId', function(req,res){
	var storyId = req.params.storyId;
	var story = stories.filter(function( obj ) {
	  return obj._id == storyId;
	})[0];	 

	res.json(
		story
	);	
})

router.get('/chapter/:storyId/:chapterId', function(req, res) {
	var converter = new showdown.Converter()
	var chapterId = req.params.chapterId;
	if(!chapterId){
		chapterId = 1;
	}
	var storyId = req.params.storyId;
	var story = stories.filter(function( obj ) {
	  return obj.id == storyId;
	})[0];	 

	var text = "";
	var chapterList = [];
	var readChapter = {};

	dir.readFiles(path.join(_filePath, story.outputFolder), {
	    match: /.md$/
	    }, function(err, content, filename, next) {
	        if (err) throw err;
			var index = parseInt(filename.substring(filename.lastIndexOf("\\")+1, filename.indexOf("_")));

	       	if(padLeft(chapterId,3)==index){
	        //read the markdown and grab the first h1 (the title)
		        
		        var titleStartIndex = content.indexOf("#")+1;
		        var titleEndIndex = content.indexOf("\n");
		        var title = content.substring(titleStartIndex,titleEndIndex);
       		
	       		if(index>1){
	       			readChapter.prevIndex = index-1;
	       		}
	       		readChapter.nextIndex = index+1;
	       		readChapter.index = index;
	       		if(index==1){
	       			readChapter.firstChapter = true;
	       		}
	        	readChapter.title = title;
	        	readChapter.textBody = content.substring(titleEndIndex+1);
	        	readChapter.body = converter.makeHtml(readChapter.textBody);
	        	readChapter.fileName = filename.substring(filename.lastIndexOf("\\")+1);
	        	readChapter.content = content.replace(/"/g, "\\\"");
	        }
	        //var body = converter.makeHtml(content.substring(titleEndIndex+1));

	        //console.log(chapter.index);

	        next();
	    },
	    function(err, files){
	        if (err) throw err;
			//convert the markdown to html
			//var body = converter.makeHtml(text);
			story.readChapter = readChapter;
			res.json(
				readChapter
			);
	    });
});

router.get('/chapters/:storyId', function(req, res) {
	var storyId = req.params.storyId;
	var story = stories.filter(function( obj ) {
	  return obj._id == storyId;
	})[0];	 

	var chapterList = [];

	dir.readFiles(path.join(_filePath, story.outputFolder), {
	    match: /.md$/
	    }, function(err, content, filename, next) {
	        if (err) throw err;

	        //read the markdown and grab the first h1 (the title)
	        var index = parseInt(filename.substring(filename.lastIndexOf("\\")+1, filename.indexOf("_")));

	        var titleStartIndex = content.indexOf("#")+1;
	        var titleEndIndex = content.indexOf("\n");
	        var title = content.substring(titleStartIndex,titleEndIndex);

	        var chapter = {
	        	index: index,
	        	name: filename.substring(filename.lastIndexOf("\\")+1),
	        	title: title,
	        	//body:body
	        }
	        chapterList.push(chapter);
	        next();
	    },
	    function(err, files){
	        if (err) throw err;
	        res.json(
	        		chapterList
	        	)
	    });
});

function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}


module.exports = router;
