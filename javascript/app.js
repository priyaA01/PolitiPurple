// INITITIALIZE FIREBASE 

var config = {
	apiKey: "AIzaSyDfT3yvJCDry2s7DWgXg72149BFelnxE6c",
	authDomain: "politipurple.firebaseapp.com",
	databaseURL: "https://politipurple.firebaseio.com",
	projectId: "politipurple",
	storageBucket: "",
	messagingSenderId: "550902399608"
};
firebase.initializeApp(config);

var database=firebase.database();

// GLOGAL VARIABLES

var apiKey = "52d1c20852064e27ad9777ae8ab088d7";
var apiKeyFB = "0a913679-6152-489a-a67c-6a70aaa1cb65"; // Priya's key
	//Mark's key: "4d9c7a74-a2a5-497c-8c59-7dd2f5113ce3";
var newsSubject = "";
var newsSource1 = "";
var newsSource2 = "";
var newsTitle1="";
var newsTitle2="";
var age="";
var gender="";
var lean="";
var modal = $("#modal1");
var chartModal = $("#chartModal");
var article1Div = $("<div>");
var article2Div = $("<div>");

// OBJECT newsSourcePair: pairings based on team agreement based on info from the article located at:  http://www.allgeneralizationsarefalse.com/the-chart-version-3-0-what-exactly-are-we-reading/
var newsSourcePair = {
	"pair1": ["the-washington-post", "time"],
	"pair2": ["cnn", "the-economist"],
	"pair3": ["the-guardian-uk", "the-hill"],
	"pair4": ["the-huffington-post", "the-wall-street-journal"],
	"pair5": ["msnbc", "fox-news"],
	"pair6": ["buzzfeed", "breitbart-news"]
}

//ARRAY of pairings
var pair = ["pair1", "pair2", "pair3", "pair4", "pair5", "pair6"];

//OBJECT Chart uses data below to plot location of the news source data points across liberal to conservative spectrum.	chart is then rendered.

var chart = new CanvasJS.Chart("myChart", {
	animationEnabled: false,
	title:{
		text: "See where your Sources Lie",
	},
	axisX: {
		title:"Lean: Liberal to Conservative Bias",
		minimum:0,
		maximum:14
	},
	axisY: {
		title:"Quality: Inaccurate Info to Original Fact Reporting"
	},
	data: [{
		type: "bubble",
		toolTipContent: "<b>{name}</b>",
		color:"rgba(255,12,32,.5)",
		dataPoints: [
			{ x: 7.5, y: 7.1,z: 10, name: "Time" },
			{ x: 7.9, y: 6.4,z: 10, name: "The Economist" },
			{ x: 9, y: 7.5,z: 10, name: "The Hill" },
			{ x: 8.4, y: 7.3,z: 10, name: "Wall Street Journal" },
			{ x: 11.5, y: 2,z: 10, name: "Fox News" },
			{ x: 12.1, y: 1,z: 10, name: "Breritbart News" }
		]
	},
	{
		type: "bubble",
		toolTipContent: "<b>{name}</b>",
		color:"rgba(12,143,221,.2)",
		dataPoints: [
			{ x: 6, y: 7.1,z: 10, name: "Washington Post" },
			{ x: 6.2, y: 4.1,z: 10, name: "CNN" },
			{ x: 6, y: 6.8,z: 10, name: "The Guardian" },
			{ x: 3.2, y: 3.8,z: 10, name: "Huffington Post" },
			{ x: 4.1, y: 4.5,z: 10, name: "MSNBC" },
			{ x: 4, y: 3.6,z: 10, name: "Buzzfeed News" },
		]
	}]
});

chart.render();	
	
// START FUNCTIONS ====================================	
	
function pairFind() {
	newsSource1 = $("#sourceBar option:selected").val();
	//adding left and right
	for (var i = 0, j = 0; i < pair.length; i++) {
		if (newsSourcePair[pair[i]][j] == newsSource1) {
			newsSource2 = newsSourcePair[pair[i]][j + 1];
			lean="left";
			queryAPI(newsSource1, newsSource2);
		} else if (newsSourcePair[pair[i]][j + 1] == newsSource1) {
			newsSource2 = newsSourcePair[pair[i]][j];
			lean="right";
			queryAPI(newsSource1, newsSource2);
		}
	}
}	

// newsFrontBuilder - this function takes the information from the apis and builds the front portion of the left and right cards with the top articles for each news source (based on Facebook Likes).

function newsFrontBuilder(results, front, articleDiv) {
		var likeDiv=$("<div>");
		likeDiv.addClass("likeDiv");
		var buttonDiv=$("<div>");
		buttonDiv.addClass("btnDiv");
		buttonDiv.append("<button class='btn toggle frToggle'>See Other News Stories</button>");
	
	if(results != "") {
		console.log("news title 1  "  + newsTitle1);
		console.log("Likes: " + results[0].thread.social.facebook.likes);
		likeDiv.append("<p><i class='far fa-thumbs-up'></i>" + " " + results[0].thread.social.facebook.likes+ " " + "liked this</p>");
	}
	else {
		console.log("content not found");
		likeDiv.append("<p>Likes not Available</p>");	
		likeDiv.append(buttonDiv);	
	}			
		front.append(likeDiv);
		front.append(buttonDiv);
		articleDiv.prepend(front);
}

// newsBackBuilder - this function takes the information from the apis and builds the back portion of the left and right cards with the top 5 articles for each news source (based on Facebook Likes).

function newsBackBuilder(response, back, count, articleDiv) {
	for (var i = 1; i < 10; i++) {
		if (response.articles[0].title != response.articles[i].title) {

			var articlechildDiv=$("<div>");
			articlechildDiv.addClass("otherArticles");
			articlechildDiv.append("<h3><a href=" + response.articles[i].url + " " + "target='_blank'>" + response.articles[i].title + "</a></h3>");
			back.append(articlechildDiv);
			count++;
		}
		if(count===5)
		{
			count=1;
			var buttonDiv=$("<div>");
			buttonDiv.addClass("btnDiv");
			back.prepend("<h2>Other Articles on Your Topic</h2>");
			buttonDiv.append("<button class='btn toggle bkToggle'>Return to Top Story</button>");
			back.append(buttonDiv);
			articleDiv.append(back);
			break;
		}
	}
}
// queryAPI: Here is where the ajax calls to the apis live and  where they call the functions above at various points to build the page with the information returned by the apis. 
function queryAPI(newsSource1, newsSource2) {
	var from = moment().subtract(1, "months").format("YYYY-MM-DD");
	var to = moment().format("YYYY-MM-DD");
	var count=1;

	$(article1Div).html("");
    $(article2Div).html("");
	$(".leftArticle").show();
	$(".rightArticle").show();
	$("#newSearchButton").css({
		"display": "block"
	});
	$("#chartButton").css({
		"display": "block"
	});

	var queryURL1 = "https://newsapi.org/v2/everything?q=" + newsSubject + "&sources=" + newsSource1 + "&sortBy=relevancy&from=" + from + "&to=" + to + "&language=en&apiKey=" + apiKey;

	var queryURL2 = "https://newsapi.org/v2/everything?q=" + newsSubject + "&sources=" + newsSource2 + "&sortBy=relevancy&from=" + from + "&to=" + to + "&language=en&apiKey=" + apiKey;

	article1Div.addClass("card flipper");
	article2Div.addClass("card flipper");
	var front1=$("<div>");
	front1.addClass("front");
	var back1=$("<div>");
	back1.addClass("back card-content");
	var front2=$("<div>");
	front2.addClass("front");
	var back2=$("<div>");
	back2.addClass("back card-content");

	$.ajax({
		url: queryURL1,
		method: "GET"
	}).then(function (response) {
		newsTitle1= response.articles[0].title;
		//this will append an left source to the left side and vice versa
		var pic= $("<img>");
		pic.addClass("card-image");
		var lowhalf=$("<div>");
		lowhalf.addClass("card-content");
		pic.attr({"src": response.articles[0].urlToImage,"alt":"Photo associated with Article Not Found"});
		front1.html(pic);
		lowhalf.append("<h3 class='card-title articleText'><a href=" + response.articles[0].url + " " + "target='_blank'>"+response.articles[0].title + "</a></h3><h4 class='secondLine'> Published by" + " " + "<span id='sourceTag'>" + response.articles[0].source.name + "</span>" + " " + "on" + " " + moment(response.articles[0].publishedAt).format("MM-DD-YYYY") + "</h4><p class='card-text'>"+response.articles[0].description);
		front1.append(lowhalf);
		article1Div.prepend(front1);
			
		newsBackBuilder(response, back1, count, article1Div);

	 }).then(function (response){
			var queryURL_FB1 = "https://webhose.io/filterWebContent?token=" + apiKeyFB + "&format=json&ts=1515290541502&sort=social.facebook.likes&q=%22" + newsTitle1 + "%22%20language%3Aenglish";
		
	 		$.ajax({
				url: queryURL_FB1,
				method: "GET"
			}).done(function(response) {
				var results = response.posts;
			
				newsFrontBuilder(results, front1, article1Div);
		
	     }).fail(function (jqXHR, textStatus, errorThrown) {
		 console.log("Error Message  " + textStatus);
		 newsFrontBuilder("", front2, article2Div);
		 });
	}).fail(function (jqXHR, textStatus, errorThrown) {
        failNoRecord();

    });

	$.ajax({
		url: queryURL2,
		method: "GET"
	}).then(function (response) {
		newsTitle2= response.articles[0].title;

		var pic= $("<img>");
		pic.addClass("card-image");
		var lowhalf=$("<div>");
		lowhalf.addClass("card-content");
		
		pic.attr({"src": response.articles[0].urlToImage,"alt":"News Picture"});
		front2.html(pic);

		lowhalf.append("<h3 class='card-title articleText'><a href=" + response.articles[0].url + " " + "target='_blank'>"+response.articles[0].title + "</a></h3><h4 class='secondLine'> Published by" + " " + "<span id='sourceTag'>" + response.articles[0].source.name + "</span>" + " " + "on" + " " + moment(response.articles[0].publishedAt).format("MM-DD-YYYY") + "</h4><p class='card-text'>" +response.articles[0].description);
		front2.append(lowhalf);
		article2Div.append(front2);
		
 		newsBackBuilder(response, back2, count, article2Div);
		
	 }).then(function(response) {
			var queryURL_FB2 = "https://webhose.io/filterWebContent?token=" + apiKeyFB + "&format=json&ts=1515290541502&sort=social.facebook.likes&q=%22" + newsTitle2 + "%22%20language%3Aenglish";
		
	 		$.ajax({
	         url: queryURL_FB2,
	         method: "GET"
			}).done(function(response) {
				var results = response.posts;		
				newsFrontBuilder(results, front2, article2Div);	
			}).fail(function (jqXHR, textStatus, errorThrown) {
				newsFrontBuilder("", front2, article2Div);
		 });
	}).fail(function (jqXHR, textStatus, errorThrown) {
        failNoRecord();

    });

if(lean==="left"){    
    $(".leftArticle").append(article1Div);
    stateManager.init();
    $(".buttonContainer").css("border-bottom", "1px solid #D0D0D0");
     $(".rightArticle").append(article2Div);
    lean="";
	$('.flip-containerL').removeClass('hover');
    $('.flip-containerR').removeClass('hover');
}

else if (lean==="right"){
    article2Div.addClass("leftInfo");
    $(".leftArticle").append(article2Div);
    stateManager.init();
    $(".buttonContainer").css("border-bottom", "1px solid #D0D0D0");
    article1Div.addClass("rightInfo");
    $(".rightArticle").append(article1Div);
    lean="";
	$('.flip-containerL').removeClass('hover');
    $('.flip-containerR').removeClass('hover');
}
}	

function resetShowNews(){
	$("#searchTopic").hide();
	$("#sourceBar").material_select('destroy');
	$("#ageBox").hide();
	$("#genderBox").material_select('destroy');
	$("#showNews").css({
		"display": "none"
	});

	$("#btn-ok").css({
		"display": "block"
	});

}

function failNoRecord()
{
	modal.css({
		"display": "block"
	});
	$(".leftArticle").hide();
	$(".rightArticle").hide();
	$("#searchTopic").hide();
	$("#sourceBar").material_select('destroy');
	$("#ageBox").hide();
	$("#genderBox").material_select('destroy');
	$("#showNews").css({
		"display": "none"
	});
	$("#btn-ok").css({
		"display": "block"
	});
	$(".optionalClose").css({
			"display": "none"
	});
	$("#userMsg").empty().append("No article found, try new search");
}	

// END FUNCTIONS ====================================
	
// START PAGE LOAD: Upon page load create and display initial modal so the user can enter a subject, select a news source, and optionally provide their age and gender information, which is loagged to firebase database. A notice is also created for when no results are returned or if no required fields contain data.  Behind the modal, the page builds with the current date displayed in the header.
	
	var datetime = null,
			date = null;

	var update = function() {
		date = moment(new Date())
		datetime.html(date.format('dddd, MMMM DD, YYYY'));
	};	
	datetime = $("#currentTime");
	update();
	
	$(document).ready(function () {
	// Open the modal 
		modal.css({
			"display": "block"
		});
		$('select').material_select();
		$("#btn-ok").css({
			"display": "none"
		});
		$("#newSearchButton").css({
			"display": "none"
		});
		$("#chartButton").css({
			"display": "none"
		});
		$(".optionalClose").css({
			"display": "none"
		});
	});	

// media responsive border
	
	var stateManager = (function () {
	var state = null;
	var resizePage = function () {
		if ($('body').width() < 600) {
			if (state !== "mobile") {
				displayMobile();
			}
		} else {
			if (state !== "desktop") {
				displayDesktop();
			}
		}
	};
	var displayMobile = function () {
		state = "mobile";
		$(".leftArticle").css("border-right", "0");
	};
	var displayDesktop = function () {
		state = "desktop";
		$(".leftArticle").css("border-right", "2px solid #301D6E");

	};
	return {
		init: function () {
			resizePage();
			$(window).on('resize', resizePage);
		}
	};
}());

// END PAGE LOAD ====================================

// START LISTENERS ====================================
	
	// Listening to Modal "X" to close modal	
	$(".optionalClose").on("click", function (e) {
		modal.css({
			"display": "none"
		});
		chartModal.css({
			"display": "none"
		});
	});
	
	// Listening to button on page to launch chart modal
	$("#chartButton").on("click", function (e) {
		chartModal.css({
			"display": "block"
		});
		$(".chartContainer").css({
			"display": "block"
		});

		$(".optionalClose").css({
			"display": "block"
		});

	});

	// Listening to button on page to relaunch search modal with heading text removed and fields reset.	
	$("#newSearchButton").on("click", function (e) {
		modal.css({
			"display": "block"
		});
		$(".optionalClose").css({
			"display": "block"
		});
		//reset boxes
		$("#searchTopic").val("");
		$("#ageBox").val("");

		$("form input").val("");
		$("select").prop('selectedIndex', 0);
		$("select").material_select();
	});

	// Listening to "OK" notice button on modal when no results are returned or no fields have been filled in on the initial search modal.  The fields are reset and displayed so the user can try a new search.	
	$("#btn-ok").on("click", function (e) {
		$("#searchTopic").show();
		$("#sourceBar").material_select();
		$("#ageBox").show();
		$("#genderBox").material_select();
		$("#showNews").css({
			"display": "block"
		});
		$("#btn-ok").css({
			"display": "none"
		});
		$("#userMsg").empty();
		//reset boxes
		$("#searchTopic").val("");
		$("#ageBox").val("");

		$("form input").val("");
		$("select").prop('selectedIndex', 0);
		$("select").material_select();
	});

$("#showNews").on("click", function (e) {
    e.preventDefault();
    if($("#searchTopic").val()!="" && $("#sourceBar option:selected").val()!= "selectNews"){     
        newsSubject = $("#searchTopic").val().trim();
        age = $("#ageBox").val().trim();
        gender = $("#genderBox option:selected").val();
        var dateAdded=moment().format("YYYY-MM-DD");

        if(age==""){
           age=0;
       }else if(parseInt(age) > 1 || parseInt(age) < 100){
           age=age;

       }else{
           age=-1;
       }

       if(age>=0){
    	database.ref().push({
	    newsSubject: newsSubject,
	    newsSource1: newsSource1,
	    age:age,
	    gender: gender,
	    dateAdded: dateAdded
	      })

	    	modal.css({
				"display": "none"
			});
			pairFind();

    	}else {
		   ///NEW FUNCTION
			resetShowNews();
			$("#userMsg").empty().append("Please Enter Valid Age in Numbers");

		}
	}else {
		    ///NEW FUNCTION
		resetShowNews();
		$("#userMsg").empty().append("Please Enter required values");
	}

});

$(".leftArticle").on("click",".toggle", function() {
    $(".flip-containerL").toggleClass("hover");
})

$(".rightArticle").on("click",".toggle", function() {
    $(".flip-containerR").toggleClass("hover");
})

// END LISTENERS ====================================

// END FILE ====================================