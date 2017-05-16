
var model;

function init() {
	var verts = [
		-0.5, -0.5,
		 0.0, 0.5,
		 0.5, -0.5
	];

    model = createModel(verts);
}

function draw() {
	prepareShader(shaderProgram);
	prepareModel(model);
	drawModel(model);
}

