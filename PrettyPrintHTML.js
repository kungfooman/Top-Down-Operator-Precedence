function PrettyPrintHTML(node, depth)
{
	var html = new HTML();

	if (typeof node == "undefined")
		return "null";

	switch (node.type) {
		case "call": {
			//add("" + node.type + "=" + node.name);
			html.add(node.name + "(");
			html.table("class=prettyprinthtml");
			for (var i = 0; i < node.args.length; i++) {
				html.tr();
				html.td("args["+i+"]");
				html.td(PrettyPrintHTML(node.args[i], depth + 1));
			}
			return html.toString();
		}
		case "number": {
			//html.add("" + node.type + "=" + node.value);
			html.add(node.value);
			return html.toString();
		}
		case "+":
		case "-":
		case "*":
		case "/":
		case "%":
		case "^": {
			html.add(
				table([
					node.type + table([
						PrettyPrintHTML(node.left, depth + 1),
						PrettyPrintHTML(node.right, depth + 1)
					])
				])
			);
			return html.toString();
		}
		
		case "statements": {
			html.table("class=prettyprinthtml");
			//html.add("node.type=" + node.type + " node.value=" + node.value);
			for (var i = 0; i < node.statements.length; i++) {
				html.tr();
				//html.td("node.statements[" + i + "]");
				html.td("#" + i);
				html.td(PrettyPrintHTML(node.statements[i], depth + 1));
			}
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
}