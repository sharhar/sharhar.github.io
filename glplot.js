function gpInitCanvas(canvas, bounds) {
	var gl = WebGLUtils.setupWebGL(canvas);

	if(!gl) {
		console.log("Failed ot get the rendering context for WebGL!");
		return;
	}

	gl.g_left = bounds[0];
	gl.g_down = bounds[1];
	gl.g_right = bounds[2];
	gl.g_up = bounds[3];
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	gl.has_data = false;

	var vs_src = `attribute vec2 pos;

		uniform mat4 model;
  		uniform mat4 proj;
		
		void main(void) {
			gl_Position = proj * model * vec4(pos.x, pos.y, 0.0, 1.0);
		}`;

	var fs_src = `precision mediump float;

		uniform vec3 color;

		void main(void) {
			gl_FragColor = vec4(color.xyz, 1.0);
		}`;

	var vsh = gpInternal_getShader(gl, vs_src, gl.VERTEX_SHADER);
    var fsh = gpInternal_getShader(gl, fs_src, gl.FRAGMENT_SHADER);

	gl.shader = gl.createProgram();

	gl.attachShader(gl.shader, vsh);
    gl.attachShader(gl.shader, fsh);
    gl.linkProgram(gl.shader);

    if (!gl.getProgramParameter(gl.shader, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(gl.shader);

    gl.shader.modelLoc = gl.getUniformLocation(gl.shader, "model");
    gl.shader.projLoc = gl.getUniformLocation(gl.shader, "proj");
    gl.shader.colorLoc = gl.getUniformLocation(gl.shader, "color");

    gl.model = mat4.create();
    gl.proj = mat4.create();
    gl.gridModel = new Array(16);
    gl.gridProj = new Array(16);

    mat4.identity(gl.model);
    mat4.identity(gl.proj);

    gpInternal_getOrthoMatrix(gl.gridProj, 0, canvas.width, 0, canvas.height, -1, 1);

    gl.shader.vpa = gl.getAttribLocation(gl.shader, "pos");
    gl.enableVertexAttribArray(gl.shader.vpa);

    var quad_data = new Array(12);

    quad_data[0] = -1;
	quad_data[1] = -1;

	quad_data[2] = 1;
	quad_data[3] = -1;

	quad_data[4] = 1;
	quad_data[5] = 1;

	quad_data[6] = -1;
	quad_data[7] = -1;

	quad_data[8] = -1;
	quad_data[9] = 1;

	quad_data[10] = 1;
	quad_data[11] = 1;  

    gl.vbo_quad = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.vbo_quad);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad_data), gl.STATIC_DRAW);

	gl.vbo_quad.itemSize = 2;
	gl.vbo_quad.numItems = quad_data.length/2;

	gpInternal_startGameLoop(gl);

	return gl;
}

function initData(gl, data, bounds) {
	gl.cvbo = 0;
	gl.rvbo = 0;
	gl.svbo = false;
	gl.vbos = new Array(2);

	gl.vbos[gl.cvbo] = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.vbos[gl.cvbo]);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

	gl.vbos[gl.cvbo].itemSize = 2;
	gl.vbos[gl.cvbo].numItems = data.length/2;

	gl.has_data = true;
}

function updateData(gl, data, bounds) {
	gl.cvbo = (gl.cvbo + 1)%2;

	if(gl.cvbo == 0 || gl.svbo) {
		gl.deleteBuffer(gl.vbos[gl.cvbo])
	}

	gl.vbos[gl.cvbo] = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.vbos[gl.cvbo]);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

	gl.vbos[gl.cvbo].itemSize = 2;
	gl.vbos[gl.cvbo].numItems = data.length/2;

	if(gl.cvbo == 1) {
		gl.svbo = true;
	}

	gl.rvbo = (gl.rvbo + 1)%2;
}

function gpInternal_startGameLoop(gl) {
	function render_rec() {
		window.requestAnimFrame(render_rec, canvas);

		//var stime = new Date().getTime();
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.clearColor(1.0, 1.0, 1.0, 1.0);

		if(gl.has_data) {
			gl.enableVertexAttribArray(gl.shader.vpa);
			gl.useProgram(gl.shader);

			gl.bindBuffer(gl.ARRAY_BUFFER, gl.vbo_quad);
			gl.vertexAttribPointer(gl.shader.vpa, gl.vbo_quad.itemSize, gl.FLOAT, false, 0, 0);
			
			gl.uniformMatrix4fv(gl.shader.projLoc, false, gl.gridProj);
			gl.uniform3f(gl.shader.colorLoc, 0.45, 0.45, 0.45);
			gpInternal_drawGrid(gl);
			gl.uniform3f(gl.shader.colorLoc, 0, 0, 0);
			gpInternal_drawAxes(gl);

			gl.bindBuffer(gl.ARRAY_BUFFER, gl.vbos[gl.rvbo]);
			gl.vertexAttribPointer(gl.shader.vpa, gl.vbos[gl.rvbo].itemSize, gl.FLOAT, false, 0, 0);

			gpInternal_getOrthoMatrix(gl.proj, gl.g_left, gl.g_right, gl.g_down, gl.g_up, -1, 1);
			gl.uniform3f(gl.shader.colorLoc, 0.7, 0.2, 0.1);
			gl.uniformMatrix4fv(gl.shader.projLoc, false, gl.proj);
			gl.uniformMatrix4fv(gl.shader.modelLoc, false, gl.model);

			gl.drawArrays(gl.LINE_STRIP, 0, gl.vbos[gl.rvbo].numItems);
		}

		//var etime = new Date().getTime();
		//console.log(etime - stime);
	}
	
	render_rec();
}

function gpInternal_getOrthoMatrix(projMat, left, right, bottom, top, n, f) {
	projMat[0] = 2.0 / (right - left);
	projMat[1] = 0;
	projMat[2] = 0;
	projMat[3] = 0;

	projMat[4] = 0;
	projMat[5] = 2.0 / (top - bottom);
	projMat[6] = 0;
	projMat[7] = 0;

	projMat[8] = 0;
	projMat[9] = 0;
	projMat[10] = -2.0 / (f - n);
	projMat[11] = 0;

	projMat[12] = -(right + left) / (right - left);
	projMat[13] = -(top + bottom) / (top - bottom);
	projMat[14] = -(f + n) / (f - n);
	projMat[15] = 1;
}

function gpInternal_getModelviewMatrix(gridModel, x, y, w, h) {
	gridModel[0] = w;
	gridModel[1] = 0;
	gridModel[2] = 0;
	gridModel[3] = 0;

	gridModel[4] = 0;
	gridModel[5] = h;
	gridModel[6] = 0;
	gridModel[7] = 0;

	gridModel[8] = 0;
	gridModel[9] = 0;
	gridModel[10] = 1;
	gridModel[11] = 0;

	gridModel[12] = x;
	gridModel[13] = y;
	gridModel[14] = 0;
	gridModel[15] = 1;
}

function gpInternal_drawGrid(gl) {
	var xratio = gl.viewportWidth / (gl.g_right - gl.g_left);

	var xlen = gl.g_right - gl.g_left;
	var xlog = Math.log10(xlen);
	var xfloor = Math.floor(xlog);
	var xmag = Math.pow(10, xfloor);

	if (Math.floor(xlog - 0.3) < xfloor) {
		xmag /= 2;
	}

	if (Math.floor(xlog - 0.6) < xfloor) {
		xmag /= 2;
	}

	var xlr = Math.round(gl.g_left / xmag)*xmag;
	var xrr = Math.round(gl.g_right / xmag)*xmag;

	var xNum = (xrr - xlr) / xmag;
	for (i = 0; i < xNum + 1;i++) {
		var tx = (xlr - gl.g_left + xmag*i)*xratio;

		if (tx  < 0 || tx > gl.viewportWidth) {
			continue;
		}

		gpInternal_getModelviewMatrix(gl.gridModel, tx, 300, 0.5, 600);
		gl.uniformMatrix4fv(gl.shader.modelLoc, false, gl.gridModel);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	var yratio = gl.viewportHeight / (gl.g_up - gl.g_down);

	var ylen = gl.g_up - gl.g_down;
	var ylog = Math.log10(ylen);
	var yfloor = Math.floor(ylog);
	var ymag = Math.pow(10, yfloor);

	if (Math.floor(ylog - 0.3) < yfloor) {
		ymag /= 2;
	}

	if (Math.floor(ylog - 0.6) < yfloor) {
		ymag /= 2;
	}

	var ylr = Math.round(gl.g_down / ymag)*ymag;
	var yrr = Math.round(gl.g_up / ymag)*ymag;

	var yNum = (yrr - ylr) / ymag;

	for (i = 0; i < yNum * 2; i++) {
		var ty = (ylr - gl.g_down + ymag*i)*yratio;

		if (ty < 0 || ty > gl.viewportHeight) {
			continue;
		}
		gpInternal_getModelviewMatrix(gl.gridModel, 300, ty, 600, 0.5);
		gl.uniformMatrix4fv(gl.shader.modelLoc, false, gl.gridModel);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}

function gpInternal_drawAxes(gl) {
	var l = Math.abs(gl.g_left);
	var r = Math.abs(gl.g_right);

	var xoff = (l / (r + l)) * gl.viewportWidth;

	if (gl.g_left < 0 && gl.g_right > 0) {
		gpInternal_getModelviewMatrix(gl.gridModel, xoff, 300, 1, 600);
		gl.uniformMatrix4fv(gl.shader.modelLoc, false, gl.gridModel);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
	
	var d = Math.abs(gl.g_down);
	var u = Math.abs(gl.g_up);

	var yoff = (d / (u + d))* gl.viewportHeight;

	if (gl.g_up > 0 && gl.g_down < 0) {
		gpInternal_getModelviewMatrix(gl.gridModel, 300, yoff, 600, 1);
		gl.uniformMatrix4fv(gl.shader.modelLoc, false, gl.gridModel);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}

function gpInternal_getShader(gl, str, type) {
      var shader = gl.createShader(type);

      gl.shaderSource(shader, str);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert(gl.getShaderInfoLog(shader));
          return null;
      }

      return shader;
}
