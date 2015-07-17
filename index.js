var 
	request = require("request"),
	cheerio = require("cheerio"),
	async   = require("async"),
	url     = require("url"),
	lodash  = require("lodash");

var roleParsers = [
	require("./roleParsers/student.js")
];

var searchUrl = "http://search.epfl.ch/process_web2010?lang=en&as_site_search=&engine=person&q="
var emailRegex = /msgto\('([a-zA-Z\.]+)','([a-zA-Z\.]+)'\)/

function getInfo(q, callback) {
	var finalUrl = searchUrl + q.toString();
	request.get(finalUrl, function(error, result, body) {
		if (error) {
			callback(error);
		} else if (result.statusCode != 200) {
			callback (new Error("Received status code : " + result.statusCode));
		} else {
			var $ = cheerio.load(body);

			var multipleUsers = $(".people_results");
			var noResults = $("#search-results");
			if (multipleUsers.length > 0) {
				var firstUserUrl = $(".people_results .name").eq(0).attr("href");
				var parsedLink = url.parse(firstUserUrl);
				var toSearch = parsedLink.pathname.replace("/", "")
					.replace(".", " ");
				return getInfo(toSearch, callback);
			} else if(noResults.length > 0) {
				return callback(new Error("No results found for : " + q));
			} else {

				// NAME DETECTION
				var fullName = $("h1").text();

				// EMAIL DETECTION
				var presentationBox = $(".presentation script");
				var presentationText = presentationBox.text();
				var presentationLines = presentationText.split("\n");
				var email = "";
				lodash.each(presentationLines, function(line) {
					var matches = line.match(emailRegex);
					if (matches) {
						email = matches[1] + "@" + matches[2];
					}
				});
				if (email.length == 0) {
					return callback(new Error("Impossible to detect email"));
				}

				//ROLES DETECTION 
				var roleNames = $(".topaccredlarge").map(function() {
					return $(this).text().trim();
				}).get();
				var locations = $(".topaccred").map(function() {
					return $(this).text().trim();
				}).get();
				var units = $(".unit_popup > a").map(function() {
					return $(this).text().trim();
				}).get();

				var roles = lodash.map(roleNames, function(role, index) {
					var info = {
						role : role,
						location : locations[index],
						unit : units[index]
					};
					lodash.each(roleParsers, function(parser) {
						if (parser.canHandle(info)) {
							var parsed = parser.handle(info);
							info = lodash.merge(info, parsed);
						}
					});
					return info;
				});

				//SCIPER DETECTION 
				var link = $(".vcard a").attr("href");
				var parsedLink = url.parse(link, true);
				sciper = parsedLink.query.id;
				
				// PORTRAIT DETECTION
				var portrait = $(".portrait img").attr("src");

				var toReturn = {
					fullName : fullName,
					sciper : sciper,
					email : email,
					roles : roles
				}

				if(portrait) {
					toReturn.portrait = portrait;
				}

				callback(null, toReturn);
			}
		}
	});
}

module.exports = {
	getInfo : getInfo
}
