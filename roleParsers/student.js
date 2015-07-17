var diplomaTagMap = {
	"BA" : "Bachelor",
	"MA" : "Master",
	"ED" : "PHD"
}

module.exports = {
	canHandle : function(infos) {
		return infos.role == "Student";
	},
	handle : function(infos) {
		var unit = infos.unit;
		var splittedUnit = unit.split("-");
		var diplomaTag,
			semester,
			section;

		if (splittedUnit.length == 2) {
			// This should be a MA-BA student
			section = splittedUnit[0];
			var diplomaYear = splittedUnit[1];
			semester = parseInt(diplomaYear.substring(diplomaYear.length - 1));
			diplomaTag = diplomaYear.substring(0, diplomaYear.length - 1);
		} else if(unit.substring(0, 2) == "ED") {
			// This a student of the doctoral school
			diplomaTag = "ED";
			section = "PHD";
		} else {
			// We don't know :/
			return {};
		}

		var diploma = diplomaTagMap[diplomaTag];
		var toReturn = {
			diploma : diploma,
			diplomaTag : diplomaTag,
			section : section
		};

		if (semester) {
			toReturn.semester = semester;
		}

		return toReturn;
	}
};

