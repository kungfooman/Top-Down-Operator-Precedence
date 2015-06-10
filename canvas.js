var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

function line(from_left, from_top, to_left, to_top) {
	context.beginPath();
	context.moveTo(from_left, from_top);
	context.lineTo(to_left, to_top);
	context.stroke();
}

function text(text, pos_left, pos_top) {
	console.log(arguments)
	context.font = '20pt Calibri';
	context.fillStyle = 'blue';
	context.fillText(text, pos_left, pos_top);
	pos_top += 50;
}

var pos_left, pos_top;
function PrettyPaint(node, depth)
{	
	switch (node.type) {
		case "call_": {
			print("node.type=" + node.type + " node.name=" + node.name);
			for (var i = 0; i < node.args.length; i++) {
				PrettyPaint(node.args[i], depth + 1);
			}
			break;
		}
		case "number_": {
			print("node.type=" + node.type + " node.value=" + node.value);
			break;
		}
		
		default:
			nonewline = function(msg) { return msg.replace(/\r\n/g, " ").replace(/\n/g, " "); }
			tmp = "";
			for (key in node) {
				if (key == "args" || key == "pos_left" || key == "right" || key == "symbol") // will be printed separately
					continue;
				tmp += "node." + key + "=" + node[key] + " ";
			}
			text(nonewline(tmp), pos_left, pos_top);
			if (typeof node.symbol != "undefined") {
				text("node.symbol:", pos_left, pos_top);
				
				tmp = "";
				for (key in node.symbol) {
					if (key == "args" || key == "pos_left" || key == "right" || key == "symbol") // will be printed separately
						continue;
					tmp += "node." + key + "=" + node[key] + " ";
				}
				text(nonewline(tmp), pos_left, pos_top);
				
			}
			if (typeof node.pos_left != "undefined") {
				text("node.pos_left:", pos_left, pos_top);
				PrettyPaint(node.pos_left, depth + 1, pos_left, pos_top);
					pos_left += 50;
					pos_top += 50;
			}
			if (typeof node.right != "undefined") {
				text("node.right:", pos_left, pos_top);
				PrettyPaint(node.right, depth + 1, pos_left, pos_top);
					pos_left += 50;
					pos_top += 50;
			}
			if (typeof node.args != "undefined") {
				text("node.args:", pos_left, pos_top);
				for (var i = 0; i < node.args.length; i++) {
					PrettyPaint(node.args[i], depth + 1, pos_left, pos_top);
					pos_left += 50;
					pos_top += 50;
				}
			}
			if (typeof node.statements != "undefined") {
				text("node.statements:", pos_left, pos_top);
				for (var i = 0; i < node.statements.length; i++) {
					text("node.statement["+ i +"]:", pos_left, pos_top);
					PrettyPaint(node.statements[i], depth + 1, pos_left, pos_top);
					//pos_left += 50;
					pos_top += 50;
				}
			}
			break;
	}
}

function clearCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height)
}

function paintAST() {
		var tokens = lex(getInput());
		parser = new Parser(tokens);
		parser.init();
		parser.parse();
		pos_left = 50;
		pos_top = 50;
		PrettyPaint(parser.parseTree, 0);
}

text("100 10", 100, 10);
text("10 100", 10, 100);
line(100, 10, 10, 100);