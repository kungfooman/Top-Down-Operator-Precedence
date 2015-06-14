var Calc = new function() {
	var Interface = this.Interface = new function() {
		var print = this.print = function(msg) {
			document.getElementById("calc_output").innerHTML += msg + "\n";
		}
		var Clear = this.Clear = function() {
			document.getElementById("calc_output").innerHTML = "";
		}
		var getInput = this.getInput = function() {
			return document.getElementById("calc_input").value;
		}
		var getSelectedInput = this.getSelectedInput = function() {
			var textarea = document.getElementById("calc_input");
			var s = textarea.selectionStart;
			var e = textarea.selectionEnd;
			return textarea.value.substring(s,e);
		}
		var Calculate = this.Calculate = function() {
			var tokens = Lexer(getInput());
			//var parseTree = parse(tokens);
			calc_parser = new Parser(tokens);
			//calc_parser.infix = hookLog(calc_parser, calc_parser.infix, "infix");
			//calc_parser.expression = hookLog(calc_parser, calc_parser.expression, "expression");
			calc_parser.init();
			//comma = parser.symbols["="];
			//comma.infixCallback = hookLog(comma, comma.infixCallback, "Equal sign");
			calc_parser.parse();
			var output = evaluate(calc_parser.parseTree);
			print("\nStatement evaluations: \n" + output);
		}
		var PrettyPrint = this.PrettyPrint = function() {
			var tokens = Lexer(getInput());
			calc_parser = new Parser(tokens);
			calc_parser.init();
			calc_parser.parse();
			Calc.PrettyPrint(calc_parser.parseTree, 0);
		}
		var PrettyPrintSelection = this.PrettyPrintSelection = function() {
			var input = getSelectedInput();
			print("Selection: <div class=selection>" + input + "</div>");
			
			
			var tokens = Lexer(input);
			calc_parser = new Parser(tokens);
			calc_parser.init();
			calc_parser.parse();
			Calc.PrettyPrint(calc_parser.parseTree, 0);
		}
		var PrettyPrintHTML = this.PrettyPrintHTML = function() {
			var input = getInput();
			//print("Selection: <div class=selection>" + input + "</div>");
			
			
			var tokens = Lexer(input);
			calc_parser = new Parser(tokens);
			 
			calc_parser.init();
			calc_parser.parse();
			print(Calc.PrettyPrintHTML(calc_parser.parseTree, 0));
		}
		var TokenTable = this.TokenTable = function() {
			var input = getSelectedInput();
			print("Selection: <div class=selection>" + input + "</div>");
			//print("Selection: <div class=selection>" + input + "</div>");


			var tokens = Lexer(input);
			calc_parser = new Parser(tokens);
			calc_parser.init();
			//calc_parser.parse();
			//print(PrettyPrintHTML(calc_parser.parseTree, 0));

			print("Tokens: " + tokens.length)
		}
		var ParseStepSelection = this.ParseStepSelection = function() {
			var input = getInput();
			//print("Selection: <div class=selection>" + input + "</div>");
			var tokens = Lexer(input);
			calc_parser = new Parser(tokens);
			calc_parser.init();
			//calc_parser.parse();
			//print(PrettyPrintHTML(calc_parser.parseTree, 0));
			var html = new HTML().table().tr().td("type").td("value").td("lbp").td("inf<br>rbp").td("pre<br>rbp");
			for (i in tokens) {
				t = tokens[i];
				sym = calc_parser.symbols[t.type];
				if (sym == undefined) {
					console.log("Undefined symbol: ", t, t.type);
					continue;
				}
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
	} // namespace Interface
	
	var PrettyPrintHTML = this.PrettyPrintHTML = function(node, depth) {
		var html = new HTML();

		if (typeof node == "undefined")
			return "null";

		switch (node.type) {
			case "statements": {
				html.table("class=prettyprinthtml");
				for (var i = 0; i < node.statements.length; i++) {
					html.tr();
					//html.td("node.statements[" + i + "]");
					html.td("#" + i);
					html.td(PrettyPrintHTML(node.statements[i], depth + 1));
				}
				return html.toString();
			}
		
			case "number": {
				html.add(node.value);
				return html.toString();
			}
			case "+":
			case "-":
			case "*":
			case "/":
			case "%":
			case "^": {
				html.table("class=prettyprinthtml");
				html.tr();
				html.td(node.type, "colspan=2");
				html.tr();
				html.td(PrettyPrintHTML(node.left, depth + 1));
				html.td(PrettyPrintHTML(node.right, depth + 1));
				return html.toString();
			}

			case "assign": {
				html.table("class=prettyprinthtml");
				html.tr();
				html.td("=", "colspan=2");
				html.tr();
				html.td(node.name);
				html.td(PrettyPrintHTML(node.value, depth + 1));
				return html.toString();
			}
			
			case "call": {
				html.table("class=prettyprinthtml");
				html.tr();
				html.td("call");
				html.td(node.name);
				for (var i = 0; i < node.args.length; i++) {
					html.tr();
					html.td("args #" + i);
					html.td(PrettyPrintHTML(node.args[i], depth + 1));
				}
				return html.toString();
			}
			
			case "function": {
				html.table("class=prettyprinthtml");
				html.tr();
				html.td("function");
				html.td(node.name);
				for (var i = 0; i < node.args.length; i++) {
					html.tr();
					html.td("args #" + i);
					html.td(node.args[i].value);
				}
				html.tr();
				html.td(PrettyPrintHTML(node.value, depth + 1), "colspan=2");
				return html.toString();
			}
			
			case "identifier": {
				html.table("class=prettyprinthtml");
				html.tr();
				//html.td("name");
				html.td(node.value);
				return html.toString();
			}
			
			default:
			
				//return "default: " + node.type;
			
				html.add("<div style='text-align: left'>");
			
				nonewline = function(msg) { return msg.replace(/\r\n/g, " ").replace(/\n/g, " "); }
				
				for (key in node) {
					if (key == "args" || key == "left" || key == "right" || key == "symbol") // will be printed separately
						continue;
					html.add("<b>node." + key + "</b>=<b>" + node[key] + "</b> ");
				}
				//print((indent + nonewline(tmp));
				if (typeof node.symbol != "undefined") {
					//print((indent + "node.symbol:");
					
					for (key in node.symbol) {
						if (key == "args" || key == "left" || key == "right" || key == "symbol") // will be printed separately
							continue;
						html.add("<b>node." + key + "</b>=<b>" + node[key] + "</b> ");
					}
					//print((indent + nonewline(tmp));
					
				}
				html.add("</div>");
				
				return html.toString();
		}
	} // function PrettyPrintHTML
	
	
	var PrettyPrint = this.PrettyPrint = function(node, depth) {
		var indent = "PrettyPrint> " + "  ".repeat(depth);
		
		switch (node.type) {
			case "call_": {
				Interface.print(indent + "node.type=" + node.type + " node.name=" + node.name);
				for (var i = 0; i < node.args.length; i++) {
					PrettyPrint(node.args[i], depth + 1);
				}
				break;
			}
			case "number_": {
				Interface.print(indent + "node.type=" + node.type + " node.value=" + node.value);
				break;
			}
			
			default: {
				nonewline = function(msg) { return msg.replace(/\r\n/g, " ").replace(/\n/g, " "); }
				tmp = "";
				for (key in node) {
					if (key == "args" || key == "left" || key == "right" || key == "symbol") // will be Interface.printed separately
						continue;
					tmp += "<b class=prettyInterface.printtext>node." + key + "</b>=<b class=prettyInterface.printtext>" + node[key] + "</b> ";
				}
				Interface.print(indent + nonewline(tmp));
				if (typeof node.symbol != "undefined") {
					Interface.print(indent + "node.symbol:");
					
					tmp = "";
					for (key in node.symbol) {
						if (key == "args" || key == "left" || key == "right" || key == "symbol") // will be Interface.printed separately
							continue;
						tmp += "<b class=prettyInterface.printtext>node." + key + "</b>=<b class=prettyInterface.printtext>" + node[key] + "</b> ";
					}
					Interface.print(indent + nonewline(tmp));
					
				}
				if (typeof node.left != "undefined") {
					Interface.print(indent + "node.left:");
					PrettyPrint(node.left, depth + 1);
				}
				if (typeof node.right != "undefined") {
					Interface.print(indent + "node.right:");
					PrettyPrint(node.right, depth + 1);
				}
				if (typeof node.args != "undefined") {
					Interface.print(indent + "node.args:");
					for (var i = 0; i < node.args.length; i++) {
						PrettyPrint(node.args[i], depth + 1);
					}
				}
				if (typeof node.statements != "undefined") {
					Interface.print(indent + "node.statements:");
					for (var i = 0; i < node.statements.length; i++) {
						Interface.print(indent + "node.statement["+ i +"]:");
						PrettyPrint(node.statements[i], depth + 1);
					}
				}
				break;
			}
		}
	} // function PrettyPrint
	
	var Lexer = this.Lexer = function(input) {
		// PrettyPrinterLex(Lexer("\"test\""));
		function PrettyPrinterLex(tokens)
		{
			for (var i=0; i<tokens.length; i++)
			{
				t = tokens[i];
				print("token.type=" + t.type + " token.value=" + t.value);
			}
		}

		isOperator = function(c) { return /[+\-*\/\^%=(){},]/.test(c); }
		isDigit = function(c) { return /[0-9]/.test(c); }
		isWhiteSpace = function(c) { return /\s/.test(c); }
		isIdentifier = function(c) { return typeof c === "string" && !isOperator(c) && !isDigit(c) && !isWhiteSpace(c); }

		var tokens = [], c, i = 0;
		var advance = function () { return c = input[++i]; };
		var addToken = function (type, value) {
			tokens.push({
				type: type,
				value: value
			});
		};
		var charsLeft = function() { return i < input.length; }
		while (charsLeft()) {
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
			else if (c == "\"") {
				//print("start string...");
				var str = "";
				while (advance() != "\"" && charsLeft()) {
					//print("c="+c);
					str += c;
				}
				addToken("string", str);
				advance(); // eat last "
			}
			else if (isIdentifier(c)) {
				var idn = c;
				while (isIdentifier(advance())) idn += c;
				
				if (idn == "foo")
					addToken("foo");
				else
					addToken("identifier", idn);
			}
			else throw "Unrecognized token.";
		}
		addToken("(end)");
		return tokens;
	} // function Lexer
}