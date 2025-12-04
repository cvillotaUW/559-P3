// declare the varying variable that gets passed to the fragment shader
 varying vec2 v_uv;

 // get the texture from the program
 uniform sampler2D dirty;
 uniform bool isClean;
 uniform vec3 color;

void main()
{

    gl_FragColor = mix(vec4(color, 1), vec4(87./255., 43./255., 21./255., 1), max(texture2D(dirty, v_uv).r-float(isClean), 0.));
}

