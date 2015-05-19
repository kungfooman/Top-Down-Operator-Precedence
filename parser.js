/*
http://javascript.crockford.com/tdop/tdop.html
https://github.com/douglascrockford/JSLint/blob/master/jslint.js
// This is the heart of JSLINT, the Pratt parser. In addition to parsing, it
// is looking for ad hoc lint patterns. We add .fud to Pratt's model, which is
// like .nud except that it is only used on the first token of a statement.
// Having .fud makes it much easier to define statement-oriented languages like
// JavaScript. I retained Pratt's nomenclature.

// .nud     Null denotation			== symbolCallback
// .fud     First null denotation	== 
// .led     Left denotation			== infixCallback
//  lbp     Left binding power		== leftBindingPower
//  rbp     Right binding power		== rightBindingPower
*/

//Object.prototype.getClass = function() { return this.constructor.name; }

// todo: make HTML canvas with visual parser debugging (well, mostly for learning)

function Symbol(parser, id, symbolCallback, leftBindingPower, infixCallback) {
	var oldSymbol = parser.symbols[id];
	if (oldSymbol) {
		//console.log("Update: ", this.id, symbolCallback, leftBindingPower, infixCallback);
		this.symbolCallback = this.symbolCallback || symbolCallback;
		this.leftBindingPower = this.leftBindingPower || leftBindingPower;
		this.infixCallback = this.infixCallback || infixCallback;
		this.symbol = oldSymbol;
		return;
	}
	this.parser = parser;
	this.id = id;
	this.symbolCallback = symbolCallback || function(node) { throw "symbolCallback> unexpected token: " +  node.type};
	this.leftBindingPower = leftBindingPower || 0;
	this.infixCallback = infixCallback || function(node) { throw "infixCallback> Missing Operator (unexpected token): " +  node.type};
	this.parser.symbols[id] = this;
	this.symbol = this;
	this.clazz = "Symbol";
}

function Parser(tokens_) {
	this.tokens = tokens_;
	this.symbols = {};
	this.symbol = function(id, symbolCallback, leftBindingPower, infixCallback) {
		new Symbol(this, id, symbolCallback, leftBindingPower, infixCallback).symbol;
	};

	this.token2symbol = function(token) {
		var sym = Object.create(this.symbols[token.type]);
		sym.type = token.type;
		sym.value = token.value;
		return sym;
	};

	this.i = 0;
	this.currentSymbol = function () { return this.token2symbol(this.tokens[this.i]); };
	this.advanceSymbol = function () { this.i++; return this.currentSymbol(); };

	this.expression = function (rightBindingPower) {
		var sym = this.currentSymbol();
		this.advanceSymbol();
		var left = sym.symbolCallback(sym);
		while (rightBindingPower < this.currentSymbol().leftBindingPower) {
			sym = this.currentSymbol();
			this.advanceSymbol();
			left = sym.infixCallback(left);
		}
		return left;
	};

	this.infix = function (id, leftBindingPower, rightBindingPower, infixCallback) {
		rightBindingPower = rightBindingPower || leftBindingPower;
		this.symbol(id, null, leftBindingPower, infixCallback || function (left) {
			return {
				clazz_infix: "Node Infix",
				type: this.closure_infix.id,
				//left: {
				//	clazz_infix_left: "Infix Left",
				//	type: left.type,
				//	value: left.value,
				//	args: left.args,
				//},
				left: left,
				right: this.parser.expression(this.closure_infix.rightBindingPower)
			};
		});
		
		// save closure scope stuff
		this.symbols[id].closure_infix = {
			id: id,
			leftBindingPower: leftBindingPower,
			rightBindingPower: rightBindingPower,
			infixCallback: infixCallback
		};
	};
	
	this.prefix = function (id, rightBindingPower) {
		this.symbol(id, function () {
			return {
				clazz_prefix: "Node Prefix",
				type: this.closure_prefix.id,
				right: this.parser.expression(this.closure_prefix.rightBindingPower)
			};
		});
		// save closure scope stuff
		this.symbols[id].closure_prefix = {
			id: id,
			rightBindingPower: rightBindingPower
		};
	};

	this.init = function() {
		this.symbol(",");
		this.symbol(")");
		this.symbol("}");
		this.symbol("(end)");

		this.symbol("number", function (number) {
			return number;
		});
		
		this.symbol("string", function (node) {
			console.log("symbol->string->node: ", node);
			node.nigga = "plz";
			return node;
		});
		
		this.symbol("foo", function (node) {
			node.type = "number";
			node.value = 100000000000000;
			console.log("Foo: ", node);
			return node;
		});
		
		this.symbol("identifier", function (name) {
			var parser = this.parser;
			if (parser.currentSymbol().type === "(") {
				var args = [];
				if (parser.tokens[parser.i + 1].type === ")")
					parser.advanceSymbol();
				else {
					do {
						parser.advanceSymbol();
						args.push(parser.expression(2));
					} while (parser.currentSymbol().type === ",");
					if (parser.currentSymbol().type !== ")")
						throw "Expected closing parenthesis ')'";
				}
				parser.advanceSymbol();
				return {
					clazz_identifier: "Node Identifier",
					type: "call",
					args: args,
					name: name.value
				};
			}
			return name;
		});

		this.symbol("(", function () {
			var parser = this.parser;
			value = parser.expression(2);
			if (parser.currentSymbol().type !== ")")
				throw "Expected closing parenthesis ')'";
			parser.advanceSymbol();
			return value;
		});
		
		this.symbol("{", function () {
			var parser = this.parser;
			value = parser.expression(2);
			if (parser.currentSymbol().type !== ")")
				throw "Expected closing parenthesis ')'";
			parser.advanceSymbol();
			return value;
		});

		this.prefix("-", 7);
		this.infix("^", 6, 5);
		this.infix("*", 4);
		this.infix("/", 4);
		this.infix("%", 4);
		this.infix("+", 3);
		this.infix("-", 3);

		this.infix("=", 1, 2, function (left) {
			if (left.type === "call") {
				for (var j = 0; j < left.args.length; j++) {
					if (left.args[j].type !== "identifier")
						throw "Invalid argument name";
				}
				return {
					type: "function",
					name: left.name,
					args: left.args,
					value: this.parser.expression(2)
				};
			} else if (left.type === "identifier") {
				return {
					type: "assign",
					name: left.value,
					value: this.parser.expression(2)
				};
			}
			else
				throw "Invalid lvalue";
		});
	}
	
	this.parse = function() {
	
		var statements = [];
		while (this.currentSymbol().type !== "(end)") {
			statements.push(this.expression(0));
		}
		this.parseTree = {
			type: "statements",
			statements: statements
		};
		return this.parseTree;
	}
};