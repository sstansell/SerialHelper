//REQUIRES
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var appRoot = require('app-root-path');
 
var s = require(path.join(appRoot.toString(), 'modules/stories.js'));
var storyList = s();
var stories = storyList.getStoryList();



//ROUTERS
router.get('/', function(req, res) {
	res.render('editList', {stories: stories});
});




module.exports = router;
