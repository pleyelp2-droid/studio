
'use client';

// Vertex Shader - Optimized for visual stability and performance
export const axiomVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying float vElevation;
varying float vGlitch;
varying float vFogDepth;
varying vec3 vNormal;

uniform float uTime;
uniform float uAwakeningDensity;
uniform float uBiome; 
uniform float uAxiomaticIntensity;
uniform float uStability;
uniform float uCorruption;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vUv = uv;
  vec3 pos = position;
  
  float amplitude = 1.0;
  float frequency = 1.0;
  
  if (abs(uBiome - 0.0) < 0.1) { 
      amplitude = 0.1;
      frequency = 0.5;
  } else if (abs(uBiome - 1.0) < 0.1) { 
      amplitude = 2.0;
      frequency = 1.2;
  } else if (abs(uBiome - 2.0) < 0.1) { 
      amplitude = 8.0;
      frequency = 0.7;
  } else { 
      amplitude = 1.0;
      frequency = 0.6;
  }

  float elevation = snoise(pos.xz * 0.015 * frequency) * amplitude;
  
  // Optimization: Single glitch calculation
  float glitchFactor = step(0.995, sin(uTime * 1.5 + pos.x * 10.0)) * (uAwakeningDensity * 0.2);
  pos.x += glitchFactor * snoise(pos.xz + uTime);
  vGlitch = glitchFactor;

  pos.y += elevation;
  
  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  
  vPosition = modelPosition.xyz;
  vElevation = elevation;
  vFogDepth = -viewPosition.z;
  vNormal = normalMatrix * normal;

  gl_Position = projectionMatrix * viewPosition;
}
`;

export const axiomFragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying float vElevation;
varying float vGlitch;
varying float vFogDepth;
varying vec3 vNormal;

uniform float uTime;
uniform float uAwakeningDensity; 
uniform float uBiome;
uniform float uAxiomaticIntensity;
uniform float uStability;
uniform float uCorruption;
uniform vec3 uCameraPosition;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;

void main() {
    vec3 normal = normalize(vNormal);
    float lighting = 0.6 + 0.4 * max(dot(normal, normalize(vec3(0.5, 1.0, 0.2))), 0.0);

    vec3 finalColor = vec3(0.05, 0.06, 0.12);
    
    // BIOME COLORING (High-performance color select)
    if (abs(uBiome - 0.0) < 0.1) finalColor = vec3(0.02, 0.03, 0.08); // City
    else if (abs(uBiome - 1.0) < 0.1) finalColor = vec3(0.02, 0.08, 0.04); // Forest
    else if (abs(uBiome - 2.0) < 0.1) finalColor = vec3(0.1, 0.12, 0.2); // Mountain

    // GRID PIPELINE OPTIMIZATION
    float dist = length(vPosition - uCameraPosition);
    // Linear grid fade is cheaper than smoothstep for horizon tapering
    float gridFade = clamp(1.0 - (dist - 80.0) / 150.0, 0.0, 1.0);
    
    vec2 gridUV = vPosition.xz * 0.25; 
    vec2 derivative = fwidth(gridUV) + 0.001; // Safety epsilon
    vec2 grid = abs(fract(gridUV - 0.5) - 0.5) / derivative;
    float line = min(grid.x, grid.y);
    float gridPattern = 1.0 - clamp(line, 0.0, 1.0);
    
    vec3 gridColor = vec3(0.12, 0.72, 0.72); // Teal Logic
    finalColor = mix(finalColor, gridColor, gridPattern * 0.25 * gridFade);

    // PULSING NEURAL VEINS (Reduced instruction count)
    float pulse = sin(vPosition.x * 0.05 + vPosition.z * 0.05 + uTime * 1.5) * 0.5 + 0.5;
    finalColor += gridColor * pulse * 0.05 * uAwakeningDensity * gridFade;

    finalColor *= lighting;

    float fogFactor = smoothstep(uFogNear, uFogFar, vFogDepth);
    gl_FragColor = vec4(mix(finalColor, uFogColor, fogFactor), 1.0);
}
`;
