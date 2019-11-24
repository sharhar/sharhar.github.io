function gpInternal_initGridNumbers(gl) {
    gl.textDiv = document.getElementById("test-div");
    gl.textPs = new Array(20);

    for(var i = 0; i < 20;i++) {
        gl.textPs[i] = document.createElement("div");
        gl.textDiv.appendChild(gl.textPs[i]);

        gl.textPs[i].style.position = "absolute";
        gl.textPs[i].style.left = "-100px";
        gl.textPs[i].style.top = "-100px";
    }
}

function gpInternal_createGridShader(gl) {
	var vs_src = `
		attribute vec2 pos;
		attribute vec2 texcoord;

		uniform mat4 model;
  		uniform mat4 proj;
		
		void main(void) {
			gl_Position = proj * model * vec4(pos.x, pos.y, 0.0, 1.0);
		}`;

	var fs_src = `
		precision mediump float;

		uniform vec3 color;

		void main(void) {
			gl_FragColor = vec4(color.xyz, 1.0);
		}`;

	var vsh = gpInternal_getShader(gl, vs_src, gl.VERTEX_SHADER);
    var fsh = gpInternal_getShader(gl, fs_src, gl.FRAGMENT_SHADER);

	gl.shader_grid = gl.createProgram();

	gl.attachShader(gl.shader_grid, vsh);
    gl.attachShader(gl.shader_grid, fsh);
    gl.linkProgram(gl.shader_grid);

    if (!gl.getProgramParameter(gl.shader_grid, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(gl.shader_grid);

    gl.shader_grid.modelLoc = gl.getUniformLocation(gl.shader_grid, "model");
    gl.shader_grid.projLoc = gl.getUniformLocation(gl.shader_grid, "proj");
    gl.shader_grid.colorLoc = gl.getUniformLocation(gl.shader_grid, "color");

    gl.model = mat4.create();
    gl.proj = mat4.create();
    gl.gridModel = new Array(16);
    gl.gridProj = new Array(16);

    mat4.identity(gl.model);
    mat4.identity(gl.proj);

    gpInternal_getOrthoMatrix(gl.gridProj, 0, canvas.width, 0, canvas.height, -1, 1);

    gl.shader_grid.vpa_pos = gl.getAttribLocation(gl.shader_grid, "pos");
}

function gpInternal_drawGrid(gl) {
    var bounds = gl.canvas.getBoundingClientRect();
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

    var index = 0;

    var xNum = (xrr - xlr) / xmag;
    for (i = 0; i < xNum + 1;i++) {
        var tx = (xlr - gl.g_left + xmag*i)*xratio;
        var xrv = xlr + xmag*i;

        if (tx  < 0 || tx > gl.viewportWidth) {
            continue;
        }

        gl.textPs[index].style.left = tx+12 + "px";
        gl.textPs[index].style.top = "10px";
        gl.textPs[index].innerHTML = "" + xrv;

        gpInternal_getModelviewMatrix(gl.gridModel, tx, 300, 0.5, 600);
        gl.uniformMatrix4fv(gl.shader_grid.modelLoc, false, gl.gridModel);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        index++;
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
        var yrv = ylr + ymag*i;

        if (ty < 0 || ty > gl.viewportHeight) {
            continue;
        }

        gl.textPs[index].style.left = "12px";
        gl.textPs[index].style.top = (bounds.bottom - ty-2) + "px";
        gl.textPs[index].innerHTML = "" + yrv;

        gpInternal_getModelviewMatrix(gl.gridModel, 300, ty, 600, 0.5);
        gl.uniformMatrix4fv(gl.shader_grid.modelLoc, false, gl.gridModel);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        index++;
    }

    for(var i = index; i < 20; i++) {
        gl.textPs[i].style.left = "-100px";
        gl.textPs[i].style.top = "-100px";
    }
}

function gpInternal_drawAxes(gl) {
    var l = Math.abs(gl.g_left);
    var r = Math.abs(gl.g_right);

    var xoff = (l / (r + l)) * gl.viewportWidth;

    if (gl.g_left < 0 && gl.g_right > 0) {
        gpInternal_getModelviewMatrix(gl.gridModel, xoff, 300, 1, 600);
        gl.uniformMatrix4fv(gl.shader_grid.modelLoc, false, gl.gridModel);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    
    var d = Math.abs(gl.g_down);
    var u = Math.abs(gl.g_up);

    var yoff = (d / (u + d))* gl.viewportHeight;

    if (gl.g_up > 0 && gl.g_down < 0) {
        gpInternal_getModelviewMatrix(gl.gridModel, 300, yoff, 600, 1);
        gl.uniformMatrix4fv(gl.shader_grid.modelLoc, false, gl.gridModel);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}