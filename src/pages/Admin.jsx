import { useEffect, useState } from "react";
import { supabase } from "../lib";
import { BarChart3, ImagePlus, LogIn, LogOut, Save } from "lucide-react";

export default function Admin() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [views, setViews] = useState([]);
  const [title, setTitle] = useState(localStorage.getItem("ttp_admin_title") || "The Tinted Pass");
  const [intro, setIntro] = useState(localStorage.getItem("ttp_admin_intro") || "Journeys shaped by art, landscape and the stories of those who came before us.");
  const [imageUrl, setImageUrl] = useState(localStorage.getItem("ttp_admin_image") || "");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(e) {
    e.preventDefault();
    if (!supabase) { setMessage("Connect Supabase to enable secure admin login. See SETUP.md."); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : "Signed in.");
  }
  async function signOut() { await supabase?.auth.signOut(); setSession(null); }
  async function saveContent(e) {
    e.preventDefault();
    localStorage.setItem("ttp_admin_title", title);
    localStorage.setItem("ttp_admin_intro", intro);
    localStorage.setItem("ttp_admin_image", imageUrl);
    if (supabase && session) {
      const { error } = await supabase.from("site_content").upsert({ key: "homepage", value: { title, intro, imageUrl } });
      setMessage(error ? error.message : "Saved locally and to Supabase.");
    } else setMessage("Saved in this browser only. Connect Supabase for shared live content.");
  }
  async function loadViews() {
    if (supabase && session) {
      const { data, error } = await supabase.from("page_views").select("path,country,created_at").order("created_at", { ascending: false }).limit(500);
      if (error) setMessage(error.message); else setViews(data || []);
    } else {
      const local = JSON.parse(localStorage.getItem("ttp_local_views") || "[]");
      setViews(local.reverse());
      setMessage("Showing local browser visits only. Connect Supabase for site-wide analytics.");
    }
  }

  const countries = Object.entries(views.reduce((acc, v) => { acc[v.country || "Unknown"] = (acc[v.country || "Unknown"] || 0) + 1; return acc; }, {}));
  return <div className="page-shell admin-page">
    <div className="admin-heading"><div><div className="eyebrow">PRIVATE AREA</div><h1>Site <em>studio.</em></h1><p>Manage selected site copy and review visitor activity.</p></div><span className="admin-status">{supabase ? "SUPABASE CONNECTED" : "LOCAL PREVIEW MODE"}</span></div>
    {!session ? <form className="admin-login" onSubmit={signIn}>
      <LogIn/><h2>Administrator sign in</h2><p>Secure editing requires Supabase authentication. Do not publish an admin area without enabling authentication.</p>
      <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>
      <button className="button button-dark" type="submit">Sign in</button>
      {!supabase && <small>Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file, then create an admin user in Supabase.</small>}
    </form> : <div className="admin-toolbar"><span>Signed in as {session.user.email}</span><button onClick={signOut}><LogOut size={15}/> Sign out</button></div>}
    <div className="admin-grid">
      <form className="admin-card" onSubmit={saveContent}>
        <div className="admin-card-title"><ImagePlus/><div><h2>Homepage content</h2><p>Update a small set of homepage fields.</p></div></div>
        <label>Site title<input value={title} onChange={e=>setTitle(e.target.value)}/></label>
        <label>Intro text<textarea rows="4" value={intro} onChange={e=>setIntro(e.target.value)}/></label>
        <label>Image URL<input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://…"/></label>
        <button className="button button-dark" type="submit"><Save size={15}/> Save changes</button>
      </form>
      <div className="admin-card">
        <div className="admin-card-title"><BarChart3/><div><h2>Visitor analytics</h2><p>Page views recorded by this site.</p></div></div>
        <button className="button button-outline" onClick={loadViews}>Load analytics</button>
        <div className="analytics-total"><strong>{views.length}</strong><span>RECENT PAGE VIEWS</span></div>
        <h3>By country</h3>
        {countries.length ? countries.map(([c,n])=><div className="analytics-row" key={c}><span>{c}</span><strong>{n}</strong></div>) : <p className="muted">Load analytics to see available data.</p>}
        <p className="admin-warning">Country is marked “Unknown” in this starter. For reliable country-level reporting, configure a privacy-respecting analytics provider or server-side geolocation with appropriate consent and disclosure.</p>
      </div>
    </div>
    {message && <p className="admin-message">{message}</p>}
    <div className="admin-note"><strong>Important:</strong> The local preview mode stores edits and visits only in your current browser. It is not a secure multi-user CMS. Enable Supabase and apply the SQL in <code>supabase/schema.sql</code> before using this for a live business website.</div>
  </div>;
}
