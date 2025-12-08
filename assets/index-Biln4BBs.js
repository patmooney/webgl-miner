(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function i(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(o){if(o.ep)return;o.ep=!0;const s=i(o);fetch(o.href,s)}})();const d=40,h=50,Ht=30,Wt=6,C=1/Wt,F=3,it=10,Gt=200,j={RIGHT:0,LEFT:2,DOWN:1},Z={0:0*Math.PI/180,1:90*Math.PI/180,2:180*Math.PI/180,3:270*Math.PI/180},lt=360*Math.PI/180,dt={FLOOR:0,ROCK:10,ORE:100,SHADOW:0,HOME:0},nt={FLOOR:!0,ROCK:!1,ORE:!1,SHADOW:!1,HOME:!0},y={FLOOR:0,ROCK:1,SHADOW:3,HOME:4,ORE:5},Yt={ROCK:[{item:"stone",chance:.5},{item:"iron",baseChance:.02}],ORE:[{item:"stone",chance:.01},{item:"iron",baseChance:.05},{item:"copper",baseChance:.02},{item:"carbon",baseChance:.01}]},zt=e=>Object.entries(y).find(([,t])=>t===e)?.[0]??"FLOOR",_t=()=>{const e=h/2-4,t=h/2+4,i=h/2-2,n=h/2+2;let o=[];for(let s=0;s<h*h;s++){const a=s%h,c=Math.floor(s/h);if(c>i&&c<n&&a>i&&a<n){o.push(y.HOME,1,0);continue}if(c>e&&c<t&&a>e&&a<t){o.push(y.FLOOR,1,0);continue}if((c===e||c===t)&&a>=e&&a<=t){o.push(y.ROCK,1,1);continue}if((a===e||a===t)&&c>=e&&c<=t){o.push(y.ROCK,1,1);continue}o.push(y.SHADOW,1,1)}return new Float32Array(o)},b=e=>{const[t,i]=e,n=i*h+t,o=P().at(n*F),s=P().at(n*F+1)??0;if(o===void 0)throw new Error(`Invalid tile ${t} / ${i}`);return{coord:e,tile:zt(o),type:o,durability:s,tileN:n}},I=e=>[Math.round(e[0]/d),Math.round(e[1]/d)],Xt=e=>{const t=[],[i,n]=e;return i>0&&t.push(b([i-1,n])),i<h-1&&t.push(b([i+1,n])),n>0&&t.push(b([i,n-1])),n<h-1&&t.push(b([i,n+1])),t},qt=e=>{const t=h/2;return Math.round(Math.sqrt(Math.pow(e.coord[0]-t,2)+Math.pow(e.coord[1]-t,2)))};let V;const P=()=>(V||(V=_t()),V),jt=()=>{V=void 0,P()},bt=e=>{const t=P(),i=e.tileN;t[i*F]=e.type,t[i*F+1]=e.durability,t[i*F+2]=nt[e.tile]?0:1},Tt="ACTION_ADD",ot="ACTION_REMOVE";class Q{id;type;delta;value;timeEnd;entityId;parentId;result;isSilent=!1;isComplete=!1;isStarted=!1;isCancelled=!1;shouldCancel=!1;constructor(t,{delta:i,value:n,timeEnd:o,entityId:s},a=!1,c){this.type=t,this.delta=i,this.value=n,this.timeEnd=o,this.entityId=s,this.id=crypto.randomUUID(),this.isSilent=a,this.parentId=c,this.type==="ROTATE"&&(this.value=Math.max(-3,Math.min(3,this.value||1))),this.type==="MOVE"&&(this.value=Math.max(0,Math.min(h,n||0)))}complete(t){this.result=t,this.isComplete=!0}start(){this.isStarted=!0}cancel(){this.isStarted?this.shouldCancel=!0:this.isCancelled=!0}}class ut{stack;mapUpdates;mapChanges;hook;constructor(){this.stack=[],this.mapUpdates=[],this.mapChanges=[],this.hook=new EventTarget}getActions(){return this.stack.filter(i=>i.isComplete).forEach(i=>{this.hook.dispatchEvent(new CustomEvent(ot,{detail:i}))}),this.stack=[...this.stack.filter(i=>!i.isComplete&&!i.isCancelled)],this.stack}addAction(t,{delta:i,value:n,timeEnd:o,entityId:s}){const a=new Q(t,{delta:i,value:n,timeEnd:o,entityId:s});return this.stack.push(a),this.hook.dispatchEvent(new CustomEvent(Tt,{detail:a})),a}addSilentAction(t,{delta:i,value:n,timeEnd:o,entityId:s},a){const c=new Q(t,{delta:i,value:n,timeEnd:o,entityId:s},!0,a);return this.stack.push(c),c}cancelOneForEntity(t){const i=this.stack.find(o=>o.entityId===t);if(!i)return;const n=this.stack.filter(o=>o.parentId===i.id);return[i,...n].forEach(o=>o.cancel()),i}cancelAllForEntity(t){this.stack.filter(i=>i.entityId===t).forEach(i=>i.cancel())}getMapUpdates(){const t=[...this.mapUpdates];return this.mapUpdates=[],t}addMapUpdate(t){this.mapUpdates.push(t),this.mapChanges.push(t),bt(t)}}const K={RUN:["any","any","memory_or_null"],JMP:["label"],PUT:["number_memory","memory"],JEQ:["number_memory","number_memory","label"],JGT:["number_memory","number_memory","label"],JLT:["number_memory","number_memory","label"],JZE:["number_memory","label"],SUB:["number_memory","number_memory","memory"],MUL:["number_memory","number_memory","memory"],ADD:["number_memory","number_memory","memory"],DIV:["number_memory","number_memory","memory"],MOD:["number_memory","number_memory","memory"]},H=/^[A-Za-z][A-Za-z_0-9]*\:/,J=/^M_\d+/,rt={label:(e,t)=>!!e.labels?.includes(t),memory:(e,t)=>J.test(t),number_memory:(e,t)=>J.test(t)||/^\d+/.test(t),number:(e,t)=>/^\d+/.test(t),any:()=>!0,memory_or_null:(e,t)=>J.test(t)||t===void 0||t===""},Kt=e=>H.test(e),Jt=e=>{const t=e.split(`
`),i={},n=t.reduce((a,c,l)=>{if(c=c.replace(/#.+/g,"").trim(),!c)return a;const[u]=c.split(" ");if(!K[u]&&!H.test(u))return a.push([l,"UNKNOWN"]),a;if(H.test(u)){const f=u.replace(/:$/,"");if(i[f])return a.push([l,"DUPLICATE_LABEL"]),a;i[f]=l}return a},[]),o=t.reduce((a,c,l)=>{if(c=c.replace(/#.+/g,"").trim(),!c)return a;const[u,...f]=c.split(" ");if(H.test(u))return a;if(K[u]){const _=K[u];if(!_)return a;if(f.length!==_.length)return a.push([l,"INVALID"]),a;for(let R=0;R<f.length;R++)rt[_[R]]({labels:Object.keys(i)},f[R])||a.push([l,"INVALID",[R,_[R]]])}return a},n),s=t.map(a=>a.replace(/#.+/g,"").trim()).filter(Boolean).map(a=>{const[c,...l]=a.split(" ");return[c,l]});return[o.length?[]:s,o,i]},k=(e,[t])=>{const i=e.script.labels[t];e.navigateTo(i)},Zt=(e,t)=>{let[i,n]=t,o;rt.number({},i)?o=parseInt(i):o=e.getMemory(i),o&&e.putMemory(n,o)},Qt=(e,t)=>{const[i,n,o]=t;let[s,a]=[i,n].map(c=>T(e,c));if(s===a)return k(e,[o])},te=(e,t)=>{const[i,n,o]=t;let[s,a]=[i,n].map(c=>T(e,c));if(s>a)return k(e,[o])},ee=(e,t)=>{const[i,n,o]=t;let[s,a]=[i,n].map(c=>T(e,c));if(s<a)return k(e,[o])},ie=(e,t)=>{const[i,n]=t;if(T(e,i)===0)return k(e,[n])},ne=(e,t)=>{const[i,n,o]=t;let[s,a]=[i,n].map(c=>T(e,c));e.putMemory(o,s-a)},oe=(e,t)=>{const[i,n,o]=t;let[s,a]=[i,n].map(c=>T(e,c));e.putMemory(o,s+a)},re=(e,t)=>{const[i,n,o]=t;let[s,a]=[i,n].map(c=>T(e,c));e.putMemory(o,s*a)},se=(e,t)=>{const[i,n,o]=t;let[s,a]=[i,n].map(c=>T(e,c));e.putMemory(o,Math.round(s/a))},ae=(e,t)=>{const[i,n,o]=t;let[s,a]=[i,n].map(c=>T(e,c));e.putMemory(o,s%a)},ce=(e,t)=>{const[i,...n]=t,o=n.map(a=>T(e,a).toString()),s=Ut(e.entity.id,i,o);s&&e.awaitActions(s)},le={JMP:k,PUT:Zt,JEQ:Qt,JGT:te,JLT:ee,JZE:ie,SUB:ne,ADD:oe,MUL:re,DIV:se,MOD:ae,RUN:ce},T=(e,t)=>{let i;return rt.number({},t)?i=parseInt(t):i=e.getMemory(t),i??0};class st{name;lines;content;errors;labels;constructor(t,i){const[n,o,s]=Jt(i);this.name=t,this.labels=s,this.lines=n,this.errors=o,this.content=i}}const de=500;class ue{script;entity;lineIdx=0;actions;memory;execTime;isComplete=!1;constructor(t,i){this.entity=t,this.script=i,this.memory=[],this.actions=[],r.actions.hook.addEventListener(ot,n=>{const o=n.detail;this.actions=this.actions.filter(s=>s!==o.id)})}run(){if(this.lineIdx>=this.script.lines.length){this.isComplete=!0;return}if(this.execTime&&Date.now()<this.execTime||(this.execTime=Date.now()+de,this.actions.length))return;const[t,i]=this.script.lines[this.lineIdx];if(Kt(t))return this.lineIdx++,this.run();le[t](this,i),this.lineIdx++}navigateTo(t){this.lineIdx=t}awaitActions(t){this.actions.push(...t)}getMemory(t){const i=parseInt(t.replace(/[^\d]+/,""));return isNaN(i)?0:this.memory[i]}putMemory(t,i){if(isNaN(i))return;const n=parseInt(t.replace(/[^\d]+/,""));isNaN(n)||(this.memory[n]=i)}}const Rt=document.getElementById("editor-container"),Y=document.getElementById("editor"),At=document.getElementById("editor-name"),z=document.getElementById("editor-save"),me=document.getElementById("editor-cancel"),B=document.getElementById("editor-errors"),he=e=>{const t=r.scripts[e]??new st(e,"");St(t)},St=e=>{Y.classList.remove("hidden"),B.classList.add("hidden"),Y.value=e.content,At.textContent=e.name,B.innerHTML="",Rt.classList.remove("hidden"),z.textContent="Save",z.addEventListener("click",fe,{once:!0})},fe=()=>{const e=Y.value,t=At.textContent??"UNKNOWN",i=new st(t,e);if(i.errors.length){B.innerHTML="",i.content.split(`
`).forEach((n,o)=>{const s=i.errors.find(c=>c[0]===o),a=document.createElement("p");if(s){const[c,l,u]=s,[f]=n.match(/^\s+/)??[],[_,...R]=n.trim().split(" ");a.append(document.createTextNode(f??""),...[_].filter(Boolean).map(q=>{const D=document.createElement("span");return D.classList.add("mr"),D.textContent=q,D}),...R.filter(Boolean).map((q,D)=>{const U=document.createElement("span");return u?.[0]===D&&(U.classList.add("err-arg"),U.title=u?.[1]??""),U.classList.add("mr"),U.textContent=q,U})),a.classList.add("is-error"),a.title=s[1]}else a.textContent=n;B.appendChild(a)}),z.textContent="Edit",z.addEventListener("click",()=>St(i),{once:!0}),B.classList.remove("hidden"),Y.classList.add("hidden");return}r.saveScript(i),It()},It=()=>{Rt.classList.add("hidden")};me.addEventListener("click",It);function Ot(e){console&&(console.error?console.error(e):console.log&&console.log(e))}const ye=/ERROR:\s*\d+:(\d+)/gi;function wt(e,t=""){const i=[...t.matchAll(ye)],n=new Map(i.map((o,s)=>{const a=parseInt(o[1]),c=i[s+1],l=c?c.index:t.length,u=t.substring(o.index,l);return[a-1,u]}));return e.split(`
`).map((o,s)=>{const a=n.get(s);return`${s+1}: ${o}${a?`

^^^ ${a}`:""}`}).join(`
`)}function pe(e,t,i,n){const o=n||Ot,s=e.createShader(i);if(!s)return o("No shader"),null;if(e.shaderSource(s,t),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS)){const c=e.getShaderInfoLog(s);return o(`Error compiling shader: ${c}
${wt(t,c??"")}`),e.deleteShader(s),null}return s}function Ee(e,t,i,n,o){const s=o||Ot,a=e.createProgram();if(!a)return null;if(t.forEach(function(l){e.attachShader(a,l)}),i&&i.forEach(function(l,u){e.bindAttribLocation(a,n?n[u]:u,l)}),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS)){const l=e.getProgramInfoLog(a),u=t.map(f=>{const _=wt(e.getShaderSource(f)??"");return`${e.getShaderParameter(f,e.SHADER_TYPE)}:
${_}`}).join(`
`);return s(`Error in program linking: ${l}
${u}`),e.deleteProgram(a),null}return a}const ve=["VERTEX_SHADER","FRAGMENT_SHADER"];function Ct(e,t,i=[],n=[],o=()=>{}){const s=[];for(let a=0;a<t.length;++a)s.push(pe(e,t[a],e[ve[a]],o));return Ee(e,s.filter(Boolean),i,n,o)}function xt(e,t){t=t||1;const i=e.clientWidth*t|0,n=e.clientHeight*t|0;return e.width!==i||e.height!==n?(e.width=i,e.height=n,!0):!1}let W={};const _e=()=>{W={}},Lt=async(e,t)=>{if(W[t])return W[t];const i=e.createTexture()??void 0;if(!i)throw new Error("Invalid texture");e.bindTexture(e.TEXTURE_2D,i);const n=new Image;return n.src=t,new Promise(o=>{n.onload=()=>{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.bindTexture(e.TEXTURE_2D,null),W[t]=i,o(i)}})},be=`#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer

in vec2 a_position;
in vec2 a_texcoord;

uniform int tileX;
uniform int tileW;
uniform float u_atlas_w;
uniform vec2 camera;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

uniform vec3 u_light[16];

uniform highp sampler2D u_data;

out vec2 v_texcoord;
out float bright;
out float b_type;
out float durability;
out float atlas_w;

bool get_solid(float x, float y) {
  ivec2 pos = ivec2(int(x), int(y));
  float t = texelFetch(u_data, pos, 0).b;
  return t == 1.0;
}

bool is_blocked (vec2 pos1, vec2 pos2, int dist) {
  float x1 = pos1.x;
  float y1 = pos1.y;
  float x2 = pos2.x;
  float y2 = pos2.y;

  float dx = abs(x1 - x2);
  float dy = abs(y1 - y2);
  float sx = sign(x1 - x2);
  float sy = sign(y1 - y2);
  float err = dx - dy;

  if (dx < 2.0 && dy < 2.0) {
    return false;
  }

  for (int i = 0; i < dist; i++) {
    if (x1 == x2 && y1 == y2) {
      return false;
    }
    float err2 = 2.0 * err;
    if (err2 > -dy) {
      err -= dy;
      x2 += sx;
    }
    if (err2 < dx) {
      err += dx;
      y2 += sy;
    }
    if (get_solid(x2, y2) == true) {
      return true;
    }
  }

  return false;
}

// all shaders have a main function
void main() {
  int row = int(floor(float(gl_InstanceID) / float(tileX)));
  int col = int(mod(float(gl_InstanceID), float(tileX)));

  bright = 0.1;
  for (int i = 0; i < 16; i++) {
    if (u_light[i].z > 0.0) {
      vec2 l = u_light[i].xy;
      float d = distance(l.xy, vec2(col, row));
      if (d < u_light[i].z && !is_blocked(l.xy, vec2(col, row), int(u_light[i].z))) {
        bright += min(0.8, 1.0 - (d / u_light[i].z));
      }
    }
  }

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

  vec2 tile = texelFetch(u_data, ivec2(col, row), 0).rg;

  b_type = tile.r;
  durability = tile.g;
  v_texcoord = a_texcoord;
  atlas_w = u_atlas_w;
}

`,Te=`#version 300 es

precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

in float b_type;
in float durability;
in float atlas_w;
in float bright;

// The texture.
uniform sampler2D u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  vec2 tcoord = vec2(v_texcoord.x + (atlas_w * b_type), v_texcoord.y);
  outColor = texture(u_texture, tcoord) * vec4(1.0, durability, durability, 1.0);
  outColor = outColor * vec4(bright, bright, bright, 1.0);
}`,Re=`#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer

in vec2 a_position;
in vec2 a_texcoord;

uniform vec2 camera;
uniform vec2 u_movement;
uniform vec2 u_rotation;
uniform float tileW;
uniform int u_selected;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

out vec2 v_texcoord;
out float b_type;
out float is_selected;

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
  is_selected = float(u_selected);
}
`,Ae=`#version 300 es

precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;
in float is_selected;

// The texture.
uniform sampler2D u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  vec4 color = texture(u_texture, v_texcoord);
  outColor = vec4(
    color.r,
    color.g,
    // make hidden pixels a transparent blue colour
    color.b + ((1.0 - color.a) * (0.5 * is_selected)),
    color.a + (0.25 * is_selected)
  );
}`,Mt=""+new URL("atlas-DZRTRS7K.png",import.meta.url).href;class Se{indices;positions;binds;program;vao;vbo;posBuf;atlas;constructor(){this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,C*2,0,0,d,C*3,0,d,0,C*2,1,d,d,C*3,1])}async initGraphics(t){const i=Ct(t,[Re,Ae]);if(!i)throw new Error("No program");this.program=i;const n={position:t.getAttribLocation(i,"a_position"),move:t.getUniformLocation(i,"u_movement"),tileW:t.getUniformLocation(i,"tileW"),atlas:t.getAttribLocation(i,"a_texcoord"),camera:t.getUniformLocation(i,"camera"),resolution:t.getUniformLocation(i,"u_resolution"),rotation:t.getUniformLocation(i,"u_rotation"),isSelected:t.getUniformLocation(i,"u_selected")};if(n.camera===null||n.position===null||n.resolution===null||n.move===null||n.atlas===null)throw new Error("Bad binds");if(this.binds=n,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const o=2,s=t.FLOAT,a=!1,c=4*Float32Array.BYTES_PER_ELEMENT;let l=0;if(t.vertexAttribPointer(this.binds.position,o,s,a,c,l),t.enableVertexAttribArray(this.binds.position),l+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,o,s,a,c,l),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await Lt(t,Mt),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}render(t,i,n){!this.binds||!this.program||!this.vao||!this.vbo||!this.posBuf||!this.atlas||(xt(t.canvas),t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),0),t.uniform2fv(this.binds.camera,[-n[0],-n[1]]),t.uniform2fv(this.binds.move,i.coords),t.uniform2fv(this.binds.rotation,i.rotation),t.uniform1f(this.binds.tileW,d/2),t.uniform1i(this.binds.isSelected,i.id===r.selectedEntity?2:0),t.uniform2f(this.binds.resolution,...r.resolution(t)),t.drawElements(t.TRIANGLES,6,t.UNSIGNED_SHORT,0))}}const S=.01;class Ie{indices;positions;binds;program;vao;vbo;posBuf;blockTex;atlas;constructor(){this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,S,1-S,0,d,S,S,d,0,C-S,1-S,d,d,C-S,S])}async init(t){const i=Ct(t,[be,Te]);if(!i)throw new Error("No program");this.program=i;const n={position:t.getAttribLocation(i,"a_position"),atlas:t.getAttribLocation(i,"a_texcoord"),tileW:t.getUniformLocation(i,"tileW"),tileX:t.getUniformLocation(i,"tileX"),camera:t.getUniformLocation(i,"camera"),resolution:t.getUniformLocation(i,"u_resolution"),atlasW:t.getUniformLocation(i,"u_atlas_w"),light:t.getUniformLocation(i,"u_light")};if(n.camera===null||n.position===null||n.resolution===null||n.tileW===null||n.tileX===null||n.atlas===null)throw new Error("Bad binds");if(this.binds=n,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const o=2,s=t.FLOAT,a=!1,c=4*Float32Array.BYTES_PER_ELEMENT;let l=0;if(t.vertexAttribPointer(this.binds.position,o,s,a,c,l),t.enableVertexAttribArray(this.binds.position),l+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,o,s,a,c,l),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");if(t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await Lt(t,Mt),this.blockTex=t.createTexture()??void 0,!this.blockTex)throw new Error("No block texture");t.bindTexture(t.TEXTURE_2D,this.blockTex);const u=P();t.pixelStorei(t.UNPACK_ALIGNMENT,1),t.texImage2D(t.TEXTURE_2D,0,t.RGB32F,h,h,0,t.RGB,t.FLOAT,u),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}update(t,i){i?.length&&this.blockTex&&(t.bindTexture(t.TEXTURE_2D,this.blockTex),i.forEach(n=>{const o=new Float32Array([n.type,n.durability,nt[n.tile]?0:1]);t.texSubImage2D(t.TEXTURE_2D,0,n.coord[0],n.coord[1],1,1,t.RGB,t.FLOAT,o)}),t.bindTexture(t.TEXTURE_2D,null))}render(t,i){!this.binds||!this.program||!this.vao||!this.blockTex||!this.vbo||!this.posBuf||!this.atlas||(t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.uniform1i(this.binds.tileW,d),t.uniform1i(this.binds.tileX,h),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.blockTex),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_data"),0),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),1),t.uniform1f(this.binds.atlasW,C),t.uniform3fv(this.binds.light,r.lights),t.uniform2fv(this.binds.camera,[-i[0],-i[1]]),t.uniform2f(this.binds.resolution,...r.resolution(t)),t.drawElementsInstanced(t.TRIANGLES,this.indices.length,t.UNSIGNED_SHORT,0,h*h))}}let $=0;const mt=100,ht=document.getElementById("status"),Oe=e=>{if($>mt&&($=0),$++,$===mt&&ht){const i=r.selectedEntity!==void 0&&r.entities.find(n=>n.id===r.selectedEntity);ht.textContent=i?Ce(i):""}const t=r.actions.getActions();r.runScripts();for(let i of r.entities){const n=t.find(o=>o.entityId===i.id);i.update(n)}r.world?.update(e,r.actions.getMapUpdates())},we=async e=>{_t(),r.world=new Ie,r.gl=e;const t=new Se;await t.initGraphics(e),r.entityGfx=t,r.camera=[(h/2-11.5)*d,(h/2-7)*d],$i(),await r.world.init(e),r.updateLights()},Ce=e=>{const t=r.actions.getActions().find(i=>i.entityId===e.id&&!i.isComplete&&!i.isCancelled);return`
Entity:    ${e.name}
Battery:   ${e.battery} / ${e.maxBattery}
Inventory: ${e.inventory.total} / ${e.inventorySize}
${t?`${t?.type}${t?.value!==void 0?` - ${t.value}`:""}`:" - IDLE - "}
`};let at=!1;const xe=async e=>{const t=1e3/Ht;let i=Date.now();for(;at;){let n=i+t;Date.now()<n&&await new Promise(o=>setTimeout(o,10)),Oe(e),await new Promise(o=>requestAnimationFrame(()=>{xt(e.canvas),e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(.1,.1,.1,1),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),r.world?.render(e,r.camera);for(let s of r.entities)s.render(e,r.camera);o()})),i=Date.now()}},Le=()=>{const e=document.createElement("canvas");return e.id="c",e.width=1e3,e.height=600,e.style.backgroundColor="#000",e.style.transition="height 0.5s ease-out",document.querySelector("div.container > div.canvas-container")?.prepend(e),new Promise(t=>{setTimeout(()=>{e.style.height="600px",e.addEventListener("transitionend",async()=>{const i=e.getContext("webgl2",{premultipliedAlpha:!1});e.style.border="none",i&&(at=!0,await we(i),t(void 0),i.getExtension("EXT_color_buffer_float"),xe(i))},{once:!0})},1e3)})},Me=()=>(document.getElementById("c")?.remove(),at=!1,new Promise(e=>setTimeout(e,500))),ge=`
  <div id="interface_control" class="flex-row">
    <div></div>
    <div>
        <div class="flex-col gap justified items-center">
            <div class="flex-row gap">
                <div class="flex-row gap border">
                    <button>&#9651;</button>
                    <button>&#10699;</button>
                </div>
                <div class="flex-row gap justified border">
                    <button>&#9665;</button>
                    <button>&#9655;</button>
                </div>
            </div>
            <div class="flex-row gap justify-center border items-center flex-wrap">
                <button>Mine</button>
                <button>Mine x 5</button>
                <button>Unload</button>
                <button>Recharge</button>
                <button>Focus</button>
            </div>
        </div>
    </div>
    <div></div>
  </div>
`,Ne=()=>{const e=document.getElementById("nav"),t=document.getElementById("context"),i=document.createElement("div");i.textContent="Control";const n=document.createElement("div");if(n.id="control_control",n.classList.add("hidden"),n.innerHTML=ge,i.addEventListener("click",()=>Vt(i,"control_control")),e?.appendChild(i),t?.appendChild(n),Ue(n),Fe(),r.selectedEntity!==void 0){const o=r.actions.getActions().filter(s=>s.entityId===r.selectedEntity&&!s.isSilent);ft(o)}r.actions.hook.addEventListener(Tt,o=>{const s=o;s.detail.entityId===r.selectedEntity&&gt(s.detail)}),r.actions.hook.addEventListener(ot,o=>{const s=o;s.detail.entityId===r.selectedEntity&&De(s.detail)}),r.entityHook.addEventListener($t,o=>{const s=o;Array.from(document.querySelectorAll("#interface_control > div:first-child > div")).forEach(l=>l.classList.remove("active")),document.querySelector(`#interface_control > div:first-child > div[data-id="${s.detail}"]`)?.classList.add("active");const c=r.actions.getActions().filter(l=>l.entityId===r.selectedEntity&&!l.isSilent);ft(c)})},ft=e=>{const t=document.querySelector("#interface_control > div:last-child");if(t){t.innerHTML="";for(let i of e)gt(i,t)}},gt=(e,t)=>{t=t??document.querySelector("#interface_control > div:last-child")??void 0;const i=document.createElement("div");i.textContent=`${e.type} - ${e.value}`,i.dataset.id=e.id,t?.appendChild(i)},De=e=>{const t=document.querySelector("#interface_control > div:last-child")??void 0;t&&t.querySelector(`div[data-id="${e.id}"]`)?.remove()},Ue=e=>{const[t,i,n,o,s,a,c,l,u]=Array.from(e.querySelectorAll("button"));i.addEventListener("click",()=>{if(r.selectedEntity!==void 0){r.actions.addAction("MOVE",{value:5,entityId:r.selectedEntity});for(let f=1;f<5;f++)r.actions.addSilentAction("MOVE",{value:1,entityId:r.selectedEntity})}}),t.addEventListener("click",()=>{r.selectedEntity!==void 0&&r.actions.addAction("MOVE",{value:1,entityId:r.selectedEntity})}),n.addEventListener("click",()=>{r.selectedEntity!==void 0&&r.actions.addAction("ROTATE",{value:-1,entityId:r.selectedEntity})}),o.addEventListener("click",()=>{r.selectedEntity!==void 0&&r.actions.addAction("ROTATE",{value:1,entityId:r.selectedEntity})}),s.addEventListener("click",()=>{r.selectedEntity!==void 0&&r.actions.addAction("DEVICE",{value:0,entityId:r.selectedEntity})}),a.addEventListener("click",()=>{if(r.selectedEntity!==void 0){r.actions.addAction("DEVICE",{value:5,entityId:r.selectedEntity});for(let f=1;f<5;f++)r.actions.addSilentAction("DEVICE",{value:1,entityId:r.selectedEntity})}}),c.addEventListener("click",()=>{r.selectedEntity!==void 0&&r.actions.addAction("UNLOAD",{value:0,entityId:r.selectedEntity})}),l.addEventListener("click",()=>{r.selectedEntity!==void 0&&r.actions.addAction("RECHARGE",{value:100,entityId:r.selectedEntity})}),u.addEventListener("click",()=>{r.selectedEntity!==void 0&&r.focusEntity(r.selectedEntity)})},Fe=()=>{const e=document.querySelector("#interface_control > div:first-child")??void 0;e&&r.entities.forEach(t=>{const i=document.createElement("div");i.dataset.id=t.id.toString(),i.textContent=`[${t.id}] ${t.name}`,e.appendChild(i),i.addEventListener("click",()=>r.selectEntity(t.id))})},p={stone:{name:"stone",type:"RESOURCE",description:"",label:"Stone"},iron:{name:"iron",type:"RESOURCE",description:"",label:"Iron Ore"},carbon:{name:"carbon",type:"RESOURCE",description:"",label:"Carbon"},copper:{name:"copper",type:"RESOURCE",description:"",label:"Copper Ore"},coal:{name:"coal",type:"RESOURCE",description:"",label:"Coal"},interface_control:{name:"interface_control",ingredients:[{item:"stone",count:50},{item:"iron",count:10}],story:["IRON_FIRST"],description:"Extra control interface for manual remote instruction",type:"INTERFACE",waypoint:"INTERFACE_CONTROL_INTERFACE",label:"Control Interface"},interface_automation:{name:"interface_automation",ingredients:[{item:"stone",count:50},{item:"iron",count:10},{item:"copper",count:10},{item:"carbon",count:10}],story:["IRON_FIRST","CARBON_FIRST","COPPER_FIRST"],description:"Allow automated remote instruction",type:"INTERFACE",waypoint:"INTERFACE_AUTOMATION_INTERFACE",label:"Automation Interface"},interface_smelting:{name:"interface_smelting",ingredients:[{item:"iron",count:50},{item:"stone",count:200}],story:["IRON_FIRST"],description:"For the production of alloy metals",type:"INTERFACE",waypoint:"INTERFACE_SMELTING",label:"Smelting Interface"},module_visual_scanner:{name:"module_visual_scanner",ingredients:[{item:"iron",count:10}],story:["IRON_FIRST"],description:"Visually assess one tile in front",type:"MODULE",label:"Visual Scanner (Module)",quality:"BASIC",moduleType:"navigation",deviceType:"visual_scanner",stats:{}},module_basic_battery:{name:"module_basic_battery",ingredients:[{item:"stone",count:20},{item:"iron",count:10}],story:["IRON_FIRST"],description:"A very simple battery with limited capacity",type:"MODULE",label:"Basic Battery (Module)",quality:"BASIC",moduleType:"battery",stats:{battery:100,rechargeSpeed:1},actionType:["RECHARGE"]},module_basic_drill:{name:"module_basic_drill",ingredients:[{item:"iron",count:30}],story:["IRON_FIRST"],description:"A brittle, dull drill",type:"MODULE",label:"Basic Drill (Module)",quality:"BASIC",moduleType:"device",deviceType:"drill",stats:{drillSpeed:1,drillPower:1},actionType:["DEVICE"]},module_basic_motor:{name:"module_basic_motor",ingredients:[{item:"stone",count:20},{item:"iron",count:50}],story:["IRON_FIRST"],description:"5hp of pure disappointment",type:"MODULE",label:"Basic Motor (Module)",quality:"BASIC",moduleType:"engine",stats:{speed:1},actionType:["MOVE","ROTATE"]},module_basic_store:{name:"module_basic_store",ingredients:[{item:"stone",count:20},{item:"iron",count:20}],story:["IRON_FIRST"],description:"10 slot store",type:"MODULE",label:"Basic Store",quality:"BASIC",moduleType:"store",stats:{inventorySize:10},actionType:["UNLOAD"]},module_home_navigation:{name:"module_home_navigation",ingredients:[{item:"carbon",count:10},{item:"copper",count:10}],story:["CARBON_FIRST","COPPER_FIRST"],description:"Provides automated routing to nearest base",type:"MODULE",label:"Home Navigation (Module)",quality:"BASIC",moduleType:"navigation",stats:{}},module_dev:{name:"module_dev",type:"MODULE",label:"DEV DEV DEV",quality:"BASIC",description:"DEV DEV DEV",moduleType:"engine",stats:{battery:1e4,drillSpeed:10,speed:10,inventorySize:1e4,rechargeSpeed:10,drillPower:10},ingredients:[],actionType:["ROTATE","MOVE","DEVICE","UNLOAD","RECHARGE"],deviceType:"drill"},module_dev_drill:{name:"module_dev_drill",type:"MODULE",label:"DEV DEV DEV",quality:"BASIC",description:"DEV DEV DEV",moduleType:"device",ingredients:[],actionType:["DEVICE"],stats:{},deviceType:"drill"},deployable_automation_hull:{name:"deployable_automation_hull",ingredients:[{item:"iron",count:10}],story:["IRON_FIRST"],description:"An empty mining automation hull (deployable)",type:"DEPLOYABLE",label:"Basic Automation Hull",quality:"BASIC"}},Be=(e,t)=>{t<0||(r.story.STORAGE_FIRST||r.addWaypoint("STORAGE_FIRST"),e==="iron"&&!r.story.IRON_FIRST&&r.addWaypoint("IRON_FIRST"),e==="carbon"&&!r.story.CARBON_FIRST&&r.addWaypoint("CARBON_FIRST"),e==="copper"&&!r.story.COPPER_FIRST&&r.addWaypoint("COPPER_FIRST"))},Pe=(e,t)=>{if(r.story.DEPLOY_FIRST||(r.addWaypoint("DEPLOY_FIRST"),A(`An automation requires modules in order to be useful.
Useful commands: list, select, equip`)),r.entityGfx){const i=r.entities.length;t=t||`ENTITY-${i}`,r.entities.push(new Dt(r.entityGfx,r.entities.length,t,[],[])),r.updateLights()}},ke=e=>{const t=p[e];if(!t||!t.ingredients)return!1;const i=t.ingredients;for(let n of i)if((r.inventory.inventory[n.item]??0)<n.count)return!1;for(let n of i)r.inventory.remove(n.item,n.count);return t.type==="MODULE"||t.type==="DEPLOYABLE"?r.inventory.add(e):t.type==="INTERFACE"&&r.addWaypoint(t.waypoint),!0},$e=e=>{switch(e){case"STORAGE_FIRST":A(`Crafting Unlocked
see command "crafting" for more information`);break;case"IRON_FIRST":A("New recipes available");break;case"CARBON_FIRST":r.story.COPPER_FIRST&&A("New recipes available");break;case"COPPER_FIRST":r.story.CARBON_FIRST&&A("New recipes available");break;case"INTERFACE_CONTROL_INTERFACE":A("Control interface installed"),yt();break;case"INTERFACE_AUTOMATION_INTERFACE":A("Automation interface installed"),yt();break}},yt=()=>{Ne()},Nt=async()=>{A("Welcome..."),await M(500),m("Initialising environment..."),await M(500),x("INIT CONNECTION..."),await M(100),x("INIT CAMERA..."),await M(500),await Le(),await M(1500),x("INIT COMPLETE"),await M(1500),X(),A(`Your first task will be to deploy and construct a mining automation
========
Type "help" to get started
Useful commands: storage, deploy`);const e=[];[["deployable_automation_hull",1],["module_basic_drill",1],["module_basic_motor",1],["module_basic_store",1],["module_basic_battery",1]].forEach(([i,n])=>r.inventory.add(i,n)),e.forEach(i=>r.addWaypoint(i)),r.saveScript(new st("test",`
        START:
            RUN move 3
            RUN mine 10
            RUN rotate 2
            RUN move 3
            RUN unload
            RUN rotate 2
            RUN recharge
    `)),r.inventory.hook=Be,r.onStory=$e,r.onDeploy=Pe},M=e=>new Promise(t=>setTimeout(t,e)),Ve=2,He=2200,We=2e3,Ge=function(e){const i=this.modules.filter(o=>p[o].moduleType==="device").at(e.value);switch(i?p[i].deviceType:void 0){case"drill":return Ye.call(this,e);case"visual_scanner":return ze.call(this,e);default:E(`Entity [${this.id}] - Unknown device [${e.value}]`),e.complete();return}},Ye=function(e){if(e.isStarted||(e.timeEnd=Date.now()+(He-this.drillSpeed*200),e.start()),e.timeEnd>Date.now())return;e.complete();const t=ct(I(this.coords),this.angle,1);if(t.type===y.ROCK||t.type===y.ORE){let i=t.durability*dt[t.tile];i-=this.drillPower;const n=qt(t);for(let o=0;o<this.drillPower;o++){const s=Yt[t.tile]??[];for(let a of s){let c=a.chance?a.chance:(a.baseChance??0)*(n*.2);for(;c>0;)Math.random()<=c&&this.inventory.add(a.item),c-=1}}if(i<=0){const o=Xt(t.coord);r.actions.addMapUpdate({...t,type:y.FLOOR,durability:1,tile:"FLOOR"});for(let s of o)if(s.type===y.SHADOW){let a=y.ROCK,c="ROCK";Math.random()<.01*n&&(a=y.ORE,c="ORE"),r.actions.addMapUpdate({...s,type:a,durability:1,tile:c})}}else r.actions.addMapUpdate({...t,durability:i/dt[t.tile]})}},ze=function(e){if(e.isStarted||(e.timeEnd=Date.now()+We,e.start()),e.timeEnd>Date.now())return;const t=ct(I(this.coords),this.angle,1);e.complete(t.type)},ct=(e,t,i=1)=>{const n=[...e];return t===0?n[0]+=i:t===1?n[1]-=i:t===2?n[0]-=i:t===3&&(n[1]+=i),b(n)},Xe=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:Ve,command:Ge,getFacingTile:ct},Symbol.toStringTag,{value:"Module"})),tt=(e,t,i)=>Math.max(e,Math.min(t,i)),qe=1,je=d/100,Ke=function(e){if(!e.isStarted){const o=Je(1,this.angle,this.coords);this.angle===3&&(this.target=[this.coords[0],this.coords[1]+o*d]),this.angle===0&&(this.target=[this.coords[0]+o*d,this.coords[1]]),this.angle===1&&(this.target=[this.coords[0],this.coords[1]-o*d]),this.angle===2&&(this.target=[this.coords[0]-o*d,this.coords[1]]),e?.start()}const t=this.speed*je;let i;this.target&&(i=[tt(-t,t,this.target[0]-this.coords[0]),tt(-t,t,this.target[1]-this.coords[1])]),i?.[0]===0&&i?.[1]===0&&(r.updateLights(),e?.complete(),this.target=void 0,i=void 0),i&&(r.isFollowing===this.id&&(r.camera[0]+=i[0],r.camera[1]+=i[1]),this.coords=[this.coords[0]+i[0],this.coords[1]+i[1]])},Je=(e,t,i)=>{let n=[0,0];t===j.DOWN?n=[0,-d]:t===j.LEFT?n=[-d,0]:t===j.RIGHT?n=[d,0]:n=[0,d];let o=0,s=[...i];for(;o<e;){s[0]+=n[0],s[1]+=n[1];const a=I(s),c=b(a);if(!nt[c.tile])break;o++}return o},Ze=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:qe,command:Ke},Symbol.toStringTag,{value:"Module"})),Qe=1,ti=function(e){let t=this.targetR;if(e.isStarted||(t=this.angle+(e.value>0?1:-1),t<0&&(t=4+t),t>3&&(t=t-4),e.start()),t===void 0){e.complete();return}this.targetR=t;const i=Z[this.targetR];let n=0;if(e.value<0){let o=this.rad<i?this.rad+lt:this.rad;n=-.05,o+n<=i&&e.complete()}else{let o=this.rad>i?this.rad-lt:this.rad;n=.05,o+n>=i&&e.complete()}e.isComplete?(this.rad=Z[this.targetR],this.angle=this.targetR,this.targetR=void 0):this.rad+=n,this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad)},ei=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:Qe,command:ti},Symbol.toStringTag,{value:"Module"})),ii=0,ni=function(e){e.complete();const t=I(this.coords);b(t).type===y.HOME?(Object.entries(this.inventory.inventory).forEach(([n,o])=>{r.inventory.add(n,o),this.inventory.remove(n,o)}),Et(this.id,"Unloading")):Et(this.id,"Unable to unload")},oi=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:ii,command:ni},Symbol.toStringTag,{value:"Module"})),ri=0,pt=550,si=function(e){if(!e.isStarted){const i=I(this.coords);if(b(i).type!==y.HOME){E(`Entity [${this.id}] - Unable to recharge at this location`),e.complete();return}e.timeEnd=Date.now()+(pt-this.rechargeSpeed*50),e.start()}if(e.timeEnd>Date.now())return;const t=e.value?Math.max(0,Math.min(100,e.value))/100*this.maxBattery:this.maxBattery;if(this.battery>=t||e.shouldCancel){e.complete();return}this.battery++,e.timeEnd=Date.now()+(pt-this.rechargeSpeed*100)},ai=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:ri,command:si},Symbol.toStringTag,{value:"Module"})),ci=function(e){if(!this.actions.includes(e.type)){e.complete();return}let t;switch(e.type){case"MOVE":t=Ze;break;case"ROTATE":t=ei;break;case"DEVICE":t=Xe;break;case"UNLOAD":t=oi;break;case"RECHARGE":t=ai;break}if(t){if(!e.isStarted){if(t.BATTERY_COST){if(this.battery<t.BATTERY_COST){e.cancel();return}this.battery=Math.max(0,this.battery-t.BATTERY_COST)}ui(this,e)}return t.command.call(this,e)}};class G{inventory={};limit;total;hook;constructor(t,i){this.hook=t,this.limit=i,this.total=0}add(t,i=1){this.limit&&(i=Math.max(0,Math.min(this.limit-this.total,i))),i&&(this.total+=i,this.inventory[t]=(this.inventory[t]??0)+i,this.hook?.(t,i))}remove(t,i=1){return(this.inventory[t]??0)>=i?(this.inventory[t]=this.inventory[t]-i,this.total-=i,this.hook?.(t,-i),this.inventory[t]||delete this.inventory[t],!0):!1}}class Dt{id;name;gfx;actions;rotation=[0,1];rad=Z[3];angle=3;inventorySize;inventory;speed;drillSpeed;battery;maxBattery;rechargeSpeed;drillPower;deviceSlots=1;target;targetR;coords;modules;getSave(){return{...this,inventory:this.inventory.inventory,gfx:void 0}}constructor(t,i,n,o=["MOVE","ROTATE"],s){this.gfx=t,this.id=i,this.coords=[Math.round(h/2*d)-d/2,Math.round(h/2*d)-d/2],this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad),this.actions=o,this.name=n,this.maxBattery=0,this.battery=this.maxBattery,this.speed=0,this.drillSpeed=0,this.inventorySize=0,this.rechargeSpeed=0,this.drillPower=0,this.inventory=new G(void 0,this.inventorySize),this.modules=s??[]}async init(){this.balanceModules(),this.battery=this.maxBattery}installModule(t){const i=p[t];if(!i)return!1;const n=this.modules.filter(o=>p[o].moduleType===i.moduleType);return i.moduleType==="device"&&n.length>=this.deviceSlots||n.length?!1:(this.modules.push(t),this.balanceModules(),!0)}uninstallModule(t){return this.modules.includes(t)?(this.modules=this.modules.filter(i=>i!==t),this.balanceModules(),!0):!1}balanceModules(){this.speed=0,this.drillSpeed=0,this.rechargeSpeed=0,this.drillPower=0,this.maxBattery=0,this.inventorySize=0,this.actions=[],this.modules.forEach(t=>{const i=p[t],n=i.stats;this.speed+=n?.speed??0,this.maxBattery+=n?.battery??0,this.drillSpeed+=n?.drillSpeed??0,this.inventorySize+=n?.inventorySize??0,this.rechargeSpeed+=n?.rechargeSpeed??0,this.drillPower+=n?.drillPower??0,this.actions.push(...i.actionType??[])}),this.inventory.limit=this.inventorySize}update(t){const i=this.battery;t&&ci.call(this,t),this.battery!==i&&(this.battery<=0?E(`Entity ${this.id} - no power, battery empty`):this.battery<=this.maxBattery*.2&&i>this.maxBattery*.2?x(`Entity ${this.id} - battery low warning`):this.battery<=this.maxBattery*.1&&i>this.maxBattery*.1&&E(`Entity ${this.id} - battery is critical`))}render(t,i){this.gfx.render(t,this,i)}}const N=document.querySelector("#control_console div#output"),et={Manage:[["list","List available entities.",""],["storage","Show current store inventory.",""],["deploy","Deploy from storage. Ex. deploy <deployable_name> <label>.","str, str?"],["select","Select entity for control.","int"],["selected","Show currently selected entitiy.",""],["edit","Edit a script.","str"],["bind","Bind a key to a command Ex. bind <cmd> <args?>","str"]],Entity:[["commands","List available commands for selected entity.",""],["inventory","Show current entity inventory.",""],["battery","Show current entity battery value.",""],["modules","List currently installed modules and stats.",""],["devices","List currently installed devices.",""],["exec","Execute a named script.",""],["install","Install a module from the main storage.","str"],["uninstall","Remove an installed module.","str"],["actions","Display queue of actions.",""],["focus","Move camera and follow selected entity.",""],["cancel","Cancel current action where possible.",""],["halt","Cancel all queued actions where possible.",""]]},li={DEVICE:["device","Activate device <n>","int=0"],MOVE:["move","Move <n> in facing direction.","int=1"],RECHARGE:["recharge","Recharge entity battery <n> units. HOME ONLY.","int?"],ROTATE:["rotate","Rotate 90 degrees CW <n> or CCW <-n>.","int [-3, 3]"],UNLOAD:["unload","Move entity inventory to storage. HOME ONLY.",""]},di=et.Entity.map(e=>e.at(0)),m=(e,t)=>{const i=e.split(`
`).map(s=>{const a=document.createElement("p");return a.textContent=s||"",t&&(a.className=t),a}),n=Array.from(N?.children??[]),o=n.length+i.length-Gt;for(let s=0;s<Math.max(o,0);s++)n[s]?.remove();i.forEach(s=>N?.appendChild(s)),N?.scrollTo(0,N.scrollHeight??0)},A=e=>{m(e,"important")},x=e=>{m(`[WARNING] ${e}`,"warning")},v=(e,t=!0)=>{m(e,t?"bold header white":"header black")},E=e=>{m(`[ERROR] ${e}`,"error")},ui=(e,t)=>{!t||t.isSilent||m(`[${(Date.now()/1e3).toFixed(0)}] Entity [${e.id}] - ${t.type}: ${t.value}`,"log")},Et=(e,t)=>{m(`[ENTITY:${e}] ${t}`)},L=(e,t,i=" ")=>{const n=[...t?[t]:[],...e].reduce((o,s)=>(s.forEach((a,c)=>{o[c]=Math.max(o[c]??0,a.length)}),o),[]);t&&v(t.map((o,s)=>o.padEnd(n[s]??0)).join(i),!1),e.forEach(o=>{m(o.map((s,a)=>s.padEnd(n[a]??0)).join(i))})},vt=e=>{m(" "),m(` > ${e}`);const[t,...i]=e.split(" "),n=t.toLowerCase(),o=mi(n,i);if(o===!1){E("Invalid argument");return}else if(o)return;const s=Ut(r.selectedEntity,n,i);if(s===void 0){E("No entity selected!");return}else if(s?.length)return;E(`Unknown command: ${n}`)},Ut=(e,t,i)=>{const n=e!==void 0?r.entities.find(a=>a.id===e):void 0;if(!n)return;const[o]=i,s=a=>{const c=parseInt(o??0);let l=[];const u=r.actions.addAction(a,{entityId:n.id,timeEnd:Date.now()+1e5,value:c});if(l.push(u.id),a==="MOVE"||a==="ROTATE"||a==="DEVICE")for(let f=1;f<Math.abs(u.value??c);f++){const _=r.actions.addSilentAction(a,{entityId:n.id,timeEnd:Date.now()+1e5,value:c},u.id);l.push(_.id)}return l};return n.actions.includes(t.toUpperCase())?s(t.toUpperCase()):[]},mi=(e,t)=>{const[i]=t;switch(e){case"help":return yi(),!0;case"list":return fi(),!0;case"select":return hi(parseInt(i));case"storage":return _i(),!0;case"deploy":return pi(t);case"clear":return X(),!0;case"crafting":return Li(i);case"selected":return Ei(),!0;case"dev_spawn":return xi();case"save":return Bt(),!0;case"load":return Pt(),!0;case"reset":return gi(),!0;case"edit":return Di(i),!0;case"bind":return Ui(t),!0}if(di.includes(e)){const n=r.selectedEntity!==void 0?r.entities.find(o=>o.id===r.selectedEntity):void 0;if(n)switch(e){case"commands":return vi(n),!0;case"inventory":return Ti(n),!0;case"battery":return Ri(n),!0;case"cancel":return Ii(n),!0;case"halt":return Oi(n),!0;case"focus":return bi(n),!0;case"modules":return Ai(n),!0;case"devices":return Si(n),!0;case"actions":return Ni(n),!0;case"exec":return Mi(n,i);case"install":return wi(n,i);case"uninstall":return Ci(n,i)}else return E("No entity selected."),!0}},hi=e=>isNaN(e)||!r.entities.find(i=>i.id===e)?!1:(r.selectEntity(e),m(`Entity ${e} selected`),!0),fi=()=>{v("Entities"),m(r.entities.map(e=>`[${e.id}] - ${e.name}`).join(`
`))},yi=()=>{r.story.STORAGE_FIRST,v("Help"),m(` - Manage -
`),L(et.Manage,["Command","Description","Args"]," | "),m(`
- Entity -
`),L(et.Entity,["Command","Description","Args"]," | ")},pi=([e,t])=>e&&p[e]?.type==="DEPLOYABLE"?(r.deploy(e,t),!0):(E(`"${e}" is not recognised as a deployable item.`),!0),Ei=()=>{const e=r.selectedEntity!==void 0?r.entities.find(t=>t.id===r.selectedEntity):void 0;v("Selected"),m(e?`[${e.id}] - ${e.name}`:"- NONE -")},vi=(e,t)=>{v("Commands");const i=e.actions;L(i.map(n=>li[n]),["Command","Description","Args"]," | ")},_i=()=>{v("Storage"),Ft(Object.entries(r.inventory.inventory).map(([e,t])=>[e,t]))},Ft=e=>{const t=e.map(([i,n])=>[`[${i}]`,p[i].label,p[i].type,p[i].quality??"",n.toString()]);L(t,["Name","Label","Type","Quality","Quantity"]," | ")},bi=(e,t)=>{r.focusEntity(e.id)},Ti=(e,t)=>{v("Inventory"),m(`Slots: ${e.inventory.total} / ${e.inventory.limit??"-"}`),Ft(Object.entries(e.inventory.inventory).map(([i,n])=>[i,n]))},Ri=(e,t)=>{m(`Entity [${e.id}] battery: ${e.battery} / ${e.maxBattery}`)},Ai=(e,t)=>{v("Installed Modules"),L(e.modules.map(i=>{const n=p[i];return[i,n.label,n.quality,n.moduleType]}),["Name","Label","Quality","Type"]," | "),m(`[ Movement: ${e.speed} ] [ Battery: ${e.battery} / ${e.maxBattery} ] [ Charge Speed: ${e.rechargeSpeed} ]`),m(`[ Drill Power: ${e.drillPower} ] [ Drill Speed: ${e.drillSpeed} ]`)},Si=(e,t)=>{v("Installed Devices");const i=e.modules.map(n=>p[n]).filter(n=>n.moduleType==="device");L(i.map((n,o)=>[`[${o}]`,n.name,n.label,n.quality,n.deviceType??""]),["ID","Name","Label","Quality","Type"]," | ")},Ii=(e,t)=>{const i=r.actions.cancelOneForEntity(e.id);i&&m(`Entity [${e.id}] request to cancel ${i.type}`)},Oi=(e,t)=>{r.actions.cancelAllForEntity(e.id),r.cancelScripts(e.id),m(`Entity [${e.id}] cancel all queued actions`)},wi=(e,t)=>{const i=I(e.coords);return b(i).type!==y.HOME?(E("Unable to install modules here"),!0):!p[t]||!r.inventory.remove(t,1)?(E(`Unknown or module not in storage - "${t}"`),!0):(e.installModule(t)||(E(`Unable to install ${t}, slot already used or incompatible`),r.inventory.add(t,1)),!0)},Ci=(e,t)=>{const i=I(e.coords);return b(i).type!==y.HOME?(E("Unable to uninstall modules here"),!0):e.uninstallModule(t)?(r.inventory.add(t,1),!0):(E(`No module called "${t}" is installed on this automation`),!0)},xi=()=>{!r.gl||r.entityGfx},Li=e=>{if(!r.story.STORAGE_FIRST)return;if(e?.trim())return p[e].ingredients?ke(e):(E(`Unknown recipe: ${e}`),!0);const t=Object.entries(p).filter(([,i])=>i.ingredients?.length).filter(([,i])=>(i.story??[]).every(n=>r.story[n])).filter(([,i])=>!i.waypoint||!r.story[i.waypoint]).map(([i])=>{const n=p[i];return[i,n.description,n.ingredients.map(o=>`${o.item}[${o.count}]`).join(",")]});return v("Crafting"),m('Usage: "crafting <recipe>"'),L(t,["Name","Description","Recipe"]," | "),!0},Mi=(e,t)=>{if(!r.scripts[t])return E(`Unknown script ${t}`),!0;const i=new ue(e,r.scripts[t]);return r.executors.push(i),!0},X=()=>{N&&(N.innerHTML="")},Bt=()=>{window.localStorage.setItem("save",btoa(JSON.stringify(r.getSave()))),x("Game saved.")},gi=async()=>{x("RESETTING GAME"),window.localStorage.setItem("save",""),_e(),r.reset(),await Me(),X(),Nt()},Pt=()=>{const e=window.localStorage.getItem("save");if(e?.length){const t=JSON.parse(atob(e));Object.keys(t.story??{}).length&&(X(),r.onLoad(t),x("Game loaded."))}},Ni=e=>{const t=r.actions.getActions().filter(i=>i.entityId===e.id).filter(i=>!i.isSilent);v("Actions"),t.forEach(i=>{m(` - ${i.type} [${i.value}]`)})},Di=e=>{he(e)},Ui=e=>{Vi(e.join(" "))},Fi=10,kt=-3,$t="ENTITY_SELECTED";class Bi{gl;entityGfx;world;camera=[0,0];actions;zoom=0;selectedEntity;inventory;isFollowing;entities=[];executors=[];story={};history=[];onStory;onDeploy;scripts;keybinds;lights;entityHook;getSave(){const t={stack:this.actions.stack,mapUpdates:this.actions.mapUpdates,mapChanges:Pi(this.actions.mapChanges)};return{...this,inventory:this.inventory.inventory,gl:void 0,entityGfx:void 0,entities:this.entities.map(i=>i.getSave()),executors:[],lights:[],actions:t}}onLoad(t){Object.assign(this,{camera:t.camera??this.camera,zoom:t.zoom??this.zoom,selectedEntity:t.selectedEntity??this.selectedEntity,isFollowing:t.isFollowing??this.isFollowing,story:t.story??this.story,history:t.history??this.history,scripts:t.scripts??this.scripts}),this.inventory.inventory=t.inventory??this.inventory.inventory,this.entityGfx&&(this.entities=t.entities?.map(i=>{const n=new Dt(this.entityGfx,i.id,i.name,i.actions,i.modules);return Object.assign(n,i),n.inventory=new G,n.inventory.inventory=i.inventory??{},n.balanceModules(),n})??[]),this.actions&&t.actions&&(this.actions.stack=t.actions.stack.map(i=>{const n=new Q(i.type,{delta:i.delta,value:i.value,timeEnd:i.timeEnd,entityId:i.entityId},i.isSilent,i.parentId);return n.id=i.id,n.isComplete=i.isComplete,n.isStarted=i.isStarted,n.shouldCancel=i.shouldCancel,n}),this.actions.mapChanges=t.actions.mapChanges),this.inventory&&Object.assign(this.inventory,t.inventory),this.actions.mapChanges.forEach(i=>{bt(i),this.actions.mapUpdates.push(i)}),this.updateLights()}reset(){jt(),this.gl=void 0,this.actions=new ut,this.entities=[],this.inventory=new G,this.lights=new Float32Array(48).fill(0),this.entityHook=new EventTarget,this.story={},this.scripts={},this.keybinds=[]}constructor(t=new ut,i=new G,n){this.lights=new Float32Array(48).fill(0),this.actions=t,this.inventory=i,this.onStory=n,this.entityHook=new EventTarget,this.scripts={},this.keybinds=[]}selectEntity(t){this.focusEntity(t)&&(this.selectedEntity=t,this.entityHook.dispatchEvent(new CustomEvent($t,{detail:t})))}focusEntity(t){const i=this.entities.find(n=>n.id===t);return i?(this.isFollowing=t,this.camera=[i.coords[0]-11*d,i.coords[1]-6.5*d],this.zoom=0,!0):!1}resolution(t){const i=t.canvas.height/t.canvas.width,n=t.canvas.width+100*this.zoom,o=t.canvas.height+100*this.zoom*i;return[n,o]}setZoom(t){const i=tt(kt,Fi,t);if(i>this.zoom)this.camera[0]=this.camera[0]-d,this.camera[1]=this.camera[1]-d;else if(i<this.zoom)this.camera[0]=this.camera[0]+d,this.camera[1]=this.camera[1]+d;else return;this.zoom=i}getHistory(){return this.history=this.history.slice(-it).toReversed().filter((t,i,n)=>n.indexOf(t)===i).reverse(),this.history}addWaypoint(t){this.story[t]||(this.story[t]=!0,this.onStory?.(t))}updateLights(){const t=new Float32Array(48).fill(0);for(let i=0;i<r.entities.length;i++){const[n,o]=I(r.entities[i].coords);t[i*3]=n,t[i*3+1]=o,t[i*3+2]=5}this.lights=t}deploy(t,i){this.inventory.remove(t)&&this.onDeploy?.(t,i)}runScripts(){for(let t of this.executors)t.run(),t.isComplete&&m("Script finished");this.executors=this.executors.filter(t=>!t.isComplete)}cancelScripts(t){this.executors=this.executors.filter(i=>i.entity.id!==t)}saveScript(t){this.scripts[t.name]=t}addKeybind(t){const i=this.keybinds.findIndex(n=>n.key===t.key);i>=0&&this.keybinds.splice(i,1),this.keybinds.push(t)}}const r=new Bi,Pi=e=>Object.values(e.reduce((t,i)=>(t[i.tileN]=i,t),{}));let O;const g=document.querySelector("#control_console input");let w=it;const ki=()=>{g?.addEventListener("keyup",e=>{const t=e.key,i=e.target.value;if(t==="Enter"&&i.length){r.history.push(i),vt(i),e.target.value="";const n=r.getHistory();w=Math.min(n.length,it)}if(t==="ArrowUp"&&w>0){const n=r.getHistory();w--,g.value=n[w]??""}if(t==="ArrowDown"){const n=r.getHistory();w>=n.length?g.value="":(w++,g.value=n[w]??"")}}),g?.focus(),document.querySelector("#nav > div:first-of-type")?.addEventListener("click",e=>Vt(e.target,"control_console")),document.addEventListener("keyup",e=>{if(document.activeElement===g)return;const t=r.keybinds.find(i=>i.key===e.key);t&&vt(t.exec)})},$i=()=>{let e=document.getElementById("c");e?.addEventListener("mousedown",t=>{O=[t.clientX,t.clientY]}),e?.addEventListener("mousemove",t=>{if(O){r.isFollowing=void 0;let i=[t.clientX,t.clientY];const o=.6+(r.zoom+(0-kt))*.125,s=(i[0]-(O?.[0]??0))*o,a=(i[1]-(O?.[1]??0))*o;r.camera[0]=r.camera[0]-s,r.camera[1]=r.camera[1]+a,O=i}}),e?.addEventListener("mouseup",()=>O=void 0),e?.addEventListener("mouseout",()=>O=void 0),e?.addEventListener("wheel",t=>{const i=t.deltaY;r.setZoom(r.zoom+(i>0?1:-1))})},Vt=(e,t)=>{Array.from(document.querySelectorAll("div#context > div")).forEach(i=>i.classList.add("hidden")),Array.from(document.querySelectorAll("#nav > div")).forEach(i=>i.classList.remove("active")),document.getElementById(t)?.classList.remove("hidden"),e.classList.add("active")},Vi=e=>{setTimeout(()=>{m("Press a key to bind..."),document.addEventListener("keyup",t=>{const i={key:t.key,exec:e};r.addKeybind(i),m(`"${e}" bound to ${i.key}`)},{once:!0})},100)},Hi=async()=>{document.addEventListener("contextmenu",e=>e.preventDefault()),ki(),await Nt(),Pt(),setInterval(()=>{Bt()},6e4)};Hi();
