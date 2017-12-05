function gpInitCanvas(canvas) {
	var gl = WebGLUtils.setupWebGL(canvas);

	if(!gl) {
		console.log("Failed ot get the rendering context for WebGL!");
		return;
	}

	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	gl.test_a = 0;
	gl.has_data = false;

	var vs_src = `attribute vec2 pos;
		//attribute vec2 coord;

		//uniform mat4 proj;
		//uniform mat4 modelview;
		//varying vec2 tcoord;
		void main(void) {
			gl_Position = vec4(pos.x, pos.y, 0.0, 1.0);//proj * modelview * vec4(pos.x, pos.y, 0.0, 1.0);
			//tcoord = coord;
		}`;

	var fs_src = `precision mediump float;
		//uniform sampler2D tex;
		//varying vec2 tcoord;
		void main(void) {
			//vec4 tcol = texture2D(tex, tcoord);
			gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);//mix(vec4(tcol.rgb, 1.0), vec4(1.0), 1.0-tcol.a);
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

    gl.shader.vpa = gl.getAttribLocation(gl.shader, "pos");
    gl.enableVertexAttribArray(gl.shader.vpa);

	startGameLoop(gl);

	return gl;
}

function startGameLoop(gl) {
	function render_rec() {
		window.requestAnimFrame(render_rec, canvas);

		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.clearColor(gl.test_a, 0.0, 0.0, 1.0);

		if(gl.has_data) {
			gl.bindBuffer(gl.ARRAY_BUFFER, gl.vbo);
    		gl.vertexAttribPointer(gl.shader.vpa, gl.vbo.itemSize, gl.FLOAT, false, 0, 0);
			gl.useProgram(gl.shader);

    		gl.drawArrays(gl.LINE_STRIP, 0, gl.vbo.numItems);
		}
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
	gl.vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

	gl.vbo.itemSize = 2;
	gl.vbo.numItems = data.length/2;



	gl.has_data = true;
}