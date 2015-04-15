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
var parse = function (tokens) {
	var symbols = {},
	symbol = function (id, tokenCallback, leftBindingPower, leftDenotation) {
		var sym = symbols[id] || {};
		symbols[id] = {
			leftBindingPower: sym.leftBindingPower || leftBindingPower,
			tokenCallback: sym.tokenCallback || tokenCallback,
			leftDenotation: sym.leftDenotation || leftDenotation
		};
	};

	var token2symbol = function (token) {
		var sym = Object.create(symbols[token.type]);
		sym.type = token.type;
		sym.value = token.value;
		return sym;
	};

	var i = 0, token = function () { return token2symbol(tokens[i]); };
	var advance = function () { i++; return token(); };

	var expression = function (rightBindingPower) {
		var left, t = token();
		advance();
		if (!t.tokenCallback)
			throw "Unexpected token: " + t.type;
		left = t.tokenCallback(t);
		while (rightBindingPower < token().leftBindingPower) {
			t = token();
			advance();
			if (!t.leftDenotation)
				throw "Unexpected token: " + t.type;
			left = t.leftDenotation(left);
		}
		return left;
	};

	var infix = function (id, leftBindingPower, rightBindingPower, leftDenotation) {
		rightBindingPower = rightBindingPower || leftBindingPower;
		symbol(id, null, leftBindingPower, leftDenotation || function (left) {
			return {
				type: id,
				left: left,
				right: expression(rightBindingPower)
			};
		});
	},
	prefix = function (id, rightBindingPower) {
		symbol(id, function () {
			return {
				type: id,
				right: expression(rightBindingPower)
			};
		});
	};


	symbol(",");
	symbol(")");
	symbol("(end)");

	symbol("number", function (number) {
		return number;
	});
	
	symbol("string", function (node) {
		console.log("symbol->string->node: ", node);
		node.nigga = "plz";
		return node;
	});
	
	symbol("foo", function(node) {
		node.type = "number";
		node.value = 100000000000000;
		console.log("Foo: ", node);
		return node;
	});
	
	symbol("identifier", function (name) {
		if (token().type === "(") {
			var args = [];
			if (tokens[i + 1].type === ")")
				advance();
			else {
				do {
					advance();
					args.push(expression(2));
				} while (token().type === ",");
				if (token().type !== ")")
					throw "Expected closing parenthesis ')'";
			}
			advance();
			return {
				type: "call",
				args: args,
				name: name.value
			};
		}
		return name;
	});

	symbol("(", function () {
		value = expression(2);
		if (token().type !== ")")
			throw "Expected closing parenthesis ')'";
		advance();
		return value;
	});

	prefix("-", 7);
	infix("^", 6, 5);
	infix("*", 4);
	infix("/", 4);
	infix("%", 4);
	infix("+", 3);
	infix("-", 3);

	infix("=", 1, 2, function (left) {
		if (left.type === "call") {
			for (var i = 0; i < left.args.length; i++) {
				if (left.args[i].type !== "identifier") throw "Invalid argument name";
			}
			return {
				type: "function",
				name: left.name,
				args: left.args,
				value: expression(2)
			};
		} else if (left.type === "identifier") {
			return {
				type: "assign",
				name: left.value,
				value: expression(2)
			};
		}
		else
			throw "Invalid lvalue";
	});

	var parseTree = [];
	while (token().type !== "(end)") {
		parseTree.push(expression(0));
	}
	return parseTree;
};