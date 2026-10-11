const ROLES={
"Project Head":["Approved proposal","Narrative report","Result of evaluation"],
"Co-Chair":["Letter from the Project Head confirming your organization as Co-Chair","Narrative report","Result of evaluation"],
"Contributor":["Letter from the Project Head identifying your organization's duties or committee role","Narrative report","Result of evaluation"],
"Attendee":["Proof of invitation or registration for the organization","Proof of attendance as an organization","Narrative report"]};
const ROLE_DESC={"Project Head":"Your organization leads, plans, coordinates, and manages the activity.","Co-Chair":"Your organization shares leadership with another organization or body.","Contributor":"Your organization handles an assigned committee, service, or responsibility.","Attendee":"Your organization joins as an invited or registered participant, with no organizing role."};
const SCOPES=["International","National","Regional/District","City-Wide","University-Wide","College/Departmental","Organization-Only"];
const PTS={"Project Head":[10,10,9,8,7,6,5],"Co-Chair":[9,9,8,7,6,5,4],"Contributor":[8,8,7,6,5,4,3],"Attendee":[5,5,4,3,2,1,0.5]};
const REC=[10,8,6,5,3,2,1];
const AUDITS=["Accreditation audit","First semester audit","Turnover audit"];

let S={role:"Project Head",area:0,log:[],tab:"mars",month:new Date().toISOString().slice(0,7)};
let DB=null,DATA={};
const IDB=()=>new Promise((res,rej)=>{const r=indexedDB.open("sg2files",1);r.onupgradeneeded=()=>r.result.createObjectStore("f");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const AS={
 async upload(f){const d=await IDB(),id=(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)).replace(/[^a-z0-9]/gi,"");
  await new Promise((res,rej)=>{const t=d.transaction("f","readwrite");t.objectStore("f").put(f,id);t.oncomplete=res;t.onerror=()=>rej(t.error)});return{id,sizeBytes:f.size}},
 async delete(id){const d=await IDB();await new Promise((res,rej)=>{const t=d.transaction("f","readwrite");t.objectStore("f").delete(id);t.oncomplete=res;t.onerror=()=>rej(t.error)})}};
async function openFile(id){const d=await IDB(),r=d.transaction("f").objectStore("f").get(id);
 r.onsuccess=()=>{const f=r.result;if(!f){setmsg("This file isn't stored on this device.");return}const a=document.createElement("a");a.href=URL.createObjectURL(f);a.download=f.name||"file";document.body.appendChild(a);a.click();a.remove()}}
try{DATA=JSON.parse(localStorage.getItem("sg2d")||"{}")}catch(e){}
const id=(t,k)=>((t==="mars"?S.month.replace("-","")+"_":"")+k).replace(/[^A-Za-z0-9_]/g,"");
const ent=k=>DATA[k]||{done:false,files:[]};
const done=k=>{const e=DATA[k];return !!e&&(!!e.done||(e.files||[]).length>0)};
const setmsg=t=>{const m=document.getElementById("msg");m.textContent=t;m.hidden=!t};
async function put(k,e){DATA[k]=e;render();if(DB){try{await DB.collection("items").doc(k).set(e)}catch(x){setmsg("Could not save: "+(x.message||x.code))}}else{try{localStorage.setItem("sg2d",JSON.stringify(DATA))}catch(x){}}}
async function upload(k,files){if(!AS){setmsg("Uploads need edit access to this page.");return}
 const e=ent(k),n={done:!!e.done,files:(e.files||[]).slice()};
 for(const f of files){try{const r=await AS.upload(f);n.files.push({id:r.id,name:f.name,size:r.sizeBytes,at:Date.now()})}catch(x){setmsg("Could not upload "+f.name+": "+(x.code==="unsupported_type"?"this file type isn't supported. Save Word/Excel files as PDF first.":(x.message||x.code)))}}
 put(k,n)}
async function rmFile(k,fid){const e=ent(k);try{if(AS)await AS.delete(fid)}catch(x){}put(k,{done:!!e.done,files:(e.files||[]).filter(f=>f.id!==fid)})}
try{const x=localStorage.getItem("sg2");if(x)S=Object.assign(S,JSON.parse(x))}catch(e){}
const save=()=>{try{localStorage.setItem("sg2",JSON.stringify(S))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

const AREAS=[
["Organization-only","Activity primarily intended for your organization's members or internal operations.","general assembly, internal training, team-building."],
["College/Departmental","Activity involving or serving students within a college or department.","college seminar, departmental competition, college orientation."],
["University-wide","Activity involving multiple colleges or the university community as a whole.","university-wide seminar, competition, or campaign."],
["City-wide","Activity involving participants, partners, or beneficiaries from different institutions within San Pablo City.","city outreach, inter-school competition, city-wide campaign."],
["Regional/District","Activity involving participants, organizations, or institutions from different areas within the region or district.","regional conference, district competition, regional leadership program."],
["National/International","Activity involving national or international participants, organizations, institutions, or partners.","national conference, international webinar, national competition."]];

function groups(tab){
 const A=AREAS[S.area][0],R=S.role;
 if(tab==="mars")return[
  {h:"1. Classify the activity",area:1,info:1,i:[
   ["a","Meets the essential indicator for "+A+" (described above)"],
   ["b","Declared role: "+R+". It must match your actual responsibility and be backed by official documents (no self-declaring a higher role)"],
   ["c","Check the points for "+A+" and "+R+" on the Points tab"]]},
  {h:"2. Documents for "+R,s:"All must be in. Partial submission isn't credited, and the activity earns no points until it's complete.",role:1,i:ROLES[R].map((t,n)=>["d_"+R+n,t])},
  {h:"3. Submit the MARS",s:"Weekends and non-class days count toward the 15 days. The deadline shifts for official holidays or class suspensions.",i:[
   ["s1","Two complete copies submitted: 1 for CIG, 1 for your organization's record"],
   ["s2","Attachments included (photos, certificates, permits, etc.)"],
   ["s3","Submitted within the first 15 calendar days of the following month (e.g. an October MARS by November 15)"]]},
  {h:"If you missed the deadline",info:1,s:"Late MARS means suspension from activities and a 50% deduction from that month's score.",i:[
   ["l","Submit the MARS together with a justification letter explaining the delay. The suspension stays until both are in."]]},
  {h:"Month with no activity",s:"Replaces the MARS when you conducted or joined nothing.",i:[
   ["n1","Signed no-activity letter submitted (names the month; signed by the Adviser, the CSD Director, and the VP of Student Affairs and Services)",1]]}];
 if(tab==="fin"){
  const g=AUDITS.map((a,n)=>({h:a,s:n===1?"Covers only transactions not covered by a previous audit.":"A certificate doesn't excuse other transactions from review.",i:[
   ["f"+n+"a","Financial statement and supporting documents submitted on time: complete, properly signed, duly supported"],
   ["f"+n+"b",n===1?"Certificate of No Activity, if there were no transactions":"Certificates, if applicable: No Activity, No Fund, or No EED",1],
   ["f"+n+"c","All audit remarks and revisions addressed"]]}));
  g.push({h:"EED activities",i:[["e1","EED Summary Report filed for each EED activity (sales, costs, relevant expenses, resulting profit)",1]]});
  g.push({h:"Final audit status",s:"Needed to join the Gawad Hiraya event.",i:[
   ["x1","Clean audit opinion received after review and revisions"],["x2","Final audit clearance obtained"]]});
  return g}
 if(tab==="qual")return[
  {h:"What SG2 looks at",info:1,s:"SG2 rewards consistent compliance, not the number of activities.",i:[
   ["q1","MARS submitted on time every month"],
   ["q2","Activities classified by the right scope and declared role"],
   ["q3","All required documents complete before an activity is credited"],
   ["q4","Clean audit opinion on your financial statements"],
   ["q5","Late or incomplete submissions can affect your compliance status"]]},
  {h:"Gawad Hiraya",s:"You can't join the event without audit clearance, however many points you have.",i:[
   ["g1","All required financial audits completed (Accreditation, First Semester, Turnover)"],
   ["g2","Final audit clearance obtained"],
   ["g3","Activity and recognition points recorded from your monthly MARS (official, documented awards only)"]]}];
 return[]}

const TABS=[["mars","Monthly MARS"],["fin","Finances"],["qual","Qualify"],["pts","Points"]];
const cnt=t=>{let d=0,n=0;groups(t).forEach(g=>{if(!g.info)g.i.forEach(([k,x,o])=>{if(o)return;n++;if(done(id(t,k)))d++})});return[d,n]};

function render(){
 let D=0,N=0;["mars","fin","qual"].forEach(t=>{const[d,n]=cnt(t);D+=d;N+=n});
 const p=N?Math.round(D/N*100):0;
 document.getElementById("pct").textContent=p+"%";
 document.getElementById("arc").style.strokeDashoffset=276.46*(1-p/100);
 document.getElementById("sum").innerHTML=p===100?'<span class="sealed">All required items done. You are ready to submit.</span>':D+" of "+N+" required items done";
 document.getElementById("tabs").innerHTML=TABS.map(([id,l])=>{const c=id==="pts"?"":' <small>'+cnt(id).join("/")+'</small>';return'<button role="tab" aria-selected="'+(S.tab===id)+'" data-t="'+id+'">'+l+c+'</button>'}).join("");
 const v=document.getElementById("view");
 if(S.tab==="pts"){v.innerHTML=pointsView();return}
 let h="";
 h+='<div class="note o">Attach each completed file to its item and the item is marked done. Any file type works. Files are saved in this browser on this device only. <b class="req">*</b> means required; items without it only apply in some cases.'+'</div>';
 if(S.tab==="mars")h+='<div class="row"><label>Reporting month <input type="month" id="month" value="'+S.month+'"></label></div><div class="note b"><b>Late MARS:</b> the organization is suspended from activities until it submits the MARS with a justification letter, and 50% is deducted from that month\'s score.</div>';
 if(S.tab==="fin")h+='<div class="note w">Missing financial compliance can suspend your organization from activities, and you can\'t join the Gawad Hiraya event without audit clearance.</div>';
 groups(S.tab).forEach(g=>{
  const q=g.i.filter(x=>!x[2]),d=q.filter(([k])=>done(id(S.tab,k))).length,n=q.length;
  h+='<section class="g"><h2>'+g.h+'</h2>';
  if(g.area)h+='<div class="row"><select id="area" aria-label="Activity scope">'+AREAS.map((x,n)=>'<option value="'+n+'"'+(n===S.area?" selected":"")+'>'+x[0]+'</option>').join("")+'</select></div><p class="sub">'+AREAS[S.area][1]+' Examples: '+AREAS[S.area][2]+'</p>';
  if(g.role)h+='<div class="row"><select id="role" aria-label="Declared role">'+Object.keys(ROLES).map(r=>'<option'+(r===S.role?" selected":"")+'>'+r+'</option>').join("")+'</select></div><p class="sub">'+ROLE_DESC[S.role]+' '+(g.s||"")+'</p>';
  else if(g.s)h+='<p class="sub">'+g.s+'</p>';
  if(!g.info&&n)h+='<div class="bar"><i style="width:'+(d/n*100)+'%"></i></div>';
  if(g.info)h+='<ul class="info">'+g.i.map(([k,t])=>'<li>'+t+'</li>').join("")+'</ul>';else g.i.forEach(([k,t,o])=>{const kk=id(S.tab,k),fl=ent(kk).files||[];
   h+='<div class="r"><div class="it"><label class="ck"><input type="checkbox" data-k="'+kk+'"'+(done(kk)?" checked":"")+'><span>'+t+(o?'':'<b class="req" title="Required">*</b>')+'</span></label>'+(AS?'<label class="att">Attach<input type="file" hidden multiple data-up="'+kk+'"></label>':'')+'</div>'+
   (fl.length?'<ul class="fl">'+fl.map(f=>'<li><a href="#" data-open="'+f.id+'">'+esc(f.name)+'</a> <small>'+Math.max(1,Math.round(f.size/1024))+' KB</small> <button data-fk="'+kk+'" data-fid="'+f.id+'">Remove</button></li>').join("")+'</ul>':"")+'</div>'});
  h+='</section>'});
 v.innerHTML=h}

function pointsView(){
 const tot=S.log.reduce((a,e)=>a+e.p,0);
 let h='<section class="g"><h2>Points calculator</h2><p class="sub">Add each documented activity or award to see your running Gawad Hiraya total. Points count only after the MARS documents are complete and verified.</p>'+
 '<div class="row"><input type="text" id="nm" placeholder="Activity or award name" aria-label="Name"><select id="sc">'+SCOPES.map((s,i)=>'<option value="'+i+'">'+s+'</option>').join("")+'</select><select id="rl">'+Object.keys(ROLES).map(r=>'<option>'+r+'</option>').join("")+'<option value="Award">Award / recognition</option></select><button class="btn" id="add">Add</button></div>'+
 '<div>'+(S.log.length?S.log.map((e,i)=>'<div class="log"><span>'+esc(e.n||"Untitled")+' <span style="color:var(--mute)">· '+esc(e.s)+', '+esc(e.r)+'</span></span><span><b>'+e.p+'</b> <button data-rm="'+i+'" aria-label="Remove">Remove</button></span></div>').join(""):'<p class="sub">No entries yet.</p>')+'</div>'+
 '<p>Total points: <span class="total">'+tot+'</span></p></section>';
 h+='<section class="g"><h2>Activity points</h2><div class="wrap"><table><tr><th>Role</th><th>Intl/ National</th><th>Regional</th><th>City</th><th>Univ.</th><th>College</th><th>Org</th></tr>'+
 Object.keys(PTS).map(r=>'<tr><td>'+r+'</td>'+[1,2,3,4,5,6].map(i=>'<td>'+PTS[r][i]+'</td>').join("")+'</tr>').join("")+'</table></div></section>';
 h+='<section class="g"><h2>Recognition points</h2><div class="wrap"><table><tr>'+SCOPES.map(s=>'<th>'+s+'</th>').join("")+'</tr><tr>'+REC.map(x=>'<td>'+x+'</td>').join("")+'</tr></table></div><p class="sub">Only official, documented awards count. Awards given just for attendance do not count.</p></section>';
 return h}

document.addEventListener("click",e=>{
 const t=e.target;
 if(t.dataset.open){e.preventDefault();openFile(t.dataset.open);return}
 if(t.dataset.t){S.tab=t.dataset.t;save();render()}
 if(t.dataset.rm){S.log.splice(+t.dataset.rm,1);save();render()}
 if(t.id==="add"){const i=+document.getElementById("sc").value,r=document.getElementById("rl").value;
  S.log.push({n:document.getElementById("nm").value.trim(),s:SCOPES[i],r:r==="Award"?"Recognition":r,p:r==="Award"?REC[i]:PTS[r][i]});save();render()}
 if(t.dataset.fk){if(t.dataset.arm){rmFile(t.dataset.fk,t.dataset.fid)}else{t.dataset.arm=1;t.textContent="Sure?";setTimeout(()=>{t.textContent="Remove";delete t.dataset.arm},3000)}}
 if(t.id==="reset"){if(t.dataset.arm){S.log=[];save();t.textContent="Clear points log";delete t.dataset.arm;render()}else{t.dataset.arm=1;t.textContent="Click again to confirm";setTimeout(()=>{t.textContent="Clear points log";delete t.dataset.arm},4000)}}
});
document.addEventListener("change",e=>{
 const t=e.target;
 if(t.dataset.k){const e=ent(t.dataset.k);if(!t.checked&&(e.files||[]).length){render();return}const y=scrollY;put(t.dataset.k,{done:t.checked,files:e.files||[]});scrollTo(0,y)}
 if(t.dataset.up&&t.files.length){upload(t.dataset.up,Array.from(t.files));t.value=""}
 if(t.id==="month"&&t.value){S.month=t.value;save();render()}
 if(t.id==="area"){S.area=+t.value;save();render()}
 if(t.id==="role"){S.role=t.value;save();render()}
});
render();
(async()=>{
if(false)DB.collection("items").onSnapshot(sn=>{DATA={};sn.docs.forEach(d=>{DATA[d.id]=d.data()});if(S.tab!=="pts")render()},e=>setmsg("Could not load shared data: "+(e.message||e.code)));
 render();
})();
