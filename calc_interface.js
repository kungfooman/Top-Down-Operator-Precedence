var calculate = function (input) {
	var tokens = lex(input);
	//var parseTree = parse(tokens);
	calc_parser = new Parser(tokens);
	
	//calc_parser.infix = hookLog(calc_parser, calc_parser.infix, "infix");
	//calc_parser.expression = hookLog(calc_parser, calc_parser.expression, "expression");

	calc_parser.init();

	//comma = parser.symbols["="];
	//comma.infixCallback = hookLog(comma, comma.infixCallback, "Equal sign");
	
	calc_parser.parse();
	var output = evaluate(calc_parser.parseTree);
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

function calc_calculate() {
	var output = calculate(getInput());
	print("\nStatement evaluations: \n" + output);
}
function calc_clear() {
	clear()
}
function calc_prettyprint() {
	var output = calculate(getInput());
	
	var tokens = lex(getInput());
	calc_parser = new Parser(tokens);
	calc_parser.init();
	calc_parser.parse();
	
	PrettyPrint(calc_parser.parseTree, 0);
}
function calc_prettyprintselection() {
	var input = getSelectedInput();
	print("Selection: <div class=selection>" + input + "</div>");
	
	var output = calculate(input);
	
	var tokens = lex(input);
	calc_parser = new Parser(tokens);
	calc_parser.init();
	calc_parser.parse();
	PrettyPrint(calc_parser.parseTree, 0);
}
function calc_prettyprinthtml() {
	var input = getInput();
	//print("Selection: <div class=selection>" + input + "</div>");
	
	//var output = calculate(input);
	
	var tokens = lex(input);
	calc_parser = new Parser(tokens);
	 
	calc_parser.init();
	calc_parser.parse();
	print(PrettyPrintHTML(calc_parser.parseTree, 0));
}
function calc_tokentable() {
	var input = getInput();
	//print("Selection: <div class=selection>" + input + "</div>");
	
	//var output = calculate(input);
	
	var tokens = lex(input);
	calc_parser = new Parser(tokens);
	calc_parser.init();
	//parser.parse();
	//print(PrettyPrintHTML(calc_parser.parseTree, 0));
	
	var html = new HTML().table().tr().td("type").td("value").td("lbp").td("inf<br>rbp").td("pre<br>rbp");
	for (i in tokens) {
		t = tokens[i];
		sym = calc_parser.symbols[t.type];
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
}
function calc_parsestepselection() {
	var input = getSelectedInput();
	print("Selection: <div class=selection>" + input + "</div>");
	//print("Selection: <div class=selection>" + input + "</div>");
	
	//var output = calculate(input);
	
	var tokens = lex(input);
	calc_parser = new Parser(tokens);
	calc_parser.init();
	//calc_parser.parse();
	//print(PrettyPrintHTML(calc_parser.parseTree, 0));
	
	print("Tokens: " + tokens.length)
}
