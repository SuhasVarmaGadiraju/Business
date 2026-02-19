// CONFIGURATION
const OWNER_NUMBER = "919652131224"; // Use this number ONLY (include country code without +)
console.log("Script version: Mango Added v2");

// PICKLE DATA
const pickles = [
    // Veg Pickles
    { name: "Mango Pickle", price: 450, image: "images/mango_pickle.jpg" },
    { name: "Allam Pickle", price: 300, image: "images/Allam Pickle.jpg" },
    { name: "Gongura Pickle", price: 300, image: "images/Gongura Pickle.jpeg" },
    { name: "Tomato Pickle", price: 300, image: "images/Tomato Pickle.jpeg" },

    // Non-Veg Pickles
    { name: "Korameenu Pickle", price: 1100, image: "images/Korameenu pickle.jpg" },
    { name: "Prawns(Large) Pickle", price: 1300, image: "images/Prawns Pickle.jpeg" },
    { name: "Prawns(Small) Pickle", price: 1100, image: "images/Prawns Pickle.jpeg" },
    { name: "Natukodi Pickle", price: 1200, image: "images/Natukodi Pickle.jpeg" },
    { name: "Mutton Boneless Pickle", price: 1500, image: "images/Mutton boneless Pickle.webp" },
    { name: "Chicken Bone Pickle", price: 800, image: "images/Chicken Bone Pickle.jpg" },
    { name: "Chicken Boneless Pickle", price: 1000, image: "images/Chicken Boneless.jpeg" }
];

// CART STATE
let cart = {};

document.addEventListener("DOMContentLoaded", () => {
    // Check which page we are on
    if (document.getElementById("pickle-grid")) {
        // We are on order-pickles
        loadOrderPage();
        // Persist cart: Removed force clear
        // localStorage.clear();
        loadCartFromStorage(); // Make sure to load existing cart!
        // cart = {}; // Don't reset cart object
        updateNavbarCartCount();
    } else if (document.getElementById("summary-list")) {
        // We are on summary.html
        loadSummaryPage();
    }

    // Responsive Navbar Toggle
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        }));
    }
});

// --- ORDER PAGE LOGIC ---

window.loadOrderPage = function () {
    console.log("Starting loadOrderPage...");
    try {
        const container = document.getElementById("pickle-grid");
        if (!container) {
            console.error("Order page container #pickle-grid not found!");
            return;
        }
        container.innerHTML = '<div style="text-align:center; padding:20px;">Loading pickles...</div>';
        setTimeout(() => {
            try {
                container.className = "store-container";

                // Add Tabs and Main Grid Container
                const tabsHTML = `
        <div class="category-tabs">
            <button class="tab-btn active" onclick="filterCategory('all')">All</button>
            <button class="tab-btn" onclick="filterCategory('veg')">Veg 🌿</button>
            <button class="tab-btn" onclick="filterCategory('non-veg')">Non-Veg 🍗</button>
        </div>
        <div id="products-area" class="pickle-grid">
            <!-- Items injected here -->
        </div>
    `;
                container.innerHTML = tabsHTML;

                // Define Categories
                const vegNames = ["Mango Pickle", "Allam Pickle", "Gongura Pickle", "Tomato Pickle"];
                const vegPickles = pickles.filter(p => vegNames.includes(p.name));
                const nonVegPickles = pickles.filter(p => !vegNames.includes(p.name));

                // Enhanced Grid Generator
                window.generateGrid = (items) => {
                    return items.map(pickle => {
                        return `
            <div class="card" data-name="${pickle.name}" data-price="${pickle.price}">
                <div class="card-img-wrapper">
                    <img src="${pickle.image}" alt="${pickle.name}" class="card-img">
                </div>
                <div class="card-body">
                    <div class="card-header-row">
                        <h3 class="card-title">${pickle.name}</h3>
                        <div class="price-badge">₹${pickle.price}/Kg</div>
                    </div>
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label style="font-size: 0.85rem; font-weight: 600; color: #666; margin-bottom: 5px; display: block;">Select Quantity:</label>
                        <select class="form-control qty-select">
                            <option value="0">Select (0 Kg)</option>
                            <option value="1">1 Kg</option>
                            <option value="2">2 Kg</option>
                            <option value="3">3 Kg</option>
                            <option value="4">4 Kg</option>
                            <option value="5">5 Kg</option>
                        </select>
                    </div>
                    <button class="btn btn-add-to-cart" onclick="addToCart(this)">Add to Cart</button>
                </div>
            </div>`;
                    }).join('');
                };

                // Filter Function
                window.filterCategory = (category) => {
                    const productsArea = document.getElementById('products-area');
                    const buttons = document.querySelectorAll('.tab-btn');

                    // Update Buttons Styling
                    buttons.forEach(btn => {
                        btn.style.background = 'white';
                        btn.style.color = '#333';
                        btn.style.border = '2px solid #e0e0e0';
                    });

                    // Highlight active button
                    const activeBtn = Array.from(buttons).find(b =>
                        b.innerText.toLowerCase().includes(category === 'all' ? 'all' : category === 'veg' ? 'veg' : 'non') &&
                        (category !== 'veg' || !b.innerText.includes('Non'))
                    );
                    if (activeBtn) {
                        activeBtn.style.background = '#ff7043';
                        activeBtn.style.color = 'white';
                        activeBtn.style.border = 'none';
                    }

                    // Render Content with Fade
                    productsArea.style.opacity = '0';
                    setTimeout(() => {
                        let itemsToShow = [];
                        if (category === 'all') itemsToShow = pickles; // Show all mixed
                        else if (category === 'veg') itemsToShow = vegPickles;
                        else if (category === 'non-veg') itemsToShow = nonVegPickles;

                        productsArea.innerHTML = window.generateGrid(itemsToShow);
                        productsArea.style.opacity = '1';
                    }, 200);
                };

                // Initial Render: Trigger 'all' view to show combined list
                setTimeout(() => filterCategory('all'), 0);

            } catch (err) {
                console.error("Store render error:", err);
                const grid = document.getElementById("pickle-grid");
                if (grid) grid.innerHTML = `<div style="color:red; padding:20px; text-align:center;">Error loading store: ${err.message}</div>`;
            }
        }, 50);
    } catch (e) {
        console.error("Critical initialization error:", e);
    }
};


window.addToCart = (btn) => {
    const card = btn.closest('.card');
    const name = card.dataset.name;
    const price = parseInt(card.dataset.price);
    const select = card.querySelector('.qty-select');
    const qty = parseInt(select.value);

    if (qty <= 0) {
        showToast("Please select quantity.", "removed");
        return;
    }

    // Add or Update Cart
    if (cart[name]) {
        cart[name].qty += qty;
    } else {
        cart[name] = { price: price, qty: qty };
    }

    // UI Feedback: Button text change
    const originalText = btn.innerText;
    btn.innerText = "Added ✓";
    btn.classList.add('btn-added'); // Use class for styling if needed
    btn.disabled = true;

    // Reset Dropdown
    select.value = "0";

    // Revert button after 1.5s
    setTimeout(() => {
        btn.innerText = originalText;
        btn.classList.remove('btn-added');
        btn.disabled = false;
    }, 1500);

    // Save and Update
    saveCartToStorage();
    updateNavbarCartCount();
    showToast(`${name} added to cart!`, "added");
};

/* Mini Cart Sidebar Logic */
let cartTimer = null; // Global timer variable

function toggleCart(show) {
    let sidebar = document.getElementById('cart-sidebar');
    if (!sidebar) {
        // Create sidebar if it doesn't exist
        sidebar = document.createElement('div');
        sidebar.id = 'cart-sidebar';
        sidebar.className = 'cart-sidebar';

        // Initial HTML structure
        sidebar.innerHTML = `
            <div class="cart-header">
                <h3>Shopping Cart</h3>
                <button type="button" class="close-cart" onclick="toggleCart(false)">×</button>
            </div>
            <div class="cart-items"></div>
            <div class="cart-footer"></div>
        `;
        document.body.appendChild(sidebar);
    }

    // Clear any existing timer
    if (cartTimer) {
        clearTimeout(cartTimer);
        cartTimer = null;
    }

    if (show) {
        sidebar.classList.add('active');
        updateMiniCart();

        // 1. CLEAR existing timer on show (so we restart the countdown)
        if (cartTimer) {
            clearTimeout(cartTimer);
            cartTimer = null;
        }

        // 2. Start new timer
        cartTimer = setTimeout(() => {
            toggleCart(false);
        }, 3000);

        // Re-attach listeners every time to be safe? 
        // No, if we attach them to 'sidebar' element, they persist. 
        // BUT, if sidebar is re-created or innerHTML is wiped, they might be lost?
        // Wait, innerHTML is set ONLY on creation or in updateMiniCart?
        // updateMiniCart sets innerHTML, which WIPES listeners attached to children, but NOT the sidebar itself.
        // HOWEVER, onmouseenter etc are attached to sidebar object. That should be fine.

        // Let's debug: Maybe mouse is already over it?

        sidebar.onmouseenter = () => {
            console.log("Mouse enter - pausing timer");
            if (cartTimer) {
                clearTimeout(cartTimer);
                cartTimer = null;
            }
        };

        sidebar.onmouseleave = () => {
            console.log("Mouse leave - resuming timer");
            if (cartTimer) clearTimeout(cartTimer);
            cartTimer = setTimeout(() => {
                toggleCart(false);
            }, 3000);
        };

        // 5. Click outside (simple version)
        // Note: Ideally this listener should be added once, but strictly per request scope:
        document.onclick = function (e) {
            if (sidebar.classList.contains('active') &&
                !sidebar.contains(e.target) &&
                !e.target.closest('.card') &&
                !e.target.closest('.qty-btn-mini')) {
                toggleCart(false);
            }
        };

    } else {
        sidebar.classList.remove('active');
    }
}

function updateMiniCart() {
    let sidebar = document.getElementById('cart-sidebar');
    if (!sidebar) return;

    let itemsHtml = '';
    let total = 0;
    let itemCount = Object.keys(cart).length;

    // Header
    const headerHtml = `
        <div class='cart-header'>
            <h3>Shopping Cart (${itemCount})</h3>
            <button class='close-cart' onclick='toggleCart(false)'>×</button>
        </div>
    `;

    if (itemCount === 0) {
        itemsHtml = '<div style="text-align:center; margin-top:50px; color:#999;">Your cart is empty</div>';
    } else {
        for (const [name, item] of Object.entries(cart)) {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            itemsHtml += `
                <div class="cart-item-row">
                    <div class="cart-item-info">
                        <h4>${name}</h4>
                        <div class="qty-controls">
                            <button class="qty-btn-mini" onclick="changeCartQty('${name}', -1)">−</button>
                            <span class="qty-display">${item.qty} Kg</span>
                            <button class="qty-btn-mini" onclick="changeCartQty('${name}', 1)">+</button>
                        </div>
                    </div>
                    <div class="cart-item-price">₹${itemTotal}</div>
                </div>
            `;
        }
    }

    sidebar.innerHTML = `
        ${headerHtml}
        <div class="cart-items">
            ${itemsHtml}
        </div>
        <div class="cart-footer">
            <div class="cart-total-row">
                <span>Total:</span>
                <span>₹${total}</span>
            </div>
            ${itemCount > 0 ? '<button onclick="goToSummary()" class="btn-checkout">Checkout →</button>' : ''}
        </div>
    `;
}

function changeCartQty(name, change) {
    if (!cart[name]) return;

    const newQty = cart[name].qty + change;

    if (newQty <= 0) {
        delete cart[name];
    } else {
        cart[name].qty = newQty;
    }

    saveCartToStorage();
    updateMiniCart();
    updateNavbarCartCount();
}

function updateNavbarCartCount() {
    // Calculate total items (sum of quantities or just number of unique items?)
    // User said "show the numbers on the cart and increase it as i go on add". 
    // Usually total items (qty sum) is better for "increase as I add". 
    // But if I add 2kg, does count go up by 1 or 2? Typical e-com is Qty sum.
    // Let's do Unique Items count first as per previous design "x items selected", 
    // or Qty sum? "increase it as i go on add" implies Qty sum.
    // Let's stick to unique items count to match "3 items selected" text used before, 
    // unless user complains. Actually, let's do unique items count.

    const count = Object.keys(cart).length;
    // OR if we want total quantity:
    // let count = 0; for(let k in cart) count += cart[k].qty;

    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        badge.innerText = count;
        // Animation bump
        badge.classList.remove('bump');
        void badge.offsetWidth; // trigger reflow
        badge.classList.add('bump');
    });
}

// REMOVED: updateFloatingBar logic because user requested removal.
function updateFloatingBar() {
    // No-op or remove element if exists
    const bar = document.getElementById('floating-bar');
    if (bar) bar.remove();
}

function saveCartToStorage() {
    localStorage.setItem('pickleCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const storedCart = localStorage.getItem('pickleCart');
    if (storedCart) {
        cart = JSON.parse(storedCart);

        // Restore dropdown values
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const name = card.dataset.name;
            if (cart[name]) {
                const select = card.querySelector('.qty-select');
                if (select) {
                    select.value = cart[name].qty;
                }
            }
        });
        updateNavbarCartCount();
    }
}

function goToSummary() {
    if (Object.keys(cart).length === 0) {
        alert("Please select at least one pickle!");
        return;
    }
    window.location.href = "summary.html";
}

// --- SUMMARY PAGE LOGIC ---

function loadSummaryPage() {
    const storedCart = localStorage.getItem('pickleCart');
    let cartIsEmpty = true;

    if (storedCart) {
        cart = JSON.parse(storedCart);
        if (Object.keys(cart).length > 0) {
            cartIsEmpty = false;
        }
    }

    if (cartIsEmpty) {
        const summaryCard = document.querySelector('.summary-card');
        if (summaryCard) {
            summaryCard.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">🛒</div>
                    <h2 style="margin-bottom: 10px; color: var(--text-dark);">Your cart is empty</h2>
                    <p style="color: var(--text-light); margin-bottom: 30px;">You haven’t added any pickles yet.</p>
                    <a href="/order-pickles" class="btn" style="display: inline-block;">Go to Menu</a>
                </div>
            `;
        }
        return;
    }


    const summaryList = document.getElementById('summary-list');

    // UI Elements for Calculations
    const subtotalDisplay = document.getElementById('subtotal-price');
    const discountRow = document.getElementById('discount-row');
    const discountPercentDisplay = document.getElementById('discount-percent');
    const discountAmountDisplay = document.getElementById('discount-amount');
    const offerMessage = document.getElementById('offer-message');
    const totalDisplay = document.getElementById('total-price');

    const orderBtn = document.getElementById('place-order-btn');

    if (!summaryList) return;

    let html = "";
    let subtotal = 0;

    for (const [name, item] of Object.entries(cart)) {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        html += `
            <div class="summary-item">
                <div style="flex:1">
                    <div class="summary-item-name">${name}</div>
                    <div class="summary-item-details">₹${item.price}/Kg</div>
                </div>
                <div class="summary-qty-row">
                    <div class="qty-stepper">
                        <button class="qty-btn-icon" onclick="removeFromCart('${name}')">🗑️</button>
                        <button class="qty-btn-minus" onclick="updateSummaryQty('${name}', -1)">−</button>
                        <span class="qty-value-text">${item.qty} Kg</span>
                        <button class="qty-btn-plus" onclick="updateSummaryQty('${name}', 1)">+</button>
                    </div>
                </div>
                <div class="item-total-price" style="text-align: right; margin-top: 5px;">₹${itemTotal}</div>
            </div>
        `;
    }

    summaryList.innerHTML = html;

    const finalTotal = subtotal;

    if (totalDisplay) totalDisplay.textContent = `₹${finalTotal}`;

    // Update Button Text
    orderBtn.innerHTML = "Confirm & Order on WhatsApp";

    // Setup WhatsApp Button
    orderBtn.onclick = () => {
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const address = document.getElementById('customer-address').value.trim();

        if (!name || !phone) {
            alert("Please provide your Name and Phone Number.");
            return;
        }

        if (!address) {
            alert("Please enter your delivery address.");
            return;
        }

        let message = "New Pickle Order:\n\n";
        for (const [itemName, item] of Object.entries(cart)) {
            message += `${itemName} - ${item.qty} Kg - ₹${item.price * item.qty}\n`;
        }

        message += `\nTotal: ₹${finalTotal}`;

        message += `\n\nName: ${name}\nPhone: ${phone}\nAddress:\n${address}`;

        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${OWNER_NUMBER}?text=${encodedMessage}`;
        window.open(url, "_blank");

        // Optional: Clear cart after order? 
        // localStorage.removeItem('pickleCart'); 
    };



}

/* Toast Notification Logic */
function showToast(message, type) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;

    const icon = type === 'added' ? '✅' : '🗑️';

    toast.innerHTML = '<span style="margin-right:10px; font-size:1.2rem;">' + icon + '</span><span>' + message + '</span>';

    container.appendChild(toast);

    // Remove element after animation (3s)
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

window.updateSummaryQty = (name, change) => {
    if (!cart[name]) return;

    const newQty = cart[name].qty + change;
    if (newQty <= 0) {
        if (confirm(`Remove ${name} from cart?`)) {
            delete cart[name];
        }
    } else {
        cart[name].qty = newQty;
    }

    saveCartToStorage();
    updateNavbarCartCount();
    loadSummaryPage(); // Re-render
};

window.removeFromCart = (name) => {
    if (confirm(`Remove ${name} from cart?`)) {
        delete cart[name];
        saveCartToStorage();
        updateNavbarCartCount();
        loadSummaryPage(); // Re-render
    }
};

