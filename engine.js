var canvas;
var gl;
var time;
var startTime;
var deltaTime;

function init(drawFunc) {
    canvas = document.getElementById("game-canvas");
    gl = WebGLUtils.setupWebGL(canvas);

    if(!gl) {
        console.log("Failed ot get the rendering context for WebGL!");
        return;
    }

    time = 0;

    document.getElementById("info").innerHTML =
        "WebGL Info:<br><br>" + 
        "Version: " + 
        gl.getParameter(gl.VERSION) + "<br>" + 
        "Renderer: " + 
        gl.getParameter(gl.RENDERER) + "<br>" + 
        "Vendor: " + 
         gl.getParameter(gl.VENDOR);

    startTime = new Date().getTime();

    setInterval(function() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        deltaTime = new Date().getTime() / 1000.0 - startTime;
        startTime = new Date().getTime() / 1000.0;

        drawFunc();

        time += deltaTime;
    }, 50.0/6.0);
}