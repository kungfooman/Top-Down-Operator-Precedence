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
// .led     Left denotation			== leftDenotation
//  lbp     Left binding power		== leftBindingPower
//  rbp     Right binding power		== rightBindingPower
*/

//Object.prototype.getClass = function() { return this.constructor.name; }

function Symbol(parser, id, symbolCallback, leftBindingPower, leftDenotation) {
	var oldSymbol = parser.symbols[id];
	if (oldSymbol) {
		//console.log("Update: ", this.id, symbolCallback, leftBindingPower, leftDenotation);
		this.symbolCallback = this.symbolCallback || symbolCallback;
		this.leftBindingPower = this.leftBindingPower || leftBindingPower;
		this.leftDenotation = this.leftDenotation || leftDenotation;
		this.symbol = oldSymbol;
		return;
	}
	this.parser = parser;
	this.id = id;
	this.symbolCallback = symbolCallback || function(node) { throw "symbolCallback> unexpected token: " +  node.type};
	this.leftBindingPower = leftBindingPower;
	this.leftDenotation = leftDenotation || function(node) { throw "leftDenotation> unexpected token: " +  node.type};
	this.parser.symbols[id] = this;
	this.symbol = this;
	this.clazz = "Symbol";
}

function Parser(tokens_) {
	this.tokens = tokens_;
	this.symbols = {};
	this.symbol = function(id, symbolCallback, leftBindingPower, leftDenotation) {
		new Symbol(this, id, symbolCallback, leftBindingPower, leftDenotation).symbol;
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
			left = sym.leftDenotation(left);
		}
		return left;
	};

	this.infix = function (id, leftBindingPower, rightBindingPower, leftDenotation) {
		rightBindingPower = rightBindingPower || leftBindingPower;
		this.symbol(id, null, leftBindingPower, leftDenotation || function (left) {
			return {
				clazz_infix: "Node Infix",
				type: id,
				//left: {
				//	clazz_infix_left: "Infix Left",
				//	type: left.type,
				//	value: left.value,
				//	args: left.args,
				//},
				left: left,
				right: this.expression(rightBindingPower)
			};
		}.bind(this));
	};
	
	this.prefix = function (id, rightBindingPower) {
		this.symbol(id, function () {
			return {
				clazz_prefix: "Node Prefix",
				type: id,
				right: this.expression(rightBindingPower)
			};
		}.bind(this));
	};


	this.symbol(",");
	this.symbol(")");
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
		if (this.currentSymbol().type === "(") {
			var args = [];
			if (this.tokens[this.i + 1].type === ")")
				this.advanceSymbol();
			else {
				do {
					this.advanceSymbol();
					args.push(this.expression(2));
				} while (this.currentSymbol().type === ",");
				if (this.currentSymbol().type !== ")")
					throw "Expected closing parenthesis ')'";
			}
			this.advanceSymbol();
			return {
				clazz_identifier: "Node Identifier",
				type: "call",
				args: args,
				name: name.value
			};
		}
		return name;
	}.bind(this));

	this.symbol("(", function () {
		value = this.expression(2);
		if (this.currentSymbol().type !== ")")
			throw "Expected closing parenthesis ')'";
		this.advanceSymbol();
		return value;
	}.bind(this));

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
				value: this.expression(2)
			};
		} else if (left.type === "identifier") {
			return {
				type: "assign",
				name: left.value,
				value: this.expression(2)
			};
		}
		else
			throw "Invalid lvalue";
	}.bind(this));

	var statements = [];
	while (this.currentSymbol().type !== "(end)") {
		statements.push(this.expression(0));
	}
	this.parseTree = {
		type: "statements",
		statements: statements
	};
};