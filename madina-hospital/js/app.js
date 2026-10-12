/* Madina Hospital: single-page app. Data lives in localStorage (demo only). */
const K='madina_v1',$=s=>document.querySelector(s),T=()=>new Date().toISOString().slice(0,10);
const day=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const uid=p=>p+Math.random().toString(36).slice(2,7);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function seed(){return{
users:[{id:'u1',name:'Admin Aisha',email:'admin@madina.com',pass:'admin123',role:'admin'},
{id:'u2',name:'Reema Khan',email:'reception@madina.com',pass:'desk123',role:'reception',salary:25000,duty:'Front desk, walk-in bookings, patient records'},
{id:'u3',name:'Dr. Ameer',email:'doctor@madina.com',pass:'doctor123',role:'doctor',doctorId:'d1'},
{id:'u4',name:'Ravi Kumar',email:'patient@madina.com',pass:'patient123',role:'patient',patientId:'p1'},
{id:'u5',name:'Dr. Priya Nair',email:'priya.nair@madina.com',pass:'doctor123',role:'doctor',doctorId:'d2'},
{id:'u6',name:'Dr. Imran Khan',email:'imran.khan@madina.com',pass:'doctor123',role:'doctor',doctorId:'d3'}],
doctors:[{id:'d1',name:'Dr. Ameer',dept:'General Medicine',fee:500,qual:'MBBS, MD',exp:12,phone:'98480 10001'},{id:'d2',name:'Dr. Priya Nair',dept:'Cardiology',fee:900,qual:'MBBS, DM Cardiology',exp:15,phone:'98480 10002'},{id:'d3',name:'Dr. Imran Khan',dept:'Orthopaedics',fee:700,qual:'MBBS, MS Ortho',exp:9,phone:'98480 10003'}],
patients:[{id:'p1',name:'Ravi Kumar',age:45,phone:'98480 11223',history:'Hypertension'},{id:'p2',name:'Lakshmi Devi',age:62,phone:'98490 44556',history:'Type 2 diabetes'}],
appts:[{id:'a1',patientId:'p1',doctorId:'d1',date:T(),time:'10:00',reason:'BP follow-up',mode:'Online',status:'Scheduled'},{id:'a2',patientId:'p2',doctorId:'d1',date:T(),time:'11:30',reason:'Sugar review',mode:'Offline',status:'Scheduled'},{id:'a3',patientId:'p2',doctorId:'d2',date:day(1),time:'09:30',reason:'Chest check',mode:'Offline',status:'Scheduled'}],
rx:[{id:'r1',patientId:'p1',doctorId:'d1',date:day(-30),text:'Amlodipine 5mg once daily for 30 days'}]}}

let D,me=JSON.parse(sessionStorage.getItem('mh_me')||'null'),view='dash',tab='in';
const save=()=>{try{localStorage.setItem(K,JSON.stringify(D));return true}catch(e){return false}};
/* Reload the latest saved data every time, so two tabs never overwrite each other */
function load(){const raw=localStorage.getItem(K);D=raw?JSON.parse(raw):seed();let ch=!raw;
D.doctors.forEach(d=>{if(!D.users.some(u=>u.doctorId===d.id)){ /* every doctor listed by admin gets a login */
let base=d.name.replace(/^dr\.?\s*/i,'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,'')||'doctor',em=base+'@madina.com',n=1;
while(D.users.some(u=>u.email===em))em=base+(++n)+'@madina.com';
D.users.push({id:uid('u'),name:d.name,email:em,pass:'doctor123',role:'doctor',doctorId:d.id});ch=true}});
if(ch)save()}
load();
const commit=m=>{if(!save())return toast('Could not save: browser storage is full.');render();toast(m)};
const setTheme=t=>{document.documentElement.dataset.theme=t;localStorage.setItem('mh_theme',t)};
setTheme(localStorage.getItem('mh_theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));

const nm=(l,id)=>esc((l.find(x=>x.id===id)||{name:'Removed'}).name);
const fmt=d=>new Date(d+'T00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
const inr=n=>'₹'+Number(n).toLocaleString('en-IN');
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2500)};
const modal=h=>{const d=$('#dlg');d.innerHTML=h;if(!d.open)d.showModal()};
const fld=(l,i,t='text',x='')=>`<div class="f"><label for="${i}">${l}</label><input id="${i}" type="${t}" ${x}></div>`;
const sel=(l,i,o)=>`<div class="f"><label for="${i}">${l}</label><select id="${i}">${o}</select></div>`;
const opts=(l,ph)=>`<option value="">${ph}</option>`+l.map(x=>`<option value="${x.id}">${esc(x.name)}${x.dept?', '+esc(x.dept):''}</option>`).join('');
const bd=s=>`<span class="b ${s.toLowerCase()}">${s}</span>`;
const head=(t,p)=>`<div class="ph"><h1>${t}</h1><p>${p}</p></div>`;
const tbl=(h,r,e='Nothing here yet.')=>`<div class="tw"><table><thead><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${r.length?r.map(c=>`<tr>${c.map(x=>`<td>${x}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${h.length}" class="em">${e}</td></tr>`}</tbody></table></div>`;

/* Role-based data scoping */
const apptsFor=()=>D.appts.filter(a=>me.role==='doctor'?a.doctorId===me.doctorId:me.role==='patient'?a.patientId===me.patientId:true).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
const patsFor=()=>me.role==='doctor'?D.patients.filter(p=>D.appts.some(a=>a.patientId===p.id&&a.doctorId===me.doctorId)||D.rx.some(r=>r.patientId===p.id&&r.doctorId===me.doctorId)):D.patients;
const NAV={admin:[['dash','Overview'],['appts','Appointments'],['pats','Patients'],['docs','Doctors'],['staff','Staff']],reception:[['appts','Appointments'],['pats','Patients']],doctor:[['dash','Overview'],['pats','My patients'],['appts','My appointments']],patient:[['dash','Overview'],['book','Book online'],['appts','My appointments'],['rx','Prescriptions']]};

const apptTable=L=>tbl(['Date','Time','Patient','Doctor','Reason','Type','Status',''],L.map(a=>{
const s=a.status==='Scheduled',b=(act,t,c='')=>`<button class="btn s ${c}" data-act="${act}" data-id="${a.id}">${t}</button>`;let x='';
if(s)x=me.role==='doctor'?b('done','Complete')+b('rxp','Prescribe','g'):me.role==='patient'?b('cancel','Cancel','bad'):b('done','Complete')+b('cancel','Cancel','bad');
if(me.role==='admin')x+=b('delappt','Delete','bad');
return[fmt(a.date),a.time,nm(D.patients,a.patientId),nm(D.doctors,a.doctorId),esc(a.reason),bd(a.mode),bd(a.status),`<div class="ac">${x}</div>`]}),'No appointments yet.');

const bookForm=m=>`<form class="card g" data-form="book" data-mode="${m}"><h2>${m==='Online'?'Book an online appointment':'Book offline appointment (walk-in)'}</h2>${m==='Online'?'':sel('Patient','bp',opts(D.patients,'Select patient'))}${sel('Doctor','bd',opts(D.doctors,'Select doctor'))}${fld('Date','bdt','date',`min="${T()}"`)}${fld('Time','btm','time')}${fld('Reason for visit','brs')}<p class="err" role="alert"></p><button class="btn">Book appointment</button></form>`;

const patList=(q='')=>tbl(['Name','Age','Phone','History',''],patsFor().filter(p=>(p.name+p.phone).toLowerCase().includes(q.toLowerCase())).map(p=>[esc(p.name),p.age,esc(p.phone),esc(p.history),`<div class="ac"><button class="btn s" data-act="view" data-id="${p.id}">Records</button>${me.role==='admin'?`<button class="btn s bad" data-act="delpat" data-id="${p.id}">Delete</button>`:''}</div>`]),'No patients found.');
const rxItem=r=>`<div class="rx"><b>${fmt(r.date)}</b> <small>${r.doctorId?nm(D.doctors,r.doctorId):'Past record'}</small>${r.text?`<p>${esc(r.text)}</p>`:''}${r.file?`<div class="fl">${r.file.type.startsWith('image/')?`<img src="${r.file.data}" alt="Prescription image">`:''}<a class="btn s g" href="${r.file.data}" download="${esc(r.file.name)}">Download ${esc(r.file.name)}</a></div>`:''}</div>`;

const records=id=>{const p=D.patients.find(x=>x.id===id),R=D.rx.filter(r=>r.patientId===id).sort((a,b)=>b.date.localeCompare(a.date));
modal(`<h2>${esc(p.name)}</h2><p class="mut">${p.age} years, ${esc(p.phone)}</p><form class="g" data-form="hist" data-p="${id}"><h3 style="grid-column:1/-1">Medical history</h3><div class="f" style="grid-column:1/-1"><label for="hx">Update the patient's history</label><textarea id="hx" rows="3">${esc(p.history)}</textarea></div><button class="btn s">Update history</button></form><h3>Prescriptions</h3>${R.length?R.map(rxItem).join(''):'<p class="mut">No prescriptions yet.</p>'}<form class="g" data-form="rx" data-p="${id}" style="margin-top:1rem">${fld(me.role==='doctor'?'New prescription':'Add past prescription','rxt')}${fld('Attach PDF or image (optional, max 1 MB)','rxf','file','accept="image/*,application/pdf"')}<p class="err" role="alert"></p><button class="btn s">Save prescription</button></form><div class="da"><button class="btn s g" data-act="close">Close</button></div>`)};

const V={
dash(){const A=apptsFor(),P=patsFor(),td=A.filter(a=>a.date===T()&&a.status==='Scheduled').length;let s;
if(me.role==='patient')s=[[A.filter(a=>a.status==='Scheduled'&&a.date>=T()).length,'Upcoming appointments'],[D.rx.filter(r=>r.patientId===me.patientId).length,'Prescriptions']];
else if(me.role==='doctor')s=[[P.length,'My patients'],[td,'Appointments today'],[D.rx.filter(r=>r.doctorId===me.doctorId).length,'Prescriptions written']];
else s=[[P.length,'Patients'],[D.doctors.length,'Doctors'],[td,'Appointments today'],[A.filter(a=>a.mode==='Online').length+' / '+A.filter(a=>a.mode==='Offline').length,'Online / offline bookings']];
const mx=Math.max(1,...D.doctors.map(d=>D.appts.filter(a=>a.doctorId===d.id).length));
const ch=me.role==='admin'?`<section class="card"><h2>Appointments per doctor</h2>${D.doctors.map(d=>{const n=D.appts.filter(a=>a.doctorId===d.id).length;return`<div class="bar"><span>${esc(d.name)}</span><i style="--w:${n/mx*100}%"></i><b>${n}</b></div>`}).join('')}</section>`:'';
return head('Hello, '+esc(me.name),'Here is your day at Madina Hospital.')+`<div class="stats">${s.map(x=>`<div class="stat"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div>${ch}<section class="card"><h2>Upcoming appointments</h2>${apptTable(A.filter(a=>a.status==='Scheduled').slice(0,5))}</section>`},
book(){return head('Book online','Pick a doctor and a time that suits you.')+bookForm('Online')},
appts(){return head('Appointments',me.role==='patient'?'Your booked visits.':me.role==='doctor'?'Appointments booked with you.':'Book walk-ins and manage every appointment.')+(me.role==='reception'||me.role==='admin'?bookForm('Offline'):'')+`<section class="card"><h2>${me.role==='patient'?'My appointments':'Appointment list'}</h2>${apptTable(apptsFor())}</section>`},
pats(){const add=me.role==='doctor'?'':`<form class="card g" data-form="pat"><h2>Register a patient</h2>${fld('Full name','pn')}${fld('Age','pa','number','min="0" max="120"')}${fld('Phone','pp','tel')}${fld('Medical history','ph')}${fld('Past prescription (optional)','pr')}<p class="err" role="alert"></p><button class="btn">Save patient</button></form>`;
return head(me.role==='doctor'?'My patients':'Patients',me.role==='doctor'?'Patients who have booked with you.':'Enter patient data and past prescriptions.')+add+`<section class="card"><h2>Patient list</h2><input class="srch" placeholder="Search by name or phone" aria-label="Search patients" data-search><div id="pl">${patList()}</div></section>`},
docs(){return head('Doctors','Add or remove doctors and their logins.')+`<form class="card g" data-form="doc"><h2>Add a doctor</h2>${fld('Name','dn')}${fld('Department','dd')}${fld('Qualification','dq')}${fld('Experience (years)','dx','number','min="0"')}${fld('Phone','dt','tel')}${fld('Fee (₹)','df','number','min="0"')}${fld('Login email','de','email')}${fld('Password','dp','password')}<p class="err" role="alert"></p><button class="btn">Add doctor</button></form><section class="card"><h2>All doctors</h2>${tbl(['Doctor','Department','Details','Login email','Password','Fee',''],D.doctors.map(d=>{const u=D.users.find(x=>x.doctorId===d.id)||{};return[esc(d.name),esc(d.dept),`${esc(d.qual||'—')}<br><small>${d.exp?d.exp+' years experience':'Experience not set'}, ${esc(d.phone||'no phone')}</small>`,esc(u.email||'—'),`<code>${esc(u.pass||'—')}</code>`,inr(d.fee),`<button class="btn s bad" data-act="deldoc" data-id="${d.id}">Remove</button>`]}))}</section>`},
staff(){return head('Staff','Manage staff logins, salaries and duties.')+`<form class="card g" data-form="staff"><h2>Add a staff member</h2>${fld('Name','tn')}${fld('Login email','te','email')}${fld('Password','tp','password')}${fld('Salary (₹ per month)','ts','number','min="0"')}${fld('Duties','tdu')}<p class="err" role="alert"></p><button class="btn">Add staff member</button></form><section class="card"><h2>Staff team</h2>${tbl(['Name','Login email','Password','Salary','Duties',''],D.users.filter(u=>u.role==='reception').map(u=>[esc(u.name),esc(u.email),`<code>${esc(u.pass)}</code>`,u.salary?inr(u.salary)+'/month':'—',esc(u.duty||'—'),`<button class="btn s bad" data-act="deluser" data-id="${u.id}">Remove</button>`]))}</section>`},
rx(){const R=D.rx.filter(r=>r.patientId===me.patientId).sort((a,b)=>b.date.localeCompare(a.date));return head('My prescriptions','Written by your doctors.')+`<section class="card">${R.length?R.map(rxItem).join(''):'<p class="mut">No prescriptions yet. They appear here after a consultation.</p>'}</section>`}};

const auth=()=>`<div class="auth"><div class="blob a"></div><div class="blob b"></div><button class="btn s g tg" data-act="theme">Light / Dark theme</button>
<main class="card ac2"><div class="lg"><svg class="logo"><use href="#logo"/></svg><div><h1>Madina Hospital</h1><p class="mut">Care you can trust</p></div></div>
<div class="tabs"><button data-act="tab" data-t="in" class="${tab==='in'?'on':''}">Log in</button><button data-act="tab" data-t="up" class="${tab==='up'?'on':''}">Patient sign up</button></div>`+
(tab==='in'?`<form class="g" data-form="login">${fld('Email','le','email','autocomplete="username"')}${fld('Password','lp','password','autocomplete="current-password"')}<p class="err" role="alert"></p><button class="btn">Log in</button>
<div class="demo"><b>Demo logins (click to fill)</b>${[['Admin','admin@madina.com','admin123'],['Receptionist','reception@madina.com','desk123'],['Doctor','doctor@madina.com','doctor123'],['Patient','patient@madina.com','patient123']].map(x=>`<button type="button" data-act="fill" data-e="${x[1]}" data-p="${x[2]}">${x[0]}: ${x[1]}</button>`).join('')}</div></form>`
:`<form class="g" data-form="signup">${fld('Full name','sn')}${fld('Age','sa','number','min="0" max="120"')}${fld('Phone','sph','tel')}${fld('Email','se','email')}${fld('Password (6+ characters)','sp','password')}<p class="err" role="alert"></p><button class="btn">Create account</button></form>`)+`</main></div>`;

const shell=()=>`<div class="app"><aside><div class="lg"><svg class="logo"><use href="#logo"/></svg><div><b>Madina Hospital</b><small>${me.role}</small></div></div><nav aria-label="Main">${NAV[me.role].map(([k,l])=>`<button data-act="nav" data-v="${k}" class="${view===k?'on':''}">${l}</button>`).join('')}</nav><div class="ub"><button class="btn s g" data-act="theme">Light / Dark theme</button><span>${esc(me.name)}</span><button class="btn s g" data-act="out">Log out</button></div></aside><main>${V[view]()}</main></div>`;
function render(){load();$('#app').innerHTML=me?shell():auth()}

const setA=(id,s)=>{D.appts.find(x=>x.id===id).status=s;commit('Appointment '+s.toLowerCase()+'.')};
const login=u=>{me=u;sessionStorage.setItem('mh_me',JSON.stringify(u));view=NAV[u.role][0][0]};

document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;load();const id=b.dataset.id;
({theme(){setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark')},
tab(){tab=b.dataset.t;render()},
fill(){$('#le').value=b.dataset.e;$('#lp').value=b.dataset.p},
nav(){view=b.dataset.v;render()},
out(){me=null;sessionStorage.removeItem('mh_me');tab='in';render()},
close(){$('#dlg').close()},
view(){records(id)},
rxp(){records(D.appts.find(x=>x.id===id).patientId)},
done(){setA(id,'Completed')},
cancel(){setA(id,'Cancelled')},
delappt(){if(confirm('Delete this appointment?')){D.appts=D.appts.filter(x=>x.id!==id);commit('Appointment deleted.')}},
delpat(){if(confirm('Delete this patient and all their records?')){D.patients=D.patients.filter(x=>x.id!==id);D.appts=D.appts.filter(x=>x.patientId!==id);D.rx=D.rx.filter(x=>x.patientId!==id);D.users=D.users.filter(x=>x.patientId!==id);commit('Patient deleted.')}},
deldoc(){if(confirm('Remove this doctor? Their appointments will be removed too.')){D.doctors=D.doctors.filter(x=>x.id!==id);D.appts=D.appts.filter(x=>x.doctorId!==id);D.users=D.users.filter(x=>x.doctorId!==id);commit('Doctor removed.')}},
deluser(){if(confirm('Remove this staff account?')){D.users=D.users.filter(x=>x.id!==id);commit('Staff account removed.')}}}[b.dataset.act]||(()=>{}))()});

document.addEventListener('input',e=>{if(e.target.matches('[data-search]'))$('#pl').innerHTML=patList(e.target.value)});

document.addEventListener('submit',e=>{e.preventDefault();load();const f=e.target,v=i=>(f.querySelector('#'+i)||{value:''}).value.trim(),er=m=>{const p=f.querySelector('.err');if(p)p.textContent=m},mail=i=>v(i).toLowerCase(),taken=m=>D.users.some(x=>x.email===m);
({login(){const u=D.users.find(x=>x.email===mail('le')&&x.pass===v('lp'));if(!u)return er('Wrong email or password. Check both and try again.');login(u);render()},
signup(){if(!v('sn')||!v('se')||v('sp').length<6)return er('Enter your name, email and a password of 6 or more characters.');if(taken(mail('se')))return er('This email already has an account. Log in instead.');
const p={id:uid('p'),name:v('sn'),age:+v('sa')||0,phone:v('sph'),history:''},u={id:uid('u'),name:p.name,email:mail('se'),pass:v('sp'),role:'patient',patientId:p.id};D.patients.push(p);D.users.push(u);save();login(u);render();toast('Welcome to Madina Hospital.')},
book(){const m=f.dataset.mode,p=m==='Online'?me.patientId:v('bp'),d=v('bd'),dt=v('bdt'),tm=v('btm'),r=v('brs');
if(!p||!d||!dt||!tm||!r)return er('Fill in every field to book.');if(dt<T())return er('Choose today or a later date.');
if(D.appts.some(a=>a.doctorId===d&&a.date===dt&&a.time===tm&&a.status==='Scheduled'))return er('This doctor is busy at that time. Pick another time.');
D.appts.push({id:uid('a'),patientId:p,doctorId:d,date:dt,time:tm,reason:r,mode:m,status:'Scheduled'});if(m==='Online')view='appts';commit(m+' appointment booked.')},
pat(){if(!v('pn')||!v('pp'))return er('Enter at least the patient name and phone number.');const p={id:uid('p'),name:v('pn'),age:+v('pa')||0,phone:v('pp'),history:v('ph')};D.patients.push(p);
if(v('pr'))D.rx.push({id:uid('r'),patientId:p.id,doctorId:null,date:T(),text:v('pr')});commit('Patient saved.')},
hist(){const p=D.patients.find(x=>x.id===f.dataset.p);p.history=v('hx');if(!save())return toast('Could not save: browser storage is full.');render();records(p.id);toast('Medical history updated.')},
async rx(){const fi=f.querySelector('#rxf'),file=fi&&fi.files[0];
if(!v('rxt')&&!file)return er('Write the prescription or attach a PDF or image.');
if(file&&!(file.type==='application/pdf'||file.type.startsWith('image/')))return er('Attach a PDF or an image file.');
if(file&&file.size>1048576)return er('This file is larger than 1 MB. Choose a smaller file.');
const r={id:uid('r'),patientId:f.dataset.p,doctorId:me.role==='doctor'?me.doctorId:null,date:T(),text:v('rxt')};
if(file)r.file={name:file.name,type:file.type,data:await new Promise((ok,no)=>{const fr=new FileReader();fr.onload=()=>ok(fr.result);fr.onerror=no;fr.readAsDataURL(file)})};
load();D.rx.push(r);if(!save())return er('Browser storage is full. Use a smaller file.');
render();records(f.dataset.p);toast('Prescription saved.')},
doc(){if(!v('dn')||!v('dd')||!v('de')||v('dp').length<6)return er('Fill in every field. The password needs 6 or more characters.');if(taken(mail('de')))return er('That login email is already used.');
const d={id:uid('d'),name:v('dn'),dept:v('dd'),fee:+v('df')||0,qual:v('dq'),exp:+v('dx')||0,phone:v('dt')};D.doctors.push(d);D.users.push({id:uid('u'),name:d.name,email:mail('de'),pass:v('dp'),role:'doctor',doctorId:d.id});commit('Doctor added.')},
staff(){if(!v('tn')||!v('te')||v('tp').length<6)return er('Fill in every field. The password needs 6 or more characters.');if(taken(mail('te')))return er('That login email is already used.');
D.users.push({id:uid('u'),name:v('tn'),email:mail('te'),pass:v('tp'),role:'reception',salary:+v('ts')||0,duty:v('tdu')});commit('Staff member added.')}}[f.dataset.form]||(()=>{}))()});

window.addEventListener('storage',e=>{if(e.key===K){load();if(me&&!$('#dlg').open&&!document.activeElement.matches('input,select'))render()}});
render();
