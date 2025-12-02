(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function o(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(r){if(r.ep)return;r.ep=!0;const n=o(r);fetch(r.href,n)}})();const $=`#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer

in vec2 a_position;
in vec2 a_texcoord;

uniform int tileX;
uniform int tileW;
uniform vec2 camera;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

uniform highp isampler2D u_data;   // integer sampler

out vec2 v_texcoord;
out float b_type;

// all shaders have a main function
void main() {

  int row = int(floor(float(gl_InstanceID / tileX)));
  int col = int(mod(float(gl_InstanceID), float(tileX)));

  float xOffset = float(col * (tileW));
  float yOffset = float(row * (tileW));

  vec2 instPos = vec2(a_position);
  instPos.x += xOffset + camera.x;
  instPos.y += yOffset + camera.y;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = instPos / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);

  b_type = float(texelFetch(u_data, ivec2(row, col), 0).r);
  v_texcoord = a_texcoord;
}
`,z=`#version 300 es

precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

in float b_type;

// The texture.
uniform sampler2D u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  if (b_type < 0.0) {
    outColor = vec4(0.0, 0.0, 0.0, 0.92);
  } else {
    vec2 tcoord = vec2(v_texcoord.x + (0.33 * b_type), v_texcoord.y);
    outColor = texture(u_texture, tcoord);
  }
}`,Y=`#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer

in vec2 a_position;
in vec2 a_texcoord;

uniform vec2 camera;
uniform vec2 u_movement;
uniform vec2 u_rotation;
uniform float tileW;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

out vec2 v_texcoord;
out float b_type;

// all shaders have a main function
void main() {

  // 10.0 is half of tileW, because we need to offset for rotation to center of tile
  vec2 p = a_position;
  float tW = float(tileW);
  p.x -= tW;
  p.y -= tW;

  vec2 rotated = vec2(
    p.x * u_rotation.y +
        p.y * u_rotation.x,
    p.y * u_rotation.y -
        p.x * u_rotation.x
  );

  rotated += tW;
  rotated += tW;

  rotated += camera + u_movement;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = rotated / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);

  v_texcoord = a_texcoord;
}
`,V=`#version 300 es

precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

// The texture.
uniform sampler2D u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_texcoord);
}`;function N(e){console&&(console.error?console.error(e):console.log&&console.log(e))}const k=/ERROR:\s*\d+:(\d+)/gi;function O(e,t=""){const o=[...t.matchAll(k)],i=new Map(o.map((r,n)=>{const s=parseInt(r[1]),h=o[n+1],u=h?h.index:t.length,E=t.substring(r.index,u);return[s-1,E]}));return e.split(`
`).map((r,n)=>{const s=i.get(n);return`${n+1}: ${r}${s?`

^^^ ${s}`:""}`}).join(`
`)}function G(e,t,o,i){const r=i||N,n=e.createShader(o);if(!n)return r("No shader"),null;if(e.shaderSource(n,t),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS)){const h=e.getShaderInfoLog(n);return r(`Error compiling shader: ${h}
${O(t,h??"")}`),e.deleteShader(n),null}return n}function H(e,t,o,i,r){const n=r||N,s=e.createProgram();if(!s)return null;if(t.forEach(function(u){e.attachShader(s,u)}),o&&o.forEach(function(u,E){e.bindAttribLocation(s,i?i[E]:E,u)}),e.linkProgram(s),!e.getProgramParameter(s,e.LINK_STATUS)){const u=e.getProgramInfoLog(s),E=t.map(U=>{const X=O(e.getShaderSource(U)??"");return`${e.getShaderParameter(U,e.SHADER_TYPE)}:
${X}`}).join(`
`);return n(`Error in program linking: ${u}
${E}`),e.deleteProgram(s),null}return s}const K=["VERTEX_SHADER","FRAGMENT_SHADER"];function I(e,t,o=[],i=[],r=()=>{}){const n=[];for(let s=0;s<t.length;++s)n.push(G(e,t[s],e[K[s]],r));return H(e,n.filter(Boolean),o,i,r)}function D(e,t){t=t||1;const o=e.clientWidth*t|0,i=e.clientHeight*t|0;return e.width!==o||e.height!==i?(e.width=o,e.height=i,!0):!1}const F=async(e,t)=>{const o=e.createTexture()??void 0;if(!o)throw new Error("Invalid texture");e.bindTexture(e.TEXTURE_2D,o);const i=new Image;return i.src=t,new Promise(r=>{i.onload=()=>{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.bindTexture(e.TEXTURE_2D,null),r(o)}})},B=""+new URL("atlas-DpFcK_7z.png",import.meta.url).href,a=40,d=100,q=3,T=1/q,R={RIGHT:0,LEFT:2,DOWN:1},y={0:0*Math.PI/180,1:90*Math.PI/180,2:180*Math.PI/180,3:270*Math.PI/180},S=360*Math.PI/180,l={SHADOW:-1,FLOOR:0,ROCK:1,ORE:2},P=()=>{const e=d/2-4,t=d/2+4;return new Int32Array(d*d).fill(1).map((i,r)=>{const n=r%d,s=Math.floor(r/d);return s>e&&s<t&&n>e&&n<t?l.FLOOR:(s===e||s===t)&&n>=e&&n<=t||(n===e||n===t)&&s>=e&&s<=t?l.ROCK:l.SHADOW})},v=e=>{const[t,o]=e,i=o*d+t,r=w().at(i);if(r===void 0)throw new Error(`Invalid tile ${t} / ${o}`);return r},C=e=>[Math.round(e[0]/a),Math.round(e[1]/a)],Z=e=>{const t=[],[o,i]=e;return o>0&&t.push({tile:[o-1,i],type:v([o-1,i])}),o<d-1&&t.push({tile:[o+1,i],type:v([o+1,i])}),i>0&&t.push({tile:[o,i-1],type:v([o,i-1])}),i<d-1&&t.push({tile:[o,i+1],type:v([o,i+1])}),t};let A;const w=()=>(A||(A=P()),A),j=e=>{const t=w(),[o,i]=e.tile,r=i*d+o;t[r]=e.type};class J{type;delta;value;timeEnd;entityId;isComplete=!1;isStarted=!1;constructor(t,{delta:o,value:i,timeEnd:r,entityId:n}){this.type=t,this.delta=o,this.value=i,this.timeEnd=r,this.entityId=n,this.type==="ROTATE"&&(this.value=Math.max(Math.min(3,this.value??0),-3)),this.type==="MOVE"&&(this.value=Math.max(0,Math.min(d,i??0)))}complete(){this.isComplete=!0}start(){this.isStarted=!0}}class Q{stack;mapUpdates;constructor(){this.stack=[],this.mapUpdates=[]}getActions(){const t=Date.now(),o=[...this.stack.filter(i=>!i.isComplete)];return this.stack=this.stack.filter(i=>i.timeEnd>=t&&!i.isComplete),o}addAction(t,{delta:o,value:i,timeEnd:r,entityId:n}){const s=new J(t,{delta:o,value:i,timeEnd:r,entityId:n});this.stack.push(s)}getMapUpdates(){const t=[...this.mapUpdates];return this.mapUpdates=[],t}addMapUpdate(t){this.mapUpdates.push(t),j(t)}}const x=(e,t,o)=>Math.max(e,Math.min(t,o)),g=10,W=-3;class tt{camera=[0,0];actions;zoom=0;selectedEntity;constructor(){this.actions=new Q}resolution(t){const o=t.canvas.height/t.canvas.width,i=t.canvas.width+100*this.zoom,r=t.canvas.height+100*this.zoom*o;return[i,r]}setZoom(t){const o=x(W,g,t);if(o>this.zoom)this.camera[0]=this.camera[0]-a,this.camera[1]=this.camera[1]-a;else if(o<this.zoom)this.camera[0]=this.camera[0]+a,this.camera[1]=this.camera[1]+a;else return;this.zoom=o}}const c=new tt,et=function(e){e.complete();const[t,o]=ot(C(this.coords),this.angle,1);if(o===l.ROCK||o===l.ORE){const i=Z(t);c.actions.addMapUpdate({tile:t,type:l.FLOOR});for(let r of i)r.type===l.SHADOW&&c.actions.addMapUpdate({tile:r.tile,type:l.ROCK})}},ot=(e,t,o=1)=>{const i=[...e];return t===0?i[0]+=o:t===1?i[1]-=o:t===2?i[0]-=o:t===3&&(i[1]+=o),[i,v(i)]},it=function(e){if(!e.isStarted){const o=rt(e.value,this.angle,this.coords);this.angle===3&&(this.target=[this.coords[0],this.coords[1]+o*a]),this.angle===0&&(this.target=[this.coords[0]+o*a,this.coords[1]]),this.angle===1&&(this.target=[this.coords[0],this.coords[1]-o*a]),this.angle===2&&(this.target=[this.coords[0]-o*a,this.coords[1]]),e?.start()}let t;this.target&&(t=[x(-this.moveSpeed,this.moveSpeed,this.target[0]-this.coords[0]),x(-this.moveSpeed,this.moveSpeed,this.target[1]-this.coords[1])]),t?.[0]===0&&t?.[1]===0&&(e?.complete(),this.target=void 0,t=void 0),t&&(this.coords=[this.coords[0]+t[0],this.coords[1]+t[1]])},rt=(e,t,o)=>{let i=[0,0];t===R.DOWN?i=[0,-a]:t===R.LEFT?i=[-a,0]:t===R.RIGHT?i=[a,0]:i=[0,a];let r=0,n=[...o];for(;r<e;){n[0]+=i[0],n[1]+=i[1];const s=C(n);if(v(s))break;r++}return r},nt=function(e){let t=this.targetR;if(e.isStarted||(t=this.angle+e.value,t<0&&(t=4+t),t>3&&(t=t-4),e.start()),t===void 0){e.complete();return}this.targetR=t;const o=y[this.targetR];let i=0;if(e.value<0){let r=this.rad<o?this.rad+S:this.rad;i=-.05,r+i<=o&&e.complete()}else{let r=this.rad>o?this.rad-S:this.rad;i=.05,r+i>=o&&e.complete()}e.isComplete?(this.rad=y[this.targetR],this.angle=this.targetR,this.targetR=void 0):this.rad+=i,this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad)},st=function(e){if(!this.actions.includes(e.type)){e.complete();return}switch(e.type){case"MOVE":return it.call(this,e);case"ROTATE":return nt.call(this,e);case"MINE":return et.call(this,e)}};class at{id;type;actions;rotation=[0,1];rad=y[3];angle=3;target;targetR;coords;moveSpeed=a/100;indices;positions;binds;program;vao;vbo;posBuf;atlas;constructor(t,o,i=["MOVE","ROTATE"]){this.id=t,this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,T*2,0,0,a,T*3,0,a,0,T*2,T*3,a,a,T*3,T*3]),this.coords=[Math.round(d/2*a)-a/2,Math.round(d/2*a)-a/2],this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad),this.actions=i,this.type=o}async init(t){const o=I(t,[Y,V]);if(!o)throw new Error("No program");this.program=o;const i={position:t.getAttribLocation(o,"a_position"),move:t.getUniformLocation(o,"u_movement"),tileW:t.getUniformLocation(o,"tileW"),atlas:t.getAttribLocation(o,"a_texcoord"),camera:t.getUniformLocation(o,"camera"),resolution:t.getUniformLocation(o,"u_resolution"),rotation:t.getUniformLocation(o,"u_rotation")};if(i.camera===null||i.position===null||i.resolution===null||i.move===null||i.atlas===null)throw new Error("Bad binds");if(this.binds=i,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const r=2,n=t.FLOAT,s=!1,h=4*Float32Array.BYTES_PER_ELEMENT;let u=0;if(t.vertexAttribPointer(this.binds.position,r,n,s,h,u),t.enableVertexAttribArray(this.binds.position),u+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,r,n,s,h,u),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await F(t,B),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}update(t){t&&st.call(this,t)}render(t,o){!this.binds||!this.program||!this.vao||!this.vbo||!this.posBuf||!this.atlas||(D(t.canvas),t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),0),t.uniform2fv(this.binds.camera,[-o[0],-o[1]]),t.uniform2fv(this.binds.move,this.coords),t.uniform2fv(this.binds.rotation,this.rotation),t.uniform1f(this.binds.tileW,a/2),t.uniform2f(this.binds.resolution,...c.resolution(t)),t.drawElements(t.TRIANGLES,6,t.UNSIGNED_SHORT,0))}}let p,_=document.getElementById("c");const ct=()=>{_?.addEventListener("mousedown",e=>{p=[e.clientX,e.clientY]}),_?.addEventListener("mousemove",e=>{if(p){let t=[e.clientX,e.clientY];const i=.6+(c.zoom+(0-W))*.125,r=(t[0]-(p?.[0]??0))*i,n=(t[1]-(p?.[1]??0))*i;c.camera[0]=c.camera[0]-r,c.camera[1]=c.camera[1]+n,p=t}}),_?.addEventListener("mouseup",()=>p=void 0),_?.addEventListener("mouseout",()=>p=void 0),document.addEventListener("wheel",e=>{const t=e.deltaY;c.setZoom(c.zoom+(t>0?1:-1))})},dt=3,L=1/dt;class ut{indices;positions;binds;program;vao;vbo;posBuf;blockTex;atlas;constructor(){this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,0,1,0,a,0,0,a,0,L,1,a,a,L,0])}async init(t){const o=I(t,[$,z]);if(!o)throw new Error("No program");this.program=o;const i={position:t.getAttribLocation(o,"a_position"),atlas:t.getAttribLocation(o,"a_texcoord"),tileW:t.getUniformLocation(o,"tileW"),tileX:t.getUniformLocation(o,"tileX"),camera:t.getUniformLocation(o,"camera"),resolution:t.getUniformLocation(o,"u_resolution")};if(i.camera===null||i.position===null||i.resolution===null||i.tileW===null||i.tileX===null||i.atlas===null)throw new Error("Bad binds");if(this.binds=i,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const r=2,n=t.FLOAT,s=!1,h=4*Float32Array.BYTES_PER_ELEMENT;let u=0;if(t.vertexAttribPointer(this.binds.position,r,n,s,h,u),t.enableVertexAttribArray(this.binds.position),u+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,r,n,s,h,u),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");if(t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await F(t,B),this.blockTex=t.createTexture()??void 0,!this.blockTex)throw new Error("No block texture");t.bindTexture(t.TEXTURE_2D,this.blockTex);const E=w();t.texImage2D(t.TEXTURE_2D,0,t.R32I,d,d,0,t.RED_INTEGER,t.INT,E),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}update(t,o){o?.length&&this.blockTex&&(t.bindTexture(t.TEXTURE_2D,this.blockTex),o.forEach(i=>{t.texSubImage2D(t.TEXTURE_2D,0,i.tile[1],i.tile[0],1,1,t.RED_INTEGER,t.INT,new Int32Array([i.type]))}),t.bindTexture(t.TEXTURE_2D,null))}render(t,o){!this.binds||!this.program||!this.vao||!this.blockTex||!this.vbo||!this.posBuf||!this.atlas||(t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.uniform1i(this.binds.tileW,a),t.uniform1i(this.binds.tileX,d),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.blockTex),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_data"),0),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),1),t.uniform2fv(this.binds.camera,[-o[0],-o[1]]),t.uniform2f(this.binds.resolution,...c.resolution(t)),t.drawElementsInstanced(t.TRIANGLES,this.indices.length,t.UNSIGNED_SHORT,0,d*d))}}let m=[];const M=document.querySelector("#console input"),b=document.querySelector("#console div#output"),ht=async e=>{const t=new ut;m.push(new at(m.length,"MINER",["ROTATE","MOVE","MINE"])),c.camera=[(d/2-9)*a,(d/2-6)*a],ct(),P();for(let i of m)await i.init(e);await t.init(e),M?.addEventListener("keyup",i=>{const r=i.key,n=i.target.value;r==="Enter"&&n.length&&(o(n),i.target.value="")}),mt(),M?.focus();const o=i=>{f(" "),f(` > ${i}`);const[r,n]=i.split(" "),s=r.toLowerCase(),h=_t(s,n);if(h===!1){f("[ERROR] Invalid argument");return}else if(h)return;const u=vt(s,n);if(u===!1){f("[ERROR] No entity selected!");return}else if(u){ft(c.actions.stack.at(-1));return}f(`[ERROR] Unknown command: ${s}`)};for(;;)await new Promise(i=>requestAnimationFrame(()=>{const r=c.actions.getActions();for(let n of m){const s=r.find(h=>h.entityId===n.id);n.update(s)}t.update(e,c.actions.getMapUpdates()),D(e.canvas),e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(.2,.2,.2,1),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),t.render(e,c.camera);for(let n of m)n.render(e,c.camera);i()}))},ft=e=>{e&&f(`[${(Date.now()/1e3).toFixed(0)}] Entity [0] - ${e.type}: ${e.value}`)},f=e=>{e.split(`
`).map(t=>{const o=document.createElement("p");o.textContent=t,b?.appendChild(o)}),b?.scrollTo(0,b.scrollHeight??0)},mt=()=>{f(`
Welcome
========

Type "help" to get started
`)},lt=()=>{f(`
ENTITIES
==========

${m.map(e=>`[${e.id}] - ${e.type}`).join(`
`)}
`)},Et=()=>{f(`
HELP
=====

list       - List available entities
select <n> - Select entity for control
commands   - List available commands for selected entity
selected   - Show currently selected entitiy
`)},pt=()=>{const e=c.selectedEntity!==void 0?m.find(t=>t.id===c.selectedEntity):void 0;f(`
SELECTED
=========

${e?`[${e.id}] - ${e.type}`:"- NONE -"}
`)},Tt=()=>{const e=c.selectedEntity!==void 0?m.find(t=>t.id===c.selectedEntity):void 0;if(!e)return f("[ERROR] No entity selected");f(`
COMMANDS
=========

${e.actions.map(t=>` - ${t.toLowerCase()}`).join(`
`)}
`)},vt=(e,t)=>{const o=c.selectedEntity!==void 0?m.find(r=>r.id===c.selectedEntity):void 0;if(!o)return!1;const i=r=>(c.actions.addAction(r,{entityId:o.id,timeEnd:Date.now()+1e5,value:parseInt(t??0)}),!0);if(o.actions.includes(e.toUpperCase()))return i(e.toUpperCase())},_t=(e,t)=>{switch(e){case"help":return Et(),!0;case"list":return lt(),!0;case"selected":return pt(),!0;case"commands":return Tt(),!0;case"select":return Rt(parseInt(t));default:return}},Rt=e=>isNaN(e)||!m.find(t=>t.id===e)?!1:(c.selectedEntity=e,f(`Entity ${e} selected`),!0),At=()=>{const t=document.querySelector("#c").getContext("webgl2",{premultipliedAlpha:!1});t&&ht(t)};At();
