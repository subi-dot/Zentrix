// Mock Default Data
const defaultProducts = [
    { id: 1, name: "Nexus Gear Sphere", category: "fidgets", price: 45.00, image: "img/fidget_1.png", designer: "CyberSmith99" },
    { id: 2, name: "Neo-Cyb Security FOB", category: "keychains", price: 25.50, image: "img/keychain_1.png", designer: "HexaLogic" },
    { id: 3, name: "Quantum Tesseract", category: "fidgets", price: 85.00, image: "img/fidget_1.png", designer: "VoidArchitect" },
    { id: 4, name: "Stealth Tag V2", category: "keychains", price: 18.00, image: "img/keychain_1.png", designer: "GhostDesign" }
];

// Initialize Data if empty
if (!localStorage.getItem('zentrix_products')) {
    localStorage.setItem('zentrix_products', JSON.stringify(defaultProducts));
}
if (!localStorage.getItem('zentrix_cart')) {
    localStorage.setItem('zentrix_cart', JSON.stringify([]));
}

// Global scope variables
let products = JSON.parse(localStorage.getItem('zentrix_products'));
let cart = JSON.parse(localStorage.getItem('zentrix_cart'));
let currentUser = JSON.parse(sessionStorage.getItem('zentrix_curr_user')) || null;
let pendingVerificationUser = null;
let verificationCode = null;

// Ensure users array exists
if (!localStorage.getItem('zentrix_users')) {
    localStorage.setItem('zentrix_users', JSON.stringify([
    ]));
}

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartCount = document.getElementById('cartCount');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalPrice = document.getElementById('cartTotalPrice');

// UI Interactions - Navbar Scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Auth & Modals
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const loginClose = document.querySelector('.login-close');
const overlay = document.getElementById('drawerOverlay');

const loginSection = document.getElementById('loginSection');
const signupSection = document.getElementById('signupSection');
const showSignupBtn = document.getElementById('showSignupBtn');
const showLoginBtn = document.getElementById('showLoginBtn');

const verifyModal = document.getElementById('verifyModal');
const verifyClose = document.querySelector('.verify-close');

const cartDrawer = document.getElementById('cartDrawer');
const cartBtn = document.getElementById('cartBtn');
const cartClose = document.querySelector('.cart-close');

// Toggle Login/Signup Sections
if(showSignupBtn) showSignupBtn.addEventListener('click', () => { loginSection.style.display = 'none'; signupSection.style.display = 'block'; });
if(showLoginBtn) showLoginBtn.addEventListener('click', () => { signupSection.style.display = 'none'; loginSection.style.display = 'block'; });

function openLoginModal() {
    loginSection.style.display = 'block';
    signupSection.style.display = 'none';
    loginModal.classList.add('active');
    overlay.classList.add('active');
}

const profileModal = document.getElementById('profileModal');
const profileClose = document.querySelector('.profile-close');
const logoutBtn = document.getElementById('logoutBtn');
const userOrdersContainer = document.getElementById('userOrdersContainer');

if(loginBtn) {
    loginBtn.addEventListener('click', () => {
        if(currentUser) { 
            // Open Profile
            profileModal.classList.add('active');
            overlay.classList.add('active');
            renderUserOrders();
        } else {
            openLoginModal();
        }
    });
}
if(loginClose) loginClose.addEventListener('click', () => { loginModal.classList.remove('active'); overlay.classList.remove('active'); });
if(verifyClose) verifyClose.addEventListener('click', () => { verifyModal.classList.remove('active'); overlay.classList.remove('active'); });
if(profileClose) profileClose.addEventListener('click', () => { profileModal.classList.remove('active'); overlay.classList.remove('active'); });
if(overlay) {
    overlay.addEventListener('click', () => {
        cartDrawer.classList.remove('open');
        loginModal.classList.remove('active');
        verifyModal.classList.remove('active');
        profileModal.classList.remove('active');
        overlay.classList.remove('active');
    });
}

if(logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        sessionStorage.removeItem('zentrix_curr_user');
        loginBtn.innerHTML = `<i class="fa-regular fa-user"></i> Login`;
        profileModal.classList.remove('active');
        overlay.classList.remove('active');
        updateCheckoutUI();
        alert("System Disconnected.");
    });
}

function renderUserOrders() {
    if(!userOrdersContainer || !currentUser) return;
    let orders = JSON.parse(localStorage.getItem('zentrix_orders')) || [];
    let myOrders = orders.filter(o => o.customer === currentUser.email);
    
    userOrdersContainer.innerHTML = '';
    
    if (myOrders.length === 0) {
        userOrdersContainer.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No transmissions detected.</p>';
        return;
    }

    myOrders.forEach(ord => {
        let statusColor = '#00f0ff';
        if (ord.status === 'Processing') statusColor = '#ffaa00';
        if (ord.status === 'Shipped') statusColor = '#00ffaa';
        if (ord.status === 'Delivered') statusColor = '#00ffaa';

        let itemsHtml = '';
        if (ord.items && ord.items.length > 0) {
            ord.items.forEach(item => {
                itemsHtml += `<div style="font-size: 0.8rem; color: #a4b1cd; margin-top: 5px;">- ${item.name} (₹${item.price})</div>`;
            });
        }

        userOrdersContainer.innerHTML += `
            <div style="background: rgba(255,255,255,0.05); padding: 1rem; border: 1px solid var(--border-subtle); border-radius: 8px; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div>
                        <strong class="neon-text">${ord.id}</strong><br>
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">${ord.date} &bull; ₹${Number(ord.total).toFixed(2)}</span>
                    </div>
                    <div>
                        <span style="padding: 0.3rem 0.8rem; background: rgba(0,0,0,0.5); border: 1px solid ${statusColor}; color: ${statusColor}; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">${ord.status}</span>
                    </div>
                </div>
                <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem; margin-top: 0.5rem;">
                    <strong style="font-size: 0.85rem; color: var(--text-primary);">Cargo:</strong>
                    ${itemsHtml || '<div style="font-size: 0.8rem; color: #a4b1cd; margin-top: 5px;">Legacy Order: Itemized inventory not logged.</div>'}
                </div>
            </div>
        `;
    });
}

// --- Signup Logic ---
const signupForm = document.getElementById('signupForm');
if(signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = document.getElementById('signupFirstName')?.value || 'User';
        const lastName = document.getElementById('signupLastName')?.value || 'Unknown';
        const email = document.getElementById('signupEmail').value;
        const dob = document.getElementById('signupDOB').value;
        const address = document.getElementById('signupAddress').value;
        const password = document.getElementById('signupPassword').value;

        // Check unique email
        let users = JSON.parse(localStorage.getItem('zentrix_users')) || [];
        if(users.some(u => u.email === email)) {
            alert("Error: Registration failed, identity (email) already exists in matrix.");
            return;
        }

        // Generate 4 digit code
        verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
        
        pendingVerificationUser = {
            id: "USR-" + Math.floor(100 + Math.random() * 900),
            firstName: firstName,
            lastName: lastName,
            email: email,
            dob: dob,
            address: address,
            password: password,
            status: "Active",
            clearance: "Level 1 (User)"
        };

        // Simulate sending email
        alert("SIMULATED SECURE EMAIL:\n\nTo: " + email + "\nSubject: Zentrix Account Verification\n\nYour 4-digit code is: " + verificationCode);

        // Switch to Verify Modal
        loginModal.classList.remove('active');
        verifyModal.classList.add('active');
    });
}

// --- Verification Logic ---
const verifyForm = document.getElementById('verifyForm');
if(verifyForm) {
    verifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const codeInput = document.getElementById('verifyCode').value;
        if(codeInput === verificationCode) {
            // Success
            let users = JSON.parse(localStorage.getItem('zentrix_users')) || [];
            users.push(pendingVerificationUser);
            localStorage.setItem('zentrix_users', JSON.stringify(users));
            
            alert("Identity verified. System Access Granted.");
            verifyModal.classList.remove('active');
            overlay.classList.remove('active');

            // Auto log in
            currentUser = pendingVerificationUser;
            sessionStorage.setItem('zentrix_curr_user', JSON.stringify(currentUser));
            loginBtn.innerHTML = `<i class="fa-solid fa-user-check" style="color:var(--neon-blue);"></i> ${currentUser.firstName || 'User'}`;
            updateCheckoutUI();
        } else {
            alert("Error: Invalid Code.");
        }
    });
}

// --- Login Logic ---
const loginForm = document.getElementById('loginForm');
if(loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        let users = JSON.parse(localStorage.getItem('zentrix_users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            if (user.status !== 'Active') alert("Account suspended or unverified.");
            else {
                currentUser = user;
                sessionStorage.setItem('zentrix_curr_user', JSON.stringify(currentUser));
                loginBtn.innerHTML = `<i class="fa-solid fa-user-check" style="color:var(--neon-blue);"></i> ${currentUser.firstName || 'User'}`;
                loginModal.classList.remove('active');
                overlay.classList.remove('active');
                updateCheckoutUI();
            }
        } else {
            alert("Error: Invalid credentials.");
        }
    });
}

// Auto maintain login visual state
if (currentUser) {
    if(loginBtn) loginBtn.innerHTML = `<i class="fa-solid fa-user-check" style="color:var(--neon-blue);"></i> ${currentUser.firstName || 'User'}`;
}

// Open Cart
if(cartBtn) {
    cartBtn.addEventListener('click', () => {
        cartDrawer.classList.add('open');
        overlay.classList.add('active');
        renderCart();
    });
}
if(cartClose) {
    cartClose.addEventListener('click', () => {
        cartDrawer.classList.remove('open');
        overlay.classList.remove('active');
    });
}
if(overlay) {
    overlay.addEventListener('click', () => {
        cartDrawer.classList.remove('open');
        loginModal.classList.remove('active');
        overlay.classList.remove('active');
    });
}


// Filter Logic
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProducts(btn.dataset.filter);
    });
});

// Render Products
function renderProducts(filter = 'all') {
    if(!productGrid) return;
    productGrid.innerHTML = '';
    
    // Always fetch fresh from LocalStorage
    products = JSON.parse(localStorage.getItem('zentrix_products')) || [];

    const filtered = filter === 'all' 
        ? products 
        : products.filter(p => p.category === filter);

    if (filtered.length === 0) {
        productGrid.innerHTML = `<p class="empty-cart-msg w-100" style="grid-column: 1/-1;">No blueprints found in the repository.</p>`;
        return;
    }

    filtered.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${prod.image}" alt="${prod.name}" class="product-img">
            <div class="product-info">
                <span class="product-category">${prod.category}</span>
                <h3 class="product-title">${prod.name}</h3>
                <span class="product-designer">Architect: <span class="neon-text">${prod.designer}</span></span>
                <div class="product-footer">
                    <span class="product-price">₹${Number(prod.price).toFixed(2)}</span>
                    <button class="add-to-cart" onclick="addToCart(${prod.id})">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// Cart Logic
function updateCartCount() {
    cart = JSON.parse(localStorage.getItem('zentrix_cart')) || [];
    if(cartCount) cartCount.innerText = cart.length;
}

window.addToCart = function(productId) {
    products = JSON.parse(localStorage.getItem('zentrix_products'));
    const product = products.find(p => p.id === productId);
    if(product) {
        cart.push(product);
        localStorage.setItem('zentrix_cart', JSON.stringify(cart));
        updateCartCount();
        
        // Quick subtle animation on icon
        cartBtn.style.transform = 'scale(1.2)';
        cartCount.style.boxShadow = '0 0 15px var(--neon-blue)';
        setTimeout(() => {
            cartBtn.style.transform = 'scale(1)';
            cartCount.style.boxShadow = '0 0 5px var(--neon-blue-glow)';
        }, 300);
    }
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    localStorage.setItem('zentrix_cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function renderCart() {
    if(!cartItemsContainer || !cartTotalPrice) return;
    cart = JSON.parse(localStorage.getItem('zentrix_cart')) || [];
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Cargo hold is empty.</p>';
        cartTotalPrice.innerText = '₹0.00';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += Number(item.price);
        const cartEl = document.createElement('div');
        cartEl.className = 'cart-item';
        cartEl.innerHTML = `
            <img src="${item.image}" alt="" class="cart-item-img">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <div class="cart-item-price">₹${Number(item.price).toFixed(2)}</div>
                <div class="cart-item-remove" onclick="removeFromCart(${index})">
                    <i class="fa-solid fa-trash-can"></i> Jettison
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartEl);
    });

    cartTotalPrice.innerText = '₹' + total.toFixed(2);
}

// Checkout UI Update function
function updateCheckoutUI() {
    const checkoutInfo = document.getElementById('checkoutInfo');
    const checkoutBtn = document.getElementById('mainCheckoutBtn');
    const cartAddressText = document.getElementById('cartAddressText');

    if (currentUser && checkoutBtn && checkoutInfo && cartAddressText) {
        checkoutInfo.style.display = 'block';
        cartAddressText.innerText = currentUser.address || "Address not set";
        checkoutBtn.innerText = "Proceed to Checkout";
    } else if (checkoutBtn && checkoutInfo) {
        checkoutInfo.style.display = 'none';
        checkoutBtn.innerText = "Login to Checkout";
    }
}

// Checkout simulation
const checkoutBtn = document.getElementById('mainCheckoutBtn');
const tncCheckbox = document.getElementById('tncCheckbox');

if(checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        cart = JSON.parse(localStorage.getItem('zentrix_cart')) || [];
        if(cart.length === 0) return;
        
        if (!currentUser) {
            cartDrawer.classList.remove('open');
            openLoginModal();
            return;
        }

        if (tncCheckbox && !tncCheckbox.checked) {
            alert("Error: You must agree to the Terms & Conditions before confirming your transmission.");
            return;
        }

        // Redirect to full checkout page instead of placing order here
        window.location.href = "checkout.html";
    });
}

// Init
renderProducts();
updateCartCount();
updateCheckoutUI();
