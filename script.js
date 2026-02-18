// CONFIGURATION
const OWNER_NUMBER = "919652131224"; // Use this number ONLY (include country code without +)
console.log("Script version: Mango Added v2");

// PICKLE DATA
const pickles = [
    { name: "Korameenu Pickle", price: 1100, image: "images/Korameenu pickle.jpg" },
    { name: "Prawns Pickle (Large)", price: 1300, image: "images/Prawns Pickle.jpeg" },
    { name: "Prawns Pickle (Small)", price: 1100, image: "images/Prawns Pickle.jpeg" },
    { name: "Natukodi Pickle", price: 1200, image: "images/Natukodi Pickle.jpeg" },
    { name: "Mutton Boneless Pickle", price: 1500, image: "images/Mutton boneless Pickle.webp" },
    { name: "Chicken Bone Pickle", price: 800, image: "images/Chicken Bone Pickle.jpg" },
    { name: "Chicken Boneless Pickle", price: 1000, image: "images/Chicken Boneless.jpeg" },
    { name: "Gongura Pickle", price: 300, image: "images/Gongura Pickle.jpeg" },
    { name: "Tomato Pickle", price: 300, image: "images/Tomato Pickle.jpeg" },
    { name: "Allam Pickle", price: 300, image: "images/Allam Pickle.jpg" },
    { name: "Mango Pickle", price: 450, image: "images/mango_pickle.jpg" }
];

// CART STATE
let cart = {};

document.addEventListener("DOMContentLoaded", () => {
    // Check which page we are on
    if (document.getElementById("pickle-grid")) {
        // We are on order.html
        loadOrderPage();
        loadCartFromStorage(); // Restore previous selection if any
    } else if (document.getElementById("summary-list")) {
        // We are on summary.html
        loadSummaryPage();
    }
});

// --- ORDER PAGE LOGIC ---

function loadOrderPage() {
    const grid = document.getElementById("pickle-grid");

    // 1. Render Product Cards
    let productsHTML = "";
    pickles.forEach((pickle) => {
        productsHTML += `
            <div class="card" data-name="${pickle.name}" data-price="${pickle.price}">
                <div class="card-img-wrapper">
                    <img src="${pickle.image}" alt="${pickle.name}" class="card-img">
                </div>
                <div class="card-body">
                    <h3 class="card-title">${pickle.name}</h3>
                    <div class="card-price">₹${pickle.price} / Kg</div>
                    
                    <div class="form-group">
                        <label>Select Quantity:</label>
                        <select class="form-control qty-select" onchange="updateCart(this)">
                            <option value="0">Select (0 Kg)</option>
                            <option value="1">1 Kg</option>
                            <option value="2">2 Kg</option>
                            <option value="3">3 Kg</option>
                            <option value="4">4 Kg</option>
                            <option value="5">5 Kg</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    });
    grid.innerHTML = productsHTML;

    // 2. Add Floating Bar (Sticky Bottom)
    const floatingBar = document.createElement('div');
    floatingBar.id = 'floating-bar';
    floatingBar.className = 'floating-bar';
    floatingBar.innerHTML = `
        <div class="cart-count">0 items selected</div>
        <button onclick="goToSummary()" class="btn-proceed">Proceed to Order →</button>
    `;
    document.body.appendChild(floatingBar);
}

function updateCart(selectElement) {
    const card = selectElement.closest('.card');
    const name = card.dataset.name;
    const price = parseInt(card.dataset.price);
    const qty = parseInt(selectElement.value);

    if (qty > 0) {
        cart[name] = { price: price, qty: qty };
    } else {
        delete cart[name];
    }

    updateFloatingBar();
    saveCartIsStorage();
}

function updateFloatingBar() {
    const bar = document.getElementById('floating-bar');
    const count = Object.keys(cart).length;
    const countDisplay = bar.querySelector('.cart-count');

    if (count > 0) {
        bar.style.display = "flex";
        bar.classList.add('active'); // trigger animation
        countDisplay.textContent = `${count} item${count > 1 ? 's' : ''} selected`;
    } else {
        bar.style.display = "none";
        bar.classList.remove('active');
    }
}

function saveCartIsStorage() {
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
        updateFloatingBar();
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
    if (!storedCart) {
        window.location.href = "order.html"; // Redirect if no cart
        return;
    }

    cart = JSON.parse(storedCart);
    const summaryList = document.getElementById('summary-list');
    const totalDisplay = document.getElementById('total-price');
    const orderBtn = document.getElementById('place-order-btn');

    let html = "";
    let total = 0;

    if (Object.keys(cart).length === 0) {
        summaryList.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    for (const [name, item] of Object.entries(cart)) {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        html += `
            <div class="summary-item">
                <div>
                    <div class="summary-item-name">${name}</div>
                    <div class="summary-item-details">${item.qty} Kg x ₹${item.price}</div>
                </div>
                <div style="font-weight:bold;">₹${itemTotal}</div>
            </div>
        `;
    }

    summaryList.innerHTML = html;
    totalDisplay.textContent = `₹${total}`;

    // Update Button Text
    orderBtn.innerHTML = "Place Order on WhatsApp"; // Simpler text

    // Setup WhatsApp Button
    orderBtn.onclick = () => {
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();

        if (!name || !phone) {
            alert("Please provide your Name and Phone Number.");
            return;
        }

        let message = "New Pickle Order:\n\n";
        for (const [itemName, item] of Object.entries(cart)) {
            message += `${itemName} - ${item.qty} Kg - ₹${item.price * item.qty}\n`;
        }

        message += `\nTotal: ₹${total}\n\nName: ${name}\nPhone: ${phone}`;

        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${OWNER_NUMBER}?text=${encodedMessage}`;
        window.open(url, "_blank");

        // Optional: Clear cart after order? 
        // localStorage.removeItem('pickleCart'); 
    };
}
