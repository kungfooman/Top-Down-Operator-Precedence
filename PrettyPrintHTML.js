function PrettyPrintHTML(node, depth)
{
	var indent = "  ".repeat(depth);
	var tmp = "<div style='padding-left: 10px'>";
	
	if (typeof node == "undefined")
		return "node==undefined";
	
	switch (node.type) {
		case "call": {
			//tmp += ("" + node.type + "=" + node.name);
			tmp += (node.name);
			for (var i = 0; i < node.args.length; i++) {
				tmp += PrettyPrintHTML(node.args[i], depth + 1);
			}
			return tmp;
		}
		case "number": {
			//tmp += ("" + node.type + "=" + node.value);
			tmp += (node.value);
			return tmp;
		}
		case "+":
		case "-":
		case "*":
		case "/":
		case "%":
		case "^": {
			var tmp = "";
			
			tmp += ("<table>");
				tmp += ("<tr>");
					tmp += ("<td>");
			
						//tmp += "node.type=" + node.type;
						tmp += (node.type);
						
						tmp += ("<table>");
							tmp += ("<tr>");
								tmp += ("<td>");
								tmp += PrettyPrintHTML(node.left, depth + 1);
								tmp += ("<td>");
								tmp += PrettyPrintHTML(node.right, depth + 1);				
							tmp += ("</tr>");
						tmp += ("</table>");

					tmp += ("</td>");					
				tmp += ("</tr>");
			tmp += ("</table>");
			return tmp;
		}
		
		case "statements": {
			tmp += ("node.type=" + node.type + " node.value=" + node.value);
			
			tmp += ("<table>");
			
			for (var i = 0; i < node.statements.length; i++) {
				tmp += ("<tr>");
				tmp += ("<td>node.statements["+i+"]");
				tmp += ("<td>");
				//print((indent + "node.statement["+ i +"]:");
				tmp += PrettyPrintHTML(node.statements[i], depth + 1);
			}
			
			tmp += ("</table>");
			tmp += ("</tr>");
			return tmp;
		}
		
		default:
		
			return "default: " + node.type + "</div>";
		
			nonewline = function(msg) { return msg.replace(/\r\n/g, " ").replace(/\n/g, " "); }
			tmp = "";
			for (key in node) {
				if (key == "args" || key == "left" || key == "right" || key == "symbol") // will be printed separately
					continue;
				tmp += "<b style=color:red>node." + key + "</b>=<b style=color:red>" + node[key] + "</b> ";
			}
			//print((indent + nonewline(tmp));
			if (typeof node.symbol != "undefined") {
				//print((indent + "node.symbol:");
				
				tmp = "";
				for (key in node.symbol) {
					if (key == "args" || key == "left" || key == "right" || key == "symbol") // will be printed separately
						continue;
					tmp += "<b style=color:red>node." + key + "</b>=<b style=color:red>" + node[key] + "</b> ";
				}
				//print((indent + nonewline(tmp));
				
			}
			if (typeof node.left != "undefined") {
				//print((indent + "node.left:");
				PrettyPrintHTML(node.left, depth + 1);
			}
			if (typeof node.right != "undefined") {
				//print((indent + "node.right:");
				PrettyPrintHTML(node.right, depth + 1);
			}
			if (typeof node.args != "undefined") {
				//print((indent + "node.args:");
				for (var i = 0; i < node.args.length; i++) {
					PrettyPrintHTML(node.args[i], depth + 1);
				}
			}
			if (typeof node.statements != "undefined") {
				//print((indent + "node.statements:");
				for (var i = 0; i < node.statements.length; i++) {
					//print((indent + "node.statement["+ i +"]:");
					PrettyPrintHTML(node.statements[i], depth + 1);
				}
			}
			break;
	}
}