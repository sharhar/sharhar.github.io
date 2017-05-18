
var model;
var shaderProgram;
var openglTex;
var faceTex;
var projection;
var modelview;

function init() {

	var verts = [
		-0.5, -0.5, 0.0, 1.0,
		-0.5,  0.5, 0.0, 0.0,
		 0.5, -0.5, 1.0, 1.0,

		 0.5,  0.5, 1.0, 0.0,
		-0.5,  0.5, 0.0, 0.0,
		 0.5, -0.5, 1.0, 1.0
	];

	shaderProgram = createShader("shader-vs", "shader-fs", ["pos", "coord"], ["proj", "modelview", "tex"]);
	setUniform1i(shaderProgram, 2, 0);

	projection = mat4.create();
	modelview = mat4.create();

	mat4.identity(projection);

	setUniformMat4(shaderProgram, 0, projection);

	model = createModel(verts, [2, 2]);

	loadImage("opengl_logo.png", "openglTex");
	loadImage("face.jpg", "faceTex");
}

function draw() {
	prepareShader(shaderProgram);
	prepareModel(model);

	bindTexture(openglTex);

	mat4.identity(modelview);
	mat4.translate(modelview, [-0.4, -0.4, 0.0]);
	mat4.rotate(modelview, time, [0, 0, 1]);
	mat4.scale(modelview, [0.6, 0.6, 0.6]);

	setUniformMat4(shaderProgram, 1, modelview);

	drawModel(model);

	bindTexture(faceTex);

	mat4.identity(modelview);
	mat4.translate(modelview, [0.4, 0.4, 0.0]);
	mat4.rotate(modelview, -time, [0, 0, 1]);
	mat4.scale(modelview, [0.6, 0.6, 0.6]);

	setUniformMat4(shaderProgram, 1, modelview);

	drawModel(model);
}

