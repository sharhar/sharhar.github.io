var canvas;
var gl;

function createContext(canvasId) {
    canvas = document.getElementById(canvasId);
    gl = WebGLUtils.setupWebGL(canvas);

    if(!gl) {
        console.log("Failed ot get the rendering context for WebGL!");
        return;
    }

    var time = 0;

    setInterval(function() {
        gl.clearColor((Math.cos(time) + 1)/2.0, (Math.sin(time) + 1)/2.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        time += 0.01;
    }, 10);
}