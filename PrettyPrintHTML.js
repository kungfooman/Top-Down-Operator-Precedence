function PrettyPrintHTML(node, depth)
{
	var indent = "  ".repeat(depth);
	var tmp = "";
	var add = function(str) { tmp += str; }
	var table = function() {
		tmp = "";
		add("<table>")
		for (var row in arguments) {
			add("<tr>")
			for (var col in arguments[row]) {
				add("<td>")
				add(arguments[row][col]);
				add("</td>")
			}
			add("</tr>")
		}
		add("</table>")
		return tmp;
	}	
	
	
	if (typeof node == "undefined")
		return "null";
	
	switch (node.type) {
		case "call": {
			//add("" + node.type + "=" + node.name);
			add(node.name + "(");
			
			add("<table>");
				for (var i = 0; i < node.args.length; i++) {
					add("<tr>");
						add("<td>");
							add("args["+i+"]");
						add("<td>");
							add(PrettyPrintHTML(node.args[i], depth + 1));
					add("</tr>");
				}
			add("</table>);");
			return tmp;
		}
		case "number": {
			//add("" + node.type + "=" + node.value);
			add(node.value);
			return tmp;
		}
		case "+":
		case "-":
		case "*":
		case "/":
		case "%":
		case "^": {
			table([
				node.type + table([
					PrettyPrintHTML(node.left, depth + 1),
					PrettyPrintHTML(node.right, depth + 1)
				])
			]);
			return tmp;
		}
		
		case "statements": {
			add("node.type=" + node.type + " node.value=" + node.value);
			
			add("<table>");
			
			for (var i = 0; i < node.statements.length; i++) {
				add("<tr>");
				add("<td>node.statements["+i+"]");
				add("<td>");
				//print((indent + "node.statement["+ i +"]:");
				add(PrettyPrintHTML(node.statements[i], depth + 1));
				add("</tr>");
			}
			
			add("</table>");
			return tmp;
		}
		
		default:
		
			return "default: " + node.type;
		
			nonewline = function(msg) { return msg.replace(/\r\n/g, " ").replace(/\n/g, " "); }
			tmp = "";
			for (key in node) {
				if (key == "args" || key == "left" || key == "right" || key == "symbol") // will be printed separately
					continue;
				add("<b style=color:red>node." + key + "</b>=<b style=color:red>" + node[key] + "</b> ");
			}
			//print((indent + nonewline(tmp));
			if (typeof node.symbol != "undefined") {
				//print((indent + "node.symbol:");
				
				tmp = "";
				for (key in node.symbol) {
					if (key == "args" || key == "left" || key == "right" || key == "symbol") // will be printed separately
						continue;
					add("<b style=color:red>node." + key + "</b>=<b style=color:red>" + node[key] + "</b> ");
				}
				//print((indent + nonewline(tmp));
				
			}
			break;
	}
}