// Transform a token object into an exception object and throw it.
Object.prototype.error = function (message, t) {
	t = t || this;
	t.name = "SyntaxError";
	t.message = message;
	throw t;
};

var parser = new Parser();

function go(source) {
	var string, tree;
	try {
		tree = parser.parse(source);
		string = JSON.stringify(tree, ['key', 'name', 'message',
			'value', 'arity', 'first', 'second', 'third', 'fourth'], 4);
	} catch (e) {
		string = JSON.stringify(e, ['name', 'message', 'from', 'to', 'key',
				'value', 'arity', 'first', 'second', 'third', 'fourth'], 4);
	}
	document.getElementById('minijs_output').innerHTML = string
		.replace(/&/g, '&amp;')
		.replace(/[<]/g, '&lt;');
}

//go("var make_parse = " + make_parse.toSource() + ";");
go(input());

function input() {
	return document.getElementById('minijs_input').value;
}

document.getElementById('minijs_parse').onclick = function (e) {
	go(input());
};