// KL COLLECTION ZONE — demo storefront
// Replace this with your WhatsApp Business number, country code included, digits only.
// Example Bangladesh format: 8801XXXXXXXXX
const WHATSAPP_NUMBER = "8801826511926";

const products = [
  {id:1,name:"Studio Wireless Headphones",category:"Audio",price:2450,tag:"BESTSELLER",rating:"4.8",image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700"},
  {id:2,name:"Smart Watch Series",category:"Wearables",price:1850,tag:"POPULAR",rating:"4.7",image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700"},
  {id:3,name:"Premium Bluetooth Speaker",category:"Audio",price:1650,tag:"NEW",rating:"4.9",image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700"},
  {id:4,name:"Wireless Earbuds Pro",category:"Audio",price:1290,tag:"TOP PICK",rating:"4.8",image:"https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=700"},
  {id:5,name:"Smartphone Stand",category:"Accessories",price:590,tag:"ESSENTIAL",rating:"4.6",image:"https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=700"},
  {id:6,name:"Power Bank 20000mAh",category:"Mobile",price:1750,tag:"POPULAR",rating:"4.7",image:"https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=700"},
  {id:7,name:"Smart Fitness Band",category:"Wearables",price:1150,tag:"NEW",rating:"4.5",image:"https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=700"},
  {id:8,name:"Fast Charging Adapter",category:"Accessories",price:750,tag:"DAILY USE",rating:"4.6",image:"https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700"}
];
let cart = [];
let activeFilter = "All";
const money = n => "৳" + Number(n).toLocaleString("en-BD");
const productGrid = document.getElementById("productGrid");

function renderProducts(){
  const term = document.getElementById("searchInput").value.trim().toLowerCase();
  let list = products.filter(p => (activeFilter === "All" || p.category === activeFilter) && (p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)));
  const sort = document.getElementById("sortSelect").value;
  if(sort === "low") list.sort((a,b)=>a.price-b.price);
  if(sort === "high") list.sort((a,b)=>b.price-a.price);
  productGrid.innerHTML = list.length ? list.map(p=>`
    <article class="product-card">
      <div class="product-image"><span class="product-tag">${p.tag}</span><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.opacity='.15'"><button class="add-btn" data-add="${p.id}" aria-label="Add ${p.name} to cart">+</button></div>
      <div class="product-info"><span class="product-category">${p.category}</span><h3>${p.name}</h3><div class="product-bottom"><span class="price">${money(p.price)}</span><span class="rating">★ ${p.rating}</span></div></div>
    </article>`).join("") : '<p>No products found. Try another search.</p>';
}
function renderCart(){
  const count = cart.reduce((s,i)=>s+i.qty,0);
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("subtotal").textContent = money(total);
  document.getElementById("cartItems").innerHTML = cart.length ? cart.map(i=>`
    <div class="cart-item"><img src="${i.image}" alt=""><div><h4>${i.name}</h4><small>${money(i.price)}</small><div class="qty-controls"><button data-qty="${i.id}" data-change="-1">−</button><span>${i.qty}</span><button data-qty="${i.id}" data-change="1">+</button></div></div><b>${money(i.price*i.qty)}</b></div>`).join("") : '<div class="empty-cart">Your cart is waiting for something good.</div>';
}
function showCart(){document.getElementById("cartDrawer").classList.add("open");document.getElementById("overlay").classList.add("show")}
function hideCart(){document.getElementById("cartDrawer").classList.remove("open");document.getElementById("overlay").classList.remove("show")}
function addToCart(id){const p=products.find(x=>x.id===id);const item=cart.find(x=>x.id===id);if(item)item.qty++;else cart.push({...p,qty:1});renderCart();showCart()}
productGrid.addEventListener("click",e=>{const btn=e.target.closest("[data-add]");if(btn)addToCart(Number(btn.dataset.add))});
document.getElementById("cartItems").addEventListener("click",e=>{const btn=e.target.closest("[data-qty]");if(!btn)return;const item=cart.find(x=>x.id===Number(btn.dataset.qty));item.qty+=Number(btn.dataset.change);if(item.qty<=0)cart=cart.filter(x=>x.id!==item.id);renderCart()});
document.getElementById("openCart").addEventListener("click",showCart);
document.getElementById("closeCart").addEventListener("click",hideCart);
document.getElementById("overlay").addEventListener("click",hideCart);
document.getElementById("searchInput").addEventListener("input",renderProducts);
document.getElementById("sortSelect").addEventListener("change",renderProducts);
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{activeFilter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderProducts()}));
document.querySelectorAll(".category-card").forEach(b=>b.addEventListener("click",()=>{activeFilter=b.dataset.category;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter===activeFilter));document.getElementById("shop").scrollIntoView({behavior:"smooth"});renderProducts()}));
document.getElementById("searchToggle").addEventListener("click",()=>{document.getElementById("shop").scrollIntoView({behavior:"smooth"});document.getElementById("searchInput").focus()});
document.getElementById("checkoutBtn").addEventListener("click",()=>{if(!cart.length){alert("Your cart is empty.");return}hideCart();document.getElementById("checkoutModal").classList.add("show")});
document.getElementById("closeCheckout").addEventListener("click",()=>document.getElementById("checkoutModal").classList.remove("show"));
document.getElementById("checkoutModal").addEventListener("click",e=>{if(e.target.id==="checkoutModal")e.currentTarget.classList.remove("show")});
document.getElementById("checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();
  if(WHATSAPP_NUMBER==="8801XXXXXXXXX"){alert("Please add your WhatsApp Business number in script.js before accepting orders.");return}
  const f=new FormData(e.currentTarget);
  const lines=cart.map(i=>`${i.name} x ${i.qty} — ${money(i.price*i.qty)}`).join("\n");
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const msg=`New order — KL COLLECTION ZONE\n\n${lines}\n\nSubtotal: ${money(total)}\n\nCustomer: ${f.get("name")}\nPhone: ${f.get("phone")}\nAddress: ${f.get("address")}\nPayment: ${f.get("payment")}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,"_blank");
});
document.getElementById("menuToggle").addEventListener("click",()=>document.querySelector(".desktop-nav").classList.toggle("show"));
document.querySelectorAll(".desktop-nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".desktop-nav").classList.remove("show")));
document.getElementById("year").textContent=new Date().getFullYear();
renderProducts();renderCart();
