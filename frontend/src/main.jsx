import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./style.css";

const API = "http://localhost:5000/api";

function App() {
  const [page, setPage] = useState("home");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));

  const logout = () => {
    localStorage.clear();
    setToken("");
    setUser(null);
    setPage("home");
  };

  return (
    <div>
      <nav className="navbar">
        <div className="brand" onClick={() => setPage("home")}>🩸 BloodConnect</div>
        <div className="navlinks">
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("donors")}>Find Donors</button>
          {token && <button onClick={() => setPage("request")}>Blood Request</button>}
          {token && <button onClick={() => setPage("dashboard")}>Dashboard</button>}
          {!token ? <button className="primary" onClick={() => setPage("login")}>Login</button> :
            <button onClick={logout}>Logout</button>}
        </div>
      </nav>

      {page === "home" && <Home onStart={() => setPage(token ? "request" : "login")} />}
      {page === "login" && <Auth setToken={setToken} setUser={setUser} setPage={setPage} />}
      {page === "donors" && <DonorSearch />}
      {page === "request" && token && <RequestForm token={token} setPage={setPage} />}
      {page === "dashboard" && token && <Dashboard token={token} />}
    </div>
  );
}

function Home({ onStart }) {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="tag">SMART BLOOD DONATION NETWORK</p>
          <h1>Find the right donor when every minute matters.</h1>
          <p className="lead">
            Register donors, create blood requests, and use smart matching based
            on blood-group compatibility, location, availability and urgency.
          </p>
          <button className="primary big" onClick={onStart}>Get Started</button>
        </div>
        <div className="heroCard">
          <div className="blood">🩸</div>
          <h3>Smart Matching</h3>
          <p>Compatible + nearby + available donors are ranked first.</p>
        </div>
      </section>

      <section className="features">
        <Feature icon="🔎" title="Smart Search" text="Search available donors by blood group and city." />
        <Feature icon="⚡" title="Urgency Priority" text="Emergency requests receive higher matching priority." />
        <Feature icon="📍" title="Location Score" text="Nearby donors receive better match scores." />
        <Feature icon="🔔" title="Request Tracking" text="Track open, matched and closed blood requests." />
      </section>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return <div className="card feature"><span>{icon}</span><h3>{title}</h3><p>{text}</p></div>;
}

function Auth({ setToken, setUser, setPage }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");

  const submit = async e => {
    e.preventDefault();
    try {
      const url = `${API}/auth/${mode}`;
      const { data } = await axios.post(url, form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setPage("dashboard");
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong");
    }
  };

  return <div className="center">
    <form className="card form" onSubmit={submit}>
      <h2>{mode === "login" ? "Login" : "Create Account"}</h2>
      {mode === "register" && <input placeholder="Full name" required value={form.name} onChange={e => setForm({...form, name:e.target.value})} />}
      <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
      <input type="password" placeholder="Password" required value={form.password} onChange={e => setForm({...form, password:e.target.value})} />
      <button className="primary" type="submit">{mode === "login" ? "Login" : "Register"}</button>
      {msg && <p className="error">{msg}</p>}
      <button type="button" className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? "Create a new account" : "Already have an account? Login"}
      </button>
    </form>
  </div>;
}

function DonorSearch() {
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [city, setCity] = useState("");
  const [donors, setDonors] = useState([]);

  const search = async () => {
    try {
      const { data } = await axios.get(`${API}/donors?bloodGroup=${encodeURIComponent(bloodGroup)}&city=${encodeURIComponent(city)}`);
      setDonors(data);
    } catch {
      alert("Start the backend server first.");
    }
  };

  return <main className="page">
    <h1>Find Compatible Donors</h1>
    <p className="muted">The backend filters compatible blood groups and available donors.</p>
    <div className="card filters">
      <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
        {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(x => <option key={x}>{x}</option>)}
      </select>
      <input placeholder="City (optional)" value={city} onChange={e => setCity(e.target.value)} />
      <button className="primary" onClick={search}>Search Donors</button>
    </div>
    <div className="grid">
      {donors.map(d => <div className="card donor" key={d._id}>
        <div className="bloodBadge">{d.bloodGroup}</div>
        <div><h3>{d.name}</h3><p>{d.city} • {d.distanceKm} km away</p><p>📞 {d.phone}</p></div>
        <span className="available">Available</span>
      </div>)}
    </div>
  </main>;
}

function RequestForm({ token, setPage }) {
  const [form, setForm] = useState({
    patientName:"", bloodGroup:"A+", city:"Kharar", hospital:"", urgency:"Medium", units:1
  });
  const [request, setRequest] = useState(null);
  const [matches, setMatches] = useState([]);

  const submit = async e => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API}/requests`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequest(data);
      const match = await axios.get(`${API}/requests/${data._id}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(match.data);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to create request");
    }
  };

  return <main className="page">
    <h1>Create Blood Request</h1>
    <form className="card form wide" onSubmit={submit}>
      <div className="two">
        <input placeholder="Patient name" required value={form.patientName} onChange={e=>setForm({...form,patientName:e.target.value})}/>
        <input placeholder="Hospital name" required value={form.hospital} onChange={e=>setForm({...form,hospital:e.target.value})}/>
      </div>
      <div className="two">
        <select value={form.bloodGroup} onChange={e=>setForm({...form,bloodGroup:e.target.value})}>
          {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(x=><option key={x}>{x}</option>)}
        </select>
        <input placeholder="City" required value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/>
      </div>
      <div className="two">
        <select value={form.urgency} onChange={e=>setForm({...form,urgency:e.target.value})}>
          {["Low","Medium","High","Emergency"].map(x=><option key={x}>{x}</option>)}
        </select>
        <input type="number" min="1" value={form.units} onChange={e=>setForm({...form,units:Number(e.target.value)})}/>
      </div>
      <button className="primary" type="submit">Create & Find Matches</button>
    </form>

    {request && <section>
      <h2>Smart Match Results</h2>
      <p className="muted">Request: {request.patientName} • {request.bloodGroup} • {request.urgency}</p>
      <div className="grid">
        {matches.map((m,i)=><div className="card donor" key={m.donor._id}>
          <div className="rank">#{i+1}</div>
          <div className="bloodBadge">{m.donor.bloodGroup}</div>
          <div><h3>{m.donor.name}</h3><p>{m.donor.city} • {m.donor.distanceKm} km</p><b>Match Score: {m.score}</b></div>
        </div>)}
      </div>
      {!matches.length && <div className="card">No available compatible donors found.</div>}
    </section>}
  </main>;
}

function Dashboard({ token }) {
  const [requests, setRequests] = useState([]);

  const load = async () => {
    try {
      const { data } = await axios.get(`${API}/requests`, {headers:{Authorization:`Bearer ${token}`}});
      setRequests(data);
    } catch {}
  };

  React.useEffect(() => { load(); }, []);

  return <main className="page">
    <h1>Dashboard</h1>
    <div className="stats">
      <div className="card stat"><b>{requests.length}</b><span>Total Requests</span></div>
      <div className="card stat"><b>{requests.filter(x=>x.status==="Open").length}</b><span>Open</span></div>
      <div className="card stat"><b>{requests.filter(x=>x.urgency==="Emergency").length}</b><span>Emergency</span></div>
    </div>
    <h2>Recent Requests</h2>
    {requests.map(r => <div className="card row" key={r._id}>
      <div><b>{r.patientName}</b><p>{r.bloodGroup} • {r.hospital} • {r.city}</p></div>
      <span className={`status ${r.status.toLowerCase()}`}>{r.status}</span>
    </div>)}
  </main>;
}

createRoot(document.getElementById("root")).render(<App />);
