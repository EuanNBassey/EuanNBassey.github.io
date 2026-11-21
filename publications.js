(function(){
const P=window.PUBS;
const TECH={nmr:"Solid-state NMR",esr:"Electron spin resonance",dft:"DFT",statmech:"Statistical mechanics",synth:"Synthesis"};
const DOM={batt:"Battery materials",ssc:"Solid-state chemistry"};
const SYS={na_mn:"Layered Na–Mn oxides",ni:"Li–Ni–Mn–O cathodes",drx:"Disordered rocksalts",methods:"NMR methods and theory",epr:"EPR",anode:"Anodes and electrolytes",scn:"Thiocyanate magnets",inorg:"Other inorganic materials",redox:"Oxygen redox"};
const BRIDGES=[[16,21],[12,1],[9,23],[2,4]];
const main=p=>p.tech[0]||"none";
const byId=Object.fromEntries(P.map(p=>[p.id,p]));
const xy=p=>[p.pos[0]+0.5*(p.pos[1]%2),p.pos[1]*0.866];
const X=x=>45+(x-1)*68,Y=y=>42+y*82;
const NS="http://www.w3.org/2000/svg";
const plain=s=>s.replace(/<[^>]+>/g,"");
const authHTML=s=>s.replace(/E\. ?N\. Bassey|E\. Bassey/g,m=>"<b>"+m+"</b>");
const edges=[];
for(let i=0;i<P.length;i++)for(let k=i+1;k<P.length;k++){const a=P[i],b=P[k];
  if(a.sys.some(s=>b.sys.includes(s))){const[xa,ya]=xy(a),[xb,yb]=xy(b);if(Math.hypot(xa-xb,ya-yb)<=1.01)edges.push({a:a.id,b:b.id,dash:false})}}
BRIDGES.forEach(([a,b])=>edges.push({a,b,dash:true}));
const related=id=>{const p=byId[id],s=new Set();P.forEach(q=>{if(q.id!==id&&q.sys.some(x=>p.sys.includes(x)))s.add(q.id)});BRIDGES.forEach(([a,b])=>{if(a===id)s.add(b);if(b===id)s.add(a)});return[...s].sort((a,b)=>byId[b].y-byId[a].y)};
let tAct=new Set(),dAct=new Set(),sel=1,hover=null;
const root=document.getElementById("pubs");
const svg=root.querySelector("#svg"),tip=root.querySelector("#tip"),net=root.querySelector("#net");
function el(n,a,p){const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
const matches=p=>(!tAct.size||p.tech.some(t=>tAct.has(t)))&&(!dAct.size||p.dom.some(d=>dAct.has(d)));
let nodeEls={},edgeEls=[];
function build(){
  svg.innerHTML="";
  const g0=el("g",{"aria-hidden":"true"},svg);
  for(let r=0;r<6;r++)for(let c=0;c<12;c++){const x=c+0.5*(r%2),y=r*0.866;if(X(x)<10)continue;el("circle",{cx:X(x),cy:Y(y),r:3,class:"dotbg","fill-opacity":.7},g0)}
  [["Layered Na–Mn oxides",1.2,-0.18],["Li–Ni–Mn–O cathodes",5.2,0.3],["Disordered rocksalts",9.2,0.3],["NMR methods and theory",4.9,2.85],["Thiocyanate magnets",1.2,5.0],["Anodes",6.6,5.0],["Other inorganic",8.9,5.0]].forEach(([t,x,y])=>{el("text",{x:X(x)-14,y:Y(y),class:"clabel"},svg).textContent=t});
  edgeEls=edges.map(e=>{const[xa,ya]=xy(byId[e.a]),[xb,yb]=xy(byId[e.b]);return el("line",{x1:X(xa),y1:Y(ya),x2:X(xb),y2:Y(yb),class:"edge"+(e.dash?" dash":"")},svg)});
  nodeEls={};
  P.forEach(p=>{const[x,y]=xy(p);
    const g=el("g",{class:"node t-"+main(p),tabindex:0,role:"button","aria-label":p.y+", "+plain(p.t)+" ("+p.j+")",transform:`translate(${X(x)},${Y(y)})`},svg);
    el("circle",{r:15,fill:`var(--c-${main(p)})`},g);
    el("text",{"text-anchor":"middle",y:4},g).textContent="’"+String(p.y).slice(2);
    g.addEventListener("click",()=>select(p.id));
    g.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();select(p.id)}});
    g.addEventListener("mouseenter",()=>{hover=p.id;paint();showTip(p,g)});
    g.addEventListener("mouseleave",()=>{hover=null;paint();tip.style.opacity=0});
    g.addEventListener("focus",()=>{hover=p.id;paint()});g.addEventListener("blur",()=>{hover=null;paint()});
    nodeEls[p.id]=g});
}
function paint(){
  const focus=hover??sel,rel=new Set([focus,...related(focus)]);
  P.forEach(p=>{const g=nodeEls[p.id],ok=matches(p);let o=ok?1:.15;if(ok&&hover!==null&&!rel.has(p.id))o=.45;
    g.style.opacity=o;g.classList.toggle("sel",p.id===sel);g.firstChild.setAttribute("r",p.id===sel?19:15)});
  edges.forEach((e,i)=>{const l=edgeEls[i],hot=e.a===focus||e.b===focus,ok=matches(byId[e.a])&&matches(byId[e.b]);
    l.style.opacity=ok?(hover!==null?(hot?1:.12):.6):.08;l.classList.toggle("hot",hot)});
  root.querySelectorAll(".row").forEach(r=>r.classList.toggle("sel",+r.dataset.id===sel));
}
function showTip(p,g){const b=g.getBoundingClientRect(),n=net.getBoundingClientRect();
  tip.innerHTML="<b>"+p.y+"</b> · "+p.j.split(" ").slice(0,3).join(" ").replace(/,$/,"")+"<br>"+p.t;
  tip.style.left=Math.min(Math.max(b.left-n.left+b.width/2-130,8),n.width-270)+"px";tip.style.top=(b.top-n.top+b.height+8)+"px";tip.style.opacity=1}
function card(){
  const p=byId[sel],c=root.querySelector("#card"),rel=related(sel);
  c.innerHTML=`<div class="meta"><span>${p.y}</span><span>${p.j}</span></div><h3>${p.t}</h3><div class="auth">${authHTML(p.au)}</div>
  <div class="tags">${p.tech.map(t=>`<span class="tag" style="border-left:6px solid var(--c-${t})">${TECH[t]}</span>`).join("")}${p.dom.map(d=>`<span class="tag">${DOM[d]}</span>`).join("")}</div>
  <a class="btn" href="https://doi.org/${p.doi}" target="_blank" rel="noopener">Read on publisher site</a>
  ${rel.length?`<div class="rel"><h4>Related papers</h4>${rel.map(i=>`<button type="button" data-go="${i}">${byId[i].y} · ${plain(byId[i].t)}</button>`).join("")}</div>`:""}`;
  c.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>select(+b.dataset.go)));
}
function select(id){sel=id;card();paint()}
function chips(){
  const mk=(box,map,set,colour)=>{const w=root.querySelector(box);w.querySelectorAll(".chip").forEach(x=>x.remove());
    Object.entries(map).forEach(([k,n])=>{const cnt=P.filter(p=>(colour?p.tech:p.dom).includes(k)).length;
      const b=document.createElement("button");b.className="chip";b.type="button";b.setAttribute("aria-pressed",!set.size||set.has(k));
      b.innerHTML=(colour?`<span class="dot" style="background:var(--c-${k})"></span>`:"")+`${n} (${cnt})`;
      b.addEventListener("click",()=>{set.has(k)?set.delete(k):set.add(k);chips();paint();list()});w.appendChild(b)})};
  mk("#tchips",TECH,tAct,true);mk("#dchips",DOM,dAct,false);
}
function list(){
  const L=root.querySelector("#list");L.innerHTML="";let last=null,n=0;
  [...P].sort((a,b)=>b.y-a.y||a.id-b.id).filter(matches).forEach(p=>{n++;
    if(p.y!==last){const h=document.createElement("div");h.className="yr";h.textContent=p.y;L.appendChild(h);last=p.y}
    const r=document.createElement("div");r.className="row";r.dataset.id=p.id;r.id="p-"+p.id;
    r.innerHTML=`<span class="sw" style="background:var(--c-${main(p)})"></span><span><span class="t"><a href="https://doi.org/${p.doi}" target="_blank" rel="noopener">${p.t}</a></span><br><span class="s">${authHTML(p.au)}<br>${p.j}</span></span><button type="button" class="pick" aria-label="Show on map: ${plain(p.t).replace(/"/g,"")}">On map</button>`;
    r.querySelector(".pick").addEventListener("click",()=>{select(p.id);net.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"start"})});
    r.addEventListener("mouseenter",()=>{hover=p.id;paint()});r.addEventListener("mouseleave",()=>{hover=null;paint()});
    L.appendChild(r)});
  root.querySelector("#count").textContent=n+" of "+P.length+" papers, newest first";
  paint();
}
build();chips();card();list();
})();
