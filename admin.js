
// ==========================================
// KL COLLECTION ZONE - ADMIN DASHBOARD
// ==========================================

// Supabase Configuration
const SUPABASE_URL = "https://jkrqqbnvugatrutakgoz.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_N0qDjtf5y_pVhwKwXAQRrQ_CKgjk3m_";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// HTML Elements
const $ = (id) => document.getElementById(id);

const loginPanel = $("loginPanel");
const dashboardPanel = $("dashboardPanel");

let orders = [];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function message(id, text) {
  const el = $(id);
  if (el) el.textContent = text || "";
}

function money(n) {
  return "৳" + Number(n || 0).toLocaleString("en-BD");
}

function showLogin() {
  loginPanel.hidden = false;
  dashboardPanel.hidden = true;
  $("logoutBtn").hidden = true;
}

function showDashboard(user) {
  loginPanel.hidden = true;
  dashboardPanel.hidden = false;
  $("logoutBtn").hidden = false;

  $("welcome").textContent =
    `Logged in: ${user.email || "Admin"}`;
}

// ==========================================
// ADMIN PERMISSION CHECK
// ==========================================

async function verifyAdmin() {
  try {
    message("loginMessage", "Admin Permission যাচাই হচ্ছে...");

    const { data: sessionData, error: sessionError } =
      await db.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    const session = sessionData.session;

    if (!session) {
      showLogin();
      return;
    }

    const { data, error } = await db.rpc("is_admin");

    if (error) {
      console.error("Admin Permission Error:", error);

      showLogin();

      message(
        "loginMessage",
        "Admin Permission Check Error: " + error.message
      );

      return;
    }

    if (data !== true) {
      await db.auth.signOut();

      showLogin();

      message(
        "loginMessage",
        "এই অ্যাকাউন্টের Admin অনুমতি নেই।"
      );

      return;
    }

    message("loginMessage", "");

    showDashboard(session.user);

    await loadOrders();

  } catch (error) {
    console.error("Verification Error:", error);

    showLogin();

    message(
      "loginMessage",
      "Verification Error: " + error.message
    );
  }
}

// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {
  try {
    message("dashboardMessage", "অর্ডার লোড হচ্ছে...");

    const { data, error } = await db
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Order Loading Error:", error);

      message(
        "dashboardMessage",
        "অর্ডার লোড হয়নি: " + error.message
      );

      return;
    }

    orders = data || [];

    $("totalCount").textContent = orders.length;

    $("pendingCount").textContent =
      orders.filter(o => o.status === "Pending").length;

    $("confirmedCount").textContent =
      orders.filter(o => o.status === "Confirmed").length;

    message("dashboardMessage", "");

    renderOrders();

  } catch (error) {
    console.error("Load Orders Error:", error);

    message(
      "dashboardMessage",
      "Error: " + error.message
    );
  }
}

// ==========================================
// TEXT ELEMENT CREATION
// ==========================================

function addText(parent, tag, text, cls) {
  const el = document.createElement(tag);

  el.textContent = text ?? "";

  if (cls) {
    el.className = cls;
  }

  parent.appendChild(el);

  return el;
}

// ==========================================
// RENDER ORDERS
// ==========================================

function renderOrders() {
  const host = $("ordersList");

  host.replaceChildren();

  const q = $("searchInput").value.trim().toLowerCase();

  const filter = $("statusFilter").value;

  const filtered = orders.filter(o =>
    (filter === "All" || o.status === filter) &&
    [
      o.order_number,
      o.customer_name,
      o.phone
    ].some(v =>
      String(v || "").toLowerCase().includes(q)
    )
  );

  if (!filtered.length) {
    addText(
      host,
      "div",
      "কোনো অর্ডার পাওয়া যায়নি।",
      "empty"
    );

    return;
  }

  for (const o of filtered) {

    const card = document.createElement("article");
    card.className = "order";

    const head = document.createElement("div");
    head.className = "order-head";

    card.appendChild(head);

    addText(head, "span", o.order_number, "order-id");

    addText(
      head,
      "span",
      new Date(o.created_at).toLocaleString("bn-BD")
    );

    const grid = document.createElement("div");
    grid.className = "order-grid";

    card.appendChild(grid);

    const fields = [
      ["Customer", o.customer_name],
      ["Phone", o.phone],
      ["District", o.district],
      ["Upazila", o.upazila],
      ["Address", o.full_address],
      ["Note", o.order_note || "—"],
      ["Subtotal", money(o.subtotal)],
      ["Delivery", money(o.delivery_charge)],
      ["Total", money(o.total)]
    ];

    for (const [k, v] of fields) {
      const p = document.createElement("p");

      const b = document.createElement("b");

      b.textContent = k + ": ";

      p.append(b, document.createTextNode(String(v ?? "")));

      grid.appendChild(p);
    }

    const items = document.createElement("div");

    items.className = "items";

    items.textContent =
      "পণ্য: " +
      (
        Array.isArray(o.items)
          ? o.items.map(i => `${i.name} × ${i.quantity}`).join(", ")
          : "—"
      );

    card.appendChild(items);

    const row = document.createElement("div");

    row.className = "status-row";

    card.appendChild(row);

    addText(row, "span", "Status:");

    const sel = document.createElement("select");

    [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled"
    ].forEach(s => {
      const op = document.createElement("option");

      op.value = s;
      op.textContent = s;

      sel.appendChild(op);
    });

    sel.value = o.status;

    row.appendChild(sel);

    const btn = addText(
      row,
      "button",
      "Update Status",
      "btn"
    );

    btn.type = "button";

    btn.addEventListener("click", async () => {

      btn.disabled = true;

      message(
        "dashboardMessage",
        "Status আপডেট হচ্ছে..."
      );

      try {
        const { error } = await db
          .from("orders")
          .update({ status: sel.value })
          .eq("id", o.id);

        if (error) {
          throw error;
        }

        message(
          "dashboardMessage",
          "Status সফলভাবে আপডেট হয়েছে।"
        );

        await loadOrders();

      } catch (error) {
        console.error("Status Update Error:", error);

        message(
          "dashboardMessage",
          "আপডেট হয়নি: " + error.message
        );

      } finally {
        btn.disabled = false;
      }

    });

    host.appendChild(card);
  }
}

// ==========================================
// ADMIN LOGIN
// ==========================================

$("loginForm").addEventListener("submit", async (e) => {

  e.preventDefault();

  const btn = e.currentTarget.querySelector("button");

  btn.disabled = true;

  message("loginMessage", "Login হচ্ছে...");

  try {

    const email = $("email").value.trim();

    const password = $("password").value;

    const { data, error } = await db.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error("Supabase Login Error:", error);

      message(
        "loginMessage",
        "Login Error: " + error.message
      );

      return;
    }

    if (!data.session) {
      message(
        "loginMessage",
        "Login Session পাওয়া যায়নি। আবার চেষ্টা করুন।"
      );

      return;
    }

    message("loginMessage", "");

    await verifyAdmin();

  } catch (error) {

    console.error("Login Error:", error);

    message(
      "loginMessage",
      "Error: " + error.message
    );

  } finally {
    btn.disabled = false;
  }

});

// ==========================================
// LOGOUT
// ==========================================

$("logoutBtn").addEventListener("click", async () => {

  const { error } = await db.auth.signOut();

  if (error) {
    message(
      "dashboardMessage",
      "Logout Error: " + error.message
    );

    return;
  }

  showLogin();

});

// ==========================================
// DASHBOARD CONTROLS
// ==========================================

$("refreshBtn").addEventListener("click", loadOrders);

$("searchInput").addEventListener("input", renderOrders);

$("statusFilter").addEventListener("change", renderOrders);

// ==========================================
// INITIAL CHECK
// ==========================================

verifyAdmin();
