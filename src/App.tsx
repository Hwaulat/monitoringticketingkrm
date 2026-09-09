import { useState, useRef, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
// v2 — Inter + design system

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = "login"|"home"|"scan"|"create_ticket"|"ticket_detail"|"tickets"|"dashboard"|"profil";
type TicketStatus = "open"|"in_progress"|"on_hold"|"closed";
type Priority = "low"|"normal"|"high"|"urgent";
type DamageType = "body"|"interior"|"electrical"|"mechanical"|"paint"|"other";
type UpdateType = "created"|"started"|"updated"|"hold"|"resumed"|"closed";

interface TicketUpdate { id:string; timestamp:Date; authorName:string; note:string; type:UpdateType; }
interface RepairTicket {
  id:string; ticketNo:string; cabinCode:string; cabinModel:string;
  createdAt:Date; createdByName:string; damageType:DamageType; description:string;
  priority:Priority; status:TicketStatus; assignedToName?:string;
  startedAt?:Date; closedAt?:Date; closureNotes?:string; durationSeconds?:number;
  updates:TicketUpdate[];
}
interface ScannedCabin { code:string; model:string; }
interface User { id:string; nik:string; name:string; department:string; }

// ─── Tokens ──────────────────────────────────────────────────────────────────
const T = {
  dark:   "#111827",
  dark2:  "#1f2937",
  bg:     "#ffffff",
  card:   "#ffffff",
  blue:   "#2563eb",
  blueL:  "#eff6ff",
  blueB:  "#bfdbfe",
  orange: "#f97316",
  orangeL:"#fff7ed",
  orangeB:"#fed7aa",
  green:  "#16a34a",
  greenL: "#f0fdf4",
  greenB: "#bbf7d0",
  red:    "#dc2626",
  redL:   "#fef2f2",
  redB:   "#fecaca",
  amber:  "#d97706",
  amberL: "#fffbeb",
  amberB: "#fde68a",
  violet: "#7c3aed",
  violetL:"#f5f3ff",
  text:   "#111827",
  sub:    "#6b7280",
  muted:  "#9ca3af",
  border: "#e5e7eb",
  borderL:"#f3f4f6",
  shadow: "0 1.75px 4px -1px rgba(15,17,20,0.10)",
  shadow2:"0 4px 20px rgba(15,17,20,0.14)",
};

// Type scale
const TS = {
  xs:   { fontSize:11, lineHeight:"16px" },
  sm:   { fontSize:12, lineHeight:"18px" },
  base: { fontSize:13, lineHeight:"20px" },
  md:   { fontSize:14, lineHeight:"22px" },
  lg:   { fontSize:16, lineHeight:"24px" },
  xl:   { fontSize:18, lineHeight:"28px" },
  "2xl":{ fontSize:22, lineHeight:"32px" },
  "3xl":{ fontSize:28, lineHeight:"36px" },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ME: User = { id:"u-001", nik:"240315", name:"Rizal Firmansyah", department:"Body Repair" };
const td = (h:number,m:number)=>{ const d=new Date(); d.setHours(h,m,0,0); return d; };
let _counter = 5;
const newNo = ()=>`TKT-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-00${_counter++}`;

const MOCK_TICKETS: RepairTicket[] = [
  { id:"t-001", ticketNo:"TKT-20240909-001", cabinCode:"CB-A0412", cabinModel:"Dyna 130 HT",
    createdAt:td(7,10), createdByName:"Rizal Firmansyah", damageType:"body",
    description:"Penyok pada sisi kiri pintu depan, perlu straightening dan dempul ulang.",
    priority:"high", status:"closed", assignedToName:"Rizal Firmansyah",
    startedAt:td(7,15), closedAt:td(8,5), durationSeconds:3000,
    closureNotes:"Perbaikan selesai, cat sudah matching.",
    updates:[
      { id:"u1", timestamp:td(7,10), authorName:"Rizal Firmansyah", note:"Tiket dibuat setelah scan cabin CB-A0412.", type:"created" },
      { id:"u2", timestamp:td(7,15), authorName:"Rizal Firmansyah", note:"Mulai pengerjaan straightening.", type:"started" },
      { id:"u3", timestamp:td(7,40), authorName:"Rizal Firmansyah", note:"Straightening selesai, melanjutkan ke proses dempul.", type:"updated" },
      { id:"u4", timestamp:td(8,5),  authorName:"Rizal Firmansyah", note:"Perbaikan selesai, cat sudah matching.", type:"closed" },
    ] },
  { id:"t-002", ticketNo:"TKT-20240909-002", cabinCode:"CB-B0091", cabinModel:"Dyna 110 ST",
    createdAt:td(8,18), createdByName:"Rizal Firmansyah", damageType:"paint",
    description:"Cat terkelupas di atap kabin, perlu re-paint area ± 30×20 cm.",
    priority:"normal", status:"closed", assignedToName:"Rizal Firmansyah",
    startedAt:td(8,22), closedAt:td(9,48), durationSeconds:5160,
    closureNotes:"Re-paint selesai, area sudah bersih.",
    updates:[
      { id:"u5", timestamp:td(8,18), authorName:"Rizal Firmansyah", note:"Tiket dibuat.", type:"created" },
      { id:"u6", timestamp:td(8,22), authorName:"Rizal Firmansyah", note:"Mulai proses pembersihan area dan masking.", type:"started" },
      { id:"u7", timestamp:td(9,10), authorName:"Rizal Firmansyah", note:"Primer sudah diaplikasikan, menunggu kering.", type:"updated" },
      { id:"u8", timestamp:td(9,48), authorName:"Rizal Firmansyah", note:"Re-paint selesai.", type:"closed" },
    ] },
  { id:"t-003", ticketNo:"TKT-20240909-003", cabinCode:"CB-C0204", cabinModel:"Hilux SR5",
    createdAt:td(10,3), createdByName:"Rizal Firmansyah", damageType:"interior",
    description:"Jok pengemudi robek di bagian tengah, perlu re-upholstery.",
    priority:"normal", status:"in_progress", assignedToName:"Rizal Firmansyah",
    startedAt:td(10,10),
    updates:[
      { id:"u9",  timestamp:td(10,3),  authorName:"Rizal Firmansyah", note:"Tiket dibuat setelah scan cabin.", type:"created" },
      { id:"u10", timestamp:td(10,10), authorName:"Rizal Firmansyah", note:"Mulai proses re-upholstery jok.", type:"started" },
      { id:"u11", timestamp:td(10,45), authorName:"Rizal Firmansyah", note:"Lapisan lama sudah dilepas, menunggu material baru.", type:"updated" },
    ] },
  { id:"t-004", ticketNo:"TKT-20240909-004", cabinCode:"CB-D0087", cabinModel:"Fortuner TRD",
    createdAt:td(9,0), createdByName:"Bayu Santoso", damageType:"electrical",
    description:"AC tidak dingin, kompresor perlu dicek.",
    priority:"urgent", status:"on_hold", assignedToName:"Bayu Santoso",
    startedAt:td(9,10),
    updates:[
      { id:"u12", timestamp:td(9,0),  authorName:"Bayu Santoso", note:"Tiket dibuat.", type:"created" },
      { id:"u13", timestamp:td(9,10), authorName:"Bayu Santoso", note:"Mulai diagnosa sistem AC.", type:"started" },
      { id:"u14", timestamp:td(9,50), authorName:"Bayu Santoso", note:"Menunggu sparepart kompresor dari gudang.", type:"hold" },
    ] },
];

const DAILY_TREND = [
  {day:"Sen",count:14},{day:"Sel",count:18},{day:"Rab",count:11},
  {day:"Kam",count:20},{day:"Jum",count:16},{day:"Sab",count:8},{day:"Hari ini",count:3},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDur=(s:number)=>{const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;if(h>0)return`${h}j ${m}m`;if(m>0)return`${m}m ${sec}d`;return`${sec}d`;};
const fmtTime=(d:Date)=>d.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
const fmtDate=(d:Date)=>d.toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});
const fmtShort=(d:Date)=>d.toLocaleDateString("id-ID",{day:"numeric",month:"short"});
const elapsed=(s:Date)=>fmtDur(Math.floor((Date.now()-s.getTime())/1000));

const DAMAGE_LABELS:Record<DamageType,string>={body:"Body",interior:"Interior",electrical:"Elektrikal",mechanical:"Mekanikal",paint:"Cat",other:"Lainnya"};

const STATUS_CFG:Record<TicketStatus,{label:string,color:string,bg:string,dot:string}>={
  open:        {label:"Open",       color:T.blue,   bg:T.blueL,   dot:T.blue  },
  in_progress: {label:"In Progress",color:T.orange, bg:T.orangeL, dot:T.orange},
  on_hold:     {label:"On Hold",    color:T.amber,  bg:T.amberL,  dot:T.amber },
  closed:      {label:"Selesai",    color:T.green,  bg:T.greenL,  dot:T.green },
};

const PRIORITY_CFG:Record<Priority,{label:string,color:string,bg:string}>={
  low:    {label:"Rendah", color:T.sub,    bg:"#f3f4f6"},
  normal: {label:"Normal", color:T.blue,   bg:T.blueL },
  high:   {label:"Tinggi", color:T.amber,  bg:T.amberL},
  urgent: {label:"Urgent", color:T.red,    bg:T.redL  },
};

const UPDATE_DOT:Record<UpdateType,string>={created:T.blue,started:T.orange,updated:T.sub,hold:T.amber,resumed:T.violet,closed:T.green};
const UPDATE_LABEL:Record<UpdateType,string>={created:"Tiket Dibuat",started:"Mulai Pengerjaan",updated:"Update Progress",hold:"Ditahan",resumed:"Dilanjutkan",closed:"Tiket Ditutup"};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic={
  Scan:({s=24}:{s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12" strokeWidth="2.2"/></svg>,
  Ticket:({s=22}:{s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>,
  Grid:({s=22}:{s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  User:({s=22}:{s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Bell:({s=20}:{s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Arrow:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Chev:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Check:({s=18}:{s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Plus:({s=20}:{s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Play:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Pause:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="6" y1="4" x2="6" y2="20"/><line x1="18" y1="4" x2="18" y2="20"/></svg>,
  X:({s=18}:{s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Pin:({s=13}:{s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Wrench:({s=13}:{s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Card({children,style,onClick}:{children:React.ReactNode;style?:React.CSSProperties;onClick?:()=>void}){
  return <div onClick={onClick} style={{background:T.card,borderRadius:16,boxShadow:T.shadow,...style}}>{children}</div>;
}

// Section header matching image-2 style
function SectionHd({title,count,action,onAction}:{title:string;count?:number;action?:string;onAction?:()=>void}){
  return(
    <div className="flex justify-between items-center mb-3">
      <p style={{...TS.md,fontWeight:600,color:T.text}}>{title}</p>
      <button onClick={onAction} className="flex items-center gap-1.5 transition-opacity active:opacity-60">
        {action&&<span style={{...TS.xs,fontWeight:500,color:T.sub}}>{action}</span>}
        {count!==undefined&&<span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white" style={{...TS.xs,background:T.orange}}>{count}</span>}
        {(action||count!==undefined)&&<span style={{color:T.sub}}><Ic.Chev/></span>}
      </button>
    </div>
  );
}

// Status badge with dot — image-2 style
function StatusDot({status}:{status:TicketStatus}){
  const c=STATUS_CFG[status];
  return(
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{...TS.xs,fontWeight:600,color:c.color,background:c.bg}}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:c.dot}}/>
      {c.label}
    </span>
  );
}

function PriorityPill({priority}:{priority:Priority}){
  const c=PRIORITY_CFG[priority];
  return <span className="px-2 py-0.5 rounded-full" style={{...TS.xs,fontWeight:600,color:c.color,background:c.bg}}>{c.label}</span>;
}

function BackBtn({onBack}:{onBack:()=>void}){
  return(
    <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity active:opacity-50"
      style={{background:T.card,boxShadow:T.shadow,color:T.text}}><Ic.Arrow/></button>
  );
}

// ─── Ticket row — image-2 list item style (colored left bar) ────────────────

function TicketRow({ticket,onClick}:{ticket:RepairTicket;onClick:()=>void}){
  const barColor = ticket.status==="closed"?T.green:ticket.status==="in_progress"?T.orange:ticket.status==="on_hold"?T.amber:T.blue;
  const isActive = ticket.status==="in_progress";
  return(
    <button onClick={onClick} className="w-full text-left transition-opacity active:opacity-70 mb-3">
      <Card style={{padding:0,overflow:"hidden",display:"flex"}}>
        {/* Left accent bar */}
        <div style={{width:4,background:barColor,flexShrink:0,borderRadius:"16px 0 0 16px"}}/>
        <div className="flex-1 px-4 py-3.5">
          <div className="flex justify-between items-start mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:`${barColor}18`}}>
                <span style={{color:barColor}}><Ic.Wrench s={13}/></span>
              </div>
              <div>
                <p className="leading-tight" style={{...TS.md,fontWeight:700,color:T.text}}>{ticket.cabinCode}</p>
                <p style={{...TS.xs,color:T.sub}}>{ticket.cabinModel}</p>
              </div>
            </div>
            <StatusDot status={ticket.status}/>
          </div>
          <p className="mb-2 line-clamp-1" style={{...TS.xs,color:T.muted,paddingLeft:36}}>{DAMAGE_LABELS[ticket.damageType]} — {ticket.description}</p>
          <div className="flex items-center justify-between" style={{paddingLeft:36}}>
            <div className="flex items-center gap-1" style={{color:T.muted}}>
              <Ic.Pin s={11}/>
              <span style={{...TS.xs}}>{fmtShort(ticket.createdAt)}, {fmtTime(ticket.createdAt)}</span>
            </div>
            {isActive&&ticket.startedAt&&(
              <span style={{...TS.xs,fontWeight:600,color:T.orange}}>⏱ {elapsed(ticket.startedAt)}</span>
            )}
            {ticket.status==="closed"&&ticket.durationSeconds&&(
              <span style={{...TS.xs,fontWeight:600,color:T.green}}>{fmtDur(ticket.durationSeconds)}</span>
            )}
          </div>
        </div>
      </Card>
    </button>
  );
}

// Activity card — image-2 "Today's Updates" style
function ActivityCard({ticket}:{ticket:RepairTicket}){
  const lastUpdate = ticket.updates[ticket.updates.length-1];
  const isPreventive = ticket.damageType==="mechanical"||ticket.damageType==="electrical";
  const pillColor = isPreventive?T.orange:T.blue;
  const pillBg    = isPreventive?T.orangeL:T.blueL;
  const pillLabel = isPreventive?"Preventif":"Repair";
  return(
    <Card style={{padding:0,overflow:"hidden",marginBottom:12}}>
      {/* Top: category pill + date */}
      <div className="flex justify-between items-center px-4 pt-3.5 pb-2">
        <span className="px-3 py-1 rounded-full" style={{...TS.xs,fontWeight:700,color:pillColor,background:pillBg}}>{pillLabel}</span>
        <span style={{...TS.xs,color:T.muted}}>{fmtDate(lastUpdate.timestamp)}, {fmtTime(lastUpdate.timestamp)}</span>
      </div>
      {/* Body */}
      <div className="flex gap-3 px-4 pb-3">
        {/* Placeholder image */}
        <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center" style={{background:`${pillColor}15`}}>
          <Ic.Wrench s={22}/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Ic.Wrench s={12}/>
            <p style={{...TS.sm,fontWeight:600,color:T.text}}>{ticket.cabinCode} – {ticket.cabinModel}</p>
          </div>
          <div className="flex items-center gap-1.5 mb-1" style={{color:T.sub}}>
            <Ic.Pin s={12}/>
            <p style={{...TS.xs}}>{ticket.damageType==="body"?"Line A":ticket.damageType==="paint"?"Line B":"Line C"}</p>
          </div>
          <p style={{...TS.xs,color:T.sub}}>{lastUpdate.note.slice(0,70)}{lastUpdate.note.length>70?"…":""}</p>
        </div>
      </div>
      {/* Footer: user + status */}
      <div className="flex justify-between items-center px-4 py-2.5" style={{borderTop:`1px solid ${T.borderL}`}}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white" style={{...TS.xs,background:T.orange}}>{ticket.createdByName[0]}</div>
          <span style={{...TS.xs,color:T.sub}}>{ticket.createdByName}</span>
        </div>
        <StatusDot status={ticket.status}/>
      </div>
    </Card>
  );
}

// ─── Scan Screen ──────────────────────────────────────────────────────────────
function ScanScreen({onBack,tickets,onCabinScanned}:{onBack:()=>void;tickets:RepairTicket[];onCabinScanned:(c:ScannedCabin,e:RepairTicket|null)=>void}){
  const [phase,setPhase]=useState<"idle"|"scanning"|"detected">("idle");
  const [countdown,setCountdown]=useState(3);
  const [cabin,setCabin]=useState<ScannedCabin|null>(null);
  const [existing,setExisting]=useState<RepairTicket|null>(null);
  const ref=useRef<ReturnType<typeof setInterval>|null>(null);
  const CABINS=[{code:"CB-A0412",model:"Dyna 130 HT"},{code:"CB-B0091",model:"Dyna 110 ST"},{code:"CB-E0055",model:"Hilux SR5"},{code:"CB-F0033",model:"Fortuner TRD"},{code:"CB-G0021",model:"Dyna 130 HT"}];

  function startScan(){
    setPhase("scanning");setCountdown(3);let c=3;
    ref.current=setInterval(()=>{c--;setCountdown(c);if(c<=0){clearInterval(ref.current!);const p=CABINS[Math.floor(Math.random()*CABINS.length)];const open=tickets.find(t=>t.cabinCode===p.code&&t.status!=="closed")||null;setCabin(p);setExisting(open);setPhase("detected");}},1000);
  }
  useEffect(()=>()=>{if(ref.current)clearInterval(ref.current)},[]);

  return(
    <div className="flex flex-col h-full" style={{background:T.bg}}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3" style={{background:T.card,boxShadow:T.shadow}}>
        <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{background:T.bg,color:T.text}}><Ic.Arrow/></button>
        <p style={{...TS.lg,fontWeight:600,color:T.text}}>Scan Cabin</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-8">
        {phase==="idle"&&(
          <>
            <Card style={{width:220,height:220,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              {[["top-3 left-3 border-t-2 border-l-2"],["top-3 right-3 border-t-2 border-r-2"],["bottom-3 left-3 border-b-2 border-l-2"],["bottom-3 right-3 border-b-2 border-r-2"]].map(([cls],i)=>(
                <div key={i} className={`absolute ${cls} w-7 h-7 rounded-sm`} style={{borderColor:T.orange}}/>
              ))}
              <div className="text-center" style={{color:T.muted}}><Ic.Scan s={52}/><p className="mt-3" style={{...TS.xs}}>Arahkan kamera</p></div>
            </Card>
            <div className="text-center">
              <p style={{...TS.md,fontWeight:600,color:T.text}}>Scan tag barcode cabin</p>
              <p className="mt-1" style={{...TS.sm,color:T.muted}}>Kamera akan membaca QR/barcode pada cabin</p>
            </div>
            <button onClick={startScan} className="w-full py-4 rounded-2xl text-white transition-opacity active:opacity-80" style={{...TS.md,fontWeight:700,background:T.orange,boxShadow:`0 6px 20px ${T.orange}55`}}>Mulai Scan</button>
          </>
        )}
        {phase==="scanning"&&(
          <>
            <Card style={{width:220,height:220,display:"flex",alignItems:"center",justifyContent:"center",border:`2.5px solid ${T.orange}`}}>
              <div className="text-center"><p className="font-light" style={{fontSize:64,lineHeight:"72px",color:T.orange}}>{countdown}</p><p className="mt-2" style={{...TS.sm,color:T.muted}}>Mendeteksi...</p></div>
            </Card>
            <p style={{...TS.sm,color:T.muted}}>Tahan kamera agar stabil</p>
          </>
        )}
        {phase==="detected"&&cabin&&(
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{background:T.green}}><Ic.Check s={12}/></span>
              <p style={{...TS.sm,fontWeight:600,color:T.green}}>Cabin terdeteksi</p>
            </div>
            <Card style={{padding:20}}>
              <p className="mb-2 uppercase tracking-widest" style={{...TS.xs,fontWeight:600,color:T.muted}}>Informasi Cabin</p>
              <p style={{...TS["2xl"],fontWeight:700,color:T.text}}>{cabin.code}</p>
              <p className="mt-0.5" style={{...TS.sm,color:T.sub}}>{cabin.model}</p>
            </Card>
            {existing?(
              <>
                <div className="rounded-2xl p-4 flex gap-3" style={{background:T.amberL,border:`1px solid ${T.amberB}`}}>
                  <span style={{color:T.amber,flexShrink:0}}><Ic.Wrench s={16}/></span>
                  <div><p style={{...TS.sm,fontWeight:600,color:T.amber}}>Tiket aktif ditemukan</p><p className="mt-0.5" style={{...TS.xs,color:T.sub}}>{existing.ticketNo} · {STATUS_CFG[existing.status].label}</p></div>
                </div>
                <button onClick={()=>onCabinScanned(cabin,existing)} className="w-full py-4 rounded-2xl text-white transition-opacity active:opacity-80" style={{...TS.md,fontWeight:700,background:T.orange}}>Lihat Tiket Aktif</button>
              </>
            ):(
              <>
                <div className="rounded-2xl p-4 flex gap-3" style={{background:T.greenL,border:`1px solid ${T.greenB}`}}>
                  <span style={{color:T.green}}><Ic.Check s={16}/></span>
                  <p style={{...TS.sm,color:T.sub}}>Tidak ada tiket aktif. Buat tiket perbaikan baru.</p>
                </div>
                <button onClick={()=>onCabinScanned(cabin,null)} className="w-full py-4 rounded-2xl text-white transition-opacity active:opacity-80" style={{...TS.md,fontWeight:700,background:T.orange,boxShadow:`0 6px 20px ${T.orange}55`}}>Buat Tiket Perbaikan</button>
              </>
            )}
            <button onClick={()=>setPhase("idle")} className="w-full py-3.5 rounded-2xl transition-opacity active:opacity-60" style={{...TS.sm,fontWeight:600,background:T.card,boxShadow:T.shadow,color:T.sub}}>Scan Ulang</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Create Ticket Screen ─────────────────────────────────────────────────────
function CreateTicketScreen({cabin,onBack,onCreated}:{cabin:ScannedCabin;onBack:()=>void;onCreated:(t:RepairTicket)=>void}){
  const [damageType,setDamageType]=useState<DamageType>("body");
  const [description,setDescription]=useState("");
  const [priority,setPriority]=useState<Priority>("normal");
  const [error,setError]=useState("");
  const damageOpts:DamageType[]=["body","paint","interior","electrical","mechanical","other"];
  const priorityOpts:Priority[]=["low","normal","high","urgent"];

  function submit(){
    if(!description.trim()){setError("Deskripsi kerusakan wajib diisi.");return;}
    const now=new Date();
    const ticket:RepairTicket={id:`t-${Date.now()}`,ticketNo:newNo(),cabinCode:cabin.code,cabinModel:cabin.model,createdAt:now,createdByName:ME.name,damageType,description:description.trim(),priority,status:"open",updates:[{id:`u-${Date.now()}`,timestamp:now,authorName:ME.name,note:`Tiket dibuat setelah scan cabin ${cabin.code}.`,type:"created"}]};
    onCreated(ticket);
  }

  return(
    <div className="flex flex-col h-full" style={{background:T.bg}}>
      <div className="px-5 pt-12 pb-4 flex items-center gap-3" style={{background:T.card,boxShadow:T.shadow}}>
        <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{background:T.bg,color:T.text}}><Ic.Arrow/></button>
        <div>
          <p style={{...TS.lg,fontWeight:600,color:T.text}}>Buat Tiket Perbaikan</p>
          <p style={{...TS.xs,color:T.muted}}>{cabin.code} · {cabin.model}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Cabin info card */}
        <Card style={{padding:16,display:"flex",alignItems:"center",gap:12}}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:T.orangeL}}><span style={{color:T.orange}}><Ic.Scan s={18}/></span></div>
          <div className="flex-1"><p style={{...TS.md,fontWeight:700,color:T.text}}>{cabin.code}</p><p style={{...TS.sm,color:T.sub}}>{cabin.model}</p></div>
          <span className="px-2.5 py-1 rounded-full" style={{...TS.xs,fontWeight:700,background:T.orangeL,color:T.orange}}>Baru</span>
        </Card>

        {/* Jenis kerusakan */}
        <div>
          <p className="mb-2.5 uppercase tracking-wide" style={{...TS.xs,fontWeight:600,color:T.sub}}>Jenis Kerusakan</p>
          <div className="grid grid-cols-3 gap-2">
            {damageOpts.map(d=>(
              <button key={d} onClick={()=>setDamageType(d)} className="py-2.5 rounded-xl transition-all active:scale-95" style={{...TS.xs,fontWeight:600,background:damageType===d?T.orange:T.card,color:damageType===d?"#fff":T.sub,boxShadow:damageType===d?`0 4px 12px ${T.orange}44`:T.shadow}}>
                {DAMAGE_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Prioritas */}
        <div>
          <p className="mb-2.5 uppercase tracking-wide" style={{...TS.xs,fontWeight:600,color:T.sub}}>Prioritas</p>
          <div className="grid grid-cols-4 gap-2">
            {priorityOpts.map(p=>{const c=PRIORITY_CFG[p];const sel=priority===p;return(
              <button key={p} onClick={()=>setPriority(p)} className="py-2.5 rounded-xl transition-all active:scale-95" style={{...TS.xs,fontWeight:700,background:sel?c.color:T.card,color:sel?"#fff":c.color,boxShadow:sel?`0 4px 12px ${c.color}44`:T.shadow}}>
                {c.label}
              </button>
            );})}
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <p className="mb-2.5 uppercase tracking-wide" style={{...TS.xs,fontWeight:600,color:T.sub}}>Deskripsi Kerusakan</p>
          <textarea value={description} onChange={e=>{setDescription(e.target.value);setError("");}} placeholder="Jelaskan kerusakan yang ditemukan…" rows={4}
            className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none resize-none"
            style={{background:T.card,border:`1.5px solid ${error?T.red:T.border}`,color:T.text,boxShadow:T.shadow}}/>
          {error&&<p className="mt-1.5" style={{...TS.xs,fontWeight:500,color:T.red}}>{error}</p>}
        </div>

        {/* Assigned */}
        <div>
          <p className="mb-2.5 uppercase tracking-wide" style={{...TS.xs,fontWeight:600,color:T.sub}}>Dikerjakan oleh</p>
          <Card style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0" style={{...TS.sm,background:T.orange}}>{ME.name[0]}</div>
            <div className="flex-1"><p style={{...TS.sm,fontWeight:600,color:T.text}}>{ME.name}</p><p style={{...TS.xs,color:T.muted}}>{ME.department}</p></div>
            <span className="px-2 py-0.5 rounded-full" style={{...TS.xs,fontWeight:700,background:T.orangeL,color:T.orange}}>Saya</span>
          </Card>
        </div>

        <button onClick={submit} className="w-full py-4 rounded-2xl text-white transition-opacity active:opacity-80" style={{...TS.md,fontWeight:700,background:T.orange,boxShadow:`0 6px 20px ${T.orange}55`}}>Buat Tiket Perbaikan</button>
      </div>
    </div>
  );
}

// ─── Ticket Detail Screen ─────────────────────────────────────────────────────
function TicketDetailScreen({ticket,onBack,onUpdate}:{ticket:RepairTicket;onBack:()=>void;onUpdate:(t:RepairTicket)=>void}){
  const [showUpdate,setShowUpdate]=useState(false);
  const [showClose,setShowClose]=useState(false);
  const [updateNote,setUpdateNote]=useState("");
  const [closeNote,setCloseNote]=useState("");
  const [,setTick]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setTick(p=>p+1),10000);return()=>clearInterval(t);},[]);

  function startRepair(){const now=new Date();onUpdate({...ticket,status:"in_progress",assignedToName:ME.name,startedAt:now,updates:[...ticket.updates,{id:`u-${Date.now()}`,timestamp:now,authorName:ME.name,note:"Pengerjaan dimulai.",type:"started"}]});}
  function addUpdate(){if(!updateNote.trim())return;const now=new Date();onUpdate({...ticket,updates:[...ticket.updates,{id:`u-${Date.now()}`,timestamp:now,authorName:ME.name,note:updateNote.trim(),type:"updated"}]});setUpdateNote("");setShowUpdate(false);}
  function holdTicket(){const now=new Date();onUpdate({...ticket,status:"on_hold",updates:[...ticket.updates,{id:`u-${Date.now()}`,timestamp:now,authorName:ME.name,note:"Pengerjaan ditahan sementara.",type:"hold"}]});}
  function resumeTicket(){const now=new Date();onUpdate({...ticket,status:"in_progress",updates:[...ticket.updates,{id:`u-${Date.now()}`,timestamp:now,authorName:ME.name,note:"Pengerjaan dilanjutkan.",type:"resumed"}]});}
  function closeTicket(){if(!closeNote.trim())return;const now=new Date();const dur=ticket.startedAt?Math.round((now.getTime()-ticket.startedAt.getTime())/1000):0;onUpdate({...ticket,status:"closed",closedAt:now,closureNotes:closeNote.trim(),durationSeconds:dur,updates:[...ticket.updates,{id:`u-${Date.now()}`,timestamp:now,authorName:ME.name,note:closeNote.trim(),type:"closed"}]});setCloseNote("");setShowClose(false);}

  const {status}=ticket;
  const barColor=status==="closed"?T.green:status==="in_progress"?T.orange:status==="on_hold"?T.amber:T.blue;

  return(
    <div className="flex flex-col h-full" style={{background:T.bg}}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4" style={{background:T.card,boxShadow:T.shadow}}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{background:T.bg,color:T.text}}><Ic.Arrow/></button>
          <div className="flex-1 min-w-0">
            <p style={{...TS.lg,fontWeight:700,color:T.text}}>{ticket.cabinCode}</p>
            <p style={{...TS.xs,color:T.muted}}>{ticket.ticketNo}</p>
          </div>
          <StatusDot status={status}/>
        </div>
        <div className="flex gap-2 flex-wrap pl-12">
          <span className="px-2.5 py-0.5 rounded-full" style={{...TS.xs,background:T.borderL,color:T.sub}}>{ticket.cabinModel}</span>
          <span className="px-2.5 py-0.5 rounded-full" style={{...TS.xs,background:T.borderL,color:T.sub}}>{DAMAGE_LABELS[ticket.damageType]}</span>
          <PriorityPill priority={ticket.priority}/>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Description card */}
        <div className="px-4 py-4">
          <Card style={{padding:16,borderLeft:`4px solid ${barColor}`}}>
            <p className="mb-1.5 uppercase tracking-wide" style={{...TS.xs,fontWeight:600,color:T.muted}}>Deskripsi Kerusakan</p>
            <p style={{...TS.sm,color:T.sub,lineHeight:1.65}}>{ticket.description}</p>
          </Card>
        </div>

        {/* Time stats */}
        <div className="px-4 mb-4">
          <Card style={{padding:0,overflow:"hidden"}}>
            <div className="grid grid-cols-3 divide-x" style={{borderColor:T.borderL}}>
              {[
                ["Dibuat",    fmtTime(ticket.createdAt)],
                ["Mulai",     ticket.startedAt?fmtTime(ticket.startedAt):"—"],
                status==="in_progress"&&ticket.startedAt?["Berlangsung",elapsed(ticket.startedAt)]:["Durasi",ticket.durationSeconds?fmtDur(ticket.durationSeconds):"—"],
              ].map(([l,v],i)=>(
                <div key={i} className="px-3 py-3.5 text-center" style={{borderRight:i<2?`1px solid ${T.borderL}`:undefined}}>
                  <p className="mb-1" style={{...TS.xs,color:T.muted}}>{l}</p>
                  <p style={{...TS.xs,fontWeight:700,color:i===2&&status==="in_progress"?T.orange:T.text}}>{v}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Action buttons */}
        {status!=="closed"&&(
          <div className="px-4 mb-4">
            <div className="flex gap-2 flex-wrap">
              {status==="open"&&<button onClick={startRepair} className="flex-1 py-3.5 rounded-2xl text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80" style={{...TS.md,fontWeight:700,background:T.orange,boxShadow:`0 4px 12px ${T.orange}44`}}><Ic.Play/>Mulai Perbaikan</button>}
              {status==="in_progress"&&<>
                <button onClick={()=>setShowUpdate(true)} className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-opacity active:opacity-80" style={{...TS.sm,fontWeight:600,background:T.card,boxShadow:T.shadow,color:T.text}}><Ic.Plus s={15}/>Update</button>
                <button onClick={holdTicket} className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-opacity active:opacity-80" style={{...TS.sm,fontWeight:600,background:T.amberL,border:`1px solid ${T.amberB}`,color:T.amber}}><Ic.Pause/>Tahan</button>
                <button onClick={()=>setShowClose(true)} className="w-full py-3.5 rounded-2xl text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80 mt-1" style={{...TS.md,fontWeight:700,background:T.green,boxShadow:`0 4px 12px ${T.green}44`}}><Ic.Check/>Tutup Tiket</button>
              </>}
              {status==="on_hold"&&<>
                <button onClick={resumeTicket} className="flex-1 py-3.5 rounded-2xl text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80" style={{...TS.md,fontWeight:700,background:T.orange}}><Ic.Play/>Lanjutkan</button>
                <button onClick={()=>setShowClose(true)} className="flex-1 py-3.5 rounded-2xl text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80" style={{...TS.md,fontWeight:700,background:T.green}}><Ic.Check/>Selesai</button>
              </>}
            </div>
          </div>
        )}

        {/* Closure note */}
        {status==="closed"&&ticket.closureNotes&&(
          <div className="px-4 mb-4">
            <Card style={{padding:16,background:T.greenL,border:`1px solid ${T.greenB}`}}>
              <p className="mb-1" style={{...TS.xs,fontWeight:700,color:T.green}}>Catatan Penutupan</p>
              <p style={{...TS.sm,color:T.sub}}>{ticket.closureNotes}</p>
            </Card>
          </div>
        )}

        {/* Timeline */}
        <div className="px-4 pb-5">
          <p className="mb-3 uppercase tracking-wider" style={{...TS.xs,fontWeight:700,color:T.sub}}>Riwayat Tiket</p>
          <div className="relative pl-5">
            <div className="absolute left-2 top-2 bottom-2 w-px" style={{background:T.border}}/>
            {[...ticket.updates].reverse().map((u,i)=>(
              <div key={u.id} className="relative mb-3">
                <div className="absolute -left-3 top-2 w-2.5 h-2.5 rounded-full border-2 border-white" style={{background:UPDATE_DOT[u.type]}}/>
                <Card style={{padding:"12px 14px"}}>
                  <div className="flex justify-between items-center mb-1">
                    <p style={{...TS.xs,fontWeight:700,color:UPDATE_DOT[u.type]}}>{UPDATE_LABEL[u.type]}</p>
                    <p style={{...TS.xs,color:T.muted}}>{fmtTime(u.timestamp)}</p>
                  </div>
                  <p style={{...TS.sm,color:T.sub}}>{u.note}</p>
                  <p className="mt-1" style={{...TS.xs,color:T.muted}}>{u.authorName}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Update modal */}
      {showUpdate&&(
        <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{background:"rgba(0,0,0,0.45)"}}>
          <div className="rounded-t-3xl p-5 space-y-4" style={{background:T.card}}>
            <div className="flex justify-between items-center">
              <p style={{...TS.md,fontWeight:700,color:T.text}}>Tambah Update Progress</p>
              <button onClick={()=>setShowUpdate(false)} style={{color:T.muted}}><Ic.X s={20}/></button>
            </div>
            <textarea value={updateNote} onChange={e=>setUpdateNote(e.target.value)} placeholder="Deskripsikan progress perbaikan saat ini…" rows={4}
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none" style={{background:T.bg,border:`1.5px solid ${T.border}`,color:T.text}}/>
            <button onClick={addUpdate} className="w-full py-4 rounded-2xl text-white transition-opacity active:opacity-80" style={{...TS.md,fontWeight:700,background:T.orange}}>Simpan Update</button>
          </div>
        </div>
      )}

      {/* Close modal */}
      {showClose&&(
        <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{background:"rgba(0,0,0,0.45)"}}>
          <div className="rounded-t-3xl p-5 space-y-4" style={{background:T.card}}>
            <div className="flex justify-between items-center">
              <p style={{...TS.md,fontWeight:700,color:T.text}}>Tutup Tiket Perbaikan</p>
              <button onClick={()=>setShowClose(false)} style={{color:T.muted}}><Ic.X s={20}/></button>
            </div>
            <p style={{...TS.sm,color:T.sub}}>Tambahkan catatan penutupan dan konfirmasi perbaikan selesai.</p>
            <textarea value={closeNote} onChange={e=>setCloseNote(e.target.value)} placeholder="Hasil perbaikan, kondisi akhir cabin…" rows={4}
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none" style={{background:T.bg,border:`1.5px solid ${T.border}`,color:T.text}}/>
            <div className="flex gap-3">
              <button onClick={()=>setShowClose(false)} className="flex-1 py-4 rounded-2xl transition-opacity active:opacity-60" style={{...TS.sm,fontWeight:600,background:T.bg,border:`1px solid ${T.border}`,color:T.sub}}>Batal</button>
              <button onClick={closeTicket} className="py-4 px-6 rounded-2xl text-white transition-opacity active:opacity-80" style={{...TS.md,fontWeight:700,background:closeNote.trim()?T.green:"#ccc",flex:2}}>Tutup Tiket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tickets List Screen ──────────────────────────────────────────────────────
function TicketsScreen({tickets,onDetail}:{tickets:RepairTicket[];onDetail:(t:RepairTicket)=>void}){
  const [filter,setFilter]=useState<TicketStatus|"all">("all");
  const filters:[TicketStatus|"all",string][]=[["all","Semua"],["open","Open"],["in_progress","Proses"],["on_hold","Hold"],["closed","Selesai"]];
  const shown=[...( filter==="all"?tickets:tickets.filter(t=>t.status===filter))].sort((a,b)=>b.createdAt.getTime()-a.createdAt.getTime());

  return(
    <div className="flex flex-col h-full" style={{background:T.bg}}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4" style={{background:T.card,boxShadow:T.shadow}}>
        <p style={{...TS.xs,color:T.muted}}>Semua tiket</p>
        <p style={{...TS.xl,fontWeight:700,color:T.text}}>Tiket Perbaikan</p>
      </div>

      {/* Filter pills */}
      <div className="px-4 py-3" style={{background:T.card,boxShadow:T.shadow}}>
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{scrollbarWidth:"none"}}>
          {filters.map(([key,label])=>{
            const cnt=key==="all"?tickets.length:tickets.filter(t=>t.status===key).length;
            const sel=filter===key;
            return(
              <button key={key} onClick={()=>setFilter(key)} className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all" style={{...TS.xs,fontWeight:600,background:sel?T.orange:T.bg,color:sel?"#fff":T.sub}}>
                {label}
                {cnt>0&&<span className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-white" style={{fontSize:10,background:sel?`rgba(255,255,255,0.3)`:T.muted}}>{cnt}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {shown.length===0?(
          <div className="flex flex-col items-center justify-center h-40 gap-2" style={{color:T.muted}}>
            <Ic.Ticket s={36}/><p style={{...TS.sm}}>Tidak ada tiket</p>
          </div>
        ):shown.map(t=><TicketRow key={t.id} ticket={t} onClick={()=>onDetail(t)}/>)}
      </div>
    </div>
  );
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────
function DashboardScreen({tickets}:{tickets:RepairTicket[]}){
  const closed=tickets.filter(t=>t.status==="closed");
  const inProg=tickets.filter(t=>t.status==="in_progress");
  const onHold=tickets.filter(t=>t.status==="on_hold");
  const avgDurSec=closed.filter(t=>t.durationSeconds).length?Math.round(closed.reduce((a,t)=>a+(t.durationSeconds??0),0)/closed.filter(t=>t.durationSeconds).length):0;

  return(
    <div className="flex flex-col h-full" style={{background:T.bg}}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4" style={{background:T.card,boxShadow:T.shadow}}>
        <p style={{...TS.xs,color:T.muted}}>Ringkasan hari ini</p>
        <p style={{...TS.xl,fontWeight:700,color:T.text}}>Dashboard</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {/* Two KPI cards — image-2 style */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl p-4" style={{background:T.blue,boxShadow:`0 6px 20px ${T.blue}44`}}>
            <p className="mb-2" style={{...TS.xs,fontWeight:600,color:"rgba(255,255,255,0.8)"}}>Tiket Selesai</p>
            <p style={{...TS["3xl"],fontWeight:700,color:"#fff"}}>{closed.length}</p>
            <p className="mt-1" style={{...TS.xs,color:"rgba(255,255,255,0.6)"}}>Hari ini</p>
          </div>
          <div className="rounded-2xl p-4" style={{background:T.orange,boxShadow:`0 6px 20px ${T.orange}44`}}>
            <p className="mb-2" style={{...TS.xs,fontWeight:600,color:"rgba(255,255,255,0.8)"}}>Sedang Dikerjakan</p>
            <p style={{...TS["3xl"],fontWeight:700,color:"#fff"}}>{inProg.length}</p>
            <p className="mt-1" style={{...TS.xs,color:"rgba(255,255,255,0.6)"}}>In progress</p>
          </div>
        </div>

        {/* Secondary KPI row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            {label:"On Hold",   value:onHold.length, color:T.amber  },
            {label:"Rata-rata", value:avgDurSec?fmtDur(avgDurSec):"—", color:T.green  },
            {label:"Total",     value:tickets.length, color:T.violet },
          ].map(({label,value,color})=>(
            <Card key={label} style={{padding:"12px 10px",textAlign:"center"}}>
              <p className="leading-none" style={{...TS.xl,fontWeight:700,color}}>{value}</p>
              <p className="mt-1.5" style={{...TS.xs,color:T.muted}}>{label}</p>
            </Card>
          ))}
        </div>

        {/* Trend chart */}
        <div className="mb-5">
          <SectionHd title="Tren Tiket Selesai — 7 Hari"/>
          <Card style={{padding:"16px 12px 8px"}}>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={DAILY_TREND} barCategoryGap="32%">
                <XAxis dataKey="day" tick={{fontSize:10,fill:T.muted,fontFamily:"'Inter', sans-serif"}} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{background:T.card,border:"none",borderRadius:12,boxShadow:T.shadow2,fontSize:12,fontFamily:"'Inter', sans-serif"}} cursor={{fill:T.borderL,radius:6}} formatter={(v:number)=>[`${v} tiket`,""]}/>
                <Bar dataKey="count" radius={[6,6,0,0]}>
                  {DAILY_TREND.map((_,i)=><Cell key={i} fill={i===DAILY_TREND.length-1?T.orange:`${T.orange}50`}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* By damage */}
        <div className="mb-4">
          <SectionHd title="Per Jenis Kerusakan"/>
          <Card>
            {(["body","paint","interior","electrical","mechanical"] as DamageType[]).map((d,i,arr)=>{
              const cnt=tickets.filter(t=>t.damageType===d).length;
              const max=Math.max(...arr.map(x=>tickets.filter(t=>t.damageType===x).length),1);
              return(
                <div key={d} className="flex items-center gap-3 px-4 py-3" style={{borderBottom:i<arr.length-1?`1px solid ${T.borderL}`:undefined}}>
                  <p className="w-20 flex-shrink-0" style={{...TS.sm,color:T.sub}}>{DAMAGE_LABELS[d]}</p>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{background:T.borderL}}>
                    <div className="h-full rounded-full" style={{width:`${(cnt/max)*100}%`,background:T.orange}}/>
                  </div>
                  <p className="w-4 text-right flex-shrink-0" style={{...TS.sm,fontWeight:700,color:T.orange}}>{cnt}</p>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({tickets,onScan,onTicketDetail,onAllTickets}:{tickets:RepairTicket[];onScan:()=>void;onTicketDetail:(t:RepairTicket)=>void;onAllTickets:()=>void}){
  const [,setTick]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setTick(p=>p+1),30000);return()=>clearInterval(t);},[]);

  const now2=new Date();
  const hour=now2.getHours();
  const greeting=hour<12?"Selamat Pagi":hour<17?"Selamat Siang":"Selamat Sore";
  const myTickets=tickets.filter(t=>t.createdByName===ME.name||t.assignedToName===ME.name);
  const myActive=myTickets.filter(t=>t.status==="in_progress"||t.status==="on_hold");
  const myClosed=myTickets.filter(t=>t.status==="closed");
  const recentUpdates=[...tickets].sort((a,b)=>b.updates[b.updates.length-1].timestamp.getTime()-a.updates[a.updates.length-1].timestamp.getTime()).slice(0,3);

  return(
    <div className="flex flex-col h-full" style={{background:T.bg}}>
      {/* Header — version 8 white style */}
      <div className="px-5 pt-12 pb-3 flex justify-between items-center" style={{background:T.card}}>
        <div>
          <p style={{...TS.sm,color:T.sub}}>{greeting},</p>
          <p className="leading-tight" style={{...TS.lg,fontWeight:700,color:T.text}}>{ME.name.split(" ")[0]}!</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:T.bg,color:T.sub}}>
            <Ic.Bell s={18}/>
          </button>
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white" style={{...TS.sm,background:T.orange}}>{ME.name[0]}</div>
        </div>
      </div>

      {/* 3 KPI cards — version 8 style */}
      <div className="px-4 py-4 mb-1" style={{background:T.card,boxShadow:T.shadow}}>
        <div className="grid grid-cols-3 gap-3">
          {[
            {label:"Selesai",   value:myClosed.length,   sub:"oleh saya",  color:T.green },
            {label:"Aktif",     value:myActive.length,   sub:"dikerjakan", color:T.orange},
            {label:"Total",     value:myTickets.length,  sub:"tiket saya", color:T.blue  },
          ].map(({label,value,sub,color})=>(
            <Card key={label} style={{padding:"12px 10px"}}>
              <p className="leading-none" style={{...TS["2xl"],fontWeight:700,color}}>{value}</p>
              <p className="mt-2 leading-tight" style={{...TS.xs,fontWeight:600,color:T.text}}>{label}</p>
              <p className="mt-0.5" style={{...TS.xs,color:T.muted}}>{sub}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Today's tickets — image-2 "Today's Jobs" style */}
        <div className="mb-5">
          <SectionHd title="Today's Tickets" count={myActive.length} action="See all" onAction={onAllTickets}/>
          {myActive.length===0?(
            <Card style={{padding:20,textAlign:"center"}}><p style={{...TS.sm,color:T.muted}}>Tidak ada tiket aktif</p></Card>
          ):myActive.map(t=><TicketRow key={t.id} ticket={t} onClick={()=>onTicketDetail(t)}/>)}
        </div>

        {/* Today's updates — image-2 "Today's Updates" style */}
        <div>
          <SectionHd title="Today's Updates" count={recentUpdates.length} action="See all" onAction={onAllTickets}/>
          {recentUpdates.map(t=><ActivityCard key={t.id} ticket={t}/>)}
        </div>
      </div>
    </div>
  );
}

// ─── Profil Screen ────────────────────────────────────────────────────────────
function ProfilScreen({onLogout}:{onLogout:()=>void}){
  return(
    <div className="flex flex-col h-full" style={{background:T.bg}}>
      <div className="px-5 pt-12 pb-4" style={{background:T.card,boxShadow:T.shadow}}>
        <p style={{...TS.xs,color:T.muted}}>Akun saya</p>
        <p style={{...TS.xl,fontWeight:700,color:T.text}}>Profil</p>
      </div>
      <div className="px-4 py-5 space-y-4">
        <Card style={{padding:20,display:"flex",alignItems:"center",gap:16}}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0" style={{...TS.xl,background:T.orange}}>{ME.name[0]}</div>
          <div>
            <p style={{...TS.md,fontWeight:700,color:T.text}}>{ME.name}</p>
            <p style={{...TS.sm,color:T.sub}}>{ME.department}</p>
            <p className="mt-0.5" style={{...TS.xs,color:T.muted}}>NIK {ME.nik}</p>
          </div>
        </Card>
        <Card>
          {[["NIK",ME.nik],["Departemen",ME.department],["Role","Manpower"],["Status","Aktif"],["Versi App","1.0.0"]].map(([l,v],i,arr)=>(
            <div key={l} className="flex justify-between items-center px-5 py-3.5" style={{borderBottom:i<arr.length-1?`1px solid ${T.borderL}`:undefined}}>
              <span style={{...TS.sm,color:T.muted}}>{l}</span>
              <span style={{...TS.sm,fontWeight:600,color:T.text}}>{v}</span>
            </div>
          ))}
        </Card>
        <button onClick={onLogout} className="w-full py-4 rounded-2xl transition-opacity active:opacity-70" style={{...TS.sm,fontWeight:600,background:T.redL,border:`1px solid ${T.redB}`,color:T.red}}>Keluar dari Akun</button>
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({onLogin}:{onLogin:()=>void}){
  const [nik,setNik]=useState(""); const [pin,setPin]=useState(""); const [err,setErr]=useState("");
  function submit(e:React.FormEvent){e.preventDefault();nik==="240315"&&pin==="1234"?onLogin():setErr("NIK atau PIN tidak valid.");}
  return(
    <div className="flex flex-col h-full" style={{background:"#f8faff"}}>
      <div className="flex-1 flex flex-col" style={{position:"relative",overflow:"hidden"}}>
        {/* Light blue-tinted background wash */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,#e8f0fe 0%,#f8faff 55%,#fff7ed 100%)",zIndex:0}}/>

        {/* Illustration */}
        <div className="flex-1 flex items-end justify-center px-2 pb-0" style={{position:"relative",zIndex:1}}>
          <svg viewBox="0 0 360 290" width="100%" style={{maxHeight:280,display:"block"}} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="truckBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2d5be3"/>
                <stop offset="100%" stopColor="#1a3bb8"/>
              </linearGradient>
              <linearGradient id="truckRoof" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3568f0"/>
                <stop offset="100%" stopColor="#2550d0"/>
              </linearGradient>
              <linearGradient id="truckSide" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1e3ea8"/>
                <stop offset="100%" stopColor="#2d5be3"/>
              </linearGradient>
              <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c8cfe0"/>
                <stop offset="100%" stopColor="#e8ecf4"/>
              </linearGradient>
              <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fddbb4"/>
                <stop offset="100%" stopColor="#f5c28a"/>
              </linearGradient>
              <linearGradient id="helmetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffb020"/>
                <stop offset="100%" stopColor="#e8940a"/>
              </linearGradient>
              <linearGradient id="vestGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff8c00"/>
                <stop offset="100%" stopColor="#e06b00"/>
              </linearGradient>
              <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#1a3bb8" floodOpacity="0.18"/>
              </filter>
              <filter id="scanGlow">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Ground / road surface */}
            <ellipse cx="175" cy="278" rx="168" ry="12" fill="url(#groundGrad)" opacity="0.7"/>
            <rect x="7" y="272" width="336" height="8" rx="4" fill="#d0d8e8" opacity="0.5"/>

            {/* ── TRUCK ── */}
            {/* Truck cab + chassis combined */}
            {/* Main body (cab) */}
            <rect x="55" y="148" width="200" height="118" rx="8" fill="url(#truckBody)" filter="url(#softShadow)"/>
            {/* Roof */}
            <path d="M75 148 C80 100 118 72 162 68 L228 68 C258 68 270 96 272 148Z" fill="url(#truckRoof)"/>
            {/* Roof highlight stripe */}
            <path d="M95 148 C100 106 130 80 162 76 L200 76 C225 78 238 104 240 148Z" fill="white" opacity="0.06"/>
            {/* A-pillar left */}
            <path d="M90 148 L114 78 L124 80 L98 148Z" fill="#1a3bb8" opacity="0.4"/>
            {/* A-pillar right */}
            <path d="M230 148 L218 80 L228 78 L244 148Z" fill="#1a3bb8" opacity="0.3"/>
            {/* Windshield */}
            <path d="M100 146 C105 104 130 80 162 76 L214 76 C240 80 248 108 250 146Z"
              fill="#a8c8f8" opacity="0.28"/>
            <path d="M100 146 C105 104 130 80 162 76 L214 76 C240 80 248 108 250 146Z"
              fill="none" stroke="#7ab0f0" strokeWidth="1.5"/>
            {/* Windshield glare left */}
            <path d="M112 140 C116 108 132 86 152 82 L162 82 C148 88 135 110 130 140Z" fill="white" opacity="0.12"/>
            {/* Windshield glare right */}
            <path d="M215 82 L228 84 C238 106 242 128 244 142 L230 144 C234 124 232 102 215 82Z" fill="white" opacity="0.06"/>

            {/* Cab door divider line */}
            <line x1="167" y1="148" x2="167" y2="258" stroke="#163090" strokeWidth="2.5"/>
            {/* Door panel recesses */}
            <rect x="62" y="155" width="100" height="90" rx="6" fill="#1e3eb5" opacity="0.35"/>
            <rect x="172" y="155" width="76" height="90" rx="6" fill="#1e3eb5" opacity="0.3"/>
            {/* Door handles */}
            <rect x="130" y="198" width="22" height="6" rx="3" fill="#5080e0"/>
            <rect x="186" y="198" width="18" height="6" rx="3" fill="#5080e0"/>
            {/* Door handle chrome */}
            <rect x="130" y="198" width="22" height="2" rx="1" fill="white" opacity="0.3"/>
            <rect x="186" y="198" width="18" height="2" rx="1" fill="white" opacity="0.3"/>

            {/* Left side window */}
            <rect x="66" y="156" width="56" height="36" rx="5" fill="#b8d8f8" opacity="0.22"/>
            <rect x="66" y="156" width="56" height="36" rx="5" fill="none" stroke="#6ba8e8" strokeWidth="1.2"/>
            <path d="M68 158 L76 158 L78 190 L68 190Z" fill="white" opacity="0.1"/>
            {/* Right side window */}
            <rect x="175" y="156" width="55" height="36" rx="5" fill="#b8d8f8" opacity="0.22"/>
            <rect x="175" y="156" width="55" height="36" rx="5" fill="none" stroke="#6ba8e8" strokeWidth="1.2"/>

            {/* Side mirror left */}
            <rect x="46" y="158" width="14" height="9" rx="2" fill="#2040a0"/>
            <rect x="56" y="160" width="4" height="5" rx="1" fill="#1a3080"/>
            {/* Side mirror right */}
            <rect x="254" y="158" width="14" height="9" rx="2" fill="#2040a0"/>
            <rect x="254" y="160" width="4" height="5" rx="1" fill="#1a3080"/>

            {/* Front grille area */}
            <rect x="55" y="230" width="200" height="30" rx="0" fill="#1630a0"/>
            {/* Grille bars */}
            <rect x="68" y="233" width="174" height="24" rx="3" fill="#122898"/>
            {[0,1,2,3,4,5,6,7].map(i=>(
              <rect key={i} x={72+i*21} y="234" width="16" height="22" rx="2" fill="#1a35b0" stroke="#3060d0" strokeWidth="0.5"/>
            ))}
            {/* Grille logo */}
            <rect x="148" y="238" width="30" height="14" rx="2" fill="#2550d0" opacity="0.6"/>

            {/* Front bumper */}
            <rect x="55" y="258" width="200" height="14" rx="4" fill="#d4d8e8"/>
            <rect x="55" y="258" width="200" height="5" rx="2" fill="white" opacity="0.4"/>
            {/* Bumper tow hook */}
            <rect x="148" y="260" width="30" height="8" rx="2" fill="#b0b8cc"/>

            {/* Headlight left */}
            <rect x="58" y="208" width="32" height="20" rx="4" fill="#fffbe6"/>
            <rect x="58" y="208" width="32" height="20" rx="4" fill="none" stroke="#f0c040" strokeWidth="1.2"/>
            <rect x="61" y="211" width="26" height="14" rx="2" fill="#ffe060" opacity="0.8"/>
            {/* DRL left */}
            <rect x="58" y="206" width="32" height="4" rx="2" fill="#fff0a0"/>
            {/* Headlight glow left */}
            <ellipse cx="74" cy="218" rx="26" ry="14" fill="#ffe040" opacity="0.12"/>

            {/* Headlight right */}
            <rect x="225" y="208" width="30" height="20" rx="4" fill="#fffbe6"/>
            <rect x="225" y="208" width="30" height="20" rx="4" fill="none" stroke="#f0c040" strokeWidth="1.2"/>
            <rect x="228" y="211" width="24" height="14" rx="2" fill="#ffe060" opacity="0.8"/>
            {/* DRL right */}
            <rect x="225" y="206" width="30" height="4" rx="2" fill="#fff0a0"/>

            {/* Wheels */}
            {/* Left front */}
            <ellipse cx="100" cy="266" rx="22" ry="22" fill="#1a1a1a"/>
            <ellipse cx="100" cy="266" rx="22" ry="22" fill="none" stroke="#333" strokeWidth="3"/>
            <ellipse cx="100" cy="266" rx="16" ry="16" fill="#252525"/>
            <ellipse cx="100" cy="266" rx="10" ry="10" fill="#111"/>
            <ellipse cx="100" cy="266" rx="5" ry="5" fill="#3a3a3a"/>
            {/* Wheel bolts */}
            {[0,1,2,3,4].map(i=>{const a=i*72*Math.PI/180;return <circle key={i} cx={100+12*Math.cos(a)} cy={266+12*Math.sin(a)} r="2" fill="#444"/>;} )}
            {/* Left tire sidewall highlight */}
            <path d="M80 252 Q84 248 92 250" stroke="#555" strokeWidth="1.5" fill="none"/>

            {/* Right front */}
            <ellipse cx="222" cy="266" rx="22" ry="22" fill="#1a1a1a"/>
            <ellipse cx="222" cy="266" rx="22" ry="22" fill="none" stroke="#333" strokeWidth="3"/>
            <ellipse cx="222" cy="266" rx="16" ry="16" fill="#252525"/>
            <ellipse cx="222" cy="266" rx="10" ry="10" fill="#111"/>
            <ellipse cx="222" cy="266" rx="5" ry="5" fill="#3a3a3a"/>
            {[0,1,2,3,4].map(i=>{const a=i*72*Math.PI/180;return <circle key={i} cx={222+12*Math.cos(a)} cy={266+12*Math.sin(a)} r="2" fill="#444"/>;} )}

            {/* ── BARCODE STICKER on right door ── */}
            <rect x="182" y="170" width="40" height="28" rx="3" fill="white" stroke="#ddd" strokeWidth="1"/>
            <rect x="184" y="172" width="36" height="20" rx="1" fill="white"/>
            {/* Barcode bars */}
            {[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>(
              <rect key={i} x={185+i*3} y="173" width={i%3===0?2.5:1.5} height="17" fill="#111" opacity={i%4===2?0.4:1}/>
            ))}
            <rect x="184" y="191" width="36" height="5" rx="1" fill="white"/>
            <text x="202" y="196" textAnchor="middle" fontSize="4.5" fill="#222" fontFamily="monospace" fontWeight="600">CB-A0412</text>
            {/* Sticker label */}
            <rect x="182" y="196" width="40" height="10" rx="0" fill="#f8f8f8"/>
            <text x="202" y="203" textAnchor="middle" fontSize="4" fill="#888" fontFamily="Inter,sans-serif">RFID TAG</text>

            {/* ── OPERATOR ── */}
            {/* Shadow under feet */}
            <ellipse cx="302" cy="271" rx="20" ry="5" fill="rgba(0,0,0,0.15)"/>

            {/* Right leg */}
            <rect x="295" y="230" width="11" height="38" rx="5" fill="#1e3a80"/>
            {/* Left leg */}
            <rect x="308" y="228" width="11" height="40" rx="5" fill="#1e3a80"/>
            {/* Trouser crease */}
            <line x1="300" y1="230" x2="300" y2="265" stroke="#162d68" strokeWidth="1" opacity="0.5"/>
            <line x1="313" y1="230" x2="313" y2="266" stroke="#162d68" strokeWidth="1" opacity="0.5"/>
            {/* Right boot */}
            <ellipse cx="300" cy="267" rx="10" ry="5" fill="#2a2a2a"/>
            <rect x="292" y="262" width="16" height="8" rx="3" fill="#333"/>
            <rect x="291" y="263" width="6" height="5" rx="2" fill="#444"/>
            {/* Left boot */}
            <ellipse cx="314" cy="268" rx="10" ry="5" fill="#2a2a2a"/>
            <rect x="306" y="263" width="16" height="8" rx="3" fill="#333"/>

            {/* Torso — safety vest orange */}
            <path d="M289 175 Q290 168 296 166 L320 166 Q326 168 326 175 L328 228 L286 228Z" fill="url(#vestGrad)" rx="4"/>
            {/* Vest collar */}
            <path d="M296 166 L308 178 L320 166" fill="none" stroke="#cc6600" strokeWidth="2"/>
            {/* Reflective tape horizontal */}
            <rect x="287" y="195" width="42" height="5" rx="2" fill="#ffe040" opacity="0.88"/>
            <rect x="287" y="210" width="42" height="5" rx="2" fill="#ffe040" opacity="0.88"/>
            {/* Vest pocket */}
            <rect x="315" y="178" width="10" height="12" rx="2" fill="#cc6600" opacity="0.5"/>
            <line x1="315" y1="184" x2="325" y2="184" stroke="#cc6600" strokeWidth="1"/>
            {/* Vest shadow / depth */}
            <path d="M289 175 L286 228 L295 228 L296 175Z" fill="black" opacity="0.06"/>

            {/* Right arm (extended toward truck with scanner) */}
            <path d="M290 180 Q276 188 268 198" stroke="#fddbb4" strokeWidth="12" strokeLinecap="round" fill="none"/>
            <path d="M290 180 Q276 188 268 198" stroke="#f0a060" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.3"/>
            {/* Scanner in hand */}
            <rect x="250" y="190" width="24" height="16" rx="4" fill="#1a1a2e" stroke="#2a2a4e" strokeWidth="1"/>
            <rect x="252" y="192" width="20" height="10" rx="2" fill="#0a4a80"/>
            <rect x="253" y="193" width="18" height="8" rx="1" fill="#0066cc" opacity="0.8"/>
            {/* Scanner screen glow */}
            <rect x="253" y="193" width="18" height="8" rx="1" fill="#40a0ff" opacity="0.3"/>
            {/* Scanner trigger grip */}
            <rect x="256" y="205" width="8" height="8" rx="2" fill="#111"/>
            {/* Scanner LED */}
            <circle cx="272" cy="196" r="2" fill="#00ff88" opacity="0.9"/>

            {/* Scan laser beam */}
            <line x1="250" y1="198" x2="222" y2="186" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" filter="url(#scanGlow)"/>
            <line x1="250" y1="195" x2="222" y2="182" stroke="#ff6600" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
            <line x1="250" y1="201" x2="222" y2="190" stroke="#ff6600" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
            {/* Laser dot on barcode */}
            <circle cx="222" cy="185" r="3.5" fill="#f97316" opacity="0.9" filter="url(#scanGlow)"/>
            <circle cx="222" cy="185" r="6" fill="#f97316" opacity="0.2"/>

            {/* Left arm relaxed at side */}
            <path d="M326 185 Q332 200 330 218" stroke="#fddbb4" strokeWidth="11" strokeLinecap="round" fill="none"/>
            <path d="M326 185 Q332 200 330 218" stroke="#f0a060" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.3"/>
            {/* Left hand */}
            <circle cx="330" cy="220" r="6" fill="#fddbb4"/>

            {/* Neck */}
            <rect x="303" y="150" width="10" height="18" rx="5" fill="url(#skinGrad)"/>

            {/* Head */}
            <ellipse cx="308" cy="142" rx="18" ry="20" fill="url(#skinGrad)"/>
            {/* Face features */}
            <ellipse cx="302" cy="140" rx="3" ry="3.5" fill="white" opacity="0.9"/>
            <ellipse cx="314" cy="140" rx="3" ry="3.5" fill="white" opacity="0.9"/>
            <circle cx="302" cy="141" r="1.8" fill="#3a1a0a"/>
            <circle cx="314" cy="141" r="1.8" fill="#3a1a0a"/>
            <circle cx="303" cy="140" r="0.6" fill="white"/>
            <circle cx="315" cy="140" r="0.6" fill="white"/>
            {/* Eyebrows */}
            <path d="M299 136 Q302 134 305 136" stroke="#5a3010" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M311 136 Q314 134 317 136" stroke="#5a3010" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            {/* Nose */}
            <path d="M306 143 Q308 147 310 143" stroke="#d4906a" strokeWidth="1.2" fill="none"/>
            {/* Mouth — slight smile */}
            <path d="M303 150 Q308 153 313 150" stroke="#c07050" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            {/* Ear left */}
            <ellipse cx="290" cy="143" rx="3.5" ry="5" fill="#f5c28a"/>
            {/* Ear right */}
            <ellipse cx="326" cy="143" rx="3.5" ry="5" fill="#f5c28a"/>
            {/* Hair */}
            <path d="M291 133 Q295 124 308 122 Q321 124 325 133 Q322 126 308 124 Q294 126 291 133Z" fill="#2a1a0a"/>

            {/* Hard hat */}
            <path d="M288 132 Q290 118 308 114 Q326 118 328 132 Q322 126 308 124 Q294 126 288 132Z" fill="url(#helmetGrad)"/>
            <rect x="285" y="131" width="46" height="6" rx="3" fill="#e08010"/>
            <path d="M290 131 Q308 128 326 131" stroke="#ffd060" strokeWidth="1.5" fill="none" opacity="0.6"/>
            {/* Hat brim shadow */}
            <rect x="285" y="134" width="46" height="2" rx="1" fill="#c07008" opacity="0.4"/>

            {/* ── SUCCESS BADGE ── */}
            <rect x="118" y="58" width="90" height="36" rx="10" fill="white" style={{filter:"drop-shadow(0 4px 12px rgba(22,163,74,0.25))"}}/>
            <rect x="118" y="58" width="90" height="36" rx="10" fill="none" stroke="#bbf7d0" strokeWidth="1.5"/>
            {/* Check circle */}
            <circle cx="135" cy="76" r="10" fill="#16a34a"/>
            <path d="M130 76 L133 80 L141 72" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <text x="150" y="72" fontSize="9" fontWeight="700" fill="#16a34a" fontFamily="Inter,sans-serif">Cabin</text>
            <text x="150" y="84" fontSize="9" fontWeight="700" fill="#16a34a" fontFamily="Inter,sans-serif">Terdeteksi</text>

            {/* Connector dot line badge→truck */}
            <line x1="195" y1="94" x2="202" y2="172" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5"/>
            <circle cx="202" cy="172" r="3" fill="#16a34a" opacity="0.6"/>

            {/* WiFi / signal waves top right */}
            <path d="M22 38 Q30 28 42 38" stroke="#f97316" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
            <path d="M17 43 Q30 26 47 43" stroke="#f97316" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3"/>
            <circle cx="32" cy="48" r="3" fill="#f97316" opacity="0.6"/>
          </svg>
        </div>

        {/* App brand */}
        <div className="px-6 pb-6" style={{position:"relative",zIndex:1}}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={{background:T.orange,boxShadow:`0 6px 16px ${T.orange}44`}}>
              <Ic.Scan s={20}/>
            </div>
            <span style={{...TS.xs,fontWeight:700,letterSpacing:"0.12em",color:T.sub,textTransform:"uppercase"}}>CabinTrack</span>
          </div>
          <p className="leading-tight" style={{...TS["2xl"],fontWeight:700,color:T.text}}>Selamat datang,<br/>Teknisi!</p>
          <p className="mt-1.5" style={{...TS.sm,color:T.muted}}>Sistem Monitoring Perbaikan Cabin</p>
        </div>
      </div>
      <div className="px-5 pb-10 pt-6" style={{background:T.card,boxShadow:"0 -2px 20px rgba(15,17,20,0.08)"}}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block mb-2 uppercase tracking-wide" style={{...TS.xs,fontWeight:600,color:T.sub}}>NIK</label>
            <input type="text" inputMode="numeric" value={nik} placeholder="Masukkan NIK kamu"
              onChange={e=>{setNik(e.target.value);setErr("");}}
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
              style={{background:T.bg,border:`1.5px solid ${err?T.red:T.border}`,color:T.text}}/>
          </div>
          <div>
            <label className="block mb-2 uppercase tracking-wide" style={{...TS.xs,fontWeight:600,color:T.sub}}>PIN</label>
            <input type="password" inputMode="numeric" value={pin} placeholder="••••"
              onChange={e=>{setPin(e.target.value);setErr("");}}
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
              style={{background:T.bg,border:`1.5px solid ${err?T.red:T.border}`,color:T.text,letterSpacing:"0.5em"}}/>
          </div>
          {err&&<p style={{...TS.xs,fontWeight:500,color:T.red}}>{err}</p>}
          <button type="submit" className="w-full py-4 rounded-2xl text-white transition-opacity active:opacity-80 mt-2" style={{...TS.md,fontWeight:700,background:T.orange,boxShadow:`0 6px 16px ${T.orange}44`}}>Masuk</button>
        </form>
        <p className="text-center mt-4" style={{...TS.xs,color:T.muted}}>Demo: 240315 / 1234</p>
      </div>
    </div>
  );
}

// ─── Bottom Nav — FAB scan style (image-3) ────────────────────────────────────
function BottomNav({active,onChange,onScan}:{active:Screen;onChange:(s:Screen)=>void;onScan:()=>void}){
  const tabs=[
    {id:"home"as Screen,   label:"Home",      icon:<Ic.Ticket s={22}/>},
    {id:"tickets"as Screen,label:"Tiket",     icon:<Ic.Ticket s={22}/>},
    // center = FAB
    {id:"dashboard"as Screen,label:"Dashboard",icon:<Ic.Grid s={22}/>},
    {id:"profil"as Screen, label:"Profil",    icon:<Ic.User s={22}/>},
  ];
  return(
    <div className="relative flex items-center" style={{background:T.card,boxShadow:"0 -1.75px 4px -1px rgba(15,17,20,0.08)",paddingBottom:4}}>
      {/* Left two tabs */}
      {tabs.slice(0,2).map(t=>{const on=active===t.id;return(
        <button key={t.id} onClick={()=>onChange(t.id)} className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-opacity active:opacity-60">
          <span style={{color:on?T.orange:T.muted}}>{t.icon===tabs[0].icon?<Ic.Ticket s={22}/>:<Ic.Ticket s={22}/>}</span>
          <span style={{...TS.xs,fontWeight:600,color:on?T.orange:T.muted}}>{t.label}</span>
          {on&&<div className="w-4 h-0.5 rounded-full" style={{background:T.orange}}/>}
        </button>
      );})}

      {/* FAB — scan button center */}
      <div className="flex-shrink-0 flex flex-col items-center" style={{width:64}}>
        <button onClick={onScan}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-90 -mt-5"
          style={{background:T.orange,boxShadow:`0 6px 20px ${T.orange}66`}}>
          <Ic.Scan s={24}/>
        </button>
        <span className="mt-0.5" style={{...TS.xs,fontWeight:600,color:T.orange}}>Scan</span>
      </div>

      {/* Right two tabs */}
      {tabs.slice(2).map(t=>{const on=active===t.id;return(
        <button key={t.id} onClick={()=>onChange(t.id)} className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-opacity active:opacity-60">
          <span style={{color:on?T.orange:T.muted}}>{t.id==="dashboard"?<Ic.Grid s={22}/>:<Ic.User s={22}/>}</span>
          <span style={{...TS.xs,fontWeight:600,color:on?T.orange:T.muted}}>{t.label}</span>
          {on&&<div className="w-4 h-0.5 rounded-full" style={{background:T.orange}}/>}
        </button>
      );})}
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
const FRAME:React.CSSProperties={background:T.card,borderRadius:44,overflow:"hidden",boxShadow:"0 0 0 1px #e0e0e0, 0 40px 100px rgba(0,0,0,0.22)"};

export default function App(){
  const [loggedIn,setLoggedIn]=useState(false);
  const [screen,setScreen]=useState<Screen>("home");
  const [tickets,setTickets]=useState<RepairTicket[]>(MOCK_TICKETS);
  const [scannedCabin,setScannedCabin]=useState<ScannedCabin|null>(null);
  const [selectedTicket,setSelectedTicket]=useState<RepairTicket|null>(null);

  function handleCabinScanned(cabin:ScannedCabin,existing:RepairTicket|null){setScannedCabin(cabin);if(existing){setSelectedTicket(existing);setScreen("ticket_detail");}else{setScreen("create_ticket");}}
  function handleTicketCreated(t:RepairTicket){setTickets(p=>[t,...p]);setSelectedTicket(t);setScreen("ticket_detail");}
  function handleTicketUpdated(t:RepairTicket){setTickets(p=>p.map(x=>x.id===t.id?t:x));setSelectedTicket(t);}
  function goTo(s:Screen){setScreen(s);setSelectedTicket(null);setScannedCabin(null);}

  const phoneClass="relative w-full max-w-sm h-full max-h-[812px] flex flex-col";
  const wrapStyle={background:"#d0d0d0"};

  if(!loggedIn) return(
    <div className="size-full flex items-center justify-center" style={wrapStyle}>
      <div className={phoneClass} style={FRAME}><LoginScreen onLogin={()=>setLoggedIn(true)}/></div>
    </div>
  );

  const showNav=!["scan","create_ticket","ticket_detail"].includes(screen);
  const navActive=(["home","tickets","dashboard","profil"] as Screen[]).includes(screen)?screen:"home";

  return(
    <div className="size-full flex items-center justify-center" style={wrapStyle}>
      <div className={phoneClass} style={FRAME}>
        <div className="flex-1 overflow-hidden relative">
          {screen==="home"&&<HomeScreen tickets={tickets} onScan={()=>setScreen("scan")} onTicketDetail={t=>{setSelectedTicket(t);setScreen("ticket_detail");}} onAllTickets={()=>setScreen("tickets")}/>}
          {screen==="scan"&&<ScanScreen onBack={()=>setScreen("home")} tickets={tickets} onCabinScanned={handleCabinScanned}/>}
          {screen==="create_ticket"&&scannedCabin&&<CreateTicketScreen cabin={scannedCabin} onBack={()=>setScreen("scan")} onCreated={handleTicketCreated}/>}
          {screen==="ticket_detail"&&selectedTicket&&<TicketDetailScreen ticket={tickets.find(t=>t.id===selectedTicket.id)??selectedTicket} onBack={()=>setScreen("tickets")} onUpdate={handleTicketUpdated}/>}
          {screen==="tickets"&&<TicketsScreen tickets={tickets} onDetail={t=>{setSelectedTicket(t);setScreen("ticket_detail");}}/>}
          {screen==="dashboard"&&<DashboardScreen tickets={tickets}/>}
          {screen==="profil"&&<ProfilScreen onLogout={()=>setLoggedIn(false)}/>}
        </div>
        {showNav&&<BottomNav active={navActive} onChange={goTo} onScan={()=>setScreen("scan")}/>}
      </div>
    </div>
  );
}
