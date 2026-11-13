// Supabase public frontend settings. Never put a service_role key here.
const SUPABASE_URL = "https://jkrqqbnvugatrutakgoz.supabase.co";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";

const products = [
  {
    id: 1,
    name: "WATCH ULTRA 3 Smart Watch",
    category: "Wearables",
    price: 5000,
    tag: "NEW ARRIVAL",
    description: "Smartwatch with touchscreen, Bluetooth calling, camera and app features. Includes black and orange straps and charging accessories.",
    image: "https://res.cloudinary.com/r6twyjul/image/upload/f_auto,q_auto/1000072281"
  },
  {
    id: 2,
    name: "Wireless Headphones",
    category: "Audio",
    price: 1500,
    tag: "POPULAR",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700"
  },
  {
    id: 3,
    name: "Bluetooth Speaker",
    category: "Audio",
    price: 1650,
    tag: "POPULAR",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700"
  },
  {
    id: 4,
    name: "Wireless Earbuds",
    category: "Audio",
    price: 1200,
    tag: "NEW",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=700"
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
  "৳" + amount.toLocaleString("en-BD");

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
  // Dhaka district is treated as the inside-Dhaka delivery zone.
  const isDhaka = selectedDistrict.bn_name === "ঢাকা" ||
    selectedDistrict.name.toLowerCase() === "dhaka";
  return isDhaka ? 70 : 130;
}

function updateCheckoutSummary() {
  const subtotal = cartSubtotal();
  const charge = currentDeliveryCharge();
  document.getElementById("checkoutSubtotal").textContent = money(subtotal);
  document.getElementById("deliveryCharge").textContent = selectedDistrict
    ? money(charge)
    : "জেলা নির্বাচন করুন";
  document.getElementById("checkoutTotal").textContent = money(subtotal + charge);
}

async function loadBangladeshLocations() {
  districtSelect.disabled = true;
  districtSelect.innerHTML = '<option value="">জেলা লোড হচ্ছে...</option>';
  try {
    const response = await fetch("https://iqbalhasandev.github.io/bangladesh-geo-json/bangladesh-geo.json");
    if (!response.ok) throw new Error("Location list could not be loaded");
    const divisions = await response.json();
    bangladeshDistricts = divisions.flatMap(division =>
      (division.districts || []).map(district => ({
        ...district,
        divisionName: division.bn_name || division.name
      }))
    ).sort((a, b) => (a.bn_name || a.name).localeCompare(b.bn_name || b.name, "bn"));

    districtSelect.innerHTML = '<option value="">জেলা নির্বাচন করুন</option>' +
      bangladeshDistricts.map((district, index) =>
        `<option value="${index}">${district.bn_name || district.name}</option>`
      ).join("");
    districtSelect.disabled = false;
  } catch (error) {
    districtSelect.innerHTML = '<option value="">জেলা লোড হয়নি — ইন্টারনেট সংযোগ পরীক্ষা করুন</option>';
    alert("জেলা ও উপজেলার তালিকা লোড করা যায়নি। ইন্টারনেট সংযোগ চালু করে পেজটি রিফ্রেশ করুন।");
  }
}

districtSelect.addEventListener("change", () => {
  const index = districtSelect.value;
  selectedDistrict = index === "" ? null : bangladeshDistricts[Number(index)];
  upazilaSelect.innerHTML = '<option value="">উপজেলা নির্বাচন করুন</option>';

  if (!selectedDistrict) {
    upazilaSelect.disabled = true;
  } else {
    const upazilas = [...(selectedDistrict.upazilas || [])]
      .sort((a, b) => (a.bn_name || a.name).localeCompare(b.bn_name || b.name, "bn"));
    upazilaSelect.innerHTML += upazilas.map(upazila =>
      `<option value="${upazila.bn_name || upazila.name}">${upazila.bn_name || upazila.name}</option>`
    ).join("");
    upazilaSelect.disabled = upazilas.length === 0;
    if (upazilas.length === 0) {
      upazilaSelect.innerHTML = '<option value="">উপজেলার তথ্য পাওয়া যায়নি</option>';
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
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === "PASTE_YOUR_SUPABASE_ANON_KEY_HERE") {
    alert("Supabase anon key এখনো script.js-এ বসানো হয়নি।");
    return;
  }

  const formElement = event.currentTarget;
  const submitButton = formElement.querySelector('button[type="submit"]');
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
      items: cart.map(item => ({ id: item.id, qty: item.qty }))
    };

    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || result.message || "অর্ডার জমা দেওয়া যায়নি।");

    alert(
      `আপনার অর্ডার সফলভাবে জমা হয়েছে!\\nঅর্ডার আইডি: ${result.order_number}\\nসর্বমোট: ${money(result.total)}\\nপেমেন্ট: Cash on Delivery`
    );
    cart = [];
    renderCart();
    formElement.reset();
    selectedDistrict = null;
    upazilaSelect.innerHTML = '<option value="">আগে জেলা নির্বাচন করুন</option>';
    upazilaSelect.disabled = true;
    districtSelect.value = "";
    updateCheckoutSummary();
    closeCheckout();
  } catch (error) {
    console.error("Order submission error:", error);
    alert(error.message || "দুঃখিত, অর্ডার জমা হয়নি। আবার চেষ্টা করুন।");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
