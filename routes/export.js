
//REQUIRES
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var appRoot = require('app-root-path');
var pandoc = require('simple-pandoc');

var s = require(path.join(appRoot.toString(), 'modules/stories.js'));
var storyList = s();
var stories = storyList.getStoryList();


//ROUTERS
router.get('/', function(req, res) {
	res.render('editList', {stories: stories});
});

router.get('/:storyId', function(req, res) {
	var storyId = req.params.storyId;
	var story = stories.filter(function( obj ) {
	  return obj.id == storyId;
	})[0];	



	res.render('editStory', {editStory: story} );
});

router.post('/:storyId', function(req, res, next){
	var storyId = req.params.storyId;
	var story = {};

	story._id = req.body.dbId;
	story.id = req.body.id;
	story.title = req.body.title;
	story.author = req.body.author;
	story.description = req.body.description;
	story.outputFolder = req.body.outputFolder;
	story.url = req.body.url;
	story.baseUrl = req.body.baseUrl;
	story.titleSelector = req.body.titleSelector;
	story.bodySelector = req.body.bodySelector;
	story.nextLinkSelector = req.body.nextLinkSelector;
	story.titleCleaner = req.body.titleCleaner;
	story.bodyCleaner = req.body.bodyCleaner;
	//var image = req.body.imagePath;

	var a = storyList.update(story);
	//res.redirect("/edit/" + storyId);
	res.send("Saved");
	//res.render('editStory', {editStory: story, message: "Success"} );
});



module.exports = router;
