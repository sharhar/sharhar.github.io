
var model;
var shaderProgram;
var cubeTexture;

function handleTextureLoaded(image, texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

function init() {
	var verts = [
		-0.5, -0.5, 1.0, 0.0, 0.0,
		 0.0, 0.5, 0.0, 1.0, 0.0,
		 0.5, -0.5, 0.0, 0.0, 1.0
	];

	model = createModel(verts, [2, 3]);
	shaderProgram = createShader("shader-vs", "shader-fs", ["pos", "color"]);

	cubeTexture = gl.createTexture();
	var cubeImage = new Image();
	cubeImage.onload = function() { handleTextureLoaded(cubeImage, cubeTexture); }
	cubeImage.src = 'opengl_logo.png';
}

function draw() {
	prepareShader(shaderProgram);
	prepareModel(model);
	drawModel(model);
}

