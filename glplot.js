function gpInitCanvas(canvas) {
	var gl = WebGLUtils.setupWebGL(canvas);

	if(!gl) {
		console.log("Failed ot get the rendering context for WebGL!");
		return;
	}

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

		void main(void) {
			gl_FragColor = vec4(0.7, 0.2, 0.1, 1.0);
		}`;

	var vs = getShader(gl, vs_src, gl.VERTEX_SHADER);
    var fs = getShader(gl, fs_src, gl.FRAGMENT_SHADER);

	gl.shader = gl.createProgram();

	gl.attachShader(gl.shader, vs);
    gl.attachShader(gl.shader, fs);
    gl.linkProgram(gl.shader);

    if (!gl.getProgramParameter(gl.shader, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(gl.shader);

    gl.shader.modelLoc = gl.getUniformLocation(gl.shader, "model");
    gl.shader.projLoc = gl.getUniformLocation(gl.shader, "proj");

    gl.model = mat4.create();
    gl.proj = mat4.create();

    mat4.identity(gl.model);
    mat4.identity(gl.proj);

    gl.shader.vpa = gl.getAttribLocation(gl.shader, "pos");
    gl.enableVertexAttribArray(gl.shader.vpa);

	startGameLoop(gl);

	return gl;
}

function startGameLoop(gl) {
	function render_rec() {
		window.requestAnimFrame(render_rec, canvas);

		//var stime = new Date().getTime();
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.clearColor(1.0, 1.0, 1.0, 1.0);

		if(gl.has_data) {
			gl.bindBuffer(gl.ARRAY_BUFFER, gl.vbos[gl.rvbo]);
    		gl.vertexAttribPointer(gl.shader.vpa, gl.vbos[gl.rvbo].itemSize, gl.FLOAT, false, 0, 0);
			gl.useProgram(gl.shader);

			gl.uniformMatrix4fv(gl.shader.projLoc, false, gl.proj);
    		gl.uniformMatrix4fv(gl.shader.modelLoc, false, gl.model);

    		gl.drawArrays(gl.LINE_STRIP, 0, gl.vbos[gl.rvbo].numItems);
		}

		//var etime = new Date().getTime();
		//console.log(etime - stime);
	}
	
	render_rec();
}

function getShader(gl, str, type) {
      var shader = gl.createShader(type);

      gl.shaderSource(shader, str);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert(gl.getShaderInfoLog(shader));
          return null;
      }

      return shader;
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