// Check auth
const currentUser = JSON.parse(sessionStorage.getItem('zentrix_curr_user'));
if (!currentUser) {
    alert("Authorization Required. Please login.");
    window.location.href = "index.html";
}

// Check Cart
let cart = JSON.parse(localStorage.getItem('zentrix_cart')) || [];
if (cart.length === 0) {
    alert("Cargo is empty. Please add items before checking out.");
    window.location.href = "index.html";
}

// Elements
const checkoutItemsList = document.getElementById('checkoutItemsList');
const checkoutTotal = document.getElementById('checkoutTotal');
const checkoutAddress = document.getElementById('checkoutAddress');
const checkoutForm = document.getElementById('checkoutForm');
const loggedUserIcon = document.getElementById('loggedUserIcon');
const successModal = document.getElementById('successModal');
const successOrderId = document.getElementById('successOrderId');
const overlay = document.getElementById('drawerOverlay');

if (loggedUserIcon && currentUser) {
    loggedUserIcon.innerHTML = `<i class="fa-solid fa-user-check" style="color:var(--neon-blue);"></i> ${currentUser.firstName || 'User'}`;
}

// Populate Address
if (checkoutAddress && currentUser.address) {
    checkoutAddress.value = currentUser.address;
}

// Render Items
function renderCheckoutItems() {
    checkoutItemsList.innerHTML = '';
    let total = 0;
    
    // Group identical items
    const itemCounts = {};
    cart.forEach(item => {
        if(itemCounts[item.id]) itemCounts[item.id].qty += 1;
        else itemCounts[item.id] = { ...item, qty: 1 };
    });

    Object.values(itemCounts).forEach(item => {
        total += (item.price * item.qty);
        checkoutItemsList.innerHTML += `
            <div style="display: flex; gap: 1.5rem; align-items: center; background: rgba(255,255,255,0.03); padding: 1.2rem; margin-bottom: 1rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);">
                <img src="${item.image}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(0,240,255,0.3);">
                <div style="flex: 1;">
                    <h4 style="margin-bottom: 0.3rem; font-size: 1.1rem; color: white;">${item.name}</h4>
                    <span style="font-size: 0.85rem; color: var(--neon-blue);">Qty: ${item.qty}</span>
                </div>
                <div style="text-align: right;">
                    <span class="neon-text" style="font-size: 1.2rem; font-weight: bold;">₹${Number(item.price * item.qty).toFixed(2)}</span>
                </div>
            </div>
        `;
    });

    checkoutTotal.innerText = '₹' + total.toFixed(2);
    return total;
}

const totalAmount = renderCheckoutItems();

// Submit Order
if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!checkoutAddress.value.trim()) {
            alert("Please provide a valid shipping address.");
            return;
        }

        let orders = JSON.parse(localStorage.getItem('zentrix_orders')) || [];
        const nextOrderNum = Math.floor(1000 + Math.random() * 9000); 
        const newOrderId = "ORD-" + nextOrderNum;
        
        const newOrder = {
            id: newOrderId,
            date: new Date().toISOString().split('T')[0],
            customer: currentUser.email,
            address: checkoutAddress.value,
            total: totalAmount,
            items: cart, 
            status: "Processing"
        };
        
        orders.unshift(newOrder); // Add to the top
        localStorage.setItem('zentrix_orders', JSON.stringify(orders));

        // Clear Cart
        cart = [];
        localStorage.setItem('zentrix_cart', JSON.stringify(cart));
        
        // Show Success
        successOrderId.innerText = newOrderId;
        successModal.classList.add('active');
        if (overlay) overlay.classList.add('active');
    });
}
