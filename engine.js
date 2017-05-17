//Tutorial link: http://learningwebgl.com/blog/?page_id=1217


var canvas;
var gl;
var time;
var startTime;
var deltaTime;

function initGame(initFunc, drawFunc) {
	canvas = document.getElementById("game-canvas");
	gl = WebGLUtils.setupWebGL(canvas);

	if(!gl) {
		console.log("Failed ot get the rendering context for WebGL!");
		return;
	}

	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;

	time = 0;

	document.getElementById("info").innerHTML =
		"WebGL Info:<br><br>" + 
		"Version: " + 
		gl.getParameter(gl.VERSION) + "<br>" + 
		"Renderer: " + 
		gl.getParameter(gl.RENDERER) + "<br>" + 
		"Vendor: " + 
			gl.getParameter(gl.VENDOR);

	startTime = new Date().getTime();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	initFunc();

	setInterval(function() {
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT);

		deltaTime = new Date().getTime() / 1000.0 - startTime;
		startTime = new Date().getTime() / 1000.0;

		drawFunc();

		time += deltaTime;
	}, 50.0/6.0);
}

function getShader(id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3)
			str += k.textContent;
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function createShader(vertID, fragID, attribs) {
	var shaderProgram = gl.createProgram();
	
	shaderProgram.vertexShader = getShader(vertID);
	shaderProgram.fragmentShader = getShader(fragID);

	gl.attachShader(shaderProgram, shaderProgram.vertexShader);
	gl.attachShader(shaderProgram, shaderProgram.fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.attribs = [];

	for(var i = 0; i < attribs.length;i++) {
		shaderProgram.attribs.push(gl.getAttribLocation(shaderProgram, attribs[i]));
	}

	return shaderProgram;
}

function prepareShader(shader) {
	gl.useProgram(shaderProgram);

	for(var i = 0; i < shaderProgram.attribs.length;i++) {
		gl.enableVertexAttribArray(shaderProgram.attribs[i]);
	}
}

function prepareModel(model) {
	gl.bindBuffer(gl.ARRAY_BUFFER, model);

	for(var i = 0; i < model.itemSizes.length;i++) {
		gl.vertexAttribPointer(shaderProgram.attribs[i], model.itemSizes[i], 
				gl.FLOAT, false, model.vertexSize * 4, model.offsets[i] * 4);
	}
}

function drawModel(model) {
	gl.drawArrays(gl.TRIANGLES, 0, model.numItems);
}

function createModel(verts, sizes) {
	var model = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, model);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

	model.itemSizes = sizes;

	model.vertexSize = 0;
	model.offsets = [];

	for(var i = 0; i < sizes.length;i++) {
		model.offsets.push(model.vertexSize);
		model.vertexSize += sizes[i];
	}

	model.numItems = verts.length / model.vertexSize;

	return model;
}