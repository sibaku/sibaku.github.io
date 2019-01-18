var fs ="";

var vs = "\
  attribute vec3 aVertexPosition;\n\
\
  void main(void) {\n\
    gl_Position = vec4(aVertexPosition, 1.0);\n\
  }\
";
//fs+="#extension GL_ARB_gpu_shader_fp64 : enable";
var fsHeader = "precision highp float;\n";
fsHeader += "uniform vec3 camPos;\n";
fsHeader += "uniform vec3 objectColor_in;\n";
fsHeader += "uniform vec3 backgroundColor_in;\n";
fsHeader += "uniform mat3 R;\n";
fsHeader +="uniform vec2 screen;\n";
fsHeader +="uniform float time;\n";
fsHeader +="uniform mat4 P;\n";
fsHeader +="uniform mat4 V;\n";
fsHeader +="uniform mat4 PInv;\n";
fsHeader +="uniform mat4 VInv;\n";
fsHeader +="uniform float doSpecular;";
fsHeader +="uniform float doLighting;";
fsHeader +="uniform vec3 lightDirection_in;";


var fsBody ="float softshadow(vec3 origin, vec3 dir, float mint, float maxt,float eps, float k )         \n";
fsBody+="{                                                                                 \n";
fsBody+="    float res = 1.0;                                                              \n";
fsBody+="	const int maxSteps =  100;                                                    \n";
fsBody+="	float t = mint;                                                               \n";
fsBody+="	float gamma = 0.3;                                                   \n";
fsBody+="	float moveFactor = 1.0 - exp(-gamma);                                \n";
fsBody+="   float alpha = 0.0005;                                                   \n";
fsBody+="   float delta = 1.7;      \n";
fsBody+="    for( int i = 0; i < maxSteps;i++)                                            \n";
fsBody+="    {                                                                             \n";
fsBody+="        float h = DE(origin + dir*t);                                             \n";
fsBody+="        float minD = min(alpha*pow(t,delta),eps); \n";
fsBody+="        if( h< minD)                                                              \n";
fsBody+="            return 0.3;                                                           \n";
fsBody+="        res = min( res, abs(k*h/t ));                                                  \n";
fsBody+="        t += h*moveFactor;                                                                   \n";
fsBody+="    }                                                                             \n";
fsBody+="    return max(res,0.3);                                                                   \n";
fsBody+="}                                                                                 \n";


fsBody+="float shadowOverRelax(vec3 origin, vec3 dir,float k, out int stepss)             \n";
fsBody+="{                                                                             \n";
fsBody+="	// forceHit: boolean enforcing to use the                                 \n";
fsBody+="	// candidate_t value as result                                            \n";
fsBody+="	float omega = 1.2;                                                        \n";
fsBody+="	const float t_min = 0.01;                                                  \n";
fsBody+="	const float t_max = 100.0;                                                \n";
fsBody+="	const float pixelRadius = 0.0001;						                  \n";
fsBody+="   const bool forceHit = false; \n";
fsBody+="	float t = t_min;                                                          \n";
fsBody+="	float candidate_error = 1000000.0;                                        \n";
fsBody+="	float candidate_t = t_min;                                                \n";
fsBody+="	float previousRadius = 0.0;                                                 \n";
fsBody+="	float stepLength = 0.0;                                                     \n";
fsBody+="	const int maxSteps = 512;                                                 \n";
fsBody+="	stepss = 0;                                                               \n";
fsBody+="	float res = 1.0; \n";
fsBody+="	for (int i = 0; i < maxSteps; ++i)                                        \n";
fsBody+="	{                                                                         \n";
fsBody+="		float signedRadius =  DE(dir*t + origin);                       \n";
fsBody+="		float radius = abs(signedRadius);                                     \n";
fsBody+="		bool sorFail = omega > 1.0 &&                                           \n";
fsBody+="		(radius + previousRadius) < stepLength;                               \n";
fsBody+="		if (sorFail)                                                          \n";
fsBody+="		{                                                                     \n";
fsBody+="			stepLength -= omega * stepLength;                                 \n";
fsBody+="			omega = 1.0;                                                        \n";
fsBody+="		} else                                                                \n";
fsBody+="		{                                                                     \n";
fsBody+="			stepLength = signedRadius * omega;                                \n";
fsBody+="		}                                                                     \n";
fsBody+="		previousRadius = radius;                                              \n";
fsBody+="		float error = radius / t;                                             \n";
fsBody+="		if (!sorFail && error < candidate_error) {                            \n";
fsBody+="			candidate_t = t;                                                  \n";
fsBody+="			candidate_error = error;                                          \n";
fsBody+="		}                                                                     \n";
fsBody+="		if (!sorFail && error < pixelRadius || t > t_max)                     \n";
fsBody+="			return 0.0;                                                            \n";
fsBody+="		res = min(res,k*radius/t); \n";
fsBody+="		t += stepLength;                                                      \n";
fsBody+="		stepss++;                                                             \n";
fsBody+="	}                                                                         \n";
fsBody+="	if ((t > t_max || candidate_error > pixelRadius) &&!forceHit)             \n";
fsBody+="		return  1.0;                                                    \n";
fsBody+="	return res;                                                       \n";
fsBody+="}                                                                             \n";


fsBody+="float sphereTraceOverRelax(vec3 origin, vec3 dir, out int stepss)             \n";
fsBody+="{                                                                             \n";
fsBody+="	// forceHit: boolean enforcing to use the                                 \n";
fsBody+="	// candidate_t value as result                                            \n";
fsBody+="	float omega = 1.2;                                                        \n";
fsBody+="	const float t_min = 0.0;                                                  \n";
fsBody+="	const float t_max = 300.0;                                                \n";
fsBody+="	const float pixelRadius = 0.001;						                  \n";
fsBody+="   const bool forceHit = false; \n";
fsBody+="	float t = t_min;                                                          \n";
fsBody+="	float candidate_error = 1000000.0;                                        \n";
fsBody+="	float candidate_t = t_min;                                                \n";
fsBody+="	float previousRadius = 0.0;                                                 \n";
fsBody+="	float stepLength = 0.0;                                                     \n";
fsBody+="	const int maxSteps = 255;                                                 \n";
fsBody+="	stepss = 0;                                                               \n";
fsBody+="	for (int i = 0; i < maxSteps; ++i)                                        \n";
fsBody+="	{                                                                         \n";
fsBody+="		float signedRadius =  DE(dir*t + origin);                       \n";
fsBody+="		float radius = abs(signedRadius);                                     \n";
fsBody+="		bool sorFail = omega > 1.0 &&                                           \n";
fsBody+="		(radius + previousRadius) < stepLength;                               \n";
fsBody+="		if (sorFail)                                                          \n";
fsBody+="		{                                                                     \n";
fsBody+="			stepLength -= omega * stepLength;                                 \n";
fsBody+="			omega = 1.0;                                                        \n";
fsBody+="		} else                                                                \n";
fsBody+="		{                                                                     \n";
fsBody+="			stepLength = signedRadius * omega;                                \n";
fsBody+="		}                                                                     \n";
fsBody+="		previousRadius = radius;                                              \n";
fsBody+="		float error = radius / t;                                             \n";
fsBody+="		if (!sorFail && error < candidate_error) {                            \n";
fsBody+="			candidate_t = t;                                                  \n";
fsBody+="			candidate_error = error;                                          \n";
fsBody+="		}                                                                     \n";
fsBody+="		if (!sorFail && error < pixelRadius || t > t_max)                     \n";
fsBody+="			break;                                                            \n";
fsBody+="		t += stepLength;                                                      \n";
fsBody+="		stepss++;                                                             \n";
fsBody+="	}                                                                         \n";
fsBody+="	if ((t > t_max || candidate_error > pixelRadius) &&!forceHit)             \n";
fsBody+="		return  1000000.0;                                                    \n";
fsBody+="	return candidate_t;                                                       \n";
fsBody+="}                                                                             \n";


fsBody+="float ambientOcclusion(vec3 p, vec3 n,float dt)                          \n";
fsBody+="{                                                                        \n";
fsBody+="	const float kmax = 5.0;                                                        \n";
fsBody+="	float occlusion = 0.0;                                               \n";
fsBody+="	float d = 0.0;                                                         \n";
fsBody+="	float factor = 0.0;                                                  \n";
fsBody+="	float s = 10.0;                                                       \n";
fsBody+="	for(float k = 1.0; k <= kmax; k+=1.0)                                       \n";
fsBody+="	{                                                                    \n";
fsBody+="		factor = 1.0/k;                                        \n";
fsBody+="		d = DE(p + k*dt*n);                                              \n";
fsBody+="		occlusion += factor*(k*dt-d);                                   \n";
fsBody+="	}                                                                    \n";
fsBody+="   float a = 1.0 - s*occlusion;\n";
fsBody+="   a = 1.0/a;\n";
fsBody+="	return max(0.0,a);                             \n";
fsBody+="}                                                                        \n";
fsBody+="                                                                         \n";
fsBody+="                                                                         \n";
fsBody+="float sphereTrace(vec3 origin, vec3 dir,out int stepsTaken)                                 \n";
fsBody+="{                                                                        \n";
fsBody+="	float maxDistance = 10.0;                                               \n";
fsBody+="   const int maxSteps = 100;                                               \n";
fsBody+="   float alpha = 0.0005;                                                   \n";
fsBody+="   float delta = 1.7;                                                      \n";
fsBody+="                                                                           \n";
fsBody+="	float totalDistance = 0.0;                                           \n";
fsBody+="	float gamma = 0.5;                                                   \n";
fsBody+="	float moveFactor = 1.0 - exp(-gamma);                                \n";
fsBody+="                                                                         \n";
fsBody+="	float minDist = 0.0001;                                              \n";
fsBody+="	int stepss=0;                                                        \n";
fsBody+="	for(int steps=0;steps < maxSteps;steps++)                            \n";
fsBody+="	{                                                                    \n";
fsBody+="		vec3 p = origin + totalDistance * dir;                           \n";
fsBody+="		float distance = DE(p);                                          \n";
fsBody+="		distance = distance > 0.0? distance : 0.0;                       \n";
fsBody+="        distance *= moveFactor;                                          \n";
fsBody+="        totalDistance += distance;                                       \n";
fsBody+="  		float minD = min(alpha*pow(totalDistance,delta),minDist);        \n";
fsBody+="		if (distance < minD) break;                                      \n";
fsBody+="				stepss++;                                                \n";
fsBody+="	}                                                                    \n";
fsBody+="	stepsTaken = stepss;                                                                     \n";
fsBody+="	return totalDistance;                                                \n";
fsBody+="                                                                         \n";
fsBody+="}                                                                        \n";


fsBody+="vec3 trace(vec3 origin, vec3 dir)                                                                      \n";
fsBody+="{                                                                                                      \n";
fsBody+="    float maxDistance = 500.0;                                                                          \n";
fsBody+="    const int maxSteps = 255;                                                                          \n";
fsBody+="                                                                                                       \n";
fsBody+="    float alpha = 0.0005;                                                                              \n";
fsBody+="    float delta = 1.7;                                                                                 \n";
fsBody+="                                                                                                       \n";
fsBody+="	float totalDistance = 0.0;                                                                         \n";
fsBody+="	float gamma = 0.3;                                                                                 \n";
fsBody+="	float moveFactor = 1.0 - exp(-gamma);                                                              \n";
fsBody+="                                                                                                       \n";
fsBody+="	float minDist = 0.0005;                                                                            \n";
fsBody+="	int stepss=0;                                                                                      \n";
fsBody+="	/*                                                                                               \n";
fsBody+="	for(int steps=0;steps < maxSteps;steps++){                                                         \n";
fsBody+="		vec3 p = origin + totalDistance * dir;                                                         \n";
fsBody+="		float distance = DE(p);                                                                        \n";
fsBody+="		distance = distance > 0.0? distance : 0.0;                                                     \n";
fsBody+="		distance *= moveFactor;                                                                        \n";
fsBody+="		totalDistance += distance;                                                                     \n";
fsBody+="  		float minD = min(alpha*pow(totalDistance,delta),minDist);                                      \n";
fsBody+="		if (distance < minD) break;                                                                    \n";
fsBody+="		                                                                                               \n";
fsBody+="		stepss++;                                                                                      \n";
fsBody+="	}                                                                                                  \n";
fsBody+="	*/                                                                                                \n";
fsBody+="	                                                                                                   \n";
fsBody+="	totalDistance = sphereTraceOverRelax(origin,dir,stepss);                                                           \n";
//fsBody+="	totalDistance = sphereTrace(origin,dir,stepss);                                                           \n";
fsBody+="	float actualDist = totalDistance >= maxDistance ? 10000000.0 : totalDistance;                                                                                                  \n";
fsBody+="	float eps = max(min(minDist,alpha*pow(totalDistance,delta)),0.00001);                              \n";
fsBody+="	vec3 pos = origin + (totalDistance-1.5*eps)*dir;                                                   \n";
fsBody+="	vec3 xDir = vec3(eps,0.0,0.0);                                                                     \n";
fsBody+="	vec3 yDir = vec3(0.0,eps,0.0);                                                                     \n";
fsBody+="	vec3 zDir = vec3(0.0,0.0,eps);                                                                     \n";
fsBody+="    int lightSteps = 0;\n";
//fsBody+="   float shadow = shadowOverRelax(pos,normalize(vec3(0,1,1)),4.0,lightSteps);\n";
fsBody+="   float shadow = softshadow(pos,normalize(vec3(0,1,1)),0.001,maxDistance,eps,4.0);\n";
//fs+="   float lightDist = sphereTrace(pos,normalize(vec3(0,1,1)),lightSteps);\n";
//fs+="   float shadow = lightDist >= maxDistance ? 1.0 : 0.4;\n";
fsBody+="   float closestDistance = DE(pos);\n";

fsBody+="	                                                                                                   \n";
fsBody+="	float fogAmount = 1.0 - exp( -totalDistance*0.01);                                                \n";
fsBody+="    vec3  fogColor  = backgroundColor_in;                                                               \n";
fsBody+="	vec3 normal = vec3(DE(pos+xDir)-DE(pos-xDir),                                                      \n";
fsBody+="		                DE(pos+yDir)-DE(pos-yDir),                                                     \n";
fsBody+="		                DE(pos+zDir)-DE(pos-zDir));                                                    \n";
fsBody+="	normal = normalize(normal*sign(-dot(dir,normal)));                                                 \n";
fsBody+="                                                                                                       \n";
fsBody+="                                                                                                       \n";
fsBody+="   float background = actualDist > maxDistance? 0.0:1.0;\n";
fsBody+="    vec3 bgColor = fogColor*(1.0-background);\n";
fsBody+="   float occl = ambientOcclusion(pos,normal,eps);\n";
fsBody+="	vec3 lightDir = normalize(lightDirection_in);\n;                                                      \n";
fsBody+= "      vec3 V = normalize(camPos- pos);\n";
fsBody += "vec3 R = -reflect(lightDir,normal);\n";
fsBody += "float specularIntensity =pow(max(dot(R,V),0.0),20.)*doSpecular;\n";
fsBody+="   float lightIntensity = max(dot(lightDir,normal),0.0)*doLighting;";
fsBody+="	vec3 color = vec3(1.0,1.0,1.0)*lightIntensity*background + (1.0-background)*vec3(1.0);                                               \n";
fsBody+=" vec3 accumulatedColor = color + vec3(1.0,1.0,1.0)*specularIntensity*background;\n";
//fs+="	return mix(mix(color,fogColor,fogAmount),vec3(1.0-float(stepss)/float(maxSteps)),fogAmount);                      \n";
//fsBody+="	return mix(vec3(1.0-float(stepss)/float(maxSteps))*objectColor_in*shadow*color,fogColor,fogAmount)*background +bgColor;                      \n";
fsBody+="	return mix(objectColor_in*shadow*accumulatedColor,fogColor,fogAmount)*background +bgColor;                      \n";
//fs+="	return mix(vec3(1.0-float(stepss)/float(maxSteps)),fogColor,fogAmount)*dot(lightDir,normal)*background;                      \n";
//fs+=" return vec3(occl);                                                      \n";

//fs+="  return normal;                                                                                                     \n";
fsBody+="                                                                                                       \n";
fsBody+="//return vec3(1.0-float(stepss)/float(maxSteps));                                                      \n";
fsBody+="//return n;                                                                                            \n";
fsBody+="}                                                                                                      \n";

fsBody+="void main(void) {                                                                                      \n";
fsBody+="  float x = gl_FragCoord.x/screen.x - 0.5;                                                                \n";
//fsBody+="  float y =  (gl_FragCoord.y  / screen.y -0.5)  *  (screen.y  / screen.x);                                     \n";
fsBody+="  float y =  (gl_FragCoord.y  / screen.y -0.5) ;                                     \n";
//fsBody+="  float y =  (gl_FragCoord.y  / screen.y -0.5);                                     \n";
fsBody+="  vec3 dir = normalize(vec3(x,y,-1.0));                                                                \n";

fsBody+= " x = x*2.;\n";
fsBody+= " y = y*2.;\n";
fsBody+= " vec4 p = vec4(x,y,-1.,1.);\n";
fsBody+= " vec4 pv = PInv*p;\n";
fsBody+= " pv.w = 0.0;\n";
fsBody+= " vec4 pw = VInv*pv;\n";




fsBody+="  gl_FragColor = vec4(trace(camPos,normalize(pw.xyz)), 1.0);                                                       \n";
fsBody+="  //  gl_FragColor = vec4(1.0,0.0,0.0, 1.0);                                                           \n";
fsBody+="  }                                                                                                    \n";

//fs += "\
//vec3 trace(vec3 origin, vec3 dir)\
//{\
//    float maxDistance = 10.0;\
//    const int maxSteps = 512;\
//    \n\
//    float alpha = 0.0005;\n\
//    float delta = 1.7;\n\
//         \n\
//float totalDistance = 0.0;\n\
//float gamma = 0.3;\n\
//float moveFactor = 1.0 - exp(-gamma);   \n\
//\n\
// float minDist = 0.0001;\
//	int stepss=0;\
//	for(int steps=0;steps < maxSteps;steps++){\
//		vec3 p = origin + totalDistance * dir;\
//		float distance = DE(p);\
//		distance = distance > 0.0? distance : 0.0;\n\
//                distance *= moveFactor;\n\
//             totalDistance += distance;\
//  		float minD = min(alpha*pow(totalDistance,delta),minDist);\n\
//if (distance < minD) break;\
//		stepss++;\
//	}\n\
//       float eps = max(min(minDist,alpha*pow(totalDistance,delta)),0.00001);\
// vec3 pos = origin + (totalDistance-1.5*eps)*dir;       \n\
//        vec3 xDir = vec3(eps,0.0,0.0);\n\
//        vec3 yDir = vec3(0.0,eps,0.0);\n\
//        vec3 zDir = vec3(0.0,0.0,eps);\n\
//float fogAmount = 1.0 - exp( -totalDistance*0.15 );\n\
//    vec3  fogColor  = vec3(0.5,0.6,0.7);\n\
//vec3 normal = vec3(DE(pos+xDir)-DE(pos-xDir),\n\
//		                DE(pos+yDir)-DE(pos-yDir),\n\
//		                DE(pos+zDir)-DE(pos-zDir));\n\
//normal = normalize(normal*sign(-dot(dir,normal)));\n\
//\n\
//\n\
//vec3 lightDir = normalize(vec3(0.0,1.0,1.0));\n\
//vec3 color = vec3(1.0,1.0,1.0)*dot(lightDir,normal);\n\
//return mix(color,fogColor,fogAmount)*vec3(1.0-float(stepss)/float(maxSteps));\n\
//\n\
////return vec3(1.0-float(stepss)/float(maxSteps));\
////return n;\n\
//}\
//void main(void) {\n\
//  float x = gl_FragCoord.x/640.0 - 0.5;\n\
//  float y =  (gl_FragCoord.y  / 480.0 -0.5)  *  (480.0  /  640.0);\n\
//  vec3 dir = normalize(vec3(x,y,-1.0));\n\
//  gl_FragColor = vec4(trace(camPos,R*dir), 1.0);\n\
//  //  gl_FragColor = vec4(1.0,0.0,0.0, 1.0);\n\
//  }\
//";
