// declare the varying variable that gets passed to the fragment shader
 varying vec2 v_uv;

 // get the texture from the program
 uniform sampler2D dirty;
 uniform bool isClean;
 uniform vec3 color;

void main()
{

    gl_FragColor = vec4(v_uv.x, v_uv.y, 0, 1.);
}

