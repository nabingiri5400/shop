// ==================== NAVIN CHOCOLATE SHOP - COMPLETE JAVASCRIPT ====================
// This file handles all interactive functionality: cart, products, checkout, etc.

// ==================== PRODUCT DATA ====================
// All your chocolate products information
const products = [
    {
        id: '1',
        name: 'Milk Chocolate',
        price: 400,
        description: 'Creamy, rich milk chocolate made with premium cocoa. Perfect for everyone!',
        image: 'images/milk-chocolate.jpg',
        category: 'Chocolates'
    },
    {
        id: '2',
        name: 'Dark Chocolate',
        price: 400,
        description: '70% cocoa, rich antioxidant-rich dark chocolate. Intense and smooth!',
        image: 'images/dark-chocolate.jpg',
        category: 'Chocolates'
    }
];

// ==================== CART MANAGEMENT ====================
// Load cart from localStorage or start with empty cart
let cart = JSON.parse(localStorage.getItem('navinCart')) || [];

// ==================== INITIALIZATION ====================
// Run when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Navin Chocolate Shop - Website Loaded');
    
    // Update cart count on all pages
    updateCartCount();
    
    // Load products based on current page
    loadPageProducts();
    
    // Load cart items if on cart page
    if (document.getElementById('cart-items')) {
        displayCart();
    }
    
    // Load order summary if on checkout page
    if (document.getElementById('order-items')) {
        displayOrderSummary();
    }
    
    // Load confirmation details if on confirmation page
    if (document.getElementById('confirmation-details')) {
        loadConfirmation();
    }
    
    // Setup checkout form if on checkout page
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', placeOrder);
    }
});

// ==================== PRODUCT DISPLAY FUNCTIONS ====================

// Load appropriate products based on current page
function loadPageProducts() {
    // For home page (featured products)
    if (document.getElementById('featured-products')) {
        displayProducts('featured-products', products.slice(0, 2));
    }
    
    // For products page (all products)
    if (document.getElementById('all-products')) {
        displayProducts('all-products', products);
    }
}

// Display products in a container
function displayProducts(containerId, productsToShow) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '';
    
    productsToShow.forEach(product => {
        html += `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='https://via.placeholder.com/300x300/8B4513/FFFFFF?text=${product.name.replace(' ', '+')}'">
                <h3>${product.name}</h3>
                <p class="price">Rs. ${product.price}</p>
                <p class="description">${product.description}</p>
                <div class="quantity-selector">
                    <button class="qty-btn" onclick="changeQuantity('${product.id}', -1)">−</button>
                    <input type="number" id="qty-${product.id}" class="qty-input" value="1" min="1" max="10" readonly>
                    <button class="qty-btn" onclick="changeQuantity('${product.id}', 1)">+</button>
                </div>
                <div class="product-buttons">
                    <button class="btn btn-add" onclick="addToCart('${product.id}')">Add to Cart</button>
                    <button class="btn btn-buy" onclick="buyNow('${product.id}')">Buy Now</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Change quantity for a product
function changeQuantity(productId, change) {
    const input = document.getElementById(`qty-${productId}`);
    if (input) {
        let newValue = parseInt(input.value) + change;
        if (newValue < 1) newValue = 1;
        if (newValue > 10) newValue = 10;
        input.value = newValue;
    }
}

// Get current quantity for a product
function getQuantity(productId) {
    const input = document.getElementById(`qty-${productId}`);
    return input ? parseInt(input.value) : 1;
}

// ==================== CART FUNCTIONS ====================

// Add to cart
window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const quantity = getQuantity(productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
        showMessage('Quantity updated in cart!', 'success');
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.image
        });
        showMessage('✅ Added to cart!', 'success');
    }
    
    saveCart();
    updateCartCount();
};

// Buy now - adds to cart and goes to checkout
window.buyNow = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Clear cart and add this item
    cart = [{
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
    }];
    
    saveCart();
    updateCartCount();
    window.location.href = 'checkout.html';
};

// Remove from cart
window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    displayCart();
    updateCartCount();
    showMessage('Item removed from cart', 'info');
};

// Update quantity in cart
window.updateCartQuantity = function(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        newQuantity = parseInt(newQuantity);
        if (newQuantity < 1) newQuantity = 1;
        if (newQuantity > 10) newQuantity = 10;
        
        item.quantity = newQuantity;
        saveCart();
        displayCart();
        updateCartCount();
    }
};

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('navinCart', JSON.stringify(cart));
}

// Update cart count in navigation
function updateCartCount() {
    const cartCounts = document.querySelectorAll('#cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCounts.forEach(element => {
        element.textContent = totalItems;
    });
}

// Display cart items on cart page
function displayCart() {
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <p>🛒 Your cart is empty</p>
                <a href="products.html" class="btn btn-primary" style="margin-top: 1rem;">Start Shopping</a>
            </div>
        `;
        document.getElementById('cart-subtotal').textContent = 'Rs. 0';
        document.getElementById('cart-total').textContent = 'Rs. 0';
        return;
    }
    
    let html = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Price: Rs. ${item.price} | Quantity: ${item.quantity}</p>
                    <p><strong>Subtotal: Rs. ${itemTotal}</strong></p>
                </div>
                <div class="cart-item-actions">
                    <input type="number" class="qty-input" value="${item.quantity}" 
                           min="1" max="10" onchange="updateCartQuantity('${item.id}', this.value)">
                    <button class="btn-remove" onclick="removeFromCart('${item.id}')">Remove</button>
                </div>
            </div>
        `;
    });
    
    cartContainer.innerHTML = html;
    document.getElementById('cart-subtotal').textContent = `Rs. ${subtotal}`;
    document.getElementById('cart-total').textContent = `Rs. ${subtotal}`;
}

// ==================== CHECKOUT FUNCTIONS ====================

// Display order summary on checkout page
function displayOrderSummary() {
    const orderItems = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');
    
    if (!orderItems) return;
    
    if (cart.length === 0) {
        window.location.href = 'products.html';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        html += `
            <div class="checkout-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>Rs. ${subtotal}</span>
            </div>
        `;
    });
    
    orderItems.innerHTML = html;
    orderTotal.textContent = `Rs. ${total}`;
}

// Place order
window.placeOrder = function(event) {
    event.preventDefault();
    
    // Get form data
    const formData = {
        firstName: document.getElementById('first_name')?.value || '',
        lastName: document.getElementById('last_name')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        email: document.getElementById('email')?.value || '',
        address: document.getElementById('address')?.value || '',
        city: document.getElementById('city')?.value || '',
        landmark: document.getElementById('landmark')?.value || '',
        payment: document.querySelector('input[name="payment"]:checked')?.value || 'Cash on Delivery'
    };
    
    // Validate form
    for (let key in formData) {
        if (!formData[key] && key !== 'landmark' && key !== 'payment') {
            alert(`Please fill in ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            return;
        }
    }
    
    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(formData.phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Check if cart is empty
    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'products.html';
        return;
    }
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate order ID
    const orderId = 'NC' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000);
    
    // Create order object
    const order = {
        orderId: orderId,
        date: new Date().toLocaleString(),
        customer: formData,
        items: cart,
        total: total,
        status: 'Pending'
    };
    
    // Save order to localStorage (in real app, this would go to database)
    saveOrder(order);
    
    // Send email notification (simulated)
    sendOrderEmail(order);
    
    // Store last order for confirmation page
    localStorage.setItem('lastOrder', JSON.stringify(order));
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartCount();
    
    // Redirect to confirmation page
    window.location.href = 'confirmation.html';
};

// Save order to localStorage (simulates database)
function saveOrder(order) {
    let orders = JSON.parse(localStorage.getItem('navinOrders')) || [];
    orders.push(order);
    localStorage.setItem('navinOrders', JSON.stringify(orders));
    console.log('Order saved:', order);
}

// Send email (simulated - would connect to backend in real app)
function sendOrderEmail(order) {
    console.log('📧 SENDING EMAIL TO SHOP OWNER:');
    console.log('To: nabingiri5400@gmail.com');
    console.log('Subject: 🍫 New Order: ' + order.orderId);
    console.log('Order Details:', order);
    
    // Show alert in development
    showMessage('📧 Order email sent to nabingiri5400@gmail.com', 'success');
}

// ==================== CONFIRMATION PAGE FUNCTIONS ====================

// Load order confirmation details
function loadConfirmation() {
    const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
    const container = document.getElementById('confirmation-details');
    
    if (!container) return;
    
    if (!lastOrder) {
        container.innerHTML = '<p>No order found</p>';
        return;
    }
    
    // Set customer phone
    const phoneElement = document.getElementById('customer-phone');
    if (phoneElement) {
        phoneElement.textContent = lastOrder.customer.phone;
    }
    
    // Generate items HTML
    let itemsHtml = '';
    lastOrder.items.forEach(item => {
        itemsHtml += `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>Rs. ${item.price}</td>
                <td>Rs. ${item.price * item.quantity}</td>
            </tr>
        `;
    });
    
    // Create confirmation HTML
    container.innerHTML = `
        <div class="order-id">
            <strong>Order ID:</strong> ${lastOrder.orderId}
        </div>
        
        <div class="order-details">
            <p><strong>Date:</strong> ${lastOrder.date}</p>
            <p><strong>Customer:</strong> ${lastOrder.customer.firstName} ${lastOrder.customer.lastName}</p>
            <p><strong>Phone:</strong> ${lastOrder.customer.phone}</p>
            <p><strong>Email:</strong> ${lastOrder.customer.email}</p>
            <p><strong>Address:</strong> ${lastOrder.customer.address}, ${lastOrder.customer.city}</p>
        </div>
        
        <h3>Order Summary</h3>
        <table class="order-details-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3"><strong>Total</strong></td>
                    <td><strong>Rs. ${lastOrder.total}</strong></td>
                </tr>
            </tfoot>
        </table>
        
        <p><strong>Payment Method:</strong> ${lastOrder.customer.payment}</p>
    `;
}

// ==================== CONTACT PAGE FUNCTIONS ====================

// Send contact message
window.sendMessage = function(event) {
    event.preventDefault();
    
    const name = document.getElementById('name')?.value;
    const email = document.getElementById('email')?.value;
    const message = document.getElementById('message')?.value;
    
    if (!name || !email || !message) {
        alert('Please fill in all fields');
        return;
    }
    
    // Simulate sending message
    console.log('📧 Contact Form Submission:');
    console.log('From:', name, email);
    console.log('Message:', message);
    
    showMessage('✅ Message sent! We\'ll reply soon.', 'success');
    
    // Clear form
    event.target.reset();
};

// ==================== UTILITY FUNCTIONS ====================

// Show message to user
function showMessage(text, type = 'info') {
    // Check if message container exists, if not create one
    let msgContainer = document.getElementById('message-container');
    
    if (!msgContainer) {
        msgContainer = document.createElement('div');
        msgContainer.id = 'message-container';
        msgContainer.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(msgContainer);
    }
    
    // Create message element
    const msg = document.createElement('div');
    msg.style.cssText = `
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 24px;
        border-radius: 5px;
        margin-bottom: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    msg.textContent = text;
    
    msgContainer.appendChild(msg);
    
    // Remove after 3 seconds
    setTimeout(() => {
        msg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => msg.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== PAGE NAVIGATION ====================

// For single-page version only - if using multi-page HTML files, this isn't needed
window.showPage = function(pageName) {
    // Hide all pages
    const pages = ['home', 'products', 'cart', 'checkout', 'confirmation', 'about', 'contact'];
    pages.forEach(page => {
        const element = document.getElementById(page + '-page');
        if (element) element.style.display = 'none';
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageName + '-page');
    if (selectedPage) {
        selectedPage.style.display = 'block';
        
        // Reload page-specific content
        if (pageName === 'products' || pageName === 'home') {
            loadPageProducts();
        }
        if (pageName === 'cart') {
            displayCart();
        }
        if (pageName === 'checkout') {
            displayOrderSummary();
        }
        if (pageName === 'confirmation') {
            loadConfirmation();
        }
    }
    
    // Update active menu
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick')?.includes(pageName)) {
            link.classList.add('active');
        }
    });
};

// ==================== EXPORT FUNCTIONS TO GLOBAL SCOPE ====================
// All functions are already attached to window object
// This ensures they work with onclick handlers in HTML

console.log('✅ Navin Chocolate Shop JavaScript Loaded');
