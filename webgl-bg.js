[file name]: webgl-bg.js
[file content begin]
const canvas = document.createElement("canvas");
canvas.id = "bg";
document.body.prepend(canvas);
canvas.style.position = "fixed";
canvas.style.inset = "0";
canvas.style.zIndex = "-3";

// Try to get WebGL context with fallback
let gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
if (!gl) {
  console.warn("WebGL not supported, using fallback background.");
  canvas.remove();
  // Apply a simple CSS gradient as fallback
  document.body.style.background = "linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 50%, #16213E 100%)";
  return;
}

let w, h;
function resize(){ 
  w = canvas.width = window.innerWidth; 
  h = canvas.height = window.innerHeight; 
}
window.addEventListener("resize", resize);
resize();

// Simplified vertex shader
const vertexShaderSource = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

// Simplified fragment shader (removed problematic noise function)
const fragmentShaderSource = `
  precision mediump float;
  uniform float uTime;
  uniform vec2 uResolution;
  
  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    
    // Create a subtle animated gradient
    float time = uTime * 0.5;
    vec3 color1 = vec3(0.05, 0.05, 0.1);
    vec3 color2 = vec3(0.1, 0.05, 0.15);
    vec3 color3 = vec3(0.05, 0.1, 0.15);
    
    // Animated gradient
    float gradient = sin(uv.x * 3.0 + time) * 0.5 + 0.5;
    vec3 baseColor = mix(color1, color2, gradient);
    
    // Add some subtle movement
    float pulse = sin(uv.y * 2.0 + time * 1.5) * 0.02;
    baseColor += vec3(pulse * 0.5, pulse, pulse * 0.8);
    
    // Add some subtle dots/particles
    float particles = sin(uv.x * 20.0 + time * 2.0) * sin(uv.y * 15.0 + time * 1.7) * 0.02;
    baseColor += vec3(particles * 0.3, particles * 0.2, particles * 0.4);
    
    gl_FragColor = vec4(baseColor, 1.0);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  
  return shader;
}

// Create shader program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

if (!vertexShader || !fragmentShader) {
  console.error("Failed to create shaders");
  canvas.remove();
  document.body.style.background = "linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 100%)";
  return;
}

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error('Program linking error:', gl.getProgramInfoLog(program));
  canvas.remove();
  document.body.style.background = "linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 100%)";
  return;
}

gl.useProgram(program);

// Create geometry (full-screen quad)
const vertices = new Float32Array([
  -1.0, -1.0,
   1.0, -1.0,
  -1.0,  1.0,
   1.0,  1.0
]);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const positionAttribLocation = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(positionAttribLocation);
gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);

// Get uniform locations
const timeUniformLocation = gl.getUniformLocation(program, "uTime");
const resolutionUniformLocation = gl.getUniformLocation(program, "uResolution");

let startTime = Date.now();
let animationId;

function render() {
  if (!gl) return;
  
  gl.viewport(0, 0, w, h);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  const currentTime = (Date.now() - startTime) / 1000;
  
  gl.uniform1f(timeUniformLocation, currentTime);
  gl.uniform2f(resolutionUniformLocation, w, h);
  
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  
  animationId = requestAnimationFrame(render);
}

// Start animation
render();

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (gl) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
});
[file content end]
