// Transform a token object into an exception object and throw it.
Object.prototype.error = function (message, t) {
	t = t || this;
	t.name = "SyntaxError";
	t.message = message;
	throw t;
};

// A bit shitty, because in prettyPrint the data is only "text",
// so we need some text-ID to point to reaccess the scope later.
// Need to convert it to HTML and use jQuery e.g. later.
scopes = [];
scopesOnclick = function(id) {
	console.log("Scope: ", scopes[id]);
}

var MiniJS = new function() {

	var Interface = this.Interface = new function() {
		var print = this.print = function(string) {
			document.getElementById('minijs_output').innerHTML += string;
		}
		var clear = this.clear = function() {
			document.getElementById('minijs_output').innerHTML = "";
		}
		var input = this.input = function() {
			return document.getElementById('minijs_input').value;
		}

		var go = this.go = function(source) {
			var string, tree;
			try {
				minijs_parser = new ParserJS();
				tree = minijs_parser.parse(source);
				string = JSON.stringify(tree, ["id", 'key', 'name', 'message', 'value', 'arity', 'first', 'second', 'third', 'fourth', "statements", "type", "is_pointer"], 4);
			} catch (e) {
				string = JSON.stringify(e, ["id", 'key', 'name', 'message', 'value', 'arity', 'first', 'second', 'third', 'fourth', "statements", "type", "is_pointer"], 4);
			}
			print(string);
		}

		var parseToJSON = this.parseToJSON = function() {
			//minijs_go("var MiniJS_Parser = " + MiniJS_Parser.toSource() + ";");
			go(input());
		}

		var prettyPrint = this.prettyPrint = function() {
			scopes = []; // reset scopes
			try {
				minijs_parser = new ParserJS();
				tree = minijs_parser.parse(input());
				print(MiniJS.prettyPrint(tree, 0));
			} catch (e) {
				console.log("Exception: ", e.stack);
				console.log("Exception: ", e);

			}
		}

		var prettyPrintHTML = this.prettyPrintHTML = function() {
			scopes = []; // reset scopes
			try {
				minijs_parser = new ParserJS();
				tree = minijs_parser.parse(input());
				print(MiniJS.prettyPrintHTML(tree, 0));
			} catch (e) {
				console.log("Exception: ", e.stack);
				console.log("Exception: ", e);

			}
		}

		var prettyPrintFull = this.prettyPrintFull = function() {
			scopes = []; // reset scopes
			try {
				minijs_parser = new ParserJS();
				tree = minijs_parser.parse(input());
				print(MiniJS.prettyPrintFull(tree, 0));
			} catch (e) {
				console.log("Exception: ", e.stack);
				console.log("Exception: ", e);

			}
		}
	} // namespace Interface

	var Lexer = this.Lexer = LexerJS;
	var Parser = this.Parser = ParserJS;

	var prettyPrintHTML = this.prettyPrintHTML = function(node, depth)
	{
		var html = new HTML();

		if (typeof node == "undefined")
			return "null";

		switch (node.id) {
			case "statements": {
				html.table("class=prettyprinthtml");
				html.tr().td("statements", "colspan=2");
				for (var i = 0; i < node.statements.length; i++) {
					html.tr();
					//html.td("node.statements[" + i + "]");
					html.td("#" + i);
					html.td(prettyPrintHTML(node.statements[i], depth + 1));
				}
				return html.toString();
			}

			case "(literal)":
			case "(name)": {
				return node.value;
			}

			case "+":
			case "-":
			case "*":
			case "/":
			case "%":
			case "^":
			case "=":
			case "while": {
				html.table("class=prettyprinthtml");
				html.tr();
				html.td(node.value, "colspan=2");
				html.tr();
				html.td(prettyPrintHTML(node.first, depth + 1));
				html.td(prettyPrintHTML(node.second, depth + 1));
				return html.toString();
			}

			case "call": {
				html.table("class=prettyprinthtml");
				html.tr();
				html.td("call");
				html.td(node.id);
				for (var i = 0; i < node.args.length; i++) {
					html.tr();
					html.td("args #" + i);
					html.td(prettyPrintHTML(node.args[i], depth + 1));
				}
				return html.toString();
			}

			case "function": {
				html.table("class=prettyprinthtml");
				html.tr();
				//html.td("function");
				html.td(node.id, "colspan=2");
				for (var i = 0; i < node.first.length; i++) {
					html.tr();
					html.td("args #" + i);
					html.td(node.first[i].value);
				}
				html.tr();
				html.td(prettyPrintHTML(node.second, depth + 1), "colspan=2");
				return html.toString();
			}

			case "identifier": {
				html.table("class=prettyprinthtml");
				html.tr();
				//html.td("name");
				html.td(node.value);
				return html.toString();
			}
			case "return": {
				html.table("class=prettyprinthtml");
				html.tr();
				html.td("return");
				html.tr();
				html.td(prettyPrintHTML(node.first, depth + 1));
				return html.toString();
			}

			default:
				return prettyPrint(node, 0);
		}
	} // function HTMLPrettyPrint

	var prettyPrint = this.prettyPrint = function(node, depth) {


		if (typeof node == "undefined")
			return "null";

		var indent = "\nPrettyPrint> " + "  ".repeat(depth);
		var txt = "\n";

		if (typeof node.length != "undefined") {
			for (var i=0; i<node.length; i++)
			{
				txt += (indent + "array[" + i + "]: " + "\n");
				txt += (prettyPrint(node[i], depth + 1));
			}
			return txt;
		}

		// possible types: number, string, object, function, ...?
		beautifyKey = function(key, value) {
			if (typeof value == "function") {
				var tmp = value.toString().replace(/\r\n/g, " ").replace(/\n/g, " ").replace(/\t/g, " ").replace(/  /g, " ");
				return tmp.substring(0,tmp.indexOf(")") + 1);
			}
			if (typeof value == "string")
				value = value.replace(/\r\n/g, " ").replace(/\n/g, " ");
			if (key == "scope") {
				scopes.push(value);
				value = "<button onclick='scopesOnclick(" + (scopes.length - 1) + ")'>SCOPE</button>";
			}
			return value;
		}

		txt += indent;
		for (key in node) {
			if (key == "statements" || key == "first" || key == "second" || key == "third" || key == "fourth") // will be printed separately
				continue;
			txt += ("<b class=prettyprint_key>node." + key + "</b>=<b class=prettyprint_value>" + beautifyKey(key, node[key]) + "</b> ");
		}

		if (typeof node.first != "undefined")
			txt += (indent + "node.first: "  + prettyPrint(node.first,  depth + 1) + "\n");
		if (typeof node.second != "undefined")
			txt += (indent + "node.second: " + prettyPrint(node.second, depth + 1) + "\n");
		if (typeof node.third != "undefined")
			txt += (indent + "node.third: "  + prettyPrint(node.third,  depth + 1) + "\n");
		if (typeof node.fourth != "undefined")
			txt += (indent + "node.fourth: " + prettyPrint(node.fourth, depth + 1) + "\n");

		if (typeof node.statements  != "undefined")
			txt += (indent + "node.statements: " + prettyPrint(node.statements , depth + 1) + "\n");

		// add as many fucking newlines as you want, here we gonna replace successive ones with a single one
		txt = "\n" + txt + "\n";
		if (depth == 0)
			txt = "<div style='text-align: left'><pre>" + txt.replace(/\n+/g, "\n");
		return txt;
	}
	var prettyPrintFull = this.prettyPrintFull = function(node, depth, prefix) {
		if (typeof prefix == "undefined")
			prefix = "";

		if (typeof node == "undefined")
			return "null";

		var indent = "\nPrettyPrint> " + "  ".repeat(depth);
		var txt = "\n";

		if (typeof node.length != "undefined") {
			for (var i=0; i<node.length; i++)
			{
				txt += (indent + "array[" + i + "]: " + "\n");
				txt += (prettyPrintFull(node[i], depth + 1));
			}
			return txt;
		}

		// possible types: number, string, object, function, ...?
		beautifyKey = function(key, value) {
			if (typeof value == "function") {
				var tmp = value.toString().replace(/\r\n/g, " ").replace(/\n/g, " ").replace(/\t/g, " ").replace(/  /g, " ");
				return tmp.substring(0,tmp.indexOf(")") + 1);
			}
			if (typeof value == "string")
				value = value.replace(/\r\n/g, " ").replace(/\n/g, " ");
			if (key == "scope") {
				scopes.push(value);
				value = "<button onclick='scopesOnclick(" + (scopes.length - 1) + ")'>SCOPE</button>";
			}
			return value;
		}

		txt += indent;
		for (key in node) {
			if (key == "statements" || key == "first" || key == "second" || key == "third" || key == "fourth") // will be printed separately
				continue;
			txt += ("<b class=prettyprint_key>node." + key + "</b>=<b class=prettyprint_value>" + beautifyKey(key, node[key]) + "</b> ");
		}

		if (typeof node.first != "undefined")
			txt += (indent + "node.first: "  + prettyPrintFull(node.first,  depth + 1) + "\n");
		if (typeof node.second != "undefined")
			txt += (indent + "node.second: " + prettyPrintFull(node.second, depth + 1) + "\n");
		if (typeof node.third != "undefined")
			txt += (indent + "node.third: "  + prettyPrintFull(node.third,  depth + 1) + "\n");
		if (typeof node.fourth != "undefined")
			txt += (indent + "node.fourth: " + prettyPrintFull(node.fourth, depth + 1) + "\n");

		if (typeof node.statements  != "undefined")
			txt += (indent + "node.statements: " + prettyPrintFull(node.statements , depth + 1) + "\n");

		// add as many fucking newlines as you want, here we gonna replace successive ones with a single one
		txt = "\n" + txt + "\n";
		if (depth == 0)
			txt = "<div style='text-align: left'><pre>" + txt.replace(/\n+/g, "\n");
		return txt;
	}
};
