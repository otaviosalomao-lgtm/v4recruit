import { useState, useEffect, useCallback } from "react";

const API_URL = "https://script.google.com/macros/s/AKfycbxZNKQlqPjN6QgjuGPTa0S2TFjyv__1JgY0SSrZzOhD9rNZsWF1EhUWEfoy3CYlvC5M/exec";

const FASES = [
  { id: "hunting",      label: "Hunting",           cor: "#555" },
  { id: "abordado",     label: "Abordado",           cor: "#7C3AED" },
  { id: "cadastro",     label: "Cadastro",           cor: "#2563EB" },
  { id: "ent_inicial",  label: "Ent. Inicial",       cor: "#0891B2" },
  { id: "ent_tecnica",  label: "Ent. Técnica",       cor: "#D97706" },
  { id: "aprovado",     label: "Aprovado",           cor: "#16A34A" },
  { id: "contratado",   label: "Contratado",         cor: "#15803D" },
  { id: "rep_cultural", label: "Rep. Cultural",      cor: "#DC2626" },
  { id: "rep_tecnica",  label: "Rep. Técnica",       cor: "#DC2626" },
  { id: "rep_salarial", label: "Rep. Salarial",      cor: "#DC2626" },
  { id: "desistente",   label: "Desistente",         cor: "#6B7280" },
];

const FASES_PIPELINE = FASES.filter(f =>
  !["rep_cultural","rep_tecnica","rep_salarial","desistente"].includes(f.id)
);

const api = {
  get: async (action, params = {}) => {
    const q = new URLSearchParams({ action, ...params });
    const r = await fetch(`${API_URL}?${q}`);
    return r.json();
  },
  post: async (action, data = {}) => {
    const r = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action, ...data }),
    });
    return r.json();
  }
};

// ─── BASE COMPONENTS ──────────────────────────────────────────
const Badge = ({ fase }) => {
  const f = FASES.find(x => x.id === fase) || FASES[0];
  return (
    <span style={{
      background: f.cor + "22", color: f.cor,
      border: `1px solid ${f.cor}44`,
      padding: "2px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap"
    }}>{f.label}</span>
  );
};

const SLABadge = ({ sla }) => {
  const d = parseInt(sla) || 0;
  const c = d <= 7 ? "#16A34A" : d <= 14 ? "#D97706" : "#DC2626";
  return (
    <span style={{
      background: c + "22", color: c, border: `1px solid ${c}44`,
      padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700
    }}>{d}d</span>
  );
};

const Inp = ({ label, ...p }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 500 }}>{label}</label>}
    <input style={{
      width: "100%", padding: "10px 12px", background: "#1a1a1a",
      border: "1px solid #333", borderRadius: 6, color: "#fff",
      fontSize: 14, outline: "none", boxSizing: "border-box"
    }} {...p} />
  </div>
);

const Sel = ({ label, options, ...p }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 500 }}>{label}</label>}
    <select style={{
      width: "100%", padding: "10px 12px", background: "#1a1a1a",
      border: "1px solid #333", borderRadius: 6, color: "#fff",
      fontSize: 14, outline: "none", boxSizing: "border-box"
    }} {...p}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Btn = ({ children, variant = "primary", style: s = {}, ...p }) => (
  <button style={{
    padding: "10px 20px",
    background: variant === "primary" ? "#CC0000" : variant === "danger" ? "#DC2626" : "transparent",
    color: "#fff", border: variant === "ghost" ? "1px solid #333" : "none",
    borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", ...s
  }} {...p}>{children}</button>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: 20
  }}>
    <div style={{
      background: "#111", border: "1px solid #222", borderRadius: 12,
      padding: 24, width: "100%", maxWidth: wide ? 680 : 520,
      maxHeight: "90vh", overflowY: "auto"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: "#fff" }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", fontSize: 22, cursor: "pointer" }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

// ─── LOGIN ────────────────────────────────────────────────────
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro]   = useState("");
  const [load, setLoad]   = useState(false);

  const handleLogin = async () => {
    setLoad(true); setErro("");
    const r = await api.post("login", { email, senha });
    setLoad(false);
    if (r.success) onLogin(r);
    else setErro(r.error || "Email ou senha incorretos.");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: 40, width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: "#CC0000", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4 }}>V4</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Recruit</div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>Borges & Co</div>
        </div>
        <Inp label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
        <Inp label="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
        {erro && <div style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 12 }}>{erro}</div>}
        <Btn onClick={handleLogin} disabled={load} style={{ width: "100%", padding: "12px 0", fontSize: 15 }}>
          {load ? "Entrando..." : "Entrar"}
        </Btn>
      </div>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────
const Dashboard = ({ onVerVaga }) => {
  const [dados, setDados] = useState(null);

  useEffect(() => { api.get("getDashboard").then(r => r.success && setDados(r)); }, []);

  if (!dados) return <div style={{ color: "#666", padding: 40 }}>Carregando...</div>;

  const { pipeline, porVaga } = dados;
  const totalRep = (pipeline.rep_cultural || 0) + (pipeline.rep_tecnica || 0) + (pipeline.rep_salarial || 0);
  const total    = Object.values(pipeline).reduce((a, b) => a + b, 0);

  const CARDS = [
    ...FASES_PIPELINE,
    { id: "rep_total",    label: "Total Reprovados", cor: "#DC2626", total: totalRep },
    { id: "rep_cultural", label: "Rep. Cultural",    cor: "#EF4444" },
    { id: "rep_tecnica",  label: "Rep. Técnica",     cor: "#EF4444" },
    { id: "rep_salarial", label: "Rep. Salarial",    cor: "#EF4444" },
    { id: "desistente",   label: "Desistente",       cor: "#6B7280" },
  ];

  return (
    <div>
      <h2 style={{ margin: "0 0 24px", fontSize: 22, color: "#fff" }}>Dashboard</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
        {CARDS.map(f => {
          const val = f.total !== undefined ? f.total : (pipeline[f.id] || 0);
          return (
            <div key={f.id} style={{
              background: "#111", border: `1px solid ${f.cor}33`,
              borderRadius: 10, padding: "16px 20px", cursor: "pointer"
            }} onClick={() => f.id !== "rep_total" && onVerVaga(null, f.id)}>
              <div style={{ fontSize: 30, fontWeight: 800, color: f.cor }}>{val}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
                {total > 0 ? Math.round(val / total * 100) : 0}%
              </div>
            </div>
          );
        })}
      </div>

      <h3 style={{ fontSize: 16, color: "#aaa", margin: "0 0 16px" }}>Por Vaga</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.entries(porVaga).filter(([v]) => v).map(([vaga, data]) => {
          const tot = Object.values(data).reduce((a, b) => a + b, 0);
          return (
            <div key={vaga} style={{
              background: "#111", border: "1px solid #222", borderRadius: 10,
              padding: "14px 20px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between"
            }} onClick={() => onVerVaga(vaga)}>
              <div>
                <div style={{ fontWeight: 600, color: "#fff", fontSize: 15 }}>{vaga}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{tot} candidatos</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {FASES_PIPELINE.slice(0,5).map(f => (data[f.id] || 0) > 0 && (
                  <span key={f.id} style={{
                    background: f.cor + "22", color: f.cor,
                    padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600
                  }}>{f.label.split(" ")[0]}: {data[f.id]}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── PIPELINE KANBAN ──────────────────────────────────────────
const Pipeline = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [vagas, setVagas]           = useState([]);
  const [vagaSel, setVagaSel]       = useState("");
  const [load, setLoad]             = useState(false);
  const [detalhe, setDetalhe]       = useState(null);

  useEffect(() => {
    api.get("getVagas").then(r => r.success && setVagas(r.vagas));
  }, []);

  useEffect(() => {
    if (!vagaSel) return;
    setLoad(true);
    api.get("getCandidatos", { vaga: vagaSel }).then(r => {
      if (r.success) setCandidatos(r.candidatos);
      setLoad(false);
    });
  }, [vagaSel]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, color: "#fff" }}>Pipeline</h2>
        <select
          value={vagaSel}
          onChange={e => setVagaSel(e.target.value)}
          style={{
            padding: "8px 12px", background: "#111", border: "1px solid #333",
            borderRadius: 6, color: vagaSel ? "#fff" : "#666", fontSize: 14, outline: "none"
          }}
        >
          <option value="">Selecione uma vaga...</option>
          {vagas.map(v => (
            <option key={v.id} value={`${v.nome} — ${v.cidade}`}>{v.nome} — {v.cidade}</option>
          ))}
        </select>
      </div>

      {!vagaSel && (
        <div style={{ color: "#555", textAlign: "center", padding: 60 }}>Selecione uma vaga para ver o pipeline</div>
      )}

      {vagaSel && load && (
        <div style={{ color: "#666", padding: 20 }}>Carregando...</div>
      )}

      {vagaSel && !load && (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
          {FASES_PIPELINE.map(fase => {
            const cands = candidatos.filter(c => c.fase === fase.id);
            return (
              <div key={fase.id} style={{
                minWidth: 200, background: "#111",
                border: `1px solid ${fase.cor}22`, borderRadius: 10,
                padding: 14, flexShrink: 0
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: fase.cor, letterSpacing: 0.5 }}>
                    {fase.label.toUpperCase()}
                  </span>
                  <span style={{
                    background: fase.cor + "22", color: fase.cor,
                    padding: "2px 8px", borderRadius: 99, fontSize: 12, fontWeight: 700
                  }}>{cands.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cands.map(c => (
                    <div key={c.row} style={{
                      background: "#0a0a0a", border: "1px solid #222",
                      borderRadius: 8, padding: "10px 12px", cursor: "pointer"
                    }} onClick={() => setDetalhe(c)}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 4 }}>{c.nome}</div>
                      <SLABadge sla={c.sla} />
                    </div>
                  ))}
                  {cands.length === 0 && (
                    <div style={{ color: "#444", fontSize: 12, textAlign: "center", padding: "20px 0" }}>Vazio</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detalhe && (
        <ModalDetalhe
          candidato={detalhe}
          onClose={() => setDetalhe(null)}
          onAtualizado={() => { setDetalhe(null); setVagaSel(v => v); }}
        />
      )}
    </div>
  );
};

// ─── CANDIDATOS ───────────────────────────────────────────────
const Candidatos = ({ filtroVaga, filtroFase }) => {
  const [candidatos, setCandidatos] = useState([]);
  const [busca, setBusca]           = useState("");
  const [load, setLoad]             = useState(true);
  const [modalAdd, setModalAdd]     = useState(false);
  const [detalhe, setDetalhe]       = useState(null);

  const carregar = useCallback(async () => {
    setLoad(true);
    const params = {};
    if (filtroVaga) params.vaga  = filtroVaga;
    if (filtroFase) params.fase  = filtroFase;
    if (busca)      params.busca = busca;
    const r = await api.get("getCandidatos", params);
    if (r.success) setCandidatos(r.candidatos);
    setLoad(false);
  }, [filtroVaga, filtroFase, busca]);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, color: "#fff" }}>
          Candidatos {filtroVaga && <span style={{ color: "#CC0000" }}>— {filtroVaga}</span>}
          {filtroFase && <span style={{ color: "#888", fontSize: 16 }}> ({FASES.find(f=>f.id===filtroFase)?.label})</span>}
        </h2>
        <Btn onClick={() => setModalAdd(true)}>+ Adicionar</Btn>
      </div>

      <input
        placeholder="Buscar candidato..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        style={{
          width: "100%", padding: "10px 14px", background: "#111",
          border: "1px solid #222", borderRadius: 8, color: "#fff",
          fontSize: 14, marginBottom: 16, boxSizing: "border-box", outline: "none"
        }}
      />

      {load ? (
        <div style={{ color: "#666", padding: 20 }}>Carregando...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {candidatos.map(c => (
            <div key={c.row} style={{
              background: "#111", border: "1px solid #222", borderRadius: 10,
              padding: "14px 20px", display: "flex", alignItems: "center",
              gap: 16, cursor: "pointer"
            }} onClick={() => setDetalhe(c)}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#CC000022", border: "1px solid #CC000044",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#CC0000", fontWeight: 700, fontSize: 15, flexShrink: 0
              }}>
                {c.nome.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "#fff", fontSize: 15 }}>{c.nome}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{c.vaga}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge fase={c.fase} />
                <SLABadge sla={c.sla} />
              </div>
            </div>
          ))}
          {candidatos.length === 0 && (
            <div style={{ color: "#555", textAlign: "center", padding: 40 }}>Nenhum candidato encontrado</div>
          )}
        </div>
      )}

      {modalAdd && (
        <ModalAddCandidato
          onClose={() => setModalAdd(false)}
          onSalvo={() => { setModalAdd(false); carregar(); }}
        />
      )}

      {detalhe && (
        <ModalDetalhe
          candidato={detalhe}
          onClose={() => setDetalhe(null)}
          onAtualizado={() => { setDetalhe(null); carregar(); }}
        />
      )}
    </div>
  );
};

// ─── MODAL DETALHE CANDIDATO ──────────────────────────────────
const ModalDetalhe = ({ candidato: init, onClose, onAtualizado }) => {
  const [c, setC]               = useState(init);
  const [aba, setAba]           = useState("info");
  const [editando, setEditando] = useState(false);
  const [form, setForm]         = useState({
    nome: init.nome, vaga: init.vaga,
    inhire: init.inhire || "", email: init.email || ""
  });
  const [vagas, setVagas]       = useState([]);
  const [load, setLoad]         = useState(false);
  const [confirmDel, setConfDel]= useState(false);
  const [modalStatus, setModalStatus] = useState(false);
  const [modalAgendar, setModalAgendar] = useState(false);

  useEffect(() => {
    api.get("getVagas").then(r => r.success && setVagas(r.vagas));
  }, []);

  const salvar = async () => {
    setLoad(true);
    await api.post("updateCandidato", { row: c.row, ...form });
    setLoad(false);
    setEditando(false);
    onAtualizado();
  };

  const deletar = async () => {
    await api.post("deleteCandidato", { row: c.row });
    onAtualizado();
  };

  const atualizarStatus = async (status, data) => {
    await api.post("updateStatus", { row: c.row, status, data });
    setModalStatus(false);
    onAtualizado();
  };

  return (
    <Modal title={c.nome} onClose={onClose} wide>
      {/* Abas */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid #222" }}>
        {["info","historico"].map(a => (
          <button key={a} onClick={() => setAba(a)} style={{
            padding: "8px 20px", background: "none",
            borderBottom: aba === a ? "2px solid #CC0000" : "2px solid transparent",
            border: "none", borderBottomStyle: "solid",
            color: aba === a ? "#fff" : "#666", cursor: "pointer", fontSize: 14, fontWeight: aba === a ? 600 : 400
          }}>
            {a === "info" ? "Informações" : "Histórico"}
          </button>
        ))}
      </div>

      {aba === "info" && (
        <div>
          {/* Status + SLA */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <Badge fase={c.fase} />
            <SLABadge sla={c.sla} />
          </div>

          {editando ? (
            <div>
              <Inp label="Nome" value={form.nome} onChange={e => setForm(p=>({...p,nome:e.target.value}))} />
              <Inp label="Email do candidato" type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="candidato@email.com" />
              <Inp label="Link InHire" value={form.inhire} onChange={e => setForm(p=>({...p,inhire:e.target.value}))} placeholder="https://v4company.inhire.app/..." />
              <Sel
                label="Vaga"
                value={form.vaga}
                onChange={e => setForm(p=>({...p,vaga:e.target.value}))}
                options={[{value:"",label:"Selecione..."}, ...vagas.map(v=>({value:`${v.nome} — ${v.cidade}`,label:`${v.nome} — ${v.cidade}`}))]}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <Btn onClick={salvar} disabled={load}>{load ? "Salvando..." : "Salvar"}</Btn>
                <Btn variant="ghost" onClick={() => setEditando(false)}>Cancelar</Btn>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ background: "#0a0a0a", borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <Row label="Vaga" value={c.vaga} />
                <Row label="Email" value={c.email || "—"} />
                {c.inhire && (
                  <Row label="InHire" value={<a href={c.inhire} target="_blank" rel="noreferrer" style={{ color: "#CC0000" }}>Ver perfil</a>} />
                )}
                <Row label="Abordagem" value={c.dt_abordagem || "—"} />
                {c.dt_ent_inicial && <Row label="Ent. Inicial" value={c.dt_ent_inicial} />}
                {c.dt_ent_tecnica && <Row label="Ent. Técnica" value={c.dt_ent_tecnica} />}
                {c.dt_aprovacao   && <Row label="Aprovação"    value={c.dt_aprovacao} />}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Btn onClick={() => setEditando(true)}>Editar</Btn>
                <Btn variant="ghost" onClick={() => setModalStatus(true)}>Atualizar Status</Btn>
                <Btn variant="ghost" onClick={() => setModalAgendar(true)}>Agendar Entrevista</Btn>
                {!confirmDel ? (
                  <Btn variant="ghost" onClick={() => setConfDel(true)} style={{ color: "#ff6b6b", borderColor: "#ff6b6b44", marginLeft: "auto" }}>Remover</Btn>
                ) : (
                  <Btn variant="danger" onClick={deletar} style={{ marginLeft: "auto" }}>Confirmar remoção</Btn>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {aba === "historico" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Hunting",          data: null,              feito: true },
            { label: "Abordado",         data: c.dt_abordagem,    feito: c.abordagem },
            { label: "Cadastro InHire",  data: c.dt_cadastro,     feito: c.cadastro },
            { label: "Ent. Inicial",     data: c.dt_ent_inicial,  feito: c.ent_inicial },
            { label: "Ent. Técnica",     data: c.dt_ent_tecnica,  feito: c.ent_tecnica },
            { label: "Aprovado",         data: c.dt_aprovacao,    feito: c.aprovacao },
            { label: "Contratado",       data: null,              feito: c.contratado },
            c.rep_cultural && { label: "Reprovado Cultural", data: null, feito: true, rep: true },
            c.rep_tecnica  && { label: "Reprovado Técnico",  data: null, feito: true, rep: true },
            c.rep_salarial && { label: "Reprovado Salarial", data: null, feito: true, rep: true },
            c.desistencia  && { label: "Desistente",         data: null, feito: true, rep: true },
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", background: "#0a0a0a",
              borderRadius: 8, border: `1px solid ${item.feito ? (item.rep ? "#DC262644" : "#333") : "#1a1a1a"}`
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: item.feito ? (item.rep ? "#DC2626" : "#16A34A") : "#222",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, flexShrink: 0
              }}>{item.feito ? "✓" : ""}</div>
              <div style={{ flex: 1, fontSize: 14, color: item.feito ? "#fff" : "#444" }}>{item.label}</div>
              {item.data && <div style={{ fontSize: 12, color: "#666" }}>{item.data}</div>}
            </div>
          ))}
        </div>
      )}

      {modalStatus && (
        <ModalStatus candidato={c} onClose={() => setModalStatus(false)} onAtualizar={atualizarStatus} />
      )}

      {modalAgendar && (
        <ModalAgendar candidato={c} onClose={() => setModalAgendar(false)} onAgendado={() => { setModalAgendar(false); onAtualizado(); }} />
      )}
    </Modal>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1a1a1a" }}>
    <span style={{ fontSize: 13, color: "#666" }}>{label}</span>
    <span style={{ fontSize: 13, color: "#fff" }}>{value}</span>
  </div>
);

// ─── MODAL STATUS ─────────────────────────────────────────────
const ModalStatus = ({ candidato, onClose, onAtualizar }) => {
  const [status, setStatus] = useState("");
  const [data, setData]     = useState("");

  const OPCOES = [
    { value: "abordado",     label: "✉️ Abordado" },
    { value: "cadastro",     label: "📋 Cadastro InHire" },
    { value: "ent_inicial",  label: "🎤 Entrevista Inicial" },
    { value: "ent_tecnica",  label: "🔧 Entrevista Técnica" },
    { value: "aprovado",     label: "✅ Aprovado" },
    { value: "contratado",   label: "🎉 Contratado" },
    { value: "rep_cultural", label: "❌ Reprovado Cultural" },
    { value: "rep_tecnica",  label: "❌ Reprovado Técnico" },
    { value: "rep_salarial", label: "❌ Reprovado Salarial" },
    { value: "desistente",   label: "🚪 Desistente" },
  ];

  return (
    <Modal title={`Status — ${candidato.nome}`} onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Fase atual</div>
        <Badge fase={candidato.fase} />
      </div>
      <Sel label="Novo status" value={status} onChange={e => setStatus(e.target.value)}
        options={[{value:"",label:"Selecione..."}, ...OPCOES]} />
      {["ent_inicial","ent_tecnica"].includes(status) && (
        <Inp label="Data (dd/mm)" value={data} onChange={e => setData(e.target.value)} placeholder="dd/mm" />
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={() => onAtualizar(status, data)} disabled={!status}>Atualizar</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
};

// ─── MODAL AGENDAR ────────────────────────────────────────────
const ModalAgendar = ({ candidato, onClose, onAgendado }) => {
  const [tipo, setTipo]           = useState("Inicial");
  const [data, setData]           = useState("");
  const [hora, setHora]           = useState("");
  const [entrevistadores, setEntrevistadores] = useState([]);
  const [selEntrev, setSelEntrev] = useState([]);
  const [load, setLoad]           = useState(false);
  const [msg, setMsg]             = useState("");

  useEffect(() => {
    const e = JSON.parse(sessionStorage.getItem("v4recruit_entrevistadores") || "[]");
    setEntrevistadores(e);
  }, []);

  const toggleEntrev = (email) => {
    setSelEntrev(p => p.includes(email) ? p.filter(e => e !== email) : [...p, email]);
  };

  const agendar = async () => {
    if (!data || !hora) { setMsg("Preencha data e hora!"); return; }
    setLoad(true);

    const partes = candidato.vaga.split(" — ");
    const cargo  = partes[0] || candidato.vaga;
    const titulo = `Entrevista ${tipo} | ${candidato.nome} | ${cargo} - Pleno | V4 Borges & Co`;

    const convidados = [...selEntrev];
    if (candidato.email) convidados.push(candidato.email);

    const r = await api.post("agendarEntrevista", {
      titulo, data, hora,
      convidados,
      tipo: tipo.toLowerCase()
    });

    setLoad(false);
    if (r.success) {
      setMsg("✅ Entrevista agendada!");
      setTimeout(onAgendado, 1500);
    } else {
      setMsg(`❌ ${r.error || "Erro ao agendar"}`);
    }
  };

  return (
    <Modal title={`Agendar Entrevista — ${candidato.nome}`} onClose={onClose}>
      <Sel label="Tipo" value={tipo} onChange={e => setTipo(e.target.value)}
        options={[{value:"Inicial",label:"Entrevista Inicial"},{value:"Técnica",label:"Entrevista Técnica"}]} />
      <Inp label="Data" type="date" value={data} onChange={e => setData(e.target.value)} />
      <Inp label="Hora" type="time" value={hora} onChange={e => setHora(e.target.value)} />

      {entrevistadores.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 8, fontWeight: 500 }}>
            Participantes
          </label>
          {entrevistadores.map(e => (
            <div key={e.email} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", background: selEntrev.includes(e.email) ? "#CC000011" : "#1a1a1a",
              border: `1px solid ${selEntrev.includes(e.email) ? "#CC000044" : "#333"}`,
              borderRadius: 6, marginBottom: 6, cursor: "pointer"
            }} onClick={() => toggleEntrev(e.email)}>
              <div style={{
                width: 18, height: 18, borderRadius: 3,
                background: selEntrev.includes(e.email) ? "#CC0000" : "#333",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12
              }}>{selEntrev.includes(e.email) ? "✓" : ""}</div>
              <div>
                <div style={{ fontSize: 14, color: "#fff" }}>{e.nome}</div>
                <div style={{ fontSize: 11, color: "#666" }}>{e.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {candidato.email && (
        <div style={{ fontSize: 12, color: "#666", marginBottom: 14 }}>
          📧 Candidato ({candidato.email}) será convidado automaticamente
        </div>
      )}

      {msg && <div style={{ fontSize: 13, marginBottom: 12, color: msg.includes("✅") ? "#16A34A" : "#ff6b6b" }}>{msg}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={agendar} disabled={load}>{load ? "Agendando..." : "Agendar"}</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
};

// ─── MODAL ADD CANDIDATO ──────────────────────────────────────
const ModalAddCandidato = ({ onClose, onSalvo }) => {
  const [form, setForm] = useState({ nome: "", email: "", inhire: "", linkedin: "", vaga: "", dt_abordagem: "" });
  const [vagas, setVagas] = useState([]);
  const [load, setLoad]   = useState(false);

  useEffect(() => { api.get("getVagas").then(r => r.success && setVagas(r.vagas)); }, []);

  const salvar = async () => {
    if (!form.nome || !form.vaga) return;
    setLoad(true);
    await api.post("addCandidato", { ...form, abordagem: true, dt_abordagem: form.dt_abordagem || new Date().toLocaleDateString("pt-BR") });
    setLoad(false);
    onSalvo();
  };

  return (
    <Modal title="Adicionar Candidato" onClose={onClose}>
      <Inp label="Nome *" value={form.nome} onChange={e => setForm(p=>({...p,nome:e.target.value}))} placeholder="Nome completo" />
      <Inp label="Email" type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="candidato@email.com" />
      <Inp label="Link InHire" value={form.inhire} onChange={e => setForm(p=>({...p,inhire:e.target.value}))} placeholder="https://v4company.inhire.app/..." />
      <Sel label="Vaga *" value={form.vaga} onChange={e => setForm(p=>({...p,vaga:e.target.value}))}
        options={[{value:"",label:"Selecione..."}, ...vagas.map(v=>({value:`${v.nome} — ${v.cidade}`,label:`${v.nome} — ${v.cidade}`}))]} />
      <Inp label="Data Abordagem" value={form.dt_abordagem} onChange={e => setForm(p=>({...p,dt_abordagem:e.target.value}))} placeholder="dd/mm" />
      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={salvar} disabled={load}>{load ? "Salvando..." : "Salvar"}</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
};

// ─── ENTREVISTADORES ──────────────────────────────────────────
const Entrevistadores = () => {
  const [lista, setLista] = useState([]);
  const [form, setForm]   = useState({ nome: "", email: "" });
  const [msg, setMsg]     = useState("");

  useEffect(() => {
    setLista(JSON.parse(sessionStorage.getItem("v4recruit_entrevistadores") || "[]"));
  }, []);

  const salvar = () => {
    if (!form.nome || !form.email) return;
    const nova = [...lista, form];
    setLista(nova);
    sessionStorage.setItem("v4recruit_entrevistadores", JSON.stringify(nova));
    setForm({ nome: "", email: "" });
    setMsg("✅ Entrevistador adicionado!");
    setTimeout(() => setMsg(""), 2000);
  };

  const remover = (email) => {
    const nova = lista.filter(e => e.email !== email);
    setLista(nova);
    sessionStorage.setItem("v4recruit_entrevistadores", JSON.stringify(nova));
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ margin: "0 0 24px", fontSize: 22, color: "#fff" }}>Entrevistadores</h2>

      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, color: "#aaa" }}>Adicionar entrevistador</h3>
        <Inp label="Nome" value={form.nome} onChange={e => setForm(p=>({...p,nome:e.target.value}))} placeholder="Nome completo" />
        <Inp label="Email (Gmail)" type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} placeholder="nome@v4company.com" />
        {msg && <div style={{ fontSize: 13, color: "#16A34A", marginBottom: 10 }}>{msg}</div>}
        <Btn onClick={salvar}>Adicionar</Btn>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lista.map(e => (
          <div key={e.email} style={{
            background: "#111", border: "1px solid #222", borderRadius: 10,
            padding: "12px 16px", display: "flex", alignItems: "center", gap: 12
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "#CC000022", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#CC0000", fontWeight: 700, flexShrink: 0
            }}>{e.nome.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>{e.nome}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{e.email}</div>
            </div>
            <button onClick={() => remover(e.email)} style={{
              background: "none", border: "1px solid #333", borderRadius: 6,
              color: "#666", padding: "4px 10px", cursor: "pointer", fontSize: 12
            }}>Remover</button>
          </div>
        ))}
        {lista.length === 0 && (
          <div style={{ color: "#555", textAlign: "center", padding: 30 }}>Nenhum entrevistador cadastrado</div>
        )}
      </div>
    </div>
  );
};

// ─── USUÁRIOS ─────────────────────────────────────────────────
const Usuarios = () => {
  const [form, setForm] = useState({ nome: "", email: "", senha: "", role: "viewer" });
  const [msg, setMsg]   = useState("");
  const [load, setLoad] = useState(false);

  const salvar = async () => {
    if (!form.nome || !form.email || !form.senha) return;
    setLoad(true);
    const r = await api.post("addUsuario", form);
    setLoad(false);
    setMsg(r.success ? "✅ Usuário cadastrado!" : `❌ ${r.error}`);
    if (r.success) setForm({ nome: "", email: "", senha: "", role: "viewer" });
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 style={{ margin: "0 0 24px", fontSize: 22, color: "#fff" }}>Usuários</h2>
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 24 }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 15, color: "#aaa" }}>Cadastrar novo usuário</h3>
        <Inp label="Nome" value={form.nome} onChange={e => setForm(p=>({...p,nome:e.target.value}))} />
        <Inp label="Email" type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} />
        <Inp label="Senha" type="password" value={form.senha} onChange={e => setForm(p=>({...p,senha:e.target.value}))} />
        <Sel label="Permissão" value={form.role} onChange={e => setForm(p=>({...p,role:e.target.value}))}
          options={[{value:"admin",label:"Admin"},{value:"recruiter",label:"Recrutador"},{value:"viewer",label:"Visualizador"}]} />
        {msg && <div style={{ fontSize: 13, marginBottom: 12, color: msg.includes("✅") ? "#16A34A" : "#ff6b6b" }}>{msg}</div>}
        <Btn onClick={salvar} disabled={load}>{load ? "Salvando..." : "Cadastrar"}</Btn>
      </div>
    </div>
  );
};

// ─── APP PRINCIPAL ────────────────────────────────────────────
export default function App() {
  const [user, setUser]             = useState(null);
  const [pagina, setPagina]         = useState("dashboard");
  const [filtroVaga, setFiltroVaga] = useState(null);
  const [filtroFase, setFiltroFase] = useState(null);

  useEffect(() => {
    const u = sessionStorage.getItem("v4recruit_user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.setItem("v4recruit_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem("v4recruit_user");
  };

  const irParaVaga = (vaga, fase = null) => {
    setFiltroVaga(vaga);
    setFiltroFase(fase);
    setPagina("candidatos");
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const NAV = [
    { id: "dashboard",        label: "📊 Dashboard" },
    { id: "candidatos",       label: "👥 Candidatos" },
    { id: "pipeline",         label: "📋 Pipeline" },
    { id: "entrevistadores",  label: "🎤 Entrevistadores" },
    { id: "usuarios",         label: "⚙️ Usuários", adminOnly: true },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: "#0f0f0f", borderRight: "1px solid #1a1a1a",
        display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0
      }}>
        <div style={{ padding: "0 20px 28px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#CC0000", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3 }}>V4 RECRUIT</div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>BORGES & CO</div>
        </div>
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {NAV.filter(n => !n.adminOnly || user.role === "admin").map(n => (
            <button key={n.id} onClick={() => setPagina(n.id)} style={{
              width: "100%", textAlign: "left", padding: "10px 20px",
              background: pagina === n.id ? "#CC000015" : "none",
              borderLeft: `3px solid ${pagina === n.id ? "#CC0000" : "transparent"}`,
              border: "none", color: pagina === n.id ? "#fff" : "#666",
              fontSize: 14, fontWeight: pagina === n.id ? 600 : 400,
              cursor: "pointer", transition: "all 0.15s"
            }}>{n.label}</button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>{user.nome}</div>
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#555", fontSize: 12, cursor: "pointer", padding: 0 }}>Sair</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {pagina === "dashboard"       && <Dashboard onVerVaga={irParaVaga} />}
        {pagina === "candidatos"      && <Candidatos filtroVaga={filtroVaga} filtroFase={filtroFase} />}
        {pagina === "pipeline"        && <Pipeline />}
        {pagina === "entrevistadores" && <Entrevistadores />}
        {pagina === "usuarios"        && user.role === "admin" && <Usuarios />}
      </div>
    </div>
  );
}
