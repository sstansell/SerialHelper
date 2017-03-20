  var reader = {
	storyId:"",
	chapterId: "",
	chapterList: [],
	storyList: [],
	buildStoryList: function(){
		var stories = [];
		reader.storyListStore.getItem("stories", 
			function(err, value){
				if(value){
					stories = value;
					reader.renderStoryList(stories);
				}else{
					reader.fetchStoryList(function(storyList){
						stories = storyList;
						reader.renderStoryList(stories)
						reader.storyListStore.setItem("stories", stories);
					})
				}
			}
		)
	},
	buildChapterList: function(storyId, chapterId){
		reader.fetchChapterList(storyId, 
			function(chapters){
				//add the story id to each chapter (to make it easier to render)
				for (var i = 0, len = chapters.length; i < len; i++) {
					chapters[i].storyId = storyId
				}
				reader.renderChapterList(chapters);
				$("#tocMenu").removeClass("hide");
			}
		)
	},
	loadChapter:function(storyId, chapterId){
		var bChapterExists = false;
		var bStoryExists = false;
		reader.storyStore.getItem("story",
			function(err, value){
				var chapters = [];
				var story = {};

				if(value){
					//we have the story, pull the chapters
					story = value;
					chapters = story.chapters;
					//check the chapters to see if we have the current one already
					for(var i=0, len = chapters.length; i<len; i++){
						if(chapters[i].index==chapterId){
							bChapterExists = true;
							//set the reading chapter to that one
							story.readChapter = chapters[i];
						}
					}	
					//if we don't have the current chapter, fetch it.
					if(!bChapterExists){
						reader.fetchChapter(story.id, chapterId, 
							function(data){
								//build the chapter
								story.chapters.push(data);
								story.readChapter = data;
								reader.renderChapter(story);
								reader.fetchChapterList(reader.storyId, function(data){
									reader.chapterList = data;
									reader.updateStorage(reader.storyStore, "chapterList", reader.chapterList);
								})										
								reader.updateStorage(reader.storyStore, "story", story);

							} 
						)
					}else{
						reader.renderChapter(story);
						reader.fetchChapterList(reader.storyId, function(data){
							reader.chapterList = data;
							reader.updateStorage(reader.storyStore, "chapterList", reader.chapterList);
						})								
						reader.updateStorage(reader.storyStore, "story", story);					
					}									
				}else{
					//we don't have the story, fetch it and create empty chapters
					reader.fetchStory(reader.storyId, function(data){
						story = data;
						story.chapters = [];
						//fetch the chapter and render
						reader.fetchChapter(story.id, chapterId, 
							function(data){
								//build the chapter
								story.chapters.push(data);
								story.readChapter = data;
								reader.renderChapter(story);
								reader.fetchChapterList(reader.storyId, function(data){
									reader.chapterList = data;
									reader.updateStorage(reader.storyStore, "chapterList", reader.chapterList);
								})								
								reader.updateStorage(reader.storyStore, "story", story);
							} 
						)						
					})
				}





			}
		)	
	},
	fetchChapter:function(storyId, chapterId, cb){
		var url = "/api/chapter/" + storyId + "/" + chapterId;
		//console.log(url);
		$.getJSON(url, 
			function(data){
				cb(data);
			}
		)
	},
	fetchStory:function(storyId, cb){
		var url = "/api/story/" + storyId ;
		//console.log(url);
		$.getJSON(url, 
			function(data){
				cb(data);
			}
		)
	},
	fetchChapterList:function(storyId, cb){
		var url = "/api/chapters/" + storyId ;
		//console.log(url);
		$.getJSON(url, 
			function(data){
				cb(data);
			}
		)
	},
	fetchStoryList:function(cb){
		var url = "/api/storyList" ;
		//console.log(url);
		$.getJSON(url, 
			function(data){
				cb(data);
			}
		)
	},	
	renderChapter:function(story){
		var bodyTemplate   = $("#body-template").html();
		var template = Handlebars.compile(bodyTemplate);
		var context = {
			readStory: story
		}
		$("#bodyContainer").html(template(context));		
	},
	renderChapterList:function(chapterList){
		var chapterTemplate   = $("#chapterList-template").html();
		var template = Handlebars.compile(chapterTemplate);
		var context = {
			chapters: chapterList
		}
		$("#chapterList").append(template(context));		
	},
	renderStoryList:function(storyList){
		var storyTemplate   = $("#storyList-template").html();
		var template = Handlebars.compile(storyTemplate);
		var context = {
			stories: storyList
		}
		$("#storyList").html(template(context));		
	},		
	updateStorage:function(dataStore, key, value){
		dataStore.setItem(key, value).then(function (value) {
		    // Do other things once the value has been saved.
		    //console.log(value);
		}).catch(function(err) {
		    // This code runs if there were any errors
		    console.log(err);
		});
	},
	storyStore: {},
	storyListStore: localforage.createInstance({
			name: "storyList"
	}),
	initialize: function(storyId){
		this.storyStore = localforage.createInstance({
			name: reader.storyId
		})
	}						
  };