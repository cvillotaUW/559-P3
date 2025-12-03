// declare the varying variable that gets passed to the fragment shader
 varying vec2 v_uv;

 // get the texture from the program
 uniform sampler2D tex;
 uniform sampler2D dirty;
 uniform bool isClean;

void main()
{

    gl_FragColor = mix(texture2D(tex, v_uv), vec4(87./255., 43./255., 21./255., 1), max(texture2D(dirty, v_uv).r-float(isClean), 0.));
}

