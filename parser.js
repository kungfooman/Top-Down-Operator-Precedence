/*
http://javascript.crockford.com/tdop/tdop.html
https://github.com/douglascrockford/JSLint/blob/master/jslint.js
// This is the heart of JSLINT, the Pratt parser. In addition to parsing, it
// is looking for ad hoc lint patterns. We add .fud to Pratt's model, which is
// like .nud except that it is only used on the first token of a statement.
// Having .fud makes it much easier to define statement-oriented languages like
// JavaScript. I retained Pratt's nomenclature.

// .nud     Null denotation			== tokenCallback
// .fud     First null denotation	== 
// .led     Left denotation			== leftDenotation
//  lbp     Left binding power		== leftBindingPower
//  rbp     Right binding power		== rightBindingPower
*/

function Symbol(parser, id, tokenCallback, leftBindingPower, leftDenotation) {
	var oldSymbol = parser.symbols[id];
	if (oldSymbol) {
		oldSymbol.Update(tokenCallback, leftBindingPower, leftDenotation);
		this.symbol = oldSymbol;
		return;
	}

	this.parser = parser;
	this.id = id;
	this.tokenCallback = tokenCallback;
	this.leftBindingPower = leftBindingPower;
	this.leftDenotation = leftDenotation;
	this.parser.symbols[id] = this;
	this.symbol = this;
	
	this.Update = function(tokenCallback, leftBindingPower, leftDenotation) {
		//console.log("Update: ", this.id, tokenCallback, leftBindingPower, leftDenotation);
		this.tokenCallback = this.tokenCallback || tokenCallback;
		this.leftBindingPower = this.leftBindingPower || leftBindingPower;
		this.leftDenotation = this.leftDenotation || leftDenotation;
	};
}

function Parser(tokens_) {
	this.tokens = tokens_;
	this.symbols = {};
	this.symbol = function(id, tokenCallback, leftBindingPower, leftDenotation) {
		new Symbol(this, id, tokenCallback, leftBindingPower, leftDenotation).symbol;
	};

	this.token2symbol = function(token) {
		var sym = Object.create(this.symbols[token.type]);
		sym.type = token.type;
		sym.value = token.value;
		return sym;
	};

	this.i = 0;
	this.token = function () { return this.token2symbol(this.tokens[this.i]); };
	this.advance = function () { this.i++; return this.token(); };

	this.expression = function (rightBindingPower) {
		var left, t = this.token();
		this.advance();
		if (!t.tokenCallback)
			throw "Unexpected token: " + t.type;
		left = t.tokenCallback(t);
		while (rightBindingPower < this.token().leftBindingPower) {
			t = this.token();
			this.advance();
			if (!t.leftDenotation)
				throw "Unexpected token: " + t.type;
			left = t.leftDenotation(left);
		}
		return left;
	};

	this.infix = function (id, leftBindingPower, rightBindingPower, leftDenotation) {
		rightBindingPower = rightBindingPower || leftBindingPower;
		this.symbol(id, null, leftBindingPower, leftDenotation || function (left) {
			return {
				type: id,
				left: left,
				right: this.expression(rightBindingPower)
			};
		}.bind(this));
	};
	
	this.prefix = function (id, rightBindingPower) {
		this.symbol(id, function () {
			return {
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
		if (this.token().type === "(") {
			var args = [];
			if (this.tokens[this.i + 1].type === ")")
				this.advance();
			else {
				do {
					this.advance();
					args.push(this.expression(2));
				} while (this.token().type === ",");
				if (this.token().type !== ")")
					throw "Expected closing parenthesis ')'";
			}
			this.advance();
			return {
				type: "call",
				args: args,
				name: name.value
			};
		}
		return name;
	}.bind(this));

	this.symbol("(", function () {
		value = this.expression(2);
		if (this.token().type !== ")")
			throw "Expected closing parenthesis ')'";
		this.advance();
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

	
	
	this.parseTree = [];
	while (this.token().type !== "(end)") {
		this.parseTree.push(this.expression(0));
	}
};