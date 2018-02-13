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
	var apiKeyFB = "4d9c7a74-a2a5-497c-8c59-7dd2f5113ce3";
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

//OBJECT Chart uses data below to plot location of the news source data points across liberal to conservative spectrum.

	var chart = new CanvasJS.Chart("myChart", {
		animationEnabled: true,
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
	
// START FUNCTIONS	

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

function queryAPI(newsSource1, newsSource2) {
	// look at current date and set newsSource ranges to 1 month prior.
	var from = moment().subtract(1, "months").format("YYYY-MM-DD");
	var to = moment().format("YYYY-MM-DD");
	var count=1;

	console.log(from);
	console.log(to);

	//https://newsapi.org/v2/everything?q="+newsSubject+"&sources=cnn&apiKey=52d1c20852064e27ad9777ae8ab088d7
	console.log(newsSubject)
	console.log("news Source 1   " + newsSource1);
	console.log("news source 2   " + newsSource2);

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
		console.log(lean);
		
		console.log(" Response name  " + response.articles[0].source.name);
		console.log(" Response title  " + response.articles[0].title);
		console.log(" Response  description  " + response.articles[0].description);
		console.log(" Response  url  " + response.articles[0].url);
		console.log(" Response  imageurl  " + response.articles[0].urlToImage);
		console.log(" Response  date  " + response.articles[0].publishedAt);


		//this will append an left source to the left side and vice versa
			
			var pic= $("<img>");
			pic.addClass("card-image");
			var lowhalf=$("<div>");
			lowhalf.addClass("card-content");
			

			pic.attr({"src": response.articles[0].urlToImage,"alt":"News Picture"});
			front1.html(pic);

			lowhalf.append("<h3 class='card-title articleText'><a href="+response.articles[0].url+" "+
				"target='_blank'>"+response.articles[0].title+
				"</a></h3><h4 class='secondLine'> Published by"+" "+"<span id='sourceTag'>"+response.articles[0].source.name+"</span>"+
				" "+"on"+" "+moment(response.articles[0].publishedAt).format("MM-DD-YYYY")+
				"</h4><p class='card-text'>"+response.articles[0].description+"<p class='card-likes'>78,999&nbsp;<i class='far fa-thumbs-up'></i> liked this</p>" +
				"</p><button class='btn toggle'>See Other News Stories</button>");
			front1.append(lowhalf);
			article1Div.prepend(front1);


		//different layout for next articles

		for (var i = 1; i < 10; i++) {
			if (response.articles[0].title != response.articles[i].title) {

				var article1childDiv=$("<div>");
				article1childDiv.addClass("otherArticles");
				article1childDiv.append("<h3><a href="+response.articles[i].url+" "+
				"target='_blank'>"+response.articles[i].title+"</a></h3>");
				back1.append(article1childDiv);
				count++;
			}
			if(count===5)
			{
				count=1;
				back1.prepend("<h2>Other Articles on Your Topic</h2>");
				back1.append("<button class='btn toggle'>Return to Top Story</button>");
			article1Div.append(back1);
				break;
			}
		}

/*-- START BLOCK COMMENT
	 }).then(function (response){
	 	var queryURL_FB1 = "http://webhose.io/filterWebContent?token=" + apiKeyFB + "&format=json&ts=1515290541502&sort=social.facebook.likes&q=%22" + newsTitle1 + "%22%20language%3Aenglish";
		
	 		$.ajax({
	         url: queryURL_FB1,
	         method: "GET"
	     }).done(function(response) {
	 		var results = response.posts;
	 		if(results != "")
	 		{
	 		console.log("news title 1  "  +newsTitle1);
	 		console.log("Likes: " + results[0].thread.social.facebook.likes);
	 		var likeDiv=$("<div>");
	 			likeDiv.addClass("likeDiv");
	 			likeDiv.append("<p><i class='far fa-thumbs-up'></i>"+" "+results[0].thread.social.facebook.likes+" "+ "liked this</p>");
	 			front1.append(likeDiv);
	 			front1.append("</p><button class='toggle'>See Other News Stories</button>");
	 			article1Div.prepend(front1);
	 			}
	 		else
	 		{
	 			console.log("content not found");
	 			var likeDiv=$("<div>");
	 			likeDiv.addClass("likeDiv");
	 			likeDiv.append("<p>Likes not Available</p>");
	 			front1.append(likeDiv);
	 			front1.append("</p><button class='toggle'>See Other News Stories</button>");
	 			article1Div.prepend(front1);
	 		}
	     }).fail(function (jqXHR, textStatus, errorThrown) {
		 console.log("Error Message  " + textStatus);
		 });
END BLOCK COMMENT --*/

	}).fail(function (jqXHR, textStatus, errorThrown) {
		console.log("Error Message  " + textStatus);
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
		$("#newSearchButton").css({
			"display": "none"
		});
		$("#chartButton").css({
			"display": "none"
		});
		$(".optionalClose").css({
			"display": "none"
		});
		$("#btn-ok").css({
			"display": "block"
		});
		$("#userMsg").empty().append("No article found, try new search");
	});

	$.ajax({
		url: queryURL2,
		method: "GET"
	}).then(function (response) {
		newsTitle2= response.articles[0].title;
		console.log(" Response name  " + response.articles[0].source.name);
		console.log(" Response title  " + response.articles[0].title);
		console.log(" Response  description  " + response.articles[0].description);
		console.log(" Response  url  " + response.articles[0].url);
		console.log(" Response  imageurl  " + response.articles[0].urlToImage);
		console.log(" Response  date  " + response.articles[0].publishedAt);


			var pic= $("<img>");
			pic.addClass("card-image");
			var lowhalf=$("<div>");
			lowhalf.addClass("card-content");
			

			pic.attr({"src": response.articles[0].urlToImage,"alt":"News Picture"});
			front2.html(pic);

			lowhalf.append("<h3 class='card-title articleText'><a href="+response.articles[0].url+" "+
				"target='_blank'>"+response.articles[0].title+
				"</a></h3><h4 class='secondLine'> Published by"+" "+"<span id='sourceTag'>"+response.articles[0].source.name+"</span>"+
				" "+"on"+" "+moment(response.articles[0].publishedAt).format("MM-DD-YYYY")+
				"</h4><p class='card-text'>"+response.articles[0].description+"<p class='card-likes'>78,999&nbsp;<i class='far fa-thumbs-up'></i> liked this</p>"+
				"</p><button class='btn toggle'>See Other News Stories</button>");
			front2.append(lowhalf);
			article2Div.append(front2);

		for (var i = 1; i < 10; i++) {
			if (response.articles[0].title != response.articles[i].title) {

				var article2childDiv=$("<div>");
				article2childDiv.addClass("otherArticles");
				article2childDiv.append("<h3><a href="+response.articles[i].url+" "+
				"target='_blank'>"+response.articles[i].title+"</a></h3>");
				back2.append(article2childDiv);
				count++;
			}
			if(count===5)
			{
				count=1;
				back2.prepend("<h2>Other Articles on Your Topic</h2>");
				back2.append("<button class='btn toggle'>Return to Top Story</button>");
			article2Div.append(back2);
				break;
			}
		}

/*-- START BLOCK COMMENT
	 }).then(function(response) {
		
	 	var queryURL_FB2 = "http://webhose.io/filterWebContent?token=" + apiKeyFB + "&format=json&ts=1515290541502&sort=social.facebook.likes&q=%22" + newsTitle2 + "%22%20language%3Aenglish";
		
	 		$.ajax({
	         url: queryURL_FB2,
	         method: "GET"
	     }).done(function(response) {
	 		var results = response.posts;
	 		if(results != "")
	 		{
	 		console.log("news title 2  "  +newsTitle2);
	 		console.log("Likes: " + results[0].thread.social.facebook.likes);
	 		var likeDiv=$("<div>");
	 			likeDiv.addClass("likeDiv");
	 			likeDiv.append("<p><i class='far fa-thumbs-up'></i>"+" "+results[0].thread.social.facebook.likes+" "+ "liked this</p>");
	 			front2.append(likeDiv);
	 			front2.append("</p><button class='toggle'>See Other News Stories</button>");
	 			article2Div.prepend(front2);
	 			}
	 		else
	 		{
	 			console.log("content not found");
	 			var likeDiv=$("<div>");
	 			likeDiv.addClass("likeDiv");
	 			likeDiv.append("<p>Likes not Available</p>");
	 			front2.append(likeDiv);
	 			front2.append("</p><button class='toggle'>See Other News Stories</button>");
	 			article2Div.prepend(front2);
	 		}
			
	     }).fail(function (jqXHR, textStatus, errorThrown) {
		 console.log("Error Message  " + textStatus);
		 });
END BLOCK COMMENT --*/
    
	}).fail(function (jqXHR, textStatus, errorThrown) {
		console.log("Error Message  " + textStatus);
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
		$(".opttionalClose").css({
			"display": "block"
		});
		$("#userMsg").empty().append("No article found, try new search");
	});

if(lean==="left"){    
    $(".leftArticle").append(article1Div);
    $(".leftArticle").css("border-right", "2px solid #301D6E");
    $(".buttonContainer").css("border-bottom", "1px solid #D0D0D0");
     $(".rightArticle").append(article2Div);
    lean="";
}

else if (lean==="right"){
    article2Div.addClass("leftInfo");
    $(".leftArticle").append(article2Div);
    $(".leftArticle").css("border-right", "2px solid #301D6E");
    $(".buttonContainer").css("border-bottom", "1px solid #D0D0D0");
    article1Div.addClass("rightInfo");
    $(".rightArticle").append(article1Div);
    lean="";
}
}

// END FUNCTIONS	
	
// START PAGE LOAD: Upon page load create and display initial modal so the user can enter a subject, select a news source, and optionally provide their age and gender information. A notice is also created for when no results are returned or if no required fields contain data.

$( document ).ready(function() {
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

// END PAGE LOAD 

// START LISTENERS 

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
		// reset fields in modal
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
			console.log(gender);
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
				//console.log("Please Enter Valid Age");
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
				$("#userMsg").empty().append("Please Enter Valid Age in Numbers");

			}
		}else {
			// console.log("Please enter required values");
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
			$("#userMsg").empty().append("Please Enter required values");
		}

	});

	$(".leftArticle").on("click",".toggle", function() {
		console.log("click");
		$(".flip-containerL").toggleClass("hover");
	})

	$(".rightArticle").on("click",".toggle", function() {
		console.log("click");
		$(".flip-containerR").toggleClass("hover");
	})

/* END LISTENERS */	

/* START FUNCTION CALLS */

	chart.render();

// END FUNCTION CALLS
// END FILE