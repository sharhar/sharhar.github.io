
var model;
var model2;
var shaderProgram;
var openglTex;
var faceTex;

function init() {
	var xoff = -0.4;
	var yoff = -0.4;
	var scale = 0.6;

	var verts = [
		-0.5*scale + xoff, -0.5*scale + yoff, 0.0, 1.0,
		-0.5*scale + xoff,  0.5*scale + yoff, 0.0, 0.0,
		 0.5*scale + xoff, -0.5*scale + yoff, 1.0, 1.0,

		 0.5*scale + xoff,  0.5*scale + yoff, 1.0, 0.0,
		-0.5*scale + xoff,  0.5*scale + yoff, 0.0, 0.0,
		 0.5*scale + xoff, -0.5*scale + yoff, 1.0, 1.0
	];

	xoff = 0.4;
	yoff = 0.4;

	var verts2 = [
		-0.5*scale + xoff, -0.5*scale + yoff, 0.0, 1.0,
		-0.5*scale + xoff,  0.5*scale + yoff, 0.0, 0.0,
		 0.5*scale + xoff, -0.5*scale + yoff, 1.0, 1.0,

		 0.5*scale + xoff,  0.5*scale + yoff, 1.0, 0.0,
		-0.5*scale + xoff,  0.5*scale + yoff, 0.0, 0.0,
		 0.5*scale + xoff, -0.5*scale + yoff, 1.0, 1.0
	];

	shaderProgram = createShader("shader-vs", "shader-fs", ["pos", "coord"]);
	shaderProgram.texLoc = gl.getUniformLocation(shaderProgram, "tex");
	gl.uniform1i(shaderProgram.texLoc, 0);

	model = createModel(verts, [2, 2]);
	model2 = createModel(verts2, [2, 2]);

	loadImage("opengl_logo.png", "openglTex");
	loadImage("face.jpg", "faceTex");
}

function draw() {
	prepareShader(shaderProgram);
	
	bindTexture(openglTex);
	prepareModel(model);
	drawModel(model);

	bindTexture(faceTex);
	prepareModel(model2);
	drawModel(model2);
}

