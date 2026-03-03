// Vertex Shader - High Detail Displacement & Glitch Support
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
      amplitude = 0.15;
      frequency = 0.8;
  } else if (abs(uBiome - 1.0) < 0.1) { 
      amplitude = 2.5;
      frequency = 1.5;
  } else if (abs(uBiome - 2.0) < 0.1) { 
      amplitude = 9.0;
      frequency = 0.8;
  } else if (abs(uBiome - 4.0) < 0.1) { 
      amplitude = 3.0;
      frequency = 0.4;
  } else if (abs(uBiome - 5.0) < 0.1) { 
      amplitude = 0.5;
      frequency = 0.5;
  } else { 
      amplitude = 1.2;
      frequency = 0.6;
  }

  float elevation = snoise(pos.xz * 0.02 * frequency) * amplitude;
  elevation += snoise(pos.xz * 0.05 * frequency) * (amplitude * 0.4);
  elevation += snoise(pos.xz * 0.15) * (amplitude * 0.1);
  
  if (abs(uBiome - 0.0) < 0.1) {
      elevation *= 0.15;
  }

  float glitchFactor = step(0.98, sin(uTime * 1.5 + pos.x * 20.0)) * (uAwakeningDensity + uCorruption * 0.5);
  pos.x += glitchFactor * 0.5 * snoise(pos.xz + uTime);
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

// Fragment Shader - Rich Biome Texturing with Procedural Detail
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
uniform bool uIsHovered;
uniform bool uIsSelected;
uniform vec3 uCameraPosition;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;

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

float fbm(vec2 p) {
    float f = 0.0;
    f += 0.5000 * snoise(p); p *= 2.02;
    f += 0.2500 * snoise(p); p *= 2.03;
    f += 0.1250 * snoise(p); p *= 2.01;
    f += 0.0625 * snoise(p);
    return f / 0.9375;
}

void main() {
    vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));
    float slope = 1.0 - normal.y; 
    float sunDot = max(dot(normal, normalize(vec3(0.6, 0.8, 0.4))), 0.0);
    float lighting = 0.45 + sunDot * 0.55;

    vec3 finalColor = vec3(0.0);
    float noiseBase = fbm(vPosition.xz * 0.15);
    
    // CITY BIOME
    if (abs(uBiome - 0.0) < 0.1) { 
        vec3 darkConcrete = vec3(0.02, 0.03, 0.06); // ARL Void/Deep mix
        vec3 techGrey = vec3(0.06, 0.08, 0.15);
        finalColor = mix(darkConcrete, techGrey, noiseBase);
        
        // Tech Grid (ARL Teal)
        vec2 grid = abs(fract(vPosition.xz * 0.5 - 0.5) - 0.5) / fwidth(vPosition.xz * 0.5);
        float line = min(grid.x, grid.y);
        float gridPattern = 1.0 - min(line, 1.0);
        finalColor = mix(finalColor, vec3(0.12, 0.72, 0.72), gridPattern * 0.15);
    } 
    // FOREST
    else if (abs(uBiome - 1.0) < 0.1) {
        vec3 forestGreen = vec3(0.02, 0.05, 0.03);
        vec3 brightGreen = vec3(0.3, 0.48, 0.37); // ARL Sage
        finalColor = mix(forestGreen, brightGreen, noiseBase);
    }
    // MOUNTAIN
    else if (abs(uBiome - 2.0) < 0.1) {
        vec3 rock = vec3(0.12, 0.16, 0.29); // ARL Border
        vec3 snow = vec3(0.91, 0.87, 0.78); // ARL Text Primary
        finalColor = mix(rock, snow, smoothstep(2.0, 6.0, vPosition.y + noiseBase * 2.0));
    }
    else {
        finalColor = mix(vec3(0.04, 0.05, 0.1), vec3(0.09, 0.13, 0.25), noiseBase);
    }

    finalColor *= lighting;

    // Post-Processing Overlay (ARL Arcane Glow)
    vec2 hex_uv = vPosition.xz * 0.2;
    vec3 hex_p1 = fract(hex_uv.xyx / vec3(1.0, 0.866, 0.5));
    float hex_d = abs(hex_p1.z - 0.5);
    hex_d = max(hex_d, abs(dot(hex_p1.xy, vec2(0.5, 0.866)) - 0.5));
    hex_d = max(hex_d, abs(dot(hex_p1.xy, vec2(-0.5, 0.866)) - 0.5));
    float hex_grid = smoothstep(0.01, 0.03, hex_d);
    finalColor = mix(finalColor, vec3(0.48, 0.31, 0.83), (1.0 - hex_grid) * uStability * 0.1);

    // Fog
    float fogFactor = smoothstep(uFogNear, uFogFar, vFogDepth);
    gl_FragColor = vec4(mix(finalColor, uFogColor, fogFactor), 1.0);
}
`;