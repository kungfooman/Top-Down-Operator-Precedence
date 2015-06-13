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
		minijs_parser = new MiniJS_Parser();
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
		minijs_parser = new MiniJS_Parser();
		tree = minijs_parser.parse(minijs_input());
		if (typeof tree.length != "undefined")
		{
			tree = {
				id: "statements",
				statements: tree			
			}
		}
		minijs_print(minijs_PrettyPrintHTML(tree, 0));
	} catch (e) {
		console.log("Exception: ", e);
		
	}
};

function minijs_PrettyPrintHTML(node, depth)
{
	var html = new HTML();

	if (typeof node == "undefined")
		return "null";

	// rewrite an array as statements-node
	if (typeof node.length != "undefined") {
		console.log(node)
		node = {
			id: "statements",
			statements: node
		}
	}
	
	switch (node.id) {
		case "statements": {
			html.table("class=prettyprinthtml");
			html.tr().td("statements", "colspan=2");
			for (var i = 0; i < node.statements.length; i++) {
				html.tr();
				//html.td("node.statements[" + i + "]");
				html.td("#" + i);
				html.td(minijs_PrettyPrintHTML(node.statements[i], depth + 1));
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
			html.td(minijs_PrettyPrintHTML(node.first, depth + 1));
			html.td(minijs_PrettyPrintHTML(node.second, depth + 1));
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
				html.td(minijs_PrettyPrintHTML(node.args[i], depth + 1));
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
			html.td(minijs_PrettyPrintHTML(node.second, depth + 1), "colspan=2");
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
			html.td(minijs_PrettyPrintHTML(node.first, depth + 1));
			return html.toString();
		}
		
		default:
			//console.log("default biatch");
			//return "default: " + node.value + " " + node.arity;
		
			html.add("<div style='text-align: left'>");
		
			nonewline = function(msg) { return msg.replace(/\r\n/g, " ").replace(/\n/g, " "); }
			
			for (key in node) {
				if (key == "args" || key == "left" || key == "right" || key == "symbol") // will be printed separately
					continue;
				html.add("<b>node." + key + "</b>=<b>" + node[key] + "</b> ");
			}
			//print((indent + nonewline(tmp));
			if (typeof node.symbol != "undefined") {
				//print((indent + "node.symbol:");
				
				for (key in node.symbol) {
					if (key == "args" || key == "left" || key == "right" || key == "symbol") // will be printed separately
						continue;
					html.add("<b>node." + key + "</b>=<b>" + node[key] + "</b> ");
				}
				//print((indent + nonewline(tmp));
				
			}
			html.add("</div>");
			
			return html.toString();
	}
}