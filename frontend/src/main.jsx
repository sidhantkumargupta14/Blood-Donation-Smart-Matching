import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./style.css";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const authHeaders = token => ({ Authorization: `Bearer ${token}` });
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const emptyRequest = { patientName: "", bloodGroup: "A+", city: "", hospital: "", urgency: "Medium", units: 1 };

function App() {
  const [page, setPage] = useState("home");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); setToken(""); setUser(null); setPage("home"); };
  return <div>
    <nav className="navbar"><div className="brand" onClick={() => setPage("home")}>🩸 BloodConnect</div><div className="navlinks">
      <button onClick={() => setPage("home")}>Home</button><button onClick={() => setPage("donors")}>Find Donors</button>
      {token && <><button onClick={() => setPage("request")}>Blood Request</button><button onClick={() => setPage("dashboard")}>Dashboard</button></>}
      {!token ? <button className="primary" onClick={() => setPage("login")}>Login</button> : <button onClick={logout}>Logout</button>}
    </div></nav>
    {page === "home" && <Home onStart={() => setPage(token ? "request" : "login")} />}
    {page === "login" && <Auth setToken={setToken} setUser={setUser} setPage={setPage} />}
    {page === "donors" && <DonorSearch />}
    {page === "request" && token && <RequestForm token={token} setPage={setPage} />}
    {page === "dashboard" && token && <Dashboard token={token} setPage={setPage} />}
  </div>;
}
function Home({ onStart }) {
  return <main><section className="hero"><div><p className="tag">SMART BLOOD DONATION NETWORK</p><h1>Find the right donor when every minute matters.</h1><p className="lead">Register donors, create blood requests, and match by blood-group compatibility, location, availability and urgency.</p><button className="primary big" onClick={onStart}>Get Started</button></div><div className="heroCard"><div className="blood">🩸</div><h3>Smart Matching</h3><p>Compatible, nearby and available donors are ranked first.</p></div></section>
  <section className="features"><Feature icon="🔎" title="Smart Search" text="Search available donors by blood group and city."/><Feature icon="⚡" title="Urgency Priority" text="Emergency requests receive higher priority."/><Feature icon="📍" title="Location Score" text="Nearby donors receive better match scores."/><Feature icon="📝" title="Request Management" text="Create, view, edit and delete your blood requests."/></section></main>;
}
function Feature({icon,title,text}) { return <div className="card feature"><span>{icon}</span><h3>{title}</h3><p>{text}</p></div>; }
function Auth({setToken,setUser,setPage}) {
  const [mode,setMode]=useState("login"), [form,setForm]=useState({name:"",email:"",password:""}), [msg,setMsg]=useState("");
  const submit=async e=>{e.preventDefault();setMsg("");try{const {data}=await axios.post(`${API}/auth/${mode}`,form);localStorage.setItem("token",data.token);localStorage.setItem("user",JSON.stringify(data.user));setToken(data.token);setUser(data.user);setPage("dashboard");}catch(err){setMsg(err.response?.data?.message || "Unable to connect to the server. Please try again.");}};
  return <div className="center"><form className="card form" onSubmit={submit}><h2>{mode==="login"?"Login":"Create Account"}</h2>
    {mode==="register"&&<input placeholder="Full name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>}
    <input type="email" placeholder="Email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
    <input type="password" placeholder="Password (minimum 8 characters)" minLength="8" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
    <button className="primary" type="submit">{mode==="login"?"Login":"Register"}</button>{msg&&<p className="error">{msg}</p>}
    <button type="button" className="link" onClick={()=>setMode(mode==="login"?"register":"login")}>{mode==="login"?"Create a new account":"Already have an account? Login"}</button></form></div>;
}
function DonorSearch() {
  const [bloodGroup,setBloodGroup]=useState("A+"),[city,setCity]=useState(""),[donors,setDonors]=useState([]),[msg,setMsg]=useState("");
  const search=async()=>{setMsg("");try{const {data}=await axios.get(`${API}/donors`,{params:{bloodGroup,city}});setDonors(data);}catch{setMsg("Unable to load donors. Please try again later.");}};
  return <main className="page"><h1>Find Compatible Donors</h1><p className="muted">Search available donors by compatible blood group and city.</p><div className="card filters">
    <select value={bloodGroup} onChange={e=>setBloodGroup(e.target.value)}>{bloodGroups.map(x=><option key={x}>{x}</option>)}</select>
    <input placeholder="City (optional)" value={city} onChange={e=>setCity(e.target.value)}/><button className="primary" onClick={search}>Search Donors</button></div>
    {msg&&<p className="error">{msg}</p>}<div className="grid">{donors.map(d=><div className="card donor" key={d._id}><div className="bloodBadge">{d.bloodGroup}</div><div><h3>{d.name}</h3><p>{d.city} • {d.distanceKm} km away</p><p>📞 {d.phone}</p></div><span className="available">Available</span></div>)}</div></main>;
}
function RequestForm({token,setPage}) {
  const [form,setForm]=useState(emptyRequest),[request,setRequest]=useState(null),[matches,setMatches]=useState([]),[msg,setMsg]=useState("");
  const submit=async e=>{e.preventDefault();setMsg("");try{const {data}=await axios.post(`${API}/requests`,form,{headers:authHeaders(token)});setRequest(data);const match=await axios.get(`${API}/requests/${data._id}/matches`,{headers:authHeaders(token)});setMatches(match.data);}catch(err){setMsg(err.response?.data?.message||"Unable to create request.");}};
  return <main className="page"><div className="pageHeading"><div><h1>Create Blood Request</h1><p className="muted">Enter patient and hospital details to find compatible donors.</p></div><button onClick={()=>setPage("dashboard")}>My Requests</button></div>
    <form className="card form wide" onSubmit={submit}>
      <div className="two"><input placeholder="Patient name" required value={form.patientName} onChange={e=>setForm({...form,patientName:e.target.value})}/><input placeholder="Hospital name" required value={form.hospital} onChange={e=>setForm({...form,hospital:e.target.value})}/></div>
      <div className="two"><select value={form.bloodGroup} onChange={e=>setForm({...form,bloodGroup:e.target.value})}>{bloodGroups.map(x=><option key={x}>{x}</option>)}</select><input placeholder="City" required value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></div>
      <div className="two"><select value={form.urgency} onChange={e=>setForm({...form,urgency:e.target.value})}>{["Low","Medium","High","Emergency"].map(x=><option key={x}>{x}</option>)}</select><input type="number" min="1" max="100" required value={form.units} onChange={e=>setForm({...form,units:Number(e.target.value)})}/></div>
      <button className="primary" type="submit">Create & Find Matches</button></form>{msg&&<p className="error">{msg}</p>}
    {request&&<section><h2>Smart Match Results</h2><p className="muted">Request: {request.patientName} • {request.bloodGroup} • {request.urgency}</p><div className="grid">{matches.map((m,i)=><div className="card donor" key={m.donor._id}><div className="rank">#{i+1}</div><div className="bloodBadge">{m.donor.bloodGroup}</div><div><h3>{m.donor.name}</h3><p>{m.donor.city} • {m.donor.distanceKm} km</p><b>Match Score: {m.score}</b></div></div>)}</div>{!matches.length&&<div className="card">No available compatible donors found.</div>}<button className="primary" onClick={()=>setPage("dashboard")}>Manage My Requests</button></section>}</main>;
}
function Dashboard({token,setPage}) {
  const [requests,setRequests]=useState([]),[msg,setMsg]=useState(""),[loading,setLoading]=useState(true);
  const [editing,setEditing]=useState(null),[editForm,setEditForm]=useState(emptyRequest),[selected,setSelected]=useState(null),[matches,setMatches]=useState([]),[busy,setBusy]=useState(false);
  const headers=authHeaders(token);
  const loadRequests=async()=>{setLoading(true);setMsg("");try{const {data}=await axios.get(`${API}/requests`,{headers});setRequests(data);}catch(err){setMsg(err.response?.data?.message||"Unable to load requests.");}finally{setLoading(false);}};
  React.useEffect(()=>{loadRequests();},[token]);
  const startEdit=r=>{setEditing(r._id);setEditForm({patientName:r.patientName,bloodGroup:r.bloodGroup,city:r.city,hospital:r.hospital,urgency:r.urgency,units:r.units});setMsg("");};
  const saveEdit=async e=>{e.preventDefault();setBusy(true);setMsg("");try{const {data}=await axios.put(`${API}/requests/${editing}`,editForm,{headers});setRequests(prev=>prev.map(r=>r._id===data._id?data:r));setEditing(null);}catch(err){setMsg(err.response?.data?.message||"Unable to update request.");}finally{setBusy(false);}};
  const deleteRequest=async r=>{if(!window.confirm(`Delete the blood request for ${r.patientName}? This cannot be undone.`))return;setMsg("");try{await axios.delete(`${API}/requests/${r._id}`,{headers});setRequests(prev=>prev.filter(x=>x._id!==r._id));if(selected?._id===r._id)setSelected(null);}catch(err){setMsg(err.response?.data?.message||"Unable to delete request.");}};
  const viewRequest=async r=>{setSelected(r);setMatches([]);setMsg("");try{const [detail,matchData]=await Promise.all([axios.get(`${API}/requests/${r._id}`,{headers}),axios.get(`${API}/requests/${r._id}/matches`,{headers})]);setSelected(detail.data);setMatches(matchData.data);}catch(err){setMsg(err.response?.data?.message||"Unable to load request details.");}};
  const updateStatus=async(r,status)=>{try{const {data}=await axios.patch(`${API}/requests/${r._id}/status`,{status},{headers});setRequests(prev=>prev.map(x=>x._id===data._id?data:x));if(selected?._id===data._id)setSelected(data);}catch(err){setMsg(err.response?.data?.message||"Unable to update status.");}};
  return <main className="page"><div className="pageHeading"><div><h1>My Blood Requests</h1><p className="muted">Create, view, edit, track or delete the requests you have submitted.</p></div><button className="primary" onClick={()=>setPage("request")}>+ New Request</button></div>
    <div className="stats"><div className="card stat"><b>{requests.length}</b><span>Total Requests</span></div><div className="card stat"><b>{requests.filter(x=>x.status==="Open").length}</b><span>Open</span></div><div className="card stat"><b>{requests.filter(x=>x.urgency==="Emergency").length}</b><span>Emergency</span></div></div>
    {msg&&<p className="error">{msg}</p>}{loading?<p className="muted">Loading your requests…</p>:requests.length===0?<div className="card empty"><h3>No blood requests yet</h3><p className="muted">Create your first request to start finding compatible donors.</p><button className="primary" onClick={()=>setPage("request")}>Create Blood Request</button></div>:
    <div className="requestList">{requests.map(r=><article className="card requestCard" key={r._id}><div className="requestInfo"><div className="bloodBadge">{r.bloodGroup}</div><div><h3>{r.patientName}</h3><p>{r.hospital} • {r.city}</p><small>{r.units} unit(s) • {r.urgency} urgency • {new Date(r.createdAt).toLocaleDateString()}</small></div></div><div className="requestActions"><span className={`status ${r.status.toLowerCase()}`}>{r.status}</span><button onClick={()=>viewRequest(r)}>View</button><button onClick={()=>startEdit(r)}>Edit</button><button className="dangerText" onClick={()=>deleteRequest(r)}>Delete</button></div></article>)}</div>}
    {selected&&<section className="card detailPanel"><div className="pageHeading"><div><h2>Request Details</h2><p className="muted">Full information and compatible donor matches.</p></div><button onClick={()=>setSelected(null)}>Close</button></div>
      <div className="detailGrid"><p><b>Patient:</b> {selected.patientName}</p><p><b>Blood group:</b> {selected.bloodGroup}</p><p><b>Hospital:</b> {selected.hospital}</p><p><b>City:</b> {selected.city}</p><p><b>Units:</b> {selected.units}</p><p><b>Urgency:</b> {selected.urgency}</p><p><b>Status:</b> {selected.status}</p><p><b>Created:</b> {new Date(selected.createdAt).toLocaleString()}</p></div>
      <div className="statusControls"><b>Update status:</b>{["Open","Matched","Closed"].map(s=><button key={s} className={selected.status===s?"primary":""} onClick={()=>updateStatus(selected,s)}>{s}</button>)}</div>
      <h3>Smart Donor Matches</h3>{matches.length===0?<p className="muted">No available compatible donors found.</p>:<div className="grid">{matches.map((m,i)=><div className="card donor" key={m.donor._id}><div className="rank">#{i+1}</div><div className="bloodBadge">{m.donor.bloodGroup}</div><div><h3>{m.donor.name}</h3><p>{m.donor.city} • {m.donor.distanceKm} km</p><b>Match Score: {m.score}</b></div></div>)}</div>}
    </section>}
    {editing&&<div className="modalBackdrop"><form className="card form wide editModal" onSubmit={saveEdit}><div className="pageHeading"><h2>Edit Blood Request</h2><button type="button" onClick={()=>setEditing(null)}>Cancel</button></div>
      <div className="two"><label>Patient name<input required value={editForm.patientName} onChange={e=>setEditForm({...editForm,patientName:e.target.value})}/></label><label>Hospital<input required value={editForm.hospital} onChange={e=>setEditForm({...editForm,hospital:e.target.value})}/></label></div>
      <div className="two"><label>Blood group<select value={editForm.bloodGroup} onChange={e=>setEditForm({...editForm,bloodGroup:e.target.value})}>{bloodGroups.map(x=><option key={x}>{x}</option>)}</select></label><label>City<input required value={editForm.city} onChange={e=>setEditForm({...editForm,city:e.target.value})}/></label></div>
      <div className="two"><label>Urgency<select value={editForm.urgency} onChange={e=>setEditForm({...editForm,urgency:e.target.value})}>{["Low","Medium","High","Emergency"].map(x=><option key={x}>{x}</option>)}</select></label><label>Units<input type="number" min="1" max="100" required value={editForm.units} onChange={e=>setEditForm({...editForm,units:Number(e.target.value)})}/></label></div>
      <button className="primary" type="submit" disabled={busy}>{busy?"Saving…":"Save Changes"}</button></form></div>}
  </main>;
}
createRoot(document.getElementById("root")).render(<App/>);
