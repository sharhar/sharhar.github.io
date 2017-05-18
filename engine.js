//Tutorial link: http://learningwebgl.com/blog/?page_id=1217

var canvas;
var gl;
var time;
var startTime;
var deltaTime;

var _____imagesToLoad;
var _____currentImageLoad;
var _____drawFn;
var _____totalImageLoad;
var _____totalImagesLoaded;

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

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	_____imagesToLoad = [];
	_____currentImageLoad = 0;
	_____totalImageLoad = 0.0;
	_____totalImagesLoaded = 0.0;

	initFunc();

	_____drawFn = drawFunc;

	if(_____imagesToLoad.length > 0) {
		console.log("Starting to download " + (Math.round(10*_____totalImageLoad/1024.0)/10.0) + "KB of image data");

		var loadedImage = new Image();
		loadedImage.onload = function() { loadNextImage(loadedImage); }
		loadedImage.src = _____imagesToLoad[_____currentImageLoad][0];
		return;
	}

	startGameLoop();
}

function loadNextImage(image) {
	_____totalImagesLoaded += parseFloat(_____imagesToLoad[_____currentImageLoad][2]);
	console.log("Downloaded " + (Math.round(10*_____totalImagesLoaded/1024.0)/10.0) + "KB of image data (" 
							+ (Math.round(100*_____totalImagesLoaded/_____totalImageLoad)) + "%)");

	eval(_____imagesToLoad[_____currentImageLoad][1] + " = gl.createTexture();");

	eval("gl.bindTexture(gl.TEXTURE_2D, " + _____imagesToLoad[_____currentImageLoad][1] +  ");");
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	_____currentImageLoad++;

	if(_____currentImageLoad >= _____imagesToLoad.length) {
		startGameLoop();
		return;
	}
	
	var loadedImage = new Image();
	loadedImage.onload = function() { loadNextImage(loadedImage); }
	loadedImage.src = _____imagesToLoad[_____currentImageLoad][0];
}

function bindTexture(texture) {
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
}

function loadImage(url, varname) {
 	var xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, false);
    xhr.send();

	var imageSize = xhr.getResponseHeader("Content-Length");

	_____totalImageLoad += parseFloat(imageSize);

	_____imagesToLoad.push([url, varname, imageSize]);
}

function startGameLoop() {
	function render_rec() {
		window.requestAnimFrame(render_rec, canvas);

		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT);

		deltaTime = new Date().getTime() / 1000.0 - startTime;
		startTime = new Date().getTime() / 1000.0;

		_____drawFn();

		time += deltaTime;
	}
	
	render_rec();
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

function createShader(vertID, fragID, attribs, uniforms) {
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
	shaderProgram.uniforms = [];

	for(var i = 0; i < attribs.length;i++) {
		shaderProgram.attribs.push(gl.getAttribLocation(shaderProgram, attribs[i]));
	}

	for(var i = 0; i < uniforms.length;i++) {
		shaderProgram.uniforms.push(gl.getUniformLocation(shaderProgram, uniforms[i]));
	}

	return shaderProgram;
}

function setUniform1i(shaderProgram, location, value) {
	gl.uniform1i(shaderProgram.uniforms[location], value);
}

function setUniformMat4(shaderProgram, location, value) {
	gl.uniformMatrix4fv(shaderProgram.uniforms[location], false, value);
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
