// declare the varying variable that gets passed to the fragment shader
 varying vec2 v_uv;

 // get the texture from the program
 uniform sampler2D tex;
 uniform vec2 point;
 uniform vec2 point2;
 uniform vec2 point3;
 uniform vec2 point4;
 uniform vec2 point5;
 
 uniform float size;

void main()
{
    float xdist = v_uv.x - point.x;
    float ydist = v_uv.y - point.y;
    float dist = sqrt(xdist*xdist + ydist*ydist);
    
    xdist = v_uv.x - point2.x;
    ydist = v_uv.y - point2.y;
    dist = min(sqrt(xdist*xdist + ydist*ydist), dist);
        
    xdist = v_uv.x - point3.x;
    ydist = v_uv.y - point3.y;
    dist = min(sqrt(xdist*xdist + ydist*ydist), dist);
        
    xdist = v_uv.x - point4.x;
    ydist = v_uv.y - point4.y;
    dist = min(sqrt(xdist*xdist + ydist*ydist), dist);
        
    xdist = v_uv.x - point5.x;
    ydist = v_uv.y - point5.y;
    dist = min(sqrt(xdist*xdist + ydist*ydist), dist);


    float mixvalue = 1.-smoothstep(0., size, dist);
    gl_FragColor = mix(texture2D(tex, v_uv), vec4(0., 0., 0., 1.0), mixvalue);
}

