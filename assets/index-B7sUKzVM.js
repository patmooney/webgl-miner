(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function o(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(r){if(r.ep)return;r.ep=!0;const n=o(r);fetch(r.href,n)}})();const z=`#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer

in vec2 a_position;
in vec2 a_texcoord;

uniform int tileX;
uniform int tileW;
uniform vec2 camera;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

uniform highp sampler2D u_data;

out vec2 v_texcoord;
out float b_type;
out float durability;

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

  vec2 tile = texelFetch(u_data, ivec2(row, col), 0).rg;

  b_type = tile.r;
  durability = tile.g;
  v_texcoord = a_texcoord;
}
`,V=`#version 300 es

precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

in float b_type;
in float durability;

// The texture.
uniform sampler2D u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  vec2 tcoord = vec2(v_texcoord.x + (0.2 * b_type), v_texcoord.y);
  outColor = texture(u_texture, tcoord) * vec4(1.0, durability, durability, 1.0);
}`,G=`#version 300 es

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
`,k=`#version 300 es

precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

// The texture.
uniform sampler2D u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_texcoord);
}`;function N(e){console&&(console.error?console.error(e):console.log&&console.log(e))}const j=/ERROR:\s*\d+:(\d+)/gi;function F(e,t=""){const o=[...t.matchAll(j)],i=new Map(o.map((r,n)=>{const s=parseInt(r[1]),d=o[n+1],f=d?d.index:t.length,m=t.substring(r.index,f);return[s-1,m]}));return e.split(`
`).map((r,n)=>{const s=i.get(n);return`${n+1}: ${r}${s?`

^^^ ${s}`:""}`}).join(`
`)}function K(e,t,o,i){const r=i||N,n=e.createShader(o);if(!n)return r("No shader"),null;if(e.shaderSource(n,t),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS)){const d=e.getShaderInfoLog(n);return r(`Error compiling shader: ${d}
${F(t,d??"")}`),e.deleteShader(n),null}return n}function Z(e,t,o,i,r){const n=r||N,s=e.createProgram();if(!s)return null;if(t.forEach(function(f){e.attachShader(s,f)}),o&&o.forEach(function(f,m){e.bindAttribLocation(s,i?i[m]:m,f)}),e.linkProgram(s),!e.getProgramParameter(s,e.LINK_STATUS)){const f=e.getProgramInfoLog(s),m=t.map(L=>{const H=F(e.getShaderSource(L)??"");return`${e.getShaderParameter(L,e.SHADER_TYPE)}:
${H}`}).join(`
`);return n(`Error in program linking: ${f}
${m}`),e.deleteProgram(s),null}return s}const q=["VERTEX_SHADER","FRAGMENT_SHADER"];function D(e,t,o=[],i=[],r=()=>{}){const n=[];for(let s=0;s<t.length;++s)n.push(K(e,t[s],e[q[s]],r));return Z(e,n.filter(Boolean),o,i,r)}function B(e,t){t=t||1;const o=e.clientWidth*t|0,i=e.clientHeight*t|0;return e.width!==o||e.height!==i?(e.width=o,e.height=i,!0):!1}const P=async(e,t)=>{const o=e.createTexture()??void 0;if(!o)throw new Error("Invalid texture");e.bindTexture(e.TEXTURE_2D,o);const i=new Image;return i.src=t,new Promise(r=>{i.onload=()=>{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.bindTexture(e.TEXTURE_2D,null),r(o)}})},C=""+new URL("atlas-87UWou6H.png",import.meta.url).href,c=40,u=20,J=5,v=1/J,R=2,y={RIGHT:0,LEFT:2,DOWN:1},x={0:0*Math.PI/180,1:90*Math.PI/180,2:180*Math.PI/180,3:270*Math.PI/180},S=360*Math.PI/180,U={FLOOR:0,ROCK:10,ORE:100,SHADOW:0,HOME:0},Q={FLOOR:!0,ROCK:!1,ORE:!1,SHADOW:!1,HOME:!0},l={FLOOR:0,ROCK:1,ORE:2,SHADOW:3,HOME:4},g={ROCK:[{item:"stone",chance:1}]},tt=e=>Object.entries(l).find(([,t])=>t===e)?.[0]??"FLOOR",W=()=>{const e=u/2-4,t=u/2+4,o=u/2-2,i=u/2+2;let r=[];for(let n=0;n<u*u;n++){const s=n%u,d=Math.floor(n/u);if(d>o&&d<i&&s>o&&s<i){r.push(l.HOME,1);continue}if(d>e&&d<t&&s>e&&s<t){r.push(l.FLOOR,1);continue}if((d===e||d===t)&&s>=e&&s<=t){r.push(l.ROCK,1);continue}if((s===e||s===t)&&d>=e&&d<=t){r.push(l.ROCK,1);continue}r.push(l.SHADOW,1)}return new Float32Array(r)},p=e=>{const[t,o]=e,i=o*u+t,r=_().at(i*R),n=_().at(i*R+1)??0;if(r===void 0)throw new Error(`Invalid tile ${t} / ${o}`);return{coord:e,tile:tt(r),type:r,durability:n}},w=e=>[Math.round(e[0]/c),Math.round(e[1]/c)],et=e=>{const t=[],[o,i]=e;return o>0&&t.push(p([o-1,i])),o<u-1&&t.push(p([o+1,i])),i>0&&t.push(p([o,i-1])),i<u-1&&t.push(p([o,i+1])),t};let A;const _=()=>(A||(A=W()),A),ot=e=>{const t=_(),[o,i]=e.coord,r=i*u+o;t[r*R]=e.type,t[r*R+1]=e.durability};class it{type;delta;value;timeEnd;entityId;isComplete=!1;isStarted=!1;constructor(t,{delta:o,value:i,timeEnd:r,entityId:n}){this.type=t,this.delta=o,this.value=i,this.timeEnd=r,this.entityId=n,this.type==="ROTATE"&&(this.value=Math.max(Math.min(3,this.value??0),-3)),this.type==="MOVE"&&(this.value=Math.max(0,Math.min(u,i??0)))}complete(){this.isComplete=!0}start(){this.isStarted=!0}}class rt{stack;mapUpdates;constructor(){this.stack=[],this.mapUpdates=[]}getActions(){const t=Date.now(),o=[...this.stack.filter(i=>!i.isComplete)];return this.stack=this.stack.filter(i=>i.timeEnd>=t&&!i.isComplete),o}addAction(t,{delta:o,value:i,timeEnd:r,entityId:n}){const s=new it(t,{delta:o,value:i,timeEnd:r,entityId:n});this.stack.push(s)}getMapUpdates(){const t=[...this.mapUpdates];return this.mapUpdates=[],t}addMapUpdate(t){this.mapUpdates.push(t),ot(t)}}const X={stone:"Stone",iron:"Iron ore"};class ${inventory={};add(t,o=1){this.inventory[t]=(this.inventory[t]??0)+o}remove(t,o=1){return(this.inventory[t]??0)>=o?(this.inventory[t]=this.inventory[t]-o,this.inventory[t]||delete this.inventory[t],!0):!1}}const O=(e,t,o)=>Math.max(e,Math.min(t,o)),nt=10,Y=-3;class st{camera=[0,0];actions;zoom=0;selectedEntity;inventory;entities=[];constructor(){this.actions=new rt,this.inventory=new $}resolution(t){const o=t.canvas.height/t.canvas.width,i=t.canvas.width+100*this.zoom,r=t.canvas.height+100*this.zoom*o;return[i,r]}setZoom(t){const o=O(Y,nt,t);if(o>this.zoom)this.camera[0]=this.camera[0]-c,this.camera[1]=this.camera[1]-c;else if(o<this.zoom)this.camera[0]=this.camera[0]+c,this.camera[1]=this.camera[1]+c;else return;this.zoom=o}}const a=new st,at=1,ct=function(e){e.complete();const t=dt(w(this.coords),this.angle,1);if(t.type===l.ROCK||t.type===l.ORE){let o=t.durability*U[t.tile];o-=at;const i=g[t.tile]??[];for(let r of i)Math.random()<=r.chance&&this.inventory.add(r.item);if(o<=0){const r=et(t.coord);a.actions.addMapUpdate({...t,type:l.FLOOR,durability:1});for(let n of r)n.type===l.SHADOW&&a.actions.addMapUpdate({...n,type:l.ROCK,durability:1})}else a.actions.addMapUpdate({...t,durability:o/U[t.tile]})}},dt=(e,t,o=1)=>{const i=[...e];return t===0?i[0]+=o:t===1?i[1]-=o:t===2?i[0]-=o:t===3&&(i[1]+=o),p(i)},ut=function(e){if(!e.isStarted){const o=ht(e.value,this.angle,this.coords);this.angle===3&&(this.target=[this.coords[0],this.coords[1]+o*c]),this.angle===0&&(this.target=[this.coords[0]+o*c,this.coords[1]]),this.angle===1&&(this.target=[this.coords[0],this.coords[1]-o*c]),this.angle===2&&(this.target=[this.coords[0]-o*c,this.coords[1]]),e?.start()}let t;this.target&&(t=[O(-this.moveSpeed,this.moveSpeed,this.target[0]-this.coords[0]),O(-this.moveSpeed,this.moveSpeed,this.target[1]-this.coords[1])]),t?.[0]===0&&t?.[1]===0&&(e?.complete(),this.target=void 0,t=void 0),t&&(this.coords=[this.coords[0]+t[0],this.coords[1]+t[1]])},ht=(e,t,o)=>{let i=[0,0];t===y.DOWN?i=[0,-c]:t===y.LEFT?i=[-c,0]:t===y.RIGHT?i=[c,0]:i=[0,c];let r=0,n=[...o];for(;r<e;){n[0]+=i[0],n[1]+=i[1];const s=w(n),d=p(s);if(!Q[d.tile])break;r++}return r},ft=function(e){let t=this.targetR;if(e.isStarted||(t=this.angle+e.value,t<0&&(t=4+t),t>3&&(t=t-4),e.start()),t===void 0){e.complete();return}this.targetR=t;const o=x[this.targetR];let i=0;if(e.value<0){let r=this.rad<o?this.rad+S:this.rad;i=-.05,r+i<=o&&e.complete()}else{let r=this.rad>o?this.rad-S:this.rad;i=.05,r+i>=o&&e.complete()}e.isComplete?(this.rad=x[this.targetR],this.angle=this.targetR,this.targetR=void 0):this.rad+=i,this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad)},b=document.querySelector("#console div#output"),lt=e=>{h(" "),h(` > ${e}`);const[t,o]=e.split(" "),i=t.toLowerCase(),r=Et(i,o);if(r===!1){h("[ERROR] Invalid argument");return}else if(r)return;const n=mt(i,o);if(n===!1){h("[ERROR] No entity selected!");return}else if(n){vt(a.actions.stack.at(-1));return}h(`[ERROR] Unknown command: ${i}`)},mt=(e,t)=>{const o=a.selectedEntity!==void 0?a.entities.find(r=>r.id===a.selectedEntity):void 0;if(!o)return;const i=r=>(a.actions.addAction(r,{entityId:o.id,timeEnd:Date.now()+1e5,value:parseInt(t??0)}),!0);if(o.actions.includes(e.toUpperCase()))return i(e.toUpperCase())},Et=(e,t)=>{switch(e){case"help":return _t(),!0;case"list":return Rt(),!0;case"selected":return yt(),!0;case"commands":return At(),!0;case"storage":return bt(),!0;case"inventory":return xt(),!0;case"select":return pt(parseInt(t));default:return}},pt=e=>isNaN(e)||!a.entities.find(t=>t.id===e)?!1:(a.selectedEntity=e,h(`Entity ${e} selected`),!0),vt=e=>{e&&h(`[${(Date.now()/1e3).toFixed(0)}] Entity [0] - ${e.type}: ${e.value}`)},M=(e,t)=>{h(`[ENTITY:${e}] ${t}`)},h=e=>{e.split(`
`).map(t=>{const o=document.createElement("p");o.textContent=t||" ",b?.appendChild(o)}),b?.scrollTo(0,b.scrollHeight??0)},Tt=()=>{h(`
Welcome
========

Type "help" to get started
`)},Rt=()=>{h(`
ENTITIES
==========

${a.entities.map(e=>`[${e.id}] - ${e.type}`).join(`
`)}
`)},_t=()=>{h(`
HELP
=====

- Manage -
list       - List available entities
storage    - Show current store inventory

- Entity -
select <n> - Select entity for control
selected   - Show currently selected entitiy
commands   - List available commands for selected entity
inventory  - Show current entity inventory
`)},yt=()=>{const e=a.selectedEntity!==void 0?a.entities.find(t=>t.id===a.selectedEntity):void 0;h(`
SELECTED
=========

${e?`[${e.id}] - ${e.type}`:"- NONE -"}
`)},At=()=>{const e=a.selectedEntity!==void 0?a.entities.find(t=>t.id===a.selectedEntity):void 0;if(!e)return h("[ERROR] No entity selected");h(`
COMMANDS
=========

${e.actions.map(t=>` - ${t.toLowerCase()}`).join(`
`)}
`)},bt=()=>{h(`
STORAGE
========

${Object.entries(a.inventory.inventory).map(([e,t])=>`${X[e]} - ${t}`).join(`
`)}
`)},xt=()=>{const e=a.selectedEntity!==void 0?a.entities.find(t=>t.id===a.selectedEntity):void 0;if(!e)return h("[ERROR] No entity selected");h(`
INVENTORY
==========

${Object.entries(e.inventory.inventory).map(([t,o])=>`${X[t]} - ${o}`).join(`
`)}
`)},Ot=function(e){e.complete();const t=w(this.coords);p(t).type===l.HOME?(Object.entries(this.inventory.inventory).forEach(([i,r])=>{a.inventory.add(i,r),this.inventory.remove(i,r)}),M(this.id,"Unloading")):M(this.id,"Unable to unload")},wt=function(e){if(!this.actions.includes(e.type)){e.complete();return}switch(e.type){case"MOVE":return ut.call(this,e);case"ROTATE":return ft.call(this,e);case"MINE":return ct.call(this,e);case"UNLOAD":return Ot.call(this,e)}};class Lt{id;type;actions;rotation=[0,1];rad=x[3];angle=3;inventory;target;targetR;coords;moveSpeed=c/100;indices;positions;binds;program;vao;vbo;posBuf;atlas;constructor(t,o,i=["MOVE","ROTATE"]){this.id=t,this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,v*2,0,0,c,v*3,0,c,0,v*2,1,c,c,v*3,1]),this.coords=[Math.round(u/2*c)-c/2,Math.round(u/2*c)-c/2],this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad),this.actions=i,this.type=o,this.inventory=new $}async init(t){const o=D(t,[G,k]);if(!o)throw new Error("No program");this.program=o;const i={position:t.getAttribLocation(o,"a_position"),move:t.getUniformLocation(o,"u_movement"),tileW:t.getUniformLocation(o,"tileW"),atlas:t.getAttribLocation(o,"a_texcoord"),camera:t.getUniformLocation(o,"camera"),resolution:t.getUniformLocation(o,"u_resolution"),rotation:t.getUniformLocation(o,"u_rotation")};if(i.camera===null||i.position===null||i.resolution===null||i.move===null||i.atlas===null)throw new Error("Bad binds");if(this.binds=i,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const r=2,n=t.FLOAT,s=!1,d=4*Float32Array.BYTES_PER_ELEMENT;let f=0;if(t.vertexAttribPointer(this.binds.position,r,n,s,d,f),t.enableVertexAttribArray(this.binds.position),f+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,r,n,s,d,f),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await P(t,C),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}update(t){t&&wt.call(this,t)}render(t,o){!this.binds||!this.program||!this.vao||!this.vbo||!this.posBuf||!this.atlas||(B(t.canvas),t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),0),t.uniform2fv(this.binds.camera,[-o[0],-o[1]]),t.uniform2fv(this.binds.move,this.coords),t.uniform2fv(this.binds.rotation,this.rotation),t.uniform1f(this.binds.tileW,c/2),t.uniform2f(this.binds.resolution,...a.resolution(t)),t.drawElements(t.TRIANGLES,6,t.UNSIGNED_SHORT,0))}}let E,T=document.getElementById("c");const St=()=>{T?.addEventListener("mousedown",e=>{E=[e.clientX,e.clientY]}),T?.addEventListener("mousemove",e=>{if(E){let t=[e.clientX,e.clientY];const i=.6+(a.zoom+(0-Y))*.125,r=(t[0]-(E?.[0]??0))*i,n=(t[1]-(E?.[1]??0))*i;a.camera[0]=a.camera[0]-r,a.camera[1]=a.camera[1]+n,E=t}}),T?.addEventListener("mouseup",()=>E=void 0),T?.addEventListener("mouseout",()=>E=void 0),document.addEventListener("wheel",e=>{const t=e.deltaY;a.setZoom(a.zoom+(t>0?1:-1))})};class Ut{indices;positions;binds;program;vao;vbo;posBuf;blockTex;atlas;constructor(){this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,0,1,0,c,0,0,c,0,v,1,c,c,v,0])}async init(t){const o=D(t,[z,V]);if(!o)throw new Error("No program");this.program=o;const i={position:t.getAttribLocation(o,"a_position"),atlas:t.getAttribLocation(o,"a_texcoord"),tileW:t.getUniformLocation(o,"tileW"),tileX:t.getUniformLocation(o,"tileX"),camera:t.getUniformLocation(o,"camera"),resolution:t.getUniformLocation(o,"u_resolution")};if(i.camera===null||i.position===null||i.resolution===null||i.tileW===null||i.tileX===null||i.atlas===null)throw new Error("Bad binds");if(this.binds=i,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const r=2,n=t.FLOAT,s=!1,d=4*Float32Array.BYTES_PER_ELEMENT;let f=0;if(t.vertexAttribPointer(this.binds.position,r,n,s,d,f),t.enableVertexAttribArray(this.binds.position),f+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,r,n,s,d,f),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");if(t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await P(t,C),this.blockTex=t.createTexture()??void 0,!this.blockTex)throw new Error("No block texture");t.bindTexture(t.TEXTURE_2D,this.blockTex);const m=_();t.texImage2D(t.TEXTURE_2D,0,t.RG32F,u,u,0,t.RG,t.FLOAT,m),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}update(t,o){o?.length&&this.blockTex&&(t.bindTexture(t.TEXTURE_2D,this.blockTex),o.forEach(i=>{t.texSubImage2D(t.TEXTURE_2D,0,i.coord[1],i.coord[0],1,1,t.RG,t.FLOAT,new Float32Array([i.type,i.durability]))}),t.bindTexture(t.TEXTURE_2D,null))}render(t,o){!this.binds||!this.program||!this.vao||!this.blockTex||!this.vbo||!this.posBuf||!this.atlas||(t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.uniform1i(this.binds.tileW,c),t.uniform1i(this.binds.tileX,u),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.blockTex),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_data"),0),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),1),t.uniform2fv(this.binds.camera,[-o[0],-o[1]]),t.uniform2f(this.binds.resolution,...a.resolution(t)),t.drawElementsInstanced(t.TRIANGLES,this.indices.length,t.UNSIGNED_SHORT,0,u*u))}}const I=document.querySelector("#console input"),Mt=async e=>{W();const t=new Ut;a.entities.push(new Lt(a.entities.length,"MINER",["ROTATE","MOVE","MINE","UNLOAD"])),a.camera=[(u/2-9)*c,(u/2-6)*c],St();for(let o of a.entities)await o.init(e);for(await t.init(e),I?.addEventListener("keyup",o=>{const i=o.key,r=o.target.value;i==="Enter"&&r.length&&(lt(r),o.target.value="")}),Tt(),I?.focus();;)await new Promise(o=>requestAnimationFrame(()=>{const i=a.actions.getActions();for(let r of a.entities){const n=i.find(s=>s.entityId===r.id);r.update(n)}t.update(e,a.actions.getMapUpdates()),B(e.canvas),e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(.2,.2,.2,1),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),t.render(e,a.camera);for(let r of a.entities)r.render(e,a.camera);o()}))},It=()=>{const t=document.querySelector("#c").getContext("webgl2",{premultipliedAlpha:!1});t?.getExtension("EXT_color_buffer_float"),t&&Mt(t)};It();
