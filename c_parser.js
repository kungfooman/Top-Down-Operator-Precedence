

scopeid = 0;
Scope = function(parser) {
	this.id = scopeid++;
	this.def = {};

	//console.log("scope", this);

	this.parent = parser.scope;
	this.parser = parser;

	this.define = function (n) {
		//console.log("Define in scope: ", this.id, "n: ", n);
		var t = this.def[n.value];
		if (typeof t === "object") {
			n.error(t.reserved ? "Already reserved." : "Already defined.");
		}
		this.def[n.value] = n;
		n.reserved = false;
		//console.log("original.scope this is: ", this);
		n.symbolCallback      = this.parser.itself;
		n.infixCallback      = null;
		n.std      = null;
		n.leftBindingPower      = 0;
		n.scope    = this.parser.scope;
		return n;
	};
	this.find = function (n) {
		var e = this, o;
		while (true) {
			o = e.def[n];
			if (o && typeof o !== 'function') {
				return e.def[n];
			}
			e = e.parent;
			if (!e) {
				o = this.parser.symbol_table[n];
				return o && typeof o !== 'function' ? o : this.parser.symbol_table["(name)"];
			}
		}
	};
	this.pop = function () {
		this.parser.scope = this.parent;
	};
	this.push = function () {
		//this.parser.scope = this.parent;
		this.parser.scope = new Scope(this.parser);
	};
	this.reserve = function (n) {
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
	};
};


ParserJS = function() {
		var symbol_table = {};
		var token;
		var token_nr;

		this.eval = function(str) { return eval(str); }




		var itself = function () {
			//console.log("this of itself is: ", this); // original_symbol
			return this;
		};


		this.symbol_table = symbol_table;
		this.token = token;
		this.token_nr = token_nr;
		this.itself = itself;

		var parser = undefined;


		this.parse = function (source) {
			this.tokens = new LexerJS(source, '=<>!+-*&|/%^', '=<>&|').result;
			token_nr = 0;

			parser = this;

			this.scope = new Scope(this);

			//console.log("scope: ", scope);
			//console.log("this.scope: ", this.scope);
			//console.log("parser.scope: ", parser.scope);
			advance();
			var s = statements();
			advance("(end)");
			this.scope.pop();
			return s;
		};

		var advance = function (id) {
			var a, o, t, v;


			//console.log("advance id=", id);

			if (id && token.id !== id) {
				token.error("Expected '" + id + "', but got '"+token.id+"'");
			}
			if (token_nr >= parser.tokens.length) {
				token = symbol_table["(end)"];
				return;
			}
			t = parser.tokens[token_nr];
			token_nr += 1;
			v = t.value;
			a = t.type;
			if (a === "name") {
				o = parser.scope.find(v);
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
				parser.scope.reserve(n);
				return n.std();
			}
			v = expression(0);
			if (!v.assignment && v.id !== "(") {
				if (v.id !== "struct") {
					console.log("Bad expression, v.id is", v.id);
					v.error("Bad expression statement.");
				}
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

		function original_symbol(id, bindingPower) {
			this.id = this.value = id;
			this.leftBindingPower = bindingPower;

			this.symbolCallback = function () {
				this.error("Undefined.");
			};
			this.infixCallback = function (left) {
				this.error("Missing operator.");
			}
		};

		var symbol = function (id, bindingPower) {
			var s = symbol_table[id];
			bindingPower = bindingPower || 0;
			if (s) {
				if (bindingPower >= s.leftBindingPower) {
					console.log("if (bindingPower >= s.leftBindingPower) s=", s, "bindingPower=", bindingPower, " s.leftBindingPower=", s.leftBindingPower);
					s.leftBindingPower = bindingPower;
				}
			} else {
				//s = Object.create(original_symbol);
				s = new original_symbol(id, bindingPower);

				symbol_table[id] = s;
			}
			return s;
		};

		var constant = function (s, v) {
			var x = symbol(s);
			x.symbolCallback = function () {
				parser.scope.reserve(this);
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
				parser.scope.reserve(this);
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

		//symbol("struct");

		constant("true", true);
		constant("false", false);
		constant("null", null);
		constant("pi", 3.141592653589793);
		constant("Object", {});
		constant("Array", []);

		symbol("(literal)").symbolCallback = itself;

		symbol("this").symbolCallback = function () {
			parser.scope.reserve(this);
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
			parser.scope.push();
			if (token.arity === "name") {
				parser.scope.define(token);
				this.name = token.value;
				advance();
			}
			advance("(");
			if (token.id !== ")") {
				while (true) {
					if (token.arity !== "name") {
						token.error("Expected a parameter name.");
					}
					parser.scope.define(token);
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
			parser.scope.pop();
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




		stmt("int", function () {
			var a = [], n, t;


			function NodeType(type, name, is_pointer) {
				this.type = type;
				this.name = name;
				this.is_pointer = is_pointer;

			}

			console.log("ok do the int stuff");

			while (true) {
				n = token;

				// .arity="name" .id="int" .value="int"
				// .arity="name" .id="(name)" .value="muhahi"
				var type = token.value;

				advance();
				var name = token.value;

				advance(); // should be ";", but doesnt work as parameter


				console.log("Arity is: ", token);



				//advance(); // the }
				//advance(); // the ;
				console.log("Last Arity is: ", token);
				return new NodeType(type, name, 0);

				//if (n.arity !== "name") {
				//	n.error("Expected a new variable name.");
				//}

				console.log("Add new name to scope", n);
				parser.scope.define(n);
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
		prefix("struct", function () {
			var a = [];

			console.log("Struct name: ", token.id, token.value);

			// skip token.id=="(name)"
			advance();

			// skip {
			advance("{");

			if (token.id !== "}") {
				while (true) {

					var e = undefined;
					try {
						console.log("lets check what we got...", token);

						//throw "whatthefuck";
						type = token.std();
						a.push(type);
						console.log("Got type: ", type);

						//console.log("Got token 1:", token);
						//advance();
						//console.log("Got token 2:", token);

						//e = block();
					} catch (e) {
						console.log("Could not get expression", e, e.stack);
						break;
					}
					console.log("Expression: ", e);
					//a.push(e);
					if (token.id !== ",") {
						break;
					}
					advance(",");
				}
			}
			if (a.length == 0) {

				console.log("m8 that struct is empty :S");
			}

			advance(";"); // int foo";"
			advance("}");
			console.log("current token: ", token); // is ;

			this.first = a;
			this.arity = "unary";

			console.log("PREFIX struct: ", a);
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
			parser.scope.push();
			var a = statements();
			advance("}");
			parser.scope.pop();
			return a;
		});

		stmt("var", function () {
			var a = [], n, t;
			while (true) {
				n = token;
				if (n.arity !== "name") {
					n.error("Expected a new variable name.");
				}
				parser.scope.define(n);
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
				parser.scope.reserve(token);
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

		stmt("foowhile", function () {
			advance("(");
			this.first = expression(0);
			advance(")");
			this.second = block();
			this.arity = "statement";
			return this;
		});


	} // function Parser
