
var model;
var shaderProgram;

function init() {
	var verts = [
		-0.5, -0.5, 1.0, 0.0, 0.0,
		 0.0, 0.5, 0.0, 1.0, 0.0,
		 0.5, -0.5, 0.0, 0.0, 1.0
	];

	model = createModel(verts, [2, 3]);
	shaderProgram = createShader("shader-vs", "shader-fs", ["pos", "color"]);
}

function draw() {
	prepareShader(shaderProgram);
	prepareModel(model);
	drawModel(model);
}

