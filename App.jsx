import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────
const API_URL = "https://script.google.com/macros/s/AKfycbxZNKQlqPjN6QgjuGPTa0S2TFjyv__1JgY0SSrZzOhD9rNZsWF1EhUWEfoy3CYlvC5M/exec";

const FASES = [
  { id: "hunting",     label: "Hunting",          cor: "#444" },
  { id: "abordado",    label: "Abordado",          cor: "#7C3AED" },
  { id: "cadastro",    label: "Cadastro",          cor: "#2563EB" },
  { id: "ent_inicial", label: "Entrevista Inicial", cor: "#0891B2" },
  { id: "ent_tecnica", label: "Entrevista Técnica", cor: "#D97706" },
  { id: "aprovado",    label: "Aprovado",           cor: "#16A34A" },
  { id: "contratado",  label: "Contratado",         cor: "#15803D" },
  { id: "rep_cultural",label: "Rep. Cultural",      cor: "#DC2626" },
  { id: "rep_tecnica", label: "Rep. Técnica",       cor: "#DC2626" },
  { id: "rep_salarial",label: "Rep. Salarial",      cor: "#DC2626" },
  { id: "desistente",  label: "Desistente",         cor: "#6B7280" },
];

const FASES_ATIVAS = FASES.filter(f => !["rep_cultural","rep_tecnica","rep_salarial","desistente"].includes(f.id));

// ─── API ──────────────────────────────────────────────────────
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

// ─── COMPONENTES BASE ─────────────────────────────────────────
const Badge = ({ fase }) => {
  const f = FASES.find(f => f.id === fase) || FASES[0];
  return (
    <span style={{
      background: f.cor + "22",
      color: f.cor,
      border: `1px solid ${f.cor}44`,
      padding: "2px 10px",
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 0.5,
      whiteSpace: "nowrap"
    }}>
      {f.label}
    </span>
  );
};

const SLABadge = ({ sla }) => {
  const dias = parseInt(sla) || 0;
  const cor  = dias <= 7 ? "#16A34A" : dias <= 14 ? "#D97706" : "#DC2626";
  return (
    <span style={{
      background: cor + "22",
      color: cor,
      border: `1px solid ${cor}44`,
      padding: "2px 8px",
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 700,
    }}>
      {dias}d
    </span>
  );
};

const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 500 }}>{label}</label>}
    <input style={{
      width: "100%", padding: "10px 12px", background: "#1a1a1a",
      border: "1px solid #333", borderRadius: 6, color: "#fff",
      fontSize: 14, outline: "none", boxSizing: "border-box"
    }} {...props} />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 500 }}>{label}</label>}
    <select style={{
      width: "100%", padding: "10px 12px", background: "#1a1a1a",
      border: "1px solid #333", borderRadius: 6, color: "#fff",
      fontSize: 14, outline: "none", boxSizing: "border-box"
    }} {...props}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Btn = ({ children, variant = "primary", ...props }) => (
  <button style={{
    padding: "10px 20px",
    background: variant === "primary" ? "#CC0000" : variant === "ghost" ? "transparent" : "#1a1a1a",
    color: "#fff",
    border: variant === "ghost" ? "1px solid #333" : "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.15s",
  }} {...props}>
    {children}
  </button>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: 20
  }}>
    <div style={{
      background: "#111", border: "1px solid #222", borderRadius: 12,
      padding: 24, width: "100%", maxWidth: 520, maxHeight: "90vh",
      overflowY: "auto"
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
    else setErro(r.error || "Erro ao fazer login");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#111", border: "1px solid #222", borderRadius: 16,
        padding: 40, width: "100%", maxWidth: 400
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#CC0000", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4 }}>V4</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Recruit</div>
          <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Borges & Co</div>
        </div>

        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
        <Input label="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />

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

  useEffect(() => {
    api.get("getDashboard").then(r => { if (r.success) setDados(r); });
  }, []);

  if (!dados) return <div style={{ color: "#666", padding: 40 }}>Carregando...</div>;

  const { pipeline, porVaga } = dados;
  const total = Object.values(pipeline).reduce((a, b) => a + b, 0);

  return (
    <div>
      <h2 style={{ margin: "0 0 24px", fontSize: 22, color: "#fff" }}>Dashboard</h2>

      {/* Cards de pipeline */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
        {FASES_ATIVAS.map(f => (
          <div key={f.id} style={{
            background: "#111", border: `1px solid ${f.cor}33`,
            borderRadius: 10, padding: "16px 20px", cursor: "pointer"
          }} onClick={() => onVerVaga(null, f.id)}>
            <div style={{ fontSize: 28, fontWeight: 800, color: f.cor }}>{pipeline[f.id] || 0}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{f.label}</div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
              {total > 0 ? Math.round((pipeline[f.id] || 0) / total * 100) : 0}%
            </div>
          </div>
        ))}
      </div>

      {/* Por vaga */}
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
              <div style={{ display: "flex", gap: 8 }}>
                {FASES_ATIVAS.slice(0, 5).map(f => data[f.id] > 0 && (
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

// ─── LISTA DE CANDIDATOS ──────────────────────────────────────
const Candidatos = ({ filtroVaga, filtroFase, onEditCandidato }) => {
  const [candidatos, setCandidatos] = useState([]);
  const [busca, setBusca]           = useState("");
  const [load, setLoad]             = useState(true);
  const [modalAdd, setModalAdd]     = useState(false);
  const [modalStatus, setModalStatus] = useState(null);

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

  const atualizarStatus = async (row, status, data) => {
    await api.post("updateStatus", { row, status, data });
    setModalStatus(null);
    carregar();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, color: "#fff" }}>
          Candidatos {filtroVaga && <span style={{ color: "#CC0000" }}>— {filtroVaga}</span>}
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
            }}>
              {/* Avatar */}
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#CC000022", border: "1px solid #CC000044",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#CC0000", fontWeight: 700, fontSize: 15, flexShrink: 0
              }}>
                {c.nome.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "#fff", fontSize: 15 }}>{c.nome}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{c.vaga}</div>
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge fase={c.fase} />
                <SLABadge sla={c.sla} />
              </div>

              {/* Ações */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setModalStatus(c)} style={{
                  background: "#1a1a1a", border: "1px solid #333", borderRadius: 6,
                  color: "#aaa", padding: "6px 12px", cursor: "pointer", fontSize: 12
                }}>Status</button>
                <button onClick={() => onEditCandidato(c)} style={{
                  background: "#1a1a1a", border: "1px solid #333", borderRadius: 6,
                  color: "#aaa", padding: "6px 12px", cursor: "pointer", fontSize: 12
                }}>Editar</button>
              </div>
            </div>
          ))}
          {candidatos.length === 0 && (
            <div style={{ color: "#555", textAlign: "center", padding: 40 }}>Nenhum candidato encontrado</div>
          )}
        </div>
      )}

      {/* Modal Add */}
      {modalAdd && <ModalAddCandidato onClose={() => setModalAdd(false)} onSalvo={() => { setModalAdd(false); carregar(); }} />}

      {/* Modal Status */}
      {modalStatus && (
        <ModalStatus
          candidato={modalStatus}
          onClose={() => setModalStatus(null)}
          onAtualizar={atualizarStatus}
        />
      )}
    </div>
  );
};

// ─── MODAL ADD CANDIDATO ──────────────────────────────────────
const ModalAddCandidato = ({ onClose, onSalvo }) => {
  const [form, setForm] = useState({ nome: "", linkedin: "", vaga: "", dt_abordagem: "" });
  const [vagas, setVagas] = useState([]);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    api.get("getVagas").then(r => { if (r.success) setVagas(r.vagas); });
  }, []);

  const salvar = async () => {
    if (!form.nome || !form.vaga) return;
    setLoad(true);
    await api.post("addCandidato", { ...form, abordagem: true, dt_abordagem: form.dt_abordagem || new Date().toLocaleDateString("pt-BR") });
    setLoad(false);
    onSalvo();
  };

  return (
    <Modal title="Adicionar Candidato" onClose={onClose}>
      <Input label="Nome *" value={form.nome} onChange={e => setForm(p => ({...p, nome: e.target.value}))} placeholder="Nome completo" />
      <Input label="LinkedIn" value={form.linkedin} onChange={e => setForm(p => ({...p, linkedin: e.target.value}))} placeholder="https://linkedin.com/in/..." />
      <Select
        label="Vaga *"
        value={form.vaga}
        onChange={e => setForm(p => ({...p, vaga: e.target.value}))}
        options={[{value:"",label:"Selecione..."}, ...vagas.map(v => ({value:`${v.nome} — ${v.cidade}`, label:`${v.nome} — ${v.cidade}`}))]}
      />
      <Input label="Data Abordagem" value={form.dt_abordagem} onChange={e => setForm(p => ({...p, dt_abordagem: e.target.value}))} placeholder="dd/mm" />
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Btn onClick={salvar} disabled={load}>{load ? "Salvando..." : "Salvar"}</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
};

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

      <Select
        label="Novo status"
        value={status}
        onChange={e => setStatus(e.target.value)}
        options={[{value:"",label:"Selecione..."}, ...OPCOES]}
      />

      {["ent_inicial","ent_tecnica"].includes(status) && (
        <Input label="Data (dd/mm)" value={data} onChange={e => setData(e.target.value)} placeholder="dd/mm" />
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <Btn onClick={() => onAtualizar(candidato.row, status, data)} disabled={!status}>Atualizar</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
};

// ─── MODAL EDITAR CANDIDATO ───────────────────────────────────
const ModalEditarCandidato = ({ candidato, onClose, onSalvo }) => {
  const [form, setForm] = useState({ nome: candidato.nome, linkedin: candidato.linkedin, vaga: candidato.vaga });
  const [vagas, setVagas] = useState([]);
  const [load, setLoad] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.get("getVagas").then(r => { if (r.success) setVagas(r.vagas); });
  }, []);

  const salvar = async () => {
    setLoad(true);
    await api.post("updateCandidato", { row: candidato.row, ...form });
    setLoad(false);
    onSalvo();
  };

  const deletar = async () => {
    await api.post("deleteCandidato", { row: candidato.row });
    onSalvo();
  };

  return (
    <Modal title="Editar Candidato" onClose={onClose}>
      <Input label="Nome" value={form.nome} onChange={e => setForm(p => ({...p, nome: e.target.value}))} />
      <Input label="LinkedIn" value={form.linkedin} onChange={e => setForm(p => ({...p, linkedin: e.target.value}))} />
      <Select
        label="Vaga"
        value={form.vaga}
        onChange={e => setForm(p => ({...p, vaga: e.target.value}))}
        options={[{value:"",label:"Selecione..."}, ...vagas.map(v => ({value:`${v.nome} — ${v.cidade}`, label:`${v.nome} — ${v.cidade}`}))]}
      />

      {/* Info do candidato */}
      <div style={{ background: "#0a0a0a", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12, color: "#666" }}>
        <div>Fase: <Badge fase={candidato.fase} /></div>
        <div style={{ marginTop: 6 }}>SLA: <SLABadge sla={candidato.sla} /></div>
        {candidato.dt_abordagem && <div style={{ marginTop: 6 }}>Abordagem: {candidato.dt_abordagem}</div>}
        {candidato.dt_ent_inicial && <div style={{ marginTop: 4 }}>Ent. Inicial: {candidato.dt_ent_inicial}</div>}
        {candidato.dt_ent_tecnica && <div style={{ marginTop: 4 }}>Ent. Técnica: {candidato.dt_ent_tecnica}</div>}
        {candidato.linkedin && (
          <div style={{ marginTop: 4 }}>
            <a href={candidato.linkedin} target="_blank" rel="noreferrer" style={{ color: "#CC0000" }}>Ver LinkedIn</a>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={salvar} disabled={load}>{load ? "Salvando..." : "Salvar"}</Btn>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        </div>
        {!confirmDelete ? (
          <Btn variant="ghost" onClick={() => setConfirmDelete(true)} style={{ color: "#ff6b6b", borderColor: "#ff6b6b44" }}>Remover</Btn>
        ) : (
          <Btn onClick={deletar} style={{ background: "#DC2626" }}>Confirmar remoção</Btn>
        )}
      </div>
    </Modal>
  );
};

// ─── PIPELINE KANBAN ──────────────────────────────────────────
const Pipeline = ({ filtroVaga }) => {
  const [candidatos, setCandidatos] = useState([]);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setLoad(true);
      const params = filtroVaga ? { vaga: filtroVaga } : {};
      const r = await api.get("getCandidatos", params);
      if (r.success) setCandidatos(r.candidatos);
      setLoad(false);
    };
    carregar();
  }, [filtroVaga]);

  if (load) return <div style={{ color: "#666", padding: 20 }}>Carregando...</div>;

  return (
    <div>
      <h2 style={{ margin: "0 0 24px", fontSize: 22, color: "#fff" }}>Pipeline</h2>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12 }}>
        {FASES_ATIVAS.map(fase => {
          const cands = candidatos.filter(c => c.fase === fase.id);
          return (
            <div key={fase.id} style={{
              minWidth: 220, background: "#111", border: `1px solid ${fase.cor}22`,
              borderRadius: 10, padding: 14, flexShrink: 0
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: fase.cor, letterSpacing: 0.5 }}>{fase.label.toUpperCase()}</span>
                <span style={{
                  background: fase.cor + "22", color: fase.cor,
                  padding: "2px 8px", borderRadius: 99, fontSize: 12, fontWeight: 700
                }}>{cands.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cands.map(c => (
                  <div key={c.row} style={{
                    background: "#0a0a0a", border: "1px solid #222",
                    borderRadius: 8, padding: "10px 12px"
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 4 }}>{c.nome}</div>
                    <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>{c.vaga}</div>
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
        <h3 style={{ margin: "0 0 20px", fontSize: 16, color: "#aaa" }}>Cadastrar novo usuário</h3>
        <Input label="Nome" value={form.nome} onChange={e => setForm(p=>({...p,nome:e.target.value}))} />
        <Input label="Email" type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} />
        <Input label="Senha" type="password" value={form.senha} onChange={e => setForm(p=>({...p,senha:e.target.value}))} />
        <Select
          label="Permissão"
          value={form.role}
          onChange={e => setForm(p=>({...p,role:e.target.value}))}
          options={[{value:"admin",label:"Admin"},{value:"recruiter",label:"Recrutador"},{value:"viewer",label:"Visualizador"}]}
        />
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
  const [editCandidato, setEditCandidato] = useState(null);

  // Verifica sessão salva
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
    { id: "dashboard",  label: "Dashboard" },
    { id: "candidatos", label: "Candidatos" },
    { id: "pipeline",   label: "Pipeline" },
    { id: "usuarios",   label: "Usuários", adminOnly: true },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar */}
      <div style={{
        width: 220, background: "#0f0f0f", borderRight: "1px solid #1a1a1a",
        display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0
      }}>
        <div style={{ padding: "0 20px 28px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#CC0000", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3 }}>V4 RECRUIT</div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>BORGES & CO</div>
        </div>

        <nav style={{ flex: 1, padding: "16px 0" }}>
          {NAV.filter(n => !n.adminOnly || user.role === "admin").map(n => (
            <button key={n.id} onClick={() => setPagina(n.id)} style={{
              width: "100%", textAlign: "left", padding: "10px 20px",
              background: pagina === n.id ? "#CC000015" : "none",
              borderLeft: pagina === n.id ? "3px solid #CC0000" : "3px solid transparent",
              border: "none", color: pagina === n.id ? "#fff" : "#666",
              fontSize: 14, fontWeight: pagina === n.id ? 600 : 400,
              cursor: "pointer", transition: "all 0.15s"
            }}>
              {n.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>{user.nome}</div>
          <button onClick={handleLogout} style={{
            background: "none", border: "none", color: "#555",
            fontSize: 12, cursor: "pointer", padding: 0
          }}>Sair</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {pagina === "dashboard"  && <Dashboard onVerVaga={irParaVaga} />}
        {pagina === "candidatos" && <Candidatos filtroVaga={filtroVaga} filtroFase={filtroFase} onEditCandidato={setEditCandidato} />}
        {pagina === "pipeline"   && <Pipeline filtroVaga={filtroVaga} />}
        {pagina === "usuarios"   && user.role === "admin" && <Usuarios />}
      </div>

      {/* Modal editar candidato */}
      {editCandidato && (
        <ModalEditarCandidato
          candidato={editCandidato}
          onClose={() => setEditCandidato(null)}
          onSalvo={() => { setEditCandidato(null); setPagina("candidatos"); }}
        />
      )}
    </div>
  );
}
