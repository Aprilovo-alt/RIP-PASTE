const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const piecesEl=$("#pieces"), stage=$("#stage"), empty=$("#emptyState"), count=$("#count");
let selected=null, color="#f6f0df", edge="soft", font="Georgia, serif", size=42, z=1, id=0;

function updateCount(){count.textContent=piecesEl.children.length;empty.style.display=piecesEl.children.length?"none":"flex"}
function selectPiece(el){$$(".piece").forEach(p=>p.classList.remove("selected"));selected=el;if(el)el.classList.add("selected")}
function randomPos(el){
  const r=stage.getBoundingClientRect(), w=el.offsetWidth, h=el.offsetHeight;
  const x=Math.max(10,Math.random()*(r.width-w-20)+10), y=Math.max(10,Math.random()*(r.height-h-20)+10);
  el.style.left=x+"px";el.style.top=y+"px";
}
function makePiece(text){
  if(!text.trim())return;
  const el=document.createElement("div"); el.className="piece "+edge;
  el.dataset.rot=(Math.random()*10-5).toFixed(2); el.style.transform=`rotate(${el.dataset.rot}deg)`;
  el.style.zIndex=++z; el.dataset.id=++id;
  const paper=document.createElement("div");paper.className="piece-paper";paper.style.setProperty("--paper",color);
  const span=document.createElement("div");span.className="piece-text";span.textContent=text;
  span.style.fontFamily=font;span.style.fontSize=size+"px";
  const mark=document.createElement("small");mark.textContent=String(id).padStart(2,"0");
  paper.append(span,mark);el.append(paper);piecesEl.append(el);
  requestAnimationFrame(()=>randomPos(el)); selectPiece(el); updateCount(); bindDrag(el);
}
function bindDrag(el){
  let sx=0,sy=0,lx=0,ly=0,drag=false;
  const down=e=>{e.preventDefault();selectPiece(el);el.style.zIndex=++z;drag=true;const p=e.touches?e.touches[0]:e;sx=p.clientX;sy=p.clientY;lx=parseFloat(el.style.left)||0;ly=parseFloat(el.style.top)||0};
  const move=e=>{if(!drag)return;const p=e.touches?e.touches[0]:e;el.style.left=(lx+p.clientX-sx)+"px";el.style.top=(ly+p.clientY-sy)+"px"};
  const up=()=>drag=false;
  el.addEventListener("mousedown",down);el.addEventListener("touchstart",down,{passive:false});
  window.addEventListener("mousemove",move);window.addEventListener("touchmove",move,{passive:false});
  window.addEventListener("mouseup",up);window.addEventListener("touchend",up);
}
$("#addBtn").onclick=()=>makePiece($("#textInput").value);
$("#textInput").addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter")makePiece(e.target.value)});
$$("#paperColors button").forEach(b=>b.onclick=()=>{color=b.dataset.color;if(selected)selected.querySelector(".piece-paper").style.setProperty("--paper",color)});
$$(".edge").forEach(b=>b.onclick=()=>{edge=b.dataset.edge;$$(".edge").forEach(x=>x.classList.remove("active"));b.classList.add("active");if(selected){selected.classList.remove("soft","rough","sharp");selected.classList.add(edge)}});
$("#fontSelect").onchange=e=>{font=e.target.value;if(selected)selected.querySelector(".piece-text").style.fontFamily=font};
$("#sizeRange").oninput=e=>{size=e.target.value;$("#sizeValue").textContent=size;if(selected)selected.querySelector(".piece-text").style.fontSize=size+"px"};
$("#rotateLeft").onclick=()=>rotate(-3);$("#rotateRight").onclick=()=>rotate(3);
function rotate(d){if(!selected)return;let r=parseFloat(selected.dataset.rot)||0;r+=d;selected.dataset.rot=r;selected.style.transform=`rotate(${r}deg)`}
$("#frontBtn").onclick=()=>{if(selected)selected.style.zIndex=++z};
$("#backBtn").onclick=()=>{if(selected)selected.style.zIndex=1};
$("#deleteBtn").onclick=()=>{if(selected){selected.remove();selected=null;updateCount()}};
$("#clearBtn").onclick=()=>{if(confirm("Clear the whole collage?")){piecesEl.innerHTML="";selected=null;updateCount()}};
stage.addEventListener("mousedown",e=>{if(e.target===stage||e.target.classList.contains("paper-bg"))selectPiece(null)});
$("#exportBtn").onclick=()=>{
  const r=stage.getBoundingClientRect(), scale=2, c=document.createElement("canvas");c.width=r.width*scale;c.height=r.height*scale;const x=c.getContext("2d");x.scale(scale,scale);
  x.fillStyle="#e7dfcf";x.fillRect(0,0,r.width,r.height);
  x.globalAlpha=.18;for(let yy=0;yy<r.height;yy+=7)for(let xx=0;xx<r.width;xx+=7){x.fillStyle="#777";x.fillRect(xx,yy,1,1)}x.globalAlpha=1;
  const list=[...piecesEl.children].sort((a,b)=>(+a.style.zIndex)-(+b.style.zIndex));
  list.forEach(el=>{const paper=el.querySelector(".piece-paper"),text=el.querySelector(".piece-text"),er=el.getBoundingClientRect();const sr=stage.getBoundingClientRect();const cx=er.left-sr.left+er.width/2,cy=er.top-sr.top+er.height/2; x.save();x.translate(cx,cy);x.rotate((parseFloat(el.dataset.rot)||0)*Math.PI/180);
    x.shadowColor="rgba(0,0,0,.18)";x.shadowBlur=4;x.shadowOffsetX=2;x.shadowOffsetY=3;x.fillStyle=getComputedStyle(paper).getPropertyValue("--paper")||"#f6f0df";
    const w=paper.offsetWidth,h=paper.offsetHeight;x.fillRect(-w/2,-h/2,w,h);x.shadowColor="transparent";
    x.fillStyle="#171614";x.textAlign="center";x.textBaseline="middle";x.font=getComputedStyle(text).font;const lines=text.textContent.split("\n"),lh=size*1.05;lines.forEach((line,i)=>x.fillText(line,0,(i-(lines.length-1)/2)*lh));
    x.restore()});
  const a=document.createElement("a");a.download="rip-and-paste.png";a.href=c.toDataURL("image/png");a.click();
};
updateCount();