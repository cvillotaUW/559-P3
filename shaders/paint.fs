// declare the varying variable that gets passed to the fragment shader
 varying vec2 v_uv;

 // get the texture from the program
 uniform sampler2D tex;
 uniform vec2 point;

void main()
{
    float xdist = v_uv.x - point.x;
    float ydist = v_uv.y - point.y;
    float dist = sqrt(xdist*xdist + ydist*ydist);
    float mixvalue = 1.-smoothstep(0., .1, dist);
    gl_FragColor = mix(texture2D(tex, v_uv), vec4(0., 0., 0., 1.0), mixvalue);
}

