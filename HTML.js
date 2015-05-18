function HTML() {
	this.source = "";
	this.table = function() {
		this.source += "<table>";
		return this;
	}
	this.tr = function() {
		this.source += "<tr>";
		return this;
	}
	this.td = function(text) {
		this.source += "<td>" + text;
		return this;
	}
}

function HTML_example() {
	html = new HTML().table().tr().td("key").td("value");
	for (var i=0; i<10; i++)
		html.tr().td("i").td(i);
	print(html.source)
}