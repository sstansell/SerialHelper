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

	res.render('storyList', {stories: stories});
});

router.get('/chapter/', function (req,res){
	res.render('read', 
		{ 
			layout: path.join(appRoot.toString(), 'views/layouts') +"/read",
		}
	);	
})

router.get('/:storyId/:chapterId', function(req, res) {
	//var converter = new showdown.Converter()
	var chapterId = req.params.chapterId;
	if(!chapterId){
		chapterId = 1;
	}
	var storyId = req.params.storyId;
	var story = stories.filter(function( obj ) {
	  return obj.id == storyId;
	})[0];	 

	var chapterList = [];
	var chapter = {
		index: chapterId
	}

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
	        	name: filename,
	        	title: title,
	        	//body:body
	        }
	       	if(padLeft(chapterId,3)==index){
	       		chapter.current = true;
	        }
	        chapterList.push(chapter);
	        next();
	    },
	    function(err, files){
	        if (err) throw err;
			res.render('read', 
				{ 
					layout: path.join(appRoot.toString(), 'views/layouts') +"/read",
					chapters: chapterList,
					chapter: chapter,
					story: story
				}
			);
	    });
});




function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}


module.exports = router;
