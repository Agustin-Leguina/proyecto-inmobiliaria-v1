const phone = "5493492681453";

let properties = [];
let currentImages = [];
let currentIndex = 0;
let zoomed = false;
let searchTerm = "";

// ================= URLS WHATSAPP =================
const defaultMessage =
  "Hola, quiero consultar por una propiedad publicada en su catálogo.";
const defaultWhatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(defaultMessage)}`;

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {
  const whatsappBtn = document.getElementById("whatsappBtn");
  const ctaWhatsapp = document.getElementById("ctaWhatsapp");
  const heroWhatsapp = document.getElementById("heroWhatsapp");
  const input = document.getElementById("searchInput");
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  if (whatsappBtn) whatsappBtn.href = defaultWhatsappUrl;
  if (ctaWhatsapp) ctaWhatsapp.href = defaultWhatsappUrl;
  if (heroWhatsapp) heroWhatsapp.href = defaultWhatsappUrl;

  if (input) {
    input.addEventListener("input", (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      router();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (modal.style.display !== "block") return;

    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "Escape") closeModal();
  });

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (
        e.target.closest(".arrow") ||
        e.target.closest(".thumbnails") ||
        e.target.closest(".close") ||
        e.target.id === "modalImg"
      ) {
        return;
      }

      if (e.target === modal) {
        closeModal();
      }
    });
  }

  if (modalImg) {
    modalImg.addEventListener("dblclick", () => {
      zoomed = !zoomed;
      modalImg.style.transform = zoomed ? "scale(1.9)" : "scale(1)";
      modalImg.style.cursor = zoomed ? "zoom-out" : "zoom-in";
    });
  }
});

// ================= FETCH =================
fetch("https://opensheet.elk.sh/1vvNWs24KSHGR3C8exYHBQKUNc2vIKdQFpNs3ZHOOetA/1")
  .then((res) => res.json())
  .then((data) => {
    properties = data.map((p) => ({
      id: p.id || "",
      title: p.title || "Propiedad sin título",
      price: p.price || "Consultar precio",
      location: p.location || "Ubicación no disponible",
      type: p.type ? p.type.toLowerCase().trim() : "",
      description: p.description || "Sin descripción disponible",
      featured: normalizeFeaturedValue(p.featured),
      images: p.images
        ? p.images
            .split(",")
            .map((img) => img.trim())
            .filter((img) => img !== "")
        : []
    }));

    router();
  })
  .catch((err) => {
    console.error("Error al cargar propiedades:", err);

    const container = document.getElementById("container");
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No se pudieron cargar las propiedades</h3>
          <p>Revisá la URL de la planilla o intentá nuevamente más tarde.</p>
        </div>
      `;
    }
  });

// ================= NORMALIZAR DESTACADA =================
function normalizeFeaturedValue(value) {
  if (!value) return false;

  const normalized = String(value).toLowerCase().trim();
  return ["si", "sí", "yes", "true", "1", "destacada", "featured"].includes(normalized);
}

// ================= CLASE DEL BADGE =================
function getBadgeClass(type) {
  if (type === "venta") return "badge-sale";
  if (type === "alquiler") return "badge-rent";
  return "badge-default";
}

// ================= ROUTER =================
function navigate(type) {
  const input = document.getElementById("searchInput");

  searchTerm = "";
  if (input) input.value = "";

  window.location.hash = type;
}

function router() {
  const hash = window.location.hash.replace("#", "") || "all";

  setActiveFilter(hash);

  if (hash === "venta") render("venta");
  else if (hash === "alquiler") render("alquiler");
  else render("all");
}

window.addEventListener("hashchange", router);

function setActiveFilter(filter) {
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.filter === filter) {
      btn.classList.add("active");
    }
  });
}

// ================= CREAR CARD =================
function createCard(property) {
  const card = document.createElement("article");
  card.classList.add("card");

  const mainImage =
    property.images[0] || "https://via.placeholder.com/500x320?text=Sin+imagen";

  const operationText = property.type ? property.type.toUpperCase() : "CONSULTAR";

    const message = `Hola, vi esta publicación en su catálogo y quiero consultar:

    Propiedad: ${property.title}
    Ubicación: ${property.location}
    Precio: ${property.price}
    Operación: ${operationText}

    ¿Sigue disponible? Me interesa recibir más información.`;

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  card.innerHTML = `
    <div class="card-top">
      <div class="card-img">
        <img src="${mainImage}" alt="${property.title}">
      </div>

      <span class="badge ${getBadgeClass(property.type)}">
        ${operationText}
      </span>

      ${property.featured ? `<span class="badge-featured">Destacada</span>` : ""}
    </div>

    <div class="card-content">
      <h3>${property.title}</h3>
      <p class="desc">${property.description}</p>
      <p class="location">📍 ${property.location}</p>
      <p class="price">${property.price}</p>

      <div class="card-actions">
        <button class="btn-details" type="button">Ver Fotos</button>

    <button class="btn-wpp" type="button">
      Consultar esta propiedad
      <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp">
    </button>
      </div>
    </div>
  `;

  const openDetails = () => {
    if (property.images.length > 0) {
      openModal(property.images);
    } else {
      alert("Esta propiedad no tiene imágenes cargadas.");
    }
  };

  const cardImg = card.querySelector(".card-img");
  const detailsBtn = card.querySelector(".btn-details");
  const whatsappBtn = card.querySelector(".btn-wpp");

  if (cardImg) cardImg.addEventListener("click", openDetails);
  if (detailsBtn) detailsBtn.addEventListener("click", openDetails);

  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", () => {
      window.open(whatsappUrl, "_blank");
    });
  }

  return card;
}

// ================= RENDER =================
function render(filter) {
  const container = document.getElementById("container");
  const counter = document.getElementById("resultsCount");

  if (!container) return;

  container.innerHTML = "";

  let filtered = properties.filter((property) => {
    const matchesType = filter === "all" || property.type === filter;

    const fullText =
      `${property.title} ${property.location} ${property.description} ${property.type}`.toLowerCase();

    const matchesSearch = fullText.includes(searchTerm);

    return matchesType && matchesSearch;
  });

  filtered.sort((a, b) => Number(b.featured) - Number(a.featured));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No se encontraron propiedades</h3>
        <p>Probá con otra búsqueda o escribinos por WhatsApp para ayudarte personalmente.</p>
      </div>
    `;
  } else {
    filtered.forEach((property) => {
      container.appendChild(createCard(property));
    });
  }

  if (counter) {
    counter.textContent = `${filtered.length} propiedades encontradas`;
  }
}

// ================= MODAL =================
function openModal(images) {
  if (!images || images.length === 0) return;

  currentImages = images;
  currentIndex = 0;
  zoomed = false;

  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  if (!modal || !modalImg) return;

  modalImg.style.transform = "scale(1)";
  modalImg.style.cursor = "zoom-in";

  modal.style.display = "block";
  updateModal();
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.style.display = "none";
}

// ================= UPDATE MODAL =================
function updateModal() {
  const img = document.getElementById("modalImg");
  const thumbs = document.getElementById("thumbnails");
  const counter = document.getElementById("modalCounter");

  if (!img || !thumbs || !currentImages.length) return;

  img.src = currentImages[currentIndex];
  thumbs.innerHTML = "";

  if (counter) {
    counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
  }

  currentImages.forEach((src, i) => {
    const thumb = document.createElement("img");
    thumb.src = src;
    thumb.alt = `Miniatura ${i + 1}`;

    if (i === currentIndex) {
      thumb.classList.add("active");
    }

    thumb.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = i;
      resetZoom();
      updateModal();
    });

    thumbs.appendChild(thumb);
  });
}

// ================= NAVEGACION MODAL =================
function nextImage() {
  if (!currentImages.length) return;
  currentIndex = (currentIndex + 1) % currentImages.length;
  resetZoom();
  updateModal();
}

function prevImage() {
  if (!currentImages.length) return;
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  resetZoom();
  updateModal();
}

function resetZoom() {
  zoomed = false;
  const modalImg = document.getElementById("modalImg");
  if (!modalImg) return;

  modalImg.style.transform = "scale(1)";
  modalImg.style.cursor = "zoom-in";
}