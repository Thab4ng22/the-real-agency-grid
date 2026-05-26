import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg: "#060912",
  surface: "#0d1424",
  surfaceAlt: "#111a2e",
  border: "#1e2d4a",
  accent: "#00d4ff",
  accentGlow: "rgba(0,212,255,0.15)",
  accentSoft: "rgba(0,212,255,0.08)",
  green: "#00ff9d",
  greenGlow: "rgba(0,255,157,0.12)",
  orange: "#ff7f40",
  purple: "#a78bfa",
  red: "#ff4d6d",
  textPrimary: "#e8f0fe",
  textSecondary: "#7a94c1",
  textMuted: "#3d5278",
};

const fonts = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&display=swap');
`;

const globalStyles = `
${fonts}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Space Grotesk', sans-serif;
  background: ${C.bg};
  color: ${C.textPrimary};
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: ${C.bg}; }
::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }

@keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
@keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }
@keyframes scanline { 0% { top:-10%; } 100% { top:110%; } }
@keyframes glow { 0%,100% { box-shadow: 0 0 20px ${C.accentGlow}; } 50% { box-shadow: 0 0 40px rgba(0,212,255,0.3); } }
@keyframes countUp { from { opacity:0; } to { opacity:1; } }
@keyframes barGrow { from { width:0%; } to { width:var(--w); } }
@keyframes numberTick { from { transform:translateY(10px); opacity:0; } to { transform:translateY(0); opacity:1; } }
@keyframes ripple { to { transform:scale(4); opacity:0; } }
@keyframes slideInRight { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }

.fade-up { animation: fadeUp 0.6s ease forwards; }
.floating { animation: float 4s ease-in-out infinite; }
.glowing { animation: glow 2s ease-in-out infinite; }

button { font-family: 'Space Grotesk', sans-serif; cursor:pointer; border:none; }
a { text-decoration: none; color: inherit; }
`;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const mockMetrics = {
  revenue: { value: "$84,320", change: +12.4, label: "Revenue (30d)" },
  aov: { value: "$127.50", change: +3.2, label: "Avg Order Value" },
  roas: { value: "4.2x", change: -0.8, label: "ROAS" },
  churn: { value: "2.1%", change: -0.3, label: "Churn Rate" },
  ltv: { value: "$540", change: +8.1, label: "LTV" },
  cac: { value: "$38", change: -5.2, label: "CAC" },
};

const revenueData = [42, 55, 48, 70, 63, 78, 84, 72, 91, 88, 95, 84];
const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const aiInsights = [
  { id:1, icon:"🚀", type:"opportunity", title:"Increase TikTok Budget by 30%", body:"Your TikTok ROAS is 5.8x vs. Meta's 3.1x. Reallocating $2k/mo could yield ~$11.6k in additional revenue.", time:"2 min ago", priority:"high" },
  { id:2, icon:"⚠️", type:"alert", title:"Restock Hoodie X — 3 days of inventory left", body:"Hoodie X sold 147 units in 7 days. At current velocity you'll stock out by Thursday. Reorder 300 units.", time:"15 min ago", priority:"urgent" },
  { id:3, icon:"📉", type:"warning", title:"Meta CPM up 22% this week", body:"Your Meta ad CPM rose from $9.40 to $11.50. Consider pausing underperforming ad sets and consolidating budget.", time:"1 hr ago", priority:"medium" },
  { id:4, icon:"💡", type:"insight", title:"Weekend conversion rate 40% higher", body:"Saturday–Sunday converts at 4.8% vs. 3.4% weekdays. Consider scheduling flash sales Friday 8pm.", time:"3 hrs ago", priority:"low" },
];

const topProducts = [
  { name: "Hoodie X – Black", revenue: 18400, units: 147, pct: 88 },
  { name: "Classic Tee Bundle", revenue: 12200, units: 203, pct: 62 },
  { name: "Cargo Shorts", revenue: 9800, units: 89, pct: 50 },
  { name: "Summer Dress", revenue: 7400, units: 61, pct: 38 },
  { name: "Canvas Sneakers", revenue: 5200, units: 44, pct: 27 },
];

const channelData = [
  { name:"Meta Ads", spend:4200, revenue:13020, roas:3.1, color: C.purple },
  { name:"TikTok Ads", spend:1800, revenue:10440, roas:5.8, color: C.accent },
  { name:"Google Ads", spend:3100, revenue:11160, roas:3.6, color: C.green },
  { name:"Email", spend:400, revenue:8400, roas:21.0, color: C.orange },
];

const cohortData = [
  { month:"Jan", m0:100, m1:68, m2:52, m3:44 },
  { month:"Feb", m0:100, m1:71, m2:55, m3:47 },
  { month:"Mar", m0:100, m1:74, m2:59, m3:null },
  { month:"Apr", m0:100, m1:77, m2:null, m3:null },
];

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

function Sparkline({ data, color = C.accent, height = 40 }) {
  const max = Math.max(...data); const min = Math.min(...data);
  const pts = data.map((v,i) => {
    const x = (i/(data.length-1))*100;
    const y = ((max-v)/(max-min))*height;
    return `${x},${y}`;
  }).join(" ");
  const area = `0,${height} ${pts} 100,${height}`;
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{width:"100%",height}}>
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function MetricCard({ label, value, change, sparkData }) {
  const pos = change >= 0;
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 100); }, []);
  return (
    <div style={{
      background: C.surface, border:`1px solid ${C.border}`, borderRadius:16,
      padding:"20px 20px 14px", position:"relative", overflow:"hidden",
      opacity: vis?1:0, transform: vis?"translateY(0)":"translateY(16px)",
      transition:"all 0.5s ease",
    }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg, transparent, ${C.accent}44, transparent)`}}/>
      <p style={{fontSize:11,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{label}</p>
      <p style={{fontSize:28,fontWeight:700,fontFamily:"'Syne',sans-serif",lineHeight:1}}>{value}</p>
      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
        <span style={{
          fontSize:12,fontWeight:600,
          color: pos ? C.green : C.red,
          background: pos ? C.greenGlow : "rgba(255,77,109,0.1)",
          padding:"2px 8px",borderRadius:20,
        }}>{pos?"+":""}{change}%</span>
        <span style={{fontSize:11,color:C.textMuted}}>vs last month</span>
      </div>
      {sparkData && <div style={{marginTop:12}}><Sparkline data={sparkData} color={pos?C.green:C.red}/></div>}
    </div>
  );
}

function AIInsightCard({ insight }) {
  const colors = { urgent:C.red, high:C.orange, medium:C.accent, low:C.purple };
  const c = colors[insight.priority];
  return (
    <div style={{
      background: C.surfaceAlt, border:`1px solid ${C.border}`,
      borderLeft:`3px solid ${c}`, borderRadius:12, padding:"16px",
      transition:"transform 0.2s,box-shadow 0.2s",
      cursor:"default",
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px rgba(0,0,0,0.3)`;}}
    onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}
    >
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:18}}>{insight.icon}</span>
          <span style={{fontSize:13,fontWeight:600,color:C.textPrimary}}>{insight.title}</span>
        </div>
        <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${c}22`,color:c,fontWeight:600,textTransform:"uppercase",whiteSpace:"nowrap",marginLeft:8}}>
          {insight.priority}
        </span>
      </div>
      <p style={{fontSize:12,color:C.textSecondary,lineHeight:1.6}}>{insight.body}</p>
      <p style={{fontSize:11,color:C.textMuted,marginTop:8}}>{insight.time}</p>
    </div>
  );
}

// ─── MINI CHART (Revenue Bar) ─────────────────────────────────────────────────
function RevenueChart({ data, labels }) {
  const max = Math.max(...data);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:120,paddingTop:12}}>
      {data.map((v,i) => {
        const pct = (v/max)*100;
        const isLast = i === data.length-1;
        return (
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{
              width:"100%",height:`${pct}%`,borderRadius:"4px 4px 0 0",
              background: isLast ? `linear-gradient(180deg,${C.accent},${C.accent}88)` : C.border,
              boxShadow: isLast ? `0 0 12px ${C.accentGlow}` : "none",
              transition:"height 0.6s ease",position:"relative",
            }}>
              {isLast && <div style={{position:"absolute",top:-20,left:"50%",transform:"translateX(-50%)",fontSize:10,color:C.accent,whiteSpace:"nowrap",fontFamily:"'JetBrains Mono'"}}>${v}k</div>}
            </div>
            <span style={{fontSize:9,color:C.textMuted}}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── COHORT TABLE ─────────────────────────────────────────────────────────────
function CohortTable() {
  const getColor = (v) => {
    if (!v) return {bg:"transparent",text:C.textMuted};
    if (v>=70) return {bg:"rgba(0,255,157,0.15)",text:C.green};
    if (v>=50) return {bg:"rgba(0,212,255,0.12)",text:C.accent};
    if (v>=40) return {bg:"rgba(167,139,250,0.15)",text:C.purple};
    return {bg:"rgba(255,77,109,0.1)",text:C.red};
  };
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead>
          <tr>
            {["Cohort","Month 0","Month 1","Month 2","Month 3"].map(h=>(
              <th key={h} style={{textAlign:"left",padding:"8px 12px",color:C.textMuted,fontWeight:500,borderBottom:`1px solid ${C.border}`}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohortData.map(row=>(
            <tr key={row.month}>
              <td style={{padding:"8px 12px",color:C.textSecondary,fontWeight:500}}>{row.month} '25</td>
              {[row.m0,row.m1,row.m2,row.m3].map((v,i)=>{
                const {bg,text} = getColor(v);
                return (
                  <td key={i} style={{padding:"6px 12px"}}>
                    {v!==null ? (
                      <span style={{background:bg,color:text,padding:"3px 10px",borderRadius:6,fontFamily:"'JetBrains Mono'",fontSize:11}}>
                        {v}%
                      </span>
                    ) : <span style={{color:C.textMuted}}>—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── AI CHAT ──────────────────────────────────────────────────────────────────
function AskAI() {
  const [messages, setMessages] = useState([
    { role:"assistant", text:"Hey! I've analyzed your last 30 days. Ask me anything about your store performance, ad spend, or what to do next. 🧠" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, {role:"user", text:userMsg}]);
    setLoading(true);

    const context = `You are an AI insights assistant for an e-commerce analytics SaaS dashboard called Agency Grid. The user's store data: Revenue last 30d: $84,320 (+12.4%). AOV: $127.50. ROAS: 4.2x. Churn: 2.1%. LTV: $540. CAC: $38. Top products: Hoodie X ($18,400, 147 units), Classic Tee Bundle ($12,200), Cargo Shorts ($9,800). Ad channels: Meta ROAS 3.1x, TikTok ROAS 5.8x, Google ROAS 3.6x, Email ROAS 21x. You give short, specific, actionable advice like a top e-commerce growth advisor. Be concise, use numbers, and give real recommendations.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:400,
          system: context,
          messages:[
            ...messages.filter(m=>m.role!=="assistant"||messages.indexOf(m)!==0).map(m=>({role:m.role,content:m.text})),
            {role:"user",content:userMsg}
          ]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("") || "Sorry, I couldn't get a response.";
      setMessages(m=>[...m,{role:"assistant",text}]);
    } catch {
      setMessages(m=>[...m,{role:"assistant",text:"Connection error. Please try again."}]);
    }
    setLoading(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,padding:"4px 0 12px"}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{
              maxWidth:"85%",padding:"10px 14px",borderRadius: m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
              background: m.role==="user" ? `linear-gradient(135deg,${C.accent},#0099bb)` : C.surfaceAlt,
              border: m.role==="assistant" ? `1px solid ${C.border}` : "none",
              fontSize:13,lineHeight:1.6,color: m.role==="user"?"#000":C.textPrimary,fontWeight: m.role==="user"?600:400,
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{display:"flex",gap:4,padding:"10px 14px",background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:"16px 16px 16px 4px",width:"fit-content"}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.accent,animation:`pulse 1.2s ease ${i*0.2}s infinite`}}/>
            ))}
          </div>
        )}
        <div ref={endRef}/>
      </div>
      <div style={{display:"flex",gap:8,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Ask about your store metrics..."
          style={{
            flex:1,background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:10,
            padding:"10px 14px",color:C.textPrimary,fontSize:13,outline:"none",
            fontFamily:"'Space Grotesk',sans-serif",
          }}
        />
        <button onClick={send} disabled={loading} style={{
          background:`linear-gradient(135deg,${C.accent},#0099bb)`,color:"#000",
          fontWeight:700,padding:"10px 18px",borderRadius:10,fontSize:13,
          opacity: loading?0.5:1,transition:"opacity 0.2s",
        }}>Send</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [notifCount] = useState(3);

  const navItems = [
    { id:"overview", icon:"⬡", label:"Overview" },
    { id:"insights", icon:"🧠", label:"AI Insights" },
    { id:"marketing", icon:"📣", label:"Marketing" },
    { id:"products", icon:"📦", label:"Products" },
    { id:"cohorts", icon:"👥", label:"Cohorts" },
    { id:"reports", icon:"📊", label:"Reports" },
  ];

  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:C.bg}}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 220 : 64, background:C.surface, borderRight:`1px solid ${C.border}`,
        display:"flex",flexDirection:"column",transition:"width 0.3s ease",overflow:"hidden",flexShrink:0,
      }}>
        {/* Logo */}
        <div style={{padding:"20px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,height:65}}>
          <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.accent},#0055ff)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>⚡</div>
          {sidebarOpen && <span style={{fontSize:15,fontWeight:700,fontFamily:"'Syne',sans-serif",whiteSpace:"nowrap"}}>Agency Grid</span>}
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:"12px 8px",display:"flex",flexDirection:"column",gap:2}}>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>setTab(item.id)} style={{
              display:"flex",alignItems:"center",gap:10,padding:"10px 10px",borderRadius:10,
              background: tab===item.id ? C.accentSoft : "transparent",
              border: tab===item.id ? `1px solid ${C.border}` : "1px solid transparent",
              color: tab===item.id ? C.accent : C.textSecondary,
              fontSize:13,fontWeight: tab===item.id?600:400,width:"100%",
              transition:"all 0.15s",textAlign:"left",cursor:"pointer",
            }}>
              <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
              {sidebarOpen && <span style={{whiteSpace:"nowrap"}}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{padding:"12px 8px",borderTop:`1px solid ${C.border}`}}>
          <button onClick={onLogout} style={{
            display:"flex",alignItems:"center",gap:10,padding:"10px 10px",borderRadius:10,width:"100%",
            background:"transparent",color:C.textMuted,fontSize:12,cursor:"pointer",border:"none",
          }}>
            <span style={{fontSize:16}}>↩</span>
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Header */}
        <header style={{
          height:65,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",
          justifyContent:"space-between",padding:"0 24px",background:C.surface,flexShrink:0,
        }}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <button onClick={()=>setSidebarOpen(s=>!s)} style={{background:"none",color:C.textSecondary,fontSize:20,padding:4}}>☰</button>
            <div>
              <h1 style={{fontSize:16,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>{navItems.find(n=>n.id===tab)?.label}</h1>
              <p style={{fontSize:11,color:C.textMuted}}>Last synced 2 min ago · Acme Store</p>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button style={{
              background:C.accentSoft,border:`1px solid ${C.border}`,borderRadius:10,
              padding:"7px 14px",color:C.accent,fontSize:12,fontWeight:600,
            }}>↻ Sync Now</button>
            <div style={{position:"relative"}}>
              <button style={{background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:10,padding:"7px 10px",color:C.textSecondary,fontSize:16}}>🔔</button>
              {notifCount > 0 && <span style={{position:"absolute",top:-4,right:-4,background:C.red,color:"#fff",fontSize:9,width:16,height:16,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{notifCount}</span>}
            </div>
            <button onClick={()=>setAiOpen(s=>!s)} style={{
              background:`linear-gradient(135deg,${C.accent},#0055ff)`,color:"#000",
              borderRadius:10,padding:"7px 16px",fontSize:12,fontWeight:700,
              boxShadow:`0 0 20px ${C.accentGlow}`,
            }}>🧠 Ask AI</button>
          </div>
        </header>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:24,display:"flex",gap:24}}>
          <div style={{flex:1,minWidth:0}}>
            {tab === "overview" && <OverviewTab />}
            {tab === "insights" && <InsightsTab />}
            {tab === "marketing" && <MarketingTab />}
            {tab === "products" && <ProductsTab />}
            {tab === "cohorts" && <CohortsTab />}
            {tab === "reports" && <ReportsTab />}
          </div>

          {/* AI Panel */}
          {aiOpen && (
            <div style={{
              width:360,flexShrink:0,background:C.surface,border:`1px solid ${C.border}`,
              borderRadius:16,padding:20,display:"flex",flexDirection:"column",
              animation:"slideInRight 0.3s ease",
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div>
                  <h3 style={{fontSize:14,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>🧠 AI Assistant</h3>
                  <p style={{fontSize:11,color:C.textMuted}}>Powered by Claude</p>
                </div>
                <button onClick={()=>setAiOpen(false)} style={{background:"none",color:C.textMuted,fontSize:18,padding:4}}>✕</button>
              </div>
              <div style={{flex:1,minHeight:0,overflow:"hidden",display:"flex",flexDirection:"column",height:"calc(100vh - 200px)"}}>
                <AskAI />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD TABS ───────────────────────────────────────────────────────────

function SectionTitle({ children, sub }) {
  return (
    <div style={{marginBottom:20}}>
      <h2 style={{fontSize:18,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>{children}</h2>
      {sub && <p style={{fontSize:12,color:C.textMuted,marginTop:2}}>{sub}</p>}
    </div>
  );
}

function Card({ children, style={} }) {
  return (
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:20,...style}}>
      {children}
    </div>
  );
}

function OverviewTab() {
  return (
    <div>
      <SectionTitle sub="Your store at a glance — last 30 days">Performance Overview</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16,marginBottom:24}}>
        {Object.entries(mockMetrics).map(([k,m])=>(
          <MetricCard key={k} label={m.label} value={m.value} change={m.change}
            sparkData={revenueData.map(v=>v+Math.random()*10-5)} />
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <Card>
          <h3 style={{fontSize:14,fontWeight:600,marginBottom:4}}>Monthly Revenue</h3>
          <p style={{fontSize:11,color:C.textMuted,marginBottom:12}}>2025 — trailing 12 months</p>
          <RevenueChart data={revenueData} labels={monthLabels}/>
        </Card>
        <Card>
          <h3 style={{fontSize:14,fontWeight:600,marginBottom:16}}>Today's AI Insights</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {aiInsights.slice(0,2).map(ins=>(
              <AIInsightCard key={ins.id} insight={ins}/>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function InsightsTab() {
  return (
    <div>
      <SectionTitle sub="AI-generated action items refreshed daily">Daily AI Insights</SectionTitle>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {aiInsights.map(ins=><AIInsightCard key={ins.id} insight={ins}/>)}
      </div>
    </div>
  );
}

function MarketingTab() {
  return (
    <div>
      <SectionTitle sub="Ad channel performance & spend efficiency">Marketing Intelligence</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {channelData.map(ch=>(
          <Card key={ch.name}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <h3 style={{fontSize:14,fontWeight:600}}>{ch.name}</h3>
                <p style={{fontSize:11,color:C.textMuted}}>Spend: ${ch.spend.toLocaleString()}</p>
              </div>
              <span style={{fontSize:22,fontWeight:700,fontFamily:"'JetBrains Mono'",color:ch.color}}>{ch.roas}x</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:12,color:C.textMuted}}>Revenue</span>
              <span style={{fontSize:12,fontWeight:600,color:C.textPrimary}}>${ch.revenue.toLocaleString()}</span>
            </div>
            <div style={{height:6,background:C.surfaceAlt,borderRadius:3}}>
              <div style={{height:"100%",width:`${Math.min((ch.roas/25)*100,100)}%`,background:ch.color,borderRadius:3,boxShadow:`0 0 8px ${ch.color}66`}}/>
            </div>
            <p style={{fontSize:11,color:C.textMuted,marginTop:6}}>ROAS efficiency vs 25x max</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProductsTab() {
  return (
    <div>
      <SectionTitle sub="Top performers by revenue this month">Product Analytics</SectionTitle>
      <Card>
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          {topProducts.map((p,i)=>(
            <div key={p.name} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 0",borderBottom: i<topProducts.length-1?`1px solid ${C.border}`:"none"}}>
              <span style={{fontSize:12,color:C.textMuted,width:20,textAlign:"center",fontFamily:"'JetBrains Mono'"}}>{i+1}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:13,fontWeight:500}}>{p.name}</span>
                  <span style={{fontSize:13,fontWeight:700,fontFamily:"'JetBrains Mono'",color:C.accent}}>${p.revenue.toLocaleString()}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{flex:1,height:4,background:C.surfaceAlt,borderRadius:2}}>
                    <div style={{height:"100%",width:`${p.pct}%`,background:`linear-gradient(90deg,${C.accent},${C.green})`,borderRadius:2}}/>
                  </div>
                  <span style={{fontSize:11,color:C.textMuted,whiteSpace:"nowrap"}}>{p.units} units</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CohortsTab() {
  return (
    <div>
      <SectionTitle sub="Customer retention by monthly cohort">Cohort & Retention Analysis</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {[{label:"Avg M1 Retention",value:"72.5%",color:C.green},{label:"Avg M3 Retention",value:"45.5%",color:C.accent},{label:"Industry Avg M1",value:"60%",color:C.textMuted},{label:"You vs Industry",value:"+12.5%",color:C.orange}].map(s=>(
          <Card key={s.label} style={{textAlign:"center"}}>
            <p style={{fontSize:11,color:C.textMuted,marginBottom:8}}>{s.label}</p>
            <p style={{fontSize:28,fontWeight:700,fontFamily:"'Syne',sans-serif",color:s.color}}>{s.value}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h3 style={{fontSize:14,fontWeight:600,marginBottom:16}}>Retention Matrix</h3>
        <CohortTable/>
      </Card>
    </div>
  );
}

function ReportsTab() {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);

  const generateReport = async () => {
    setGenerating(true);
    setReport(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:800,
          messages:[{role:"user",content:`Generate a professional monthly e-commerce performance report summary for a DTC brand with these metrics: Revenue $84,320 (+12.4%), AOV $127.50, ROAS 4.2x, Churn 2.1%, LTV $540, CAC $38, Top product Hoodie X $18,400. TikTok ROAS 5.8x, Meta 3.1x, Email 21x. Include: Executive Summary, 3 Key Wins, 3 Areas to Improve, Top 3 Action Items for next month. Format clearly with emoji section headers.`}]
        })
      });
      const data = await res.json();
      setReport(data.content?.map(b=>b.text||"").join(""));
    } catch {
      setReport("Error generating report. Please try again.");
    }
    setGenerating(false);
  };

  return (
    <div>
      <SectionTitle sub="AI-generated reports & exports">Reports</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
        {["PDF Report","CSV Export","Notion Sync","Google Sheets"].map(r=>(
          <Card key={r} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:13,fontWeight:500}}>{r}</span>
            <button style={{background:C.surfaceAlt,border:`1px solid ${C.border}`,color:C.textSecondary,borderRadius:8,padding:"6px 14px",fontSize:12}}>Export</button>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <h3 style={{fontSize:14,fontWeight:600}}>AI Monthly Report</h3>
            <p style={{fontSize:11,color:C.textMuted}}>Generate a complete report using AI</p>
          </div>
          <button onClick={generateReport} disabled={generating} style={{
            background:`linear-gradient(135deg,${C.accent},#0055ff)`,color:"#000",
            borderRadius:10,padding:"8px 18px",fontSize:13,fontWeight:700,
            opacity:generating?0.6:1,cursor:generating?"not-allowed":"pointer",
          }}>
            {generating ? "Generating..." : "🧠 Generate Report"}
          </button>
        </div>
        {generating && (
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"20px 0"}}>
            <div style={{width:20,height:20,border:`2px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
            <span style={{fontSize:13,color:C.textSecondary}}>Claude is analyzing your data...</span>
          </div>
        )}
        {report && (
          <div style={{
            background:C.surfaceAlt,borderRadius:12,padding:20,
            fontSize:13,lineHeight:1.8,color:C.textSecondary,whiteSpace:"pre-wrap",
            fontFamily:"'Space Grotesk',sans-serif",
          }}>
            {report}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

function LandingPage({ onEnterDashboard }) {
  const [scrolled, setScrolled] = useState(false);
  const [activePlan, setActivePlan] = useState("growth");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const plans = [
    { id:"starter", name:"Starter", price:49, color:C.textSecondary, features:["1 brand (Shopify + Stripe)","Daily KPI dashboard","Daily email summary","1 GPT insight/day","7-day history","CSV export","Light/Dark mode"] },
    { id:"growth", name:"Growth", price:149, color:C.accent, popular:true, features:["3 brand integrations","Slack + Email summaries","3 AI insights/day","Smart KPIs + Forecasting","30-day history","Cohort analysis","Profitability tools","Team access (5 members)","PDF/CSV/Notion exports","Chat support"] },
    { id:"scale", name:"Scale", price:399, color:C.green, features:["Unlimited brands","WhatsApp + Email + Slack","10+ AI insights/day","Full KPI toolkit","90-day history","Custom branding","Advanced cohort & retention","Alerts & automation","API access","Priority support","Dedicated success manager"] },
    { id:"enterprise", name:"Enterprise", price:null, color:C.purple, features:["Unlimited everything","Private deployment","Custom features","White-labeling","AI model fine-tuning","Strategic support","24/7 SLA support"] },
  ];

  const features = [
    { icon:"⚡", title:"Real-time Data Sync", body:"Connects to Shopify, Stripe, Google Analytics, and Ads. Your data refreshed continuously — no manual exports." },
    { icon:"🧠", title:"AI-Written Insights", body:"Claude analyzes your metrics daily and writes specific, actionable recommendations — not just charts." },
    { icon:"📣", title:"Multi-channel Delivery", body:"Get insights where you work: Slack, Email, or WhatsApp. Never miss a critical alert." },
    { icon:"📈", title:"Smart Forecasting", body:"Predict revenue, inventory needs, and churn risk before they become problems." },
    { icon:"🎯", title:"Cohort Analysis", body:"Understand which customers come back and why. Identify your highest-LTV segments." },
    { icon:"🔐", title:"Team Access & Roles", body:"Invite your team with role-based access. Everyone sees what they need, nothing more." },
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      {/* Nav */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:100,
        padding:"0 40px",height:65,display:"flex",alignItems:"center",justifyContent:"space-between",
        background: scrolled ? `${C.surface}ee` : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition:"all 0.3s ease",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.accent},#0055ff)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>⚡</div>
          <span style={{fontSize:18,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>Agency Grid</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:24}}>
          {["Features","Pricing","About"].map(l=>(
            <a key={l} href={`#${l.toLowerCase()}`} style={{fontSize:14,color:C.textSecondary,fontWeight:500,transition:"color 0.2s"}}
              onMouseEnter={e=>e.target.style.color=C.textPrimary}
              onMouseLeave={e=>e.target.style.color=C.textSecondary}>{l}</a>
          ))}
          <button onClick={onEnterDashboard} style={{
            background:`linear-gradient(135deg,${C.accent},#0055ff)`,color:"#000",
            borderRadius:10,padding:"8px 20px",fontSize:13,fontWeight:700,
            boxShadow:`0 0 20px ${C.accentGlow}`,
            transition:"transform 0.2s,box-shadow 0.2s",
          }}
          onMouseEnter={e=>{e.target.style.transform="scale(1.05)";}}
          onMouseLeave={e=>{e.target.style.transform="scale(1)";}}
          >Open Dashboard →</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"120px 40px 80px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        {/* BG mesh */}
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 70%)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"30%",left:"10%",width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,rgba(0,85,255,0.06),transparent)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"20%",right:"10%",width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,rgba(0,255,157,0.05),transparent)`,pointerEvents:"none"}}/>

        <div style={{animation:"fadeUp 0.7s ease forwards",maxWidth:760}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.accentSoft,border:`1px solid ${C.border}`,borderRadius:50,padding:"6px 16px",marginBottom:28,fontSize:12,color:C.accent,fontWeight:600}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:C.accent,display:"inline-block",animation:"pulse 2s ease infinite"}}/>
            Now powering 200+ DTC brands
          </div>

          <h1 style={{fontSize:"clamp(40px,6vw,72px)",fontWeight:800,fontFamily:"'Syne',sans-serif",lineHeight:1.1,marginBottom:24}}>
            Turn Your Store Data Into<br/>
            <span style={{background:`linear-gradient(135deg,${C.accent},${C.green})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Daily Actions</span>
          </h1>

          <p style={{fontSize:18,color:C.textSecondary,lineHeight:1.7,maxWidth:560,margin:"0 auto 40px"}}>
            Agency Grid connects to your Shopify, Stripe & Ads accounts and delivers specific, AI-written recommendations every morning. Stop staring at dashboards — start acting.
          </p>

          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={onEnterDashboard} style={{
              background:`linear-gradient(135deg,${C.accent},#0055ff)`,color:"#000",
              borderRadius:12,padding:"14px 32px",fontSize:15,fontWeight:700,
              boxShadow:`0 0 40px ${C.accentGlow}`,transition:"all 0.2s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow=`0 0 60px rgba(0,212,255,0.3)`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 0 40px ${C.accentGlow}`;}}
            >Open Live Dashboard →</button>
            <button style={{
              background:"transparent",border:`1px solid ${C.border}`,color:C.textSecondary,
              borderRadius:12,padding:"14px 32px",fontSize:15,fontWeight:500,
              transition:"all 0.2s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.textPrimary;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textSecondary;}}
            >Watch Demo</button>
          </div>
        </div>

        {/* Dashboard preview */}
        <div style={{marginTop:70,width:"100%",maxWidth:900,animation:"fadeUp 0.9s 0.3s ease both",position:"relative"}}>
          <div style={{
            background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,overflow:"hidden",
            boxShadow:`0 40px 120px rgba(0,0,0,0.6),0 0 0 1px ${C.border}`,
          }}>
            {/* Fake dashboard preview */}
            <div style={{height:10,background:C.surfaceAlt,display:"flex",alignItems:"center",gap:6,padding:"0 12px"}}>
              {["#ff5f57","#febc2e","#28c840"].map(c=><div key={c} style={{width:8,height:8,borderRadius:"50%",background:c}}/>)}
            </div>
            <div style={{padding:20,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,background:C.bg}}>
              {[{l:"Revenue",v:"$84,320",c:"+12.4%",col:C.green},{l:"ROAS",v:"4.2x",c:"-0.8%",col:C.red},{l:"LTV",v:"$540",c:"+8.1%",col:C.green}].map(m=>(
                <div key={m.l} style={{background:C.surface,borderRadius:12,padding:"14px",border:`1px solid ${C.border}`}}>
                  <p style={{fontSize:10,color:C.textMuted,marginBottom:4}}>{m.l}</p>
                  <p style={{fontSize:20,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>{m.v}</p>
                  <span style={{fontSize:11,color:m.col}}>{m.c}</span>
                </div>
              ))}
            </div>
            <div style={{padding:"0 20px 20px",background:C.bg,display:"grid",gridTemplateColumns:"2fr 1fr",gap:12}}>
              <div style={{background:C.surface,borderRadius:12,padding:16,border:`1px solid ${C.border}`}}>
                <p style={{fontSize:11,color:C.textMuted,marginBottom:12}}>Monthly Revenue</p>
                <RevenueChart data={revenueData} labels={monthLabels}/>
              </div>
              <div style={{background:C.surface,borderRadius:12,padding:16,border:`1px solid ${C.border}`}}>
                <p style={{fontSize:11,color:C.textMuted,marginBottom:10}}>AI Insights</p>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {["🚀 Boost TikTok by 30%","⚠️ Restock Hoodie X"].map(t=>(
                    <div key={t} style={{background:C.surfaceAlt,borderRadius:8,padding:"8px 10px",fontSize:11,color:C.textSecondary,borderLeft:`2px solid ${C.accent}`}}>{t}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{position:"absolute",inset:-1,borderRadius:20,background:"linear-gradient(180deg,transparent 60%,rgba(6,9,18,0.8))",pointerEvents:"none"}}/>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{padding:"100px 40px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:60}}>
          <h2 style={{fontSize:40,fontWeight:800,fontFamily:"'Syne',sans-serif",marginBottom:12}}>Everything your team needs</h2>
          <p style={{color:C.textSecondary,fontSize:16}}>From raw data to daily action items — fully automated.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}}>
          {features.map(f=>(
            <div key={f.title} style={{
              background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:24,
              transition:"all 0.2s",cursor:"default",
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 16px 40px rgba(0,0,0,0.3)`;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}
            >
              <div style={{fontSize:28,marginBottom:14}}>{f.icon}</div>
              <h3 style={{fontSize:16,fontWeight:700,marginBottom:8}}>{f.title}</h3>
              <p style={{fontSize:13,color:C.textSecondary,lineHeight:1.6}}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{padding:"100px 40px",background:C.surface,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:60}}>
            <h2 style={{fontSize:40,fontWeight:800,fontFamily:"'Syne',sans-serif",marginBottom:12}}>Simple, predictable pricing</h2>
            <p style={{color:C.textSecondary,fontSize:16}}>Start free for 14 days. No credit card required.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
            {plans.map(plan=>(
              <div key={plan.id} onClick={()=>setActivePlan(plan.id)} style={{
                background:C.bg,border:`2px solid ${activePlan===plan.id?plan.color:C.border}`,
                borderRadius:18,padding:24,cursor:"pointer",position:"relative",
                boxShadow: activePlan===plan.id ? `0 0 30px ${plan.color}22` : "none",
                transition:"all 0.25s",
                transform: activePlan===plan.id?"translateY(-4px)":"",
              }}>
                {plan.popular && (
                  <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:plan.color,color:"#000",fontSize:10,fontWeight:700,padding:"3px 14px",borderRadius:50,whiteSpace:"nowrap"}}>MOST POPULAR</div>
                )}
                <p style={{fontSize:13,fontWeight:600,color:plan.color,marginBottom:8}}>{plan.name}</p>
                <div style={{marginBottom:20}}>
                  {plan.price ? (
                    <><span style={{fontSize:36,fontWeight:800,fontFamily:"'Syne',sans-serif"}}>${plan.price}</span><span style={{fontSize:12,color:C.textMuted}}>/mo</span></>
                  ) : (
                    <span style={{fontSize:24,fontWeight:700,fontFamily:"'Syne',sans-serif",color:plan.color}}>Custom</span>
                  )}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                  {plan.features.map(f=>(
                    <div key={f} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:12,color:C.textSecondary}}>
                      <span style={{color:plan.color,flexShrink:0,marginTop:1}}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button onClick={onEnterDashboard} style={{
                  width:"100%",padding:"11px",borderRadius:10,fontSize:13,fontWeight:700,
                  background: activePlan===plan.id?plan.color:"transparent",
                  color: activePlan===plan.id?"#000":plan.color,
                  border:`1px solid ${plan.color}`,transition:"all 0.2s",
                }}>
                  {plan.price ? "Start Free Trial" : "Contact Sales"}
                </button>
              </div>
            ))}
          </div>

          {/* Add-ons */}
          <div style={{marginTop:40,background:C.surfaceAlt,border:`1px solid ${C.border}`,borderRadius:16,padding:24}}>
            <h3 style={{fontSize:16,fontWeight:600,marginBottom:16}}>Optional Add-Ons</h3>
            <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
              {[["AI Forecasting Module","$49/mo"],["Agency Client Portal","$99/mo"],["Extra Team Seats","$9/user/mo"],["Extra GPT Insights","Custom credits"]].map(([name,price])=>(
                <div key={name} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 16px",display:"flex",gap:12,alignItems:"center"}}>
                  <span style={{fontSize:13,color:C.textPrimary}}>{name}</span>
                  <span style={{fontSize:12,color:C.accent,fontFamily:"'JetBrains Mono'",fontWeight:600}}>{price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"100px 40px",textAlign:"center"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <h2 style={{fontSize:42,fontWeight:800,fontFamily:"'Syne',sans-serif",marginBottom:16}}>
            Ready to see your<br/><span style={{color:C.accent}}>store's full potential?</span>
          </h2>
          <p style={{color:C.textSecondary,fontSize:16,marginBottom:36}}>Join 200+ DTC brands getting daily AI insights. Setup takes under 5 minutes.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={{
              flex:1,maxWidth:280,padding:"12px 16px",background:C.surface,border:`1px solid ${C.border}`,
              borderRadius:10,color:C.textPrimary,fontSize:14,outline:"none",fontFamily:"'Space Grotesk',sans-serif",
            }}/>
            <button onClick={onEnterDashboard} style={{
              background:`linear-gradient(135deg,${C.accent},#0055ff)`,color:"#000",
              borderRadius:10,padding:"12px 24px",fontSize:14,fontWeight:700,
              boxShadow:`0 0 30px ${C.accentGlow}`,
            }}>Start Free →</button>
          </div>
          <p style={{fontSize:11,color:C.textMuted,marginTop:12}}>14-day free trial · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop:`1px solid ${C.border}`,padding:"30px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:24,height:24,borderRadius:6,background:`linear-gradient(135deg,${C.accent},#0055ff)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>⚡</div>
          <span style={{fontSize:14,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>Agency Grid</span>
        </div>
        <p style={{fontSize:12,color:C.textMuted}}>© 2025 Agency Grid. Built for DTC e-commerce brands.</p>
        <div style={{display:"flex",gap:20}}>
          {["Privacy","Terms","Contact"].map(l=><a key={l} href="#" style={{fontSize:12,color:C.textMuted}}>{l}</a>)}
        </div>
      </footer>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing"); // "landing" | "dashboard"

  return (
    <>
      <style>{globalStyles}</style>
      {page === "landing"
        ? <LandingPage onEnterDashboard={() => setPage("dashboard")} />
        : <Dashboard onLogout={() => setPage("landing")} />
      }
    </>
  );
}
