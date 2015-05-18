function HTML() {
	this.source = "";
	this.isTagOpen = {};
	this.table = function(attributes) {
		this.isTagOpen["table"] = true;
		this.source += "<table " + attributes + ">";
		return this;
	}
	this.tr = function() {
		this.source += "<tr>";
		return this;
	}
	this.td = function(text) {
		this.source += "<td>" + text + "</td>";
		return this;
	}
	this.add = function(text) {
		this.source += text;
		return this;
	}
	this.closeTags = function() {
		if (this.isTagOpen.hasOwnProperty("table"))
			this.source += "</table>";
	}
	this.toString = function() {
		this.closeTags();
		return this.source;
	}
}

function HTML_example() {
	html = new HTML().table().tr().td("key").td("value");
	for (var i=0; i<10; i++)
		html.tr().td("i").td(i);
	print(html.source)
}

var table = function() {
	var html = new HTML();
	html.table("class=prettyprinthtml")
	for (var row in arguments) {
		html.tr();
		for (var col in arguments[row])
			html.td(arguments[row][col])
	}
	return html.toString();
}	