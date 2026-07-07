const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./db');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sarvasiddhi_secret_key_108';

// Ensure uploads folder exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// In-memory list for live admin order notifications
let activeNotifications = [];

// Middleware: Authenticate User
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token missing' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Middleware: Check Admin Role
function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Admin access required' });
    }
  });
}

// AUTH ENDPOINTS
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, adminCode } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    let role = 'customer';
    const serverAdminCode = process.env.ADMIN_SECRET_CODE || 'SARVASIDDHI_ADMIN_2026';
    if (adminCode && adminCode.trim() === serverAdminCode) {
      role = 'admin';
    }
    const user = db.createUser(name, email, password, role);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  const bcrypt = require('bcryptjs');
  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password_hash, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password_hash, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// GET REGISTERED USERS LIST (Admin Only)
app.get('/api/admin/users', requireAdmin, (req, res) => {
  try {
    const users = db.getUsers();
    // Exclude password hashes for security
    const safeUsers = users.map(({ password_hash, ...u }) => u);
    res.json(safeUsers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// PRODUCTS ENDPOINTS
app.get('/api/products', (req, res) => {
  res.json(db.getProducts());
});

app.get('/api/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', requireAdmin, (req, res) => {
  try {
    const newProduct = db.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/products/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/products/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted successfully', product: deleted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPLOAD IMAGE ENDPOINT (Admin Only)
app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});


// WISHLIST ENDPOINTS
app.get('/api/wishlist', authenticateToken, (req, res) => {
  res.json(db.getWishlist(req.user.id));
});

app.post('/api/wishlist/:productId', authenticateToken, (req, res) => {
  const result = db.toggleWishlist(req.user.id, req.params.productId);
  res.json(result);
});


// ORDERS ENDPOINTS
app.get('/api/orders', requireAdmin, (req, res) => {
  res.json(db.getOrders());
});

app.get('/api/orders/user', authenticateToken, (req, res) => {
  res.json(db.getOrdersByUser(req.user.id));
});

app.get('/api/orders/track/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  const orders = db.getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ error: 'Order not found. Make sure the ID is correct (e.g. 1, 2).' });
  
  res.json({
    id: order.id,
    customer_name: order.customer_name,
    created_at: order.created_at,
    status: order.status,
    total_amount: order.total_amount,
    items: order.items
  });
});

app.post('/api/orders', (req, res) => {
  const { customer_name, customer_email, customer_phone, customer_address, items, total_amount, coupon_code } = req.body;
  
  if (!customer_name || !customer_phone || !customer_address || !items || !items.length || !total_amount) {
    return res.status(400).json({ error: 'Missing required order details' });
  }

  // Extract optional user ID from token if logged in
  let userId = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.split(' ')[1]) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (e) {
      // Ignore invalid token and place order as guest
    }
  }

  try {
    const order = db.createOrder({
      user_id: userId,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      items,
      total_amount,
      coupon_code
    });

    // Add to live admin notifications
    activeNotifications.push({
      id: order.id,
      customer_name: order.customer_name,
      total_amount: order.total_amount,
      items_count: order.items.reduce((sum, item) => sum + item.quantity, 0),
      timestamp: new Date().toISOString(),
      read: false
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  
  try {
    const updated = db.updateOrderStatus(req.params.id, status);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// OFFERS ENDPOINTS
app.get('/api/offers', (req, res) => {
  res.json(db.getOffers());
});

app.post('/api/offers', requireAdmin, (req, res) => {
  try {
    const offer = db.createOffer(req.body);
    res.status(201).json(offer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/offers/:id', requireAdmin, (req, res) => {
  try {
    const updated = db.updateOffer(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/offers/:id', requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteOffer(req.params.id);
    res.json({ message: 'Offer deleted successfully', offer: deleted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ADMIN NOTIFICATIONS ENDPOINTS
app.get('/api/admin/notifications', requireAdmin, (req, res) => {
  res.json(activeNotifications);
});

app.post('/api/admin/notifications/clear', requireAdmin, (req, res) => {
  activeNotifications = [];
  res.json({ message: 'Notifications cleared' });
});

app.post('/api/admin/notifications/:id/read', requireAdmin, (req, res) => {
  const notifId = parseInt(req.params.id);
  const notif = activeNotifications.find(n => n.id === notifId);
  if (notif) {
    notif.read = true;
  }
  res.json({ message: 'Notification marked as read' });
});


// Serve Static Assets in Production
app.use(express.static(path.join(__dirname, 'sarvasiddhi/dist')));

// Fallback to React Index.html for Client Routing
app.get('*', (req, res) => {
  // If it's an api request that didn't match, return 404
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'sarvasiddhi/dist/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Sarvasiddhi Backend Server running on port ${PORT} `);
  console.log(` Mode: Production & Development concurrently`);
  console.log(`==================================================`);
});
