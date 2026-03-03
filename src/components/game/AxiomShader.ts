
'use client';

/**
 * @fileOverview Axiom Frontier - High Performance Anti-Artifact Shaders
 * Optimized for maximum FPS with horizon-linear-fading to eliminate visual streaks.
 */

export const axiomVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying float vFogDepth;
varying vec3 vNormal;

uniform float uTime;
uniform float uAwakeningDensity;
uniform float uBiome; 

void main() {
  vUv = uv;
  vec3 pos = position;
  
  float amplitude = 0.5;
  if (abs(uBiome - 1.0) < 0.1) amplitude = 1.5; 
  else if (abs(uBiome - 2.0) < 0.1) amplitude = 4.0;

  float elevation = sin(pos.x * 0.05) * cos(pos.z * 0.05) * amplitude;
  pos.y += elevation;
  
  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  
  vPosition = modelPosition.xyz;
  vFogDepth = -viewPosition.z;
  vNormal = normalMatrix * normal;

  gl_Position = projectionMatrix * viewPosition;
}
`;

export const axiomFragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying float vFogDepth;
varying vec3 vNormal;

uniform float uTime;
uniform float uAwakeningDensity; 
uniform float uBiome;
uniform vec3 uCameraPosition;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;

void main() {
    vec3 normal = normalize(vNormal);
    float lighting = 0.8 + 0.2 * max(normal.y, 0.0);

    vec3 finalColor = vec3(0.04, 0.05, 0.1);
    if (abs(uBiome - 0.0) < 0.1) finalColor = vec3(0.01, 0.02, 0.06); 
    else if (abs(uBiome - 1.0) < 0.1) finalColor = vec3(0.01, 0.06, 0.03); 

    // Optimized grid logic
    float dist = distance(vPosition, uCameraPosition);
    float gridFade = clamp(1.0 - (dist - 100.0) / 150.0, 0.0, 1.0);
    
    vec2 gridUV = vPosition.xz * 0.25; 
    vec2 grid = abs(fract(gridUV - 0.5) - 0.5);
    float line = min(grid.x, grid.y);
    float gridPattern = smoothstep(0.0, 0.05, 0.01 / (line + 0.001));
    
    vec3 gridColor = vec3(0.1, 0.6, 0.6);
    finalColor = mix(finalColor, gridColor, clamp(gridPattern, 0.0, 1.0) * 0.15 * gridFade);

    finalColor *= lighting;

    float fogFactor = smoothstep(uFogNear, uFogFar, vFogDepth);
    gl_FragColor = vec4(mix(finalColor, uFogColor, fogFactor), 1.0);
}
`;
