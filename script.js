// ---------------------------------------------------------------
// PRODUCTOS
// Ya no están fijos en el código: se leen en tiempo real desde
// Firestore (colección "productos"). Cuando el negocio agregue,
// edite o borre algo en el panel de administración, esta página
// se actualiza sola, sin recargar.
// ---------------------------------------------------------------
let products = [];

db.collection("productos").onSnapshot((snapshot) => {
  products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const activeCat = document.querySelector(".aisle.active")?.dataset.cat || "todos";
  renderProducts(activeCat);
  renderCart(); // por si cambió algo de un producto que ya está en el carrito
});

let cart = []; // { id, qty }

const grid = document.getElementById("productGrid");
const aisles = document.getElementById("aisles");
const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const overlay = document.getElementById("overlay");
const closeCart = document.getElementById("closeCart");
const checkoutBtn = document.getElementById("checkoutBtn");

function money(n) {
  return "$" + n.toLocaleString("es-MX");
}

function renderProducts(cat = "todos") {
  const list = cat === "todos" ? products : products.filter(p => p.cat === cat);
  grid.innerHTML = list.map(p => `
    <article class="card" data-id="${p.id}">
      <div class="card__img">${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}">` : (p.icon || "📦")}</div>
      <div class="card__body">
        <h3 class="card__name">${p.name}</h3>
        <p class="card__desc">${p.desc}</p>
        <div class="card__footer">
          <span class="price-tag">${money(p.price)}</span>
          <button class="add-btn" data-id="${p.id}">Agregar</button>
        </div>
      </div>
    </article>
  `).join("");
}

aisles.addEventListener("click", (e) => {
  const btn = e.target.closest(".aisle");
  if (!btn) return;
  aisles.querySelectorAll(".aisle").forEach(a => a.classList.remove("active"));
  btn.classList.add("active");
  renderProducts(btn.dataset.cat);
});

grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (btn) {
    addToCart(btn.dataset.id);
    return;
  }
  const card = e.target.closest(".card");
  if (card) openDetail(card.dataset.id);
});

function addToCart(id) {
  const item = cart.find(c => c.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  renderCart();
}

function renderCart() {
  const totalQty = cart.reduce((sum, c) => sum + c.qty, 0);
  cartCount.textContent = totalQty;

  cartItems.innerHTML = cart.map(c => {
    const p = products.find(p => p.id === c.id);
    return `
      <div class="cart-item">
        <span>${p.name}</span>
        <div class="cart-item__qty">
          <button data-id="${p.id}" data-delta="-1">−</button>
          ${c.qty}
          <button data-id="${p.id}" data-delta="1">+</button>
        </div>
      </div>
    `;
  }).join("") || "<p style='font-size:13px;color:#777;'>Aún no has agregado productos.</p>";

  const total = cart.reduce((sum, c) => {
    const p = products.find(p => p.id === c.id);
    return sum + p.price * c.qty;
  }, 0);
  cartTotal.textContent = money(total);
}

cartItems.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  changeQty(btn.dataset.id, Number(btn.dataset.delta));
});

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
}
function closeCartDrawer() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("open");
}

cartBtn.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartDrawer);
overlay.addEventListener("click", closeCartDrawer);

// ---------------------------------------------------------------
// DETALLE DE PRODUCTO
// ---------------------------------------------------------------
const detailModal = document.getElementById("detailModal");
const detailBody = document.getElementById("detailBody");
const closeDetail = document.getElementById("closeDetail");

function openDetail(id) {
  const p = products.find(p => p.id === id);
  if (!p) return;

  detailBody.innerHTML = `
    <div class="detail__img">${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}">` : (p.icon || "📦")}</div>
    <h2 class="detail__name">${p.name}</h2>
    <p class="detail__desc">${p.desc}</p>
    <div class="detail__footer">
      <span class="price-tag">${money(p.price)}</span>
      <button class="add-btn" data-id="${p.id}">Agregar</button>
    </div>
  `;
  detailModal.classList.add("open");
}

closeDetail.addEventListener("click", () => detailModal.classList.remove("open"));

detailBody.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  addToCart(btn.dataset.id);
  detailModal.classList.remove("open");
});

// ---------------------------------------------------------------
// NÚMERO DE WHATSAPP DEL NEGOCIO
// Reemplaza el placeholder por el número real, con código de país
// y sin espacios ni signos. Ejemplo México: "529611234567"
// ---------------------------------------------------------------
const WHATSAPP_NUMBER = "PON_AQUI_EL_NUMERO"; // <-- CAMBIAR AQUÍ

const addressModal = document.getElementById("addressModal");
const addressForm = document.getElementById("addressForm");
const cancelAddress = document.getElementById("cancelAddress");

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Agrega al menos un producto antes de continuar.");
    return;
  }
  addressModal.classList.add("open");
});

cancelAddress.addEventListener("click", () => {
  addressModal.classList.remove("open");
});

addressForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();

  const lines = cart.map(c => {
    const p = products.find(p => p.id === c.id);
    return `• ${p.name} x${c.qty} — ${money(p.price * c.qty)}`;
  });

  const total = cart.reduce((sum, c) => {
    const p = products.find(p => p.id === c.id);
    return sum + p.price * c.qty;
  }, 0);

  const message = [
    "Nuevo pedido:",
    "",
    ...lines,
    "",
    `Total: ${money(total)}`,
    "",
    `Cliente: ${name}`,
    `Teléfono: ${phone}`,
    `Dirección de entrega: ${address}`,
  ].join("\n");

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");

  addressModal.classList.remove("open");
});

renderProducts();
