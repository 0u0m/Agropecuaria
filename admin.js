const auth = firebase.auth();

// Solo esta cuenta puede administrar el catálogo
const CORREO_AUTORIZADO = "haloreach202@gmail.com";

const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const adminWrap = document.getElementById("adminWrap");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

// ---------- Acceso ----------
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  loginError.textContent = "";
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .catch(() => {
      loginError.textContent = "Correo o contraseña incorrectos.";
    });
});

logoutBtn.addEventListener("click", () => auth.signOut());

auth.onAuthStateChanged((user) => {
  if (user && user.email === CORREO_AUTORIZADO) {
    loginScreen.style.display = "none";
    adminWrap.style.display = "block";
    userEmail.textContent = user.email;
  } else if (user) {
    loginError.textContent = "Esta cuenta no tiene permiso para administrar el catálogo.";
    auth.signOut();
  } else {
    loginScreen.style.display = "flex";
    adminWrap.style.display = "none";
  }
});

// ---------- Formulario de producto ----------
const productForm = document.getElementById("productForm");
const formTitle = document.getElementById("formTitle");
const productId = document.getElementById("productId");
const pName = document.getElementById("pName");
const pDesc = document.getElementById("pDesc");
const pPrice = document.getElementById("pPrice");
const pCat = document.getElementById("pCat");
const pImage = document.getElementById("pImage");
const pImageFile = document.getElementById("pImageFile");
const uploadStatus = document.getElementById("uploadStatus");
const imagePreview = document.getElementById("imagePreview");
const pIcon = document.getElementById("pIcon");
const pFormula = document.getElementById("pFormula");
const pPresentaciones = document.getElementById("pPresentaciones");
const pDosis = document.getElementById("pDosis");
const pViaAdmin = document.getElementById("pViaAdmin");
const pTiempoRetiro = document.getElementById("pTiempoRetiro");
const pAdvertencias = document.getElementById("pAdvertencias");

// ---------------------------------------------------------------
// SUBIDA DE FOTOS (ImgBB — gratis, sin tarjeta)
// Consigue tu API key gratis en https://api.imgbb.com/ y pégala aquí.
// ---------------------------------------------------------------
const IMGBB_API_KEY = "837e0894bb15335b282db5c900baf20e";

pImageFile.addEventListener("change", async () => {
  const file = pImageFile.files[0];
  if (!file) return;

  uploadStatus.textContent = "Subiendo foto...";

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!data.success) throw new Error(data.error?.message || "Error desconocido");

    pImage.value = data.data.url;
    imagePreview.src = data.data.url;
    imagePreview.style.display = "block";
    uploadStatus.textContent = "Foto lista ✓";
  } catch (err) {
    uploadStatus.textContent = "Error al subir: " + err.message;
  }
});
const cancelEdit = document.getElementById("cancelEdit");
const adminList = document.getElementById("adminList");

function resetForm() {
  productForm.reset();
  productId.value = "";
  pImage.value = "";
  imagePreview.style.display = "none";
  uploadStatus.textContent = "";
  formTitle.textContent = "Agregar producto";
  cancelEdit.style.display = "none";
}

cancelEdit.addEventListener("click", resetForm);

productForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    name: pName.value.trim(),
    desc: pDesc.value.trim(),
    price: Number(pPrice.value),
    cat: pCat.value,
    imageUrl: pImage.value.trim(),
    icon: pIcon.value.trim() || "📦",
    formula: pFormula.value.trim(),
    presentaciones: pPresentaciones.value.trim(),
    dosis: pDosis.value.trim(),
    viaAdmin: pViaAdmin.value.trim(),
    tiempoRetiro: pTiempoRetiro.value.trim(),
    advertencias: pAdvertencias.value.trim(),
  };

  const id = productId.value;
  const promise = id
    ? db.collection("productos").doc(id).update(data)
    : db.collection("productos").add(data);

  promise.then(resetForm).catch((err) => alert("Error al guardar: " + err.message));
});

// ---------- Lista de productos ----------
const catLabels = {
  bovinos: "Bovinos",
  aves: "Aves",
  mascotas: "Mascotas",
  veterinario: "Insumos veterinarios",
};

db.collection("productos").onSnapshot((snapshot) => {
  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  adminList.innerHTML = items.map(p => `
    <div class="admin-row">
      <span class="admin-row__icon">${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" class="admin-row__thumb">` : (p.icon || "📦")}</span>
      <div class="admin-row__info">
        <strong>${p.name}</strong>
        <span>${catLabels[p.cat] || p.cat} · ${p.desc}</span>
      </div>
      <span class="admin-row__price">$${Number(p.price).toLocaleString("es-MX")}</span>
      <div class="admin-row__actions">
        <button data-edit="${p.id}">Editar</button>
        <button class="danger" data-del="${p.id}">Eliminar</button>
      </div>
    </div>
  `).join("") || "<p style='font-size:13px;color:#777;'>Aún no hay productos.</p>";

  adminList.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = items.find(i => i.id === btn.dataset.edit);
      productId.value = p.id;
      pName.value = p.name;
      pDesc.value = p.desc;
      pPrice.value = p.price;
      pCat.value = p.cat;
      pImage.value = p.imageUrl || "";
      if (p.imageUrl) {
        imagePreview.src = p.imageUrl;
        imagePreview.style.display = "block";
      } else {
        imagePreview.style.display = "none";
      }
      pIcon.value = p.icon || "";
      pFormula.value = p.formula || "";
      pPresentaciones.value = p.presentaciones || "";
      pDosis.value = p.dosis || "";
      pViaAdmin.value = p.viaAdmin || "";
      pTiempoRetiro.value = p.tiempoRetiro || "";
      pAdvertencias.value = p.advertencias || "";
      formTitle.textContent = "Editar producto";
      cancelEdit.style.display = "inline-block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  adminList.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("¿Eliminar este producto?")) {
        db.collection("productos").doc(btn.dataset.del).delete();
      }
    });
  });
});

// ---------- Zonas de envío ----------
const zonaForm = document.getElementById("zonaForm");
const zonaFormTitle = document.getElementById("zonaFormTitle");
const zonaId = document.getElementById("zonaId");
const zonaName = document.getElementById("zonaName");
const zonaPrice = document.getElementById("zonaPrice");
const cancelZonaEdit = document.getElementById("cancelZonaEdit");
const zonaList = document.getElementById("zonaList");

function resetZonaForm() {
  zonaForm.reset();
  zonaId.value = "";
  zonaFormTitle.textContent = "Agregar zona de envío";
  cancelZonaEdit.style.display = "none";
}

cancelZonaEdit.addEventListener("click", resetZonaForm);

zonaForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    name: zonaName.value.trim(),
    price: Number(zonaPrice.value),
  };

  const id = zonaId.value;
  const promise = id
    ? db.collection("zonas").doc(id).update(data)
    : db.collection("zonas").add(data);

  promise.then(resetZonaForm).catch((err) => alert("Error al guardar la zona: " + err.message));
});

db.collection("zonas").onSnapshot((snapshot) => {
  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  zonaList.innerHTML = items.map(z => `
    <div class="admin-row">
      <div class="admin-row__info">
        <strong>${z.name}</strong>
      </div>
      <span class="admin-row__price">$${Number(z.price).toLocaleString("es-MX")}</span>
      <div class="admin-row__actions">
        <button data-zona-edit="${z.id}">Editar</button>
        <button class="danger" data-zona-del="${z.id}">Eliminar</button>
      </div>
    </div>
  `).join("") || "<p style='font-size:13px;color:#777;'>Aún no hay zonas configuradas.</p>";

  zonaList.querySelectorAll("[data-zona-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const z = items.find(i => i.id === btn.dataset.zonaEdit);
      zonaId.value = z.id;
      zonaName.value = z.name;
      zonaPrice.value = z.price;
      zonaFormTitle.textContent = "Editar zona de envío";
      cancelZonaEdit.style.display = "inline-block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  zonaList.querySelectorAll("[data-zona-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("¿Eliminar esta zona de envío?")) {
        db.collection("zonas").doc(btn.dataset.zonaDel).delete();
      }
    });
  });
});
