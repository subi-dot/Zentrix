// Admin logic
const ADMIN_PASS = 'Sebs@123';

// Auth Check
const authOverlay = document.getElementById('adminAuthOverlay');
const adminDashboard = document.getElementById('adminDashboard');
const authForm = document.getElementById('adminAuthForm');
const authErrorMsg = document.getElementById('authErrorMsg');

if (sessionStorage.getItem('admin_auth') === 'true') {
    authOverlay.style.display = 'none';
    adminDashboard.style.display = 'flex';
}

if (authForm) {
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('adminPassword').value;
        if (pass === ADMIN_PASS) {
            sessionStorage.setItem('admin_auth', 'true');
            authOverlay.style.display = 'none';
            adminDashboard.style.display = 'flex';
        } else {
            authErrorMsg.style.display = 'block';
            setTimeout(() => authErrorMsg.style.display = 'none', 3000);
        }
    });
}

// Tab Navigation
const tabLinks = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');

tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove active class from all links and contents
        tabLinks.forEach(l => l.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active to current
        link.classList.add('active');
        const targetId = link.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
        
        // Refresh data based on tab
        if(targetId === 'ordersTab') renderOrders();
        if(targetId === 'usersTab') renderUsers();
    });
});

let adminProducts = JSON.parse(localStorage.getItem('zentrix_products')) || [];

// DOM Elements
const inventoryBody = document.getElementById('inventoryBody');
const addProdBtn = document.getElementById('addProdBtn');
const productModal = document.getElementById('productModal');
const productCloseBtns = document.querySelectorAll('.product-close, .product-close-btn');
const productForm = document.getElementById('productForm');

function renderInventory() {
    if(!inventoryBody) return;
    adminProducts = JSON.parse(localStorage.getItem('zentrix_products')) || [];
    
    inventoryBody.innerHTML = '';
    adminProducts.forEach(prod => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${prod.id}</td>
            <td><img src="${prod.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
            <td>${prod.name}</td>
            <td style="text-transform: capitalize;">${prod.category}</td>
            <td class="neon-text">₹${Number(prod.price).toFixed(2)}</td>
            <td>
                <div class="controls">
                    <button class="cyber-btn outline-btn btn-small" onclick="editProduct(${prod.id})"><i class="fa-solid fa-pen-nib"></i></button>
                    <button class="cyber-btn outline-btn btn-small btn-danger" onclick="deleteProduct(${prod.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;
        inventoryBody.appendChild(tr);
    });
}

// Modal Toggle
if(addProdBtn) {
    addProdBtn.addEventListener('click', () => {
        document.getElementById('productForm').reset();
        document.getElementById('prodId').value = '';
        productModal.classList.add('active');
    });
}

productCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        productModal.classList.remove('active');
    });
});

// Form Submit
if(productForm) {
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const idVal = document.getElementById('prodId').value;
        const name = document.getElementById('prodName').value;
        const category = document.getElementById('prodCategory').value;
        const price = document.getElementById('prodPrice').value;
        let image = document.getElementById('prodImage').value;
        const designer = document.getElementById('prodDesigner').value;

        // Auto fallback if user is lazy
        if (!image) {
            image = category === 'fidgets' ? 'img/fidget_1.png' : 'img/keychain_1.png';
        }

        if (idVal) {
            // Edit
            const idx = adminProducts.findIndex(p => p.id == idVal);
            if(idx > -1) {
                adminProducts[idx] = { id: Number(idVal), name, category, price, image, designer };
            }
        } else {
            // Add
            const nextId = adminProducts.length > 0 ? Math.max(...adminProducts.map(p=>p.id)) + 1 : 1;
            adminProducts.push({ id: nextId, name, category, price, image, designer });
        }

        localStorage.setItem('zentrix_products', JSON.stringify(adminProducts));
        productModal.classList.remove('active');
        renderInventory();
    });
}

window.deleteProduct = function(id) {
    if(confirm("Confirm destructive action on catalog item?")) {
        adminProducts = adminProducts.filter(p => p.id !== id);
        localStorage.setItem('zentrix_products', JSON.stringify(adminProducts));
        renderInventory();
    }
}

window.editProduct = function(id) {
    const prod = adminProducts.find(p => p.id === id);
    if(prod) {
        document.getElementById('prodId').value = prod.id;
        document.getElementById('prodName').value = prod.name;
        document.getElementById('prodCategory').value = prod.category;
        document.getElementById('prodPrice').value = prod.price;
        document.getElementById('prodImage').value = prod.image;
        document.getElementById('prodDesigner').value = prod.designer;
        productModal.classList.add('active');
    }
}

// Dummy Data for Orders and Users if empty
const defaultOrders = [
    { id: "ORD-9932", date: "2026-03-14", customer: "neo_runner@cyber.net", total: 110.50, status: "Shipped" },
    { id: "ORD-9933", date: "2026-03-15", customer: "glitch_girl@proxy.org", total: 45.00, status: "Processing" }
];
const defaultUsers = [
    { id: "USR-001", email: "admin@zentrix.net", status: "Active", clearance: "Level 5 (Admin)" },
    { id: "USR-002", email: "neo_runner@cyber.net", status: "Active", clearance: "Level 1 (User)" },
    { id: "USR-003", email: "glitch_girl@proxy.org", status: "Active", clearance: "Level 1 (User)" }
];

if (!localStorage.getItem('zentrix_orders')) {
    localStorage.setItem('zentrix_orders', JSON.stringify(defaultOrders));
}
if (!localStorage.getItem('zentrix_users')) {
    localStorage.setItem('zentrix_users', JSON.stringify(defaultUsers));
}

// Render Orders
function renderOrders() {
    const ordersBody = document.getElementById('ordersBody');
    if(!ordersBody) return;
    const orders = JSON.parse(localStorage.getItem('zentrix_orders')) || [];
    
    ordersBody.innerHTML = '';
    orders.forEach(ord => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="neon-text">${ord.id}</span></td>
            <td>${ord.date}</td>
            <td>${ord.customer}</td>
            <td>₹${Number(ord.total).toFixed(2)}</td>
            <td><span style="color: ${ord.status === 'Processing' ? '#ffaa00' : '#00ffaa'};">${ord.status}</span></td>
            <td>
                <button class="cyber-btn outline-btn btn-small" onclick="viewOrder('${ord.id}')"><i class="fa-solid fa-eye"></i> View</button>
            </td>
        `;
        ordersBody.appendChild(tr);
    });
}

// Render Users
function renderUsers() {
    const usersBody = document.getElementById('usersBody');
    if(!usersBody) return;
    const users = JSON.parse(localStorage.getItem('zentrix_users')) || [];
    
    usersBody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td><span class="neon-text">${user.email}</span></td>
            <td>${user.status}</td>
            <td style="color: ${user.clearance.includes('Admin') ? '#ff3366' : '#8892b0'};">${user.clearance}</td>
        `;
        usersBody.appendChild(tr);
    });
}

// Init Tabs Data
renderInventory();
renderOrders();
renderUsers();

// --- Order Details Modal Logic ---
const orderDetailsModal = document.getElementById('orderDetailsModal');
const orderDetailsClose = document.querySelector('.order-details-close');
const orderContentArea = document.getElementById('orderContentArea');
const updateStatusSelect = document.getElementById('updateStatusSelect');
const currentOrderId = document.getElementById('currentOrderId');
const saveOrderStatusBtn = document.getElementById('saveOrderStatusBtn');
const printReceiptBtn = document.getElementById('printReceiptBtn');

if(orderDetailsClose) orderDetailsClose.addEventListener('click', () => {
    orderDetailsModal.classList.remove('active');
});

window.viewOrder = function(id) {
    const orders = JSON.parse(localStorage.getItem('zentrix_orders')) || [];
    const ord = orders.find(o => o.id === id);
    if(!ord) return;

    currentOrderId.value = ord.id;
    updateStatusSelect.value = ord.status;

    let itemsHtml = `<p><strong>Address:</strong> <span style="color: var(--text-secondary);">${ord.address || 'N/A'}</span></p>
                     <p><strong>Customer:</strong> <span style="color: var(--neon-blue);">${ord.customer}</span></p>
                     <hr style="border-color: rgba(0,240,255,0.2); margin: 1rem 0;">
                     <h4 style="margin-bottom: 0.5rem; color: var(--text-primary);">Order Items</h4>`;
    
    if (ord.items && ord.items.length > 0) {
        // Group items to show quantities
        const itemCounts = {};
        ord.items.forEach(item => {
            if(itemCounts[item.id]) itemCounts[item.id].qty += 1;
            else itemCounts[item.id] = { ...item, qty: 1 };
        });

        Object.values(itemCounts).forEach(item => {
            itemsHtml += `
                <div style="display: flex; gap: 1rem; align-items: center; background: rgba(255,255,255,0.02); padding: 0.5rem; margin-bottom: 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);">
                    <img src="${item.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                    <div style="flex: 1;">
                        <span style="display: block; font-weight: bold; font-size: 0.9rem;">${item.name}</span>
                        <span style="font-size: 0.8rem; color: var(--neon-blue);">₹${Number(item.price).toFixed(2)} x ${item.qty}</span>
                    </div>
                </div>
            `;
        });
    } else {
        itemsHtml += `<p style="font-style: italic; color: var(--text-secondary); font-size: 0.85rem;">Legacy Order: Itemized inventory not logged.</p>`;
    }

    orderContentArea.innerHTML = itemsHtml;
    orderDetailsModal.classList.add('active');
}

if(saveOrderStatusBtn) {
    saveOrderStatusBtn.addEventListener('click', () => {
        let orders = JSON.parse(localStorage.getItem('zentrix_orders')) || [];
        const idx = orders.findIndex(o => o.id === currentOrderId.value);
        if(idx > -1) {
            orders[idx].status = updateStatusSelect.value;
            localStorage.setItem('zentrix_orders', JSON.stringify(orders));
            renderOrders();
            orderDetailsModal.classList.remove('active');
        }
    });
}

if(printReceiptBtn) {
    printReceiptBtn.addEventListener('click', () => {
        let orders = JSON.parse(localStorage.getItem('zentrix_orders')) || [];
        const ord = orders.find(o => o.id === currentOrderId.value);
        if(!ord) return;

        let itemsRows = '';
        if(ord.items && ord.items.length > 0) {
            const itemCounts = {};
            ord.items.forEach(item => {
                if(itemCounts[item.id]) itemCounts[item.id].qty += 1;
                else itemCounts[item.id] = { ...item, qty: 1 };
            });
            Object.values(itemCounts).forEach(item => {
                itemsRows += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ccc;">${item.name}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ccc; text-align: center;">${item.qty}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ccc; text-align: right;">Rs ${Number(item.price).toFixed(2)}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ccc; text-align: right;">Rs ${Number(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                `;
            });
        }

        const receiptHtml = `
            <html>
            <head>
                <title>Receipt - ${ord.id}</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; color: #000; padding: 40px; }
                    .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 20px; margin-bottom: 20px; }
                    .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
                    .info { margin-bottom: 30px; line-height: 1.6; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { border-bottom: 2px solid #000; padding: 10px; text-align: left; }
                    .total { text-align: right; font-size: 18px; font-weight: bold; border-top: 2px dashed #000; padding-top: 10px; }
                    .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #555; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Zentrix Designs</h1>
                    <p>Micro-Factory Order Receipt</p>
                </div>
                <div class="info">
                    <strong>Order ID:</strong> ${ord.id}<br>
                    <strong>Date:</strong> ${ord.date}<br>
                    <strong>Customer:</strong> ${ord.customer}<br>
                    <strong>Shipping Address:</strong> ${ord.address || 'N/A'}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                    </tbody>
                </table>
                <div class="total">
                    Grand Total: Rs ${Number(ord.total).toFixed(2)}
                </div>
                <div class="footer">
                    Thank you for your transmission. The future is tactile.
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.open();
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
    });
}
