// Public frontend key only. Database access is protected by Supabase Auth + RLS.
const SUPABASE_URL = "https://jkrqqbnvugatrutakgoz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_N0qDjtf5y_pVhwKwXAQRr_Q_CKgjk3m_";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);
const loginPanel=$("loginPanel"), dashboardPanel=$("dashboardPanel");
let orders=[];

function message(id,text){$(id).textContent=text||"";}
function money(n){return "৳"+Number(n||0).toLocaleString("en-BD");}
function showLogin(){loginPanel.hidden=false;dashboardPanel.hidden=true;$("logoutBtn").hidden=true;}
function showDashboard(user){loginPanel.hidden=true;dashboardPanel.hidden=false;$("logoutBtn").hidden=false;$("welcome").textContent=`Logged in: ${user.email||"Admin"}`;}

async function verifyAdmin(){
  const {data:{session}}=await db.auth.getSession();
  if(!session){showLogin();return;}
  const {data,isAdmin,error}=await db.rpc("is_admin");
  if(error||!data){await db.auth.signOut();showLogin();message("loginMessage","এই অ্যাকাউন্টের Admin অনুমতি নেই।");return;}
  showDashboard(session.user);
  await loadOrders();
}
async function loadOrders(){
  message("dashboardMessage","অর্ডার লোড হচ্ছে...");
  const {data,error}=await db.from("orders").select("*").order("created_at",{ascending:false}).limit(200);
  if(error){message("dashboardMessage","অর্ডার লোড হয়নি: "+error.message);return;}
  orders=data||[];
  $("totalCount").textContent=orders.length;
  $("pendingCount").textContent=orders.filter(o=>o.status==="Pending").length;
  $("confirmedCount").textContent=orders.filter(o=>o.status==="Confirmed").length;
  message("dashboardMessage","");
  renderOrders();
}
function addText(parent,tag,text,cls){
  const el=document.createElement(tag);el.textContent=text??"";if(cls)el.className=cls;parent.appendChild(el);return el;
}
function renderOrders(){
  const host=$("ordersList");host.replaceChildren();
  const q=$("searchInput").value.trim().toLowerCase(), filter=$("statusFilter").value;
  const filtered=orders.filter(o=>(filter==="All"||o.status===filter)&&[o.order_number,o.customer_name,o.phone].some(v=>String(v||"").toLowerCase().includes(q)));
  if(!filtered.length){addText(host,"div","কোনো অর্ডার পাওয়া যায়নি।","empty");return;}
  for(const o of filtered){
    const card=document.createElement("article");card.className="order";
    const head=document.createElement("div");head.className="order-head";card.appendChild(head);
    addText(head,"span",o.order_number,"order-id");
    addText(head,"span",new Date(o.created_at).toLocaleString("bn-BD"));
    const grid=document.createElement("div");grid.className="order-grid";card.appendChild(grid);
    const fields=[["Customer",o.customer_name],["Phone",o.phone],["District",o.district],["Upazila",o.upazila],["Address",o.full_address],["Note",o.order_note||"—"],["Subtotal",money(o.subtotal)],["Delivery",money(o.delivery_charge)],["Total",money(o.total)]];
    for(const [k,v] of fields){const p=document.createElement("p");const b=document.createElement("b");b.textContent=k+": ";p.append(b,document.createTextNode(String(v??"")));grid.appendChild(p);}
    const items=document.createElement("div");items.className="items";items.textContent="পণ্য: "+(Array.isArray(o.items)?o.items.map(i=>`${i.name} × ${i.quantity}`).join(", "):"—");card.appendChild(items);
    const row=document.createElement("div");row.className="status-row";card.appendChild(row);
    addText(row,"span","Status:");
    const sel=document.createElement("select");["Pending","Confirmed","Shipped","Delivered","Cancelled"].forEach(s=>{const op=document.createElement("option");op.value=s;op.textContent=s;sel.appendChild(op);});sel.value=o.status;row.appendChild(sel);
    const btn=addText(row,"button","Update Status","btn");btn.type="button";
    btn.addEventListener("click",async()=>{
      btn.disabled=true;message("dashboardMessage","Status আপডেট হচ্ছে...");
      const {error}=await db.from("orders").update({status:sel.value}).eq("id",o.id);
      btn.disabled=false;
      if(error){message("dashboardMessage","আপডেট হয়নি: "+error.message);return;}
      message("dashboardMessage","Status সফলভাবে আপডেট হয়েছে।");await loadOrders();
    });
    host.appendChild(card);
  }
}
$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();const btn=e.currentTarget.querySelector("button");btn.disabled=true;message("loginMessage","Login হচ্ছে...");
  const {error}=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
  btn.disabled=false;
  if(error){message("loginMessage","Login হয়নি। ইমেইল/পাসওয়ার্ড যাচাই করুন।");return;}
  message("loginMessage","");await verifyAdmin();
});
$("logoutBtn").addEventListener("click",async()=>{await db.auth.signOut();showLogin();});
$("refreshBtn").addEventListener("click",loadOrders);
$("searchInput").addEventListener("input",renderOrders);
$("statusFilter").addEventListener("change",renderOrders);
verifyAdmin();
