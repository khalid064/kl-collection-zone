// Supabase public frontend settings.
// Use the Publishable key from Supabase Project Settings > API Keys.
const SUPABASE_URL = "https://jkrqqbnvugatrutakgoz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_N0qDjtf5y_pVhwKwXAQRrQ_CKgjk3m_";

const products = [
  {
    id: 1,
    name: "WATCH ULTRA 3 Smart Watch",
    category: "Wearables",
    price: 4889,
    tag: "NEW ARRIVAL",
    description: "Smartwatch with touchscreen, Bluetooth calling, camera and app features. Includes black and orange straps and charging accessories.",
    image: "https://res.cloudinary.com/r6twyjul/image/upload/f_auto,q_auto/1000072281"
  },
  {
    id: 2,
    name: "Mini Hair Straightener ",
    category: "Gadgets",
    price: 499,
    tag: "POPULAR",
    image: "https://res.cloudinary.com/r6twyjul/image/upload/f_auto,q_auto/1000060206"
  },
  {
    id: 3,
    name: " M90 pro Bluetooth Headphones ",
    category: "Audio",
    price: 649,
    tag: "POPULAR",
    image: "https://res.cloudinary.com/r6twyjul/image/upload/f_auto,q_auto/1000059070"
  },
  {
    id: 4,
    name: "Awei T13 Pro True Wireless Earbuds",
    category: "Audio",
    price: 1299,
    tag: "NEW",
    description: "স্টাইল, কমফোর্ট আর পারফরম্যান্স—সবকিছু একসাথে চাইলে Awei T13 Pro হতে পারে আপনার পারফেক্ট চয়েস 😍 ডেইলি ইউজ, গেমিং কিংবা মিউজিক—সব ক্ষেত্রেই দেবে স্মুথ এক্সপেরিয়েন্স ✨",
    image: "https://res.cloudinary.com/r6twyjul/image/upload/f_auto,q_auto/1000058557"
  },
  {
    id: 5,
    name: "Power Bank",
    category: "Mobile",
    price: 1750,
    tag: "ESSENTIAL",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=700"
  }
];

let cart = [];
let activeFilter = "All";

const money = amount =>
  "৳" + Number(amount || 0).toLocaleString("en-BD");

const productGrid = document.getElementById("productGrid");

function renderProducts() {
  const search = document
    .getElementById("searchInput")
    .value.toLowerCase();

  let list = products.filter(p =>
    (activeFilter === "All" || p.category === activeFilter) &&
    p.name.toLowerCase().includes(search)
  );

  const sort = document.getElementById("sortSelect").value;

  if (sort === "low") {
    list.sort((a, b) => a.price - b.price);
  }

  if (sort === "high") {
    list.sort((a, b) => b.price - a.price);
  }

  productGrid.innerHTML = list.length
    ? list.map(p => `
      <article class="product-card">
        <div class="product-image">
          <span class="product-tag">${p.tag}</span>
          <img src="${p.image}" alt="${p.name}">
        </div>
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <h3>${p.name}</h3>
          <p class="product-description">${p.description || ""}</p>
          <div class="product-bottom">
            <span class="price">${money(p.price)}</span>
          </div>
          <button class="add-btn" data-add="${p.id}">
            Add to Cart
          </button>
        </div>
      </article>
    `).join("")
    : "<p>No products found.</p>";
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);

  if (!product) return;

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  renderCart();
  showCart();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty, 0
  );

  document.getElementById("cartCount").textContent = count;
  document.getElementById("subtotal").textContent = money(total);

  document.getElementById("cartItems").innerHTML = cart.length
    ? cart.map(item => `
      <div class="cart-item">
        <div>
          <h4>${item.name}</h4>
          <small>${money(item.price)}</small>
          <div class="qty-controls">
            <button data-id="${item.id}" data-change="-1">−</button>
            <span>${item.qty}</span>
            <button data-id="${item.id}" data-change="1">+</button>
          </div>
        </div>
        <b>${money(item.price * item.qty)}</b>
      </div>
    `).join("")
    : '<p class="empty-cart">Your cart is empty.</p>';
}

function showCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}

function hideCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});

document.getElementById("cartItems").addEventListener("click", event => {
  const button = event.target.closest("[data-id]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const change = Number(button.dataset.change);
  const item = cart.find(i => i.id === id);

  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  renderCart();
});

document.getElementById("openCart").addEventListener("click", showCart);
document.getElementById("closeCart").addEventListener("click", hideCart);
document.getElementById("overlay").addEventListener("click", hideCart);

document.getElementById("searchInput").addEventListener("input", renderProducts);
document.getElementById("sortSelect").addEventListener("change", renderProducts);

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    document.querySelectorAll(".filter").forEach(b => {
      b.classList.toggle("active", b === button);
    });

    renderProducts();
  });
});

const checkoutModal = document.getElementById("checkoutModal");
const districtSelect = document.getElementById("districtSelect");
const upazilaSelect = document.getElementById("upazilaSelect");

let bangladeshDistricts = [];
let selectedDistrict = null;

function cartSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function currentDeliveryCharge() {
  if (!selectedDistrict) return 0;

  const isDhaka =
    selectedDistrict.bn_name === "ঢাকা" ||
    String(selectedDistrict.name || "").toLowerCase() === "dhaka";

  return isDhaka ? 70 : 130;
}

function updateCheckoutSummary() {
  const subtotal = cartSubtotal();
  const charge = currentDeliveryCharge();

  document.getElementById("checkoutSubtotal").textContent = money(subtotal);

  document.getElementById("deliveryCharge").textContent =
    selectedDistrict ? money(charge) : "জেলা নির্বাচন করুন";

  document.getElementById("checkoutTotal").textContent =
    money(subtotal + charge);
}

async function loadBangladeshLocations() {
  districtSelect.disabled = true;
  districtSelect.innerHTML = '<option value="">জেলা লোড হচ্ছে...</option>';

  try {
    const response = await fetch(
      "https://iqbalhasandev.github.io/bangladesh-geo-json/bangladesh-geo.json"
    );

    if (!response.ok) {
      throw new Error("Location list could not be loaded");
    }

    const divisions = await response.json();

    bangladeshDistricts = divisions.flatMap(division =>
      (division.districts || []).map(district => ({
        ...district,
        divisionName: division.bn_name || division.name
      }))
    ).sort((a, b) =>
      (a.bn_name || a.name).localeCompare(
        b.bn_name || b.name,
        "bn"
      )
    );

    districtSelect.innerHTML =
      '<option value="">জেলা নির্বাচন করুন</option>' +
      bangladeshDistricts.map((district, index) =>
        `<option value="${index}">${district.bn_name || district.name}</option>`
      ).join("");

    districtSelect.disabled = false;

  } catch (error) {
    console.error("Location loading error:", error);

    districtSelect.innerHTML =
      '<option value="">জেলা লোড হয়নি -- ইন্টারনেট সংযোগ পরীক্ষা করুন</option>';

    alert(
      "জেলা ও উপজেলার তালিকা লোড করা যায়নি। ইন্টারনেট সংযোগ চালু করে পেজটি রিফ্রেশ করুন।"
    );
  }
}

districtSelect.addEventListener("change", () => {
  const index = districtSelect.value;

  selectedDistrict =
    index === "" ? null : bangladeshDistricts[Number(index)];

  upazilaSelect.innerHTML =
    '<option value="">উপজেলা নির্বাচন করুন</option>';

  if (!selectedDistrict) {
    upazilaSelect.disabled = true;
  } else {
    const upazilas = [...(selectedDistrict.upazilas || [])]
      .sort((a, b) =>
        (a.bn_name || a.name).localeCompare(
          b.bn_name || b.name,
          "bn"
        )
      );

    upazilaSelect.innerHTML += upazilas.map(upazila =>
      `<option value="${upazila.bn_name || upazila.name}">
        ${upazila.bn_name || upazila.name}
      </option>`
    ).join("");

    upazilaSelect.disabled = upazilas.length === 0;

    if (upazilas.length === 0) {
      upazilaSelect.innerHTML =
        '<option value="">উপজেলার তথ্য পাওয়া যায়নি</option>';
    }
  }

  updateCheckoutSummary();
});

function openCheckout() {
  if (!cart.length) {
    alert("আপনার কার্ট খালি!");
    return;
  }

  hideCart();
  checkoutModal.classList.add("show");
  checkoutModal.setAttribute("aria-hidden", "false");

  updateCheckoutSummary();
  loadBangladeshLocations();
}

function closeCheckout() {
  checkoutModal.classList.remove("show");
  checkoutModal.setAttribute("aria-hidden", "true");
}

document.getElementById("checkoutBtn").addEventListener("click", openCheckout);
document.getElementById("closeCheckout").addEventListener("click", closeCheckout);

checkoutModal.addEventListener("click", event => {
  if (event.target === checkoutModal) closeCheckout();
});

// ===== Animated Order Success Popup =====

function showOrderSuccess(result) {
  const overlay = document.createElement("div");
  overlay.className = "order-success-overlay";

  overlay.innerHTML = `
    <div class="order-success-card"
         role="dialog"
         aria-modal="true"
         aria-labelledby="orderSuccessTitle">

      <div class="success-icon">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle class="success-circle" cx="50" cy="50" r="30"></circle>
          <path class="success-tick" d="M35 51 L45 61 L66 39"></path>
        </svg>
      </div>

      <h2 id="orderSuccessTitle">অর্ডার সফল হয়েছে!</h2>

      <p class="success-subtitle">
        আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।
      </p>

      <div class="success-details">
        <div>
          <span>অর্ডার আইডি</span>
          <strong>${escapeHTML(result.order_number || "N/A")}</strong>
        </div>

        <div>
          <span>সর্বমোট</span>
          <strong class="success-total">${money(result.total)}</strong>
        </div>

        <div>
          <span>পেমেন্ট</span>
          <strong>Cash on Delivery</strong>
        </div>
      </div>

      <button type="button" class="success-close">
        ঠিক আছে
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  overlay.querySelector(".success-close").addEventListener("click", close);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) close();
  });
}

// Escape HTML characters before displaying server data.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

// ===== Checkout Form Submission =====

document.getElementById("checkoutForm").addEventListener("submit", async event => {
  event.preventDefault();

  if (!cart.length) {
    alert("আপনার কার্ট খালি!");
    closeCheckout();
    return;
  }

  if (!selectedDistrict || !districtSelect.value || !upazilaSelect.value) {
    alert("অনুগ্রহ করে জেলা ও উপজেলা নির্বাচন করুন।");
    return;
  }

  if (
    !SUPABASE_ANON_KEY ||
    SUPABASE_ANON_KEY === "REPLACE_WITH_YOUR_CURRENT_PUBLISHABLE_KEY"
  ) {
    alert("Supabase Publishable key বসানো হয়নি।");
    return;
  }

  const formElement = event.currentTarget;
  const submitButton = formElement.querySelector('button[type="submit"]');

  if (!submitButton) {
    alert("Submit button পাওয়া যায়নি।");
    return;
  }

  const originalButtonText = submitButton.textContent;

  submitButton.disabled = true;
  submitButton.textContent = "অর্ডার জমা হচ্ছে...";

  try {
    const form = new FormData(formElement);

    const payload = {
      customerName: String(form.get("customerName") || "").trim(),
      customerPhone: String(form.get("customerPhone") || "").trim(),
      district: selectedDistrict.bn_name || selectedDistrict.name,
      upazila: String(form.get("upazila") || "").trim(),
      address: String(form.get("deliveryAddress") || "").trim(),
      note: String(form.get("orderNote") || "").trim(),
      items: cart.map(item => ({
        id: item.id,
        qty: item.qty
      }))
    };

    if (
      !payload.customerName ||
      !payload.customerPhone ||
      !payload.upazila ||
      !payload.address
    ) {
      throw new Error("সব প্রয়োজনীয় তথ্য পূরণ করুন।");
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.error ||
        result.message ||
        "অর্ডার জমা দেওয়া যায়নি।"
      );
    }

    if (!result.order_number || result.total == null) {
      throw new Error(
        "অর্ডার জমা হয়েছে কিনা নিশ্চিত করা যায়নি। অনুগ্রহ করে Admin Dashboard পরীক্ষা করুন।"
      );
    }

    // Show success animation after successful order response.
    showOrderSuccess(result);

    // Clear cart after successful submission.
    cart = [];
    renderCart();

    formElement.reset();

    selectedDistrict = null;
    upazilaSelect.innerHTML =
      '<option value="">আগে জেলা নির্বাচন করুন</option>';

    upazilaSelect.disabled = true;
    districtSelect.value = "";

    updateCheckoutSummary();
    closeCheckout();

  } catch (error) {
    console.error("Order submission error:", error);

    alert(
      error.message ||
      "দুঃখিত, অর্ডার জমা হয়নি। আবার চেষ্টা করুন।"
    );

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

// ===== Footer Year =====

document.getElementById("year").textContent =
  new Date().getFullYear();

// ===== Initial Render =====

renderProducts();
renderCart();



/* ===== Theme Switcher ===== */

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");

function applyTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");

  if (themeIcon) {
    themeIcon.textContent = theme === "light" ? "🌙" : "☀️";
  }

  if (themeLabel) {
    themeLabel.textContent = theme === "light" ? "Dark" : "Light";
  }
}

const savedTheme = localStorage.getItem("kl-theme") || "dark";
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    const isLight = document.body.classList.contains("light-theme");

    const newTheme = isLight ? "dark" : "light";

    localStorage.setItem("kl-theme", newTheme);
    applyTheme(newTheme);
  });
}




