import { useState, useRef, useEffect } from "react";

import { db } from './storage.js';

const SERIES_BASE = ["1º Ano EF","2º Ano EF","3º Ano EF","4º Ano EF","5º Ano EF","6º Ano EF","7º Ano EF","8º Ano EF","9º Ano EF","1º Ano EM","2º Ano EM","3º Ano EM"];
const LETRAS = ["A","B","C","D","E","F","G","H"];
const TIPOS_OCO = ["Indisciplina","Falta injustificada","Atraso","Dificuldade de aprendizagem","Conflito entre alunos","Elogio/Destaque","Outro"];
const PAGES = { PERFIL:"perfil", HOME:"home", CHAT:"chat", TURMAS:"turmas", RELATORIO:"relatorio", OCORRENCIAS:"ocorrencias", VISTOS:"vistos", CONFIG:"config" };
const CURRICULUM = {
  "1º Ano EF":{"Português":["Alfabeto","Sílabas simples"],"Matemática":["Números 1-10","Formas geométricas"]},
  "2º Ano EF":{"Português":["Leitura fluente","Produção textual"],"Matemática":["Adição e subtração","Dezenas"]},
  "3º Ano EF":{"Português":["Pontuação","Tipos de texto"],"Matemática":["Multiplicação","Divisão simples"]},
  "4º Ano EF":{"Português":["Ortografia","Texto argumentativo"],"Matemática":["Frações","Decimais"]},
  "5º Ano EF":{"Português":["Análise sintática","Gêneros textuais"],"Matemática":["Porcentagem","Geometria plana"]},
  "6º Ano EF":{"Matemática":["Números inteiros","Expressões algébricas"],"Ciências":["Célula","Seres vivos"]},
  "7º Ano EF":{"Matemática":["Equações 1º grau","Razão e proporção"],"Ciências":["Sistema digestório","Fotossíntese"]},
  "8º Ano EF":{"Matemática":["Teorema de Pitágoras","Sistemas lineares"],"Ciências":["Química orgânica básica","Forças"]},
  "9º Ano EF":{"Matemática":["Funções","Trigonometria"],"Ciências":["Eletricidade","Evolução"]},
  "1º Ano EM":{"Matemática":["Conjuntos","Funções afim e quadrática"],"Biologia":["Citologia","Divisão celular"]},
  "2º Ano EM":{"Matemática":["Trigonometria","Progressões"],"Física":["Termodinâmica","Óptica"]},
  "3º Ano EM":{"Matemática":["Geometria analítica","Probabilidade"],"Química":["Orgânica avançada","Equilíbrio"]},
};

const AC = "#dc2626";
const BD = "#e5e7eb";
const MU = "#6b7280";
const TX = "#111827";

function AlunoChecklist({ alunos, selecionados, onToggle }) {
  if (!alunos || alunos.length === 0) {
    return <div style={{fontSize:12,color:MU,fontStyle:"italic",marginTop:6}}>Esta turma não possui alunos cadastrados.</div>;
  }
  return (
    <div style={{marginTop:10}}>
      <div style={{fontSize:11,color:MU,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5,fontWeight:500}}>
        Alunos envolvidos — {selecionados.length} selecionado{selecionados.length !== 1 ? "s" : ""}
      </div>
      <div style={{border:"1px solid "+BD,borderRadius:6,maxHeight:200,overflowY:"auto",background:"white"}}>
        {alunos.map(function(a, i) {
          var checked = selecionados.indexOf(a.id) > -1;
          return (
            <label key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderBottom:i<alunos.length-1?"1px solid "+BD:"none",cursor:"pointer",background:checked?"rgba(220,38,38,0.05)":"white"}}>
              <input type="checkbox" checked={checked} onChange={function(){onToggle(a.id);}} style={{accentColor:AC,width:15,height:15}}/>
              <span style={{fontSize:13,fontWeight:checked?600:400,color:checked?AC:TX}}>{a.nome}</span>
              {a.nascimento && <span style={{fontSize:11,color:MU,marginLeft:"auto"}}>{a.nascimento}</span>}
            </label>
          );
        })}
      </div>
      <div style={{display:"flex",gap:6,marginTop:6}}>
        <button type="button" onClick={function(){onToggle("all",alunos.map(function(a){return a.id;}));}} style={{padding:"4px 10px",borderRadius:4,border:"1px solid "+BD,background:"#f3f4f6",color:MU,cursor:"pointer",fontSize:11}}>Selecionar todos</button>
        <button type="button" onClick={function(){onToggle("none");}} style={{padding:"4px 10px",borderRadius:4,border:"1px solid "+BD,background:"#f3f4f6",color:MU,cursor:"pointer",fontSize:11}}>Limpar seleção</button>
      </div>
    </div>
  );
}

function MindMap({ data }) {
  const [w, setW] = useState(860);
  const [h, setH] = useState(500);
  const ref = useRef(null);
  useEffect(function() {
    var obs = new ResizeObserver(function(entries) {
      var cw = entries[0].contentRect.width;
      setW(cw);
      setH(Math.max(460, cw * 0.58));
    });
    if (ref.current && ref.current.parentElement) obs.observe(ref.current.parentElement);
    return function() { obs.disconnect(); };
  }, []);

  if (!data || !data.nodes || !data.nodes[0]) return null;
  var root = data.nodes[0];
  var children = root.children || [];
  var cx = w / 2, cy = h / 2, r1 = Math.min(w, h) * 0.27;
  var lines = [], nodes = [];

  function wrapText(t, mx) {
    var maxc = mx || 13;
    var words = t.split(" "), ls = [], cur = "";
    for (var i = 0; i < words.length; i++) {
      var candidate = cur ? cur + " " + words[i] : words[i];
      if (candidate.length > maxc) { if (cur) ls.push(cur); cur = words[i]; }
      else cur = candidate;
    }
    if (cur) ls.push(cur);
    return ls;
  }

  function addNode(x, y, label, color, rx, ry, fs) {
    rx = rx || 50; ry = ry || 22; fs = fs || 11;
    var ls = wrapText(label, Math.floor(rx * 1.5 / fs));
    var lh = fs + 3, th = ls.length * lh;
    var ary = Math.max(ry, th / 2 + 7);
    var key = x + "_" + y + "_" + label;
    nodes.push(
      <g key={key}>
        <ellipse cx={x} cy={y} rx={rx} ry={ary} fill={color} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} style={{filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.4))"}}/>
        {ls.map(function(l, i) {
          return <text key={i} x={x} y={y - th/2 + lh*i + lh*0.8} textAnchor="middle" fill="white" fontSize={fs} fontWeight="600" fontFamily="Inter,sans-serif">{l}</text>;
        })}
      </g>
    );
  }

  function addLine(x1, y1, x2, y2, color) {
    var mx = (x1 + x2) / 2;
    lines.push(<path key={x1+"_"+y1+"_"+x2+"_"+y2} d={"M"+x1+","+y1+" Q"+mx+","+y1+" "+x2+","+y2} stroke={color} strokeWidth={2} fill="none" opacity={0.4}/>);
  }

  for (var i = 0; i < children.length; i++) {
    var ch = children[i];
    var ang = (2 * Math.PI * i) / children.length - Math.PI / 2;
    var x2 = cx + r1 * Math.cos(ang), y2 = cy + r1 * Math.sin(ang);
    addLine(cx, cy, x2, y2, ch.color);
    var gc_list = ch.children || [];
    for (var j = 0; j < gc_list.length; j++) {
      var gc = gc_list[j];
      var sp = gc_list.length === 1 ? 0 : (j / (gc_list.length - 1) - 0.5) * 0.6;
      var ga = ang + sp, r2 = r1 * 1.75;
      var gx = cx + r2 * Math.cos(ga), gy = cy + r2 * Math.sin(ga);
      addLine(x2, y2, gx, gy, gc.color);
      addNode(gx, gy, gc.label, gc.color, 40, 18, 9);
    }
    addNode(x2, y2, ch.label, ch.color, 54, 23, 11);
  }
  addNode(cx, cy, root.label, root.color, 70, 30, 13);

  return (
    <svg ref={ref} viewBox={"0 0 "+w+" "+h} width="100%">
      <rect width={w} height={h} fill="rgba(255,245,245,0.03)" rx={10}/>
      {lines}
      {nodes}
    </svg>
  );
}

export default function App() {
  const [page, setPage] = useState(PAGES.PERFIL);
  const [currentUser, setCurrentUser] = useState(null);
  const [allProfiles, setAllProfiles] = useState({});
  const [loginForm, setLoginForm] = useState({ email:"", senha:"", nome:"", escola:"", materia:"", mode:"login" });
  const [loginError, setLoginError] = useState("");
  const [turmasCadastradas, setTurmasCadastradas] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [mindMap, setMindMap] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [relatorios, setRelatorios] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [vistos, setVistos] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [newRel, setNewRel] = useState({ turma:"", materia:"", assunto:"", obs:"" });
  const [newOco, setNewOco] = useState({ turma:"", tipo:"", descricao:"", alunosSelecionados:[] });
  const [newVisto, setNewVisto] = useState({ turma:"", atividade:"", alunosSelecionados:[] });
  const [newTurma, setNewTurma] = useState({ serie:"", letra:"" });
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [alunoEditMode, setAlunoEditMode] = useState(false);
  const [newAluno, setNewAluno] = useState({ nome:"", nascimento:"" });
  const [editingAluno, setEditingAluno] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfResult, setPdfResult] = useState(null);
  const [filterRelTurma, setFilterRelTurma] = useState("");
  const [filterOcoTurma, setFilterOcoTurma] = useState("");
  const [filterVistoTurma, setFilterVistoTurma] = useState("");
  const [editP, setEditP] = useState(false);
  const [editFields, setEditFields] = useState({ nome:"", escola:"", materia:"" });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const ns = function(key) { return currentUser ? "led_" + currentUser.email + "_" + key : null; };
  const save = async function(key, val) { var k = ns(key); if (!k) return; await db.set(k, val); };

  useEffect(function() { db.get("led_profiles").then(function(p) { if (p) setAllProfiles(p); }); }, []);

  useEffect(function() {
    if (!currentUser) return;
    (async function() {
      var tc = await db.get(ns("turmas"));
      var r  = await db.get(ns("relatorios"));
      var o  = await db.get(ns("ocorrencias"));
      var v  = await db.get(ns("vistos"));
      var ch = await db.get(ns("chat"));
      var mm = await db.get(ns("mindmap"));
      var sg = await db.get(ns("suggestions"));
      var ph = await db.get(ns("photo"));
      setTurmasCadastradas(tc || []);
      setRelatorios(r || []);
      setOcorrencias(o || []);
      setVistos(v || []);
      setSuggestions(sg || []);
      setMindMap(mm || null);
      setProfilePhoto(ph || null);
      setChatHistory(ch || [{ role:"assistant", content:"Bem-vindo(a), "+currentUser.nome+". Estou pronto para auxiliar no planejamento pedagógico." }]);
    })();
  }, [currentUser]);

  useEffect(function() { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior:"smooth" }); }, [chatHistory, loading]);

  const doLogin = async function() {
    setLoginError("");
    var email = loginForm.email.trim().toLowerCase();
    var senha = loginForm.senha;
    if (!email || !senha) { setLoginError("Preencha e-mail e senha."); return; }
    var profiles = await db.get("led_profiles") || {};
    if (loginForm.mode === "cadastro") {
      if (!loginForm.nome.trim()) { setLoginError("Informe seu nome."); return; }
      if (profiles[email]) { setLoginError("Este e-mail já está cadastrado."); return; }
      if (senha.length < 6) { setLoginError("A senha deve ter ao menos 6 caracteres."); return; }
      var newP = { email:email, senha:senha, nome:loginForm.nome.trim(), escola:loginForm.escola.trim(), materia:loginForm.materia.trim() };
      profiles[email] = newP;
      await db.set("led_profiles", profiles);
      setAllProfiles(profiles);
      setCurrentUser(newP);
      setPage(PAGES.HOME);
    } else {
      var p = profiles[email];
      if (!p || p.senha !== senha) { setLoginError("E-mail ou senha incorretos."); return; }
      setCurrentUser(p);
      setPage(PAGES.HOME);
    }
  };

  const doLogout = async function() {
    setCurrentUser(null);
    setTurmasCadastradas([]); setRelatorios([]); setOcorrencias([]); setVistos([]);
    setChatHistory([]); setMindMap(null); setSuggestions([]); setProfilePhoto(null);
    setSelectedTurma(null);
    setPage(PAGES.PERFIL);
  };

  const updateProfile = async function(fields) {
    var profiles = await db.get("led_profiles") || {};
    var updated = Object.assign({}, currentUser, fields);
    profiles[currentUser.email] = updated;
    await db.set("led_profiles", profiles);
    setAllProfiles(profiles);
    setCurrentUser(updated);
  };

  const addTurma = async function() {
    if (!newTurma.serie || !newTurma.letra) return;
    var nome = newTurma.serie + " " + newTurma.letra;
    if (turmasCadastradas.find(function(t){ return t.nome === nome; })) return;
    var nova = { nome:nome, serie:newTurma.serie, letra:newTurma.letra, ultimoAssunto:{}, historico:[], alunos:[] };
    var updated = turmasCadastradas.concat([nova]);
    setTurmasCadastradas(updated);
    await save("turmas", updated);
    setNewTurma({ serie:"", letra:"" });
  };

  const removeTurma = async function(nome) {
    var updated = turmasCadastradas.filter(function(t){ return t.nome !== nome; });
    setTurmasCadastradas(updated);
    await save("turmas", updated);
    if (selectedTurma && selectedTurma.nome === nome) setSelectedTurma(null);
  };

  const updateTurmaAlunos = async function(turmaNome, alunos) {
    var updated = turmasCadastradas.map(function(t){ return t.nome === turmaNome ? Object.assign({},t,{alunos:alunos}) : t; });
    setTurmasCadastradas(updated);
    await save("turmas", updated);
    setSelectedTurma(function(prev){ return prev && prev.nome === turmaNome ? Object.assign({},prev,{alunos:alunos}) : prev; });
  };

  const addAlunoManual = async function() {
    if (!newAluno.nome.trim() || !selectedTurma) return;
    var alunos = (selectedTurma.alunos || []).concat([{ id:Date.now(), nome:newAluno.nome.trim(), nascimento:newAluno.nascimento }]);
    await updateTurmaAlunos(selectedTurma.nome, alunos);
    setNewAluno({ nome:"", nascimento:"" });
  };

  const saveEditAluno = async function() {
    if (!editingAluno || !selectedTurma) return;
    var alunos = (selectedTurma.alunos || []).map(function(a){ return a.id === editingAluno.id ? editingAluno : a; });
    await updateTurmaAlunos(selectedTurma.nome, alunos);
    setEditingAluno(null);
  };

  const removeAluno = async function(id) {
    if (!selectedTurma) return;
    var alunos = (selectedTurma.alunos || []).filter(function(a){ return a.id !== id; });
    await updateTurmaAlunos(selectedTurma.nome, alunos);
  };

  const handlePdfUpload = async function(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    setPdfLoading(true); setPdfResult(null);
    try {
      var base64 = await new Promise(function(res, rej) {
        var r = new FileReader();
        r.onload = function(){ res(r.result.split(",")[1]); };
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      var resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1200,
          system:"Extraia listas de alunos de documentos. Responda APENAS JSON: {\"alunos\":[{\"nome\":\"...\",\"nascimento\":\"DD/MM/AAAA\"}]}. Se não houver data, use \"\".",
          messages:[{ role:"user", content:[
            { type:"document", source:{ type:"base64", media_type:"application/pdf", data:base64 } },
            { type:"text", text:"Extraia a lista de alunos com nome e data de nascimento." }
          ]}]
        })
      });
      var data = await resp.json();
      var text = (data.content || []).map(function(b){ return b.text || ""; }).join("");
      var clean = text.replace(/```json|```/g,"").trim();
      var parsed = JSON.parse(clean);
      setPdfResult(parsed.alunos || []);
    } catch(err) { setPdfResult("erro"); }
    setPdfLoading(false);
    e.target.value = "";
  };

  const confirmPdfAlunos = async function() {
    if (!pdfResult || pdfResult === "erro" || !selectedTurma) return;
    var existing = selectedTurma.alunos || [];
    var novos = pdfResult.map(function(a){ return { id:Date.now()+Math.random(), nome:a.nome, nascimento:a.nascimento }; });
    await updateTurmaAlunos(selectedTurma.nome, existing.concat(novos));
    setPdfResult(null);
  };

  const handlePhotoUpload = async function(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = async function() {
      setProfilePhoto(reader.result);
      await save("photo", reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const getAlunosDaTurma = function(nomeTurma) {
    var t = turmasCadastradas.find(function(t){ return t.nome === nomeTurma; });
    return (t && t.alunos) ? t.alunos : [];
  };

  const toggleAluno = function(setter, field, id, all) {
    setter(function(p) {
      var sel = p[field] || [];
      if (id === "all") return Object.assign({}, p, { [field]: all });
      if (id === "none") return Object.assign({}, p, { [field]: [] });
      var next = sel.indexOf(id) > -1 ? sel.filter(function(x){ return x !== id; }) : sel.concat([id]);
      return Object.assign({}, p, { [field]: next });
    });
  };

  const now = function() { return new Date().toLocaleString("pt-BR"); };

  const addRel = async function() {
    if (!newRel.turma || !newRel.assunto) return;
    var upd = [Object.assign({}, newRel, { id:Date.now(), registradoEm:now() })].concat(relatorios);
    setRelatorios(upd); await save("relatorios", upd);
    setNewRel({ turma:"", materia:"", assunto:"", obs:"" });
  };

  const addOco = async function() {
    if (!newOco.turma || !newOco.descricao || !newOco.alunosSelecionados.length) return;
    var upd = [Object.assign({}, newOco, { id:Date.now(), registradoEm:now() })].concat(ocorrencias);
    setOcorrencias(upd); await save("ocorrencias", upd);
    setNewOco({ turma:"", tipo:"", descricao:"", alunosSelecionados:[] });
  };

  const addVisto = async function() {
    if (!newVisto.turma || !newVisto.atividade || !newVisto.alunosSelecionados.length) return;
    var upd = [Object.assign({}, newVisto, { id:Date.now(), registradoEm:now() })].concat(vistos);
    setVistos(upd); await save("vistos", upd);
    setNewVisto({ turma:"", atividade:"", alunosSelecionados:[] });
  };

  const removeItem = async function(key, setter, list, id) {
    var upd = list.filter(function(x){ return x.id !== id; });
    setter(upd); await save(key, upd);
  };

  const buildSystemPrompt = function() {
    if (!currentUser) return "";
    var tInfo = turmasCadastradas.map(function(t) {
      var ult = Object.entries(t.ultimoAssunto || {}).map(function(e){ return e[0]+": \""+e[1]+"\""; }).join(", ");
      var base = CURRICULUM[t.serie] ? Object.entries(CURRICULUM[t.serie]).map(function(e){ return e[0]+": "+e[1].join(", "); }).join("; ") : "";
      return "  - "+t.nome+": últimos assuntos=["+( ult||"nenhum")+"]; currículo=["+base+"]";
    }).join("\n");
    return "Você é LedAI, assistente pedagógico profissional.\nProfessor: "+currentUser.nome+" | Escola: "+(currentUser.escola||"não informada")+" | Matéria: "+(currentUser.materia||"não informada")+"\nTurmas:\n"+(tInfo||"  Nenhuma turma cadastrada.")+"\nREGRAS:\n1. Ao gerar plano, responda SOMENTE JSON:\n{\"tipo\":\"plano\",\"titulo\":\"...\",\"serie\":\"...\",\"turma\":\"...\",\"materia\":\"...\",\"assunto\":\"...\",\"nodes\":[{\"id\":\"root\",\"label\":\"Título\",\"color\":\"#c0392b\",\"children\":[{\"id\":\"obj\",\"label\":\"Objetivos\",\"color\":\"#e74c3c\",\"children\":[{\"id\":\"o1\",\"label\":\"Objetivo 1\",\"color\":\"#e57373\"}]},{\"id\":\"cont\",\"label\":\"Conteúdos\",\"color\":\"#b71c1c\",\"children\":[{\"id\":\"c1\",\"label\":\"Conteúdo\",\"color\":\"#c62828\"}]},{\"id\":\"met\",\"label\":\"Metodologia\",\"color\":\"#8b0000\",\"children\":[{\"id\":\"m1\",\"label\":\"Estratégia\",\"color\":\"#d32f2f\"}]},{\"id\":\"rec\",\"label\":\"Recursos\",\"color\":\"#7f0000\",\"children\":[{\"id\":\"r1\",\"label\":\"Recurso\",\"color\":\"#bf360c\"}]},{\"id\":\"aval\",\"label\":\"Avaliação\",\"color\":\"#6d0000\",\"children\":[{\"id\":\"a1\",\"label\":\"Forma\",\"color\":\"#c0392b\"}]},{\"id\":\"dur\",\"label\":\"Duração\",\"color\":\"#922b21\",\"children\":[{\"id\":\"d1\",\"label\":\"Tempo\",\"color\":\"#cb4335\"}]}]}]}\n2. Para sugestões: {\"tipo\":\"sugestoes\",\"lista\":[\"...\",\"...\"]}\n3. Conversa normal: texto direto, profissional, sem emojis.";
  };

  const sendMessage = async function(customInput) {
    var txt = (customInput || input).trim();
    if (!txt || loading) return;
    var userMsg = { role:"user", content:txt };
    var newHist = chatHistory.concat([userMsg]);
    setChatHistory(newHist); setInput(""); setLoading(true);
    try {
      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1200, system:buildSystemPrompt(), messages:newHist.slice(-14).map(function(m){ return { role:m.role, content:m.content }; }) })
      });
      var data = await res.json();
      var text = (data.content || []).map(function(b){ return b.text || ""; }).join("");
      var ac = text;
      try {
        var parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
        if (parsed.tipo === "plano") {
          setMindMap(parsed); await save("mindmap", parsed);
          var upd = turmasCadastradas.map(function(t){
            if (t.nome === parsed.turma || t.serie === parsed.serie) {
              var ua = Object.assign({}, t.ultimoAssunto || {});
              ua[parsed.materia] = parsed.assunto;
              var hist = (t.historico || []).slice(-9).concat([{ data:new Date().toLocaleString("pt-BR"), assunto:parsed.assunto, materia:parsed.materia }]);
              return Object.assign({}, t, { ultimoAssunto:ua, historico:hist });
            }
            return t;
          });
          setTurmasCadastradas(upd); await save("turmas", upd);
          ac = "Plano gerado: \""+parsed.titulo+"\" — "+parsed.materia+" para "+(parsed.turma||parsed.serie)+".\nDeseja ajustar alguma seção?";
        } else if (parsed.tipo === "sugestoes") {
          setSuggestions(parsed.lista || []); await save("suggestions", parsed.lista || []);
          ac = "Sugestões de continuidade geradas com base no histórico das turmas.";
        }
      } catch(e) {}
      var fh = newHist.concat([{ role:"assistant", content:ac }]);
      setChatHistory(fh); await save("chat", fh.slice(-30));
    } catch(e) { setChatHistory(newHist.concat([{ role:"assistant", content:"Erro de conexão. Tente novamente." }])); }
    setLoading(false);
  };

  // ── STYLES ──────────────────────────────────────────────────────────────────
  var S = {
    app:{ display:"flex", minHeight:"100vh", background:"#f3f4f6", fontFamily:"'Inter','Segoe UI',sans-serif", color:TX, fontSize:14 },
    sidebar:{ width:215, background:AC, display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, bottom:0, zIndex:100 },
    sideHeader:{ padding:"22px 18px 18px", borderBottom:"1px solid rgba(255,255,255,0.15)" },
    navBtn:function(active){ return { display:"flex", alignItems:"center", gap:9, padding:"10px 18px", border:"none", background:active?"rgba(255,255,255,0.15)":"transparent", color:"white", cursor:"pointer", width:"100%", textAlign:"left", fontSize:13, fontWeight:active?600:400, borderLeft:active?"3px solid white":"3px solid transparent", opacity:active?1:0.82, transition:"all .12s" }; },
    main:{ marginLeft:215, flex:1, padding:28, minHeight:"100vh", maxWidth:"calc(100vw - 215px)", boxSizing:"border-box" },
    pageTitle:{ margin:"0 0 22px", fontSize:17, fontWeight:700, color:TX, letterSpacing:-0.3, borderBottom:"2px solid "+AC, paddingBottom:12 },
    card:{ background:"white", border:"1px solid "+BD, borderRadius:8, padding:20, marginBottom:16, boxShadow:"0 1px 3px rgba(0,0,0,0.06)" },
    cardTitle:{ margin:"0 0 14px", fontSize:11, fontWeight:600, color:MU, textTransform:"uppercase", letterSpacing:0.6 },
    inp:function(w){ return { padding:"8px 12px", borderRadius:6, border:"1px solid "+BD, background:"white", color:TX, fontSize:13, outline:"none", width:w||"100%", boxSizing:"border-box" }; },
    sel:function(w){ return { padding:"8px 12px", borderRadius:6, border:"1px solid "+BD, background:"white", color:TX, fontSize:13, outline:"none", width:w||"100%", boxSizing:"border-box" }; },
    btn:function(v, sm){ return { padding:sm?"5px 12px":"8px 16px", borderRadius:6, border:v==="secondary"?"1px solid "+BD:"none", cursor:"pointer", fontSize:sm?11:13, fontWeight:500, background:v==="primary"||!v?AC:v==="danger"?"#fee2e2":v==="secondary"?"white":"#f3f4f6", color:v==="danger"?AC:v==="ghost"||v==="secondary"?TX:"white", transition:"all .12s" }; },
    row:{ display:"flex", gap:12, marginBottom:12, flexWrap:"wrap" },
    lbl:{ fontSize:11, color:MU, marginBottom:4, display:"block", textTransform:"uppercase", letterSpacing:0.5, fontWeight:500 },
    badge:function(c){ return { display:"inline-block", padding:"2px 8px", borderRadius:4, background:(c||AC)+"18", color:c||AC, fontSize:11, fontWeight:600, border:"1px solid "+(c||AC)+"30" }; },
    divider:{ height:1, background:BD, margin:"14px 0" },
    recCard:{ padding:"14px 16px", background:"#fafafa", borderRadius:6, marginBottom:8, border:"1px solid "+BD },
    tag:{ fontSize:11, color:MU, marginTop:6 },
    th:{ textAlign:"left", padding:"8px 12px", color:MU, fontWeight:500, fontSize:11, textTransform:"uppercase", letterSpacing:0.4, borderBottom:"1px solid "+BD, background:"#f9fafb" },
    td:{ padding:"10px 12px", borderBottom:"1px solid "+BD, fontSize:13 },
  };

  var nav = [
    { id:PAGES.HOME, label:"Visão Geral" },
    { id:PAGES.CHAT, label:"Assistente IA" },
    { id:PAGES.TURMAS, label:"Turmas" },
    { id:PAGES.RELATORIO, label:"Relatórios de Aula" },
    { id:PAGES.OCORRENCIAS, label:"Ocorrências" },
    { id:PAGES.VISTOS, label:"Vistos" },
    { id:PAGES.CONFIG, label:"Configurações" },
    { id:PAGES.PERFIL, label:"Perfil" },
  ];

  // ── RENDER PAGE ─────────────────────────────────────────────────────────────
  function renderPage() {

    // PERFIL
    if (page === PAGES.PERFIL) {
      if (!currentUser) return (
        <div style={{maxWidth:420}}>
          <h2 style={S.pageTitle}>{loginForm.mode==="login"?"Identificação":"Cadastro de Professor"}</h2>
          <div style={S.card}>
            {loginForm.mode==="cadastro" && <>
              <div style={{marginBottom:12}}><label style={S.lbl}>Nome completo</label><input style={S.inp()} value={loginForm.nome} onChange={function(e){setLoginForm(function(p){return Object.assign({},p,{nome:e.target.value});});}} placeholder="Nome do professor"/></div>
              <div style={{marginBottom:12}}><label style={S.lbl}>Escola / Instituição</label><input style={S.inp()} value={loginForm.escola} onChange={function(e){setLoginForm(function(p){return Object.assign({},p,{escola:e.target.value});});}} placeholder="Nome da escola"/></div>
              <div style={{marginBottom:12}}><label style={S.lbl}>Matéria que leciona</label><input style={S.inp()} value={loginForm.materia} onChange={function(e){setLoginForm(function(p){return Object.assign({},p,{materia:e.target.value});});}} placeholder="Ex: Matemática, Português..."/></div>
            </>}
            <div style={{marginBottom:12}}><label style={S.lbl}>E-mail</label><input style={S.inp()} type="email" value={loginForm.email} onChange={function(e){setLoginForm(function(p){return Object.assign({},p,{email:e.target.value});});}} placeholder="professor@escola.com.br"/></div>
            <div style={{marginBottom:16}}><label style={S.lbl}>Senha</label><input style={S.inp()} type="password" value={loginForm.senha} onChange={function(e){setLoginForm(function(p){return Object.assign({},p,{senha:e.target.value});});}} onKeyDown={function(e){if(e.key==="Enter")doLogin();}} placeholder={loginForm.mode==="cadastro"?"Mínimo 6 caracteres":""}/></div>
            {loginError && <div style={{color:AC,fontSize:12,marginBottom:12,padding:"8px 12px",background:"#fee2e2",borderRadius:6}}>{loginError}</div>}
            <button onClick={doLogin} style={Object.assign({},S.btn(),{width:"100%",padding:"10px",marginBottom:10})}>{loginForm.mode==="login"?"Entrar":"Criar conta"}</button>
            <button onClick={function(){setLoginForm(function(p){return Object.assign({},p,{mode:p.mode==="login"?"cadastro":"login",nome:"",escola:"",materia:""});});}} style={Object.assign({},S.btn("ghost"),{width:"100%",padding:"8px",fontSize:12})}>{loginForm.mode==="login"?"Não tenho cadastro — Criar conta":"Já tenho cadastro — Entrar"}</button>
          </div>
        </div>
      );
      return (
        <div style={{maxWidth:560}}>
          <h2 style={S.pageTitle}>Perfil</h2>
          <div style={S.card}>
            <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:20}}>
              <div style={{position:"relative"}}>
                <div style={{width:72,height:72,borderRadius:"50%",background:AC+"15",border:"2px solid "+AC+"30",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {profilePhoto ? <img src={profilePhoto} alt="Foto" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span style={{fontSize:28,color:AC,fontWeight:700}}>{currentUser.nome && currentUser.nome[0].toUpperCase()}</span>}
                </div>
                <button onClick={function(){if(photoInputRef.current)photoInputRef.current.click();}} style={{position:"absolute",bottom:0,right:0,width:24,height:24,borderRadius:"50%",background:AC,border:"2px solid white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"white",fontWeight:700}}>+</button>
                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:"none"}}/>
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:16}}>{currentUser.nome}</div>
                <div style={{fontSize:13,color:MU}}>{currentUser.email}</div>
                {currentUser.escola && <div style={{fontSize:13,color:MU}}>{currentUser.escola}</div>}
                {currentUser.materia && <div style={{marginTop:6}}><span style={S.badge()}>Matéria: {currentUser.materia}</span></div>}
              </div>
            </div>
            {!editP ? (
              <div style={{marginBottom:16}}><button onClick={function(){setEditFields({nome:currentUser.nome,escola:currentUser.escola||"",materia:currentUser.materia||""});setEditP(true);}} style={S.btn("secondary")}>Editar dados</button></div>
            ) : (
              <div style={{marginBottom:16}}>
                <div style={{marginBottom:10}}><label style={S.lbl}>Nome</label><input style={S.inp()} value={editFields.nome} onChange={function(e){setEditFields(function(p){return Object.assign({},p,{nome:e.target.value});});}} /></div>
                <div style={{marginBottom:10}}><label style={S.lbl}>Escola</label><input style={S.inp()} value={editFields.escola} onChange={function(e){setEditFields(function(p){return Object.assign({},p,{escola:e.target.value});});}} /></div>
                <div style={{marginBottom:14}}><label style={S.lbl}>Matéria</label><input style={S.inp()} value={editFields.materia} onChange={function(e){setEditFields(function(p){return Object.assign({},p,{materia:e.target.value});});}} /></div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={async function(){await updateProfile(editFields);setEditP(false);}} style={S.btn()}>Salvar</button>
                  <button onClick={function(){setEditP(false);}} style={S.btn("ghost")}>Cancelar</button>
                </div>
              </div>
            )}
            <div style={S.divider}/>
            <div style={{display:"flex",gap:24,marginBottom:16}}>
              {[{l:"Turmas",v:turmasCadastradas.length},{l:"Relatórios",v:relatorios.length},{l:"Ocorrências",v:ocorrencias.length},{l:"Vistos",v:vistos.length}].map(function(s){return (
                <div key={s.l} style={{textAlign:"center"}}>
                  <div style={{fontSize:20,fontWeight:700,color:AC}}>{s.v}</div>
                  <div style={{fontSize:11,color:MU,textTransform:"uppercase",letterSpacing:0.4,marginTop:2}}>{s.l}</div>
                </div>
              );})}
            </div>
            <button onClick={doLogout} style={S.btn("danger",true)}>Sair da conta</button>
          </div>
        </div>
      );
    }

    // LOCKED
    if (!currentUser) return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:32,fontWeight:800,color:AC,marginBottom:8}}>Acesso restrito</div>
          <p style={{color:MU,marginBottom:20}}>Identifique-se para acessar esta área.</p>
          <button onClick={function(){setPage(PAGES.PERFIL);}} style={S.btn()}>Ir para identificação</button>
        </div>
      </div>
    );

    // HOME
    if (page === PAGES.HOME) return (
      <div>
        <h2 style={S.pageTitle}>Visão Geral</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:20}}>
          {[{l:"Turmas",v:turmasCadastradas.length,pg:PAGES.TURMAS},{l:"Relatórios",v:relatorios.length,pg:PAGES.RELATORIO},{l:"Ocorrências",v:ocorrencias.length,pg:PAGES.OCORRENCIAS},{l:"Vistos",v:vistos.length,pg:PAGES.VISTOS}].map(function(item){return (
            <button key={item.pg} onClick={function(){setPage(item.pg);}} style={Object.assign({},S.card,{cursor:"pointer",textAlign:"left",marginBottom:0})}>
              <div style={{fontSize:24,fontWeight:700,color:AC,marginBottom:4}}>{item.v}</div>
              <div style={{fontSize:11,color:MU,textTransform:"uppercase",letterSpacing:0.5}}>{item.l}</div>
            </button>
          );})}
        </div>
        {turmasCadastradas.length > 0 && (
          <div style={S.card}>
            <p style={S.cardTitle}>Progresso por turma</p>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Turma","Alunos","Último assunto por matéria"].map(function(h){return <th key={h} style={S.th}>{h}</th>;})}</tr></thead>
              <tbody>{turmasCadastradas.map(function(t){return (
                <tr key={t.nome}>
                  <td style={Object.assign({},S.td,{fontWeight:600})}>{t.nome}</td>
                  <td style={S.td}>{(t.alunos||[]).length}</td>
                  <td style={S.td}>{Object.entries(t.ultimoAssunto||{}).length>0?Object.entries(t.ultimoAssunto).map(function(e){return <div key={e[0]}><span style={{fontWeight:500}}>{e[0]}:</span> <span style={{color:MU}}>{e[1]}</span></div>}):<span style={{color:MU,fontStyle:"italic"}}>Sem registros</span>}</td>
                </tr>
              );})}</tbody>
            </table>
          </div>
        )}
      </div>
    );

    // CHAT
    if (page === PAGES.CHAT) return (
      <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 56px)"}}>
        <h2 style={S.pageTitle}>Assistente IA</h2>
        <div style={Object.assign({},S.card,{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:8})}>
          {chatHistory.map(function(m,i){
            var isAI = m.role === "assistant";
            return (
              <div key={i} style={{display:"flex",justifyContent:isAI?"flex-start":"flex-end"}}>
                {isAI && <div style={{width:28,height:28,borderRadius:"50%",background:AC,display:"flex",alignItems:"center",justifyContent:"center",marginRight:8,flexShrink:0,fontSize:11,fontWeight:700,color:"white"}}>IA</div>}
                <div style={{maxWidth:"76%",padding:"9px 14px",borderRadius:isAI?"2px 12px 12px 12px":"12px 2px 12px 12px",background:isAI?"#fff5f5":AC,color:isAI?TX:"white",fontSize:13,lineHeight:1.65,border:isAI?"1px solid #fecaca":"none",whiteSpace:"pre-wrap"}}>{m.content}</div>
              </div>
            );
          })}
          {loading && <div style={{display:"flex",gap:4,padding:"9px 14px",background:"#fff5f5",borderRadius:"2px 12px 12px 12px",width:"fit-content",border:"1px solid #fecaca"}}>{[0,1,2].map(function(i){return <div key={i} style={{width:6,height:6,borderRadius:"50%",background:AC,animation:"bounce 1s infinite",animationDelay:(i*.2)+"s"}}/>;})}</div>}
          <div ref={bottomRef}/>
        </div>
        {suggestions.length > 0 && <div style={{display:"flex",gap:6,flexWrap:"wrap",padding:"8px 0"}}>{suggestions.map(function(s,i){return <button key={i} onClick={function(){sendMessage(s);}} style={S.btn("secondary")}>{s}</button>;})}</div>}
        {mindMap && (
          <div style={Object.assign({},S.card,{marginTop:8})}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontWeight:600,fontSize:13}}>{mindMap.titulo}</span>
              <button onClick={function(){setMindMap(null);save("mindmap",null);}} style={S.btn("ghost",true)}>Fechar</button>
            </div>
            <MindMap data={mindMap}/>
          </div>
        )}
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <textarea value={input} onChange={function(e){setInput(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder={turmasCadastradas.length>0?"Ex: \"Gere plano para "+turmasCadastradas[0].nome+"\" ou \"O que trabalhar depois com "+turmasCadastradas[0].nome+"?\"":"Cadastre turmas em Configurações para começar..."} rows={2} style={Object.assign({},S.inp(),{flex:1,resize:"none"})}/>
          <button onClick={function(){sendMessage();}} disabled={loading||!input.trim()} style={Object.assign({},S.btn(),{padding:"0 18px",opacity:loading||!input.trim()?0.4:1})}>Enviar</button>
        </div>
        <style>{"@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}"}</style>
      </div>
    );

    // TURMAS
    if (page === PAGES.TURMAS) {
      if (selectedTurma) {
        var alunos = selectedTurma.alunos || [];
        return (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <button onClick={function(){setSelectedTurma(null);setPdfResult(null);setAlunoEditMode(false);}} style={S.btn("ghost")}>Voltar</button>
              <h2 style={Object.assign({},S.pageTitle,{margin:0,border:"none",paddingBottom:0})}>Turma {selectedTurma.nome}</h2>
              <span style={Object.assign({},S.badge(),{marginLeft:"auto"})}>{alunos.length} aluno{alunos.length!==1?"s":""}</span>
            </div>
            <div style={S.card}>
              <p style={S.cardTitle}>Importar alunos via PDF</p>
              <p style={{fontSize:13,color:MU,marginBottom:12}}>Faça upload de um PDF com a lista de alunos. A IA identificará nome e data de nascimento automaticamente.</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={handlePdfUpload} style={{display:"none"}}/>
                <button onClick={function(){if(fileInputRef.current)fileInputRef.current.click();}} style={S.btn("secondary")} disabled={pdfLoading}>{pdfLoading?"Processando...":"Selecionar PDF"}</button>
                <button onClick={function(){setAlunoEditMode(function(v){return !v;});}} style={S.btn("ghost")}>{alunoEditMode?"Ocultar cadastro manual":"Cadastro manual"}</button>
              </div>
              {pdfResult && pdfResult !== "erro" && (
                <div style={{marginTop:14}}>
                  <p style={{fontSize:12,color:MU,marginBottom:8}}>{pdfResult.length} aluno(s) identificado(s). Revise e confirme:</p>
                  <div style={{maxHeight:200,overflowY:"auto",border:"1px solid "+BD,borderRadius:6}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr><th style={S.th}>Nome</th><th style={S.th}>Nascimento</th></tr></thead>
                      <tbody>{pdfResult.map(function(a,i){return (
                        <tr key={i}>
                          <td style={S.td}><input value={a.nome} onChange={function(e){var r=pdfResult.slice();r[i]=Object.assign({},r[i],{nome:e.target.value});setPdfResult(r);}} style={Object.assign({},S.inp(),{border:"none",background:"transparent",padding:0})}/></td>
                          <td style={S.td}><input value={a.nascimento} onChange={function(e){var r=pdfResult.slice();r[i]=Object.assign({},r[i],{nascimento:e.target.value});setPdfResult(r);}} style={Object.assign({},S.inp(),{border:"none",background:"transparent",padding:0})}/></td>
                        </tr>
                      );})}</tbody>
                    </table>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <button onClick={confirmPdfAlunos} style={S.btn()}>Confirmar e adicionar</button>
                    <button onClick={function(){setPdfResult(null);}} style={S.btn("ghost")}>Cancelar</button>
                  </div>
                </div>
              )}
              {pdfResult === "erro" && <div style={{marginTop:10,color:AC,fontSize:12}}>Não foi possível extrair os dados. Use o cadastro manual.</div>}
            </div>
            {alunoEditMode && (
              <div style={S.card}>
                <p style={S.cardTitle}>Cadastro manual</p>
                <div style={Object.assign({},S.row,{alignItems:"flex-end"})}>
                  <div style={{flex:2}}><label style={S.lbl}>Nome completo</label><input style={S.inp()} value={newAluno.nome} onChange={function(e){setNewAluno(function(p){return Object.assign({},p,{nome:e.target.value});});}} placeholder="Nome do aluno"/></div>
                  <div style={{flex:1}}><label style={S.lbl}>Data de nascimento</label><input style={S.inp()} value={newAluno.nascimento} onChange={function(e){setNewAluno(function(p){return Object.assign({},p,{nascimento:e.target.value});});}} placeholder="DD/MM/AAAA"/></div>
                  <button onClick={addAlunoManual} style={S.btn()}>Adicionar</button>
                </div>
              </div>
            )}
            {editingAluno && (
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
                <div style={Object.assign({},S.card,{width:380,marginBottom:0,boxShadow:"0 8px 32px rgba(0,0,0,0.2)"})}>
                  <p style={S.cardTitle}>Editar aluno</p>
                  <div style={{marginBottom:10}}><label style={S.lbl}>Nome</label><input style={S.inp()} value={editingAluno.nome} onChange={function(e){setEditingAluno(function(p){return Object.assign({},p,{nome:e.target.value});});}}/></div>
                  <div style={{marginBottom:14}}><label style={S.lbl}>Data de nascimento</label><input style={S.inp()} value={editingAluno.nascimento} onChange={function(e){setEditingAluno(function(p){return Object.assign({},p,{nascimento:e.target.value});});}}/></div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={saveEditAluno} style={S.btn()}>Salvar</button>
                    <button onClick={function(){setEditingAluno(null);}} style={S.btn("ghost")}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
            <div style={S.card}>
              <p style={S.cardTitle}>Lista de alunos</p>
              {alunos.length === 0 ? <div style={{color:MU,fontStyle:"italic",fontSize:13}}>Nenhum aluno cadastrado ainda.</div> : (
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr><th style={S.th}>#</th><th style={S.th}>Nome</th><th style={S.th}>Nascimento</th><th style={S.th}>Ações</th></tr></thead>
                  <tbody>{alunos.map(function(a,i){return (
                    <tr key={a.id}>
                      <td style={Object.assign({},S.td,{color:MU,width:40})}>{i+1}</td>
                      <td style={Object.assign({},S.td,{fontWeight:500})}>{a.nome}</td>
                      <td style={S.td}>{a.nascimento||"—"}</td>
                      <td style={S.td}>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={function(){setEditingAluno(Object.assign({},a));}} style={S.btn("secondary",true)}>Editar</button>
                          <button onClick={function(){removeAluno(a.id);}} style={S.btn("danger",true)}>Remover</button>
                        </div>
                      </td>
                    </tr>
                  );})}</tbody>
                </table>
              )}
            </div>
          </div>
        );
      }
      return (
        <div>
          <h2 style={S.pageTitle}>Turmas</h2>
          {turmasCadastradas.length === 0 ? <div style={{color:MU,fontSize:13}}>Nenhuma turma cadastrada. Acesse Configurações para adicionar.</div> : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10}}>
              {turmasCadastradas.map(function(t){return (
                <button key={t.nome} onClick={function(){setSelectedTurma(t);}} style={Object.assign({},S.card,{cursor:"pointer",textAlign:"left",marginBottom:0})}>
                  <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{t.nome}</div>
                  <div style={{fontSize:12,color:MU}}>{(t.alunos||[]).length} aluno{(t.alunos||[]).length!==1?"s":""}</div>
                  {Object.keys(t.ultimoAssunto||{}).length>0 && <div style={{fontSize:11,color:MU,marginTop:4,borderTop:"1px solid "+BD,paddingTop:4}}>Último: {Object.values(t.ultimoAssunto)[0]}</div>}
                </button>
              );})}
            </div>
          )}
        </div>
      );
    }

    // RELATORIO
    if (page === PAGES.RELATORIO) {
      var filteredRel = filterRelTurma ? relatorios.filter(function(r){return r.turma===filterRelTurma;}) : relatorios;
      var turmasComRel = relatorios.map(function(r){return r.turma;}).filter(function(v,i,a){return v && a.indexOf(v)===i;});
      return (
        <div>
          <h2 style={S.pageTitle}>Relatórios de Aula</h2>
          <div style={S.card}>
            <p style={S.cardTitle}>Novo relatório</p>
            <div style={S.row}>
              <div style={{flex:"0 0 170px"}}><label style={S.lbl}>Turma</label><select style={S.sel()} value={newRel.turma} onChange={function(e){setNewRel(function(p){return Object.assign({},p,{turma:e.target.value});});}}><option value="">Selecione</option>{turmasCadastradas.map(function(t){return <option key={t.nome}>{t.nome}</option>;})}</select></div>
              <div style={{flex:"0 0 160px"}}><label style={S.lbl}>Matéria</label><input style={S.inp()} value={newRel.materia} onChange={function(e){setNewRel(function(p){return Object.assign({},p,{materia:e.target.value});});}} placeholder="Ex: Matemática"/></div>
              <div style={{flex:1}}><label style={S.lbl}>Assunto trabalhado</label><input style={S.inp()} value={newRel.assunto} onChange={function(e){setNewRel(function(p){return Object.assign({},p,{assunto:e.target.value});});}} placeholder="Ex: Frações equivalentes"/></div>
            </div>
            <div style={{marginBottom:12}}><label style={S.lbl}>Observações</label><textarea style={Object.assign({},S.inp(),{height:68,resize:"vertical"})} value={newRel.obs} onChange={function(e){setNewRel(function(p){return Object.assign({},p,{obs:e.target.value});});}} placeholder="Participação, dificuldades, encaminhamentos..."/></div>
            <button onClick={addRel} style={S.btn()}>Salvar relatório</button>
          </div>
          {relatorios.length > 0 && (
            <div style={S.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <p style={Object.assign({},S.cardTitle,{margin:0})}>Registros — {filteredRel.length}</p>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:12,color:MU}}>Filtrar:</span>
                  <select style={S.sel("auto")} value={filterRelTurma} onChange={function(e){setFilterRelTurma(e.target.value);}}><option value="">Todas as turmas</option>{turmasComRel.map(function(t){return <option key={t}>{t}</option>;})}</select>
                </div>
              </div>
              {filteredRel.map(function(r){return (
                <div key={r.id} style={S.recCard}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><span style={{fontWeight:600}}>{r.turma}</span>{r.materia&&<span style={S.badge()}>{r.materia}</span>}</div>
                      <div style={{fontSize:13}}>{r.assunto}</div>
                      {r.obs&&<div style={{fontSize:12,color:MU,marginTop:4}}>{r.obs}</div>}
                    </div>
                    <button onClick={function(){removeItem("relatorios",setRelatorios,relatorios,r.id);}} style={Object.assign({},S.btn("danger",true),{marginLeft:12})}>Remover</button>
                  </div>
                  <div style={S.tag}>Registrado em: {r.registradoEm}</div>
                </div>
              );})}
            </div>
          )}
        </div>
      );
    }

    // OCORRENCIAS
    if (page === PAGES.OCORRENCIAS) {
      var turmasComOco = ocorrencias.map(function(o){return o.turma;}).filter(function(v,i,a){return v&&a.indexOf(v)===i;});
      var turmasMostrar = filterOcoTurma ? [filterOcoTurma] : turmasCadastradas.map(function(t){return t.nome;});
      return (
        <div>
          <h2 style={S.pageTitle}>Ocorrências</h2>
          <div style={S.card}>
            <p style={S.cardTitle}>Nova ocorrência</p>
            <div style={S.row}>
              <div style={{flex:"0 0 160px"}}><label style={S.lbl}>Turma</label><select style={S.sel()} value={newOco.turma} onChange={function(e){setNewOco(function(p){return Object.assign({},p,{turma:e.target.value,alunosSelecionados:[]});});}}><option value="">Selecione</option>{turmasCadastradas.map(function(t){return <option key={t.nome}>{t.nome}</option>;})}</select></div>
              <div style={{flex:"0 0 200px"}}><label style={S.lbl}>Tipo</label><select style={S.sel()} value={newOco.tipo} onChange={function(e){setNewOco(function(p){return Object.assign({},p,{tipo:e.target.value});});}}><option value="">Selecione</option>{TIPOS_OCO.map(function(t){return <option key={t}>{t}</option>;})}</select></div>
            </div>
            {newOco.turma && <AlunoChecklist alunos={getAlunosDaTurma(newOco.turma)} selecionados={newOco.alunosSelecionados} onToggle={function(id,all){toggleAluno(setNewOco,"alunosSelecionados",id,all);}}/>}
            <div style={{marginTop:12,marginBottom:12}}><label style={S.lbl}>Descrição</label><textarea style={Object.assign({},S.inp(),{height:78,resize:"vertical"})} value={newOco.descricao} onChange={function(e){setNewOco(function(p){return Object.assign({},p,{descricao:e.target.value});});}} placeholder="Descreva detalhadamente o ocorrido..."/></div>
            <button onClick={addOco} style={S.btn()}>Registrar ocorrência</button>
          </div>
          {ocorrencias.length > 0 && (
            <div style={S.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <p style={Object.assign({},S.cardTitle,{margin:0})}>Ocorrências — {ocorrencias.length}</p>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:12,color:MU}}>Filtrar:</span>
                  <select style={S.sel("auto")} value={filterOcoTurma} onChange={function(e){setFilterOcoTurma(e.target.value);}}><option value="">Todas as turmas</option>{turmasComOco.map(function(t){return <option key={t}>{t}</option>;})}</select>
                </div>
              </div>
              {turmasMostrar.map(function(nomeTurma){
                var regs = ocorrencias.filter(function(o){return o.turma===nomeTurma;});
                if (!regs.length) return null;
                var alunosDaTurma = getAlunosDaTurma(nomeTurma);
                return (
                  <div key={nomeTurma} style={{marginBottom:16}}>
                    <div style={{padding:"8px 14px",background:AC+"10",border:"1px solid "+AC+"25",borderRadius:"6px 6px 0 0",fontWeight:600,fontSize:12,color:AC,textTransform:"uppercase",letterSpacing:0.4}}>
                      {nomeTurma} — {regs.length} ocorrência{regs.length>1?"s":""}
                    </div>
                    <div style={{border:"1px solid "+BD,borderTop:"none",borderRadius:"0 0 6px 6px",overflow:"hidden"}}>
                      {regs.map(function(o){return (
                        <div key={o.id} style={Object.assign({},S.recCard,{borderRadius:0,borderLeft:"none",borderRight:"none",borderTop:"none",background:"white"})}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                            <div style={{flex:1}}>
                              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                                {o.tipo&&<span style={S.badge(AC)}>{o.tipo}</span>}
                              </div>
                              {o.alunosSelecionados && o.alunosSelecionados.length > 0 && (
                                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                                  {o.alunosSelecionados.map(function(id){var a=alunosDaTurma.find(function(x){return x.id===id;});return a?<span key={id} style={S.badge(AC)}>{a.nome}</span>:null;})}
                                </div>
                              )}
                              <div style={{fontSize:13}}>{o.descricao}</div>
                            </div>
                            <button onClick={function(){removeItem("ocorrencias",setOcorrencias,ocorrencias,o.id);}} style={Object.assign({},S.btn("danger",true),{marginLeft:12})}>Remover</button>
                          </div>
                          <div style={S.tag}>Registrado em: {o.registradoEm}</div>
                        </div>
                      );})}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // VISTOS
    if (page === PAGES.VISTOS) {
      var filteredVis = filterVistoTurma ? vistos.filter(function(v){return v.turma===filterVistoTurma;}) : vistos;
      var turmasComVisto = vistos.map(function(v){return v.turma;}).filter(function(val,i,a){return val&&a.indexOf(val)===i;});
      return (
        <div>
          <h2 style={S.pageTitle}>Vistos</h2>
          <div style={S.card}>
            <p style={S.cardTitle}>Registrar visto</p>
            <div style={S.row}>
              <div style={{flex:"0 0 170px"}}><label style={S.lbl}>Turma</label><select style={S.sel()} value={newVisto.turma} onChange={function(e){setNewVisto(function(p){return Object.assign({},p,{turma:e.target.value,alunosSelecionados:[]});});}}><option value="">Selecione</option>{turmasCadastradas.map(function(t){return <option key={t.nome}>{t.nome}</option>;})}</select></div>
              <div style={{flex:1}}><label style={S.lbl}>Atividade</label><input style={S.inp()} value={newVisto.atividade} onChange={function(e){setNewVisto(function(p){return Object.assign({},p,{atividade:e.target.value});});}} placeholder="Ex: Lista pág. 45, Redação, Caderno..."/></div>
            </div>
            {newVisto.turma && <AlunoChecklist alunos={getAlunosDaTurma(newVisto.turma)} selecionados={newVisto.alunosSelecionados} onToggle={function(id,all){toggleAluno(setNewVisto,"alunosSelecionados",id,all);}}/>}
            <div style={{marginTop:12}}><button onClick={addVisto} style={S.btn()}>Registrar visto</button></div>
          </div>
          {vistos.length > 0 && (
            <div style={S.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <p style={Object.assign({},S.cardTitle,{margin:0})}>Registros — {filteredVis.length}</p>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:12,color:MU}}>Filtrar:</span>
                  <select style={S.sel("auto")} value={filterVistoTurma} onChange={function(e){setFilterVistoTurma(e.target.value);}}><option value="">Todas as turmas</option>{turmasComVisto.map(function(t){return <option key={t}>{t}</option>;})}</select>
                </div>
              </div>
              {filteredVis.map(function(v){
                var alunosDaTurma = getAlunosDaTurma(v.turma);
                return (
                  <div key={v.id} style={S.recCard}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><span style={{fontWeight:600}}>{v.turma}</span><span style={{fontSize:13,color:MU}}>—</span><span style={{fontSize:13}}>{v.atividade}</span></div>
                        {v.alunosSelecionados && v.alunosSelecionados.length > 0 && (
                          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                            {v.alunosSelecionados.map(function(id){var a=alunosDaTurma.find(function(x){return x.id===id;});return a?<span key={id} style={S.badge("#16a34a")}>{a.nome}</span>:null;})}
                          </div>
                        )}
                      </div>
                      <button onClick={function(){removeItem("vistos",setVistos,vistos,v.id);}} style={Object.assign({},S.btn("danger",true),{marginLeft:12})}>Remover</button>
                    </div>
                    <div style={S.tag}>Registrado em: {v.registradoEm}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // CONFIG
    if (page === PAGES.CONFIG) return (
      <div>
        <h2 style={S.pageTitle}>Configurações</h2>
        <div style={S.card}>
          <p style={S.cardTitle}>Cadastrar nova turma</p>
          <div style={S.row}>
            <div style={{flex:"0 0 220px"}}><label style={S.lbl}>Série</label><select style={S.sel()} value={newTurma.serie} onChange={function(e){setNewTurma(function(p){return Object.assign({},p,{serie:e.target.value});});}}><option value="">Selecione a série</option>{SERIES_BASE.map(function(s){return <option key={s}>{s}</option>;})}</select></div>
            <div style={{flex:"0 0 130px"}}><label style={S.lbl}>Letra</label><select style={S.sel()} value={newTurma.letra} onChange={function(e){setNewTurma(function(p){return Object.assign({},p,{letra:e.target.value});});}}><option value="">Letra</option>{LETRAS.map(function(l){return <option key={l}>{l}</option>;})}</select></div>
            <div style={{display:"flex",alignItems:"flex-end"}}><button onClick={addTurma} style={S.btn()}>Adicionar turma</button></div>
          </div>
          {newTurma.serie && newTurma.letra && <div style={{fontSize:12,color:MU}}>Será cadastrada como: <strong>{newTurma.serie} {newTurma.letra}</strong></div>}
        </div>
        {turmasCadastradas.length > 0 && (
          <div style={S.card}>
            <p style={S.cardTitle}>Turmas cadastradas</p>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Turma","Série","Letra","Alunos","Ações"].map(function(h){return <th key={h} style={S.th}>{h}</th>;})}</tr></thead>
              <tbody>{turmasCadastradas.map(function(t){return (
                <tr key={t.nome}>
                  <td style={Object.assign({},S.td,{fontWeight:600})}>{t.nome}</td>
                  <td style={S.td}>{t.serie}</td>
                  <td style={S.td}>{t.letra}</td>
                  <td style={S.td}>{(t.alunos||[]).length}</td>
                  <td style={S.td}><button onClick={function(){removeTurma(t.nome);}} style={S.btn("danger",true)}>Remover</button></td>
                </tr>
              );})}</tbody>
            </table>
          </div>
        )}
      </div>
    );

    return null;
  }

  return (
    <div style={S.app}>
      <div style={S.sidebar}>
        <div style={S.sideHeader}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Plataforma Pedagógica</div>
          <div style={{fontWeight:800,fontSize:18,color:"white",letterSpacing:-0.5}}>LedAI</div>
          {currentUser && <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{currentUser.nome}</div>}
        </div>
        <div style={{padding:"8px 0",flex:1}}>
          {nav.map(function(n){
            var locked = !currentUser && n.id !== PAGES.PERFIL;
            return (
              <button key={n.id} onClick={function(){if(!locked)setPage(n.id);}} style={Object.assign({},S.navBtn(page===n.id),{opacity:locked?0.35:1,cursor:locked?"default":"pointer"})}>
                {n.label}
                {locked && <span style={{marginLeft:"auto",fontSize:9,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:0.5}}>bloqueado</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div style={S.main}>{renderPage()}</div>
    </div>
  );
}
