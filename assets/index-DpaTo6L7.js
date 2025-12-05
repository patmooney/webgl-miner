(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function i(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(r){if(r.ep)return;r.ep=!0;const s=i(r);fetch(r.href,s)}})();const rt=`#version 300 es

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
`,st=`#version 300 es

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
}`,at=`#version 300 es

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
`,ct=`#version 300 es

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
}`;function z(e){console&&(console.error?console.error(e):console.log&&console.log(e))}const dt=/ERROR:\s*\d+:(\d+)/gi;function X(e,t=""){const i=[...t.matchAll(dt)],o=new Map(i.map((r,s)=>{const a=parseInt(r[1]),c=i[s+1],l=c?c.index:t.length,f=t.substring(r.index,l);return[a-1,f]}));return e.split(`
`).map((r,s)=>{const a=o.get(s);return`${s+1}: ${r}${a?`

^^^ ${a}`:""}`}).join(`
`)}function lt(e,t,i,o){const r=o||z,s=e.createShader(i);if(!s)return r("No shader"),null;if(e.shaderSource(s,t),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS)){const c=e.getShaderInfoLog(s);return r(`Error compiling shader: ${c}
${X(t,c??"")}`),e.deleteShader(s),null}return s}function ut(e,t,i,o,r){const s=r||z,a=e.createProgram();if(!a)return null;if(t.forEach(function(l){e.attachShader(a,l)}),i&&i.forEach(function(l,f){e.bindAttribLocation(a,o?o[f]:f,l)}),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS)){const l=e.getProgramInfoLog(a),f=t.map(D=>{const nt=X(e.getShaderSource(D)??"");return`${e.getShaderParameter(D,e.SHADER_TYPE)}:
${nt}`}).join(`
`);return s(`Error in program linking: ${l}
${f}`),e.deleteProgram(a),null}return a}const ht=["VERTEX_SHADER","FRAGMENT_SHADER"];function G(e,t,i=[],o=[],r=()=>{}){const s=[];for(let a=0;a<t.length;++a)s.push(lt(e,t[a],e[ht[a]],r));return ut(e,s.filter(Boolean),i,o,r)}function g(e,t){t=t||1;const i=e.clientWidth*t|0,o=e.clientHeight*t|0;return e.width!==i||e.height!==o?(e.width=i,e.height=o,!0):!1}const j=async(e,t)=>{const i=e.createTexture()??void 0;if(!i)throw new Error("Invalid texture");e.bindTexture(e.TEXTURE_2D,i);const o=new Image;return o.src=t,new Promise(r=>{o.onload=()=>{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.bindTexture(e.TEXTURE_2D,null),r(i)}})},q=""+new URL("atlas-BxrVKyxQ.png",import.meta.url).href,d=40,u=200,ft=6,T=1/ft,A=2,F=10,I={RIGHT:0,LEFT:2,DOWN:1},L={0:0*Math.PI/180,1:90*Math.PI/180,2:180*Math.PI/180,3:270*Math.PI/180},P=360*Math.PI/180,$={FLOOR:0,ROCK:10,ORE:100,SHADOW:0,HOME:0},mt={FLOOR:!0,ROCK:!1,ORE:!1,SHADOW:!1,HOME:!0},m={FLOOR:0,ROCK:1,SHADOW:3,HOME:4,ORE:5},Et={ROCK:[{item:"stone",chance:.5},{item:"iron",baseChance:.02}],ORE:[{item:"stone",chance:.01},{item:"iron",baseChance:.05},{item:"copper",baseChance:.02},{item:"carbon",baseChance:.01}]},yt=e=>Object.entries(m).find(([,t])=>t===e)?.[0]??"FLOOR",K=()=>{const e=u/2-4,t=u/2+4,i=u/2-2,o=u/2+2;let r=[];for(let s=0;s<u*u;s++){const a=s%u,c=Math.floor(s/u);if(c>i&&c<o&&a>i&&a<o){r.push(m.HOME,1);continue}if(c>e&&c<t&&a>e&&a<t){r.push(m.FLOOR,1);continue}if((c===e||c===t)&&a>=e&&a<=t){r.push(m.ROCK,1);continue}if((a===e||a===t)&&c>=e&&c<=t){r.push(m.ROCK,1);continue}r.push(m.SHADOW,1)}return new Float32Array(r)},y=e=>{const[t,i]=e,o=i*u+t,r=S().at(o*A),s=S().at(o*A+1)??0;if(r===void 0)throw new Error(`Invalid tile ${t} / ${i}`);return{coord:e,tile:yt(r),type:r,durability:s}},O=e=>[Math.round(e[0]/d),Math.round(e[1]/d)],pt=e=>{const t=[],[i,o]=e;return i>0&&t.push(y([i-1,o])),i<u-1&&t.push(y([i+1,o])),o>0&&t.push(y([i,o-1])),o<u-1&&t.push(y([i,o+1])),t},vt=e=>{const t=u/2;return Math.round(Math.sqrt(Math.pow(e.coord[0]-t,2)+Math.pow(e.coord[1]-t,2)))};let M;const S=()=>(M||(M=K()),M),_t=e=>{const t=S(),[i,o]=e.coord,r=o*u+i;t[r*A]=e.type,t[r*A+1]=e.durability},Z="ACTION_ADD",Q="ACTION_REMOVE";class k{id;type;delta;value;timeEnd;entityId;parentId;isSilent=!1;isComplete=!1;isStarted=!1;isCancelled=!1;shouldCancel=!1;constructor(t,{delta:i,value:o,timeEnd:r,entityId:s},a=!1,c){this.type=t,this.delta=i,this.value=o,this.timeEnd=r,this.entityId=s,this.id=crypto.randomUUID(),this.isSilent=a,this.parentId=c,this.type==="ROTATE"&&(this.value=Math.max(Math.min(3,this.value??0),-3)),this.type==="MOVE"&&(this.value=Math.max(0,Math.min(u,o??0)))}complete(){this.isComplete=!0}start(){this.isStarted=!0}cancel(){this.isStarted?this.shouldCancel=!0:this.isCancelled=!0}}class Tt{stack;mapUpdates;hook;constructor(){this.stack=[],this.mapUpdates=[],this.hook=new EventTarget}getActions(){return this.stack.filter(i=>i.isComplete).forEach(i=>{this.hook.dispatchEvent(new CustomEvent(Q,{detail:i}))}),this.stack=[...this.stack.filter(i=>!i.isComplete&&!i.isCancelled)],this.stack}addAction(t,{delta:i,value:o,timeEnd:r,entityId:s}){const a=new k(t,{delta:i,value:o,timeEnd:r,entityId:s});return this.stack.push(a),this.hook.dispatchEvent(new CustomEvent(Z,{detail:a})),a}addSilentAction(t,{delta:i,value:o,timeEnd:r,entityId:s},a){const c=new k(t,{delta:i,value:o,timeEnd:r,entityId:s},!0,a);this.stack.push(c)}cancelOneForEntity(t){const i=this.stack.find(r=>r.entityId===t);if(!i)return;const o=this.stack.filter(r=>r.parentId===i.id);return[i,...o].forEach(r=>r.cancel()),i}cancelAllForEntity(t){this.stack.filter(i=>i.entityId===t).forEach(i=>i.cancel())}getMapUpdates(){const t=[...this.mapUpdates];return this.mapUpdates=[],t}addMapUpdate(t){this.mapUpdates.push(t),_t(t)}}class U{inventory={};limit;total;hook;constructor(t,i){this.hook=t,this.limit=i,this.total=0}add(t,i=1){this.limit&&(i=Math.max(0,Math.min(this.limit-this.total,i))),i&&(this.total+=i,this.inventory[t]=(this.inventory[t]??0)+i,this.hook?.(t,i))}remove(t,i=1){return(this.inventory[t]??0)>=i?(this.inventory[t]=this.inventory[t]-i,this.total-=i,this.hook?.(t,-i),this.inventory[t]||delete this.inventory[t],!0):!1}}const x=(e,t,i)=>Math.max(e,Math.min(t,i)),Rt=10,J=-3,tt="ENTITY_SELECTED";class bt{camera=[0,0];actions;zoom=0;selectedEntity;inventory;isFollowing;entities=[];story={};history=[];onStory;entityHook;constructor(t=new Tt,i=new U,o){this.actions=t,this.inventory=i,this.onStory=o,this.entityHook=new EventTarget}selectEntity(t){this.focusEntity(t)&&(this.selectedEntity=t,this.entityHook.dispatchEvent(new CustomEvent(tt,{detail:t})))}focusEntity(t){const i=this.entities.find(o=>o.id===t);return i?(this.isFollowing=t,this.camera=[i.coords[0]-8.5*d,i.coords[1]-6.5*d],this.zoom=0,!0):!1}resolution(t){const i=t.canvas.height/t.canvas.width,o=t.canvas.width+100*this.zoom,r=t.canvas.height+100*this.zoom*i;return[o,r]}setZoom(t){const i=x(J,Rt,t);if(i>this.zoom)this.camera[0]=this.camera[0]-d,this.camera[1]=this.camera[1]-d;else if(i<this.zoom)this.camera[0]=this.camera[0]+d,this.camera[1]=this.camera[1]+d;else return;this.zoom=i}getHistory(){return this.history=this.history.slice(-F).toReversed().filter((t,i,o)=>o.indexOf(t)===i).reverse(),this.history}addWaypoint(t){this.story[t]||(this.story[t]=!0,this.onStory?.(t))}}const n=new bt;let p,R=document.getElementById("c");const b=document.querySelector("#control_console input");let v=F;const At=()=>{R?.addEventListener("mousedown",e=>{p=[e.clientX,e.clientY]}),R?.addEventListener("mousemove",e=>{if(p){n.isFollowing=void 0;let t=[e.clientX,e.clientY];const o=.6+(n.zoom+(0-J))*.125,r=(t[0]-(p?.[0]??0))*o,s=(t[1]-(p?.[1]??0))*o;n.camera[0]=n.camera[0]-r,n.camera[1]=n.camera[1]+s,p=t}}),R?.addEventListener("mouseup",()=>p=void 0),R?.addEventListener("mouseout",()=>p=void 0),R?.addEventListener("wheel",e=>{const t=e.deltaY;n.setZoom(n.zoom+(t>0?1:-1))}),b?.addEventListener("keyup",e=>{const t=e.key,i=e.target.value;if(t==="Enter"&&i.length){n.history.push(i),Ct(i),e.target.value="";const o=n.getHistory();v=Math.min(o.length,F)}if(t==="ArrowUp"&&v>0){const o=n.getHistory();v--,b.value=o[v]??""}if(t==="ArrowDown"){const o=n.getHistory();v>=o.length?b.value="":(v++,b.value=o[v]??"")}}),b?.focus(),document.querySelector("#nav > div:first-of-type")?.addEventListener("click",e=>et(e.target,"control_console"))},et=(e,t)=>{Array.from(document.querySelectorAll("div#context > div")).forEach(i=>i.classList.add("hidden")),Array.from(document.querySelectorAll("#nav > div")).forEach(i=>i.classList.remove("active")),document.getElementById(t)?.classList.remove("hidden"),e.classList.add("active")},St=`
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
            <div class="flex-row gap justified border">
                <button>Mine</button>
                <button>Mine x 5</button>
                <button>Unload</button>
                <button>Recharge</button>
            </div>
        </div>
    </div>
    <div></div>
  </div>
`,Ot=()=>{const e=document.getElementById("nav"),t=document.getElementById("context"),i=document.createElement("div");i.textContent="Control";const o=document.createElement("div");if(o.id="control_control",o.classList.add("hidden"),o.innerHTML=St,i.addEventListener("click",()=>et(i,"control_control")),e?.appendChild(i),t?.appendChild(o),Mt(o),Nt(),n.selectedEntity!==void 0){const r=n.actions.getActions().filter(s=>s.entityId===n.selectedEntity&&!s.isSilent);W(r)}n.actions.hook.addEventListener(Z,r=>{const s=r;s.detail.entityId===n.selectedEntity&&it(s.detail)}),n.actions.hook.addEventListener(Q,r=>{const s=r;s.detail.entityId===n.selectedEntity&&It(s.detail)}),n.entityHook.addEventListener(tt,r=>{const s=r;Array.from(document.querySelectorAll("#interface_control > div:first-child > div")).forEach(l=>l.classList.remove("active")),document.querySelector(`#interface_control > div:first-child > div[data-id="${s.detail}"]`)?.classList.add("active");const c=n.actions.getActions().filter(l=>l.entityId===n.selectedEntity&&!l.isSilent);W(c)})},W=e=>{const t=document.querySelector("#interface_control > div:last-child");if(t){t.innerHTML="";for(let i of e)it(i,t)}},it=(e,t)=>{t=t??document.querySelector("#interface_control > div:last-child")??void 0;const i=document.createElement("div");i.textContent=`${e.type} - ${e.value}`,i.dataset.id=e.id,t?.appendChild(i)},It=e=>{const t=document.querySelector("#interface_control > div:last-child")??void 0;t&&t.querySelector(`div[data-id="${e.id}"]`)?.remove()},Mt=e=>{const[t,i,o,r,s,a,c,l]=Array.from(e.querySelectorAll("button"));i.addEventListener("click",()=>{if(n.selectedEntity!==void 0){n.actions.addAction("MOVE",{value:5,entityId:n.selectedEntity});for(let f=1;f<5;f++)n.actions.addSilentAction("MOVE",{value:1,entityId:n.selectedEntity})}}),t.addEventListener("click",()=>{n.selectedEntity!==void 0&&n.actions.addAction("MOVE",{value:1,entityId:n.selectedEntity})}),o.addEventListener("click",()=>{n.selectedEntity!==void 0&&n.actions.addAction("ROTATE",{value:-1,entityId:n.selectedEntity})}),r.addEventListener("click",()=>{n.selectedEntity!==void 0&&n.actions.addAction("ROTATE",{value:1,entityId:n.selectedEntity})}),s.addEventListener("click",()=>{n.selectedEntity!==void 0&&n.actions.addAction("MINE",{value:0,entityId:n.selectedEntity})}),a.addEventListener("click",()=>{if(n.selectedEntity!==void 0){n.actions.addAction("MINE",{value:5,entityId:n.selectedEntity});for(let f=1;f<5;f++)n.actions.addSilentAction("MINE",{value:1,entityId:n.selectedEntity})}}),c.addEventListener("click",()=>{n.selectedEntity!==void 0&&n.actions.addAction("UNLOAD",{value:0,entityId:n.selectedEntity})}),l.addEventListener("click",()=>{n.selectedEntity!==void 0&&n.actions.addAction("RECHARGE",{value:100,entityId:n.selectedEntity})})},Nt=()=>{const e=document.querySelector("#interface_control > div:first-child")??void 0;e&&n.entities.forEach(t=>{const i=document.createElement("div");i.dataset.id=t.id.toString(),i.textContent=`[${t.id}] ${t.type}`,e.appendChild(i),i.addEventListener("click",()=>n.selectEntity(t.id))})},N={module_basic_battery:{type:"battery",stats:{battery:100}},module_basic_drill:{type:"drill",stats:{drillSpeed:1}},module_basic_motor:{type:"engine",stats:{speed:1}},module_basic_store:{type:"store",stats:{inventorySize:10}},module_dev:{type:"battery",stats:{battery:1e4,drillSpeed:20,speed:10,inventorySize:1e3}}},B={stone:"Stone",iron:"Iron ore",carbon:"Carbon",copper:"Copper",module_visual_scanner:"Visual Scanner",module_basic_battery:"Basic Battery",module_basic_drill:"Basic Drill",module_basic_motor:"Basic Motor",module_basic_store:"Basic Store",deployable_mining_hull:"Mining Automation Hull",module_home_navigation:"Home Navigation Module",coal:"Coal",module_dev:"DEV DEV DEV"},C={VISUAL_SCAN_MODULE:{ingredients:[{item:"iron",count:10}],story:["IRON_FIRST"],description:"Visually assess one tile in front",type:"MODULE",item:"module_visual_scanner"},CONTROL_INTERFACE:{ingredients:[{item:"stone",count:50},{item:"iron",count:10}],story:["IRON_FIRST"],description:"Extra control interface for manual remote instruction",type:"INTERFACE",waypoint:"INTERFACE_CONTROL_INTERFACE"},AUTOMATION_INTERFACE:{ingredients:[{item:"stone",count:50},{item:"iron",count:10},{item:"copper",count:10},{item:"carbon",count:10}],story:["IRON_FIRST","CARBON_FIRST","COPPER_FIRST"],description:"Allow automated remote instruction",type:"INTERFACE",waypoint:"INTERFACE_AUTOMATION_INTERFACE"},BASIC_BATTERY_MODULE:{ingredients:[{item:"stone",count:20},{item:"iron",count:10}],story:["IRON_FIRST"],description:"A very simple battery with limited capacity",type:"MODULE",item:"module_basic_battery"},BASIC_DRILL_MODULE:{ingredients:[{item:"iron",count:30}],story:["IRON_FIRST"],description:"A brittle, dull drill",type:"MODULE",item:"module_basic_drill"},BASIC_MOTOR_MODULE:{ingredients:[{item:"stone",count:20},{item:"iron",count:50}],story:["IRON_FIRST"],description:"5hp of pure disappointment",type:"MODULE",item:"module_basic_motor"},MINING_AUTOMATION_HULL:{ingredients:[{item:"iron",count:10}],story:["IRON_FIRST"],description:"An empty mining automation hull (deployable)",type:"DEPLOYABLE",item:"deployable_mining_hull"},HOME_NAVIGATION_MODULE:{ingredients:[{item:"carbon",count:10},{item:"copper",count:10}],story:["CARBON_FIRST","COPPER_FIRST"],description:"Provides automated routing to nearest base",type:"MODULE",item:"module_home_navigation"},SMELTING_INTERFACE:{ingredients:[{item:"iron",count:50},{item:"stone",count:200}],story:["IRON_FIRST"],description:"For the production of alloy metals",type:"INTERFACE",waypoint:"INTERFACE_SMELTING"}},wt=e=>{n.story.STORAGE_FIRST||n.addWaypoint("STORAGE_FIRST"),e==="iron"&&!n.story.IRON_FIRST&&n.addWaypoint("IRON_FIRST"),e==="carbon"&&!n.story.CARBON_FIRST&&n.addWaypoint("CARBON_FIRST"),e==="copper"&&!n.story.COPPER_FIRST&&n.addWaypoint("COPPER_FIRST")},Lt=e=>{const t=C[e];if(!t)return!1;for(let i of t.ingredients)if((n.inventory.inventory[i.item]??0)<i.count)return!1;for(let i of t.ingredients)n.inventory.remove(i.item,i.count);return t.type==="MODULE"?n.inventory.add(t.item):t.type==="INTERFACE"&&n.addWaypoint(t.waypoint),!0},xt=e=>{switch(e){case"STORAGE_FIRST":_(`Crafting Unlocked
see command "crafting" for more information`);break;case"IRON_FIRST":_("New recipes available");break;case"CARBON_FIRST":n.story.COPPER_FIRST&&_("New recipes available");break;case"COPPER_FIRST":n.story.CARBON_FIRST&&_("New recipes available");break;case"INTERFACE_CONTROL_INTERFACE":_("Control interface installed"),H();break;case"INTERFACE_AUTOMATION_INTERFACE":_("Automation interface installed"),H();break}},H=()=>{Ot()},w=document.querySelector("#control_console div#output"),Ct=e=>{h(" "),h(` > ${e}`);const[t,i]=e.split(" "),o=t.toLowerCase(),r=Bt(o,i);if(r===!1){E("Invalid argument");return}else if(r)return;const s=Ut(o,i);if(s===!1){E("No entity selected!");return}else if(s)return;E(`Unknown command: ${o}`)},Ft=e=>{h(`[WARNING] ${e}`,"warning")},E=e=>{h(`[ERROR] ${e}`,"error")},Ut=(e,t)=>{const i=n.selectedEntity!==void 0?n.entities.find(r=>r.id===n.selectedEntity):void 0;if(!i)return;const o=r=>{const s=parseInt(t??0),a=n.actions.addAction(r,{entityId:i.id,timeEnd:Date.now()+1e5,value:s});if(r==="MOVE"||r==="ROTATE"||r==="MINE")for(let c=1;c<(a.value??s);c++)n.actions.addSilentAction(r,{entityId:i.id,timeEnd:Date.now()+1e5,value:s},a.id);return!0};if(i.actions.includes(e.toUpperCase()))return o(e.toUpperCase())},Bt=(e,t)=>{switch(e){case"help":return Wt(),!0;case"list":return kt(),!0;case"selected":return Ht(),!0;case"commands":return Yt(),!0;case"storage":return Vt(),!0;case"inventory":return Xt(),!0;case"battery":return Gt(),!0;case"cancel":return jt(),!0;case"halt":return qt(),!0;case"select":return Dt(parseInt(t));case"crafting":return Kt(t);case"modules":return gt(),!0;case"focus":return zt(),!0;default:return}},Dt=e=>isNaN(e)||!n.entities.find(i=>i.id===e)?!1:(n.selectEntity(e),h(`Entity ${e} selected`),!0),Pt=(e,t)=>{!t||t.isSilent||h(`[${(Date.now()/1e3).toFixed(0)}] Entity [${e.id}] - ${t.type}: ${t.value}`,"log")},Y=(e,t)=>{h(`[ENTITY:${e}] ${t}`)},h=(e,t)=>{e.split(`
`).map(i=>{const o=document.createElement("p");o.textContent=i||"",t&&(o.className=t),w?.appendChild(o)}),w?.scrollTo(0,w.scrollHeight??0)},_=e=>{h(e,"important")},$t=()=>{_(`Welcome
========
Type "help" to get started`)},kt=()=>{h(`
ENTITIES
==========

${n.entities.map(e=>`[${e.id}] - ${e.type}`).join(`
`)}
`)},Wt=()=>{const e=[];n.story.STORAGE_FIRST&&e.push("crafting    - List and craft available recipes"),h(`
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
modules    - List currently installed modules and stats.
focus      - Move camera and follow selected entity.
${e.join(`
`)}
`)},Ht=()=>{const e=n.selectedEntity!==void 0?n.entities.find(t=>t.id===n.selectedEntity):void 0;h(`
SELECTED
=========

${e?`[${e.id}] - ${e.type}`:"- NONE -"}
`)},Yt=()=>{const e=n.selectedEntity!==void 0?n.entities.find(t=>t.id===n.selectedEntity):void 0;if(!e)return E("No entity selected");h(`
COMMANDS
=========

${e.actions.map(t=>` - ${t.toLowerCase()}`).join(`
`)}
`)},Vt=()=>{h(`
STORAGE
========

${Object.entries(n.inventory.inventory).map(([e,t])=>`${B[e]} - ${t}`).join(`
`)}
`)},zt=()=>{const e=n.selectedEntity!==void 0?n.entities.find(t=>t.id===n.selectedEntity):void 0;if(!e)return E("No entity selected");n.focusEntity(e.id)},Xt=()=>{const e=n.selectedEntity!==void 0?n.entities.find(t=>t.id===n.selectedEntity):void 0;if(!e)return E("No entity selected");h(`
INVENTORY
==========
Slots: ${e.inventory.total} / ${e.inventory.limit??"-"}

${Object.entries(e.inventory.inventory).map(([t,i])=>`${B[t]} - ${i}`).join(`
`)}
`)},Gt=()=>{const e=n.selectedEntity!==void 0?n.entities.find(t=>t.id===n.selectedEntity):void 0;if(!e)return E("No entity selected");h(`Entity [${e.id}] battery: ${e.battery} / 100`)},gt=()=>{const e=n.selectedEntity!==void 0?n.entities.find(t=>t.id===n.selectedEntity):void 0;if(!e)return E("No entity selected");h(`
INSTALLED MODULES
==================

${e.modules.map(t=>` - ${B[t]}`).join(`
`)}

[ Movement: ${e.speed} ] [ Drill: ${e.drillSpeed} ] [ Battery: ${e.battery} / ${e.maxBattery} ]
`)},jt=()=>{const e=n.selectedEntity!==void 0?n.entities.find(i=>i.id===n.selectedEntity):void 0;if(!e)return E("No entity selected");const t=n.actions.cancelOneForEntity(e.id);t&&h(`Entity [${e.id}] request to cancel ${t.type}`)},qt=()=>{const e=n.selectedEntity!==void 0?n.entities.find(t=>t.id===n.selectedEntity):void 0;if(!e)return E("No entity selected");n.actions.cancelAllForEntity(e.id),h(`Entity [${e.id}] cancel all queued actions`)},Kt=e=>{if(!n.story.STORAGE_FIRST)return;if(e?.trim())return C[e]?Lt(e):(E(`Unknown recipe: ${e}`),!0);const t=Object.entries(C).filter(([,i])=>(i.story??[]).every(o=>n.story[o])).filter(([,i])=>!i.waypoint||!n.story[i.waypoint]).map(([i,o])=>`${i}
${o.description}
${o.ingredients.map(r=>` - ${r.item} x ${r.count}`).join(`
`)}`);return h(`
CRAFTING
=========

Usage: "crafting <recipe>"

${t?.length?`- Recipes -

`+t.join(`

`):" - No recipes available -"}
`),!0},Zt=2,Qt=1,Jt=2e3,te=function(e){if(e.isStarted||(e.timeEnd=Date.now()+Jt/this.drillSpeed,e.start()),e.timeEnd>Date.now())return;e.complete();const t=ot(O(this.coords),this.angle,1);if(t.type===m.ROCK||t.type===m.ORE){let i=t.durability*$[t.tile];i-=Qt;const o=vt(t),r=Et[t.tile]??[];for(let s of r){let a=s.chance?s.chance:(s.baseChance??0)*(o*.2);for(;a>0;)Math.random()<=a&&this.inventory.add(s.item),a-=1}if(i<=0){const s=pt(t.coord);n.actions.addMapUpdate({...t,type:m.FLOOR,durability:1});for(let a of s)if(a.type===m.SHADOW){let c=m.ROCK;Math.random()<.01*o&&(c=m.ORE),n.actions.addMapUpdate({...a,type:c,durability:1})}}else n.actions.addMapUpdate({...t,durability:i/$[t.tile]})}},ot=(e,t,i=1)=>{const o=[...e];return t===0?o[0]+=i:t===1?o[1]-=i:t===2?o[0]-=i:t===3&&(o[1]+=i),y(o)},ee=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:Zt,command:te,getFacingTile:ot},Symbol.toStringTag,{value:"Module"})),ie=1,oe=d/100,ne=function(e){if(!e.isStarted){const r=re(1,this.angle,this.coords);this.angle===3&&(this.target=[this.coords[0],this.coords[1]+r*d]),this.angle===0&&(this.target=[this.coords[0]+r*d,this.coords[1]]),this.angle===1&&(this.target=[this.coords[0],this.coords[1]-r*d]),this.angle===2&&(this.target=[this.coords[0]-r*d,this.coords[1]]),e?.start()}const t=this.speed*oe;let i;this.target&&(i=[x(-t,t,this.target[0]-this.coords[0]),x(-t,t,this.target[1]-this.coords[1])]),i?.[0]===0&&i?.[1]===0&&(e?.complete(),this.target=void 0,i=void 0),i&&(n.isFollowing===this.id&&(n.camera[0]+=i[0],n.camera[1]+=i[1]),this.coords=[this.coords[0]+i[0],this.coords[1]+i[1]],console.log({c:n.camera,e:this.coords}))},re=(e,t,i)=>{let o=[0,0];t===I.DOWN?o=[0,-d]:t===I.LEFT?o=[-d,0]:t===I.RIGHT?o=[d,0]:o=[0,d];let r=0,s=[...i];for(;r<e;){s[0]+=o[0],s[1]+=o[1];const a=O(s),c=y(a);if(!mt[c.tile])break;r++}return r},se=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:ie,command:ne},Symbol.toStringTag,{value:"Module"})),ae=1,ce=function(e){let t=this.targetR;if(e.isStarted||(t=this.angle+(e.value>0?1:-1),t<0&&(t=4+t),t>3&&(t=t-4),e.start()),t===void 0){e.complete();return}this.targetR=t;const i=L[this.targetR];let o=0;if(e.value<0){let r=this.rad<i?this.rad+P:this.rad;o=-.05,r+o<=i&&e.complete()}else{let r=this.rad>i?this.rad-P:this.rad;o=.05,r+o>=i&&e.complete()}e.isComplete?(this.rad=L[this.targetR],this.angle=this.targetR,this.targetR=void 0):this.rad+=o,this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad)},de=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:ae,command:ce},Symbol.toStringTag,{value:"Module"})),le=0,ue=function(e){e.complete();const t=O(this.coords);y(t).type===m.HOME?(Object.entries(this.inventory.inventory).forEach(([o,r])=>{n.inventory.add(o,r),this.inventory.remove(o,r)}),Y(this.id,"Unloading")):Y(this.id,"Unable to unload")},he=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:le,command:ue},Symbol.toStringTag,{value:"Module"})),fe=0,V=1e3,me=function(e){if(!e.isStarted){const i=O(this.coords);if(y(i).type!==m.HOME){E(`Entity [${this.id}] - Unable to recharge at this location`),e.complete();return}e.timeEnd=Date.now()+V,e.start()}if(e.timeEnd>Date.now())return;const t=e.value?Math.max(0,Math.min(100,e.value))/100*this.maxBattery:this.maxBattery;if(this.battery>=t||e.shouldCancel){e.complete();return}this.battery++,e.timeEnd=Date.now()+V},Ee=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:fe,command:me},Symbol.toStringTag,{value:"Module"})),ye=function(e){if(!this.actions.includes(e.type)){e.complete();return}let t;switch(e.type){case"MOVE":t=se;break;case"ROTATE":t=de;break;case"MINE":t=ee;break;case"UNLOAD":t=he;break;case"RECHARGE":t=Ee;break}if(t){if(!e.isStarted){if(t.BATTERY_COST){if(this.battery<t.BATTERY_COST)return;this.battery=Math.max(0,this.battery-t.BATTERY_COST)}Pt(this,e)}return t.command.call(this,e)}};class pe{id;type;actions;rotation=[0,1];rad=L[3];angle=3;inventorySize;inventory;speed;drillSpeed;battery;maxBattery;target;targetR;coords;indices;positions;binds;program;vao;vbo;posBuf;modules;atlas;constructor(t,i,o=["MOVE","ROTATE"],r){this.id=t,this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,T*2,0,0,d,T*3,0,d,0,T*2,1,d,d,T*3,1]),this.coords=[Math.round(u/2*d)-d/2,Math.round(u/2*d)-d/2],this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad),this.actions=o,this.type=i,this.maxBattery=0,this.battery=this.maxBattery,this.speed=0,this.drillSpeed=0,this.inventorySize=0,this.inventory=new U(void 0,this.inventorySize),this.modules=r??[]}async init(t){await this.initGraphics(t),this.balanceModules(),this.battery=this.maxBattery}installModule(t){const i=N[t];return!i||this.modules.find(o=>N[o]?.type===i.type)?!1:(this.modules.push(t),this.balanceModules(),!0)}balanceModules(){this.speed=0,this.drillSpeed=0,this.maxBattery=0,this.inventorySize=0,this.modules.forEach(t=>{const i=N[t]?.stats;this.speed+=i?.speed??0,this.maxBattery+=i?.battery??0,this.drillSpeed+=i?.drillSpeed??0,this.inventorySize+=i?.inventorySize??0}),this.inventory.limit=this.inventorySize}async initGraphics(t){const i=G(t,[at,ct]);if(!i)throw new Error("No program");this.program=i;const o={position:t.getAttribLocation(i,"a_position"),move:t.getUniformLocation(i,"u_movement"),tileW:t.getUniformLocation(i,"tileW"),atlas:t.getAttribLocation(i,"a_texcoord"),camera:t.getUniformLocation(i,"camera"),resolution:t.getUniformLocation(i,"u_resolution"),rotation:t.getUniformLocation(i,"u_rotation"),isSelected:t.getUniformLocation(i,"u_selected")};if(o.camera===null||o.position===null||o.resolution===null||o.move===null||o.atlas===null)throw new Error("Bad binds");if(this.binds=o,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const r=2,s=t.FLOAT,a=!1,c=4*Float32Array.BYTES_PER_ELEMENT;let l=0;if(t.vertexAttribPointer(this.binds.position,r,s,a,c,l),t.enableVertexAttribArray(this.binds.position),l+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,r,s,a,c,l),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await j(t,q),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}update(t){const i=this.battery;t&&ye.call(this,t),this.battery!==i&&(this.battery<=0?E(`Entity ${this.id} - no power, battery empty`):this.battery<=this.maxBattery*.2&&i>this.maxBattery*.2?Ft(`Entity ${this.id} - battery low warning`):this.battery<=this.maxBattery*.1&&i>this.maxBattery*.1&&E(`Entity ${this.id} - battery is critical`))}render(t,i){!this.binds||!this.program||!this.vao||!this.vbo||!this.posBuf||!this.atlas||(g(t.canvas),t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),0),t.uniform2fv(this.binds.camera,[-i[0],-i[1]]),t.uniform2fv(this.binds.move,this.coords),t.uniform2fv(this.binds.rotation,this.rotation),t.uniform1f(this.binds.tileW,d/2),t.uniform1i(this.binds.isSelected,this.id===n.selectedEntity?2:0),t.uniform2f(this.binds.resolution,...n.resolution(t)),t.drawElements(t.TRIANGLES,6,t.UNSIGNED_SHORT,0))}}class ve{indices;positions;binds;program;vao;vbo;posBuf;blockTex;atlas;constructor(){this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,0,1,0,d,0,0,d,0,T,1,d,d,T,0])}async init(t){const i=G(t,[rt,st]);if(!i)throw new Error("No program");this.program=i;const o={position:t.getAttribLocation(i,"a_position"),atlas:t.getAttribLocation(i,"a_texcoord"),tileW:t.getUniformLocation(i,"tileW"),tileX:t.getUniformLocation(i,"tileX"),camera:t.getUniformLocation(i,"camera"),resolution:t.getUniformLocation(i,"u_resolution"),atlasW:t.getUniformLocation(i,"u_atlas_w")};if(o.camera===null||o.position===null||o.resolution===null||o.tileW===null||o.tileX===null||o.atlas===null)throw new Error("Bad binds");if(this.binds=o,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const r=2,s=t.FLOAT,a=!1,c=4*Float32Array.BYTES_PER_ELEMENT;let l=0;if(t.vertexAttribPointer(this.binds.position,r,s,a,c,l),t.enableVertexAttribArray(this.binds.position),l+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,r,s,a,c,l),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");if(t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await j(t,q),this.blockTex=t.createTexture()??void 0,!this.blockTex)throw new Error("No block texture");t.bindTexture(t.TEXTURE_2D,this.blockTex);const f=S();t.texImage2D(t.TEXTURE_2D,0,t.RG32F,u,u,0,t.RG,t.FLOAT,f),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}update(t,i){i?.length&&this.blockTex&&(t.bindTexture(t.TEXTURE_2D,this.blockTex),i.forEach(o=>{t.texSubImage2D(t.TEXTURE_2D,0,o.coord[1],o.coord[0],1,1,t.RG,t.FLOAT,new Float32Array([o.type,o.durability]))}),t.bindTexture(t.TEXTURE_2D,null))}render(t,i){!this.binds||!this.program||!this.vao||!this.blockTex||!this.vbo||!this.posBuf||!this.atlas||(t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.uniform1i(this.binds.tileW,d),t.uniform1i(this.binds.tileX,u),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.blockTex),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_data"),0),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),1),t.uniform1f(this.binds.atlasW,T),t.uniform2fv(this.binds.camera,[-i[0],-i[1]]),t.uniform2f(this.binds.resolution,...n.resolution(t)),t.drawElementsInstanced(t.TRIANGLES,this.indices.length,t.UNSIGNED_SHORT,0,u*u))}}const _e=async e=>{K();const t=new ve;n.inventory=new U(wt),n.onStory=xt,n.entities.push(new pe(n.entities.length,"MINER",["ROTATE","MOVE","MINE","UNLOAD","RECHARGE"],["module_dev"])),n.camera=[(u/2-9)*d,(u/2-7)*d],At();for(let r of n.entities)await r.init(e);await t.init(e);const i=[];for([].forEach(([r,s])=>n.inventory.add(r,s)),i.forEach(r=>n.addWaypoint(r)),$t();;)await new Promise(r=>requestAnimationFrame(()=>{const s=n.actions.getActions();for(let a of n.entities){const c=s.find(l=>l.entityId===a.id);a.update(c)}t.update(e,n.actions.getMapUpdates()),g(e.canvas),e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(.2,.2,.2,1),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),t.render(e,n.camera);for(let a of n.entities)a.render(e,n.camera);r()}))},Te=()=>{const t=document.querySelector("#c").getContext("webgl2",{premultipliedAlpha:!1});t?.getExtension("EXT_color_buffer_float"),t&&_e(t)};Te();
