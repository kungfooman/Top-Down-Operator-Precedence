var lex = function (input) {
	var isOperator = function (c) { return /[+\-*\/\^%=(),]/.test(c); },
		isDigit = function (c) { return /[0-9]/.test(c); },
		isWhiteSpace = function (c) { return /\s/.test(c); },
		isIdentifier = function (c) { return typeof c === "string" && !isOperator(c) && !isDigit(c) && !isWhiteSpace(c); };

	var tokens = [], c, i = 0;
	var advance = function () { return c = input[++i]; };
	var addToken = function (type, value) {
		tokens.push({
			type: type,
			value: value
		});
	};
	while (i < input.length) {
		c = input[i];
		if (isWhiteSpace(c)) advance();
		else if (isOperator(c)) {
			addToken(c);
			advance();
		}
		else if (isDigit(c)) {
			var num = c;
			while (isDigit(advance())) num += c;
			if (c === ".") {
				do num += c; while (isDigit(advance()));
			}
			num = parseFloat(num);
			if (!isFinite(num)) throw "Number is too large or too small for a 64-bit double.";
			addToken("number", num);
		}
		else if (isIdentifier(c)) {
			var idn = c;
			while (isIdentifier(advance())) idn += c;
			addToken("identifier", idn);
		}
		else throw "Unrecognized token.";
	}
	addToken("(end)");
	return tokens;
};