var canvas;
var gl;
var time;
var startTime;
var deltaTime;
var vertexShader;
var fragmentShader;
var shaderProgram;

function initGame(initFunc, drawFunc) {
	canvas = document.getElementById("game-canvas");
	gl = WebGLUtils.setupWebGL(canvas);

	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;

	if(!gl) {
		console.log("Failed ot get the rendering context for WebGL!");
		return;
	}

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

	initShaders();

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

function initShaders() {
	vertexShader = getShader("shader-vs");
	fragmentShader = getShader("shader-fs");

	shaderProgram = gl.createProgram();

	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "pos");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
}

function prepareShader(shader) {
	gl.useProgram(shaderProgram);
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
}

function prepareModel(model) {
	gl.bindBuffer(gl.ARRAY_BUFFER, model);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, model.itemSize, gl.FLOAT, false, 0, 0);
}

function drawModel(model) {
	gl.drawArrays(gl.TRIANGLES, 0, model.numItems);
}

function createModel(verts) {
	var model = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, model);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

	model.itemSize = 2;
	model.numItems = verts.length / 2;

	return model;
}