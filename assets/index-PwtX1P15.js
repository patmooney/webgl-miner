(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function i(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(n){if(n.ep)return;n.ep=!0;const s=i(n);fetch(n.href,s)}})();const nt=`#version 300 es

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
`,rt=`#version 300 es

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
}`,st=`#version 300 es

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
`,at=`#version 300 es

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
}`;function Y(e){console&&(console.error?console.error(e):console.log&&console.log(e))}const ct=/ERROR:\s*\d+:(\d+)/gi;function H(e,t=""){const i=[...t.matchAll(ct)],o=new Map(i.map((n,s)=>{const a=parseInt(n[1]),c=i[s+1],h=c?c.index:t.length,E=t.substring(n.index,h);return[a-1,E]}));return e.split(`
`).map((n,s)=>{const a=o.get(s);return`${s+1}: ${n}${a?`

^^^ ${a}`:""}`}).join(`
`)}function dt(e,t,i,o){const n=o||Y,s=e.createShader(i);if(!s)return n("No shader"),null;if(e.shaderSource(s,t),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS)){const c=e.getShaderInfoLog(s);return n(`Error compiling shader: ${c}
${H(t,c??"")}`),e.deleteShader(s),null}return s}function lt(e,t,i,o,n){const s=n||Y,a=e.createProgram();if(!a)return null;if(t.forEach(function(h){e.attachShader(a,h)}),i&&i.forEach(function(h,E){e.bindAttribLocation(a,o?o[E]:E,h)}),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS)){const h=e.getProgramInfoLog(a),E=t.map(U=>{const ot=H(e.getShaderSource(U)??"");return`${e.getShaderParameter(U,e.SHADER_TYPE)}:
${ot}`}).join(`
`);return s(`Error in program linking: ${h}
${E}`),e.deleteProgram(a),null}return a}const ut=["VERTEX_SHADER","FRAGMENT_SHADER"];function X(e,t,i=[],o=[],n=()=>{}){const s=[];for(let a=0;a<t.length;++a)s.push(dt(e,t[a],e[ut[a]],n));return lt(e,s.filter(Boolean),i,o,n)}function V(e,t){t=t||1;const i=e.clientWidth*t|0,o=e.clientHeight*t|0;return e.width!==i||e.height!==o?(e.width=i,e.height=o,!0):!1}const G=async(e,t)=>{const i=e.createTexture()??void 0;if(!i)throw new Error("Invalid texture");e.bindTexture(e.TEXTURE_2D,i);const o=new Image;return o.src=t,new Promise(n=>{o.onload=()=>{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.bindTexture(e.TEXTURE_2D,null),n(i)}})},z=""+new URL("atlas-BxrVKyxQ.png",import.meta.url).href,d=40,l=200,ht=6,_=1/ht,b=2,M=10,I={RIGHT:0,LEFT:2,DOWN:1},N={0:0*Math.PI/180,1:90*Math.PI/180,2:180*Math.PI/180,3:270*Math.PI/180},B=360*Math.PI/180,j={stone:"Stone",iron:"Iron ore",carbon:"Carbon",copper:"Copper",module_visual_scanner:"Visual Scanner (Module)"};class F{inventory={};limit;total;hook;constructor(t,i){this.hook=t,this.limit=i,this.total=0}add(t,i=1){this.limit&&(i=Math.max(0,Math.min(this.limit-this.total,i))),i&&(this.total+=i,this.inventory[t]=(this.inventory[t]??0)+i,this.hook?.(t,i))}remove(t,i=1){return(this.inventory[t]??0)>=i?(this.inventory[t]=this.inventory[t]-i,this.total-=i,this.hook?.(t,-i),this.inventory[t]||delete this.inventory[t],!0):!1}}const D={FLOOR:0,ROCK:10,ORE:100,SHADOW:0,HOME:0},ft={FLOOR:!0,ROCK:!1,ORE:!1,SHADOW:!1,HOME:!0},f={FLOOR:0,ROCK:1,SHADOW:3,HOME:4,ORE:5},mt={ROCK:[{item:"stone",chance:1},{item:"iron",chance:.02}],ORE:[{item:"stone",chance:.01},{item:"iron",chance:.05},{item:"copper",chance:.02},{item:"carbon",chance:.01}]},Et=e=>Object.entries(f).find(([,t])=>t===e)?.[0]??"FLOOR",q=()=>{const e=l/2-4,t=l/2+4,i=l/2-2,o=l/2+2;let n=[];for(let s=0;s<l*l;s++){const a=s%l,c=Math.floor(s/l);if(c>i&&c<o&&a>i&&a<o){n.push(f.HOME,1);continue}if(c>e&&c<t&&a>e&&a<t){n.push(f.FLOOR,1);continue}if((c===e||c===t)&&a>=e&&a<=t){n.push(f.ROCK,1);continue}if((a===e||a===t)&&c>=e&&c<=t){n.push(f.ROCK,1);continue}n.push(f.SHADOW,1)}return new Float32Array(n)},y=e=>{const[t,i]=e,o=i*l+t,n=S().at(o*b),s=S().at(o*b+1)??0;if(n===void 0)throw new Error(`Invalid tile ${t} / ${i}`);return{coord:e,tile:Et(n),type:n,durability:s}},O=e=>[Math.round(e[0]/d),Math.round(e[1]/d)],yt=e=>{const t=[],[i,o]=e;return i>0&&t.push(y([i-1,o])),i<l-1&&t.push(y([i+1,o])),o>0&&t.push(y([i,o-1])),o<l-1&&t.push(y([i,o+1])),t};let w;const S=()=>(w||(w=q()),w),vt=e=>{const t=S(),[i,o]=e.coord,n=o*l+i;t[n*b]=e.type,t[n*b+1]=e.durability},g="ACTION_ADD",K="ACTION_REMOVE";class P{id;type;delta;value;timeEnd;entityId;parentId;isSilent=!1;isComplete=!1;isStarted=!1;isCancelled=!1;shouldCancel=!1;constructor(t,{delta:i,value:o,timeEnd:n,entityId:s},a=!1,c){this.type=t,this.delta=i,this.value=o,this.timeEnd=n,this.entityId=s,this.id=crypto.randomUUID(),this.isSilent=a,this.parentId=c,this.type==="ROTATE"&&(this.value=Math.max(Math.min(3,this.value??0),-3)),this.type==="MOVE"&&(this.value=Math.max(0,Math.min(l,o??0)))}complete(){this.isComplete=!0}start(){this.isStarted=!0}cancel(){this.isStarted?this.shouldCancel=!0:this.isCancelled=!0}}class pt{stack;mapUpdates;hook;constructor(){this.stack=[],this.mapUpdates=[],this.hook=new EventTarget}getActions(){return this.stack.filter(i=>i.isComplete).forEach(i=>{this.hook.dispatchEvent(new CustomEvent(K,{detail:i}))}),this.stack=[...this.stack.filter(i=>!i.isComplete&&!i.isCancelled)],this.stack}addAction(t,{delta:i,value:o,timeEnd:n,entityId:s}){const a=new P(t,{delta:i,value:o,timeEnd:n,entityId:s});return this.stack.push(a),this.hook.dispatchEvent(new CustomEvent(g,{detail:a})),a}addSilentAction(t,{delta:i,value:o,timeEnd:n,entityId:s},a){const c=new P(t,{delta:i,value:o,timeEnd:n,entityId:s},!0,a);this.stack.push(c)}cancelOneForEntity(t){const i=this.stack.find(n=>n.entityId===t);if(!i)return;const o=this.stack.filter(n=>n.parentId===i.id);return[i,...o].forEach(n=>n.cancel()),i}cancelAllForEntity(t){this.stack.filter(i=>i.entityId===t).forEach(i=>i.cancel())}getMapUpdates(){const t=[...this.mapUpdates];return this.mapUpdates=[],t}addMapUpdate(t){this.mapUpdates.push(t),vt(t)}}const C=(e,t,i)=>Math.max(e,Math.min(t,i)),Tt=10,Z=-3,Q="ENTITY_SELECTED";class _t{camera=[0,0];actions;zoom=0;selectedEntity;inventory;entities=[];story={};history=[];onStory;entityHook;constructor(t=new pt,i=new F,o){this.actions=t,this.inventory=i,this.onStory=o,this.entityHook=new EventTarget}selectEntity(t){this.entities.find(i=>i.id===t)&&(this.selectedEntity=t,this.entityHook.dispatchEvent(new CustomEvent(Q,{detail:t})))}resolution(t){const i=t.canvas.height/t.canvas.width,o=t.canvas.width+100*this.zoom,n=t.canvas.height+100*this.zoom*i;return[o,n]}setZoom(t){const i=C(Z,Tt,t);if(i>this.zoom)this.camera[0]=this.camera[0]-d,this.camera[1]=this.camera[1]-d;else if(i<this.zoom)this.camera[0]=this.camera[0]+d,this.camera[1]=this.camera[1]+d;else return;this.zoom=i}getHistory(){return this.history=this.history.slice(-M).toReversed().filter((t,i,o)=>o.indexOf(t)===i).reverse(),this.history}addWaypoint(t){this.story[t]||(this.story[t]=!0,this.onStory?.(t))}}const r=new _t;let v,R=document.getElementById("c");const A=document.querySelector("#control_console input");let p=M;const Rt=()=>{R?.addEventListener("mousedown",e=>{v=[e.clientX,e.clientY]}),R?.addEventListener("mousemove",e=>{if(v){let t=[e.clientX,e.clientY];const o=.6+(r.zoom+(0-Z))*.125,n=(t[0]-(v?.[0]??0))*o,s=(t[1]-(v?.[1]??0))*o;r.camera[0]=r.camera[0]-n,r.camera[1]=r.camera[1]+s,v=t}}),R?.addEventListener("mouseup",()=>v=void 0),R?.addEventListener("mouseout",()=>v=void 0),R?.addEventListener("wheel",e=>{const t=e.deltaY;r.setZoom(r.zoom+(t>0?1:-1))}),A?.addEventListener("keyup",e=>{const t=e.key,i=e.target.value;if(t==="Enter"&&i.length){r.history.push(i),Ct(i),e.target.value="";const o=r.getHistory();p=Math.min(o.length,M)}if(t==="ArrowUp"&&p>0){const o=r.getHistory();p--,A.value=o[p]??""}if(t==="ArrowDown"){const o=r.getHistory();p>=o.length?A.value="":(p++,A.value=o[p]??"")}}),A?.focus(),document.querySelector("#nav > div:first-of-type")?.addEventListener("click",e=>J(e.target,"control_console"))},J=(e,t)=>{Array.from(document.querySelectorAll("div#context > div")).forEach(i=>i.classList.add("hidden")),Array.from(document.querySelectorAll("#nav > div")).forEach(i=>i.classList.remove("active")),document.getElementById(t)?.classList.remove("hidden"),e.classList.add("active")},At=`
  <div id="interface_control" class="flex-row">
    <div></div>
    <div>
        <div class="flex-col gap justified">
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
            <div class="flex-row gap justified border">
                <button>Mine</button>
                <button>Unload</button>
            </div>
        </div>
    </div>
    <div></div>
  </div>
`,bt=()=>{const e=document.getElementById("nav"),t=document.getElementById("context"),i=document.createElement("div");i.textContent="Control";const o=document.createElement("div");if(o.id="control_control",o.classList.add("hidden"),o.innerHTML=At,i.addEventListener("click",()=>J(i,"control_control")),e?.appendChild(i),t?.appendChild(o),It(o),wt(),r.selectedEntity!==void 0){const n=r.actions.getActions().filter(s=>s.entityId===r.selectedEntity);St(n)}r.actions.hook.addEventListener(g,n=>{const s=n;s.detail.entityId===r.selectedEntity&&tt(s.detail)}),r.actions.hook.addEventListener(K,n=>{const s=n;s.detail.entityId===r.selectedEntity&&Ot(s.detail)}),r.entityHook.addEventListener(Q,n=>{const s=n;Array.from(document.querySelectorAll("#interface_control > div:first-child > div")).forEach(c=>c.classList.remove("active")),document.querySelector(`#interface_control > div:first-child > div[data-id="${s.detail}"]`)?.classList.add("active")})},St=e=>{const t=document.querySelector("#control_control > div:last-child");if(t){t.innerHTML="";for(let i of e)tt(i,t)}},tt=(e,t)=>{t=t??document.querySelector("#interface_control > div:last-child")??void 0;const i=document.createElement("div");i.textContent=`${e.type} - ${e.value}`,i.dataset.id=e.id,t?.appendChild(i)},Ot=e=>{const t=document.querySelector("#interface_control > div:last-child")??void 0;t&&t.querySelector(`div[data-id="${e.id}"]`)?.remove()},It=e=>{const[t,i,o,n,s,a]=Array.from(e.querySelectorAll("button"));i.addEventListener("click",()=>{r.selectedEntity!==void 0&&r.actions.addAction("MOVE",{value:5,entityId:r.selectedEntity})}),t.addEventListener("click",()=>{r.selectedEntity!==void 0&&r.actions.addAction("MOVE",{value:1,entityId:r.selectedEntity})}),o.addEventListener("click",()=>{r.selectedEntity!==void 0&&r.actions.addAction("ROTATE",{value:-1,entityId:r.selectedEntity})}),n.addEventListener("click",()=>{r.selectedEntity!==void 0&&r.actions.addAction("ROTATE",{value:1,entityId:r.selectedEntity})}),s.addEventListener("click",()=>{r.selectedEntity!==void 0&&r.actions.addAction("MINE",{value:0,entityId:r.selectedEntity})}),a.addEventListener("click",()=>{r.selectedEntity!==void 0&&r.actions.addAction("UNLOAD",{value:0,entityId:r.selectedEntity})})},wt=()=>{const e=document.querySelector("#interface_control > div:first-child")??void 0;e&&r.entities.forEach(t=>{const i=document.createElement("div");i.dataset.id=t.id.toString(),i.textContent=`[${t.id}] ${t.type}`,e.appendChild(i),i.addEventListener("click",()=>r.selectEntity(t.id))})},L={VISUAL_SCAN_MODULE:{ingredients:[{item:"iron",count:10}],story:["IRON_FIRST"],description:"Visually assess one tile in front",type:"MODULE",item:"module_visual_scanner"},CONTROL_INTERFACE:{ingredients:[{item:"stone",count:50},{item:"iron",count:10}],story:["IRON_FIRST"],description:"Extra control interface for manual remote instruction",type:"INTERFACE",waypoint:"INTERFACE_CONTROL_INTERFACE"},AUTOMATION_INTERFACE:{ingredients:[{item:"stone",count:50},{item:"iron",count:10},{item:"copper",count:10},{item:"carbon",count:10}],story:["IRON_FIRST","CARBON_FIRST","COPPER_FIRST"],description:"Allow automated remote instruction",type:"INTERFACE",waypoint:"INTERFACE_AUTOMATION_INTERFACE"}},xt=e=>{r.story.STORAGE_FIRST||r.addWaypoint("STORAGE_FIRST"),e==="iron"&&!r.story.IRON_FIRST&&r.addWaypoint("IRON_FIRST"),e==="carbon"&&!r.story.CARBON_FIRST&&r.addWaypoint("CARBON_FIRST"),e==="copper"&&!r.story.COPPER_FIRST&&r.addWaypoint("COPPER_FIRST")},et=e=>{const t=L[e];if(!t)return!1;for(let i of t.ingredients)if((r.inventory.inventory[i.item]??0)<i.count)return!1;for(let i of t.ingredients)r.inventory.remove(i.item,i.count);return t.type==="MODULE"?r.inventory.add(t.item):t.type==="INTERFACE"&&r.addWaypoint(t.waypoint),!0},Nt=e=>{switch(e){case"STORAGE_FIRST":T(`Crafting Unlocked
see command "crafting" for more information`);break;case"IRON_FIRST":T("New recipes available");break;case"CARBON_FIRST":r.story.COPPER_FIRST&&T("New recipes available");break;case"COPPER_FIRST":r.story.CARBON_FIRST&&T("New recipes available");break;case"INTERFACE_CONTROL_INTERFACE":T("Control interface installed"),$();break;case"INTERFACE_AUTOMATION_INTERFACE":T("Automation interface installed"),$();break}},$=()=>{bt()},x=document.querySelector("#control_console div#output"),Ct=e=>{u(" "),u(` > ${e}`);const[t,i]=e.split(" "),o=t.toLowerCase(),n=Ft(o,i);if(n===!1){m("Invalid argument");return}else if(n)return;const s=Mt(o,i);if(s===!1){m("No entity selected!");return}else if(s)return;m(`Unknown command: ${o}`)},Lt=e=>{u(`[WARNING] ${e}`,"warning")},m=e=>{u(`[ERROR] ${e}`,"error")},Mt=(e,t)=>{const i=r.selectedEntity!==void 0?r.entities.find(n=>n.id===r.selectedEntity):void 0;if(!i)return;const o=n=>{const s=parseInt(t??0),a=r.actions.addAction(n,{entityId:i.id,timeEnd:Date.now()+1e5,value:parseInt(t??0)});if(n==="MOVE"||n==="ROTATE")for(let c=1;c<s;c++)r.actions.addSilentAction(n,{entityId:i.id,timeEnd:Date.now()+1e5,value:parseInt(t??0)},a.id);return!0};if(i.actions.includes(e.toUpperCase()))return o(e.toUpperCase())},Ft=(e,t)=>{switch(e){case"help":return $t(),!0;case"list":return Pt(),!0;case"selected":return kt(),!0;case"commands":return Wt(),!0;case"storage":return Yt(),!0;case"inventory":return Ht(),!0;case"battery":return Xt(),!0;case"cancel":return Vt(),!0;case"halt":return Gt(),!0;case"select":return Ut(parseInt(t));case"crafting":return zt(t);default:return}},Ut=e=>isNaN(e)||!r.entities.find(i=>i.id===e)?!1:(r.selectEntity(e),u(`Entity ${e} selected`),!0),Bt=(e,t)=>{!t||t.isSilent||u(`[${(Date.now()/1e3).toFixed(0)}] Entity [${e.id}] - ${t.type}: ${t.value}`,"log")},k=(e,t)=>{u(`[ENTITY:${e}] ${t}`)},u=(e,t)=>{e.split(`
`).map(i=>{const o=document.createElement("p");o.textContent=i||"",t&&(o.className=t),x?.appendChild(o)}),x?.scrollTo(0,x.scrollHeight??0)},T=e=>{u(e,"important")},Dt=()=>{T(`Welcome
========
Type "help" to get started`)},Pt=()=>{u(`
ENTITIES
==========

${r.entities.map(e=>`[${e.id}] - ${e.type}`).join(`
`)}
`)},$t=()=>{const e=[];r.story.STORAGE_FIRST&&e.push("crafting    - List and craft available recipes"),u(`
HELP
=====

- Manage -
list       - List available entities.
storage    - Show current store inventory.

- Entity -
select <n> - Select entity for control.
selected   - Show currently selected entitiy.
commands   - List available commands for selected entity.
inventory  - Show current entity inventory.
battery    - Show current entity battery value.
cancel     - Cancel current action where possible.
halt       - Cancel all queued actions including current where possible.
${e.join(`
`)}
`)},kt=()=>{const e=r.selectedEntity!==void 0?r.entities.find(t=>t.id===r.selectedEntity):void 0;u(`
SELECTED
=========

${e?`[${e.id}] - ${e.type}`:"- NONE -"}
`)},Wt=()=>{const e=r.selectedEntity!==void 0?r.entities.find(t=>t.id===r.selectedEntity):void 0;if(!e)return m("No entity selected");u(`
COMMANDS
=========

${e.actions.map(t=>` - ${t.toLowerCase()}`).join(`
`)}
`)},Yt=()=>{u(`
STORAGE
========

${Object.entries(r.inventory.inventory).map(([e,t])=>`${j[e]} - ${t}`).join(`
`)}
`)},Ht=()=>{const e=r.selectedEntity!==void 0?r.entities.find(t=>t.id===r.selectedEntity):void 0;if(!e)return m("No entity selected");u(`
INVENTORY
==========
Slots: ${e.inventory.total} / ${e.inventory.limit??"-"}

${Object.entries(e.inventory.inventory).map(([t,i])=>`${j[t]} - ${i}`).join(`
`)}
`)},Xt=()=>{const e=r.selectedEntity!==void 0?r.entities.find(t=>t.id===r.selectedEntity):void 0;if(!e)return m("No entity selected");u(`Entity [${e.id}] battery: ${e.battery} / 100`)},Vt=()=>{const e=r.selectedEntity!==void 0?r.entities.find(i=>i.id===r.selectedEntity):void 0;if(!e)return m("No entity selected");const t=r.actions.cancelOneForEntity(e.id);t&&u(`Entity [${e.id}] request to cancel ${t.type}`)},Gt=()=>{const e=r.selectedEntity!==void 0?r.entities.find(t=>t.id===r.selectedEntity):void 0;if(!e)return m("No entity selected");r.actions.cancelAllForEntity(e.id),u(`Entity [${e.id}] cancel all queued actions`)},zt=e=>{if(!r.story.STORAGE_FIRST)return;if(e?.trim())return L[e]?et(e):(m(`Unknown recipe: ${e}`),!0);const t=Object.entries(L).filter(([,i])=>(i.story??[]).every(o=>r.story[o])).filter(([,i])=>!i.waypoint||!r.story[i.waypoint]).map(([i,o])=>`${i}
${o.description}
${o.ingredients.map(n=>` - ${n.item} x ${n.count}`).join(`
`)}`);return u(`
CRAFTING
=========

Usage: "crafting <recipe>"

${t?.length?`- Recipes -

`+t.join(`

`):" - No recipes available -"}
`),!0},jt=2,qt=1,gt=2e3,Kt=function(e){if(e.isStarted||(e.timeEnd=Date.now()+gt,e.start()),e.timeEnd>Date.now())return;e.complete();const t=it(O(this.coords),this.angle,1);if(t.type===f.ROCK||t.type===f.ORE){let i=t.durability*D[t.tile];i-=qt;const o=mt[t.tile]??[];for(let n of o)Math.random()<=n.chance&&this.inventory.add(n.item);if(i<=0){const n=yt(t.coord);r.actions.addMapUpdate({...t,type:f.FLOOR,durability:1});for(let s of n)if(s.type===f.SHADOW){let a=f.ROCK;Math.random()<.05&&(a=f.ORE),r.actions.addMapUpdate({...s,type:a,durability:1})}}else r.actions.addMapUpdate({...t,durability:i/D[t.tile]})}},it=(e,t,i=1)=>{const o=[...e];return t===0?o[0]+=i:t===1?o[1]-=i:t===2?o[0]-=i:t===3&&(o[1]+=i),y(o)},Zt=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:jt,command:Kt,getFacingTile:it},Symbol.toStringTag,{value:"Module"})),Qt=1,Jt=function(e){if(!e.isStarted){const o=te(1,this.angle,this.coords);this.angle===3&&(this.target=[this.coords[0],this.coords[1]+o*d]),this.angle===0&&(this.target=[this.coords[0]+o*d,this.coords[1]]),this.angle===1&&(this.target=[this.coords[0],this.coords[1]-o*d]),this.angle===2&&(this.target=[this.coords[0]-o*d,this.coords[1]]),e?.start()}let t;this.target&&(t=[C(-this.moveSpeed,this.moveSpeed,this.target[0]-this.coords[0]),C(-this.moveSpeed,this.moveSpeed,this.target[1]-this.coords[1])]),t?.[0]===0&&t?.[1]===0&&(e?.complete(),this.target=void 0,t=void 0),t&&(this.coords=[this.coords[0]+t[0],this.coords[1]+t[1]])},te=(e,t,i)=>{let o=[0,0];t===I.DOWN?o=[0,-d]:t===I.LEFT?o=[-d,0]:t===I.RIGHT?o=[d,0]:o=[0,d];let n=0,s=[...i];for(;n<e;){s[0]+=o[0],s[1]+=o[1];const a=O(s),c=y(a);if(!ft[c.tile])break;n++}return n},ee=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:Qt,command:Jt},Symbol.toStringTag,{value:"Module"})),ie=1,oe=function(e){let t=this.targetR;if(e.isStarted||(t=this.angle+(e.value>0?1:-1),t<0&&(t=4+t),t>3&&(t=t-4),e.start()),t===void 0){e.complete();return}this.targetR=t;const i=N[this.targetR];let o=0;if(e.value<0){let n=this.rad<i?this.rad+B:this.rad;o=-.05,n+o<=i&&e.complete()}else{let n=this.rad>i?this.rad-B:this.rad;o=.05,n+o>=i&&e.complete()}e.isComplete?(this.rad=N[this.targetR],this.angle=this.targetR,this.targetR=void 0):this.rad+=o,this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad)},ne=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:ie,command:oe},Symbol.toStringTag,{value:"Module"})),re=0,se=function(e){e.complete();const t=O(this.coords);y(t).type===f.HOME?(Object.entries(this.inventory.inventory).forEach(([o,n])=>{r.inventory.add(o,n),this.inventory.remove(o,n)}),k(this.id,"Unloading")):k(this.id,"Unable to unload")},ae=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:re,command:se},Symbol.toStringTag,{value:"Module"})),ce=0,W=1e3,de=function(e){if(!e.isStarted){const t=O(this.coords);if(y(t).type!==f.HOME){m(`Entity [${this.id}] - Unable to recharge at this location`),e.complete();return}e.timeEnd=Date.now()+W,e.start()}if(!(e.timeEnd>Date.now())){if(this.battery>=this.maxBattery||e.shouldCancel){e.complete();return}this.battery++,e.timeEnd=Date.now()+W}},le=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:ce,command:de},Symbol.toStringTag,{value:"Module"})),ue=function(e){if(!this.actions.includes(e.type)){e.complete();return}let t;switch(e.type){case"MOVE":t=ee;break;case"ROTATE":t=ne;break;case"MINE":t=Zt;break;case"UNLOAD":t=ae;break;case"RECHARGE":t=le;break}if(t){if(!e.isStarted){if(t.BATTERY_COST){if(this.battery<t.BATTERY_COST)return;this.battery=Math.max(0,this.battery-t.BATTERY_COST)}Bt(this,e)}return t.command.call(this,e)}};class he{id;type;actions;rotation=[0,1];rad=N[3];angle=3;inventory;battery;maxBattery;target;targetR;coords;moveSpeed=d/100;indices;positions;binds;program;vao;vbo;posBuf;atlas;constructor(t,i,o=["MOVE","ROTATE"],n=10){this.id=t,this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,_*2,0,0,d,_*3,0,d,0,_*2,1,d,d,_*3,1]),this.coords=[Math.round(l/2*d)-d/2,Math.round(l/2*d)-d/2],this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad),this.actions=o,this.type=i,this.inventory=new F(void 0,n),this.battery=11,this.maxBattery=100}async init(t){const i=X(t,[st,at]);if(!i)throw new Error("No program");this.program=i;const o={position:t.getAttribLocation(i,"a_position"),move:t.getUniformLocation(i,"u_movement"),tileW:t.getUniformLocation(i,"tileW"),atlas:t.getAttribLocation(i,"a_texcoord"),camera:t.getUniformLocation(i,"camera"),resolution:t.getUniformLocation(i,"u_resolution"),rotation:t.getUniformLocation(i,"u_rotation"),isSelected:t.getUniformLocation(i,"u_selected")};if(o.camera===null||o.position===null||o.resolution===null||o.move===null||o.atlas===null)throw new Error("Bad binds");if(this.binds=o,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const n=2,s=t.FLOAT,a=!1,c=4*Float32Array.BYTES_PER_ELEMENT;let h=0;if(t.vertexAttribPointer(this.binds.position,n,s,a,c,h),t.enableVertexAttribArray(this.binds.position),h+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,n,s,a,c,h),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await G(t,z),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}update(t){const i=this.battery;t&&ue.call(this,t),this.battery!==i&&(this.battery<=0?m(`Entity ${this.id} - no power, battery empty`):this.battery<=this.maxBattery*.2&&i>this.maxBattery*.2?Lt(`Entity ${this.id} - battery low warning`):this.battery<=this.maxBattery*.1&&i>this.maxBattery*.1&&m(`Entity ${this.id} - battery is critical`))}render(t,i){!this.binds||!this.program||!this.vao||!this.vbo||!this.posBuf||!this.atlas||(V(t.canvas),t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),0),t.uniform2fv(this.binds.camera,[-i[0],-i[1]]),t.uniform2fv(this.binds.move,this.coords),t.uniform2fv(this.binds.rotation,this.rotation),t.uniform1f(this.binds.tileW,d/2),t.uniform1i(this.binds.isSelected,this.id===r.selectedEntity?2:0),t.uniform2f(this.binds.resolution,...r.resolution(t)),t.drawElements(t.TRIANGLES,6,t.UNSIGNED_SHORT,0))}}class fe{indices;positions;binds;program;vao;vbo;posBuf;blockTex;atlas;constructor(){this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,0,1,0,d,0,0,d,0,_,1,d,d,_,0])}async init(t){const i=X(t,[nt,rt]);if(!i)throw new Error("No program");this.program=i;const o={position:t.getAttribLocation(i,"a_position"),atlas:t.getAttribLocation(i,"a_texcoord"),tileW:t.getUniformLocation(i,"tileW"),tileX:t.getUniformLocation(i,"tileX"),camera:t.getUniformLocation(i,"camera"),resolution:t.getUniformLocation(i,"u_resolution"),atlasW:t.getUniformLocation(i,"u_atlas_w")};if(o.camera===null||o.position===null||o.resolution===null||o.tileW===null||o.tileX===null||o.atlas===null)throw new Error("Bad binds");if(this.binds=o,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const n=2,s=t.FLOAT,a=!1,c=4*Float32Array.BYTES_PER_ELEMENT;let h=0;if(t.vertexAttribPointer(this.binds.position,n,s,a,c,h),t.enableVertexAttribArray(this.binds.position),h+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,n,s,a,c,h),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");if(t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await G(t,z),this.blockTex=t.createTexture()??void 0,!this.blockTex)throw new Error("No block texture");t.bindTexture(t.TEXTURE_2D,this.blockTex);const E=S();t.texImage2D(t.TEXTURE_2D,0,t.RG32F,l,l,0,t.RG,t.FLOAT,E),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}update(t,i){i?.length&&this.blockTex&&(t.bindTexture(t.TEXTURE_2D,this.blockTex),i.forEach(o=>{t.texSubImage2D(t.TEXTURE_2D,0,o.coord[1],o.coord[0],1,1,t.RG,t.FLOAT,new Float32Array([o.type,o.durability]))}),t.bindTexture(t.TEXTURE_2D,null))}render(t,i){!this.binds||!this.program||!this.vao||!this.blockTex||!this.vbo||!this.posBuf||!this.atlas||(t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.uniform1i(this.binds.tileW,d),t.uniform1i(this.binds.tileX,l),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.blockTex),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_data"),0),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),1),t.uniform1f(this.binds.atlasW,_),t.uniform2fv(this.binds.camera,[-i[0],-i[1]]),t.uniform2f(this.binds.resolution,...r.resolution(t)),t.drawElementsInstanced(t.TRIANGLES,this.indices.length,t.UNSIGNED_SHORT,0,l*l))}}const me=async e=>{q();const t=new fe;r.inventory=new F(xt),r.onStory=Nt,r.entities.push(new he(r.entities.length,"MINER",["ROTATE","MOVE","MINE","UNLOAD","RECHARGE"])),r.camera=[(l/2-9)*d,(l/2-6)*d],Rt();for(let n of r.entities)await n.init(e);await t.init(e);const i=[];for([].forEach(([n,s])=>r.inventory.add(n,s)),i.forEach(n=>r.addWaypoint(n)),et("CONTROL_INTERFACE"),Dt();;)await new Promise(n=>requestAnimationFrame(()=>{const s=r.actions.getActions();for(let a of r.entities){const c=s.find(h=>h.entityId===a.id);a.update(c)}t.update(e,r.actions.getMapUpdates()),V(e.canvas),e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(.2,.2,.2,1),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),t.render(e,r.camera);for(let a of r.entities)a.render(e,r.camera);n()}))},Ee=()=>{const t=document.querySelector("#c").getContext("webgl2",{premultipliedAlpha:!1});t?.getExtension("EXT_color_buffer_float"),t&&me(t)};Ee();
