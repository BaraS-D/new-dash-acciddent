/* GIS Security Dashboard - script.js */
'use strict';
/* ========= اللغة ========= */
const I18N = {
 ar:{mapHint:'اضغط على الخريطة لاختيار الموقع، وسيظهر الإحداثي العادي والعسكري (MGRS).',addTitle:'إضافة حادث',f_id:'رقم الحادث (تلقائي)',f_title:'العنوان',f_type:'النوع',f_area:'المنطقة',f_mission:'المهمة',f_xy:'الإحداثيات (خط العرض, خط الطول)',f_mgrs:'MGRS (الإحداثي العسكري)',f_date:'التاريخ',f_sev:'الأهمية',f_status:'الحالة',f_desc:'الوصف',f_notes:'ملاحظات',f_img:'صورة (اختيارية)',add:'إضافة حادث',update:'تعديل حادث',delete:'حذف حادث',clear:'مسح الحقول',locate:'عرض الموقع على الخريطة',dataTitle:'البيانات',importXl:'استيراد Excel / CSV',exportCsv:'تصدير CSV',exportJson:'نسخ احتياطي JSON',importJson:'استعادة JSON',localNote:'البيانات محفوظة محلياً في هذا المتصفح فقط ولا تتزامن تلقائياً بين الأجهزة أو المتصفحات. استخدم النسخ الاحتياطي للنقل.',listTitle:'الحوادث',search:'بحث...',chartsTitle:'الإحصائيات',all:'الكل',total:'الإجمالي',low:'منخفضة',medium:'متوسطة',high:'عالية',critical:'حرجة',open:'مفتوحة',in_progress:'قيد المعالجة',closed:'مغلقة',cols:['الرقم','العنوان','النوع','المهمة','المنطقة','التاريخ','الأهمية','الحالة','الإحداثيات','إجراءات'],edit:'تعديل',del:'حذف',show:'عرض',empty:'لا توجد حوادث مطابقة.',nodata:'لا توجد بيانات كافية للتحليل.',confirmDel:'حذف هذا الحادث؟',saved:'تم الحفظ',deleted:'تم الحذف',badXY:'صيغة الإحداثيات غير صحيحة. مثال: 33.3152, 44.3661',badMGRS:'صيغة MGRS غير صحيحة.',needTitle:'العنوان مطلوب.',needLoc:'أدخل الإحداثيات أو MGRS أو اختر موقعاً من الخريطة.',tileErr:'تعذر تحميل خريطة الأساس. تحقق من الاتصال بالإنترنت.',dbErr:'خطأ في التخزين المحلي: ',imgBig:'الصورة أكبر من 2MB.',impOk:'تم استيراد',impFail:'فشل',impNone:'لم يتم حفظ أي سجل.',row:'صف',noCoord:'لا توجد إحداثيات صحيحة (latitude/longitude أو xy أو mgrs)',noTitle:'لا يوجد عنوان أو نوع أو رقم',headers:'الأعمدة التي قرأها البرنامج',noLoc:'أدخل إحداثيات أولاً.',jsonBad:'ملف JSON غير صالح.',added:'جديد',updated:'محدّث',cType:'حسب النوع',cArea:'حسب المنطقة',cSev:'حسب الأهمية',cStatus:'حسب الحالة',cDate:'حسب التاريخ',missionLbl:'نوع المهمة',allMissions:'كل المهام',chooseType:'— اختر النوع —',chooseMission:'— اختر المهمة —',plain:'الإحداثي العادي',mil:'الإحداثي العسكري (MGRS)',btn:'English'},
 en:{mapHint:'Click the map to pick a location; plain and military (MGRS) coordinates will be shown.',addTitle:'Add incident',f_id:'Incident ID (auto)',f_title:'Title',f_type:'Type',f_area:'Area',f_mission:'Mission',f_xy:'Coordinates (Latitude, Longitude)',f_mgrs:'MGRS (military grid)',f_date:'Date',f_sev:'Severity',f_status:'Status',f_desc:'Description',f_notes:'Notes',f_img:'Image (optional)',add:'Add incident',update:'Update incident',delete:'Delete incident',clear:'Clear fields',locate:'Show on map',dataTitle:'Data',importXl:'Import Excel / CSV',exportCsv:'Export CSV',exportJson:'Backup JSON',importJson:'Restore JSON',localNote:'Data is stored locally in this browser only and does not sync between devices or browsers. Use backup to move it.',listTitle:'Incidents',search:'Search...',chartsTitle:'Statistics',all:'All',total:'Total',low:'Low',medium:'Medium',high:'High',critical:'Critical',open:'Open',in_progress:'In progress',closed:'Closed',cols:['ID','Title','Type','Mission','Area','Date','Severity','Status','Coordinates','Actions'],edit:'Edit',del:'Delete',show:'Show',empty:'No matching incidents.',nodata:'Not enough data to analyze.',confirmDel:'Delete this incident?',saved:'Saved',deleted:'Deleted',badXY:'Invalid coordinates. Example: 33.3152, 44.3661',badMGRS:'Invalid MGRS.',needTitle:'Title is required.',needLoc:'Enter coordinates or MGRS, or pick a location on the map.',tileErr:'Base map failed to load. Check your internet connection.',dbErr:'Local storage error: ',imgBig:'Image is larger than 2MB.',impOk:'Imported',impFail:'Failed',impNone:'No records were saved.',row:'Row',noCoord:'No valid coordinates (latitude/longitude, xy or mgrs)',noTitle:'No title, type or ID',headers:'Columns detected',noLoc:'Enter coordinates first.',jsonBad:'Invalid JSON file.',added:'new',updated:'updated',cType:'By type',cArea:'By area',cSev:'By severity',cStatus:'By status',cDate:'By date',missionLbl:'Mission type',allMissions:'All missions',chooseType:'— Select type —',chooseMission:'— Select mission —',plain:'Plain coordinates',mil:'Military grid (MGRS)',btn:'العربية'}
};
let lang = localStorage.getItem('gis_lang') || 'ar';
const t = k => I18N[lang][k] ?? k;
const $ = id => document.getElementById(id);

/* ========= IndexedDB ========= */
let db;
function openDB(){
  return new Promise((res,rej)=>{
    const r = indexedDB.open('gis_security_db',1);
    r.onupgradeneeded = e => e.target.result.createObjectStore('incidents',{keyPath:'incident_id'});
    r.onsuccess = e => { db = e.target.result; res(); };
    r.onerror = () => rej(r.error);
  });
}
const tx = (mode,fn)=>new Promise((res,rej)=>{
  const t_ = db.transaction('incidents',mode), s = t_.objectStore('incidents');
  const out = fn(s);
  t_.oncomplete = () => res(out && 'result' in out ? out.result : undefined);
  t_.onerror = t_.onabort = () => rej(t_.error);
});
const dbAll = () => tx('readonly', s => s.getAll());
const dbPutMany = recs => tx('readwrite', s => { recs.forEach(r => s.put(r)); });
const dbDel = id => tx('readwrite', s => s.delete(id));

/* ========= MGRS ========= */
const MG=(()=>{
  const a=6378137,f=1/298.257223563,k0=0.9996,e2=f*(2-f),ep2=e2/(1-e2),rad=Math.PI/180;
  const BAND='CDEFGHJKLMNPQRSTUVWX',COL=['ABCDEFGH','JKLMNPQR','STUVWXYZ'],ROW='ABCDEFGHJKLMNPQRSTUV';
  function toUTM(lat,lon){
    const zone=Math.min(60,Math.floor((lon+180)/6)+1),lon0=((zone-1)*6-177)*rad,p=lat*rad,l=lon*rad;
    const N=a/Math.sqrt(1-e2*Math.sin(p)**2),T=Math.tan(p)**2,C=ep2*Math.cos(p)**2,A=Math.cos(p)*(l-lon0),e4=e2*e2,e6=e4*e2;
    const M=a*((1-e2/4-3*e4/64-5*e6/256)*p-(3*e2/8+3*e4/32+45*e6/1024)*Math.sin(2*p)+(15*e4/256+45*e6/1024)*Math.sin(4*p)-(35*e6/3072)*Math.sin(6*p));
    const x=k0*N*(A+(1-T+C)*A**3/6+(5-18*T+T*T+72*C-58*ep2)*A**5/120)+500000;
    let y=k0*(M+N*Math.tan(p)*(A*A/2+(5-T+9*C+4*C*C)*A**4/24+(61-58*T+T*T+600*C-330*ep2)*A**6/720));
    if(lat<0)y+=1e7;
    return {zone,x,y};
  }
  function fromUTM(zone,x,y,north){
    x-=500000; if(!north)y-=1e7;
    const e1=(1-Math.sqrt(1-e2))/(1+Math.sqrt(1-e2)),mu=(y/k0)/(a*(1-e2/4-3*e2*e2/64-5*e2**3/256));
    const p1=mu+(3*e1/2-27*e1**3/32)*Math.sin(2*mu)+(21*e1*e1/16-55*e1**4/32)*Math.sin(4*mu)+(151*e1**3/96)*Math.sin(6*mu)+(1097*e1**4/512)*Math.sin(8*mu);
    const s=Math.sin(p1),c=Math.cos(p1),tn=Math.tan(p1),C1=ep2*c*c,T1=tn*tn,N1=a/Math.sqrt(1-e2*s*s),R1=a*(1-e2)/Math.pow(1-e2*s*s,1.5),D=x/(N1*k0);
    const lat=p1-(N1*tn/R1)*(D*D/2-(5+3*T1+10*C1-4*C1*C1-9*ep2)*D**4/24+(61+90*T1+298*C1+45*T1*T1-252*ep2-3*C1*C1)*D**6/720);
    const lon=(D-(1+2*T1+C1)*D**3/6+(5-2*C1+28*T1-3*C1*C1+8*ep2+24*T1*T1)*D**5/120)/c;
    return [lat/rad,(zone-1)*6-177+lon/rad];
  }
  function fromLL(lat,lon){
    if(!(lat>=-80&&lat<=84))return '';
    const u=toUTM(lat,lon),bi=Math.min(19,Math.floor((lat+80)/8));
    const c=COL[(u.zone-1)%3][Math.floor(u.x/1e5)-1],r=ROW[(Math.floor(u.y/1e5)+(u.zone%2===0?5:0))%20];
    if(!c)return '';
    const p=n=>String(Math.floor(n)).padStart(5,'0');
    return `${String(u.zone).padStart(2,'0')}${BAND[bi]} ${c}${r} ${p(u.x%1e5)} ${p(u.y%1e5)}`;
  }
  function toLL(s){
    const m=String(s).toUpperCase().replace(/[\s\-]/g,'').match(/^(\d{1,2})([C-X])([A-Z])([A-Z])(\d*)$/);
    if(!m||m[5].length%2||m[5].length>10)return null;
    const zone=+m[1],bi=BAND.indexOf(m[2]),ci=COL[(zone-1)%3].indexOf(m[3]),ri=ROW.indexOf(m[4]);
    if(zone<1||zone>60||bi<0||ci<0||ri<0)return null;
    const h=m[5].length/2,e=h?+m[5].slice(0,h)*10**(5-h):0,n=h?+m[5].slice(h)*10**(5-h):0;
    const x=(ci+1)*1e5+e,north=bi>=10,rn=((ri-(zone%2===0?5:0))+20)%20*1e5;
    const minN=toUTM(-80+bi*8,(zone-1)*6-177).y;
    const y=rn+n+2e6*Math.ceil((minN-150000-rn)/2e6);
    const ll=fromUTM(zone,x,y,north);
    return Number.isFinite(ll[0])&&Number.isFinite(ll[1])?ll:null;
  }
  return {fromLL,toLL};
})();

/* ========= القوائم ========= */
const TYPES=[['terror','هجوم إرهابي','Terror attack'],['explosion','انفجار / عبوة ناسفة','Explosion / IED'],['shooting','إطلاق نار','Shooting'],['clash','اشتباك مسلح','Armed clash'],['kidnap','اختطاف','Kidnapping'],['assassination','اغتيال','Assassination'],['murder','جريمة قتل','Murder'],['assault','اعتداء','Assault'],['robbery','سطو / سرقة','Robbery / Theft'],['arson','حريق متعمد','Arson'],['fire','حريق','Fire'],['traffic','حادث مروري','Traffic accident'],['drugs','مخدرات','Drugs'],['smuggling','تهريب','Smuggling'],['riot','شغب / تظاهرة','Riot / Protest'],['border','خرق حدودي','Border breach'],['suspicious','جسم مشبوه','Suspicious object'],['missing','شخص مفقود','Missing person'],['disaster','كارثة طبيعية / فيضان','Natural disaster / Flood'],['other','أخرى','Other']];
const MISSIONS=[['patrol','دورية','Patrol'],['checkpoint','نقطة تفتيش','Checkpoint'],['search','تمشيط وتفتيش','Search operation'],['raid','مداهمة','Raid'],['arrest','إلقاء قبض','Arrest'],['escort','تأمين موكب / مرافقة','Escort'],['secure','تأمين منشأة','Facility security'],['rescue','إنقاذ وإغاثة','Rescue'],['bomb','معالجة عبوات (هندسة)','Bomb disposal'],['crowd','السيطرة على الحشود','Crowd control'],['traffic_ctrl','تنظيم المرور','Traffic control'],['investigate','تحقيق جنائي','Criminal investigation'],['surveil','مراقبة ورصد','Surveillance'],['border_guard','حماية الحدود','Border protection'],['other','أخرى','Other']];
const lab=(list,k)=>{const r=list.find(x=>x[0]===k);return r?r[lang==='ar'?1:2]:(k||'');};
const typeLabel=k=>lab(TYPES,k), missionLabel=k=>lab(MISSIONS,k);
const matchKey=(list,v)=>{v=String(v||'').trim();if(!v)return '';const n=normKey(v);const r=list.find(x=>x.some(z=>normKey(z)===n));return r?r[0]:v;};

/* ========= تحويل الأرقام والإحداثيات ========= */
const AR_DIG=s=>String(s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/٫/g,'.').replace(/[،؛]/g,',');
const num=v=>typeof v==='number'?v:parseFloat(AR_DIG(v).replace(/,/g,'.'));
const fmtXY=p=>p[0].toFixed(6)+', '+p[1].toFixed(6);
function parseXY(s){
  let q=AR_DIG(s).trim(); if(!q) return null;
  if(q.includes(';')) q=q.replace(/,/g,'.').replace(/;/g,' ');
  const n=q.match(/-?\d+(?:\.\d+)?/g); if(!n||n.length!==2) return null;
  let a=+n[0], b=+n[1]; if(Math.abs(a)>90&&Math.abs(b)<=90) [a,b]=[b,a];
  return validCoord(a,b)?[a,b]:null;
}

/* ========= الحالة ========= */
let incidents = [], map, layer, pickMarker, editingId = null, imgData = '', charts = {};
const SEV = ['low','medium','high','critical'], STA = ['open','in_progress','closed'];
const SEV_COLOR = {low:'#2ea66f',medium:'#e0a526',high:'#e5484d',critical:'#b4237d'};
function toast(msg, err){
  const el = $('toast'); el.textContent = msg; el.className = 'gis-toast' + (err ? ' err' : '');
  el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(()=>el.hidden = true, 5000);
}
const newId = () => 'INC-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();
const validCoord = (a,b) => Number.isFinite(a)&&Number.isFinite(b)&&a>=-90&&a<=90&&b>=-180&&b<=180;
const addRow = (parent,k,v) => { if(!v) return; const p = document.createElement('div'); p.textContent = k+': '+v; parent.appendChild(p); };

/* ========= الخريطة ========= */
function initMap(){
  map = L.map('map').setView([33.3152,44.3661],11);
  const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
  let warned = false;
  tiles.on('tileerror',()=>{ if(!warned){ warned = true; toast(t('tileErr'),true); } });
  layer = L.layerGroup().addTo(map);
  map.on('click', e => pickPoint(e.latlng.lat, e.latlng.lng, true));
}
function pickPoint(lat,lng,popup){
  $('f_xy').value = fmtXY([lat,lng]); $('f_mgrs').value = MG.fromLL(lat,lng);
  if(pickMarker) map.removeLayer(pickMarker);
  pickMarker = L.circleMarker([lat,lng],{radius:8,color:'#fff',weight:2,fillColor:'#2f81f7',fillOpacity:.9}).addTo(map);
  if(popup){
    const d = document.createElement('div');
    addRow(d,t('plain'),fmtXY([lat,lng])); addRow(d,t('mil'),MG.fromLL(lat,lng));
    L.popup().setLatLng([lat,lng]).setContent(d).openOn(map);
  }
}
function renderMarkers(list){
  layer.clearLayers();
  list.forEach(i => {
    const m = L.circleMarker([i.latitude,i.longitude],{radius:8,color:'#fff',weight:1.5,fillColor:SEV_COLOR[i.severity]||'#888',fillOpacity:.9});
    const d = document.createElement('div'), b = document.createElement('b'); b.textContent = i.title; d.appendChild(b);
    addRow(d,t('f_id'),i.incident_id); addRow(d,t('f_type'),typeLabel(i.type)); addRow(d,t('f_mission'),missionLabel(i.mission));
    addRow(d,t('f_area'),i.area); addRow(d,t('f_date'),i.date); addRow(d,t('f_sev'),t(i.severity)); addRow(d,t('f_status'),t(i.status));
    addRow(d,t('plain'),fmtXY([i.latitude,i.longitude])); addRow(d,t('mil'),MG.fromLL(i.latitude,i.longitude)); addRow(d,t('f_desc'),i.description);
    if(i.image && /^(data:image|https?:)/.test(i.image)){ const im = document.createElement('img'); im.src = i.image; im.className = 'popup-img'; d.appendChild(im); }
    m.bindPopup(d); m.addTo(layer); i._m = m;
  });
}
function focusIncident(i){ map.setView([i.latitude,i.longitude],15); if(i._m) i._m.openPopup(); $('map').scrollIntoView({behavior:'smooth',block:'center'}); }

/* ========= الفلاتر والجدول ========= */
function filtered(){
  const q = $('q').value.trim().toLowerCase(), g = id => $(id).value;
  return incidents.filter(i =>
    (!q || [i.incident_id,i.title,typeLabel(i.type),missionLabel(i.mission),i.area,i.description,i.notes].join(' ').toLowerCase().includes(q)) &&
    (!g('fType')||i.type===g('fType')) && (!g('fMission')||i.mission===g('fMission')) && (!g('fArea')||i.area===g('fArea')) &&
    (!g('fSev')||i.severity===g('fSev')) && (!g('fStatus')||i.status===g('fStatus')) &&
    (!g('fFrom')||(i.date&&i.date>=g('fFrom'))) && (!g('fTo')||(i.date&&i.date<=g('fTo'))));
}
function fillSelect(id,vals,first,fn){
  const s = $(id), cur = s.value; s.innerHTML = ''; s.add(new Option(first,''));
  vals.forEach(v => s.add(new Option(fn?fn(v):v, v)));
  s.value = vals.includes(cur) ? cur : '';
}
function refreshFilters(){
  const uniq = k => [...new Set(incidents.map(i=>i[k]).filter(Boolean))].sort();
  const union = (list,k) => [...new Set([...list.map(x=>x[0]),...uniq(k)])];
  fillSelect('fType',union(TYPES,'type'),t('f_type')+': '+t('all'),typeLabel);
  fillSelect('fMission',union(MISSIONS,'mission'),t('allMissions'),missionLabel);
  fillSelect('fArea',uniq('area'),t('f_area')+': '+t('all'));
  fillSelect('fSev',SEV,t('f_sev')+': '+t('all'),t);
  fillSelect('fStatus',STA,t('f_status')+': '+t('all'),t);
}
function renderTable(list){
  const tb = $('tbody'); tb.textContent = '';
  list.forEach(i => {
    const tr = tb.insertRow();
    [i.incident_id,i.title,typeLabel(i.type),missionLabel(i.mission),i.area,i.date].forEach(v => tr.insertCell().textContent = v||'');
    [['sev-',i.severity],['st-',i.status]].forEach(([p,v])=>{
      const s = document.createElement('span'); s.className = 'tag '+p+v; s.textContent = t(v); tr.insertCell().appendChild(s);
    });
    const cc = tr.insertCell(); cc.textContent = fmtXY([i.latitude,i.longitude]);
    const mg = document.createElement('div'); mg.className = 'mgrs-line'; mg.textContent = MG.fromLL(i.latitude,i.longitude); cc.appendChild(mg);
    const c = tr.insertCell();
    [['show',()=>focusIncident(i)],['edit',()=>loadForm(i)],['del',()=>removeIncident(i.incident_id)]].forEach(([k,fn])=>{
      const b = document.createElement('button'); b.className = 'row-btn'; b.type = 'button'; b.textContent = t(k); b.onclick = fn; c.appendChild(b);
    });
  });
  $('emptyMsg').hidden = list.length>0; $('emptyMsg').textContent = t('empty');
}

/* ========= الإحصائيات والرسوم ========= */
function renderStats(){
  const c = (k,v) => incidents.filter(i=>i[k]===v).length;
  const items = [[t('total'),incidents.length],...SEV.map(s=>[t(s),c('severity',s)]),...STA.map(s=>[t(s),c('status',s)])];
  $('stats').textContent = '';
  items.forEach(([l,n])=>{ const d = document.createElement('div'); d.className = 'stat';
    const b = document.createElement('b'); b.textContent = n; const s = document.createElement('span'); s.textContent = l; d.append(b,s); $('stats').appendChild(d); });
}
function count(key,labelFn){
  const m = {}; incidents.forEach(i => { const k = i[key]||'—'; m[k] = (m[k]||0)+1; });
  const keys = Object.keys(m).sort(); return {labels:keys.map(k=>labelFn?labelFn(k):k),data:keys.map(k=>m[k])};
}
function drawChart(id,type,title,d,color){
  if(charts[id]) charts[id].destroy();
  charts[id] = new Chart($(id),{type,data:{labels:d.labels,datasets:[{label:title,data:d.data,backgroundColor:color||['#2f81f7','#2ea66f','#e0a526','#e5484d','#b4237d','#58a6ff','#8957e5','#d29922']}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{title:{display:true,text:title,color:'#e6ecf8'},legend:{labels:{color:'#e6ecf8'},display:type!=='bar'&&type!=='line'}},
      scales:type==='doughnut'?{}:{x:{ticks:{color:'#8fa0c0'}},y:{beginAtZero:true,ticks:{color:'#8fa0c0',precision:0}}}}});
}
function renderCharts(){
  $('chartMsg').hidden = incidents.length>0; $('chartMsg').textContent = t('nodata');
  drawChart('cType','bar',t('cType'),count('type',typeLabel));
  drawChart('cArea','bar',t('cArea'),count('area'));
  drawChart('cSev','doughnut',t('cSev'),count('severity',t));
  drawChart('cStatus','doughnut',t('cStatus'),count('status',t));
  drawChart('cDate','line',t('cDate'),count('date'),'#2f81f7');
}
function render(){ refreshFilters(); renderStats(); renderCharts(); const l = filtered(); renderMarkers(l); renderTable(l); }
async function reload(){
  try{ incidents = await dbAll(); }catch(e){ toast(t('dbErr')+e.message,true); incidents = []; }
  render();
}

/* ========= النموذج ========= */
function fillFormLists(){
  [['f_type',TYPES,typeLabel,t('chooseType')],['f_mission',MISSIONS,missionLabel,t('chooseMission')]].forEach(([id,list,fn,first])=>{
    const s = $(id), cur = s.value; s.innerHTML = ''; s.add(new Option(first,''));
    list.forEach(x=>s.add(new Option(fn(x[0]),x[0]))); setSel(s,cur);
  });
}
function setSel(s,v){ if(v && ![...s.options].some(o=>o.value===v)) s.add(new Option(v,v)); s.value = v||''; }
function readLoc(){
  const xy = $('f_xy').value.trim(), mg = $('f_mgrs').value.trim();
  if(xy){ const p = parseXY(xy); if(!p){ toast(t('badXY'),true); return null; } return p; }
  if(mg){ const p = MG.toLL(mg); if(!p){ toast(t('badMGRS'),true); return null; } return p; }
  toast(t('needLoc'),true); return null;
}
function readForm(){
  if(!$('f_title').value.trim()){ toast(t('needTitle'),true); return null; }
  const p = readLoc(); if(!p) return null;
  return {incident_id:editingId||$('f_id').value||newId(),title:$('f_title').value.trim(),type:$('f_type').value,mission:$('f_mission').value,area:$('f_area').value.trim(),
    latitude:p[0],longitude:p[1],mgrs:MG.fromLL(p[0],p[1]),date:$('f_date').value,severity:$('f_sev').value,status:$('f_status').value,
    description:$('f_desc').value.trim(),notes:$('f_notes').value.trim(),image:imgData};
}
function clearForm(){
  editingId = null; imgData = '';
  ['f_title','f_area','f_xy','f_mgrs','f_date','f_desc','f_notes','f_img','f_type','f_mission'].forEach(id=>$(id).value='');
  $('f_sev').value = 'medium'; $('f_status').value = 'open'; $('f_id').value = newId();
  $('btnUpdate').disabled = $('btnDelete').disabled = true; $('btnAdd').disabled = false;
  if(pickMarker){ map.removeLayer(pickMarker); pickMarker = null; }
}
function loadForm(i){
  editingId = i.incident_id; imgData = i.image||'';
  $('f_id').value = i.incident_id; $('f_title').value = i.title; setSel($('f_type'),i.type); setSel($('f_mission'),i.mission);
  $('f_area').value = i.area||''; $('f_xy').value = fmtXY([i.latitude,i.longitude]); $('f_mgrs').value = MG.fromLL(i.latitude,i.longitude);
  $('f_date').value = i.date||''; $('f_sev').value = i.severity; $('f_status').value = i.status; $('f_desc').value = i.description||''; $('f_notes').value = i.notes||'';
  $('btnUpdate').disabled = $('btnDelete').disabled = false; $('btnAdd').disabled = true;
  $('incForm').scrollIntoView({behavior:'smooth'});
}
async function saveForm(){
  const r = readForm(); if(!r) return;
  try{ await dbPutMany([r]); toast(t('saved')); clearForm(); await reload(); }catch(e){ toast(t('dbErr')+(e&&e.message||e),true); }
}
async function removeIncident(id){
  if(!confirm(t('confirmDel'))) return;
  try{ await dbDel(id); toast(t('deleted')); if(editingId===id) clearForm(); await reload(); }catch(e){ toast(t('dbErr')+e.message,true); }
}
function onXY(){ const p = parseXY($('f_xy').value); if(p){ pickPoint(p[0],p[1],false); map.setView(p,Math.max(map.getZoom(),13)); } else if($('f_xy').value.trim()){ toast(t('badXY'),true); } }
function onMGRS(){ const p = MG.toLL($('f_mgrs').value); if(p){ pickPoint(p[0],p[1],false); map.setView(p,Math.max(map.getZoom(),13)); } else if($('f_mgrs').value.trim()){ toast(t('badMGRS'),true); } }

/* ========= استيراد Excel / CSV ========= */
const normKey = k => String(k).replace(/[\uFEFF\u0640]/g,'').trim().toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[\s.\-\/]+/g,'_').replace(/^_+|_+$/g,'');
const ALIAS = {incident_id:['incident_id','id','no','number','رقم_الحادث','رقم'],title:['title','name','incident','incident_title','العنوان','عنوان','اسم_الحادث','الحادث'],
  type:['type','incident_type','category','نوع','النوع','نوع_الحادث','التصنيف'],mission:['mission','task','mission_type','المهمه','المهام','نوع_المهمه'],
  description:['description','desc','details','الوصف','التفاصيل'],governorate:['governorate','province','المحافظه'],area:['area','district','region','المنطقه','القضاء','الحي'],
  location_text:['location_text','location','address','الموقع','العنوان_الكامل'],latitude:['latitude','lat','y','خط_العرض','دائره_العرض'],
  longitude:['longitude','lng','lon','long','x','خط_الطول','دائره_الطول'],xy:['xy','x_y','coordinates','coords','coordinate','latlng','lat_lng','latlon','lat_lon','الاحداثيات','احداثيات','الاحداثي'],
  mgrs:['mgrs','military_grid','الاحداثيات_العسكريه','احداثيات_عسكريه','الاحداثي_العسكري'],date:['date','incident_date','التاريخ','تاريخ'],time:['time','الوقت'],
  severity:['severity','priority','الاهميه','الخطوره','الاولويه'],status:['status','الحاله'],notes:['notes','note','remarks','ملاحظات'],image_url:['image_url','image','الصوره']};
const ALIASN = {}; Object.keys(ALIAS).forEach(k => ALIASN[k] = ALIAS[k].map(normKey));
const ALLALIAS = new Set(Object.values(ALIASN).flat());
const SEV_MAP = {low:'low',منخفضه:'low',medium:'medium',متوسطه:'medium',high:'high',عاليه:'high',critical:'critical',حرجه:'critical'};
const STA_MAP = {open:'open',مفتوحه:'open',in_progress:'in_progress',inprogress:'in_progress',قيد_المعالجه:'in_progress',closed:'closed',مغلقه:'closed'};
const isoLocal = d => new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
function fmtDate(v){
  if(v instanceof Date) return isNaN(v)?'':isoLocal(v);
  const s = AR_DIG(v).trim(); if(!s) return '';
  let m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/); if(m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  if(/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
  if(/^\d{5}(\.\d+)?$/.test(s)) return new Date(Math.round((+s-25569)*864e5)).toISOString().slice(0,10);
  const d = new Date(s); return isNaN(d)?'':isoLocal(d);
}
async function readWorkbook(file){
  if(/\.csv$/i.test(file.name)){
    const buf = await file.arrayBuffer(); let txt = new TextDecoder('utf-8').decode(buf);
    if(txt.includes('\uFFFD')){ try{ txt = new TextDecoder('windows-1256').decode(buf); }catch(e){} }
    return XLSX.read(txt,{type:'string',cellDates:true});
  }
  return XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true});
}
function pickTable(wb){
  let best = null;
  wb.SheetNames.forEach(sn => {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,defval:'',raw:true,blankrows:false});
    rows.slice(0,15).forEach((r,ri)=>{
      const score = r.filter(c=>ALLALIAS.has(normKey(c))).length;
      if(!best || score>best.score) best = {score,rows,ri};
    });
  });
  if(!best) return {headers:[],data:[],start:2};
  const headers = best.rows[best.ri].map(normKey);
  return {headers,data:best.rows.slice(best.ri+1),start:best.ri+2,score:best.score};
}
async function importSheet(file){
  const rep = $('importReport'); rep.hidden = false; rep.textContent = '...';
  try{
    const wb = await readWorkbook(file), tb = pickTable(wb);
    const existing = new Set(incidents.map(i=>i.incident_id)), toSave = [], errs = []; let nNew = 0, nUpd = 0;
    tb.data.forEach((arr,idx)=>{
      const rn = tb.start+idx, row = {};
      tb.headers.forEach((h,ci)=>{ if(h) row[h] = arr[ci]; });
      if(arr.every(v=>String(v).trim()==='')) return;
      const get = f => { for(const a of ALIASN[f]){ if(row[a]!==undefined && String(row[a]).trim()!=='') return row[a]; } return ''; };
      let ll = null; const la = num(get('latitude')), lo = num(get('longitude'));
      if(validCoord(la,lo)) ll = [la,lo];
      else if(Math.abs(la)>90 && validCoord(lo,la)) ll = [lo,la];
      if(!ll && get('xy')!=='') ll = parseXY(get('xy'));
      if(!ll && get('mgrs')!=='') ll = MG.toLL(String(get('mgrs')));
      if(!ll){ errs.push(`${t('row')} ${rn}: ${t('noCoord')}`); return; }
      const type = matchKey(TYPES,get('type')), area = String(get('area')||get('governorate')).trim();
      let id = String(get('incident_id')).trim() || newId();
      const title = String(get('title')).trim() || [typeLabel(type),area].filter(Boolean).join(' - ') || String(get('description')).trim().slice(0,60) || String(get('incident_id')).trim();
      if(!title){ errs.push(`${t('row')} ${rn}: ${t('noTitle')}`); return; }
      const rec = {incident_id:id,title,type,mission:matchKey(MISSIONS,get('mission')),area,latitude:ll[0],longitude:ll[1],mgrs:MG.fromLL(ll[0],ll[1]),
        date:fmtDate(get('date')),severity:SEV_MAP[normKey(get('severity'))]||'medium',status:STA_MAP[normKey(get('status'))]||'open',
        description:String(get('description')).trim(),notes:String(get('notes')).trim(),image:String(get('image_url')).trim(),
        governorate:String(get('governorate')).trim(),location_text:String(get('location_text')).trim(),time:String(get('time')).trim()};
      if(existing.has(id)) nUpd++; else { nNew++; existing.add(id); }
      toSave.push(rec);
    });
    if(toSave.length) await dbPutMany(toSave);
    const lines = [`${t('impOk')}: ${toSave.length} (${nNew} ${t('added')}, ${nUpd} ${t('updated')})`,`${t('impFail')}: ${errs.length}`,...errs.slice(0,50)];
    if(!toSave.length) lines.push('',t('headers')+': '+tb.headers.filter(Boolean).join(' | '));
    rep.textContent = lines.join('\n');
    if(toSave.length){ toast(`${t('impOk')}: ${toSave.length}`+(errs.length?` — ${t('impFail')}: ${errs.length}`:'')); await reload(); } else toast(t('impNone'),true);
  }catch(e){ rep.textContent = String(e&&e.message||e); toast(t('impNone'),true); }
}

/* ========= تصدير / استيراد JSON ========= */
function download(name,blob){ const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }
function exportJson(){ download('incidents_backup.json',new Blob([JSON.stringify(incidents.map(({_m,...r})=>r),null,2)],{type:'application/json'})); }
function exportCsv(){
  const cols = ['incident_id','title','type','mission','description','governorate','area','location_text','latitude','longitude','mgrs','date','time','severity','status','notes'];
  const esc = v => '"'+String(v??'').replace(/"/g,'""')+'"';
  const val = (i,c) => c==='type'?typeLabel(i.type):c==='mission'?missionLabel(i.mission):c==='mgrs'?MG.fromLL(i.latitude,i.longitude):i[c];
  const csv = '\uFEFF'+[cols.join(','),...incidents.map(i=>cols.map(c=>esc(val(i,c))).join(','))].join('\r\n');
  download('incidents.csv',new Blob([csv],{type:'text/csv;charset=utf-8'}));
}
async function importJson(file){
  try{
    const arr = JSON.parse(await file.text()); if(!Array.isArray(arr)) throw 0;
    const ok = arr.filter(r => r && r.incident_id && r.title && validCoord(+r.latitude,+r.longitude))
      .map(r => ({...r,latitude:+r.latitude,longitude:+r.longitude,severity:SEV.includes(r.severity)?r.severity:'medium',status:STA.includes(r.status)?r.status:'open'}));
    if(!ok.length) throw 0;
    await dbPutMany(ok); toast(`${t('impOk')}: ${ok.length}`); await reload();
  }catch(e){ toast(t('jsonBad'),true); }
}

/* ========= واجهة اللغة ========= */
function applyLang(){
  document.documentElement.lang = lang; document.documentElement.dir = lang==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-ph]').forEach(el => el.placeholder = t(el.dataset.i18nPh));
  $('btnLang').textContent = t('btn');
  [...$('f_sev').options].forEach(o=>o.textContent = t(o.value)); [...$('f_status').options].forEach(o=>o.textContent = t(o.value));
  fillFormLists();
  $('thead').textContent = ''; t('cols').forEach(c => { const th = document.createElement('th'); th.textContent = c; $('thead').appendChild(th); });
}

/* ========= التشغيل ========= */
const LOGOS = ['logo.png','logo.jpg','logo.jpeg','logo.webp','logo.svg','images/logo.png','images/logo.jpg','images/logo.jpeg'];
document.addEventListener('DOMContentLoaded', async () => {
  const logo = $('logo'); let li = 0;
  logo.onerror = () => { li++; if(li<LOGOS.length) logo.src = LOGOS[li]; else { logo.style.display = 'none'; console.warn('Logo not found. Put logo.png next to index.html'); } };
  logo.src = LOGOS[0];
  applyLang(); initMap();
  $('btnLang').onclick = () => { lang = lang==='ar'?'en':'ar'; localStorage.setItem('gis_lang',lang); applyLang(); render(); };
  $('btnAdd').onclick = saveForm; $('btnUpdate').onclick = saveForm;
  $('btnDelete').onclick = () => editingId && removeIncident(editingId);
  $('btnClear').onclick = clearForm;
  $('btnLocate').onclick = () => { const p = readLoc(); if(p){ pickPoint(p[0],p[1],true); map.setView(p,15); } };
  $('f_xy').addEventListener('change',onXY); $('f_mgrs').addEventListener('change',onMGRS);
  $('f_img').onchange = e => { const f = e.target.files[0]; if(!f) return;
    if(f.size>2*1024*1024){ toast(t('imgBig'),true); e.target.value=''; return; }
    const r = new FileReader(); r.onload = () => imgData = r.result; r.readAsDataURL(f); };
  $('fileXlsx').onchange = e => { if(e.target.files[0]) importSheet(e.target.files[0]); e.target.value = ''; };
  $('fileJson').onchange = e => { if(e.target.files[0]) importJson(e.target.files[0]); e.target.value = ''; };
  $('btnCsv').onclick = exportCsv; $('btnJson').onclick = exportJson;
  ['q','fType','fMission','fArea','fSev','fStatus','fFrom','fTo'].forEach(id => $(id).addEventListener('input',()=>{ const l = filtered(); renderMarkers(l); renderTable(l); }));
  try{ await openDB(); }catch(e){ toast(t('dbErr')+e.message,true); }
  clearForm(); await reload();
});