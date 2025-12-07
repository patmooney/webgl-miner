(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function i(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(r){if(r.ep)return;r.ep=!0;const s=i(r);fetch(r.href,s)}})();const l=40,u=200,pt=30,vt=6,S=1/vt,M=2,H=10,_t=200,F={RIGHT:0,LEFT:2,DOWN:1},P={0:0*Math.PI/180,1:90*Math.PI/180,2:180*Math.PI/180,3:270*Math.PI/180},G=360*Math.PI/180,V={FLOOR:0,ROCK:10,ORE:100,SHADOW:0,HOME:0},Tt={FLOOR:!0,ROCK:!1,ORE:!1,SHADOW:!1,HOME:!0},y={FLOOR:0,ROCK:1,SHADOW:3,HOME:4,ORE:5},bt={ROCK:[{item:"stone",chance:.5},{item:"iron",baseChance:.02}],ORE:[{item:"stone",chance:.01},{item:"iron",baseChance:.05},{item:"copper",baseChance:.02},{item:"carbon",baseChance:.01}]},Rt=e=>Object.entries(y).find(([,t])=>t===e)?.[0]??"FLOOR",J=()=>{const e=u/2-4,t=u/2+4,i=u/2-2,o=u/2+2;let r=[];for(let s=0;s<u*u;s++){const a=s%u,c=Math.floor(s/u);if(c>i&&c<o&&a>i&&a<o){r.push(y.HOME,1);continue}if(c>e&&c<t&&a>e&&a<t){r.push(y.FLOOR,1);continue}if((c===e||c===t)&&a>=e&&a<=t){r.push(y.ROCK,1);continue}if((a===e||a===t)&&c>=e&&c<=t){r.push(y.ROCK,1);continue}r.push(y.SHADOW,1)}return new Float32Array(r)},b=e=>{const[t,i]=e,o=i*u+t,r=L().at(o*M),s=L().at(o*M+1)??0;if(r===void 0)throw new Error(`Invalid tile ${t} / ${i}`);return{coord:e,tile:Rt(r),type:r,durability:s}},N=e=>[Math.round(e[0]/l),Math.round(e[1]/l)],At=e=>{const t=[],[i,o]=e;return i>0&&t.push(b([i-1,o])),i<u-1&&t.push(b([i+1,o])),o>0&&t.push(b([i,o-1])),o<u-1&&t.push(b([i,o+1])),t},St=e=>{const t=u/2;return Math.round(Math.sqrt(Math.pow(e.coord[0]-t,2)+Math.pow(e.coord[1]-t,2)))};let U;const L=()=>(U||(U=J()),U),Ot=e=>{const t=L(),[i,o]=e.coord,r=o*u+i;t[r*M]=e.type,t[r*M+1]=e.durability},Q="ACTION_ADD",tt="ACTION_REMOVE";class k{id;type;delta;value;timeEnd;entityId;parentId;isSilent=!1;isComplete=!1;isStarted=!1;isCancelled=!1;shouldCancel=!1;constructor(t,{delta:i,value:o,timeEnd:r,entityId:s},a=!1,c){this.type=t,this.delta=i,this.value=o,this.timeEnd=r,this.entityId=s,this.id=crypto.randomUUID(),this.isSilent=a,this.parentId=c,this.type==="ROTATE"&&(this.value=Math.max(Math.min(3,this.value??1),-3)),this.type==="MOVE"&&(this.value=Math.max(0,Math.min(u,o??0)))}complete(){this.isComplete=!0}start(){this.isStarted=!0}cancel(){this.isStarted?this.shouldCancel=!0:this.isCancelled=!0}}class It{stack;mapUpdates;hook;constructor(){this.stack=[],this.mapUpdates=[],this.hook=new EventTarget}getActions(){return this.stack.filter(i=>i.isComplete).forEach(i=>{this.hook.dispatchEvent(new CustomEvent(tt,{detail:i}))}),this.stack=[...this.stack.filter(i=>!i.isComplete&&!i.isCancelled)],this.stack}addAction(t,{delta:i,value:o,timeEnd:r,entityId:s}){const a=new k(t,{delta:i,value:o,timeEnd:r,entityId:s});return this.stack.push(a),this.hook.dispatchEvent(new CustomEvent(Q,{detail:a})),a}addSilentAction(t,{delta:i,value:o,timeEnd:r,entityId:s},a){const c=new k(t,{delta:i,value:o,timeEnd:r,entityId:s},!0,a);this.stack.push(c)}cancelOneForEntity(t){const i=this.stack.find(r=>r.entityId===t);if(!i)return;const o=this.stack.filter(r=>r.parentId===i.id);return[i,...o].forEach(r=>r.cancel()),i}cancelAllForEntity(t){this.stack.filter(i=>i.entityId===t).forEach(i=>i.cancel())}getMapUpdates(){const t=[...this.mapUpdates];return this.mapUpdates=[],t}addMapUpdate(t){this.mapUpdates.push(t),Ot(t)}}const wt=`
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
`,Ct=()=>{const e=document.getElementById("nav"),t=document.getElementById("context"),i=document.createElement("div");i.textContent="Control";const o=document.createElement("div");if(o.id="control_control",o.classList.add("hidden"),o.innerHTML=wt,i.addEventListener("click",()=>dt(i,"control_control")),e?.appendChild(i),t?.appendChild(o),Mt(o),Lt(),n.selectedEntity!==void 0){const r=n.actions.getActions().filter(s=>s.entityId===n.selectedEntity&&!s.isSilent);X(r)}n.actions.hook.addEventListener(Q,r=>{const s=r;s.detail.entityId===n.selectedEntity&&et(s.detail)}),n.actions.hook.addEventListener(tt,r=>{const s=r;s.detail.entityId===n.selectedEntity&&xt(s.detail)}),n.entityHook.addEventListener(ct,r=>{const s=r;Array.from(document.querySelectorAll("#interface_control > div:first-child > div")).forEach(d=>d.classList.remove("active")),document.querySelector(`#interface_control > div:first-child > div[data-id="${s.detail}"]`)?.classList.add("active");const c=n.actions.getActions().filter(d=>d.entityId===n.selectedEntity&&!d.isSilent);X(c)})},X=e=>{const t=document.querySelector("#interface_control > div:last-child");if(t){t.innerHTML="";for(let i of e)et(i,t)}},et=(e,t)=>{t=t??document.querySelector("#interface_control > div:last-child")??void 0;const i=document.createElement("div");i.textContent=`${e.type} - ${e.value}`,i.dataset.id=e.id,t?.appendChild(i)},xt=e=>{const t=document.querySelector("#interface_control > div:last-child")??void 0;t&&t.querySelector(`div[data-id="${e.id}"]`)?.remove()},Mt=e=>{const[t,i,o,r,s,a,c,d,h]=Array.from(e.querySelectorAll("button"));i.addEventListener("click",()=>{if(n.selectedEntity!==void 0){n.actions.addAction("MOVE",{value:5,entityId:n.selectedEntity});for(let f=1;f<5;f++)n.actions.addSilentAction("MOVE",{value:1,entityId:n.selectedEntity})}}),t.addEventListener("click",()=>{n.selectedEntity!==void 0&&n.actions.addAction("MOVE",{value:1,entityId:n.selectedEntity})}),o.addEventListener("click",()=>{n.selectedEntity!==void 0&&n.actions.addAction("ROTATE",{value:-1,entityId:n.selectedEntity})}),r.addEventListener("click",()=>{n.selectedEntity!==void 0&&n.actions.addAction("ROTATE",{value:1,entityId:n.selectedEntity})}),s.addEventListener("click",()=>{n.selectedEntity!==void 0&&n.actions.addAction("MINE",{value:0,entityId:n.selectedEntity})}),a.addEventListener("click",()=>{if(n.selectedEntity!==void 0){n.actions.addAction("MINE",{value:5,entityId:n.selectedEntity});for(let f=1;f<5;f++)n.actions.addSilentAction("MINE",{value:1,entityId:n.selectedEntity})}}),c.addEventListener("click",()=>{n.selectedEntity!==void 0&&n.actions.addAction("UNLOAD",{value:0,entityId:n.selectedEntity})}),d.addEventListener("click",()=>{n.selectedEntity!==void 0&&n.actions.addAction("RECHARGE",{value:100,entityId:n.selectedEntity})}),h.addEventListener("click",()=>{n.selectedEntity!==void 0&&n.focusEntity(n.selectedEntity)})},Lt=()=>{const e=document.querySelector("#interface_control > div:first-child")??void 0;e&&n.entities.forEach(t=>{const i=document.createElement("div");i.dataset.id=t.id.toString(),i.textContent=`[${t.id}] ${t.name}`,e.appendChild(i),i.addEventListener("click",()=>n.selectEntity(t.id))})},E={stone:{type:"RESOURCE",description:"",label:"Stone"},iron:{type:"RESOURCE",description:"",label:"Iron Ore"},carbon:{type:"RESOURCE",description:"",label:"Carbon"},copper:{type:"RESOURCE",description:"",label:"Copper Ore"},coal:{type:"RESOURCE",description:"",label:"Coal"},interface_control:{ingredients:[{item:"stone",count:50},{item:"iron",count:10}],story:["IRON_FIRST"],description:"Extra control interface for manual remote instruction",type:"INTERFACE",waypoint:"INTERFACE_CONTROL_INTERFACE",label:"Control Interface"},interface_automation:{ingredients:[{item:"stone",count:50},{item:"iron",count:10},{item:"copper",count:10},{item:"carbon",count:10}],story:["IRON_FIRST","CARBON_FIRST","COPPER_FIRST"],description:"Allow automated remote instruction",type:"INTERFACE",waypoint:"INTERFACE_AUTOMATION_INTERFACE",label:"Automation Interface"},interface_smelting:{ingredients:[{item:"iron",count:50},{item:"stone",count:200}],story:["IRON_FIRST"],description:"For the production of alloy metals",type:"INTERFACE",waypoint:"INTERFACE_SMELTING",label:"Smelting Interface"},module_visual_scanner:{ingredients:[{item:"iron",count:10}],story:["IRON_FIRST"],description:"Visually assess one tile in front",type:"MODULE",label:"Visual Scanner (Module)",quality:"BASIC",moduleType:"navigation",stats:{}},module_basic_battery:{ingredients:[{item:"stone",count:20},{item:"iron",count:10}],story:["IRON_FIRST"],description:"A very simple battery with limited capacity",type:"MODULE",label:"Basic Battery (Module)",quality:"BASIC",moduleType:"battery",stats:{battery:100,rechargeSpeed:1},actionType:["RECHARGE"]},module_basic_drill:{ingredients:[{item:"iron",count:30}],story:["IRON_FIRST"],description:"A brittle, dull drill",type:"MODULE",label:"Basic Drill (Module)",quality:"BASIC",moduleType:"drill",stats:{drillSpeed:1,drillPower:1},actionType:["MINE"]},module_basic_motor:{ingredients:[{item:"stone",count:20},{item:"iron",count:50}],story:["IRON_FIRST"],description:"5hp of pure disappointment",type:"MODULE",label:"Basic Motor (Module)",quality:"BASIC",moduleType:"engine",stats:{speed:1},actionType:["MOVE","ROTATE"]},module_basic_store:{ingredients:[{item:"stone",count:20},{item:"iron",count:20}],story:["IRON_FIRST"],description:"10 slot store",type:"MODULE",label:"Basic Store",quality:"BASIC",moduleType:"store",stats:{inventorySize:10},actionType:["UNLOAD"]},module_home_navigation:{ingredients:[{item:"carbon",count:10},{item:"copper",count:10}],story:["CARBON_FIRST","COPPER_FIRST"],description:"Provides automated routing to nearest base",type:"MODULE",label:"Home Navigation (Module)",quality:"BASIC",moduleType:"navigation",stats:{}},module_dev:{type:"MODULE",label:"DEV DEV DEV",quality:"BASIC",description:"DEV DEV DEV",moduleType:"engine",stats:{battery:1e4,drillSpeed:10,speed:10,inventorySize:1e4,rechargeSpeed:10,drillPower:10},ingredients:[],actionType:["ROTATE","MOVE","MINE","UNLOAD","RECHARGE"]},deployable_automation_hull:{ingredients:[{item:"iron",count:10}],story:["IRON_FIRST"],description:"An empty mining automation hull (deployable)",type:"DEPLOYABLE",label:"Basic Automation Hull",quality:"BASIC"}},Nt=(e,t)=>{t<0||(n.story.STORAGE_FIRST||n.addWaypoint("STORAGE_FIRST"),e==="iron"&&!n.story.IRON_FIRST&&n.addWaypoint("IRON_FIRST"),e==="carbon"&&!n.story.CARBON_FIRST&&n.addWaypoint("CARBON_FIRST"),e==="copper"&&!n.story.COPPER_FIRST&&n.addWaypoint("COPPER_FIRST"))},Ft=(e,t)=>{if(n.story.DEPLOY_FIRST||(n.addWaypoint("DEPLOY_FIRST"),v(`An automation requires modules in order to be useful.
Useful commands: list, select, equip`)),n.entityGfx){const i=n.entities.length;t=t||`ENTITY-${i}`,n.entities.push(new st(n.entityGfx,n.entities.length,t,[],[])),n.updateLights()}},Ut=e=>{const t=E[e];if(!t||!t.ingredients)return!1;const i=t.ingredients;for(let o of i)if((n.inventory.inventory[o.item]??0)<o.count)return!1;for(let o of i)n.inventory.remove(o.item,o.count);return t.type==="MODULE"||t.type==="DEPLOYABLE"?n.inventory.add(e):t.type==="INTERFACE"&&n.addWaypoint(t.waypoint),!0},Dt=e=>{switch(e){case"STORAGE_FIRST":v(`Crafting Unlocked
see command "crafting" for more information`);break;case"IRON_FIRST":v("New recipes available");break;case"CARBON_FIRST":n.story.COPPER_FIRST&&v("New recipes available");break;case"COPPER_FIRST":n.story.CARBON_FIRST&&v("New recipes available");break;case"INTERFACE_CONTROL_INTERFACE":v("Control interface installed"),q();break;case"INTERFACE_AUTOMATION_INTERFACE":v("Automation interface installed"),q();break}},q=()=>{Ct()},I=document.querySelector("#control_console div#output"),$={Manage:[["list","List available entities.",""],["storage","Show current store inventory.",""],["deploy","Deploy from storage. Ex. deploy <deployable_name> <label>","str, str?"],["select","Select entity for control.","int"],["selected","Show currently selected entitiy.",""]],Entity:[["commands","List available commands for selected entity.",""],["inventory","Show current entity inventory.",""],["battery","Show current entity battery value.",""],["modules","List currently installed modules and stats.",""],["exec","Execute a named script.",""],["install","Install a module from the main storage","str"],["focus","Move camera and follow selected entity.",""],["cancel","Cancel current action where possible.",""],["halt","Cancel all queued actions where possible.",""]]},gt={MINE:["mine","Activate drill <n> times.","int=1"],MOVE:["move","Move <n> in facing direction.","int=1"],RECHARGE:["recharge","Recharge entity battery <n> units. HOME ONLY.","int?"],ROTATE:["rotate","Rotate 90 degrees CW <n> or CCW <-n>.","int [-3, 3]"],UNLOAD:["unload","Move entity inventory to storage. HOME ONLY.",""]},Bt=$.Entity.map(e=>e.at(0)),m=(e,t)=>{const i=e.split(`
`).map(s=>{const a=document.createElement("p");return a.textContent=s||"",t&&(a.className=t),a}),o=Array.from(I?.children??[]),r=o.length+i.length-_t;for(let s=0;s<Math.max(r,0);s++)o[s]?.remove();i.forEach(s=>I?.appendChild(s)),I?.scrollTo(0,I.scrollHeight??0)},v=e=>{m(e,"important")},w=e=>{m(`[WARNING] ${e}`,"warning")},_=(e,t=!0)=>{m(e,t?"bold header white":"header black")},p=e=>{m(`[ERROR] ${e}`,"error")},Pt=(e,t)=>{!t||t.isSilent||m(`[${(Date.now()/1e3).toFixed(0)}] Entity [${e.id}] - ${t.type}: ${t.value}`,"log")},j=(e,t)=>{m(`[ENTITY:${e}] ${t}`)},C=(e,t,i=" ")=>{const o=[...t?[t]:[],...e].reduce((r,s)=>(s.forEach((a,c)=>{r[c]=Math.max(r[c]??0,a.length)}),r),[]);t&&_(t.map((r,s)=>r.padEnd(o[s]??0)).join(i),!1),e.forEach(r=>{m(r.map((s,a)=>s.padEnd(o[a]??0)).join(i))})},kt=e=>{m(" "),m(` > ${e}`);const[t,...i]=e.split(" "),o=t.toLowerCase(),r=Wt(o,i);if(r===!1){p("Invalid argument");return}else if(r)return;const s=$t(o,i);if(s===!1){p("No entity selected!");return}else if(s)return;p(`Unknown command: ${o}`)},$t=(e,t)=>{const i=n.selectedEntity!==void 0?n.entities.find(s=>s.id===n.selectedEntity):void 0;if(!i)return;const[o]=t,r=s=>{const a=parseInt(o??0),c=n.actions.addAction(s,{entityId:i.id,timeEnd:Date.now()+1e5,value:a});if(s==="MOVE"||s==="ROTATE"||s==="MINE")for(let d=1;d<(c.value??a);d++)n.actions.addSilentAction(s,{entityId:i.id,timeEnd:Date.now()+1e5,value:a},c.id);return!0};if(i.actions.includes(e.toUpperCase()))return r(e.toUpperCase())},Wt=(e,t)=>{const[i]=t;switch(e){case"help":return zt(),!0;case"list":return Yt(),!0;case"select":return Ht(parseInt(i));case"storage":return qt(),!0;case"deploy":return Gt(t);case"clear":return Y(),!0;case"crafting":return oe(i);case"selected":return Vt(),!0;case"dev_spawn":return ie();case"save":return ot(),!0;case"load":return nt(),!0}if(Bt.includes(e)){const o=n.selectedEntity!==void 0?n.entities.find(r=>r.id===n.selectedEntity):void 0;if(o)switch(e){case"commands":return Xt(o),!0;case"inventory":return Kt(o),!0;case"battery":return Zt(o),!0;case"cancel":return Qt(o),!0;case"halt":return te(o),!0;case"focus":return jt(o),!0;case"modules":return Jt(o),!0;case"exec":return ne(o,i);case"install":return ee(o,i)}else return p("No entity selected."),!0}},Ht=e=>isNaN(e)||!n.entities.find(i=>i.id===e)?!1:(n.selectEntity(e),m(`Entity ${e} selected`),!0),Yt=()=>{_("Entities"),m(n.entities.map(e=>`[${e.id}] - ${e.name}`).join(`
`))},zt=()=>{n.story.STORAGE_FIRST,_("Help"),m(` - Manage -
`),C($.Manage,["Command","Description","Args"]," | "),m(`
- Entity -
`),C($.Entity,["Command","Description","Args"]," | ")},Gt=([e,t])=>e&&E[e]?.type==="DEPLOYABLE"?(n.deploy(e,t),!0):(p(`"${e}" is not recognised as a deployable item.`),!0),Vt=()=>{const e=n.selectedEntity!==void 0?n.entities.find(t=>t.id===n.selectedEntity):void 0;_("Selected"),m(e?`[${e.id}] - ${e.name}`:"- NONE -")},Xt=(e,t)=>{_("Commands");const i=e.actions;C(i.map(o=>gt[o]),["Command","Description","Args"]," | ")},qt=()=>{_("Storage"),it(Object.entries(n.inventory.inventory).map(([e,t])=>[e,t]))},it=e=>{const t=e.map(([i,o])=>[`[${i}]`,E[i].label,E[i].type,E[i].quality??"",o.toString()]);C(t,["Name","Label","Type","Quality","Quantity"]," | ")},jt=(e,t)=>{n.focusEntity(e.id)},Kt=(e,t)=>{_("Inventory"),m(`Slots: ${e.inventory.total} / ${e.inventory.limit??"-"}`),it(Object.entries(e.inventory.inventory).map(([i,o])=>[i,o]))},Zt=(e,t)=>{m(`Entity [${e.id}] battery: ${e.battery} / ${e.maxBattery}`)},Jt=(e,t)=>{_("Installed Modules"),C(e.modules.map(i=>{const o=E[i];return[i,o.label,o.quality,o.moduleType]}),["Name","Label","Quality","Type"]," | "),m(`[ Movement: ${e.speed} ] [ Drill: ${e.drillSpeed} ] [ Battery: ${e.battery} / ${e.maxBattery} ]`)},Qt=(e,t)=>{const i=n.actions.cancelOneForEntity(e.id);i&&m(`Entity [${e.id}] request to cancel ${i.type}`)},te=(e,t)=>{n.actions.cancelAllForEntity(e.id),m(`Entity [${e.id}] cancel all queued actions`)},ee=(e,t)=>(E[t]||p(`Unknown or missing module - "${t}"`),n.inventory.remove(t,1)||p(`Unknown or missing module - "${t}"`),e.installModule(t)||(p(`Unable to install ${t}, slot already used or incompatible`),n.inventory.add(t,1)),!0),ie=()=>{!n.gl||n.entityGfx},oe=e=>{if(!n.story.STORAGE_FIRST)return;if(e?.trim())return E[e].ingredients?Ut(e):(p(`Unknown recipe: ${e}`),!0);const t=Object.entries(E).filter(([,i])=>i.ingredients?.length).filter(([,i])=>(i.story??[]).every(o=>n.story[o])).filter(([,i])=>!i.waypoint||!n.story[i.waypoint]).map(([i])=>{const o=E[i];return[i,o.description,o.ingredients.map(r=>`${r.item}[${r.count}]`).join(",")]});return _("Crafting"),m('Usage: "crafting <recipe>"'),C(t,["Name","Description","Recipe"]," | "),!0},ne=(e,t)=>(n.scripts[t]||p(`Unknown script ${t}`),!0),Y=()=>{I&&(I.innerHTML="")},ot=()=>{w("Game saving..."),window.localStorage.setItem("save",btoa(JSON.stringify(n.getSave())))},nt=()=>{const e=window.localStorage.getItem("save");if(e){Y(),w("Game loaded...");const t=JSON.parse(atob(e));n.onLoad(t)}},re=2,se=2200,ae=function(e){if(e.isStarted||(e.timeEnd=Date.now()+(se-this.drillSpeed*200),e.start()),e.timeEnd>Date.now())return;e.complete();const t=rt(N(this.coords),this.angle,1);if(t.type===y.ROCK||t.type===y.ORE){let i=t.durability*V[t.tile];i-=this.drillPower;const o=St(t);for(let r=0;r<this.drillPower;r++){const s=bt[t.tile]??[];for(let a of s){let c=a.chance?a.chance:(a.baseChance??0)*(o*.2);for(;c>0;)Math.random()<=c&&this.inventory.add(a.item),c-=1}}if(i<=0){const r=At(t.coord);n.actions.addMapUpdate({...t,type:y.FLOOR,durability:1});for(let s of r)if(s.type===y.SHADOW){let a=y.ROCK;Math.random()<.01*o&&(a=y.ORE),n.actions.addMapUpdate({...s,type:a,durability:1})}}else n.actions.addMapUpdate({...t,durability:i/V[t.tile]})}},rt=(e,t,i=1)=>{const o=[...e];return t===0?o[0]+=i:t===1?o[1]-=i:t===2?o[0]-=i:t===3&&(o[1]+=i),b(o)},ce=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:re,command:ae,getFacingTile:rt},Symbol.toStringTag,{value:"Module"})),W=(e,t,i)=>Math.max(e,Math.min(t,i)),de=1,le=l/100,ue=function(e){if(!e.isStarted){const r=me(1,this.angle,this.coords);this.angle===3&&(this.target=[this.coords[0],this.coords[1]+r*l]),this.angle===0&&(this.target=[this.coords[0]+r*l,this.coords[1]]),this.angle===1&&(this.target=[this.coords[0],this.coords[1]-r*l]),this.angle===2&&(this.target=[this.coords[0]-r*l,this.coords[1]]),e?.start()}const t=this.speed*le;let i;this.target&&(i=[W(-t,t,this.target[0]-this.coords[0]),W(-t,t,this.target[1]-this.coords[1])]),i?.[0]===0&&i?.[1]===0&&(n.updateLights(),e?.complete(),this.target=void 0,i=void 0),i&&(n.isFollowing===this.id&&(n.camera[0]+=i[0],n.camera[1]+=i[1]),this.coords=[this.coords[0]+i[0],this.coords[1]+i[1]])},me=(e,t,i)=>{let o=[0,0];t===F.DOWN?o=[0,-l]:t===F.LEFT?o=[-l,0]:t===F.RIGHT?o=[l,0]:o=[0,l];let r=0,s=[...i];for(;r<e;){s[0]+=o[0],s[1]+=o[1];const a=N(s),c=b(a);if(!Tt[c.tile])break;r++}return r},he=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:de,command:ue},Symbol.toStringTag,{value:"Module"})),fe=1,ye=function(e){let t=this.targetR;if(e.isStarted||(t=this.angle+(e.value>0?1:-1),t<0&&(t=4+t),t>3&&(t=t-4),e.start()),t===void 0){e.complete();return}this.targetR=t;const i=P[this.targetR];let o=0;if(e.value<0){let r=this.rad<i?this.rad+G:this.rad;o=-.05,r+o<=i&&e.complete()}else{let r=this.rad>i?this.rad-G:this.rad;o=.05,r+o>=i&&e.complete()}e.isComplete?(this.rad=P[this.targetR],this.angle=this.targetR,this.targetR=void 0):this.rad+=o,this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad)},Ee=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:fe,command:ye},Symbol.toStringTag,{value:"Module"})),pe=0,ve=function(e){e.complete();const t=N(this.coords);b(t).type===y.HOME?(Object.entries(this.inventory.inventory).forEach(([o,r])=>{n.inventory.add(o,r),this.inventory.remove(o,r)}),j(this.id,"Unloading")):j(this.id,"Unable to unload")},_e=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:pe,command:ve},Symbol.toStringTag,{value:"Module"})),Te=0,K=550,be=function(e){if(!e.isStarted){const i=N(this.coords);if(b(i).type!==y.HOME){p(`Entity [${this.id}] - Unable to recharge at this location`),e.complete();return}e.timeEnd=Date.now()+(K-this.rechargeSpeed*50),e.start()}if(e.timeEnd>Date.now())return;const t=e.value?Math.max(0,Math.min(100,e.value))/100*this.maxBattery:this.maxBattery;if(this.battery>=t||e.shouldCancel){e.complete();return}this.battery++,e.timeEnd=Date.now()+(K-this.rechargeSpeed*100)},Re=Object.freeze(Object.defineProperty({__proto__:null,BATTERY_COST:Te,command:be},Symbol.toStringTag,{value:"Module"})),Ae=function(e){if(!this.actions.includes(e.type)){e.complete();return}let t;switch(e.type){case"MOVE":t=he;break;case"ROTATE":t=Ee;break;case"MINE":t=ce;break;case"UNLOAD":t=_e;break;case"RECHARGE":t=Re;break}if(t){if(!e.isStarted){if(t.BATTERY_COST){if(this.battery<t.BATTERY_COST)return;this.battery=Math.max(0,this.battery-t.BATTERY_COST)}Pt(this,e)}return t.command.call(this,e)}};class z{inventory={};limit;total;hook;constructor(t,i){this.hook=t,this.limit=i,this.total=0}add(t,i=1){this.limit&&(i=Math.max(0,Math.min(this.limit-this.total,i))),i&&(this.total+=i,this.inventory[t]=(this.inventory[t]??0)+i,this.hook?.(t,i))}remove(t,i=1){return(this.inventory[t]??0)>=i?(this.inventory[t]=this.inventory[t]-i,this.total-=i,this.hook?.(t,-i),this.inventory[t]||delete this.inventory[t],!0):!1}}class st{id;name;gfx;actions;rotation=[0,1];rad=P[3];angle=3;inventorySize;inventory;speed;drillSpeed;battery;maxBattery;rechargeSpeed;drillPower;target;targetR;coords;modules;getSave(){return{...this,gfx:void 0}}constructor(t,i,o,r=["MOVE","ROTATE"],s){this.gfx=t,this.id=i,this.coords=[Math.round(u/2*l)-l/2,Math.round(u/2*l)-l/2],this.rotation[0]=Math.sin(this.rad),this.rotation[1]=Math.cos(this.rad),this.actions=r,this.name=o,this.maxBattery=0,this.battery=this.maxBattery,this.speed=0,this.drillSpeed=0,this.inventorySize=0,this.rechargeSpeed=0,this.drillPower=0,this.inventory=new z(void 0,this.inventorySize),this.modules=s??[]}async init(){this.balanceModules(),this.battery=this.maxBattery}installModule(t){const i=E[t];return!i||this.modules.find(o=>E[o].moduleType===i.moduleType)?!1:(this.modules.push(t),this.balanceModules(),!0)}balanceModules(){this.speed=0,this.drillSpeed=0,this.maxBattery=0,this.inventorySize=0,this.actions=[],this.modules.forEach(t=>{const i=E[t],o=i.stats;this.speed+=o?.speed??0,this.maxBattery+=o?.battery??0,this.drillSpeed+=o?.drillSpeed??0,this.inventorySize+=o?.inventorySize??0,this.rechargeSpeed+=o?.rechargeSpeed??0,this.drillPower+=o?.drillPower??0,this.actions.push(...i.actionType??[])}),this.inventory.limit=this.inventorySize}update(t){const i=this.battery;t&&Ae.call(this,t),this.battery!==i&&(this.battery<=0?p(`Entity ${this.id} - no power, battery empty`):this.battery<=this.maxBattery*.2&&i>this.maxBattery*.2?w(`Entity ${this.id} - battery low warning`):this.battery<=this.maxBattery*.1&&i>this.maxBattery*.1&&p(`Entity ${this.id} - battery is critical`))}render(t,i){this.gfx.render(t,this,i)}}const Se=10,at=-3,ct="ENTITY_SELECTED";class Oe{gl;entityGfx;camera=[0,0];actions;zoom=0;selectedEntity;inventory;isFollowing;entities=[];story={};history=[];onStory;onDeploy;scripts;lights;entityHook;getSave(){return{...this,gl:void 0,entityGfx:void 0,entities:this.entities.map(t=>t.getSave()),lights:[]}}onLoad(t){Object.assign(this,{camera:t.camera??this.camera,zoom:t.zoom??this.zoom,selectedEntity:t.selectedEntity??this.selectedEntity,isFollowing:t.isFollowing??this.isFollowing,story:t.story??this.story,history:t.history??this.history,scripts:t.scripts??this.scripts}),this.entityGfx&&(this.entities=t.entities?.map(i=>{const o=new st(this.entityGfx,i.id,i.name,i.actions,i.modules);return Object.assign(o,i),o.balanceModules(),o})??[]),this.actions&&t.actions&&(this.actions.stack=t.actions.stack.map(i=>{const o=new k(i.type,{delta:i.delta,value:i.value,timeEnd:i.timeEnd,entityId:i.entityId},i.isSilent,i.parentId);return o.id=i.id,o.isComplete=i.isComplete,o.isStarted=i.isStarted,o.shouldCancel=i.shouldCancel,o})),console.log(this.actions),this.inventory&&Object.assign(this.inventory,t.inventory),this.updateLights()}constructor(t=new It,i=new z,o){this.lights=new Float32Array(48).fill(0),this.actions=t,this.inventory=i,this.onStory=o,this.entityHook=new EventTarget,this.scripts={}}selectEntity(t){this.focusEntity(t)&&(this.selectedEntity=t,this.entityHook.dispatchEvent(new CustomEvent(ct,{detail:t})))}focusEntity(t){const i=this.entities.find(o=>o.id===t);return i?(this.isFollowing=t,this.camera=[i.coords[0]-11*l,i.coords[1]-6.5*l],this.zoom=0,!0):!1}resolution(t){const i=t.canvas.height/t.canvas.width,o=t.canvas.width+100*this.zoom,r=t.canvas.height+100*this.zoom*i;return[o,r]}setZoom(t){const i=W(at,Se,t);if(i>this.zoom)this.camera[0]=this.camera[0]-l,this.camera[1]=this.camera[1]-l;else if(i<this.zoom)this.camera[0]=this.camera[0]+l,this.camera[1]=this.camera[1]+l;else return;this.zoom=i}getHistory(){return this.history=this.history.slice(-H).toReversed().filter((t,i,o)=>o.indexOf(t)===i).reverse(),this.history}addWaypoint(t){this.story[t]||(this.story[t]=!0,this.onStory?.(t))}updateLights(){const t=new Float32Array(48).fill(0);for(let i=0;i<n.entities.length;i++){const[o,r]=n.entities[i].coords;t[i*3]=o,t[i*3+1]=r,t[i*3+2]=5*l}this.lights=t}deploy(t,i){this.inventory.remove(t)&&this.onDeploy?.(t,i)}}const n=new Oe;let R;const x=document.querySelector("#control_console input");let A=H;const Ie=()=>{x?.addEventListener("keyup",e=>{const t=e.key,i=e.target.value;if(t==="Enter"&&i.length){n.history.push(i),kt(i),e.target.value="";const o=n.getHistory();A=Math.min(o.length,H)}if(t==="ArrowUp"&&A>0){const o=n.getHistory();A--,x.value=o[A]??""}if(t==="ArrowDown"){const o=n.getHistory();A>=o.length?x.value="":(A++,x.value=o[A]??"")}}),x?.focus(),document.querySelector("#nav > div:first-of-type")?.addEventListener("click",e=>dt(e.target,"control_console"))},we=()=>{let e=document.getElementById("c");e?.addEventListener("mousedown",t=>{R=[t.clientX,t.clientY]}),e?.addEventListener("mousemove",t=>{if(R){n.isFollowing=void 0;let i=[t.clientX,t.clientY];const r=.6+(n.zoom+(0-at))*.125,s=(i[0]-(R?.[0]??0))*r,a=(i[1]-(R?.[1]??0))*r;n.camera[0]=n.camera[0]-s,n.camera[1]=n.camera[1]+a,R=i}}),e?.addEventListener("mouseup",()=>R=void 0),e?.addEventListener("mouseout",()=>R=void 0),e?.addEventListener("wheel",t=>{const i=t.deltaY;n.setZoom(n.zoom+(i>0?1:-1))})},dt=(e,t)=>{Array.from(document.querySelectorAll("div#context > div")).forEach(i=>i.classList.add("hidden")),Array.from(document.querySelectorAll("#nav > div")).forEach(i=>i.classList.remove("active")),document.getElementById(t)?.classList.remove("hidden"),e.classList.add("active")};function lt(e){console&&(console.error?console.error(e):console.log&&console.log(e))}const Ce=/ERROR:\s*\d+:(\d+)/gi;function ut(e,t=""){const i=[...t.matchAll(Ce)],o=new Map(i.map((r,s)=>{const a=parseInt(r[1]),c=i[s+1],d=c?c.index:t.length,h=t.substring(r.index,d);return[a-1,h]}));return e.split(`
`).map((r,s)=>{const a=o.get(s);return`${s+1}: ${r}${a?`

^^^ ${a}`:""}`}).join(`
`)}function xe(e,t,i,o){const r=o||lt,s=e.createShader(i);if(!s)return r("No shader"),null;if(e.shaderSource(s,t),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS)){const c=e.getShaderInfoLog(s);return r(`Error compiling shader: ${c}
${ut(t,c??"")}`),e.deleteShader(s),null}return s}function Me(e,t,i,o,r){const s=r||lt,a=e.createProgram();if(!a)return null;if(t.forEach(function(d){e.attachShader(a,d)}),i&&i.forEach(function(d,h){e.bindAttribLocation(a,o?o[h]:h,d)}),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS)){const d=e.getProgramInfoLog(a),h=t.map(f=>{const Et=ut(e.getShaderSource(f)??"");return`${e.getShaderParameter(f,e.SHADER_TYPE)}:
${Et}`}).join(`
`);return s(`Error in program linking: ${d}
${h}`),e.deleteProgram(a),null}return a}const Le=["VERTEX_SHADER","FRAGMENT_SHADER"];function mt(e,t,i=[],o=[],r=()=>{}){const s=[];for(let a=0;a<t.length;++a)s.push(xe(e,t[a],e[Le[a]],r));return Me(e,s.filter(Boolean),i,o,r)}function ht(e,t){t=t||1;const i=e.clientWidth*t|0,o=e.clientHeight*t|0;return e.width!==i||e.height!==o?(e.width=i,e.height=o,!0):!1}let D={};const ft=async(e,t)=>{if(D[t])return D[t];const i=e.createTexture()??void 0;if(!i)throw new Error("Invalid texture");e.bindTexture(e.TEXTURE_2D,i);const o=new Image;return o.src=t,new Promise(r=>{o.onload=()=>{e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.bindTexture(e.TEXTURE_2D,null),D[t]=i,r(i)}})},Ne=`#version 300 es

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
`,Fe=`#version 300 es

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
}`,Ue=`#version 300 es

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
`,De=`#version 300 es

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
}`,yt=""+new URL("atlas-DZRTRS7K.png",import.meta.url).href,T=.01;class ge{indices;positions;binds;program;vao;vbo;posBuf;blockTex;atlas;constructor(){this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,T,1-T,0,l,T,T,l,0,S-T,1-T,l,l,S-T,T])}async init(t){const i=mt(t,[Ne,Fe]);if(!i)throw new Error("No program");this.program=i;const o={position:t.getAttribLocation(i,"a_position"),atlas:t.getAttribLocation(i,"a_texcoord"),tileW:t.getUniformLocation(i,"tileW"),tileX:t.getUniformLocation(i,"tileX"),camera:t.getUniformLocation(i,"camera"),resolution:t.getUniformLocation(i,"u_resolution"),atlasW:t.getUniformLocation(i,"u_atlas_w"),light:t.getUniformLocation(i,"u_light")};if(o.camera===null||o.position===null||o.resolution===null||o.tileW===null||o.tileX===null||o.atlas===null)throw new Error("Bad binds");if(this.binds=o,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const r=2,s=t.FLOAT,a=!1,c=4*Float32Array.BYTES_PER_ELEMENT;let d=0;if(t.vertexAttribPointer(this.binds.position,r,s,a,c,d),t.enableVertexAttribArray(this.binds.position),d+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,r,s,a,c,d),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");if(t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await ft(t,yt),this.blockTex=t.createTexture()??void 0,!this.blockTex)throw new Error("No block texture");t.bindTexture(t.TEXTURE_2D,this.blockTex);const h=L();t.texImage2D(t.TEXTURE_2D,0,t.RG32F,u,u,0,t.RG,t.FLOAT,h),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}update(t,i){i?.length&&this.blockTex&&(t.bindTexture(t.TEXTURE_2D,this.blockTex),i.forEach(o=>{t.texSubImage2D(t.TEXTURE_2D,0,o.coord[1],o.coord[0],1,1,t.RG,t.FLOAT,new Float32Array([o.type,o.durability]))}),t.bindTexture(t.TEXTURE_2D,null))}render(t,i){!this.binds||!this.program||!this.vao||!this.blockTex||!this.vbo||!this.posBuf||!this.atlas||(t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.uniform1i(this.binds.tileW,l),t.uniform1i(this.binds.tileX,u),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.blockTex),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_data"),0),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),1),t.uniform1f(this.binds.atlasW,S),t.uniform3fv(this.binds.light,n.lights),t.uniform2fv(this.binds.camera,[-i[0],-i[1]]),t.uniform2f(this.binds.resolution,...n.resolution(t)),t.drawElementsInstanced(t.TRIANGLES,this.indices.length,t.UNSIGNED_SHORT,0,u*u))}}class Be{indices;positions;binds;program;vao;vbo;posBuf;atlas;constructor(){this.indices=new Uint16Array([0,1,2,2,3,1]),this.positions=new Float32Array([0,0,S*2,0,0,l,S*3,0,l,0,S*2,1,l,l,S*3,1])}async initGraphics(t){const i=mt(t,[Ue,De]);if(!i)throw new Error("No program");this.program=i;const o={position:t.getAttribLocation(i,"a_position"),move:t.getUniformLocation(i,"u_movement"),tileW:t.getUniformLocation(i,"tileW"),atlas:t.getAttribLocation(i,"a_texcoord"),camera:t.getUniformLocation(i,"camera"),resolution:t.getUniformLocation(i,"u_resolution"),rotation:t.getUniformLocation(i,"u_rotation"),isSelected:t.getUniformLocation(i,"u_selected")};if(o.camera===null||o.position===null||o.resolution===null||o.move===null||o.atlas===null)throw new Error("Bad binds");if(this.binds=o,this.posBuf=t.createBuffer()??void 0,!this.posBuf)throw new Error("No Pos Buf");if(t.bindBuffer(t.ARRAY_BUFFER,this.posBuf),t.bufferData(t.ARRAY_BUFFER,this.positions,t.STATIC_DRAW),this.vao=t.createVertexArray()??void 0,!this.vao)throw new Error("No VAO");t.bindVertexArray(this.vao);const r=2,s=t.FLOAT,a=!1,c=4*Float32Array.BYTES_PER_ELEMENT;let d=0;if(t.vertexAttribPointer(this.binds.position,r,s,a,c,d),t.enableVertexAttribArray(this.binds.position),d+=2*Float32Array.BYTES_PER_ELEMENT,t.vertexAttribPointer(this.binds.atlas,r,s,a,c,d),t.enableVertexAttribArray(this.binds.atlas),this.vbo=t.createBuffer()??void 0,!this.vbo)throw new Error("No VBO");t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.bufferData(t.ELEMENT_ARRAY_BUFFER,this.indices,t.STATIC_DRAW),this.atlas=await ft(t,yt),t.bindTexture(t.TEXTURE_2D,null),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,null),t.bindBuffer(t.ARRAY_BUFFER,null),t.bindVertexArray(null)}render(t,i,o){!this.binds||!this.program||!this.vao||!this.vbo||!this.posBuf||!this.atlas||(ht(t.canvas),t.useProgram(this.program),t.bindVertexArray(this.vao),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,this.vbo),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.atlas),t.uniform1i(t.getUniformLocation(this.program,"u_texture"),0),t.uniform2fv(this.binds.camera,[-o[0],-o[1]]),t.uniform2fv(this.binds.move,i.coords),t.uniform2fv(this.binds.rotation,i.rotation),t.uniform1f(this.binds.tileW,l/2),t.uniform1i(this.binds.isSelected,i.id===n.selectedEntity?2:0),t.uniform2f(this.binds.resolution,...n.resolution(t)),t.drawElements(t.TRIANGLES,6,t.UNSIGNED_SHORT,0))}}const g={RUN:void 0,JMP:["label"],PUT:["number_memory","memory"],JEQ:["number_memory","number_memory","label"],JGT:["number_memory","number_memory","label"],JLT:["number_memory","number_memory","label"],JZE:["number_memory","label"],SUB:["number_memory","number_memory","memory"],MUL:["number_memory","number_memory","memory"],ADD:["number_memory","number_memory","memory"],DIV:["number_memory","number_memory","memory"],MOD:["number_memory","number_memory","memory"]},B=/^[A-Za-z][A-Za-z_0-9]*\:/,Z=/^M_\d+/,Pe={label:(e,t)=>!!e.labels?.includes(t),memory:(e,t)=>Z.test(t),number_memory:(e,t)=>Z.test(t)||/^\d+/.test(t),number:(e,t)=>/^\d+/.test(t)},ke=e=>{const t=e.split(`
`).map(s=>s.replace(/#.+/g,"").trim()).filter(Boolean).map(s=>{const[a,...c]=s.split(" ");return[a,c]}),i={},o=t.reduce((s,[a],c)=>{if(!g[a]&&!B.test(a))return s.push([c,"UNKNOWN"]),s;if(B.test(a)){const d=a.replace(/:$/,"");if(i[d])return s.push([c,"DUPLICATE_LABEL"]),s;i[d]=c}return s},[]),r=t.reduce((s,[a,c],d)=>{if(B.test(a))return s;if(g[a]){const h=g[a];if(!h)return s;if(c.length!==h.length)return s.push([d,"INVALID"]),s;for(let f in c)Pe[h[f]]({labels:Object.keys(i)},c[f])||s.push([d,"INVALID",[c[f],h[f]]])}return s},o);return[r.length?[]:t,r,i]};class $e{lines;errors;labels;constructor(t){const[i,o,r]=ke(t);this.labels=r,this.lines=i,this.errors=o}}const We=async e=>{J();const t=new ge;n.gl=e;const i=new Be;await i.initGraphics(e),n.entityGfx=i,n.camera=[(u/2-11.5)*l,(u/2-7)*l],n.scripts.test=new $e(`
        START:
            MOVE 1
            MINE 10
            JMP START
    `),we(),await t.init(e),n.updateLights();const o=1e3/pt;let r=Date.now();for(;;){let s=r+o;Date.now()<s&&await new Promise(a=>setTimeout(a,10)),await new Promise(a=>requestAnimationFrame(()=>{const c=n.actions.getActions();for(let d of n.entities){const h=c.find(f=>f.entityId===d.id);d.update(h)}t.update(e,n.actions.getMapUpdates()),ht(e.canvas),e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(.1,.1,.1,1),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),t.render(e,n.camera);for(let d of n.entities)d.render(e,n.camera);a()})),r=Date.now()}},He=()=>{const e=document.createElement("canvas");e.id="c",e.width=1e3,e.height=600,e.style.backgroundColor="#000",document.querySelector("div.container > div.canvas-container")?.prepend(e),setTimeout(()=>{e.style.height="600px",e.addEventListener("transitionend",()=>{const t=e.getContext("webgl2",{premultipliedAlpha:!1});e.style.border="none",t?.getExtension("EXT_color_buffer_float"),t&&We(t)},{once:!0})},1e3)},Ye=async()=>{Ie(),n.inventory=new z,v("Welcome..."),await O(500),m("Initialising environment..."),await O(500),w("INIT CONNECTION..."),await O(100),w("INIT CAMERA..."),await O(500),He(),await O(1500),w("INIT COMPLETE"),await O(1500),Y(),v(`Your first task will be to deploy and construct a mining automation
========
Type "help" to get started
Useful commands: storage, deploy
`);const e=[];[["deployable_automation_hull",1],["module_basic_drill",1],["module_basic_motor",1],["module_basic_store",1],["module_basic_battery",1]].forEach(([i,o])=>n.inventory.add(i,o)),e.forEach(i=>n.addWaypoint(i)),n.inventory.hook=Nt,n.onStory=Dt,n.onDeploy=Ft,nt(),setInterval(()=>{ot()},2e4)},O=e=>new Promise(t=>setTimeout(t,e));Ye();
