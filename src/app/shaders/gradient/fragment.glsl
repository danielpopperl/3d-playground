varying vec2 vUv;

vec3 srgbToLinear(vec3 c) {
    return pow(c, vec3(2.0));
}

void main() {
    vec2 uv = vUv;

    vec3 color1 = srgbToLinear(vec3(0.450, 0.094, 0.078));
    vec3 color2 = srgbToLinear(vec3(0.729, 0.183, 0.160));

    vec3 final_color = mix(color1, color2, smoothstep(0.2, 0.9, uv.y));

    gl_FragColor = vec4(final_color, 1.0);
}