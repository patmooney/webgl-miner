(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function o(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=o(r);fetch(r.href,s)}})();const Z=`#version 300 es

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

uniform highp sampler2D u_data;

out vec2 v_texcoord;
out float b_type;
out float durability;
out float atlas_w;

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
  atlas_w = u_atlas_w;
}
`,Q=`#version 300 es

precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

in float b_type;
in float durability;
in float atlas_w;

// The texture.
uniform sampler2D u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  vec2 tcoord = vec2(v_texcoord.x + (atlas_w * b_type), v_texcoord.y);
  outColor = texture(u_texture, tcoord) * vec4(1.0, durability, durability, 1.0);
}`,J=`#version 300 es

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
`,g=`#version 300 es

precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

// The texture.
uniform sampler2D u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_texcoord);
}`;function $(e){console&&(console.error?console.error(e):console.log&&console.log(e))}const tt=/ERROR:\s*\d+:(\d+)/gi;function X(e,t=""){const o=[...t.matchAll(tt)],i=new Map(o.map((r,s)=>{const a=parseInt(r[1]),d=o[s+1],h=d?d.index:t.length,m=t.substring(r.index,h);return[a-1,m]}));return e.split(`
`).map((r,s)=>{const a=i.get(s);return`${s+1}: ${r}${a?`

^^^ ${a}`:""}`}).join(`
`)}function et(e,t,o,i){const r=i||$,s=e.createShader(o);if(!s)return r("No shader"),null;if(e.shaderSource(s,t),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS)){const d=e.getShaderInfoLog(s);return r(`Error compiling shader: ${d}
${X(t,d??"")}`),e.deleteShader(s),null}return s}function ot(e,t,o,i,r){const s=r||$,a=e.createProgram();if(!a)return null;if(t.forEach(function(h){e.attachShader(a,h)}),o&&o.forEach(function(h,m){e.bindAttribLocation(a,i?i[m]:m,h)}),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS)){const h=e.getProgramInfoLog(a),m=t.map(C=>{const q=X(e.getShaderSource(C)??"");return`${e.getShaderParameter(C,e.SHADER_TYPE)}:
${q}`}).join(`
`);return s(`Error in program linking: ${h}
${m}`),e.deleteProgram(a),null}return a}const it=["VERTEX_SHADER","FRAGMENT_SHADER"];function H(e,t,o=[],i=[],r=()=>{}){const s=[];for(let a=0;a<t.length;++a)s.push(et(e,t[a],e[it[a]],r));return ot(e,s.filter(Boolean),o,i,r)}function k(e,t){t=t||1;const o=e.clientWidth*t|0,i=e.clientHeight*t|0;return e.width!==o||e.height!==i?(e.width=o,e.height=i,!0):!1}const Y=async(e,t)=>{const o=e.createTexture()??void 0;if(!o)throw new Error("Invalid texture");e.bindTexture(e.TEXTURE_2D,o);const i=new Image;return i.src=t,new Promise(r=>{i.onload=()=>{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.bindTexture(e.TEXTURE_2D,null),r(o)}})},V=""+new URL("atlas-BxrVKyxQ.png",import.meta.url).href,c=40,u=200,rt=6,T=1/rt,b=2,F=10,S={RIGHT:0,LEFT:2,DOWN:1},w={0:0*Math.PI/180,1:90*Math.PI/180,2:180*Math.PI/180,3:270*Math.PI/180},D=360*Math.PI/180,G={stone:"Stone",iron:"Iron ore",carbon:"Carbon",copper:"Copper",module_visual_scanner:"Visual Scanner (Module)"};class M{inventory={};limit;total;hook;constructor(t,o){this.hook=t,this.limit=o,this.total=0}add(t,o=1){this.limit&&(o=Math.max(0,Math.min(this.limit-this.total,o))),o&&(this.total+=o,this.inventory[t]=(this.inventory[t]??0)+o,this.hook?.(t,o))}remove(t,o=1){return(this.inventory[t]??0)>=o?(this.inventory[t]=this.inventory[t]-o,this.total-=o,this.hook?.(t,-o),this.inventory[t]||delete this.inventory[t],!0):!1}}const P={FLOOR:0,ROCK:10,ORE:100,SHADOW:0,HOME:0},nt={FLOOR:!0,ROCK:!1,ORE:!1,SHADOW:!1,HOME:!0},f={FLOOR:0,ROCK:1,SHADOW:3,HOME:4,ORE:5},st={ROCK:[{item:"stone",chance:1},{item:"iron",chance:.02}],ORE:[{item:"stone",chance:.01},{item:"iron",chance:.05},{item:"copper",chance:.02},{item:"carbon",chance:.01}]},at=e=>Object.entries(f).find(([,t])=>t===e)?.[0]??"FLOOR",z=()=>{const e=u/2-4,t=u/2+4,o=u/2-2,i=u/2+2;let r=[];for(let s=0;s<u*u;s++){const a=s%u,d=Math.floor(s/u);if(d>o&&d<i&&a>o&&a<i){r.push(f.HOME,1);continue}if(d>e&&d<t&&a>e&&a<t){r.push(f.FLOOR,1);continue}if((d===e||d===t)&&a>=e&&a<=t){r.push(f.ROCK,1);continue}if((a===e||a===t)&&d>=e&&d<=t){r.push(f.ROCK,1);continue}r.push(f.SHADOW,1)}return new Float32Array(r)},y=e=>{const[t,o]=e,i=o*u+t,r=O().at(i*b),s=O().at(i*b+1)??0;if(r===void 0)throw new Error(`Invalid tile ${t} / ${o}`);return{coord:e,tile:at(r),type:r,durability:s}},U=e=>[Math.round(e[0]/c),Math.round(e[1]/c)],ct=e=>{const t=[],[o,i]=e;return o>0&&t.push(y([o-1,i])),o<u-1&&t.push(y([o+1,i])),i>0&&t.push(y([o,i-1])),i<u-1&&t.push(y([o,i+1])),t};let I;const O=()=>(I||(I=z()),I),dt=e=>{const t=O(),[o,i]=e.coord,r=i*u+o;t[r*b]=e.type,t[r*b+1]=e.durability};class ut{type;delta;value;timeEnd;entityId;isComplete=!1;isStarted=!1;constructor(t,{delta:o,value:i,timeEnd:r,entityId:s}){this.type=t,this.delta=o,this.value=i,this.timeEnd=r,this.entityId=s,this.type==="ROTATE"&&(this.value=Math.max(Math.min(3,this.value??0),-3)),this.type==="MOVE"&&(this.value=Math.max(0,Math.min(u,i??0)))}complete(){this.isComplete=!0}start(){this.isStarted=!0}}class ht{stack;mapUpdates;constructor(){this.stack=[],this.mapUpdates=[]}getActions(){return this.stack=[...this.stack.filter(t=>!t.isComplete)],this.stack}addAction(t,{delta:o,value:i,timeEnd:r,entityId:s}){const a=new ut(t,{delta:o,value:i,timeEnd:r,entityId:s});this.stack.push(a)}getMapUpdates(){const t=[...this.mapUpdates];return this.mapUpdates=[],t}addMapUpdate(t){this.mapUpdates.push(t),dt(t)}}const N=(e,t,o)=>Math.max(e,Math.min(t,o)),lt=10,j=-3;class ft{camera=[0,0];actions;zoom=0;selectedEntity;inventory;entities=[];story={};history=[];onStory;constructor(t=new ht,o=new M,i){this.actions=t,this.inventory=o,this.onStory=i}resolution(t){const o=t.canvas.height/t.canvas.width,i=t.canvas.width+100*this.zoom,r=t.canvas.height+100*this.zoom*o;return[i,r]}setZoom(t){const o=N(j,lt,t);if(o>this.zoom)this.camera[0]=this.camera[0]-c,this.camera[1]=this.camera[1]-c;else if(o<this.zoom)this.camera[0]=this.camera[0]+c,this.camera[1]=this.camera[1]+c;else return;this.zoom=o}getHistory(){return this.history=this.history.slice(-F).toReversed().filter((t,o,i)=>i.indexOf(t)===o).reverse(),this.history}addWaypoint(t){this.story[t]||(this.story[t]=!0,this.onStory?.(t))}}const n=new ft,mt=`
  <div id="console">
    Hello, World!
  </div>
`,L={VISUAL_SCAN_MODULE:{ingredients:[{item:"iron",count:10}],story:["IRON_FIRST"],description:"Visually assess one tile in front",type:"MODULE",item:"module_visual_scanner"},CONTROL_INTERFACE:{ingredients:[{item:"stone",count:50},{item:"iron",count:10}],story:["IRON_FIRST"],description:"Extra control interface for manual remote instruction",type:"INTERFACE",waypoint:"INTERFACE_CONTROL_INTERFACE"},AUTOMATION_INTERFACE:{ingredients:[{item:"stone",count:50},{item:"iron",count:10},{item:"copper",count:10},{item:"carbon",count:10}],story:["IRON_FIRST","CARBON_FIRST","COPPER_FIRST"],description:"Allow automated remote instruction",type:"INTERFACE",waypoint:"INTERFACE_AUTOMATION_INTERFACE"}},Et=e=>{n.story.STORAGE_FIRST||n.addWaypoint("STORAGE_FIRST"),e==="iron"&&!n.story.IRON_FIRST&&n.addWaypoint("IRON_FIRST"),e==="carbon"&&!n.story.CARBON_FIRST&&n.addWaypoint("CARBON_FIRST"),e==="copper"&&!n.story.COPPER_FIRST&&n.addWaypoint("COPPER_FIRST")},pt=e=>{const t=L[e];if(!t)return!1;for(let o of t.ingredients)if((n.inventory.inventory[o.item]??0)<o.count)return!1;for(let o of t.ingredients)n.inventory.remove(o.item,o.count);return t.type==="MODULE"?n.inventory.add(t.item):t.type==="INTERFACE"&&n.addWaypoint(t.waypoint),!0},vt=e=>{switch(e){case"STORAGE_FIRST":v(`Crafting Unlocked
see command "crafting" for more information`);break;case"IRON_FIRST":v("New recipes available");break;case"CARBON_FIRST":n.story.COPPER_FIRST&&v("New recipes available");break;case"COPPER_FIRST":n.story.CARBON_FIRST&&v("New recipes available");break;case"INTERFACE_CONTROL_INTERFACE":v("Control interface installed"),B();break;case"INTERFACE_AUTOMATION_INTERFACE":v("Automation interface installed"),B();break}},B=()=>{const e=document.getElementById("nav"),t=document.getElementById("context"),o=document.createElement("div");o.textContent="Control";const i=document.createElement("div");i.id="control_control",i.classList.add("hidden"),i.innerHTML=mt,o.addEventListener("click",()=>K(o,"control_control")),e?.appendChild(o),t?.appendChild(i)},K=(e,t)=>{Array.from(document.querySelectorAll("div#context > div")).forEach(o=>o.classList.add("hidden")),Array.from(document.querySelectorAll("#nav > div")).forEach(o=>o.classList.remove("active")),document.getElementById(t)?.classList.remove("hidden"),e.classList.add("active")},x=document.querySelector("#control_console div#output"),Tt=e=>{l(" "),l(` > ${e}`);const[t,o]=e.split(" "),i=t.toLowerCase(),r=_t(i,o);if(r===!1){_("Invalid argument");return}else if(r)return;const s=yt(i,o);if(s===!1){_("No entity selected!");return}else if(s)return;_(`Unknown command: ${i}`)},_=e=>{l(`[ERROR] ${e}`,"error")},yt=(e,t)=>{const o=n.selectedEntity!==void 0?n.entities.find(r=>r.id===n.selectedEntity):void 0;if(!o)return;const i=r=>(n.actions.addAction(r,{entityId:o.id,timeEnd:Date.now()+1e5,value:parseInt(t??0)}),!0);if(o.actions.includes(e.toUpperCase()))return i(e.toUpperCase())},_t=(e,t)=>{switch(e){case"help":return St(),!0;case"list":return Ot(),!0;case"selected":return It(),!0;case"commands":return xt(),!0;case"storage":return wt(),!0;case"inventory":return Nt(),!0;case"select":return Rt(parseInt(t));case"crafting":return Lt(t);default:return}},Rt=e=>isNaN(e)||!n.entities.find(t=>t.id===e)?!1:(n.selectedEntity=e,l(`Entity ${e} selected`),!0),At=(e,t)=>{t&&l(`[${(Date.now()/1e3).toFixed(0)}] Entity [${e.id}] - ${t.type}: ${t.value}`,"log")},W=(e,t)=>{l(`[ENTITY:${e}] ${t}`)},l=(e,t)=>{e.split(`
`).map(o=>{const i=document.createElement("p");i.textContent=o||"",t&&(i.className=t),x?.appendChild(i)}),x?.scrollTo(0,x.scrollHeight??0)},v=e=>{l(e,"important")},bt=()=>{v(`Welcome
========
Type "help" to get started`)},Ot=()=>{l(`
ENTITIES
==========

${n.entities.map(e=>`[${e.id}] - ${e.type}`).join(`
`)}
`)},St=()=>{const e=[];n.story.STORAGE_FIRST&&e.push("crafting    - List and craft available recipes"),l(`
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
${e.join(`
`)}
`)},It=()=>{const e=n.selectedEntity!==void 0?n.entities.find(t=>t.id===n.selectedEntity):void 0;l(`
SELECTED
=========

${e?`[${e.id}] - ${e.type}`:"- NONE -"}
`)},xt=()=>{const e=n.selectedEntity!==void 0?n.entities.find(t=>t.id===n.selectedEntity):void 0;if(!e)return _("No entity selected");l(`
COMMANDS
=========

${e.actions.map(t=>` - ${t.toLowerCase()}`).join(`
`)}
`)},wt=()=>{l(`
STORAGE
========

${Object.entries(n.inventory.inventory).map(([e,t])=>`${G[e]} - ${t}`).join(`
`)}
`)},Nt=()=>{const e=n.selectedEntity!==void 0?n.entities.find(t=>t.id===n.selectedEntity):void 0;if(!e)return _("No entity selected");l(`
INVENTORY
==========
Slots: ${e.inventory.total} / ${e.inventory.limit??"-"}

${Object.entries(e.inventory.inventory).map(([t,o])=>`${G[t]} - ${o}`).join(`
`)}
`)},Lt=e=>{if(!n.story.STORAGE_FIRST)return;if(e?.trim())return L[e]?pt(e):(_(`Unknown recipe: ${e}`),!0);const t=Object.entries(L).filter(([,o])=>(o.story??[]).every(i=>n.story[i])).filter(([,o])=>!o.waypoint||!n.story[o.waypoint]).map(([o,i])=>`${o}
${i.description}
${i.ingredients.map(r=>` - ${r.item} x ${r.count}`).join(`
`)}`);return l(`
CRAFTING
=========

Usage: "crafting <recipe>"

${t?.length?`- Recipes -

`+t.join(`

`):" - No recipes available -"}
`),!0},Ft=1,Mt=2e3,Ut=function(e){if(e.isStarted||(e.timeEnd=Date.now()+Mt,e.start()),e.timeEnd>Date.now())return;e.complete();const t=Ct(U(this.coords),this.angle,1);if(t.type===f.ROCK||t.type===f.ORE){let o=t.durability*P[t.tile];o-=Ft;const i=st[t.tile]??[];for(let r of i)Math.random()<=r.chance&&this.inventory.add(r.item);if(o<=0){const r=ct(t.coord);n.actions.addMapUpdate({...t,type:f.FLOOR,durability:1});for(let s of r)s.type===f.SHADOW&&n.actions.addMapUpdate({...s,type:f.ROCK,durability:1})}else n.actions.addMapUpdate({...t,durability:o/P[t.tile]})}},Ct=(e,t,o=1)=>{const i=[...e];return t===0?i[0]+=o:t===1?i[1]-=o:t===2?i[0]-=o:t===3&&(i[1]+=o),y(i)},Dt=function(e){if(!e.isStarted){const o=Pt(e.value,this.angle,this.coords);this.angle===3&&(this.target=[this.coords[0],this.coords[1]+o*c]),this.angle===0&&(this.target=[this.coords[0]+o*c,this.coords[1]]),this.angle===1&&(this.target=[this.coords[0],this.coords[1]-o*c]),this.angle===2&&(this.target=[this.coords[0]-o*c,this.coords[1]]),e?.start()}let t;this.target&&(t=[N(-this.moveSpeed,this.moveSpeed,this.target[0]-this.coords[0]),N(-this.moveSpeed,this.moveSpeed,this.target[1]-this.coords[1])]),t?.[0]===0&&t?.[1]===0&&(e?.complete(),this.target=void 0,t=void 0),t&&(this.coords=[this.coords[0]+t[0],this.coords[1]+t[1]])},Pt=(e,t,o)=>{let i=[0,0];t===S.DOWN?i=[0,-c]:t===S.LEFT?i=[-c,0]:t===S.RIGHT?i=[c,0]:i=[0,c];let r=0,s=[...o];for(;r<e;){s[0]+=i[0],s[1]+=i[1];const a=U(s),d=y(a);if(!nt[d.tile])break;r++}return r},Bt=function(e){let t=this.targetR;if(e.isStarted||(t=this.angle+e.value,t<0&&(t=4+t),t>3&&(t=t-4),e.start()),t===void 0){e.complete();return}this.targetR=t;const o=w[this.targetR];let i=0;if(e.value<0){let r=this.rad<o?this.rad+D:this.rad;i=-.05,r+i<=o&&e.complete()}else{let r=this.rad>o?this.rad-D:this.rad;i=.05,r+i>=o&&e.complete()}e.isComplete?(this.rad=w[this.targetR],this.angle=this.targetR,this.targetR=void 0):this.rad+=i,this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad)},Wt=function(e){e.complete();const t=U(this.coords);y(t).type===f.HOME?(Object.entries(this.inventory.inventory).forEach(([i,r])=>{n.inventory.add(i,r),this.inventory.remove(i,r)}),W(this.id,"Unloading")):W(this.id,"Unable to unload")},$t=function(e){if(!this.actions.includes(e.type)){e.complete();return}switch(e.isStarted||At(this,e),e.type){case"MOVE":return Dt.call(this,e);case"ROTATE":return Bt.call(this,e);case"MINE":return Ut.call(this,e);case"UNLOAD":return Wt.call(this,e)}};class Xt{id;type;actions;rotation=[0,1];rad=w[3];angle=3;inventory;target;targetR;coords;moveSpeed=c/100;indices;positions;binds;program;vao;vbo;posBuf;atlas;constructor(t,o,i=["MOVE","ROTATE"],r=10){this.id=t,this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,T*2,0,0,c,T*3,0,c,0,T*2,1,c,c,T*3,1]),this.coords=[Math.round(u/2*c)-c/2,Math.round(u/2*c)-c/2],this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad),this.actions=i,this.type=o,this.inventory=new M(void 0,r)}async init(t){const o=H(t,[J,g]);if(!o)throw new Error("No program");this.program=o;const i={position:t.getAttribLocation(o,"a_position"),move:t.getUniformLocation(o,"u_movement"),tileW:t.getUniformLocation(o,"tileW"),atlas:t.getAttribLocation(o,"a_texcoord"),camera:t.getUniformLocation(o,"camera"),resolution:t.getUniformLocation(o,"u_resolution"),rotation:t.getUniformLocation(o,"u_rotation")};if(i.camera===null||i.position===null||i.resolution===null||i.move===null||i.atlas===null)throw new Error("Bad binds");if(this.binds=i,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const r=2,s=t.FLOAT,a=!1,d=4*Float32Array.BYTES_PER_ELEMENT;let h=0;if(t.vertexAttribPointer(this.binds.position,r,s,a,d,h),t.enableVertexAttribArray(this.binds.position),h+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,r,s,a,d,h),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await Y(t,V),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}update(t){t&&$t.call(this,t)}render(t,o){!this.binds||!this.program||!this.vao||!this.vbo||!this.posBuf||!this.atlas||(k(t.canvas),t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),0),t.uniform2fv(this.binds.camera,[-o[0],-o[1]]),t.uniform2fv(this.binds.move,this.coords),t.uniform2fv(this.binds.rotation,this.rotation),t.uniform1f(this.binds.tileW,c/2),t.uniform2f(this.binds.resolution,...n.resolution(t)),t.drawElements(t.TRIANGLES,6,t.UNSIGNED_SHORT,0))}}let E,R=document.getElementById("c");const A=document.querySelector("#control_console input");let p=F;const Ht=()=>{R?.addEventListener("mousedown",e=>{E=[e.clientX,e.clientY]}),R?.addEventListener("mousemove",e=>{if(E){let t=[e.clientX,e.clientY];const i=.6+(n.zoom+(0-j))*.125,r=(t[0]-(E?.[0]??0))*i,s=(t[1]-(E?.[1]??0))*i;n.camera[0]=n.camera[0]-r,n.camera[1]=n.camera[1]+s,E=t}}),R?.addEventListener("mouseup",()=>E=void 0),R?.addEventListener("mouseout",()=>E=void 0),R?.addEventListener("wheel",e=>{const t=e.deltaY;n.setZoom(n.zoom+(t>0?1:-1))}),A?.addEventListener("keyup",e=>{const t=e.key,o=e.target.value;if(t==="Enter"&&o.length){n.history.push(o),Tt(o),e.target.value="";const i=n.getHistory();p=Math.min(i.length,F)}if(t==="ArrowUp"&&p>0){const i=n.getHistory();p--,A.value=i[p]??""}if(t==="ArrowDown"){const i=n.getHistory();p>=i.length?A.value="":(p++,A.value=i[p]??"")}}),A?.focus(),document.querySelector("#nav > div:first-of-type")?.addEventListener("click",e=>K(e.target,"control_console"))};class kt{indices;positions;binds;program;vao;vbo;posBuf;blockTex;atlas;constructor(){this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,0,1,0,c,0,0,c,0,T,1,c,c,T,0])}async init(t){const o=H(t,[Z,Q]);if(!o)throw new Error("No program");this.program=o;const i={position:t.getAttribLocation(o,"a_position"),atlas:t.getAttribLocation(o,"a_texcoord"),tileW:t.getUniformLocation(o,"tileW"),tileX:t.getUniformLocation(o,"tileX"),camera:t.getUniformLocation(o,"camera"),resolution:t.getUniformLocation(o,"u_resolution"),atlasW:t.getUniformLocation(o,"u_atlas_w")};if(i.camera===null||i.position===null||i.resolution===null||i.tileW===null||i.tileX===null||i.atlas===null)throw new Error("Bad binds");if(this.binds=i,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const r=2,s=t.FLOAT,a=!1,d=4*Float32Array.BYTES_PER_ELEMENT;let h=0;if(t.vertexAttribPointer(this.binds.position,r,s,a,d,h),t.enableVertexAttribArray(this.binds.position),h+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,r,s,a,d,h),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");if(t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await Y(t,V),this.blockTex=t.createTexture()??void 0,!this.blockTex)throw new Error("No block texture");t.bindTexture(t.TEXTURE_2D,this.blockTex);const m=O();t.texImage2D(t.TEXTURE_2D,0,t.RG32F,u,u,0,t.RG,t.FLOAT,m),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}update(t,o){o?.length&&this.blockTex&&(t.bindTexture(t.TEXTURE_2D,this.blockTex),o.forEach(i=>{t.texSubImage2D(t.TEXTURE_2D,0,i.coord[1],i.coord[0],1,1,t.RG,t.FLOAT,new Float32Array([i.type,i.durability]))}),t.bindTexture(t.TEXTURE_2D,null))}render(t,o){!this.binds||!this.program||!this.vao||!this.blockTex||!this.vbo||!this.posBuf||!this.atlas||(t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.uniform1i(this.binds.tileW,c),t.uniform1i(this.binds.tileX,u),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.blockTex),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_data"),0),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),1),t.uniform1f(this.binds.atlasW,T),t.uniform2fv(this.binds.camera,[-o[0],-o[1]]),t.uniform2f(this.binds.resolution,...n.resolution(t)),t.drawElementsInstanced(t.TRIANGLES,this.indices.length,t.UNSIGNED_SHORT,0,u*u))}}const Yt=async e=>{z();const t=new kt;n.inventory=new M(Et),n.onStory=vt,n.entities.push(new Xt(n.entities.length,"MINER",["ROTATE","MOVE","MINE","UNLOAD"])),n.camera=[(u/2-9)*c,(u/2-6)*c],Ht();for(let r of n.entities)await r.init(e);await t.init(e);const o=[];for([].forEach(([r,s])=>n.inventory.add(r,s)),o.forEach(r=>n.addWaypoint(r)),bt();;)await new Promise(r=>requestAnimationFrame(()=>{const s=n.actions.getActions();for(let a of n.entities){const d=s.find(h=>h.entityId===a.id);a.update(d)}t.update(e,n.actions.getMapUpdates()),k(e.canvas),e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(.2,.2,.2,1),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),t.render(e,n.camera);for(let a of n.entities)a.render(e,n.camera);r()}))},Vt=()=>{const t=document.querySelector("#c").getContext("webgl2",{premultipliedAlpha:!1});t?.getExtension("EXT_color_buffer_float"),t&&Yt(t)};Vt();
