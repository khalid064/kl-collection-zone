const WHATSAPP_NUMBER = "8801826511926";

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

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (!cart.length) {
    alert("Your cart is empty!");
    return;
  }

  if (WHATSAPP_NUMBER === "8801XXXXXXXXX") {
    alert("Please add your WhatsApp number in script.js first.");
    return;
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty, 0
  );

  const orderItems = cart.map(item =>
    `${item.name} x ${item.qty} = ${money(item.price * item.qty)}`
  ).join("\n");

  const message =
    `Hello KL COLLECTION ZONE!\n\nI want to order:\n${orderItems}\n\nTotal: ${money(total)}`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
});

document.getElementById("year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
