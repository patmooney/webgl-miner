(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function i(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=i(r);fetch(r.href,s)}})();const d=40,u=200,ct=6,b=1/ct,O=2,D=10,w={RIGHT:0,LEFT:2,DOWN:1},F={0:0*Math.PI/180,1:90*Math.PI/180,2:180*Math.PI/180,3:270*Math.PI/180},k=360*Math.PI/180,g={FLOOR:0,ROCK:10,ORE:100,SHADOW:0,HOME:0},dt={FLOOR:!0,ROCK:!1,ORE:!1,SHADOW:!1,HOME:!0},f={FLOOR:0,ROCK:1,SHADOW:3,HOME:4,ORE:5},lt={ROCK:[{item:"stone",chance:.5},{item:"iron",baseChance:.02}],ORE:[{item:"stone",chance:.01},{item:"iron",baseChance:.05},{item:"copper",baseChance:.02},{item:"carbon",baseChance:.01}]},ut=e=>Object.entries(f).find(([,t])=>t===e)?.[0]??"FLOOR",V=()=>{const e=u/2-4,t=u/2+4,i=u/2-2,n=u/2+2;let r=[];for(let s=0;s<u*u;s++){const a=s%u,c=Math.floor(s/u);if(c>i&&c<n&&a>i&&a<n){r.push(f.HOME,1);continue}if(c>e&&c<t&&a>e&&a<t){r.push(f.FLOOR,1);continue}if((c===e||c===t)&&a>=e&&a<=t){r.push(f.ROCK,1);continue}if((a===e||a===t)&&c>=e&&c<=t){r.push(f.ROCK,1);continue}r.push(f.SHADOW,1)}return new Float32Array(r)},v=e=>{const[t,i]=e,n=i*u+t,r=I().at(n*O),s=I().at(n*O+1)??0;if(r===void 0)throw new Error(`Invalid tile ${t} / ${i}`);return{coord:e,tile:ut(r),type:r,durability:s}},x=e=>[Math.round(e[0]/d),Math.round(e[1]/d)],ht=e=>{const t=[],[i,n]=e;return i>0&&t.push(v([i-1,n])),i<u-1&&t.push(v([i+1,n])),n>0&&t.push(v([i,n-1])),n<u-1&&t.push(v([i,n+1])),t},ft=e=>{const t=u/2;return Math.round(Math.sqrt(Math.pow(e.coord[0]-t,2)+Math.pow(e.coord[1]-t,2)))};let M;const I=()=>(M||(M=V()),M),mt=e=>{const t=I(),[i,n]=e.coord,r=n*u+i;t[r*O]=e.type,t[r*O+1]=e.durability},X="ACTION_ADD",j="ACTION_REMOVE";class W{id;type;delta;value;timeEnd;entityId;parentId;isSilent=!1;isComplete=!1;isStarted=!1;isCancelled=!1;shouldCancel=!1;constructor(t,{delta:i,value:n,timeEnd:r,entityId:s},a=!1,c){this.type=t,this.delta=i,this.value=n,this.timeEnd=r,this.entityId=s,this.id=crypto.randomUUID(),this.isSilent=a,this.parentId=c,this.type==="ROTATE"&&(this.value=Math.max(Math.min(3,this.value??0),-3)),this.type==="MOVE"&&(this.value=Math.max(0,Math.min(u,n??0)))}complete(){this.isComplete=!0}start(){this.isStarted=!0}cancel(){this.isStarted?this.shouldCancel=!0:this.isCancelled=!0}}class Et{stack;mapUpdates;hook;constructor(){this.stack=[],this.mapUpdates=[],this.hook=new EventTarget}getActions(){return this.stack.filter(i=>i.isComplete).forEach(i=>{this.hook.dispatchEvent(new CustomEvent(j,{detail:i}))}),this.stack=[...this.stack.filter(i=>!i.isComplete&&!i.isCancelled)],this.stack}addAction(t,{delta:i,value:n,timeEnd:r,entityId:s}){const a=new W(t,{delta:i,value:n,timeEnd:r,entityId:s});return this.stack.push(a),this.hook.dispatchEvent(new CustomEvent(X,{detail:a})),a}addSilentAction(t,{delta:i,value:n,timeEnd:r,entityId:s},a){const c=new W(t,{delta:i,value:n,timeEnd:r,entityId:s},!0,a);this.stack.push(c)}cancelOneForEntity(t){const i=this.stack.find(r=>r.entityId===t);if(!i)return;const n=this.stack.filter(r=>r.parentId===i.id);return[i,...n].forEach(r=>r.cancel()),i}cancelAllForEntity(t){this.stack.filter(i=>i.entityId===t).forEach(i=>i.cancel())}getMapUpdates(){const t=[...this.mapUpdates];return this.mapUpdates=[],t}addMapUpdate(t){this.mapUpdates.push(t),mt(t)}}class P{inventory={};limit;total;hook;constructor(t,i){this.hook=t,this.limit=i,this.total=0}add(t,i=1){this.limit&&(i=Math.max(0,Math.min(this.limit-this.total,i))),i&&(this.total+=i,this.inventory[t]=(this.inventory[t]??0)+i,this.hook?.(t,i))}remove(t,i=1){return(this.inventory[t]??0)>=i?(this.inventory[t]=this.inventory[t]-i,this.total-=i,this.hook?.(t,-i),this.inventory[t]||delete this.inventory[t],!0):!1}}const U=(e,t,i)=>Math.max(e,Math.min(t,i)),yt=10,q=-3,K="ENTITY_SELECTED";class pt{gl;entityGfx;camera=[0,0];actions;zoom=0;selectedEntity;inventory;isFollowing;entities=[];story={};history=[];onStory;lights;entityHook;constructor(t=new Et,i=new P,n){this.lights=new Float32Array(48).fill(0),this.actions=t,this.inventory=i,this.onStory=n,this.entityHook=new EventTarget}selectEntity(t){this.focusEntity(t)&&(this.selectedEntity=t,this.entityHook.dispatchEvent(new CustomEvent(K,{detail:t})))}focusEntity(t){const i=this.entities.find(n=>n.id===t);return i?(this.isFollowing=t,this.camera=[i.coords[0]-8.5*d,i.coords[1]-6.5*d],this.zoom=0,!0):!1}resolution(t){const i=t.canvas.height/t.canvas.width,n=t.canvas.width+100*this.zoom,r=t.canvas.height+100*this.zoom*i;return[n,r]}setZoom(t){const i=U(q,yt,t);if(i>this.zoom)this.camera[0]=this.camera[0]-d,this.camera[1]=this.camera[1]-d;else if(i<this.zoom)this.camera[0]=this.camera[0]+d,this.camera[1]=this.camera[1]+d;else return;this.zoom=i}getHistory(){return this.history=this.history.slice(-D).toReversed().filter((t,i,n)=>n.indexOf(t)===i).reverse(),this.history}addWaypoint(t){this.story[t]||(this.story[t]=!0,this.onStory?.(t))}updateLights(){const t=new Float32Array(48).fill(0);for(let i=0;i<o.entities.length;i++){const[n,r]=o.entities[i].coords;t[i*3]=n,t[i*3+1]=r,t[i*3+2]=5*d}this.lights=t}}const o=new pt;let _,A=document.getElementById("c");const S=document.querySelector("#control_console input");let T=D;const vt=()=>{A?.addEventListener("mousedown",e=>{_=[e.clientX,e.clientY]}),A?.addEventListener("mousemove",e=>{if(_){o.isFollowing=void 0;let t=[e.clientX,e.clientY];const n=.6+(o.zoom+(0-q))*.125,r=(t[0]-(_?.[0]??0))*n,s=(t[1]-(_?.[1]??0))*n;o.camera[0]=o.camera[0]-r,o.camera[1]=o.camera[1]+s,_=t}}),A?.addEventListener("mouseup",()=>_=void 0),A?.addEventListener("mouseout",()=>_=void 0),A?.addEventListener("wheel",e=>{const t=e.deltaY;o.setZoom(o.zoom+(t>0?1:-1))}),S?.addEventListener("keyup",e=>{const t=e.key,i=e.target.value;if(t==="Enter"&&i.length){o.history.push(i),xt(i),e.target.value="";const n=o.getHistory();T=Math.min(n.length,D)}if(t==="ArrowUp"&&T>0){const n=o.getHistory();T--,S.value=n[T]??""}if(t==="ArrowDown"){const n=o.getHistory();T>=n.length?S.value="":(T++,S.value=n[T]??"")}}),S?.focus(),document.querySelector("#nav > div:first-of-type")?.addEventListener("click",e=>Z(e.target,"control_console"))},Z=(e,t)=>{Array.from(document.querySelectorAll("div#context > div")).forEach(i=>i.classList.add("hidden")),Array.from(document.querySelectorAll("#nav > div")).forEach(i=>i.classList.remove("active")),document.getElementById(t)?.classList.remove("hidden"),e.classList.add("active")},_t=`
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
`,Tt=()=>{const e=document.getElementById("nav"),t=document.getElementById("context"),i=document.createElement("div");i.textContent="Control";const n=document.createElement("div");if(n.id="control_control",n.classList.add("hidden"),n.innerHTML=_t,i.addEventListener("click",()=>Z(i,"control_control")),e?.appendChild(i),t?.appendChild(n),bt(n),At(),o.selectedEntity!==void 0){const r=o.actions.getActions().filter(s=>s.entityId===o.selectedEntity&&!s.isSilent);H(r)}o.actions.hook.addEventListener(X,r=>{const s=r;s.detail.entityId===o.selectedEntity&&Q(s.detail)}),o.actions.hook.addEventListener(j,r=>{const s=r;s.detail.entityId===o.selectedEntity&&Rt(s.detail)}),o.entityHook.addEventListener(K,r=>{const s=r;Array.from(document.querySelectorAll("#interface_control > div:first-child > div")).forEach(l=>l.classList.remove("active")),document.querySelector(`#interface_control > div:first-child > div[data-id="${s.detail}"]`)?.classList.add("active");const c=o.actions.getActions().filter(l=>l.entityId===o.selectedEntity&&!l.isSilent);H(c)})},H=e=>{const t=document.querySelector("#interface_control > div:last-child");if(t){t.innerHTML="";for(let i of e)Q(i,t)}},Q=(e,t)=>{t=t??document.querySelector("#interface_control > div:last-child")??void 0;const i=document.createElement("div");i.textContent=`${e.type} - ${e.value}`,i.dataset.id=e.id,t?.appendChild(i)},Rt=e=>{const t=document.querySelector("#interface_control > div:last-child")??void 0;t&&t.querySelector(`div[data-id="${e.id}"]`)?.remove()},bt=e=>{const[t,i,n,r,s,a,c,l,E]=Array.from(e.querySelectorAll("button"));i.addEventListener("click",()=>{if(o.selectedEntity!==void 0){o.actions.addAction("MOVE",{value:5,entityId:o.selectedEntity});for(let y=1;y<5;y++)o.actions.addSilentAction("MOVE",{value:1,entityId:o.selectedEntity})}}),t.addEventListener("click",()=>{o.selectedEntity!==void 0&&o.actions.addAction("MOVE",{value:1,entityId:o.selectedEntity})}),n.addEventListener("click",()=>{o.selectedEntity!==void 0&&o.actions.addAction("ROTATE",{value:-1,entityId:o.selectedEntity})}),r.addEventListener("click",()=>{o.selectedEntity!==void 0&&o.actions.addAction("ROTATE",{value:1,entityId:o.selectedEntity})}),s.addEventListener("click",()=>{o.selectedEntity!==void 0&&o.actions.addAction("MINE",{value:0,entityId:o.selectedEntity})}),a.addEventListener("click",()=>{if(o.selectedEntity!==void 0){o.actions.addAction("MINE",{value:5,entityId:o.selectedEntity});for(let y=1;y<5;y++)o.actions.addSilentAction("MINE",{value:1,entityId:o.selectedEntity})}}),c.addEventListener("click",()=>{o.selectedEntity!==void 0&&o.actions.addAction("UNLOAD",{value:0,entityId:o.selectedEntity})}),l.addEventListener("click",()=>{o.selectedEntity!==void 0&&o.actions.addAction("RECHARGE",{value:100,entityId:o.selectedEntity})}),E.addEventListener("click",()=>{o.selectedEntity!==void 0&&o.focusEntity(o.selectedEntity)})},At=()=>{const e=document.querySelector("#interface_control > div:first-child")??void 0;e&&o.entities.forEach(t=>{const i=document.createElement("div");i.dataset.id=t.id.toString(),i.textContent=`[${t.id}] ${t.type}`,e.appendChild(i),i.addEventListener("click",()=>o.selectEntity(t.id))})},L={module_basic_battery:{type:"battery",stats:{battery:100}},module_basic_drill:{type:"drill",stats:{drillSpeed:1}},module_basic_motor:{type:"engine",stats:{speed:1}},module_basic_store:{type:"store",stats:{inventorySize:10}},module_dev:{type:"battery",stats:{battery:1e4,drillSpeed:20,speed:10,inventorySize:1e3}}},$={stone:"Stone",iron:"Iron ore",carbon:"Carbon",copper:"Copper",module_visual_scanner:"Visual Scanner",module_basic_battery:"Basic Battery",module_basic_drill:"Basic Drill",module_basic_motor:"Basic Motor",module_basic_store:"Basic Store",deployable_mining_hull:"Mining Automation Hull",module_home_navigation:"Home Navigation Module",coal:"Coal",module_dev:"DEV DEV DEV"},B={VISUAL_SCAN_MODULE:{ingredients:[{item:"iron",count:10}],story:["IRON_FIRST"],description:"Visually assess one tile in front",type:"MODULE",item:"module_visual_scanner"},CONTROL_INTERFACE:{ingredients:[{item:"stone",count:50},{item:"iron",count:10}],story:["IRON_FIRST"],description:"Extra control interface for manual remote instruction",type:"INTERFACE",waypoint:"INTERFACE_CONTROL_INTERFACE"},AUTOMATION_INTERFACE:{ingredients:[{item:"stone",count:50},{item:"iron",count:10},{item:"copper",count:10},{item:"carbon",count:10}],story:["IRON_FIRST","CARBON_FIRST","COPPER_FIRST"],description:"Allow automated remote instruction",type:"INTERFACE",waypoint:"INTERFACE_AUTOMATION_INTERFACE"},BASIC_BATTERY_MODULE:{ingredients:[{item:"stone",count:20},{item:"iron",count:10}],story:["IRON_FIRST"],description:"A very simple battery with limited capacity",type:"MODULE",item:"module_basic_battery"},BASIC_DRILL_MODULE:{ingredients:[{item:"iron",count:30}],story:["IRON_FIRST"],description:"A brittle, dull drill",type:"MODULE",item:"module_basic_drill"},BASIC_MOTOR_MODULE:{ingredients:[{item:"stone",count:20},{item:"iron",count:50}],story:["IRON_FIRST"],description:"5hp of pure disappointment",type:"MODULE",item:"module_basic_motor"},MINING_AUTOMATION_HULL:{ingredients:[{item:"iron",count:10}],story:["IRON_FIRST"],description:"An empty mining automation hull (deployable)",type:"DEPLOYABLE",item:"deployable_mining_hull"},HOME_NAVIGATION_MODULE:{ingredients:[{item:"carbon",count:10},{item:"copper",count:10}],story:["CARBON_FIRST","COPPER_FIRST"],description:"Provides automated routing to nearest base",type:"MODULE",item:"module_home_navigation"},SMELTING_INTERFACE:{ingredients:[{item:"iron",count:50},{item:"stone",count:200}],story:["IRON_FIRST"],description:"For the production of alloy metals",type:"INTERFACE",waypoint:"INTERFACE_SMELTING"}},St=e=>{o.story.STORAGE_FIRST||o.addWaypoint("STORAGE_FIRST"),e==="iron"&&!o.story.IRON_FIRST&&o.addWaypoint("IRON_FIRST"),e==="carbon"&&!o.story.CARBON_FIRST&&o.addWaypoint("CARBON_FIRST"),e==="copper"&&!o.story.COPPER_FIRST&&o.addWaypoint("COPPER_FIRST")},Ot=e=>{const t=B[e];if(!t)return!1;for(let i of t.ingredients)if((o.inventory.inventory[i.item]??0)<i.count)return!1;for(let i of t.ingredients)o.inventory.remove(i.item,i.count);return t.type==="MODULE"?o.inventory.add(t.item):t.type==="INTERFACE"&&o.addWaypoint(t.waypoint),!0},It=e=>{switch(e){case"STORAGE_FIRST":R(`Crafting Unlocked
see command "crafting" for more information`);break;case"IRON_FIRST":R("New recipes available");break;case"CARBON_FIRST":o.story.COPPER_FIRST&&R("New recipes available");break;case"COPPER_FIRST":o.story.CARBON_FIRST&&R("New recipes available");break;case"INTERFACE_CONTROL_INTERFACE":R("Control interface installed"),G();break;case"INTERFACE_AUTOMATION_INTERFACE":R("Automation interface installed"),G();break}},G=()=>{Tt()},N=document.querySelector("#control_console div#output"),xt=e=>{h(" "),h(` > ${e}`);const[t,i]=e.split(" "),n=t.toLowerCase(),r=Lt(n,i);if(r===!1){m("Invalid argument");return}else if(r)return;const s=Mt(n,i);if(s===!1){m("No entity selected!");return}else if(s)return;m(`Unknown command: ${n}`)},wt=e=>{h(`[WARNING] ${e}`,"warning")},m=e=>{h(`[ERROR] ${e}`,"error")},Mt=(e,t)=>{const i=o.selectedEntity!==void 0?o.entities.find(r=>r.id===o.selectedEntity):void 0;if(!i)return;const n=r=>{const s=parseInt(t??0),a=o.actions.addAction(r,{entityId:i.id,timeEnd:Date.now()+1e5,value:s});if(r==="MOVE"||r==="ROTATE"||r==="MINE")for(let c=1;c<(a.value??s);c++)o.actions.addSilentAction(r,{entityId:i.id,timeEnd:Date.now()+1e5,value:s},a.id);return!0};if(i.actions.includes(e.toUpperCase()))return n(e.toUpperCase())},Lt=(e,t)=>{switch(e){case"help":return Bt(),!0;case"list":return Ut(),!0;case"selected":return Dt(),!0;case"commands":return Pt(),!0;case"storage":return $t(),!0;case"inventory":return gt(),!0;case"battery":return Wt(),!0;case"cancel":return Gt(),!0;case"halt":return Yt(),!0;case"select":return Nt(parseInt(t));case"crafting":return Vt(t);case"modules":return Ht(),!0;case"focus":return kt(),!0;case"dev_spawn":return zt(),!0;default:return}},Nt=e=>isNaN(e)||!o.entities.find(i=>i.id===e)?!1:(o.selectEntity(e),h(`Entity ${e} selected`),!0),Ct=(e,t)=>{!t||t.isSilent||h(`[${(Date.now()/1e3).toFixed(0)}] Entity [${e.id}] - ${t.type}: ${t.value}`,"log")},Y=(e,t)=>{h(`[ENTITY:${e}] ${t}`)},h=(e,t)=>{e.split(`
`).map(i=>{const n=document.createElement("p");n.textContent=i||"",t&&(n.className=t),N?.appendChild(n)}),N?.scrollTo(0,N.scrollHeight??0)},R=e=>{h(e,"important")},Ft=()=>{R(`Welcome
========
Type "help" to get started`)},Ut=()=>{h(`
ENTITIES
==========

${o.entities.map(e=>`[${e.id}] - ${e.type}`).join(`
`)}
`)},Bt=()=>{const e=[];o.story.STORAGE_FIRST&&e.push("crafting    - List and craft available recipes"),h(`
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
`)},Dt=()=>{const e=o.selectedEntity!==void 0?o.entities.find(t=>t.id===o.selectedEntity):void 0;h(`
SELECTED
=========

${e?`[${e.id}] - ${e.type}`:"- NONE -"}
`)},Pt=()=>{const e=o.selectedEntity!==void 0?o.entities.find(t=>t.id===o.selectedEntity):void 0;if(!e)return m("No entity selected");h(`
COMMANDS
=========

${e.actions.map(t=>` - ${t.toLowerCase()}`).join(`
`)}
`)},$t=()=>{h(`
STORAGE
========

${Object.entries(o.inventory.inventory).map(([e,t])=>`${$[e]} - ${t}`).join(`
`)}
`)},kt=()=>{const e=o.selectedEntity!==void 0?o.entities.find(t=>t.id===o.selectedEntity):void 0;if(!e)return m("No entity selected");o.focusEntity(e.id)},gt=()=>{const e=o.selectedEntity!==void 0?o.entities.find(t=>t.id===o.selectedEntity):void 0;if(!e)return m("No entity selected");h(`
INVENTORY
==========
Slots: ${e.inventory.total} / ${e.inventory.limit??"-"}

${Object.entries(e.inventory.inventory).map(([t,i])=>`${$[t]} - ${i}`).join(`
`)}
`)},Wt=()=>{const e=o.selectedEntity!==void 0?o.entities.find(t=>t.id===o.selectedEntity):void 0;if(!e)return m("No entity selected");h(`Entity [${e.id}] battery: ${e.battery} / 100`)},Ht=()=>{const e=o.selectedEntity!==void 0?o.entities.find(t=>t.id===o.selectedEntity):void 0;if(!e)return m("No entity selected");h(`
INSTALLED MODULES
==================

${e.modules.map(t=>` - ${$[t]}`).join(`
`)}

[ Movement: ${e.speed} ] [ Drill: ${e.drillSpeed} ] [ Battery: ${e.battery} / ${e.maxBattery} ]
`)},Gt=()=>{const e=o.selectedEntity!==void 0?o.entities.find(i=>i.id===o.selectedEntity):void 0;if(!e)return m("No entity selected");const t=o.actions.cancelOneForEntity(e.id);t&&h(`Entity [${e.id}] request to cancel ${t.type}`)},Yt=()=>{const e=o.selectedEntity!==void 0?o.entities.find(t=>t.id===o.selectedEntity):void 0;if(!e)return m("No entity selected");o.actions.cancelAllForEntity(e.id),h(`Entity [${e.id}] cancel all queued actions`)},zt=()=>{if(!o.gl||!o.entityGfx)return;const e=new tt(o.entityGfx,o.entities.length,"MINER",["ROTATE","MOVE","MINE","UNLOAD","RECHARGE"],["module_dev"]);e.init(),o.entities.push(e)},Vt=e=>{if(!o.story.STORAGE_FIRST)return;if(e?.trim())return B[e]?Ot(e):(m(`Unknown recipe: ${e}`),!0);const t=Object.entries(B).filter(([,i])=>(i.story??[]).every(n=>o.story[n])).filter(([,i])=>!i.waypoint||!o.story[i.waypoint]).map(([i,n])=>`${i}
${n.description}
${n.ingredients.map(r=>` - ${r.item} x ${r.count}`).join(`
`)}`);return h(`
CRAFTING
=========

Usage: "crafting <recipe>"

${t?.length?`- Recipes -

`+t.join(`

`):" - No recipes available -"}
`),!0},Xt=2,jt=1,qt=2e3,Kt=function(e){if(e.isStarted||(e.timeEnd=Date.now()+qt/this.drillSpeed,e.start()),e.timeEnd>Date.now())return;e.complete();const t=J(x(this.coords),this.angle,1);if(t.type===f.ROCK||t.type===f.ORE){let i=t.durability*g[t.tile];i-=jt;const n=ft(t),r=lt[t.tile]??[];for(let s of r){let a=s.chance?s.chance:(s.baseChance??0)*(n*.2);for(;a>0;)Math.random()<=a&&this.inventory.add(s.item),a-=1}if(i<=0){const s=ht(t.coord);o.actions.addMapUpdate({...t,type:f.FLOOR,durability:1});for(let a of s)if(a.type===f.SHADOW){let c=f.ROCK;Math.random()<.01*n&&(c=f.ORE),o.actions.addMapUpdate({...a,type:c,durability:1})}}else o.actions.addMapUpdate({...t,durability:i/g[t.tile]})}},J=(e,t,i=1)=>{const n=[...e];return t===0?n[0]+=i:t===1?n[1]-=i:t===2?n[0]-=i:t===3&&(n[1]+=i),v(n)},Zt=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:Xt,command:Kt,getFacingTile:J},Symbol.toStringTag,{value:"Module"})),Qt=1,Jt=d/100,te=function(e){if(!e.isStarted){const r=ee(1,this.angle,this.coords);this.angle===3&&(this.target=[this.coords[0],this.coords[1]+r*d]),this.angle===0&&(this.target=[this.coords[0]+r*d,this.coords[1]]),this.angle===1&&(this.target=[this.coords[0],this.coords[1]-r*d]),this.angle===2&&(this.target=[this.coords[0]-r*d,this.coords[1]]),e?.start()}const t=Jt;let i;this.target&&(i=[U(-t,t,this.target[0]-this.coords[0]),U(-t,t,this.target[1]-this.coords[1])]),i?.[0]===0&&i?.[1]===0&&(o.updateLights(),e?.complete(),this.target=void 0,i=void 0),i&&(o.isFollowing===this.id&&(o.camera[0]+=i[0],o.camera[1]+=i[1]),this.coords=[this.coords[0]+i[0],this.coords[1]+i[1]])},ee=(e,t,i)=>{let n=[0,0];t===w.DOWN?n=[0,-d]:t===w.LEFT?n=[-d,0]:t===w.RIGHT?n=[d,0]:n=[0,d];let r=0,s=[...i];for(;r<e;){s[0]+=n[0],s[1]+=n[1];const a=x(s),c=v(a);if(!dt[c.tile])break;r++}return r},ie=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:Qt,command:te},Symbol.toStringTag,{value:"Module"})),oe=1,ne=function(e){let t=this.targetR;if(e.isStarted||(t=this.angle+(e.value>0?1:-1),t<0&&(t=4+t),t>3&&(t=t-4),e.start()),t===void 0){e.complete();return}this.targetR=t;const i=F[this.targetR];let n=0;if(e.value<0){let r=this.rad<i?this.rad+k:this.rad;n=-.05,r+n<=i&&e.complete()}else{let r=this.rad>i?this.rad-k:this.rad;n=.05,r+n>=i&&e.complete()}e.isComplete?(this.rad=F[this.targetR],this.angle=this.targetR,this.targetR=void 0):this.rad+=n,this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad)},re=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:oe,command:ne},Symbol.toStringTag,{value:"Module"})),se=0,ae=function(e){e.complete();const t=x(this.coords);v(t).type===f.HOME?(Object.entries(this.inventory.inventory).forEach(([n,r])=>{o.inventory.add(n,r),this.inventory.remove(n,r)}),Y(this.id,"Unloading")):Y(this.id,"Unable to unload")},ce=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:se,command:ae},Symbol.toStringTag,{value:"Module"})),de=0,z=1e3,le=function(e){if(!e.isStarted){const i=x(this.coords);if(v(i).type!==f.HOME){m(`Entity [${this.id}] - Unable to recharge at this location`),e.complete();return}e.timeEnd=Date.now()+z,e.start()}if(e.timeEnd>Date.now())return;const t=e.value?Math.max(0,Math.min(100,e.value))/100*this.maxBattery:this.maxBattery;if(this.battery>=t||e.shouldCancel){e.complete();return}this.battery++,e.timeEnd=Date.now()+z},ue=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:de,command:le},Symbol.toStringTag,{value:"Module"})),he=function(e){if(!this.actions.includes(e.type)){e.complete();return}let t;switch(e.type){case"MOVE":t=ie;break;case"ROTATE":t=re;break;case"MINE":t=Zt;break;case"UNLOAD":t=ce;break;case"RECHARGE":t=ue;break}if(t){if(!e.isStarted){if(t.BATTERY_COST){if(this.battery<t.BATTERY_COST)return;this.battery=Math.max(0,this.battery-t.BATTERY_COST)}Ct(this,e)}return t.command.call(this,e)}};class tt{id;type;gfx;actions;rotation=[0,1];rad=F[3];angle=3;inventorySize;inventory;speed;drillSpeed;battery;maxBattery;target;targetR;coords;modules;constructor(t,i,n,r=["MOVE","ROTATE"],s){this.gfx=t,this.id=i,this.coords=[Math.round(u/2*d)-d/2,Math.round(u/2*d)-d/2],this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad),this.actions=r,this.type=n,this.maxBattery=0,this.battery=this.maxBattery,this.speed=0,this.drillSpeed=0,this.inventorySize=0,this.inventory=new P(void 0,this.inventorySize),this.modules=s??[]}async init(){this.balanceModules(),this.battery=this.maxBattery}installModule(t){const i=L[t];return!i||this.modules.find(n=>L[n]?.type===i.type)?!1:(this.modules.push(t),this.balanceModules(),!0)}balanceModules(){this.speed=0,this.drillSpeed=0,this.maxBattery=0,this.inventorySize=0,this.modules.forEach(t=>{const i=L[t]?.stats;this.speed+=i?.speed??0,this.maxBattery+=i?.battery??0,this.drillSpeed+=i?.drillSpeed??0,this.inventorySize+=i?.inventorySize??0}),this.inventory.limit=this.inventorySize}update(t){const i=this.battery;t&&he.call(this,t),this.battery!==i&&(this.battery<=0?m(`Entity ${this.id} - no power, battery empty`):this.battery<=this.maxBattery*.2&&i>this.maxBattery*.2?wt(`Entity ${this.id} - battery low warning`):this.battery<=this.maxBattery*.1&&i>this.maxBattery*.1&&m(`Entity ${this.id} - battery is critical`))}render(t,i){this.gfx.render(t,this,i)}}function et(e){console&&(console.error?console.error(e):console.log&&console.log(e))}const fe=/ERROR:\s*\d+:(\d+)/gi;function it(e,t=""){const i=[...t.matchAll(fe)],n=new Map(i.map((r,s)=>{const a=parseInt(r[1]),c=i[s+1],l=c?c.index:t.length,E=t.substring(r.index,l);return[a-1,E]}));return e.split(`
`).map((r,s)=>{const a=n.get(s);return`${s+1}: ${r}${a?`

^^^ ${a}`:""}`}).join(`
`)}function me(e,t,i,n){const r=n||et,s=e.createShader(i);if(!s)return r("No shader"),null;if(e.shaderSource(s,t),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS)){const c=e.getShaderInfoLog(s);return r(`Error compiling shader: ${c}
${it(t,c??"")}`),e.deleteShader(s),null}return s}function Ee(e,t,i,n,r){const s=r||et,a=e.createProgram();if(!a)return null;if(t.forEach(function(l){e.attachShader(a,l)}),i&&i.forEach(function(l,E){e.bindAttribLocation(a,n?n[E]:E,l)}),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS)){const l=e.getProgramInfoLog(a),E=t.map(y=>{const at=it(e.getShaderSource(y)??"");return`${e.getShaderParameter(y,e.SHADER_TYPE)}:
${at}`}).join(`
`);return s(`Error in program linking: ${l}
${E}`),e.deleteProgram(a),null}return a}const ye=["VERTEX_SHADER","FRAGMENT_SHADER"];function ot(e,t,i=[],n=[],r=()=>{}){const s=[];for(let a=0;a<t.length;++a)s.push(me(e,t[a],e[ye[a]],r));return Ee(e,s.filter(Boolean),i,n,r)}function nt(e,t){t=t||1;const i=e.clientWidth*t|0,n=e.clientHeight*t|0;return e.width!==i||e.height!==n?(e.width=i,e.height=n,!0):!1}let C={};const rt=async(e,t)=>{if(C[t])return C[t];const i=e.createTexture()??void 0;if(!i)throw new Error("Invalid texture");e.bindTexture(e.TEXTURE_2D,i);const n=new Image;return n.src=t,new Promise(r=>{n.onload=()=>{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.bindTexture(e.TEXTURE_2D,null),C[t]=i,r(i)}})},pe=`#version 300 es

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

// all shaders have a main function
void main() {
  float rRow = floor(float(gl_InstanceID / tileX));
  float rCol = mod(float(gl_InstanceID), float(tileX));
  int row = int(rRow);
  int col = int(rCol);

  float xOffset = float(col * (tileW));
  float yOffset = float(row * (tileW));

  vec2 instPos = vec2(a_position);
  instPos.x += xOffset;
  instPos.y += yOffset;

  bright = 0.1;
  for (int i = 0; i < 16; i++) {
    if (u_light[i].z > 0.0) {
      vec2 l = u_light[i].xy + vec2(tileW, tileW);
      float d = distance(l.xy, instPos);
      if (d < u_light[i].z) {
        bright += 1.0 - (d / u_light[i].z);
      }
    }
  }

  instPos.x += camera.x;
  instPos.y += camera.y;

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
`,ve=`#version 300 es

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
}`,_e=`#version 300 es

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
`,Te=`#version 300 es

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
}`,st=""+new URL("atlas-BxrVKyxQ.png",import.meta.url).href,p=.01;class Re{indices;positions;binds;program;vao;vbo;posBuf;blockTex;atlas;constructor(){this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,p,1-p,0,d,p,p,d,0,b-p,1-p,d,d,b-p,p])}async init(t){const i=ot(t,[pe,ve]);if(!i)throw new Error("No program");this.program=i;const n={position:t.getAttribLocation(i,"a_position"),atlas:t.getAttribLocation(i,"a_texcoord"),tileW:t.getUniformLocation(i,"tileW"),tileX:t.getUniformLocation(i,"tileX"),camera:t.getUniformLocation(i,"camera"),resolution:t.getUniformLocation(i,"u_resolution"),atlasW:t.getUniformLocation(i,"u_atlas_w"),light:t.getUniformLocation(i,"u_light")};if(n.camera===null||n.position===null||n.resolution===null||n.tileW===null||n.tileX===null||n.atlas===null)throw new Error("Bad binds");if(this.binds=n,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const r=2,s=t.FLOAT,a=!1,c=4*Float32Array.BYTES_PER_ELEMENT;let l=0;if(t.vertexAttribPointer(this.binds.position,r,s,a,c,l),t.enableVertexAttribArray(this.binds.position),l+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,r,s,a,c,l),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");if(t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await rt(t,st),this.blockTex=t.createTexture()??void 0,!this.blockTex)throw new Error("No block texture");t.bindTexture(t.TEXTURE_2D,this.blockTex);const E=I();t.texImage2D(t.TEXTURE_2D,0,t.RG32F,u,u,0,t.RG,t.FLOAT,E),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}update(t,i){i?.length&&this.blockTex&&(t.bindTexture(t.TEXTURE_2D,this.blockTex),i.forEach(n=>{t.texSubImage2D(t.TEXTURE_2D,0,n.coord[1],n.coord[0],1,1,t.RG,t.FLOAT,new Float32Array([n.type,n.durability]))}),t.bindTexture(t.TEXTURE_2D,null))}render(t,i){!this.binds||!this.program||!this.vao||!this.blockTex||!this.vbo||!this.posBuf||!this.atlas||(t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.uniform1i(this.binds.tileW,d),t.uniform1i(this.binds.tileX,u),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.blockTex),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_data"),0),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),1),t.uniform1f(this.binds.atlasW,b),t.uniform3fv(this.binds.light,o.lights),t.uniform2fv(this.binds.camera,[-i[0],-i[1]]),t.uniform2f(this.binds.resolution,...o.resolution(t)),t.drawElementsInstanced(t.TRIANGLES,this.indices.length,t.UNSIGNED_SHORT,0,u*u))}}class be{indices;positions;binds;program;vao;vbo;posBuf;atlas;constructor(){this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,b*2,0,0,d,b*3,0,d,0,b*2,1,d,d,b*3,1])}async initGraphics(t){const i=ot(t,[_e,Te]);if(!i)throw new Error("No program");this.program=i;const n={position:t.getAttribLocation(i,"a_position"),move:t.getUniformLocation(i,"u_movement"),tileW:t.getUniformLocation(i,"tileW"),atlas:t.getAttribLocation(i,"a_texcoord"),camera:t.getUniformLocation(i,"camera"),resolution:t.getUniformLocation(i,"u_resolution"),rotation:t.getUniformLocation(i,"u_rotation"),isSelected:t.getUniformLocation(i,"u_selected")};if(n.camera===null||n.position===null||n.resolution===null||n.move===null||n.atlas===null)throw new Error("Bad binds");if(this.binds=n,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const r=2,s=t.FLOAT,a=!1,c=4*Float32Array.BYTES_PER_ELEMENT;let l=0;if(t.vertexAttribPointer(this.binds.position,r,s,a,c,l),t.enableVertexAttribArray(this.binds.position),l+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,r,s,a,c,l),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await rt(t,st),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null),console.log("ok?")}render(t,i,n){!this.binds||!this.program||!this.vao||!this.vbo||!this.posBuf||!this.atlas||(nt(t.canvas),t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),0),t.uniform2fv(this.binds.camera,[-n[0],-n[1]]),t.uniform2fv(this.binds.move,i.coords),t.uniform2fv(this.binds.rotation,i.rotation),t.uniform1f(this.binds.tileW,d/2),t.uniform1i(this.binds.isSelected,i.id===o.selectedEntity?2:0),t.uniform2f(this.binds.resolution,...o.resolution(t)),t.drawElements(t.TRIANGLES,6,t.UNSIGNED_SHORT,0))}}const Ae=async e=>{V();const t=new Re;o.inventory=new P(St),o.onStory=It,o.gl=e;const i=new be;await i.initGraphics(e),o.entityGfx=i,o.entities.push(new tt(i,o.entities.length,"MINER",["ROTATE","MOVE","MINE","UNLOAD","RECHARGE"],["module_dev"])),o.camera=[(u/2-9)*d,(u/2-7)*d],vt();for(let s of o.entities)await s.init();await t.init(e);const n=[];for([].forEach(([s,a])=>o.inventory.add(s,a)),n.forEach(s=>o.addWaypoint(s)),Ft(),o.updateLights();;)await new Promise(s=>requestAnimationFrame(()=>{const a=o.actions.getActions();for(let c of o.entities){const l=a.find(E=>E.entityId===c.id);c.update(l)}t.update(e,o.actions.getMapUpdates()),nt(e.canvas),e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(.1,.1,.1,1),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),t.render(e,o.camera);for(let c of o.entities)c.render(e,o.camera);s()}))},Se=()=>{const t=document.querySelector("#c").getContext("webgl2",{premultipliedAlpha:!1});t?.getExtension("EXT_color_buffer_float"),t&&Ae(t)};Se();
