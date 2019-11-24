function gpInternal_createQuadShader(gl) {
	var vs_src = `
		attribute vec2 pos;

  		varying vec2 texcoord_out;
		
		void main(void) {
			gl_Position = vec4(pos.x, pos.y, 0.0, 1.0);
			texcoord_out = (pos + 1.0)/2.0;
		}`;

	var fs_src = `
		precision mediump float;

		uniform sampler2D tex;

		varying vec2 texcoord_out;

		void main(void) {
			gl_FragColor = texture2D(tex, texcoord_out);//vec4(texcoord_out.xy, 0, 1);
		}`;

	var vsh = gpInternal_getShader(gl, vs_src, gl.VERTEX_SHADER);
    var fsh = gpInternal_getShader(gl, fs_src, gl.FRAGMENT_SHADER);

	gl.shader_quad = gl.createProgram();

	gl.attachShader(gl.shader_quad, vsh);
    gl.attachShader(gl.shader_quad, fsh);
    gl.linkProgram(gl.shader_quad);

    if (!gl.getProgramParameter(gl.shader_quad, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(gl.shader_quad);

    gl.shader_quad.texLoc = gl.getUniformLocation(gl.shader_quad, "tex");

    gl.shader_quad.vpa_pos = gl.getAttribLocation(gl.shader_quad, "pos");
}

function gpInternal_createCalcShader(gl, eq, funcs) {

	var vs_src = `
		attribute vec2 pos;

		uniform float up;
		uniform float down;
		uniform float left;
		uniform float right;

  		varying vec2 coord;
		
		void main(void) {
			gl_Position = vec4(pos.x, pos.y, 0.0, 1.0);
			coord = vec2(left, down) + vec2((pos.x + 1.0)*(right-left), (pos.y + 1.0)*(up-down))/2.0;
		}`;

	var fs_src = `
		precision highp float;

		uniform float t;
		uniform float at;
		const float e = 2.718281828459045;
		const float pi = 3.141592653589793;
		const float tau = 3.141592653589793 * 2.0;
		
		varying vec2 coord;
		
		float powi_c(float b, float p) {
			if(mod(p,2.0) == 0.0) {
				return pow(abs(b), p);
			}
			return sign(b)*pow(abs(b), p);
		}

		float pow_c(float b, float p) {
			int pi = int(p);
			if(p < 0.0) {
				if(float(pi) == p) {
					return 1.0/(powi_c(b, abs(float(pi))));
				} else {
					return 1.0/(pow(b, abs(p)));
				}
			}
			if(float(pi) == p) {
				return powi_c(b, float(pi));
			} else {
				return pow(b, p);
			}
		}

		float gamma(float x) {
			float num = x+1.0;
			float result0_ = 0.0;
			float result1_ = 0.0;
			float a_ = 0.0;
			float b_ = num*25.0;
			float n_ = 250.0;
			float dx_ = (b_ - a_)/n_;
			float h = a_;
			result0_ += pow_c(h, (num-1.0))*exp(-h);
			h = b_;
			result0_ += pow_c(h, (num-1.0))*exp(-h);

			for(float k_ = 1.0; k_ < 250.0; k_++) {
				h = a_+(k_*dx_);
				result1_ += 2.0*pow_c(h, (num-1.0))*exp(-h);
			}

			return (dx_/2.0)*(result0_ + result1_)/x;
		}

		` + funcs +  `

		void main(void) {
			float x = coord.x;
			float y = coord.y;
			float result = ` + eq + `;
			float total = result;
			y = 0.0;
			result = ` + eq + `;
			float total0 = result;
			gl_FragColor = vec4(total, total0, 0.0, 1.0);
		}
	`;

	var vsh = gpInternal_getShader(gl, vs_src, gl.VERTEX_SHADER);
    var fsh = gpInternal_getShader(gl, fs_src, gl.FRAGMENT_SHADER);

	gl.shader_calc = gl.createProgram();
	gl.shader_calc.vsh = vsh;
	gl.shader_calc.fsh = fsh;

	gl.attachShader(gl.shader_calc, vsh);
    gl.attachShader(gl.shader_calc, fsh);
    gl.linkProgram(gl.shader_calc);

    if (!gl.getProgramParameter(gl.shader_calc, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(gl.shader_calc);

    gl.shader_calc.upLoc = gl.getUniformLocation(gl.shader_calc, "up");
    gl.shader_calc.downLoc = gl.getUniformLocation(gl.shader_calc, "down");
    gl.shader_calc.leftLoc = gl.getUniformLocation(gl.shader_calc, "left");
    gl.shader_calc.rightLoc = gl.getUniformLocation(gl.shader_calc, "right");

    gl.shader_calc.vpa_pos = gl.getAttribLocation(gl.shader_calc, "pos");
}

function gpInternal_createEdgeShader(gl, width, height) {
	var vs_src = `
		attribute vec2 pos;

  		varying vec2 coord;
		
		void main(void) {
			gl_Position = vec4(pos.x, pos.y, 0.0, 1.0);
			coord = pos/2.0 + 0.5;
		}`;

	var fs_src = `
		precision highp float;

		uniform sampler2D data;
		varying vec2 coord;

		const float pxw = 1.0/` + width + `.0;

		bool isColored(vec2 coord) {
			vec4 c = texture2D(data, coord);
			if(c.x == 0.0) {
				return true;
			}

			vec4 u = texture2D(data, vec2(coord.x, coord.y - pxw));
			vec4 d = texture2D(data, vec2(coord.x, coord.y + pxw));
			vec4 u2 = texture2D(data, vec2(coord.x, coord.y - pxw*2.0));

			if(coord.y + pxw*2.0 <= 1.0 && coord.y - pxw >= 0.0) {
				float m1 = (c.x - d.x);
				float m2 = (u2.x - u.x);
				float m = (u.x - c.x);
				
				if(sign(u.x) != sign(c.x) && (sign(m1) != sign(m2) || sign(m1) == sign(m))) {
					return true;
				}
				
				float m10 = (c.y - d.y);
				float m20 = (u2.y - u.y);
				float m0 = (u.y - c.y);
				
				if(sign(u.x) == sign(c.x) && sign(u.y) != sign(c.y) && sign(m10) == sign(m20) && sign(m10) != sign(m0)) {
					return true;
				}
			}

			vec4 d2 = texture2D(data, vec2(coord.x, coord.y + pxw*2.0));

			if(coord.y + pxw*2.0 <= 1.0 && coord.y - pxw >= 0.0) {
				float m1 = (d.x - d2.x);
				float m2 = (u.x - c.x);
				float m = (c.x - d.x);

				if(sign(c.x) != sign(d.x) && (sign(m1) != sign(m2) || sign(m1) == sign(m))) {
					return true;
				}

				float m10 = (d.y - d2.y);
				float m20 = (u.y - c.y);
				float m0 = (c.y - d.y);

				if(sign(c.x) == sign(d.x) && sign(c.y) != sign(d.y) && sign(m10) == sign(m20) && sign(m10) != sign(m0)) {
					return true;
				}
			}

			vec4 r = texture2D(data, vec2(coord.x + pxw, coord.y));
			vec4 l = texture2D(data, vec2(coord.x - pxw, coord.y));
			vec4 r2 = texture2D(data, vec2(coord.x + pxw*2.0, coord.y));

			if(coord.x + pxw*2.0 <= 1.0 && coord.x - pxw >= 0.0) {
				float m1 = (c.x - l.x);
				float m2 = (r2.x - r.x);
				float m = (r.x - c.x);

				if(sign(r.x) != sign(c.x) && (sign(m1) != sign(m2) || sign(m1) == sign(m))) {
					return true;
				}

				float m10 = (c.y - l.y);
				float m20 = (r2.y - r.y);
				float m0 = (r.y - c.y);

				if(sign(r.x) == sign(c.x) && sign(r.y) != sign(c.y) && sign(m10) == sign(m20) && sign(m10) != sign(m0)) {
					return true;
				}
			}

			vec4 l2 = texture2D(data, vec2(coord.x - pxw*2.0, coord.y));
			
			if(coord.x + pxw*2.0 <= 1.0 && coord.x - pxw >= 0.0) {
				float m1 = (l.x - l2.x);
				float m2 = (r.x - c.x);
				float m = (c.x - l.x);
				
				if(sign(c.x) != sign(l.x) && (sign(m1) != sign(m2) || sign(m1) == sign(m))) {
					return true;
				}
				
				float m10 = (l.y - l2.y);
				float m20 = (r.y - c.y);
				float m0 = (c.y - l.y);
			
				if(sign(c.x) == sign(l.x) && sign(c.y) != sign(l.y) && sign(m10) == sign(m20) && sign(m10) != sign(m0)) {
					return true;
				}
			}

			return false;
		}

		void main(void) {
			if(isColored(coord)) {gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); return;}
			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
		}
`;


    var vsh = gpInternal_getShader(gl, vs_src, gl.VERTEX_SHADER);
    var fsh = gpInternal_getShader(gl, fs_src, gl.FRAGMENT_SHADER);

	gl.shader_edge = gl.createProgram();

	gl.attachShader(gl.shader_edge, vsh);
    gl.attachShader(gl.shader_edge, fsh);
    gl.linkProgram(gl.shader_edge);

    if (!gl.getProgramParameter(gl.shader_edge, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(gl.shader_edge);

    gl.shader_edge.dataLoc = gl.getUniformLocation(gl.shader_edge, "data");

    gl.shader_edge.vpa_pos = gl.getAttribLocation(gl.shader_edge, "pos");
}

function gpInternal_createRenderShader(gl, width, height) {
	var vs_src = `
		attribute vec2 pos;

  		varying vec2 coord;
		
		void main(void) {
			gl_Position = vec4(pos.x, pos.y, 0.0, 1.0);
			coord = pos/2.0 + 0.5;
		}`;

	var fs_src = `
		precision highp float;

		uniform sampler2D edge;
		varying vec2 coord;

		const float pw = 1.0/` + width + `.0;
		uniform vec3 g_color;

		void main(void) {
			if(texture2D(edge, vec2(coord.x, coord.y)).x == 1.0) {gl_FragColor = vec4(g_color.xyz, 1.0); return;}
			if(texture2D(edge, vec2(coord.x + pw, coord.y)).x == 1.0 && coord.x + pw <= 1.0) {gl_FragColor = vec4(g_color.xyz, 1.0); return;}
			if(texture2D(edge, vec2(coord.x - pw, coord.y)).x == 1.0 && coord.x - pw >= 0.0) {gl_FragColor = vec4(g_color.xyz, 1.0); return;}
			if(texture2D(edge, vec2(coord.x, coord.y + pw)).x == 1.0 && coord.y + pw <= 1.0) {gl_FragColor = vec4(g_color.xyz, 1.0); return;}
			if(texture2D(edge, vec2(coord.x, coord.y - pw)).x == 1.0 && coord.y - pw >= 0.0) {gl_FragColor = vec4(g_color.xyz, 1.0); return;}
			//if(texture2D(edge, vec2(coord.x + pw*2.0, coord.y)).x == 1.0 && coord.x + pw*2.0 <= 1.0) {gl_FragColor = vec4(g_color.xyz, 1.0); return;}
			//if(texture2D(edge, vec2(coord.x - pw*2.0, coord.y)).x == 1.0 && coord.x - pw*2.0 >= 0.0) {gl_FragColor = vec4(g_color.xyz, 1.0); return;}
			//if(texture2D(edge, vec2(coord.x, coord.y + pw*2.0)).x == 1.0 && coord.y + pw*2.0 <= 1.0) {gl_FragColor = vec4(g_color.xyz, 1.0); return;}
			//if(texture2D(edge, vec2(coord.x, coord.y - pw*2.0)).x == 1.0 && coord.y - pw*2.0 >= 0.0) {gl_FragColor = vec4(g_color.xyz, 1.0); return;}
			discard;
		}
`;

	var vsh = gpInternal_getShader(gl, vs_src, gl.VERTEX_SHADER);
    var fsh = gpInternal_getShader(gl, fs_src, gl.FRAGMENT_SHADER);

	gl.shader_render = gl.createProgram();

	gl.attachShader(gl.shader_render, vsh);
    gl.attachShader(gl.shader_render, fsh);
    gl.linkProgram(gl.shader_render);

    if (!gl.getProgramParameter(gl.shader_render, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(gl.shader_render);

    gl.shader_render.edgeLoc = gl.getUniformLocation(gl.shader_render, "edge");
    gl.shader_render.colorLoc = gl.getUniformLocation(gl.shader_render, "g_color");

    gl.shader_render.vpa_pos = gl.getAttribLocation(gl.shader_render, "pos");
}


































