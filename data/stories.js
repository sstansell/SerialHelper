var Stories = function () {};
var cheerio = require('cheerio');

Stories.prototype.list = [
	{
		"id": "1",
		"outputFolder": "year4/",
		"title": "Super Powereds (Year 4)",
		"author":"Drew Hayes",
		"url": "http://www.drewhayesnovels.com/spy4/p1",
		"baseUrl": "http://www.drewhayesnovels.com",
		"image": "http://vignette1.wikia.nocookie.net/superpowereds/images/7/7d/SPY1-1563x2500.jpg/revision/latest/scale-to-width-down/1000?cb=20141231144945",
		"description": "The story of five young people with abilities they cannot control, called 'Powereds' by society. They are resigned to life with their personal hurdles, until one day each is approached by a company claiming they have a new procedure to turn Powereds into Supers, people who can control their abilities at will.",
		"titleSelector": ".post h1 a",
		"bodySelector": ".body",
		"nextLinkSelector": "#nextLink",
		"titleCleaner":function(title){

			return title;
		},
		"bodyCleaner": function(body){
			var ret = body;
			var funkySpaces = /&#xA0;/gi;
			ret = ret.replace(funkySpaces, '');
			var asterisks = /\* \* \*/gi;
			ret = ret.replace(asterisks, "* * *")					
			return ret;
		}		
	},
	{
		"id":2,
		"outputFolder": "worm/",
		"title": "Worm",
		"author":"Wildbow",
		"url": "https://parahumans.wordpress.com/2011/06/11/1-1/",
		"baseUrl": "https://parahumans.wordpress.com",
		"image": "https://parahumans.files.wordpress.com/2012/08/skitter-cover-2-a.jpg?w=584&h=584",
		"description": "An introverted teenage girl with an unconventional superpower, goes out in costume to find escape from a deeply unhappy and frustrated civilian life.",
		"titleSelector": "h1.entry-title" ,
		"bodySelector": ".entry-content",
		"nextLinkSelector": "a[title='Next Chapter']",
		"titleCleaner":function(title){

			return title;
		},
		"bodyCleaner": function(body){
			console.log("Cleaning Body");
			var $ = cheerio.load(body);
			$("#jp-post-flair").remove();
			$("p[style='text-align:right;']").remove();
			$("p[style='text-align:center;']").remove();
			$( "a[title='Next Chapter']" ).remove();
			$( "a[title='Last Chapter']" ).remove();
			var ret = $.html();
			return ret;
		}
	},
	{
		"id": "3",
		"outputFolder": "blades/",
		"title": "Blades & Barriers",
		"author":"Drew Hayes",
		"url": "http://www.drewhayesnovels.com/bladesbarriers/prologue",
		"baseUrl": "http://www.drewhayesnovels.com",
		"image":"http://superpowereds.com/wp-content/uploads/2014/06/Super-Powereds-Logo.png",
		"description": "A spin-off of Super Powereds, focusing on life in Port Villain",
		"titleSelector": ".post h1 a",
		"bodySelector": ".body",
		"nextLinkSelector": "#prevLink",
		"titleCleaner":function(title){

			return title;
		},
		"bodyCleaner": function(body){
			var ret = body;
			var funkySpaces = /&#xA0;/gi;
			ret = ret.replace(funkySpaces, '');					
			return ret;
		}		
	}			
]

module.exports = new Stories;