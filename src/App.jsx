import { useState, useRef, useEffect } from "react";

const db = {
  async get(k) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch {} },
  async getShared(k) { try { const r = await window.storage.get(k, true); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async setShared(k, v) { try { await window.storage.set(k, JSON.stringify(v), true); } catch {} }
};

const SERIES_BASE=["1º Ano EF","2º Ano EF","3º Ano EF","4º Ano EF","5º Ano EF","6º Ano EF","7º Ano EF","8º Ano EF","9º Ano EF","1º Ano EM","2º Ano EM","3º Ano EM"];
const LETRAS=["A","B","C","D","E","F","G","H"];
const TIPOS_OCO=["Indisciplina","Falta injustificada","Atraso","Dificuldade de aprendizagem","Conflito entre alunos","Elogio/Destaque","Outro"];
const PG={PERFIL:"perfil",HOME:"home",CHAT:"chat",TURMAS:"turmas",REL:"rel",OCO:"oco",VISTOS:"vistos",CFG:"cfg",ADMIN:"admin"};
const DIAS=["Segunda","Terça","Quarta","Quinta","Sexta"];
const HORAS=["07:00","07:50","08:40","09:30","10:20","11:10","13:00","13:50","14:40","15:30","16:20"];
const ADM_EMAIL="viniciussilva3764@gmail.com";
const ADM_SENHA="Edimilsonsilva40.";
const LEDAI_URL="https://i.postimg.cc/XqbSgp2S/Whats-App-Image-2026-04-01-at-21-17-50.jpg";
const LEDAI_FB="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="16" fill="#b91c1c"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="28" font-weight="800" fill="white" font-family="sans-serif">L</text></svg>');
const GREETS=["E aí, professor(a)! Tô ligado e pronto pra ajudar. O que vamos planejar hoje?","Fala, mestre! Seu assistente pedagógico favorito tá on. Bora trabalhar?","Opa! LedAI na área. Me conta, qual turma vai dar trabalho hoje?"];
const TIPS=["Dica: me peça 'plano de aula' + turma + assunto!","Sabia que posso sugerir o próximo conteúdo baseado no histórico?","Tenta: 'O que trabalhar depois com o 7º Ano EF A?'"];
const ALL_PERMS=["ver_turmas","editar_turmas","ver_relatorios","editar_relatorios","ver_ocorrencias","editar_ocorrencias","ver_vistos","editar_vistos","ver_professores","bloquear_professores","deletar_professores","entrar_contas","alterar_cores","ver_logs","usar_ia"];
const PERM_LABELS={"ver_turmas":"Ver turmas","editar_turmas":"Editar turmas","ver_relatorios":"Ver relatórios","editar_relatorios":"Editar relatórios","ver_ocorrencias":"Ver ocorrências","editar_ocorrencias":"Editar ocorrências","ver_vistos":"Ver vistos","editar_vistos":"Editar vistos","ver_professores":"Ver professores","bloquear_professores":"Bloquear professores","deletar_professores":"Deletar professores","entrar_contas":"Entrar em contas","alterar_cores":"Alterar cores do site","ver_logs":"Ver registro de atividades","usar_ia":"Usar assistente IA"};

const EJS_SVC="service_th7mp2u",EJS_TPL="template_eipbxa6",EJS_PK="mHLFIoxuJ8yJdnsF";

function genCode(){return String(Math.floor(100000+Math.random()*900000));}
async function sendCode(email,name,code){
  const r=await fetch("https://api.emailjs.com/api/v1.0/email/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({service_id:EJS_SVC,template_id:EJS_TPL,user_id:EJS_PK,template_params:{to_email:email,to_name:name||"Professor(a)",verification_code:code,from_name:"LedAI"}})});
  if(!r.ok)throw new Error("Erro envio");
}

function LedImg({size=36,style:es={}}){
  const [s,setS]=useState(LEDAI_URL);
  return <div style={{width:size,height:size,borderRadius:size>50?16:8,overflow:"hidden",flexShrink:0,border:"2px solid rgba(255,255,255,0.25)",background:"#b91c1c",...es}}><img src={s} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} alt="L" onError={()=>setS(LEDAI_FB)} referrerPolicy="no-referrer"/></div>;
}

function Checklist({items,selected,onChange,label}){
  if(!items||!items.length) return <div style={{fontSize:12,color:"#6b7280",fontStyle:"italic"}}>Nenhum item.</div>;
  const all=selected.length===items.length;
  const tog=n=>onChange(selected.includes(n)?selected.filter(x=>x!==n):[...selected,n]);
  return(<div>
    <label style={{fontSize:11,color:"#6b7280",marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:0.5,fontWeight:500}}>{label}</label>
    <div style={{border:"1px solid #e5e7eb",borderRadius:6,maxHeight:200,overflowY:"auto"}}>
      <div onClick={()=>onChange(all?[]:items.map(a=>a.nome||a))} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",cursor:"pointer",background:"#f9fafb",borderBottom:"1px solid #e5e7eb",userSelect:"none"}}>
        <div style={{width:16,height:16,borderRadius:3,border:`2px solid ${all?"#dc2626":"#d1d5db"}`,background:all?"#dc2626":"white",display:"flex",alignItems:"center",justifyContent:"center"}}>{all&&<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none"/></svg>}</div>
        <span style={{fontSize:12,fontWeight:600}}>Todos ({items.length})</span>
        <span style={{marginLeft:"auto",fontSize:11,color:"#6b7280"}}>{selected.length} sel.</span>
      </div>
      {items.map((a,i)=>{const n=a.nome||a;const ch=selected.includes(n);return(
        <div key={a.id||i} onClick={()=>tog(n)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",cursor:"pointer",borderBottom:"1px solid #f3f4f6",background:ch?"#fef2f2":"white",userSelect:"none"}}>
          <div style={{width:16,height:16,borderRadius:3,border:`2px solid ${ch?"#dc2626":"#d1d5db"}`,background:ch?"#dc2626":"white",display:"flex",alignItems:"center",justifyContent:"center"}}>{ch&&<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none"/></svg>}</div>
          <span style={{fontSize:13}}>{n}</span>
        </div>);})}
    </div>
  </div>);
}

function MindMap({data}){
  const [dims,setDims]=useState({w:860,h:500});const ref=useRef(null);
  useEffect(()=>{const obs=new ResizeObserver(([e])=>setDims({w:e.contentRect.width,h:Math.max(460,e.contentRect.width*0.58)}));if(ref.current)obs.observe(ref.current.parentElement);return()=>obs.disconnect();},[]);
  if(!data?.nodes?.[0])return null;
  const root=data.nodes[0],ch=root.children||[],cx=dims.w/2,cy=dims.h/2,r1=Math.min(dims.w,dims.h)*0.27,els=[];
  const wr=(t,mx=13)=>{const ws=t.split(" "),ls=[];let c="";for(const w of ws){if((c+" "+w).trim().length>mx){if(c)ls.push(c);c=w;}else c=(c+" "+w).trim();}if(c)ls.push(c);return ls;};
  const dn=(x,y,l,co,rx=50,ry=22,fs=11)=>{const ls=wr(l,Math.floor(rx*1.5/fs)),lh=fs+3,th=ls.length*lh,ay=Math.max(ry,th/2+7);els.push(<g key={`${x}${y}${l}`}><ellipse cx={x} cy={y} rx={rx} ry={ay} fill={co} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} style={{filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.4))"}}/>{ls.map((ll,i)=><text key={i} x={x} y={y-th/2+lh*i+lh*0.8} textAnchor="middle" fill="white" fontSize={fs} fontWeight="600" fontFamily="Inter,sans-serif">{ll}</text>)}</g>);};
  const dl=(x1,y1,x2,y2,co)=>els.push(<path key={`${x1}${y1}${x2}${y2}`} d={`M${x1},${y1} Q${(x1+x2)/2},${y1} ${x2},${y2}`} stroke={co} strokeWidth={2} fill="none" opacity={0.4}/>);
  ch.forEach((c,i)=>{const a=(2*Math.PI*i)/ch.length-Math.PI/2,x2=cx+r1*Math.cos(a),y2=cy+r1*Math.sin(a);dl(cx,cy,x2,y2,c.color);(c.children||[]).forEach((gc,j)=>{const sp=((c.children||[]).length===1)?0:(j/((c.children||[]).length-1)-0.5)*0.6;const ga=a+sp,r2=r1*1.75;dl(x2,y2,cx+r2*Math.cos(ga),cy+r2*Math.sin(ga),gc.color);dn(cx+r2*Math.cos(ga),cy+r2*Math.sin(ga),gc.label,gc.color,40,18,9);});dn(x2,y2,c.label,c.color,54,23,11);});
  dn(cx,cy,root.label,root.color,70,30,13);
  return <svg ref={ref} viewBox={`0 0 ${dims.w} ${dims.h}`} width="100%"><rect width={dims.w} height={dims.h} fill="rgba(255,245,245,0.03)" rx={10}/>{els}</svg>;
}

// ─── Verification Code Input ───
function CodeInput({length=6,value,onChange}){
  const refs=useRef([]);
  const vals=value.split("").concat(Array(length).fill("")).slice(0,length);
  const handle=(i,v)=>{if(!/^\d?$/.test(v))return;const nv=[...vals];nv[i]=v;onChange(nv.join(""));if(v&&i<length-1)refs.current[i+1]?.focus();};
  const onKey=(i,e)=>{if(e.key==="Backspace"&&!vals[i]&&i>0){refs.current[i-1]?.focus();}};
  const onPaste=(e)=>{e.preventDefault();const p=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,length);if(p){onChange(p.padEnd(length,"").slice(0,length));const fi=Math.min(p.length,length-1);refs.current[fi]?.focus();}};
  return(<div style={{display:"flex",gap:8,justifyContent:"center"}}>
    {vals.map((v,i)=><input key={i} ref={el=>refs.current[i]=el} type="text" inputMode="numeric" maxLength={1} value={v||""} onChange={e=>handle(i,e.target.value)} onKeyDown={e=>onKey(i,e)} onPaste={i===0?onPaste:undefined} style={{width:44,height:52,textAlign:"center",fontSize:22,fontWeight:700,borderRadius:10,border:`2px solid ${v?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.15)"}`,background:v?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)",color:"white",outline:"none",caretColor:"#fca5a5",transition:"border .2s, background .2s"}} onFocus={e=>{e.target.style.borderColor="#fca5a5";e.target.style.background="rgba(255,255,255,0.12)";}} onBlur={e=>{e.target.style.borderColor=v?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.15)";e.target.style.background=v?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)";}}/>)}
  </div>);
}

export default function App(){
  const [page,setPage]=useState(PG.PERFIL);
  const [user,setUser]=useState(null);
  const [isAdm,setIsAdm]=useState(false);
  const [loginMode,setLoginMode]=useState("login");
  const [lf,setLf]=useState({email:"",senha:"",nome:"",escola:"",materia:""});
  const [lErr,setLErr]=useState("");
  // Verification states
  const [verifyStep,setVerifyStep]=useState(false);
  const [vCode,setVCode]=useState("");
  const [vInput,setVInput]=useState("");
  const [vErr,setVErr]=useState("");
  const [vSending,setVSending]=useState(false);
  const [vCooldown,setVCooldown]=useState(0);
  const [pendingProfile,setPendingProfile]=useState(null);

  const [profiles,setProfiles]=useState({});
  const [siteS,setSiteS]=useState({ac:"#dc2626",sb:"#b91c1c"});
  const [logs,setLogs]=useState([]);
  const [admView,setAdmView]=useState(null);
  const [subAdm,setSubAdm]=useState([]);
  const [newAdm,setNewAdm]=useState({email:"",nome:"",senha:""});
  const [expandedAdm,setExpandedAdm]=useState(null);
  const [editAdmPw,setEditAdmPw]=useState("");
  const [turmas,setTurmas]=useState([]);
  const [chat,setChat]=useState([]);
  const [mm,setMm]=useState(null);
  const [inp,setInp]=useState("");
  const [ld,setLd]=useState(false);
  const [rels,setRels]=useState([]);
  const [ocos,setOcos]=useState([]);
  const [vists,setVists]=useState([]);
  const [sugs,setSugs]=useState([]);
  const [hrs,setHrs]=useState({});
  const [nRel,setNRel]=useState({turma:"",materia:"",assunto:"",obs:""});
  const [relErr,setRelErr]=useState({obs:false,mat:false});
  const [nOco,setNOco]=useState({aluno:[],turma:"",tipo:"",desc:""});
  const [ocoErr,setOcoErr]=useState(false);
  const [nVis,setNVis]=useState({turma:"",ativ:"",alunos:[]});
  const [nTur,setNTur]=useState({serie:"",letra:""});
  const [exOco,setExOco]=useState(null);
  const [selT,setSelT]=useState(null);
  const [alunoMode,setAlunoMode]=useState(false);
  const [nAlu,setNAlu]=useState({nome:"",nasc:""});
  const [editAlu,setEditAlu]=useState(null);
  const [pdfLd,setPdfLd]=useState(false);
  const [pdfRes,setPdfRes]=useState(null);
  const [hrPdfLd,setHrPdfLd]=useState(false);
  const [fRel,setFRel]=useState("");
  const [fOco,setFOco]=useState("");
  const [fVis,setFVis]=useState("");
  const [editP,setEditP]=useState(false);
  const [eF,setEF]=useState({nome:"",escola:"",materia:""});
  const [editHr,setEditHr]=useState(false);
  const fileRef=useRef(null);
  const avRef=useRef(null);
  const hrRef=useRef(null);
  const btmRef=useRef(null);

  // Cooldown timer
  useEffect(()=>{if(vCooldown<=0)return;const t=setTimeout(()=>setVCooldown(c=>c-1),1000);return()=>clearTimeout(t);},[vCooldown]);

  const ns=k=>user?`led_${user.email}_${k}`:null;
  const mats=()=>(user?.materia||"").split(",").map(m=>m.trim()).filter(Boolean);
  const aluOf=n=>(turmas.find(t=>t.nome===n)?.alunos||[]);
  const now=()=>new Date().toLocaleString("pt-BR");
  const accent=siteS.ac||"#dc2626";
  const sbColor=siteS.sb||"#b91c1c";

  const logAct=async a=>{const e={id:Date.now(),user:user?.email||"?",action:a,time:now()};const l=await db.getShared("led_logs")||[];const u=[e,...l].slice(0,500);await db.setShared("led_logs",u);setLogs(u);};
  const sv=async(k,v)=>{const n=ns(k);if(n)await db.set(n,v);};

  useEffect(()=>{(async()=>{const s=await db.getShared("led_site_s");if(s)setSiteS(s);const p=await db.get("led_profiles");if(p)setProfiles(p);const a=await db.getShared("led_sub_adm");if(a)setSubAdm(a);})();},[]);

  useEffect(()=>{
    if(!user)return;
    (async()=>{
      setTurmas(await db.get(ns("turmas"))||[]);setRels(await db.get(ns("rels"))||[]);
      setOcos(await db.get(ns("ocos"))||[]);setVists(await db.get(ns("vists"))||[]);
      setSugs(await db.get(ns("sugs"))||[]);setMm(await db.get(ns("mm"))||null);
      setHrs(await db.get(ns("hrs"))||{});setLogs(await db.getShared("led_logs")||[]);
      const ch=await db.get(ns("chat"));
      setChat(ch||[{role:"assistant",content:GREETS[Math.floor(Math.random()*GREETS.length)]+"\n\n"+TIPS[Math.floor(Math.random()*TIPS.length)]}]);
    })();
  },[user]);

  useEffect(()=>{btmRef.current?.scrollIntoView({behavior:"smooth"});},[chat,ld]);

  // Send verification email
  const doSendCode=async()=>{
    const em=lf.email.trim().toLowerCase(),nm=lf.nome.trim();
    const code=genCode();
    setVSending(true);setVErr("");
    try{
      await sendCode(em,nm,code);
      setVCode(code);setVInput("");setVerifyStep(true);setVCooldown(60);
    }catch{setVErr("Falha ao enviar o código. Tente novamente.");}
    setVSending(false);
  };

  const doResend=async()=>{
    if(vCooldown>0)return;
    await doSendCode();
  };

  const doVerify=async()=>{
    if(vInput.length<6){setVErr("Digite o código completo.");return;}
    if(vInput!==vCode){setVErr("Código incorreto. Verifique e tente novamente.");return;}
    // Code matches — complete registration
    const em=lf.email.trim().toLowerCase();
    const np={email:em,senha:lf.senha,nome:lf.nome.trim(),escola:lf.escola.trim(),materia:lf.materia.trim(),avatar:null,blocked:false};
    const ps=await db.get("led_profiles")||{};
    ps[em]=np;await db.set("led_profiles",ps);setProfiles(ps);
    setUser(np);setIsAdm(false);setPage(PG.HOME);
    // Reset verification
    setVerifyStep(false);setVCode("");setVInput("");setVErr("");setPendingProfile(null);
  };

  const cancelVerify=()=>{setVerifyStep(false);setVCode("");setVInput("");setVErr("");};

  // AUTH
  const doLogin=async()=>{
    setLErr("");const em=lf.email.trim().toLowerCase(),pw=lf.senha;
    if(!em||!pw){setLErr("Preencha e-mail e senha.");return;}
    if(loginMode==="admin"){
      const subs=await db.getShared("led_sub_adm")||[];
      const chief=em===ADM_EMAIL&&pw===ADM_SENHA;
      const sub=subs.find(a=>a.email===em&&a.senha===pw);
      if(!chief&&!sub){setLErr("Credenciais incorretas.");return;}
      const u={email:em,nome:chief?"Admin Chefe":(sub?.nome||"Admin"),isChief:chief,role:"admin",perms:chief?ALL_PERMS:(sub?.perms||[])};
      setUser(u);setIsAdm(true);setPage(PG.ADMIN);return;
    }
    const ps=await db.get("led_profiles")||{};
    if(loginMode==="cadastro"){
      if(!lf.nome.trim()){setLErr("Informe nome.");return;}
      if(ps[em]){setLErr("E-mail já existe.");return;}
      if(pw.length<6){setLErr("Senha: min 6 chars.");return;}
      // Send verification code instead of creating account immediately
      await doSendCode();
    } else {
      const p=ps[em];
      if(!p){setLErr("email");return;}
      if(p.senha!==pw){setLErr("senha");return;}
      if(p.blocked){setLErr("Conta bloqueada.");return;}
      setUser(p);setIsAdm(false);setPage(PG.HOME);
    }
  };
  const doLogout=()=>{setUser(null);setIsAdm(false);setTurmas([]);setRels([]);setOcos([]);setVists([]);setChat([]);setMm(null);setSugs([]);setSelT(null);setHrs({});setPage(PG.PERFIL);setAdmView(null);setLoginMode("login");};
  const updProf=async f=>{const ps=await db.get("led_profiles")||{};const u={...user,...f};ps[user.email]=u;await db.set("led_profiles",ps);setProfiles(ps);setUser(u);};
  const handleAvatar=async e=>{const f=e.target.files?.[0];if(!f)return;try{const b=await new Promise((r,j)=>{const x=new FileReader();x.onload=()=>r(x.result);x.onerror=j;x.readAsDataURL(f);});const img=new Image();img.onload=async()=>{const c=document.createElement("canvas");c.width=128;c.height=128;const ctx=c.getContext("2d");const m=Math.min(img.width,img.height);ctx.drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,128,128);await updProf({avatar:c.toDataURL("image/jpeg",0.7)});};img.src=b;}catch{}e.target.value="";};

  const addTurma=async()=>{if(!nTur.serie||!nTur.letra)return;const n=`${nTur.serie} ${nTur.letra}`;if(turmas.find(t=>t.nome===n))return;const u=[...turmas,{nome:n,serie:nTur.serie,letra:nTur.letra,ultimoAssunto:{},historico:[],alunos:[]}];setTurmas(u);await sv("turmas",u);setNTur({serie:"",letra:""});};
  const rmTurma=async n=>{const u=turmas.filter(t=>t.nome!==n);setTurmas(u);await sv("turmas",u);if(selT?.nome===n)setSelT(null);};
  const updAlunos=async(tn,al)=>{const u=turmas.map(t=>t.nome===tn?{...t,alunos:al}:t);setTurmas(u);await sv("turmas",u);setSelT(p=>p?.nome===tn?{...p,alunos:al}:p);};
  const addAlu=async()=>{if(!nAlu.nome.trim()||!selT)return;await updAlunos(selT.nome,[...(selT.alunos||[]),{id:Date.now(),nome:nAlu.nome.trim(),nascimento:nAlu.nasc}]);setNAlu({nome:"",nasc:""});};
  const svEditAlu=async()=>{if(!editAlu||!selT)return;await updAlunos(selT.nome,(selT.alunos||[]).map(a=>a.id===editAlu.id?editAlu:a));setEditAlu(null);};
  const rmAlu=async id=>{if(!selT)return;await updAlunos(selT.nome,(selT.alunos||[]).filter(a=>a.id!==id));};

  const handleFileImport=async e=>{
    const f=e.target.files?.[0];if(!f)return;setPdfLd(true);setPdfRes(null);
    try{const b=await new Promise((r,j)=>{const x=new FileReader();x.onload=()=>r(x.result.split(",")[1]);x.onerror=j;x.readAsDataURL(f);});const mt=f.type||"application/pdf";const dt=mt.startsWith("image/")?"image":"document";const rr=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:'Extraia alunos. JSON: {"alunos":[{"nome":"N","nascimento":"DD/MM/AAAA"}]}. Sem nascimento use "".',messages:[{role:"user",content:[{type:dt,source:{type:"base64",media_type:mt,data:b}},{type:"text",text:"Extraia a lista de alunos com nome e nascimento."}]}]})});const d=await rr.json();const p=JSON.parse((d.content?.map(x=>x.text||"").join("")||"").replace(/```json|```/g,"").trim());setPdfRes(p.alunos||[]);}catch{setPdfRes("erro");}
    setPdfLd(false);e.target.value="";
  };
  const confirmPdf=async()=>{if(!pdfRes||pdfRes==="erro"||!selT)return;await updAlunos(selT.nome,[...(selT.alunos||[]),...pdfRes.map(a=>({id:Date.now()+Math.random(),nome:a.nome,nascimento:a.nascimento}))]);setPdfRes(null);};

  const handleHrPdf=async e=>{const f=e.target.files?.[0];if(!f)return;setHrPdfLd(true);try{const b=await new Promise((r,j)=>{const x=new FileReader();x.onload=()=>r(x.result.split(",")[1]);x.onerror=j;x.readAsDataURL(f);});const mt=f.type.startsWith("image/")?f.type:"application/pdf";const dt=mt.startsWith("image/")?"image":"document";const rr=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,system:`Extraia grade horária. Dias:${DIAS.join(",")}. Horários:${HORAS.join(",")}. JSON: {"horarios":{"Segunda_07:00":"6A Mat",...}}`,messages:[{role:"user",content:[{type:dt,source:{type:"base64",media_type:mt,data:b}},{type:"text",text:"Extraia horários."}]}]})});const d=await rr.json();const p=JSON.parse((d.content?.map(x=>x.text||"").join("")||"").replace(/```json|```/g,"").trim());if(p.horarios){setHrs(p.horarios);await sv("hrs",p.horarios);}}catch{}setHrPdfLd(false);e.target.value="";};

  const send=async ci=>{const t=(ci||inp).trim();if(!t||ld)return;const um={role:"user",content:t};const nh=[...chat,um];setChat(nh);setInp("");setLd(true);try{const sys=`Você é LedAI, assistente pedagógico com personalidade! Profissional mas descontraído.\nProfessor: ${user?.nome} | Escola: ${user?.escola||"?"} | Matérias: ${mats().join(", ")||"?"}\nTurmas:\n${turmas.map(t=>`  - ${t.nome}: alunos=[${(t.alunos||[]).map(a=>a.nome).join(", ")||"—"}]`).join("\n")||"  Nenhuma."}\nREGRAS:\n1. Plano → JSON: {"tipo":"plano","titulo":"...","serie":"...","turma":"...","materia":"...","assunto":"...","nodes":[{"id":"root","label":"T","color":"#c0392b","children":[...]}]}\n2. Sugestões → {"tipo":"sugestoes","lista":[...]}\n3. Normal: texto com personalidade. Termine com pergunta.`;const rr=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:sys,messages:nh.slice(-14).map(m=>({role:m.role,content:m.content}))})});const d=await rr.json();const tx=d.content?.map(x=>x.text||"").join("")||"Erro.";let ac=tx;try{const p=JSON.parse(tx.replace(/```json|```/g,"").trim());if(p.tipo==="plano"){setMm(p);await sv("mm",p);ac=`Plano montado: "${p.titulo}" para ${p.turma||p.serie}!`;}else if(p.tipo==="sugestoes"){setSugs(p.lista||[]);await sv("sugs",p.lista||[]);ac="Sugestões geradas!";}}catch{}const fh=[...nh,{role:"assistant",content:ac}];setChat(fh);await sv("chat",fh.slice(-30));}catch{setChat([...nh,{role:"assistant",content:"Ops, erro de conexão!"}]);}setLd(false);};

  const addRel=async()=>{const er={obs:!nRel.obs.trim(),mat:!nRel.materia};setRelErr(er);if(er.obs||er.mat||!nRel.turma||!nRel.assunto)return;const u=[{...nRel,id:Date.now(),registradoEm:now()},...rels];setRels(u);await sv("rels",u);setNRel({turma:"",materia:"",assunto:"",obs:""});setRelErr({obs:false,mat:false});};
  const addOco=async()=>{if(!nOco.desc.trim()){setOcoErr(true);return;}if(!nOco.aluno.length)return;setOcoErr(false);const u=[{...nOco,aluno:nOco.aluno.join(", "),id:Date.now(),registradoEm:now()},...ocos];setOcos(u);await sv("ocos",u);setNOco({aluno:[],turma:"",tipo:"",desc:""});};
  const addVis=async()=>{if(!nVis.turma||!nVis.ativ||!nVis.alunos.length)return;const u=[{...nVis,alunos:nVis.alunos.join(", "),id:Date.now(),registradoEm:now()},...vists];setVists(u);await sv("vists",u);setNVis({turma:"",ativ:"",alunos:[]});};
  const rmRec=async(k,s,l,id)=>{const u=l.filter(x=>x.id!==id);s(u);await sv(k,u);};
  const svHr=async(d,h,v)=>{const u={...hrs,[`${d}_${h}`]:v};setHrs(u);await sv("hrs",u);};

  const admUpdS=async s=>{const u={...siteS,...s};setSiteS(u);await db.setShared("led_site_s",u);};
  const admBlock=async(em,b)=>{const ps=await db.get("led_profiles")||{};if(ps[em]){ps[em].blocked=b;await db.set("led_profiles",ps);setProfiles(ps);}};
  const admDel=async em=>{const ps=await db.get("led_profiles")||{};delete ps[em];await db.set("led_profiles",ps);setProfiles(ps);};
  const admAddSub=async(em,nm,pw)=>{if(!em||!nm||!pw)return;const s=await db.getShared("led_sub_adm")||[];if(s.find(a=>a.email===em))return;const u=[...s,{email:em,nome:nm,senha:pw,perms:[...ALL_PERMS],blocked:false}];setSubAdm(u);await db.setShared("led_sub_adm",u);};
  const admUpdateSub=async(em,fields)=>{const s=await db.getShared("led_sub_adm")||[];const u=s.map(a=>a.email===em?{...a,...fields}:a);setSubAdm(u);await db.setShared("led_sub_adm",u);};
  const admRmSub=async em=>{const s=await db.getShared("led_sub_adm")||[];const u=s.filter(a=>a.email!==em);setSubAdm(u);await db.setShared("led_sub_adm",u);};
  const admEnter=async em=>{const ps=await db.get("led_profiles")||{};const p=ps[em];if(!p)return;setAdmView(user);setUser(p);setIsAdm(false);setPage(PG.HOME);};
  const admExit=()=>{if(admView){setUser(admView);setIsAdm(true);setAdmView(null);setPage(PG.ADMIN);}};

  const hoje=new Date();const hojeStr=hoje.toLocaleDateString("pt-BR");
  const relHoje=rels.filter(r=>r.registradoEm?.startsWith(hojeStr)).length;
  const totalSlots=Object.values(hrs).filter(v=>v&&v.trim()).length;

  const C={accent,sb:sbColor,card:"#fff",brd:"#e5e7eb",txt:"#111827",mut:"#6b7280",dng:"#dc2626"};
  const S={
    card:{background:C.card,border:`1px solid ${C.brd}`,borderRadius:8,padding:20,marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"},
    ct:{margin:"0 0 14px",fontSize:11,fontWeight:600,color:C.mut,textTransform:"uppercase",letterSpacing:0.6},
    inp:w=>({padding:"8px 12px",borderRadius:6,border:`1px solid ${C.brd}`,background:"white",color:C.txt,fontSize:13,outline:"none",width:w||"100%",boxSizing:"border-box"}),
    sel:w=>({padding:"8px 12px",borderRadius:6,border:`1px solid ${C.brd}`,background:"white",color:C.txt,fontSize:13,outline:"none",width:w||"100%",boxSizing:"border-box"}),
    btn:(v,sm)=>({padding:sm?"5px 12px":"8px 16px",borderRadius:6,border:v==="secondary"?`1px solid ${C.brd}`:"none",cursor:"pointer",fontSize:sm?11:13,fontWeight:500,background:v==="primary"||!v?C.accent:v==="danger"?"#fee2e2":v==="ghost"?"#f3f4f6":"white",color:v==="danger"?C.dng:v==="ghost"?C.mut:v==="secondary"?C.txt:"white"}),
    lbl:{fontSize:11,color:C.mut,marginBottom:4,display:"block",textTransform:"uppercase",letterSpacing:0.5,fontWeight:500},
    bdg:c=>({display:"inline-block",padding:"2px 8px",borderRadius:4,background:`${c||C.accent}15`,color:c||C.accent,fontSize:11,fontWeight:600}),
    th:{textAlign:"left",padding:"8px 12px",color:C.mut,fontWeight:500,fontSize:11,textTransform:"uppercase",borderBottom:`1px solid ${C.brd}`,background:"#f9fafb"},
    td:{padding:"10px 12px",borderBottom:`1px solid ${C.brd}`,fontSize:13},
    rc:{padding:"14px 16px",background:"#fafafa",borderRadius:6,marginBottom:8,border:`1px solid ${C.brd}`},
    pt:{margin:"0 0 22px",fontSize:17,fontWeight:700,letterSpacing:-0.3,borderBottom:`2px solid ${C.accent}`,paddingBottom:12,display:"flex",alignItems:"center",gap:10},
  };

  const Avatar=({size=40,style:es={}})=>{
    const s={width:size,height:size,borderRadius:"50%",background:"#374151",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden",border:"2px solid rgba(255,255,255,0.3)",...es};
    if(user?.avatar)return <div style={s}><img src={user.avatar} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/></div>;
    return <div style={s}><svg width={size*0.5} height={size*0.5} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="rgba(255,255,255,0.6)"/><path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none"/></svg></div>;
  };

  // ─── LOGIN SCREEN ───
  if(!user) return(
    <div style={{minHeight:"100vh",background:"#0a0a1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",position:"relative",overflow:"hidden"}}>
      <video autoPlay muted loop playsInline style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.35,zIndex:0}} src="https://files.catbox.moe/d18l2f.mp4"/>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(26,26,46,0.75),rgba(22,33,62,0.65),rgba(15,52,96,0.75))",zIndex:1}}/>
      <div style={{position:"absolute",bottom:12,left:0,right:0,textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.3)",letterSpacing:1.5,fontWeight:600,zIndex:2}}>By: Vinicius Silva</div>
      <div style={{width:420,maxWidth:"92vw",zIndex:2,position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><LedImg size={64} style={{borderRadius:16,border:"2px solid rgba(255,255,255,0.15)"}}/></div>
          <div style={{fontSize:26,fontWeight:800,color:"white",letterSpacing:-1}}>Led <span style={{color:"#fca5a5"}}>AI</span></div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:4}}>Plataforma Pedagógica Inteligente</div>
        </div>
        <div style={{background:"rgba(255,255,255,0.07)",backdropFilter:"blur(20px)",borderRadius:16,padding:28,border:"1px solid rgba(255,255,255,0.1)"}}>

          {/* ─── VERIFICATION STEP ─── */}
          {verifyStep ? (<div>
            <button onClick={cancelVerify} style={{background:"none",border:"none",color:"rgba(255,255,255,0.5)",fontSize:12,cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:4}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Voltar
            </button>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(220,38,38,0.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 7l-10 7L2 7"/></svg>
              </div>
              <div style={{fontSize:18,fontWeight:700,color:"white",marginBottom:6}}>Verifique seu email</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1.5}}>
                Enviamos um código de 6 dígitos para<br/>
                <span style={{color:"#fca5a5",fontWeight:600}}>{lf.email}</span>
              </div>
            </div>

            <div style={{marginBottom:20}}>
              <CodeInput length={6} value={vInput} onChange={v=>{setVInput(v);setVErr("");}}/>
            </div>

            {vErr&&<div style={{padding:"10px 14px",background:"rgba(220,38,38,0.15)",borderRadius:8,marginBottom:14,fontSize:12,color:"#fca5a5",textAlign:"center"}}>{vErr}</div>}

            <button onClick={doVerify} disabled={vInput.length<6} style={{width:"100%",padding:"12px",borderRadius:8,border:"none",background:vInput.length<6?"rgba(255,255,255,0.1)":"white",color:vInput.length<6?"rgba(255,255,255,0.3)":"#111",fontSize:14,fontWeight:700,cursor:vInput.length<6?"not-allowed":"pointer",transition:"all .2s",marginBottom:12}}>
              Verificar e criar conta
            </button>

            <div style={{textAlign:"center"}}>
              <span style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>Não recebeu? </span>
              {vCooldown>0?(
                <span style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>Reenviar em {vCooldown}s</span>
              ):(
                <button onClick={doResend} disabled={vSending} style={{background:"none",border:"none",color:"#fca5a5",fontSize:12,fontWeight:600,cursor:"pointer",textDecoration:"underline"}}>{vSending?"Enviando...":"Reenviar código"}</button>
              )}
            </div>
          </div>)

          /* ─── NORMAL LOGIN/REGISTER ─── */
          : (<div>
            <div style={{display:"flex",gap:0,marginBottom:20,background:"rgba(255,255,255,0.05)",borderRadius:8,overflow:"hidden"}}>
              {[{m:"login",l:"Entrar"},{m:"cadastro",l:"Cadastro"},{m:"admin",l:"Admin"}].map(t=>(
                <button key={t.m} onClick={()=>{setLoginMode(t.m);setLErr("");}} style={{flex:1,padding:"10px 0",border:"none",background:loginMode===t.m?"rgba(255,255,255,0.15)":"transparent",color:loginMode===t.m?"white":"rgba(255,255,255,0.5)",fontSize:12,fontWeight:loginMode===t.m?700:400,cursor:"pointer"}}>{t.l}</button>
              ))}
            </div>
            {loginMode==="admin"&&<div style={{padding:"10px 14px",background:"rgba(220,38,38,0.15)",borderRadius:8,marginBottom:14,fontSize:12,color:"#fca5a5"}}>Acesso restrito a administradores.</div>}
            {loginMode==="cadastro"&&<>
              <div style={{marginBottom:12}}><label style={{fontSize:10,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:4}}>Nome</label><input style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.05)",color:"white",fontSize:14,outline:"none",boxSizing:"border-box"}} value={lf.nome} onChange={e=>setLf(p=>({...p,nome:e.target.value}))}/></div>
              <div style={{marginBottom:12}}><label style={{fontSize:10,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:4}}>Escola</label><input style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.05)",color:"white",fontSize:14,outline:"none",boxSizing:"border-box"}} value={lf.escola} onChange={e=>setLf(p=>({...p,escola:e.target.value}))}/></div>
              <div style={{marginBottom:12}}><label style={{fontSize:10,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:4}}>Matérias (vírgula)</label><input style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.05)",color:"white",fontSize:14,outline:"none",boxSizing:"border-box"}} value={lf.materia} onChange={e=>setLf(p=>({...p,materia:e.target.value}))} placeholder="Matemática, Português..."/></div>
            </>}
            <div style={{marginBottom:12}}><label style={{fontSize:10,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:4}}>E-mail</label><input style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.05)",color:"white",fontSize:14,outline:"none",boxSizing:"border-box"}} type="email" value={lf.email} onChange={e=>setLf(p=>({...p,email:e.target.value}))}/></div>
            <div style={{marginBottom:16}}><label style={{fontSize:10,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:4}}>Senha</label><input style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.05)",color:"white",fontSize:14,outline:"none",boxSizing:"border-box"}} type="password" value={lf.senha} onChange={e=>setLf(p=>({...p,senha:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&doLogin()}/></div>
            {lErr&&lErr!=="email"&&lErr!=="senha"&&<div style={{color:"#fca5a5",fontSize:12,marginBottom:12,padding:"8px 12px",background:"rgba(220,38,38,0.15)",borderRadius:8}}>{lErr}</div>}
            {lErr==="email"&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:16,marginBottom:14,background:"rgba(220,38,38,0.12)",border:"1.5px dashed rgba(252,165,165,0.4)",borderRadius:10,textAlign:"center"}}><div><div style={{fontSize:24,marginBottom:4}}>&#128373;&#65039;</div><div style={{fontSize:13,fontWeight:700,color:"#fca5a5"}}>E-mail não encontrado!</div><div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:4}}><span onClick={()=>{setLoginMode("cadastro");setLErr("");}} style={{color:"#fca5a5",textDecoration:"underline",cursor:"pointer",fontWeight:600}}>Clique aqui para se cadastrar</span></div></div></div>}
            {lErr==="senha"&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:16,marginBottom:14,background:"rgba(220,38,38,0.12)",border:"1.5px dashed rgba(252,165,165,0.4)",borderRadius:10,textAlign:"center"}}><div><div style={{fontSize:24,marginBottom:4}}>&#128274;</div><div style={{fontSize:13,fontWeight:700,color:"#fca5a5"}}>Senha incorreta!</div><div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:4}}>Verifique e tente novamente.</div></div></div>}
            {vSending&&loginMode==="cadastro"?(
              <button disabled style={{width:"100%",padding:"12px",borderRadius:8,border:"none",background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)",fontSize:14,fontWeight:700,cursor:"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <svg width="16" height="16" viewBox="0 0 24 24" style={{animation:"spin 1s linear infinite"}}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none"/><path d="M12 2a10 10 0 019.95 9" stroke="#fca5a5" strokeWidth="3" fill="none" strokeLinecap="round"/></svg>
                Enviando código...
              </button>
            ):(
              <button onClick={doLogin} style={{width:"100%",padding:"12px",borderRadius:8,border:"none",background:loginMode==="admin"?"#dc2626":"white",color:loginMode==="admin"?"white":"#111",fontSize:14,fontWeight:700,cursor:"pointer"}}>{loginMode==="login"?"Entrar":loginMode==="cadastro"?"Criar conta":"Entrar como Admin"}</button>
            )}
          </div>)}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const navItems=isAdm?[{id:PG.ADMIN,l:"Painel Admin"},{id:PG.CHAT,l:"Assistente IA"}]:[{id:PG.HOME,l:"Visão Geral"},{id:PG.CHAT,l:"Assistente IA"},{id:PG.TURMAS,l:"Turmas"},{id:PG.REL,l:"Relatórios"},{id:PG.OCO,l:"Ocorrências"},{id:PG.VISTOS,l:"Vistos"},{id:PG.CFG,l:"Configurações"},{id:PG.PERFIL,l:"Perfil"}];

  const content=()=>{
    // ADMIN
    if(page===PG.ADMIN&&isAdm){
      const ps=Object.values(profiles);
      return(<div>
        <h2 style={S.pt}>Painel Administrador {user?.isChief&&<span style={S.bdg("#16a34a")}>CHEFE</span>}</h2>
        <div style={S.card}><p style={S.ct}>Aparência</p>
          <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
            <div><label style={S.lbl}>Cor principal</label><input type="color" value={siteS.ac||"#dc2626"} onChange={e=>admUpdS({ac:e.target.value})} style={{width:60,height:36,border:"none",cursor:"pointer"}}/></div>
            <div><label style={S.lbl}>Cor sidebar</label><input type="color" value={siteS.sb||"#b91c1c"} onChange={e=>admUpdS({sb:e.target.value})} style={{width:60,height:36,border:"none",cursor:"pointer"}}/></div>
            <button onClick={()=>admUpdS({ac:"#dc2626",sb:"#b91c1c"})} style={S.btn("ghost",true)}>Resetar</button>
          </div>
        </div>
        {user?.isChief&&<div style={S.card}><p style={S.ct}>Sub-administradores</p>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            <input style={S.inp()} value={newAdm.email} onChange={e=>setNewAdm(p=>({...p,email:e.target.value}))} placeholder="Email"/>
            <input style={S.inp()} value={newAdm.nome} onChange={e=>setNewAdm(p=>({...p,nome:e.target.value}))} placeholder="Nome"/>
            <input style={S.inp()} value={newAdm.senha} onChange={e=>setNewAdm(p=>({...p,senha:e.target.value}))} placeholder="Senha" type="password"/>
            <button onClick={()=>{admAddSub(newAdm.email,newAdm.nome,newAdm.senha);setNewAdm({email:"",nome:"",senha:""});}} style={S.btn()}>Add</button>
          </div>
          {subAdm.map(a=>{const isExp=expandedAdm===a.email;return(
            <div key={a.email} style={{...S.rc,marginBottom:10}}>
              <div onClick={()=>setExpandedAdm(isExp?null:a.email)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}><strong>{a.nome}</strong><span style={{color:C.mut,fontSize:12}}>({a.email})</span>{a.blocked&&<span style={S.bdg("#dc2626")}>Bloqueado</span>}</div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.mut} strokeWidth="2" style={{transform:isExp?"rotate(180deg)":"",transition:"transform .2s"}}><path d="M6 9l6 6 6-6"/></svg>
              </div>
              {isExp&&<div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.brd}`}}>
                <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                  <button onClick={()=>admUpdateSub(a.email,{blocked:!a.blocked})} style={S.btn(a.blocked?"primary":"ghost",true)}>{a.blocked?"Desbloquear":"Bloquear"}</button>
                  <button onClick={()=>admRmSub(a.email)} style={S.btn("danger",true)}>Deletar</button>
                </div>
                <div style={{marginBottom:12}}><label style={S.lbl}>Alterar senha</label><div style={{display:"flex",gap:8}}><input style={S.inp()} value={editAdmPw} onChange={e=>setEditAdmPw(e.target.value)} placeholder="Nova senha" type="password"/><button onClick={()=>{if(editAdmPw.length>=6){admUpdateSub(a.email,{senha:editAdmPw});setEditAdmPw("");}}} style={S.btn("secondary",true)}>Salvar</button></div></div>
                <div style={{marginBottom:8}}><label style={S.lbl}>Permissões</label></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                  {ALL_PERMS.map(p=>{const has=(a.perms||[]).includes(p);return(
                    <div key={p} onClick={()=>{const np=has?(a.perms||[]).filter(x=>x!==p):[...(a.perms||[]),p];admUpdateSub(a.email,{perms:np});}} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",borderRadius:6,cursor:"pointer",background:has?`${C.accent}08`:"#f9fafb",border:`1px solid ${has?C.accent+"30":C.brd}`,userSelect:"none"}}>
                      <div style={{width:14,height:14,borderRadius:3,border:`2px solid ${has?C.accent:"#d1d5db"}`,background:has?C.accent:"white",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{has&&<svg width="8" height="8" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none"/></svg>}</div>
                      <span style={{fontSize:11,color:has?C.txt:C.mut}}>{PERM_LABELS[p]}</span>
                    </div>);})}
                </div>
                <div style={{marginTop:12}}><label style={S.lbl}>Atividades deste admin</label>
                  <div style={{maxHeight:150,overflowY:"auto",fontSize:11}}>
                    {logs.filter(l=>l.user===a.email).slice(0,20).map(l=><div key={l.id} style={{padding:"4px 0",borderBottom:`1px solid ${C.brd}`,display:"flex",gap:8}}><span style={{color:C.mut,minWidth:120}}>{l.time}</span><span>{l.action}</span></div>)}
                    {logs.filter(l=>l.user===a.email).length===0&&<div style={{color:C.mut}}>Sem atividades.</div>}
                  </div>
                </div>
              </div>}
            </div>);})}
        </div>}
        <div style={S.card}><p style={S.ct}>Professores ({ps.length})</p>
          {ps.length===0?<div style={{color:C.mut}}>Nenhum.</div>:
          <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Nome","Email","Status","Ações"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>
            {ps.map(p=><tr key={p.email}><td style={{...S.td,fontWeight:600}}>{p.nome}</td><td style={{...S.td,fontSize:12}}>{p.email}</td><td style={S.td}>{p.blocked?<span style={S.bdg("#dc2626")}>Bloqueado</span>:<span style={S.bdg("#16a34a")}>Ativo</span>}</td><td style={S.td}><div style={{display:"flex",gap:4,flexWrap:"wrap"}}><button onClick={()=>admEnter(p.email)} style={S.btn("secondary",true)}>Entrar</button><button onClick={()=>admBlock(p.email,!p.blocked)} style={S.btn(p.blocked?"primary":"ghost",true)}>{p.blocked?"Desbloquear":"Bloquear"}</button><button onClick={()=>admDel(p.email)} style={S.btn("danger",true)}>Deletar</button></div></td></tr>)}
          </tbody></table>}
        </div>
        <div style={S.card}><p style={S.ct}>Registro de atividades</p>
          <div style={{maxHeight:300,overflowY:"auto"}}>{logs.slice(0,50).map(l=><div key={l.id} style={{display:"flex",gap:12,padding:"6px 0",borderBottom:`1px solid ${C.brd}`,fontSize:12}}><span style={{color:C.mut,minWidth:130}}>{l.time}</span><span style={{color:C.mut,minWidth:140}}>{l.user}</span><span>{l.action}</span></div>)}{logs.length===0&&<div style={{color:C.mut}}>Vazio.</div>}</div>
        </div>
      </div>);
    }

    // PERFIL
    if(page===PG.PERFIL) return(<div style={{maxWidth:560}}>
      <h2 style={S.pt}>Perfil</h2>
      <div style={S.card}>
        {!editP?<>
          <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:14}}>
            <div style={{position:"relative",cursor:"pointer"}} onClick={()=>avRef.current?.click()}>
              <Avatar size={72} style={{border:`3px solid ${C.accent}`}}/>
              <div style={{position:"absolute",bottom:-2,right:-2,width:22,height:22,borderRadius:"50%",background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid white"}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
              <input ref={avRef} type="file" accept="image/*" onChange={handleAvatar} style={{display:"none"}}/>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:16}}>{user.nome}</div>
              <div style={{fontSize:13,color:C.mut}}>{user.email}</div>
              {user.escola&&<div style={{fontSize:12,color:C.mut}}>{user.escola}</div>}
              {user.avatar&&<button onClick={()=>updProf({avatar:null})} style={{fontSize:10,color:C.dng,background:"none",border:"none",cursor:"pointer",marginTop:4,textDecoration:"underline"}}>Remover foto</button>}
            </div>
          </div>
          {mats().length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>{mats().map(m=><span key={m} style={S.bdg()}>{m}</span>)}</div>}
          <button onClick={()=>{setEF({nome:user.nome,escola:user.escola||"",materia:user.materia||""});setEditP(true);}} style={S.btn("secondary")}>Editar</button>
        </>:<>
          <div style={{marginBottom:10}}><label style={S.lbl}>Nome</label><input style={S.inp()} value={eF.nome} onChange={e=>setEF(p=>({...p,nome:e.target.value}))}/></div>
          <div style={{marginBottom:10}}><label style={S.lbl}>Escola</label><input style={S.inp()} value={eF.escola} onChange={e=>setEF(p=>({...p,escola:e.target.value}))}/></div>
          <div style={{marginBottom:14}}><label style={S.lbl}>Matérias (vírgula)</label><input style={S.inp()} value={eF.materia} onChange={e=>setEF(p=>({...p,materia:e.target.value}))}/></div>
          <div style={{display:"flex",gap:8}}><button onClick={async()=>{await updProf(eF);setEditP(false);}} style={S.btn()}>Salvar</button><button onClick={()=>setEditP(false)} style={S.btn("ghost")}>Cancelar</button></div>
        </>}
        <div style={{height:1,background:C.brd,margin:"14px 0"}}/>
        <div style={{display:"flex",gap:24,marginBottom:16}}>{[{l:"Turmas",v:turmas.length},{l:"Relatórios",v:rels.length},{l:"Ocorrências",v:ocos.length},{l:"Vistos",v:vists.length}].map(s=><div key={s.l} style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:C.accent}}>{s.v}</div><div style={{fontSize:11,color:C.mut,textTransform:"uppercase",marginTop:2}}>{s.l}</div></div>)}</div>
        <button onClick={doLogout} style={S.btn("danger")}>Sair</button>
      </div>
    </div>);

    // HOME
    if(page===PG.HOME) return(<div>
      <h2 style={S.pt}>Visão Geral</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:20}}>
        {[{l:"Turmas",v:turmas.length,p:PG.TURMAS},{l:"Relatórios",v:rels.length,p:PG.REL},{l:"Ocorrências",v:ocos.length,p:PG.OCO},{l:"Vistos",v:vists.length,p:PG.VISTOS}].map(i=><button key={i.p} onClick={()=>setPage(i.p)} style={{...S.card,cursor:"pointer",textAlign:"left",marginBottom:0}}><div style={{fontSize:24,fontWeight:700,color:C.accent}}>{i.v}</div><div style={{fontSize:11,color:C.mut,textTransform:"uppercase"}}>{i.l}</div></button>)}
      </div>
      <div style={S.card}><p style={S.ct}>Atividade</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
          {[{l:"Aulas hoje",v:relHoje},{l:"Total relatórios",v:rels.length},{l:"Horários",v:totalSlots}].map(s=><div key={s.l} style={{background:`${C.accent}10`,borderRadius:8,padding:16,textAlign:"center"}}><div style={{fontSize:28,fontWeight:800,color:C.accent}}>{s.v}</div><div style={{fontSize:11,color:C.mut,marginTop:2}}>{s.l}</div></div>)}
        </div>
      </div>
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><p style={{...S.ct,margin:0}}>Grade de horários</p>
          <div style={{display:"flex",gap:6}}><input ref={hrRef} type="file" accept=".pdf,image/*" onChange={handleHrPdf} style={{display:"none"}}/><button onClick={()=>hrRef.current?.click()} style={S.btn("secondary",true)} disabled={hrPdfLd}>{hrPdfLd?"...":"Importar PDF/Foto"}</button><button onClick={()=>setEditHr(!editHr)} style={S.btn("ghost",true)}>{editHr?"Fechar":"Editar"}</button></div>
        </div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}><thead><tr><th style={S.th}>Hora</th>{DIAS.map(d=><th key={d} style={S.th}>{d}</th>)}</tr></thead><tbody>{HORAS.map(h=><tr key={h}><td style={{...S.td,fontWeight:600,fontSize:12,color:C.mut,width:60}}>{h}</td>{DIAS.map(d=>{const k=`${d}_${h}`,v=hrs[k]||"";return<td key={d} style={{...S.td,padding:"4px 6px"}}>{editHr?<input style={{...S.inp(),fontSize:11,padding:"4px 6px"}} value={v} onChange={e=>svHr(d,h,e.target.value)} placeholder="—"/>:<span style={{fontSize:12,color:v?C.txt:C.mut}}>{v||"—"}</span>}</td>;})}</tr>)}</tbody></table></div>
      </div>
    </div>);

    // CHAT
    if(page===PG.CHAT) return(<div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 56px)"}}>
      <h2 style={S.pt}><LedImg size={30} style={{border:`2px solid ${C.accent}`}}/> Assistente Led <span style={{color:C.accent}}>AI</span></h2>
      <div style={{...S.card,flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,position:"relative",overflow:"hidden"}}>
        <video autoPlay muted loop playsInline style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.07,zIndex:0,pointerEvents:"none"}} src="https://files.catbox.moe/jcmrss.mp4"/>
        <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",gap:10,flex:1}}>
        {chat.map((m,i)=>{const ai=m.role==="assistant";return(
          <div key={i} style={{display:"flex",justifyContent:ai?"flex-start":"flex-end",gap:8}}>
            {ai&&<LedImg size={30} style={{border:`1.5px solid ${C.accent}`}}/>}
            <div style={{maxWidth:"76%",padding:"10px 14px",borderRadius:ai?"2px 14px 14px 14px":"14px 2px 14px 14px",background:ai?`${C.accent}08`:C.accent,color:ai?C.txt:"white",fontSize:13,lineHeight:1.7,border:ai?`1px solid ${C.accent}20`:"none",whiteSpace:"pre-wrap"}}>{m.content}</div>
            {!ai&&<Avatar size={28}/>}
          </div>);})}
        {ld&&<div style={{display:"flex",gap:6,alignItems:"center",padding:"10px 14px",background:`${C.accent}08`,borderRadius:"2px 14px 14px 14px",width:"fit-content",border:`1px solid ${C.accent}20`}}><LedImg size={28}/>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.accent,animation:"bounce 1s infinite",animationDelay:`${i*.2}s`}}/>)}</div>}
        <div ref={btmRef}/>
        </div>
      </div>
      {sugs.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",padding:"8px 0"}}>{sugs.map((s,i)=><button key={i} onClick={()=>send(s)} style={{...S.btn("secondary"),borderRadius:20,fontSize:12}}>{s}</button>)}</div>}
      {mm&&<div style={{...S.card,marginTop:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><strong style={{fontSize:13}}>{mm.titulo}</strong><button onClick={()=>{setMm(null);sv("mm",null);}} style={S.btn("ghost",true)}>Fechar</button></div><MindMap data={mm}/></div>}
      <div style={{display:"flex",gap:8,marginTop:8,position:"relative",zIndex:2}}>
        <textarea value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Pergunte sobre turmas, peça planos..." rows={2} style={{...S.inp(),flex:1,resize:"none",borderRadius:12}}/>
        <button onClick={()=>send()} disabled={ld||!inp.trim()} style={{...S.btn(),padding:"0 20px",borderRadius:12,opacity:ld||!inp.trim()?0.4:1}}>Enviar</button>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>);

    // TURMAS
    if(page===PG.TURMAS){
      if(selT){const al=selT.alunos||[];return(<div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><button onClick={()=>setSelT(null)} style={S.btn("ghost")}>Voltar</button><h2 style={{...S.pt,margin:0,border:"none",paddingBottom:0}}>Turma {selT.nome}</h2><span style={{...S.bdg(),marginLeft:"auto"}}>{al.length} aluno{al.length!==1?"s":""}</span></div>
        <div style={S.card}><p style={S.ct}>Importar alunos (PDF ou Foto)</p><div style={{display:"flex",gap:8}}><input ref={fileRef} type="file" accept=".pdf,image/*" onChange={handleFileImport} style={{display:"none"}}/><button onClick={()=>fileRef.current?.click()} style={S.btn("secondary")} disabled={pdfLd}>{pdfLd?"Processando...":"Selecionar PDF ou Foto"}</button><button onClick={()=>setAlunoMode(!alunoMode)} style={S.btn("ghost")}>{alunoMode?"Ocultar":"Manual"}</button></div>
          {pdfRes&&pdfRes!=="erro"&&<div style={{marginTop:14}}><div style={{maxHeight:200,overflowY:"auto",border:`1px solid ${C.brd}`,borderRadius:6}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th style={S.th}>Nome</th><th style={S.th}>Nasc.</th></tr></thead><tbody>{pdfRes.map((a,i)=><tr key={i}><td style={S.td}><input value={a.nome} onChange={e=>{const r=[...pdfRes];r[i]={...r[i],nome:e.target.value};setPdfRes(r);}} style={{...S.inp(),border:"none",background:"transparent",padding:0}}/></td><td style={S.td}><input value={a.nascimento} onChange={e=>{const r=[...pdfRes];r[i]={...r[i],nascimento:e.target.value};setPdfRes(r);}} style={{...S.inp(),border:"none",background:"transparent",padding:0}}/></td></tr>)}</tbody></table></div><div style={{display:"flex",gap:8,marginTop:10}}><button onClick={confirmPdf} style={S.btn()}>Confirmar</button><button onClick={()=>setPdfRes(null)} style={S.btn("ghost")}>Cancelar</button></div></div>}
          {pdfRes==="erro"&&<div style={{marginTop:10,color:C.dng,fontSize:12}}>Erro ao processar.</div>}
        </div>
        {alunoMode&&<div style={S.card}><div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}><div style={{flex:2}}><label style={S.lbl}>Nome</label><input style={S.inp()} value={nAlu.nome} onChange={e=>setNAlu(p=>({...p,nome:e.target.value}))}/></div><div style={{flex:1}}><label style={S.lbl}>Nasc.</label><input style={S.inp()} value={nAlu.nasc} onChange={e=>setNAlu(p=>({...p,nasc:e.target.value}))} placeholder="DD/MM/AAAA"/></div><button onClick={addAlu} style={S.btn()}>Add</button></div></div>}
        {editAlu&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}><div style={{...S.card,width:360,marginBottom:0}}><div style={{marginBottom:10}}><label style={S.lbl}>Nome</label><input style={S.inp()} value={editAlu.nome} onChange={e=>setEditAlu(p=>({...p,nome:e.target.value}))}/></div><div style={{marginBottom:14}}><label style={S.lbl}>Nasc.</label><input style={S.inp()} value={editAlu.nascimento} onChange={e=>setEditAlu(p=>({...p,nascimento:e.target.value}))}/></div><div style={{display:"flex",gap:8}}><button onClick={svEditAlu} style={S.btn()}>Salvar</button><button onClick={()=>setEditAlu(null)} style={S.btn("ghost")}>Cancelar</button></div></div></div>}
        <div style={S.card}><p style={S.ct}>Alunos</p>{al.length===0?<div style={{color:C.mut}}>Nenhum.</div>:<table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th style={S.th}>#</th><th style={S.th}>Nome</th><th style={S.th}>Nasc.</th><th style={S.th}></th></tr></thead><tbody>{al.map((a,i)=><tr key={a.id}><td style={{...S.td,width:40}}>{i+1}</td><td style={{...S.td,fontWeight:500}}>{a.nome}</td><td style={S.td}>{a.nascimento||"—"}</td><td style={S.td}><div style={{display:"flex",gap:4}}><button onClick={()=>setEditAlu({...a})} style={S.btn("secondary",true)}>Editar</button><button onClick={()=>rmAlu(a.id)} style={S.btn("danger",true)}>Rm</button></div></td></tr>)}</tbody></table>}</div>
      </div>);}
      return(<div><h2 style={S.pt}>Turmas</h2>{turmas.length===0?<div style={{color:C.mut}}>Nenhuma turma.</div>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>{turmas.map(t=><button key={t.nome} onClick={()=>setSelT(t)} style={{...S.card,cursor:"pointer",textAlign:"left",marginBottom:0}}><div style={{fontWeight:700,fontSize:15}}>{t.nome}</div><div style={{fontSize:12,color:C.mut}}>{(t.alunos||[]).length} aluno{(t.alunos||[]).length!==1?"s":""}</div></button>)}</div>}</div>);
    }

    // RELATORIOS
    if(page===PG.REL){const fl=fRel?rels.filter(r=>r.turma===fRel):rels;const ms=mats();return(<div><h2 style={S.pt}>Relatórios</h2>
      <div style={S.card}><p style={S.ct}>Novo</p>
        <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}><div style={{flex:"0 0 180px"}}><label style={S.lbl}>Turma</label><select style={S.sel()} value={nRel.turma} onChange={e=>setNRel(p=>({...p,turma:e.target.value}))}><option value="">Selecione</option>{turmas.map(t=><option key={t.nome}>{t.nome}</option>)}</select></div><div style={{flex:1}}><label style={S.lbl}>Assunto</label><input style={S.inp()} value={nRel.assunto} onChange={e=>setNRel(p=>({...p,assunto:e.target.value}))}/></div></div>
        {ms.length>0&&<div style={{marginBottom:12}}><label style={{...S.lbl,color:relErr.mat?"#dc2626":C.mut}}>Matéria *</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{ms.map(m=><button key={m} onClick={()=>{setNRel(p=>({...p,materia:p.materia===m?"":m}));setRelErr(p=>({...p,mat:false}));}} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${nRel.materia===m?C.accent:"#d1d5db"}`,background:nRel.materia===m?C.accent:"white",color:nRel.materia===m?"white":"#374151",fontSize:12,fontWeight:nRel.materia===m?600:400,cursor:"pointer"}}>{m}</button>)}</div>{relErr.mat&&<div style={{fontSize:11,color:"#dc2626",marginTop:4}}>Selecione!</div>}</div>}
        <div style={{marginBottom:12}}><label style={{...S.lbl,color:relErr.obs?"#dc2626":C.mut}}>Descrição *</label><textarea style={{...S.inp(),height:68,resize:"vertical",borderColor:relErr.obs?"#dc2626":"#e5e7eb"}} value={nRel.obs} onChange={e=>{setNRel(p=>({...p,obs:e.target.value}));if(e.target.value.trim())setRelErr(p=>({...p,obs:false}));}}/></div>
        {relErr.obs&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:16,marginBottom:14,background:"linear-gradient(135deg,#fef2f2,#fff1f2)",border:"1.5px dashed #fca5a5",borderRadius:10,textAlign:"center"}}><div><div style={{fontSize:24,marginBottom:4}}>&#128221;</div><div style={{fontSize:13,fontWeight:700,color:"#b91c1c"}}>Epa, cadê a descrição?</div><div style={{fontSize:12,color:"#991b1b"}}>Relatório sem descrição é tipo prova sem nome!</div></div></div>}
        <button onClick={addRel} style={S.btn()}>Salvar</button>
      </div>
      {rels.length>0&&<div style={S.card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><p style={{...S.ct,margin:0}}>Registrados — {fl.length}</p><select style={{...S.sel("auto"),minWidth:140}} value={fRel} onChange={e=>setFRel(e.target.value)}><option value="">Todas</option>{[...new Set(rels.map(r=>r.turma))].filter(Boolean).map(t=><option key={t}>{t}</option>)}</select></div>
        {fl.map(r=><div key={r.id} style={S.rc}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><strong>{r.turma}</strong>{r.materia&&<span style={S.bdg()}>{r.materia}</span>}</div><div style={{fontSize:13}}>{r.assunto}</div>{r.obs&&<div style={{fontSize:12,color:C.mut,marginTop:4}}>{r.obs}</div>}</div><button onClick={()=>rmRec("rels",setRels,rels,r.id)} style={S.btn("danger",true)}>Rm</button></div><div style={{fontSize:11,color:C.mut,marginTop:6}}>{r.registradoEm}</div></div>)}
      </div>}
    </div>);}

    // OCORRENCIAS
    if(page===PG.OCO){const tco=[...new Set(ocos.map(o=>o.turma))].filter(Boolean);const tpm=fOco?[fOco]:turmas.map(t=>t.nome);return(<div><h2 style={S.pt}>Ocorrências</h2>
      <div style={S.card}><p style={S.ct}>Nova</p>
        <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}><div style={{flex:"0 0 180px"}}><label style={S.lbl}>Turma</label><select style={S.sel()} value={nOco.turma} onChange={e=>setNOco(p=>({...p,turma:e.target.value,aluno:[]}))}><option value="">Selecione</option>{turmas.map(t=><option key={t.nome}>{t.nome}</option>)}</select></div><div style={{flex:"0 0 200px"}}><label style={S.lbl}>Tipo</label><select style={S.sel()} value={nOco.tipo} onChange={e=>setNOco(p=>({...p,tipo:e.target.value}))}><option value="">Selecione</option>{TIPOS_OCO.map(t=><option key={t}>{t}</option>)}</select></div></div>
        {nOco.turma&&<div style={{marginBottom:12}}><Checklist items={aluOf(nOco.turma)} selected={nOco.aluno} onChange={s=>setNOco(p=>({...p,aluno:s}))} label="Alunos"/></div>}
        <div style={{marginBottom:12}}><label style={{...S.lbl,color:ocoErr?"#dc2626":C.mut}}>Descrição *</label><textarea style={{...S.inp(),height:78,resize:"vertical",borderColor:ocoErr?"#dc2626":"#e5e7eb"}} value={nOco.desc} onChange={e=>{setNOco(p=>({...p,desc:e.target.value}));if(e.target.value.trim())setOcoErr(false);}}/></div>
        {ocoErr&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:16,marginBottom:14,background:"linear-gradient(135deg,#fef2f2,#fff1f2)",border:"1.5px dashed #fca5a5",borderRadius:10,textAlign:"center"}}><div><div style={{fontSize:24,marginBottom:4}}>&#9997;&#65039;</div><div style={{fontSize:13,fontWeight:700,color:"#b91c1c"}}>Calma aí, professor(a)!</div><div style={{fontSize:12,color:"#991b1b"}}>Sem descrição, a ocorrência fica mais perdida que aluno sem caderno na segunda!</div></div></div>}
        <button onClick={addOco} style={{...S.btn(),opacity:nOco.aluno.length===0?0.4:1}} disabled={nOco.aluno.length===0}>Registrar</button>
      </div>
      {ocos.length>0&&<div style={S.card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><p style={{...S.ct,margin:0}}>Ocorrências — {ocos.length}</p><select style={{...S.sel("auto"),minWidth:140}} value={fOco} onChange={e=>setFOco(e.target.value)}><option value="">Todas</option>{tco.map(t=><option key={t}>{t}</option>)}</select></div>
        {tpm.map(nm=>{const rg=ocos.filter(o=>o.turma===nm);if(!rg.length)return null;return(<div key={nm} style={{marginBottom:16}}><div style={{padding:"8px 14px",background:`${C.accent}10`,borderRadius:"6px 6px 0 0",fontWeight:600,fontSize:12,color:C.accent,textTransform:"uppercase"}}>{nm} — {rg.length}</div><div style={{border:`1px solid ${C.brd}`,borderTop:"none",borderRadius:"0 0 6px 6px"}}>{rg.map(o=>{const op=exOco===o.id;return(<div key={o.id} onClick={()=>setExOco(op?null:o.id)} style={{padding:"12px 16px",background:op?`${C.accent}05`:"white",borderBottom:`1px solid ${C.brd}`,cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><strong style={{fontSize:13}}>{o.aluno}</strong>{o.tipo&&<span style={S.bdg(C.dng)}>{o.tipo}</span>}<span style={{fontSize:11,color:C.mut}}>{o.registradoEm}</span></div><div style={{display:"flex",gap:6,alignItems:"center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.mut} strokeWidth="2" style={{transform:op?"rotate(180deg)":"",transition:"transform .2s"}}><path d="M6 9l6 6 6-6"/></svg><button onClick={e=>{e.stopPropagation();rmRec("ocos",setOcos,ocos,o.id);}} style={S.btn("danger",true)}>Rm</button></div></div>{op&&<div style={{marginTop:10,padding:"10px 14px",background:"white",borderRadius:6,border:`1px solid ${C.brd}`,fontSize:13,lineHeight:1.6}}>{o.desc||o.descricao||"—"}</div>}</div>);})}</div></div>);})}
      </div>}
    </div>);}

    // VISTOS
    if(page===PG.VISTOS){const fl=fVis?vists.filter(v=>v.turma===fVis):vists;return(<div><h2 style={S.pt}>Vistos</h2>
      <div style={S.card}><p style={S.ct}>Registrar</p>
        <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap"}}><div style={{flex:"0 0 180px"}}><label style={S.lbl}>Turma</label><select style={S.sel()} value={nVis.turma} onChange={e=>setNVis(p=>({...p,turma:e.target.value,alunos:[]}))}><option value="">Selecione</option>{turmas.map(t=><option key={t.nome}>{t.nome}</option>)}</select></div><div style={{flex:1}}><label style={S.lbl}>Atividade</label><input style={S.inp()} value={nVis.ativ} onChange={e=>setNVis(p=>({...p,ativ:e.target.value}))}/></div></div>
        {nVis.turma&&<div style={{marginBottom:12}}><Checklist items={aluOf(nVis.turma)} selected={nVis.alunos} onChange={s=>setNVis(p=>({...p,alunos:s}))} label="Alunos"/></div>}
        <button onClick={addVis} style={{...S.btn(),opacity:!nVis.ativ||!nVis.alunos.length?0.4:1}} disabled={!nVis.ativ||!nVis.alunos.length}>Registrar</button>
      </div>
      {vists.length>0&&<div style={S.card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><p style={{...S.ct,margin:0}}>Vistos — {fl.length}</p><select style={{...S.sel("auto"),minWidth:140}} value={fVis} onChange={e=>setFVis(e.target.value)}><option value="">Todas</option>{[...new Set(vists.map(v=>v.turma))].filter(Boolean).map(t=><option key={t}>{t}</option>)}</select></div>
        {fl.map(v=><div key={v.id} style={S.rc}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><strong>{v.turma}</strong><span style={{color:C.mut}}>—</span><span>{v.ativ||v.atividade}</span></div>{v.alunos&&<div style={{display:"flex",flexWrap:"wrap",gap:4}}>{v.alunos.split(",").map(a=>a.trim()).filter(Boolean).map((a,i)=><span key={i} style={S.bdg("#16a34a")}>{a}</span>)}</div>}</div><button onClick={()=>rmRec("vists",setVists,vists,v.id)} style={S.btn("danger",true)}>Rm</button></div><div style={{fontSize:11,color:C.mut,marginTop:6}}>{v.registradoEm}</div></div>)}
      </div>}
    </div>);}

    // CONFIG
    if(page===PG.CFG) return(<div><h2 style={S.pt}>Configurações</h2>
      <div style={S.card}><p style={S.ct}>Nova turma</p><div style={{display:"flex",gap:12,flexWrap:"wrap"}}><div style={{flex:"0 0 220px"}}><label style={S.lbl}>Série</label><select style={S.sel()} value={nTur.serie} onChange={e=>setNTur(p=>({...p,serie:e.target.value}))}><option value="">Selecione</option>{SERIES_BASE.map(s=><option key={s}>{s}</option>)}</select></div><div style={{flex:"0 0 130px"}}><label style={S.lbl}>Letra</label><select style={S.sel()} value={nTur.letra} onChange={e=>setNTur(p=>({...p,letra:e.target.value}))}><option value="">Letra</option>{LETRAS.map(l=><option key={l}>{l}</option>)}</select></div><div style={{display:"flex",alignItems:"flex-end"}}><button onClick={addTurma} style={S.btn()}>Adicionar</button></div></div></div>
      {turmas.length>0&&<div style={S.card}><p style={S.ct}>Turmas</p><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr><th style={S.th}>Turma</th><th style={S.th}>Alunos</th><th style={S.th}></th></tr></thead><tbody>{turmas.map(t=><tr key={t.nome}><td style={{...S.td,fontWeight:600}}>{t.nome}</td><td style={S.td}>{(t.alunos||[]).length}</td><td style={S.td}><button onClick={()=>rmTurma(t.nome)} style={S.btn("danger",true)}>Remover</button></td></tr>)}</tbody></table></div>}
    </div>);

    return null;
  };

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#f3f4f6",fontFamily:"'Inter','Segoe UI',sans-serif",color:"#111827",fontSize:14}}>
      <div style={{width:215,background:sbColor,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,zIndex:100}}>
        <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,0.15)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><LedImg size={36}/><div><div style={{fontWeight:800,fontSize:16,color:"white"}}>Led <span style={{color:"#fca5a5"}}>AI</span></div><div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:1}}>PLATAFORMA PEDAGÓGICA</div></div></div>
          {user&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:12}}><Avatar size={28}/><div style={{overflow:"hidden",flex:1}}><div style={{fontSize:11,color:"white",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.nome}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>{isAdm?"Administrador":user.email}</div></div></div>}
          {admView&&<button onClick={admExit} style={{marginTop:8,width:"100%",padding:"6px",borderRadius:6,border:"1px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.1)",color:"white",fontSize:11,cursor:"pointer"}}>Voltar ao Admin</button>}
        </div>
        <div style={{padding:"8px 0",flex:1}}>{navItems.map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"10px 18px",border:"none",background:page===n.id?"rgba(255,255,255,0.15)":"transparent",color:"white",cursor:"pointer",width:"100%",textAlign:"left",fontSize:13,fontWeight:page===n.id?600:400,borderLeft:page===n.id?"3px solid white":"3px solid transparent",opacity:page===n.id?1:0.8}}>{n.l}</button>)}</div>
        <div style={{padding:"8px 16px 10px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <button onClick={doLogout} style={{width:"100%",padding:"7px",borderRadius:6,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"rgba(255,255,255,0.6)",fontSize:11,cursor:"pointer",marginBottom:6}}>Sair</button>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",textAlign:"center",letterSpacing:0.5}}>By: Vinicius Silva</div>
        </div>
      </div>
      <div style={{marginLeft:215,flex:1,padding:28,minHeight:"100vh",boxSizing:"border-box"}}>{content()}</div>
      <div style={{position:"fixed",bottom:8,right:14,fontSize:12,color:"rgba(0,0,0,0.15)",fontFamily:"monospace",letterSpacing:1,pointerEvents:"none",userSelect:"none",fontWeight:600}}>By: Vinicius Silva</div>
    </div>
  );
}
