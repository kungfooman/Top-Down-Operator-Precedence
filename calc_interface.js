var calculate = function (input) {
	var tokens = lex(input);
	//var parseTree = parse(tokens);
	parser = new Parser(tokens);
	
	parser.infix = hookLog(parser, parser.infix, "infix");
	parser.expression = hookLog(parser, parser.expression, "expression");

	parser.init();

	comma = parser.symbols["="];
	comma.infixCallback = hookLog(comma, comma.infixCallback, "Equal sign");
	
	parser.parse();
	var output = evaluate(parser.parseTree);
	return output;
};

function clear() {
	document.getElementById("output").innerHTML = "";
}
function print(msg) {
	document.getElementById("output").innerHTML += msg + "\n";
}

function getInput() {
	return document.getElementById("calc_input").value;
}
function getSelectedInput() {
	var textarea = document.getElementById("calc_input");
	var s = textarea.selectionStart;
	var e = textarea.selectionEnd;
	return textarea.value.substring(s,e);
}

document.getElementById("calculate").onclick = function () {
	output = calculate(getInput());
	print("\nStatement evaluations: \n" + output);
};
document.getElementById("clear").onclick = function () {
	clear()
};
document.getElementById("prettyprint").onclick = function () {
	output = calculate(getInput());
	
	var tokens = lex(getInput());
	parser = new Parser(tokens);
	parser.init();
	parser.parse();
	
	PrettyPrint(parser.parseTree, 0);
};
document.getElementById("prettyprintselection").onclick = function () {
	var input = getSelectedInput();
	print("Selection: <div class=selection>" + input + "</div>");
	
	output = calculate(input);
	
	var tokens = lex(input);
	parser = new Parser(tokens);
	parser.init();
	parser.parse();
	PrettyPrint(parser.parseTree, 0);
};
document.getElementById("prettyprinthtml").onclick = function () {
	var input = getInput();
	//print("Selection: <div class=selection>" + input + "</div>");
	
	//output = calculate(input);
	
	var tokens = lex(input);
	parser = new Parser(tokens);
	parser.init();
	parser.parse();
	print(PrettyPrintHTML(parser.parseTree, 0));
};
document.getElementById("tokentable").onclick = function () {
	var input = getInput();
	//print("Selection: <div class=selection>" + input + "</div>");
	
	//output = calculate(input);
	
	var tokens = lex(input);
	parser = new Parser(tokens);
	parser.init();
	//parser.parse();
	//print(PrettyPrintHTML(parser.parseTree, 0));
	
	var html = new HTML().table().tr().td("type").td("value").td("lbp").td("inf<br>rbp").td("pre<br>rbp");
	for (i in tokens) {
		t = tokens[i];
		sym = parser.symbols[t.type];
		html.tr();
		html.td(t.type);
		html.td(t.value || "");
		html.td(sym.leftBindingPower);
		if (sym.closure_infix)
			html.td(sym.closure_infix.rightBindingPower);
		else
			html.td("");
		if (sym.closure_prefix)
			html.td(sym.closure_prefix.rightBindingPower);
		else
			html.td("");
	}
	print(html.source);
};
document.getElementById("parsestepselection").onclick = function () {
	var input = getSelectedInput();
	print("Selection: <div class=selection>" + input + "</div>");
	//print("Selection: <div class=selection>" + input + "</div>");
	
	//output = calculate(input);
	
	var tokens = lex(input);
	parser = new Parser(tokens);
	parser.init();
	//parser.parse();
	//print(PrettyPrintHTML(parser.parseTree, 0));
	
	print("Tokens: " + tokens.length)
};
