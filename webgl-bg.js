const canvas = document.createElement("canvas");
canvas.id = "bg";
document.body.prepend(canvas);
canvas.style.position = "fixed";
canvas.style.inset = "0";
canvas.style.zIndex = "-3";

let gl = canvas.getContext("webgl");
if (!gl) {
  console.warn("WebGL not supported, using fallback.");
  const script = document.createElement("script");
  script.src = "js/background.js";
  document.body.appendChild(script);
  return;
}

let w, h;
function resize(){ w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight; }
window.addEventListener("resize", resize);
resize();

const vertex = `attribute vec2 position; void main(){ gl_Position = vec4(position,0,1); }`;
const fragment = `
precision mediump float;
uniform float time;
uniform vec2 resolution;
float noise(vec2 p){ return sin(p.x*12.9898+p.y*78.233)*43758.5453 - floor(sin(p.x*12.9898+p.y*78.233)*43758.5453); }
void main(){ vec2 uv=gl_FragCoord.xy/resolution.xy; vec3 col=vec3(0.05,0.05,0.05); float n=noise(uv*10.0+time*0.1); col+=vec3(0.1,0.06,0.14)*n; col+=vec3(0.05,0.1,0.2)*sin(time+uv.x*5.0); gl_FragColor=vec4(col,1.0); }
`;

function createShader(gl,type,source){
  const s=gl.createShader(type); gl.shaderSource(s,source); gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){ console.error(gl.getShaderInfoLog(s)); return null; }
  return s;
}

let program = gl.createProgram();
let vShader = createShader(gl, gl.VERTEX_SHADER, vertex);
let fShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);
gl.attachShader(program,vShader);
gl.attachShader(program,fShader);
gl.linkProgram(program);
gl.useProgram(program);

let position = gl.getAttribLocation(program,"position");
let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(position);
gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);

const timeLoc = gl.getUniformLocation(program,"time");
const resolutionLoc = gl.getUniformLocation(program,"resolution");

let start = Date.now();
function render(){
  gl.viewport(0,0,w,h);
  gl.uniform1f(timeLoc,(Date.now()-start)/1000);
  gl.uniform2f(resolutionLoc,w,h);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  requestAnimationFrame(render);
}
render();
