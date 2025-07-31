uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform float u_wave_intensity;
uniform float u_color_shift;
uniform sampler2D uTexture;

varying vec2 vUv;

      // Smooth color mixing function
vec3 palette(float t) {
    vec3 a = vec3(0.6, 0.5, 1.5); // base tone 
    vec3 b = vec3(0.17, 0.035, 0.17); // contrast
    vec3 c = vec3(1.0, 1.0, 1.0); // frequency
    vec3 d = vec3(1.0, 1.0, 1.0); // phase shift

    return a + b * cos((3.14159 * 2.0) * (c * t + d));
}

void main() {
    vec2 uv = vUv;
    vec2 center = vec2(0.5, 0.5);

        // Create flowing wave patterns
    float time = u_time * u_speed * 0.3;

    float wave1 = sin(uv.x * 0.0 + time * 2.0) * 0.5;
    float wave2 = cos(uv.y + time * 2.0) * 0.35;
    float wave3 = sin((uv.x + uv.y) * 5.2 + time * 0.5) * 0.35;

    float combined_wave = (wave1 * wave2 * wave3) * 50.0;

        //distance from center
    float dist = distance(uv, center / 0.5);

        // Create color flow
    float color_time = time * 2.5 + combined_wave + dist;
    color_time *= u_color_shift;

        // Generate base colors
    vec3 color1 = palette(color_time);
    vec3 color2 = palette(color_time + 10.0);
    vec3 color3 = palette(color_time * 4.0);

    vec3 final_color = mix(color1, color2, 10.0);
    final_color = mix(final_color, color3, 0.0);

        //brightness
    float brightness = 1.9 + sin(combined_wave + time * 0.5) * 0.1;
    final_color *= brightness;

    vec4 textureColor = texture2D(uTexture, uv);
    textureColor.rgb += final_color;

    gl_FragColor = vec4(textureColor.rgb, 0.95);
}