// Transform a token object into an exception object and throw it.
Object.prototype.error = function (message, t) {
	t = t || this;
	t.name = "SyntaxError";
	t.message = message;
	throw t;
};

function minijs_print(string) {
	document.getElementById('minijs_output').innerHTML += string;
}
function minijs_clear() {
	document.getElementById('minijs_output').innerHTML = "";
};

function minijs_go(source) {
	var string, tree;
	try {
		minijs_parser = new MiniJS.Parser();
		tree = minijs_parser.parse(source);
		string = JSON.stringify(tree, ["id", 'key', 'name', 'message', 'value', 'arity', 'first', 'second', 'third', 'fourth'], 4);
	} catch (e) {
		string = JSON.stringify(e, ['name', 'message', 'from', 'to', 'key', 'value', 'arity', 'first', 'second', 'third', 'fourth'], 4);
	}
	minijs_print(string);
}

//minijs_go("var MiniJS_Parser = " + MiniJS_Parser.toSource() + ";");
//minijs_go(minijs_input());

function minijs_input() {
	return document.getElementById('minijs_input').value;
}

function minijs_parse() {
	minijs_go(minijs_input());
};

function minijs_prettyprint() {
	try {
		minijs_parser = new MiniJS.Parser();
		tree = minijs_parser.parse(minijs_input());
		minijs_print(MiniJS.PrettyPrintHTML(tree, 0));
	} catch (e) {
		console.log("Exception: ", e);
		
	}
};