document.addEventListener("DOMContentLoaded", () => {
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

    const STORAGE_KEY = "chefWalterWhiteCart";

    const products = [
        {
            id: 1,
            name: "Класичний бургер",
            description: "Яловича котлета, сир, салат, помідори та фірмовий соус.",
            price: 189,
            category: "Бургери",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
            badge: "Хіт продажів"
        },
        {
            id: 2,
            name: "Чізбургер",
            description: "Соковита котлета, подвійний сир, огірки та соус.",
            price: 209,
            category: "Бургери",
            image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600",
            badge: "Популярне"
        },
        {
            id: 3,
            name: "Подвійний бургер",
            description: "Дві яловичі котлети, сир чедер і свіжі овочі.",
            price: 269,
            category: "Бургери",
            image: "https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=600",
            badge: ""
        },
        {
            id: 4,
            name: "Бургер BBQ",
            description: "Яловича котлета, бекон, сир і соус барбекю.",
            price: 239,
            category: "Бургери",
            image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600",
            badge: "Новинка"
        },
        {
            id: 5,
            name: "Картопля фрі",
            description: "Золотиста хрустка картопля з сіллю.",
            price: 79,
            category: "Закуски",
            image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600",
            badge: ""
        },
        {
            id: 6,
            name: "Картопля по-селянськи",
            description: "Запечені картопляні часточки з ароматними спеціями.",
            price: 89,
            category: "Закуски",
            image: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=600",
            badge: ""
        },
        {
            id: 7,
            name: "Курячі нагетси",
            description: "Хрусткі нагетси з курячого філе та соус.",
            price: 119,
            category: "Закуски",
            image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600",
            badge: ""
        },
        {
            id: 8,
            name: "Піца Пепероні",
            description: "Моцарела, томатний соус і гостра пепероні.",
            price: 249,
            category: "Піца",
            image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600",
            badge: "Популярне"
        },
        {
            id: 9,
            name: "Піца Маргарита",
            description: "Моцарела, томатний соус і свіжий базилік.",
            price: 219,
            category: "Піца",
            image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
            badge: ""
        },
        {
            id: 10,
            name: "Хот-дог",
            description: "Соковита сосиска в булочці з кетчупом і гірчицею.",
            price: 109,
            category: "Хот-доги",
            image: "https://images.unsplash.com/photo-1612392062126-2f1b3b5b9e8e?w=600",
            badge: ""
        },
        {
            id: 11,
            name: "Кола",
            description: "Охолоджений газований напій.",
            price: 45,
            category: "Напої",
            image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600",
            badge: ""
        },
        {
            id: 12,
            name: "Апельсиновий сік",
            description: "Освіжаючий сік із насиченим цитрусовим смаком.",
            price: 65,
            category: "Напої",
            image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600",
            badge: ""
        },
        {
            id: 13,
            name: "Молочний коктейль",
            description: "Ніжний коктейль із молока та морозива.",
            price: 99,
            category: "Напої",
            image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600",
            badge: "Новинка"
        },
        {
            id: 14,
            name: "Чізкейк",
            description: "Ніжний вершковий десерт із хрусткою основою.",
            price: 119,
            category: "Десерти",
            image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600",
            badge: ""
        },
        {
            id: 15,
            name: "Шоколадний брауні",
            description: "Насичений шоколадний десерт із ніжною текстурою.",
            price: 99,
            category: "Десерти",
            image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600",
            badge: ""
        }
    ];

    let cart = loadCart();
    let selectedCategory = "Усі";
    let searchQuery = "";

    const cartPanel = bootstrap.Offcanvas.getOrCreateInstance(cartPanelElement);
    const checkoutModal = bootstrap.Modal.getOrCreateInstance(checkoutModalElement);
    const successModal = bootstrap.Modal.getOrCreateInstance(successModalElement);

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
        } catch {
            return [];
        }
    }

    function saveCart() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error("Не вдалося зберегти кошик:", error);
            showToast("Не вдалося зберегти кошик.");
        }
    }

    function formatPrice(price) {
        return new Intl.NumberFormat("uk-UA", {
            style: "currency",
            currency: "UAH",
            maximumFractionDigits: 0
        }).format(price);
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

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

    function renderProducts() {
        const filteredProducts = getFilteredProducts();

        emptyMessage.classList.toggle(
            "d-none",
            filteredProducts.length > 0
        );

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

        productsContainer.querySelectorAll(".product-image").forEach(image => {
            image.addEventListener("error", () => {
                image.style.visibility = "hidden";
                image.alt = "Фотографія тимчасово недоступна";
            }, { once: true });
        });
    }

    function addToCart(id) {
        const product = products.find(item => item.id === id);

        if (!product) return;

        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            if (existingItem.quantity >= 99) {
                showToast("Максимальна кількість — 99.");
                return;
            }

            existingItem.quantity++;
        } else {
            cart.push({
                id: id,
                quantity: 1
            });
        }

        saveCart();
        renderCart();
        showToast(`«${product.name}» додано до кошика.`);
    }

    function changeQuantity(id, change) {
        const item = cart.find(entry => entry.id === id);

        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            cart = cart.filter(entry => entry.id !== id);
        }

        if (item.quantity > 99) {
            item.quantity = 99;
            showToast("Максимальна кількість — 99.");
        }

        saveCart();
        renderCart();
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);

        saveCart();
        renderCart();

        showToast("Страву видалено з кошика.");
    }

    function getCartCount() {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function getCartTotal() {
        return cart.reduce((sum, item) => {
            const product = products.find(product => product.id === item.id);

            return sum + (product ? product.price * item.quantity : 0);
        }, 0);
    }

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
                            >−</button>

                            <span class="quantity-value">
                                ${item.quantity}
                            </span>

                            <button
                                type="button"
                                class="quantity-btn"
                                data-change="1"
                                data-id="${product.id}"
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

    function showToast(message) {
        const toast = document.createElement("div");

        toast.className = "custom-toast mb-2";
        toast.setAttribute("role", "status");
        toast.textContent = message;

        toastContainer.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    categoryList.addEventListener("click", event => {
        const button = event.target.closest("[data-category]");

        if (!button) return;

        selectedCategory = button.dataset.category;

        renderCategories();
        renderProducts();
    });

    searchInput.addEventListener("input", () => {
        searchQuery = searchInput.value.trim();
        renderProducts();
    });

    productsContainer.addEventListener("click", event => {
        const button = event.target.closest("[data-add]");

        if (!button) return;

        addToCart(Number(button.dataset.add));
    });

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

    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) return;

        checkoutTotal.textContent = formatPrice(getCartTotal());

        cartPanelElement.addEventListener("hidden.bs.offcanvas", () => {
            checkoutModal.show();
        }, { once: true });

        cartPanel.hide();
    });

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

        try {
            const previousOrders = JSON.parse(
                localStorage.getItem("chefWalterWhiteOrders") || "[]"
            );

            const orders = Array.isArray(previousOrders)
                ? previousOrders
                : [];

            orders.push(order);

            localStorage.setItem(
                "chefWalterWhiteOrders",
                JSON.stringify(orders)
            );
        } catch (error) {
            console.error("Не вдалося зберегти замовлення:", error);
        }

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

    renderCategories();
    renderProducts();
    renderCart();
});
