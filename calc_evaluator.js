var evaluate = function (parseTree) {

	var operators = {
		"+": function (a, b) { return a + b; },
		"-": function (a, b) {
			if (typeof b === "undefined") return -a;
			return a - b;
		},
		"*": function (a, b) { return a * b; },
		"/": function (a, b) { return a / b; },
		"%": function (a, b) { return a % b; },
		"^": function (a, b) { return Math.pow(a, b); }
	};

	var variables = {
		pi: Math.PI,
		e: Math.E
	};

	var functions = {
		sin: Math.sin,
		cos: Math.cos,
		tan: Math.cos,
		asin: Math.asin,
		acos: Math.acos,
		atan: Math.atan,
		abs: Math.abs,
		round: Math.round,
		ceil: Math.ceil,
		floor: Math.floor,
		log: Math.log,
		exp: Math.exp,
		sqrt: Math.sqrt,
		max: Math.max,
		min: Math.min,
		random: Math.random
	};
	var args = {
	};

	var parseNode = function (node) {
		if (node.type === "number") return node.value;
		else if (node.type === "string") {
			return node.value;
		}
		else if (operators[node.type]) {
			if (node.left) return operators[node.type](parseNode(node.left), parseNode(node.right));
			return operators[node.type](parseNode(node.right));
		}
		else if (node.type === "identifier") {
			var value = args.hasOwnProperty(node.value) ? args[node.value] : variables[node.value];
			if (typeof value === "undefined") throw node.value + " is undefined";
			return value;
		}
		else if (node.type === "assign") {
			variables[node.name] = parseNode(node.value);
		}
		else if (node.type === "call") {
			if (node.name == "PrettyPrint")
			{
				//console.log("Some prettyprinter....")
				PrettyPrint(node, 0);
				return 1;
			}
			for (var i = 0; i < node.args.length; i++)
				node.args[i] = parseNode(node.args[i]);
			return functions[node.name].apply(null, node.args);
		}
		else if (node.type === "function") {
			functions[node.name] = function () {
				for (var i = 0; i < node.args.length; i++) {
					args[node.args[i].value] = arguments[i];
				}
				var ret = parseNode(node.value);
				args = {};
				return ret;
			};
		}
	};

	var output = "";
	for (var i = 0; i < parseTree.statements.length; i++) {
		var value = parseNode(parseTree.statements[i]);
		if (typeof value !== "undefined") output += value + "\n";
	}
	return output;
};

function PrettyPrint(node, depth)
{
	var indent = "PrettyPrint> " + "  ".repeat(depth);
	
	switch (node.type) {
		case "call_": {
			print(indent + "node.type=" + node.type + " node.name=" + node.name);
			for (var i = 0; i < node.args.length; i++) {
				PrettyPrint(node.args[i], depth + 1);
			}
			break;
		}
		case "number_": {
			print(indent + "node.type=" + node.type + " node.value=" + node.value);
			break;
		}
		
		default:
			nonewline = function(msg) { return msg.replace(/\r\n/g, " ").replace(/\n/g, " "); }
			tmp = "";
			for (key in node) {
				if (key == "args" || key == "left" || key == "right" || key == "symbol") // will be printed separately
					continue;
				tmp += "<b class=prettyprinttext>node." + key + "</b>=<b class=prettyprinttext>" + node[key] + "</b> ";
			}
			print(indent + nonewline(tmp));
			if (typeof node.symbol != "undefined") {
				print(indent + "node.symbol:");
				
				tmp = "";
				for (key in node.symbol) {
					if (key == "args" || key == "left" || key == "right" || key == "symbol") // will be printed separately
						continue;
					tmp += "<b class=prettyprinttext>node." + key + "</b>=<b class=prettyprinttext>" + node[key] + "</b> ";
				}
				print(indent + nonewline(tmp));
				
			}
			if (typeof node.left != "undefined") {
				print(indent + "node.left:");
				PrettyPrint(node.left, depth + 1);
			}
			if (typeof node.right != "undefined") {
				print(indent + "node.right:");
				PrettyPrint(node.right, depth + 1);
			}
			if (typeof node.args != "undefined") {
				print(indent + "node.args:");
				for (var i = 0; i < node.args.length; i++) {
					PrettyPrint(node.args[i], depth + 1);
				}
			}
			if (typeof node.statements != "undefined") {
				print(indent + "node.statements:");
				for (var i = 0; i < node.statements.length; i++) {
					print(indent + "node.statement["+ i +"]:");
					PrettyPrint(node.statements[i], depth + 1);
				}
			}
			break;
	}
}