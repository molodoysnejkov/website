
document.addEventListener("DOMContentLoaded", () => {
  // Елементи сторінки
  const productsContainer = document.querySelector("#productsContainer");
  const categoryList = document.querySelector("#categoryList");
  const searchInput = document.querySelector("#searchInput");
  const emptyMessage = document.querySelector("#emptyMessage");

  const cartCount = document.querySelector("#cartCount");
  const cartItems = document.querySelector("#cartItems");
  const cartTotal = document.querySelector("#cartTotal");
  const checkoutBtn = document.querySelector("#checkoutBtn");

  const checkoutForm = document.querySelector("#checkoutForm");
  const checkoutTotal = document.querySelector("#checkoutTotal");
  const successMessage = document.querySelector("#successMessage");
  const toastContainer = document.querySelector("#toastContainer");

  const cartPanelElement = document.querySelector("#cartPanel");
  const checkoutModalElement = document.querySelector("#checkoutModal");
  const successModalElement = document.querySelector("#successModal");

  const cartPanel = bootstrap.Offcanvas.getOrCreateInstance(cartPanelElement);
  const checkoutModal = bootstrap.Modal.getOrCreateInstance(checkoutModalElement);
  const successModal = bootstrap.Modal.getOrCreateInstance(successModalElement);

  const STORAGE_KEY = "chefWalterWhiteCart";

  let products = [];
  let cart = loadCart();
  let selectedCategory = "Усі";
  let searchQuery = "";

  // Завантаження збереженого кошика
  function loadCart() {
    try {
      const savedCart = JSON.parse(localStorage.getItem(STORAGE_KEY));

      if (!Array.isArray(savedCart)) {
        return [];
      }

      return savedCart
        .filter(item =>
          item &&
          Number.isInteger(item.id) &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0 &&
          item.quantity <= 99
        )
        .map(item => ({
          id: item.id,
          quantity: item.quantity
        }));
    } catch (error) {
      console.warn("Не вдалося прочитати кошик:", error);
      return [];
    }
  }

  // Збереження кошика
  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Не вдалося зберегти кошик:", error);
      showToast("Не вдалося зберегти кошик у браузері.");
    }
  }

  // Форматування цін у гривнях
  function formatPrice(price) {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
      maximumFractionDigits: 0
    }).format(price);
  }

  // Захист тексту перед вставленням в HTML
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  // Завантаження меню з локального JSON
  async function loadProducts() {
    productsContainer.innerHTML = `
      <div class="col-12 text-center loading-message">
        Завантажуємо меню...
      </div>
    `;

    try {
      const response = await fetch("./data/products.json");

      if (!response.ok) {
        throw new Error("Не вдалося завантажити файл меню.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Файл меню має неправильний формат.");
      }

      // Перевіряємо дані, отримані з JSON
      products = data.filter(product =>
        Number.isInteger(product.id) &&
        typeof product.name === "string" &&
        typeof product.description === "string" &&
        typeof product.category === "string" &&
        Number.isFinite(product.price) &&
        product.price >= 0 &&
        typeof product.image === "string" &&
        /^https:\/\//i.test(product.image)
      );

      // Відновлюємо лише ті товари, які є в меню
      cart = cart.filter(item =>
        products.some(product => product.id === item.id)
      );

      saveCart();
      renderCategories();
      renderProducts();
      renderCart();
    } catch (error) {
      console.error("Помилка завантаження меню:", error);

      productsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="text-warning">
            Не вдалося завантажити меню.
          </p>
          <p class="text-secondary">
            Перевірте, чи запущено Live Server і чи існує
            файл data/products.json.
          </p>
          <button class="btn btn-gold" id="retryBtn">
            Спробувати ще раз
          </button>
        </div>
      `;
    }
  }

  // Створення кнопок категорій
  function renderCategories() {
    const categories = [
      "Усі",
      ...new Set(products.map(product => product.category))
    ];

    categoryList.innerHTML = categories.map(category => `
      <button
        type="button"
        class="category-btn ${selectedCategory === category ? "active" : ""}"
        data-category="${escapeHTML(category)}"
        aria-pressed="${selectedCategory === category}"
      >
        ${escapeHTML(category)}
      </button>
    `).join("");
  }

  // Пошук і фільтрація товарів
  function getFilteredProducts() {
    return products.filter(product => {
      const matchesCategory =
        selectedCategory === "Усі" ||
        product.category === selectedCategory;

      const query = searchQuery.toLocaleLowerCase("uk-UA");

      const matchesSearch =
        product.name.toLocaleLowerCase("uk-UA").includes(query) ||
        product.description.toLocaleLowerCase("uk-UA").includes(query) ||
        product.category.toLocaleLowerCase("uk-UA").includes(query);

      return matchesCategory && matchesSearch;
    });
  }

  // Генерація карток товарів через JavaScript
  function renderProducts() {
    const filteredProducts = getFilteredProducts();

    emptyMessage.classList.toggle("d-none", filteredProducts.length > 0);

    if (filteredProducts.length === 0) {
      productsContainer.innerHTML = "";
      return;
    }

    productsContainer.innerHTML = filteredProducts.map(product => `
      <div class="col-12 col-sm-6 col-lg-4">
        <article class="product-card">
          <div class="product-image-wrap">
            <img
              class="product-image"
              src="${escapeHTML(product.image)}"
              alt="${escapeHTML(product.name)}"
              loading="lazy"
            >
            ${product.badge ? `
              <span class="product-badge">
                ${escapeHTML(product.badge)}
              </span>
            ` : ""}
          </div>

          <div class="product-body">
            <span class="product-category">
              ${escapeHTML(product.category)}
            </span>

            <h3 class="product-title">
              ${escapeHTML(product.name)}
            </h3>

            <p class="product-description">
              ${escapeHTML(product.description)}
            </p>

            <div class="product-bottom">
              <span class="product-price">
                ${formatPrice(product.price)}
              </span>

              <button
                type="button"
                class="btn btn-gold add-to-cart"
                data-add="${product.id}"
              >
                + До кошика
              </button>
            </div>
          </div>
        </article>
      </div>
    `).join("");

    // Якщо окрема фотографія не завантажилася
    productsContainer.querySelectorAll(".product-image").forEach(image => {
      image.addEventListener("error", () => {
        image.style.visibility = "hidden";
        image.alt = "Фотографія тимчасово недоступна";
      }, { once: true });
    });
  }

  // Додавання товару до кошика
  function addToCart(id) {
    const product = products.find(item => item.id === id);

    if (!product) return;

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
      if (existingItem.quantity >= 99) {
        showToast("Максимальна кількість однієї страви — 99.");
        return;
      }

      existingItem.quantity += 1;
    } else {
      cart.push({ id, quantity: 1 });
    }

    saveCart();
    renderCart();
    showToast(`«${product.name}» додано до кошика.`);
  }

  // Зміна кількості товару
  function changeQuantity(id, change) {
    const item = cart.find(entry => entry.id === id);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
      cart = cart.filter(entry => entry.id !== id);
    } else if (item.quantity > 99) {
      item.quantity = 99;
      showToast("Максимальна кількість однієї страви — 99.");
    }

    saveCart();
    renderCart();
  }

  // Видалення товару
  function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
    showToast("Страву видалено з кошика.");
  }

  // Загальна кількість товарів
  function getCartCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Загальна сума кошика
  function getCartTotal() {
    return cart.reduce((sum, item) => {
      const product = products.find(product => product.id === item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  // Відображення кошика
  function renderCart() {
    cartCount.textContent = getCartCount();
    cartTotal.textContent = formatPrice(getCartTotal());
    checkoutTotal.textContent = formatPrice(getCartTotal());

    checkoutBtn.disabled = cart.length === 0;

    if (cart.length === 0) {
      cartItems.innerHTML = `
        <p class="cart-empty">Ваш кошик поки порожній.</p>
      `;
      return;
    }

    cartItems.innerHTML = cart.map(item => {
      const product = products.find(product => product.id === item.id);

      if (!product) return "";

      return `
        <article class="cart-item">
          <img
            class="cart-item-image"
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
          >

          <div>
            <h3 class="cart-item-name">
              ${escapeHTML(product.name)}
            </h3>

            <div class="cart-item-price">
              ${formatPrice(product.price * item.quantity)}
            </div>

            <div class="cart-item-controls">
              <button
                type="button"
                class="quantity-btn"
                data-change="-1"
                data-id="${product.id}"
                aria-label="Зменшити кількість"
              >−</button>

              <span class="quantity-value">${item.quantity}</span>

              <button
                type="button"
                class="quantity-btn"
                data-change="1"
                data-id="${product.id}"
                aria-label="Збільшити кількість"
              >+</button>

              <button
                type="button"
                class="remove-item"
                data-remove="${product.id}"
              >
                Видалити
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    cartItems.querySelectorAll(".cart-item-image").forEach(image => {
      image.addEventListener("error", () => {
        image.style.visibility = "hidden";
      }, { once: true });
    });
  }

  // Повідомлення користувачеві
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "custom-toast mb-2";
    toast.setAttribute("role", "status");
    toast.textContent = message;

    toastContainer.appendChild(toast);

    window.setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Фільтрація за категоріями
  categoryList.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");

    if (!button) return;

    selectedCategory = button.dataset.category;
    renderCategories();
    renderProducts();
  });

  // Пошук страв
  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim();
    renderProducts();
  });

  // Додавання страв через делегування подій
  productsContainer.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");

    if (!button) {
      if (event.target.closest("#retryBtn")) {
        loadProducts();
      }
      return;
    }

    addToCart(Number(button.dataset.add));
  });

  // Кнопки кількості та видалення в кошику
  cartItems.addEventListener("click", event => {
    const quantityButton = event.target.closest("[data-change]");
    const removeButton = event.target.closest("[data-remove]");

    if (quantityButton) {
      changeQuantity(
        Number(quantityButton.dataset.id),
        Number(quantityButton.dataset.change)
      );
    }

    if (removeButton) {
      removeFromCart(Number(removeButton.dataset.remove));
    }
  });

  // Відкриття форми оформлення замовлення
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;

    checkoutTotal.textContent = formatPrice(getCartTotal());

    cartPanelElement.addEventListener("hidden.bs.offcanvas", () => {
      checkoutModal.show();
    }, { once: true });

    cartPanel.hide();
  });

  // Підтвердження замовлення
  checkoutForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!checkoutForm.reportValidity()) return;

    if (cart.length === 0) {
      checkoutModal.hide();
      showToast("Ваш кошик порожній.");
      return;
    }

    const formData = new FormData(checkoutForm);

    const customerName = String(formData.get("name") || "").trim();
    const customerPhone = String(formData.get("phone") || "").trim();
    const customerAddress = String(formData.get("address") || "").trim();

    if (
      customerName.length < 2 ||
      customerPhone.length < 10 ||
      customerAddress.length < 5
    ) {
      showToast("Перевірте правильність введених даних.");
      return;
    }

    // Формуємо навчальне замовлення перед очищенням кошика
    const order = {
      number: `WW-${Date.now()}`,
      customer: customerName,
      phone: customerPhone,
      address: customerAddress,
      comment: String(formData.get("comment") || "").trim(),
      items: cart.map(item => {
        const product = products.find(p => p.id === item.id);

        return {
          name: product.name,
          price: product.price,
          quantity: item.quantity
        };
      }),
      total: getCartTotal(),
      createdAt: new Date().toISOString()
    };

    // Замовлення зберігається локально, без сервера
    try {
      const previousOrders = JSON.parse(
        localStorage.getItem("chefWalterWhiteOrders") || "[]"
      );

      const orders = Array.isArray(previousOrders) ? previousOrders : [];
      orders.push(order);

      localStorage.setItem(
        "chefWalterWhiteOrders",
        JSON.stringify(orders)
      );
    } catch (error) {
      console.error("Не вдалося зберегти історію замовлень:", error);
    }

    // Очищуємо кошик після підтвердження
    cart = [];
    saveCart();
    renderCart();
    checkoutForm.reset();

    successMessage.textContent =
      `Дякуємо, ${customerName}! Номер вашого замовлення: ${order.number}.`;

    checkoutModalElement.addEventListener("hidden.bs.modal", () => {
      successModal.show();
    }, { once: true });

    checkoutModal.hide();
  });

  // Запуск застосунку
  loadProducts();
});
