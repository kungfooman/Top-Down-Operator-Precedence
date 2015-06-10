function getArgs(func) {
	var s;
	s = func.toString();
	s = s.substring(10, s.indexOf(")"));
	s = s.replace(/ /g, "");
	return s.split(",");
}

/*
	function(id, leftBindingPower, rightBindingPower, leftDenotation) {
		
		eval("console.log(\"infix:\", id, leftBindingPower, rightBindingPower, leftDenotation, getArgs(parser).join('a'));")
		oldinfix(id, leftBindingPower, rightBindingPower, leftDenotation);
	}
*/

function toSource(func) {
	var src = func.toSource();
	//console.log(src);
	return src.substring(src.indexOf("{")+1, src.length - 2);
}

function hookLog(obj, oldFunc, funcname) {
	var tmp;
	tmp += "a = function (obj, oldFunc, funcname)";
	tmp += "{";
		//tmp += "console.log(\"oldFunc:\", oldFunc, \"parser:\", obj);";
	
		var args = getArgs(oldFunc);
		tmp += "return function (" + args.join(",") + ")";
		tmp += "{";
			tmp += toSource(function() {
				var a = [funcname + ">"];
				for (var i=0; i<args.length; i++) {
					a.push(args[i], eval(args[i]));
				}
				console.log.apply(null, a);
				//oldFunc.apply(obj, args);
			});
			tmp += "return oldFunc.bind(obj)(" + args.join(",") + ");";
			
		tmp += "}";
	
	tmp += "}";
	var newFunc = eval(tmp)(obj, oldFunc, funcname);
	// FireBug: parser.expression.oldFunc.toSource()
	// Idea: s/arguments.keys()/arguments.values() and just print it, for debugging the actual values directly in source
	newFunc.oldFunc = oldFunc;
	return newFunc;
}