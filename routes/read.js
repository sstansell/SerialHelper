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

router.get('/:storyId/:chapterId', function(req, res) {
	var converter = new showdown.Converter()
	var chapterId = req.params.chapterId;
	if(!chapterId){
		chapterId = 1;
	}
	var storyId = req.params.storyId;
	var story = stories.filter(function( obj ) {
	  return obj.id == storyId;
	})[0];	 

	//read in the markdown file
	/*try {  
		var readFilePath = path.join(_filePath, story.readFile);
	    var text = fs.readFileSync(readFilePath, 'utf8');
	    //console.log(text);    
	} catch(e) {
	    console.log('Error:', e.stack);
	}*/
	var text = "";
	var chapterList = [];
	var readChapter = {};
	//grab the file that matches the chapter index
	//^001_
	/*var pattern = "/^" + padLeft(chapterId,3)+ "_/";
	dir.readFiles(__dirname, {
    	match: pattern
    }, function(err, content, next) {
        if (err) throw err;
        console.log('content:', content);
        var titleStartIndex = content.indexOf("#")+1;
        var titleEndIndex = content.indexOf("\n");
        chapter.title = content.substring(titleStartIndex,titleEndIndex);        
        chapter.body = converter.makeHtml(content);
        next();
    },
    function(err, files){
        if (err) throw err;
        console.log('finished reading files:',files);
    });
*/
	//read in the file to get title and body
	
	//convert body to html
		
	dir.readFiles(path.join(_filePath, story.outputFolder), {
	    match: /.md$/
	    }, function(err, content, filename, next) {
	        if (err) throw err;

	        //read the markdown and grab the first h1 (the title)
	        var index = parseInt(filename.substring(filename.lastIndexOf("\\")+1, filename.indexOf("_")));

	        var titleStartIndex = content.indexOf("#")+1;
	        var titleEndIndex = content.indexOf("\n");
	        var title = content.substring(titleStartIndex,titleEndIndex);


	       	if(padLeft(chapterId,3)==index){

	       		if(chapterList.length>0){
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
	        var chapter = {
	        	index: index,
	        	name: filename,
	        	title: title,
	        	//body:body
	        }
	        //console.log(chapter.index);
	        chapterList.push(chapter);
	        text = text + content;
	        next();
	    },
	    function(err, files){
	        if (err) throw err;
			//convert the markdown to html
			//var body = converter.makeHtml(text);

			res.render('read', 
				{ 
					chapters: chapterList,
					readChapter: readChapter,
					story: story
				}
			);
	    });



});

function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}


module.exports = router;
