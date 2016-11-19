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
				minijs_parser = new MiniJS.Parser();
				tree = minijs_parser.parse(source);
				string = JSON.stringify(tree, ["id", 'key', 'name', 'message', 'value', 'arity', 'first', 'second', 'third', 'fourth', "statements"], 4);
			} catch (e) {
				string = JSON.stringify(e, ["id", 'key', 'name', 'message', 'value', 'arity', 'first', 'second', 'third', 'fourth', "statements"], 4);
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
				minijs_parser = new MiniJS.Parser();
				tree = minijs_parser.parse(input());
				print(MiniJS.prettyPrint(tree, 0));
			} catch (e) {
				console.log("Exception: ", e);
				
			}
		}

		var prettyPrintHTML = this.prettyPrintHTML = function() {
			scopes = []; // reset scopes
			try {
				minijs_parser = new MiniJS.Parser();
				tree = minijs_parser.parse(input());
				print(MiniJS.prettyPrintHTML(tree, 0));
			} catch (e) {
				console.log("Exception: ", e);
				
			}
		}

		var prettyPrintFull = this.prettyPrintFull = function() {
			scopes = []; // reset scopes
			try {
				minijs_parser = new MiniJS.Parser();
				tree = minijs_parser.parse(input());
				print(MiniJS.prettyPrintFull(tree, 0));
			} catch (e) {
				console.log("Exception: ", e);
				
			}
		}
	} // namespace Interface
	
	var Lexer = this.Lexer = function(input, prefix, suffix) {
		// Produce an array of simple token objects from a string.
		// A simple token object contains these members:
		//      type: 'name', 'string', 'number', 'operator'
		//      value: string or number value of the token
		//      from: index of first character of the token
		//      to: index of the last character + 1
		// Comments of the // type are ignored.
		// Operators are by default single characters. Multicharacter
		// operators can be made by supplying a string of prefix and
		// suffix characters.
		// characters. For example,
		//      '<>+-&', '=>&:'
		// will match any of these:
		//      <=  >>  >>>  <>  >=  +: -: &: &&: &&
		var c;                      // The current character.
		var from;                   // The index of the start of the token.
		var i = 0;                  // The index of the current character.
		var length = input.length;
		var n;                      // The number value.
		var q;                      // The quote character.
		var str;                    // The string value.
		var result = [];            // An array to hold the results.
		var make = function (type, value) {
			// Make a token object.
			return {
				type: type,
				value: value,
				from: from,
				to: i
			};
		};
		// Begin tokenization. If the source string is empty, return nothing.
		if (!input)
			return;
		// If prefix and suffix strings are not provided, supply defaults.
		if (typeof prefix !== 'string') {
			prefix = '<>+-&';
		}
		if (typeof suffix !== 'string') {
			suffix = '=>&:';
		}
		// Loop through this text, one character at a time.
		c = input.charAt(i);
		while (c) {
			from = i;
			// Ignore whitespace.
			if (c <= ' ') {
				i += 1;
				c = input.charAt(i);
			// name.
			} else if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
				str = c;
				i += 1;
				for (;;) {
					c = input.charAt(i);
					if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
							(c >= '0' && c <= '9') || c === '_') {
						str += c;
						i += 1;
					} else {
						break;
					}
				}
				result.push(make('name', str));
			// number.
			// A number cannot start with a decimal point. It must start with a digit, possibly '0'.
			} else if (c >= '0' && c <= '9') {
				str = c;
				i += 1;
				// Look for more digits.
				for (;;) {
					c = input.charAt(i);
					if (c < '0' || c > '9') {
						break;
					}
					i += 1;
					str += c;
				}
				// Look for a decimal fraction part.
				if (c === '.') {
					i += 1;
					str += c;
					for (;;) {
						c = input.charAt(i);
						if (c < '0' || c > '9') {
							break;
						}
						i += 1;
						str += c;
					}
				}
				// Look for an exponent part.
				if (c === 'e' || c === 'E') {
					i += 1;
					str += c;
					c = input.charAt(i);
					if (c === '-' || c === '+') {
						i += 1;
						str += c;
						c = input.charAt(i);
					}
					if (c < '0' || c > '9') {
						make('number', str).error("Bad exponent");
					}
					do {
						i += 1;
						str += c;
						c = input.charAt(i);
					} while (c >= '0' && c <= '9');
				}
				// Make sure the next character is not a letter.
				if (c >= 'a' && c <= 'z') {
					str += c;
					i += 1;
					make('number', str).error("Bad number");
				}
				// Convert the string value to a number. If it is finite, then it is a good token.
				n = +str;
				if (isFinite(n)) {
					result.push(make('number', n));
				} else {
					make('number', str).error("Bad number");
				}
			// string
			} else if (c === '\'' || c === '"') {
				str = '';
				q = c;
				i += 1;
				for (;;) {
					c = input.charAt(i);
					if (c < ' ') {
						make('string', str).error(c === '\n' || c === '\r' || c === '' ?
							"Unterminated string." :
							"Control character in string.", make('', str));
					}
					// Look for the closing quote.
					if (c === q) {
						break;
					}
					// Look for escapement.
					if (c === '\\') {
						i += 1;
						if (i >= length) {
							make('string', str).error("Unterminated string");
						}
						c = input.charAt(i);
						switch (c) {
						case 'b':
							c = '\b';
							break;
						case 'f':
							c = '\f';
							break;
						case 'n':
							c = '\n';
							break;
						case 'r':
							c = '\r';
							break;
						case 't':
							c = '\t';
							break;
						case 'u':
							if (i >= length) {
								make('string', str).error("Unterminated string");
							}
							c = parseInt(input.substr(i + 1, 4), 16);
							if (!isFinite(c) || c < 0) {
								make('string', str).error("Unterminated string");
							}
							c = String.fromCharCode(c);
							i += 4;
							break;
						}
					}
					str += c;
					i += 1;
				}
				i += 1;
				result.push(make('string', str));
				c = input.charAt(i);
			// comment.
			} else if (c === '/' && input.charAt(i + 1) === '/') {
				i += 1;
				for (;;) {
					c = input.charAt(i);
					if (c === '\n' || c === '\r' || c === '') {
						break;
					}
					i += 1;
				}
			// combining
			} else if (prefix.indexOf(c) >= 0) {
				str = c;
				i += 1;
				while (true) {
					c = input.charAt(i);
					if (i >= length || suffix.indexOf(c) < 0) {
						break;
					}
					str += c;
					i += 1;
				}
				result.push(make('operator', str));
			// single-character operator
			} else {
				i += 1;
				result.push(make('operator', c));
				c = input.charAt(i);
			}
		}
		this.result = result;
	} // function Lexer
	
	var Parser = this.Parser = function() {
		var scope;
		var symbol_table = {};
		var token;
		var tokens;
		var token_nr;
		
		this.eval = function(str) { return eval(str); }

		var itself = function () {
			return this;
		};

		var original_scope = {
			define: function (n) {
				var t = this.def[n.value];
				if (typeof t === "object") {
					n.error(t.reserved ? "Already reserved." : "Already defined.");
				}
				this.def[n.value] = n;
				n.reserved = false;
				n.symbolCallback      = itself;
				n.infixCallback      = null;
				n.std      = null;
				n.leftBindingPower      = 0;
				n.scope    = scope;
				return n;
			},
			find: function (n) {
				var e = this, o;
				while (true) {
					o = e.def[n];
					if (o && typeof o !== 'function') {
						return e.def[n];
					}
					e = e.parent;
					if (!e) {
						o = symbol_table[n];
						return o && typeof o !== 'function' ? o : symbol_table["(name)"];
					}
				}
			},
			pop: function () {
				scope = this.parent;
			},
			reserve: function (n) {
				if (n.arity !== "name" || n.reserved) {
					return;
				}
				var t = this.def[n.value];
				if (t) {
					if (t.reserved) {
						return;
					}
					if (t.arity === "name") {
						n.error("Already defined.");
					}
				}
				this.def[n.value] = n;
				n.reserved = true;
			}
		};

		var new_scope = function () {
			var s = scope;
			scope = Object.create(original_scope);
			scope.def = {};
			scope.parent = s;
			return scope;
		};

		var advance = function (id) {
			var a, o, t, v;
			if (id && token.id !== id) {
				token.error("Expected '" + id + "'.");
			}
			if (token_nr >= tokens.length) {
				token = symbol_table["(end)"];
				return;
			}
			t = tokens[token_nr];
			token_nr += 1;
			v = t.value;
			a = t.type;
			if (a === "name") {
				o = scope.find(v);
			} else if (a === "operator") {
				o = symbol_table[v];
				if (!o) {
					t.error("Unknown operator.");
				}
			} else if (a === "string" || a ===  "number") {
				o = symbol_table["(literal)"];
				a = "literal";
			} else {
				t.error("Unexpected token.");
			}
			token = Object.create(o);
			token.from  = t.from;
			token.to    = t.to;
			token.value = v;
			token.arity = a;
			return token;
		};

		var expression = function (rightBindingPower) {
			var left;
			var t = token;
			advance();
			left = t.symbolCallback();
			while (rightBindingPower < token.leftBindingPower) {
				t = token;
				advance();
				left = t.infixCallback(left);
			}
			return left;
		};

		var statement = function () {
			var n = token, v;

			if (n.std) {
				advance();
				scope.reserve(n);
				return n.std();
			}
			v = expression(0);
			if (!v.assignment && v.id !== "(") {
				v.error("Bad expression statement.");
			}
			advance(";");
			return v;
		};

		var statements = function () {
			var a = [], s;
			while (true) {
				if (token.id === "}" || token.id === "(end)") {
					break;
				}
				s = statement();
				if (s) {
					a.push(s);
				}
			}
			return a.length === 0 ? null : {
				id: "statements",
				statements: a
			};
		};

		var block = function () {
			var t = token;
			advance("{");
			return t.std();
		};

		var original_symbol = {
			symbolCallback: function () {
				this.error("Undefined.");
			},
			infixCallback: function (left) {
				this.error("Missing operator.");
			}
		};

		var symbol = function (id, bindingPower) {
			var s = symbol_table[id];
			bindingPower = bindingPower || 0;
			if (s) {
				if (bindingPower >= s.leftBindingPower) {
					s.leftBindingPower = bindingPower;
				}
			} else {
				s = Object.create(original_symbol);
				s.id = s.value = id;
				s.leftBindingPower = bindingPower;
				symbol_table[id] = s;
			}
			return s;
		};

		var constant = function (s, v) {
			var x = symbol(s);
			x.symbolCallback = function () {
				scope.reserve(this);
				this.value = symbol_table[this.id].value;
				this.arity = "literal";
				return this;
			};
			x.value = v;
			return x;
		};

		var infix = function (id, bindingPower, infixCallback) {
			var s = symbol(id, bindingPower);
			s.infixCallback = infixCallback || function (left) {
				this.first = left;
				this.second = expression(bindingPower);
				this.arity = "binary";
				return this;
			};
			return s;
		};

		var infixr = function (id, bindingPower, infixCallback) {
			var s = symbol(id, bindingPower);
			s.infixCallback = infixCallback || function (left) {
				this.first = left;
				this.second = expression(bindingPower - 1);
				this.arity = "binary";
				return this;
			};
			return s;
		};

		var assignment = function (id) {
			return infixr(id, 10, function (left) {
				if (left.id !== "." && left.id !== "[" && left.arity !== "name") {
					left.error("Bad lvalue.");
				}
				this.first = left;
				this.second = expression(9);
				this.assignment = true;
				this.arity = "binary";
				return this;
			});
		};

		var prefix = function (id, symbolCallback) {
			var s = symbol(id);
			s.symbolCallback = symbolCallback || function () {
				scope.reserve(this);
				this.first = expression(70);
				this.arity = "unary";
				return this;
			};
			return s;
		};

		var stmt = function (s, f) {
			var x = symbol(s);
			x.std = f;
			return x;
		};

		symbol("(end)");
		symbol("(name)");
		symbol(":");
		symbol(";");
		symbol(")");
		symbol("]");
		symbol("}");
		symbol(",");
		symbol("else");

		constant("true", true);
		constant("false", false);
		constant("null", null);
		constant("pi", 3.141592653589793);
		constant("Object", {});
		constant("Array", []);

		symbol("(literal)").symbolCallback = itself;

		symbol("this").symbolCallback = function () {
			scope.reserve(this);
			this.arity = "this";
			return this;
		};

		assignment("=");
		assignment("+=");
		assignment("-=");

		infix("?", 20, function (left) {
			this.first = left;
			this.second = expression(0);
			advance(":");
			this.third = expression(0);
			this.arity = "ternary";
			return this;
		});

		infixr("&&", 30);
		infixr("||", 30);

		infixr("===", 40);
		infixr("!==", 40);
		infixr("<", 40);
		infixr("<=", 40);
		infixr(">", 40);
		infixr(">=", 40);

		infix("+", 50);
		infix("-", 50);

		infix("*", 60);
		infix("/", 60);

		infix(".", 80, function (left) {
			this.first = left;
			if (token.arity !== "name") {
				token.error("Expected a property name.");
			}
			token.arity = "literal";
			this.second = token;
			this.arity = "binary";
			advance();
			return this;
		});

		infix("[", 80, function (left) {
			this.first = left;
			this.second = expression(0);
			this.arity = "binary";
			advance("]");
			return this;
		});

		infix("(", 80, function (left) {
			var a = [];
			if (left.id === "." || left.id === "[") {
				this.arity = "ternary";
				this.first = left.first;
				this.second = left.second;
				this.third = a;
			} else {
				this.arity = "binary";
				this.first = left;
				this.second = a;
				if ((left.arity !== "unary" || left.id !== "function") &&
						left.arity !== "name" && left.id !== "(" &&
						left.id !== "&&" && left.id !== "||" && left.id !== "?") {
					left.error("Expected a variable name.");
				}
			}
			if (token.id !== ")") {
				while (true) {
					a.push(expression(0));
					if (token.id !== ",") {
						break;
					}
					advance(",");
				}
			}
			advance(")");
			return this;
		});


		prefix("!");
		prefix("-");
		prefix("typeof");

		prefix("(", function () {
			var e = expression(0);
			advance(")");
			return e;
		});

		prefix("function", function () {
			var a = [];
			new_scope();
			if (token.arity === "name") {
				scope.define(token);
				this.name = token.value;
				advance();
			}
			advance("(");
			if (token.id !== ")") {
				while (true) {
					if (token.arity !== "name") {
						token.error("Expected a parameter name.");
					}
					scope.define(token);
					a.push(token);
					advance();
					if (token.id !== ",") {
						break;
					}
					advance(",");
				}
			}
			this.first = a;
			advance(")");
			advance("{");
			this.second = statements();
			advance("}");
			this.arity = "function";
			scope.pop();
			return this;
		});

		prefix("[", function () {
			var a = [];
			if (token.id !== "]") {
				while (true) {
					a.push(expression(0));
					if (token.id !== ",") {
						break;
					}
					advance(",");
				}
			}
			advance("]");
			this.first = a;
			this.arity = "unary";
			return this;
		});

		prefix("{", function () {
			var a = [], n, v;
			if (token.id !== "}") {
				while (true) {
					n = token;
					if (n.arity !== "name" && n.arity !== "literal") {
						token.error("Bad property name.");
					}
					advance();
					advance(":");
					v = expression(0);
					v.key = n.value;
					a.push(v);
					if (token.id !== ",") {
						break;
					}
					advance(",");
				}
			}
			advance("}");
			this.first = a;
			this.arity = "unary";
			return this;
		});


		stmt("{", function () {
			new_scope();
			var a = statements();
			advance("}");
			scope.pop();
			return a;
		});

		stmt("var", function () {
			var a = [], n, t;
			while (true) {
				n = token;
				if (n.arity !== "name") {
					n.error("Expected a new variable name.");
				}
				scope.define(n);
				advance();
				if (token.id === "=") {
					t = token;
					advance("=");
					t.first = n;
					t.second = expression(0);
					t.arity = "binary";
					a.push(t);
				}
				if (token.id !== ",") {
					break;
				}
				advance(",");
			}
			advance(";");
			return a.length === 0 ? null : a.length === 1 ? a[0] : a;
		});

		stmt("if", function () {
			advance("(");
			this.first = expression(0);
			advance(")");
			this.second = block();
			if (token.id === "else") {
				scope.reserve(token);
				advance("else");
				this.third = token.id === "if" ? statement() : block();
			} else {
				this.third = null;
			}
			this.arity = "statement";
			return this;
		});

		stmt("return", function () {
			if (token.id !== ";") {
				this.first = expression(0);
			}
			advance(";");
			if (token.id !== "}") {
				token.error("Unreachable statement.");
			}
			this.arity = "statement";
			return this;
		});

		stmt("break", function () {
			advance(";");
			if (token.id !== "}") {
				token.error("Unreachable statement.");
			}
			this.arity = "statement";
			return this;
		});

		stmt("while", function () {
			advance("(");
			this.first = expression(0);
			advance(")");
			this.second = block();
			this.arity = "statement";
			return this;
		});

		this.parse = function (source) {
			tokens = new Lexer(source, '=<>!+-*&|/%^', '=<>&|').result;
			token_nr = 0;
			new_scope();
			advance();
			var s = statements();
			advance("(end)");
			scope.pop();
			return s;
		};
	} // function Parser
	
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
