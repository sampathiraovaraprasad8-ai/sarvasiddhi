const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'db.json');

// Initialize database template
const defaultDb = {
  users: [],
  products: [],
  wishlists: [],
  orders: [],
  offers: []
};

// Thread-safe-ish memory cache
let dbCache = null;

// Read helper
function readDb() {
  if (dbCache) return dbCache;
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      dbCache = JSON.parse(data);
      return dbCache;
    }
  } catch (err) {
    console.error('Error reading database file, using fallback:', err);
  }
  
  // Create default and write it
  dbCache = JSON.parse(JSON.stringify(defaultDb));
  writeDb();
  return dbCache;
}

// Write helper
function writeDb() {
  if (!dbCache) return;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(dbCache, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to database file:', err);
  }
}

// Seed Initial Data
function seedDatabase() {
  const db = readDb();
  let changed = false;

  // 1. Seed Admin user if not exists
  const adminEmail = 'admin@sarvasiddhi.com';
  const existingAdmin = db.users.find(u => u.email === adminEmail);
  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('admin123', salt);
    db.users.push({
      id: 1,
      name: 'Sarvasiddhi Admin',
      email: adminEmail,
      password_hash: passwordHash,
      role: 'admin',
      created_at: new Date().toISOString()
    });
    changed = true;
    console.log('Seeded admin user: admin@sarvasiddhi.com / admin123');
  }

  // 2. Seed default products if empty
  if (db.products.length === 0) {
    const defaultProducts = [
      {
        id: 1,
        title: "Sarvasiddhi Premium Daily Pooja Kit",
        description: "A complete, carefully curated daily prayer kit. Includes premium sandalwood incense sticks (agarbatti), organic pure haldi, handpicked kumkum, high-grade camphor, cotton wicks, and pure sesame oil for lighting diyas. Ideal for daily home prayer rituals.",
        category: "Pooja Kits",
        price: 499,
        sale_price: 349,
        image_url: "https://images.unsplash.com/photo-1609137144813-7d7274017b2b?q=80&w=600",
        stock: 50,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: "Maha Laxmi Kubera Festive Pooja Kit",
        description: "Specially prepared for festive celebrations like Diwali, Varalakshmi Vratam, and Dhanteras. This premium kit contains Laxmi and Ganesh gold-plated coins, gangajal, pure honey, dry fruits, shree yantra, subh-labh decals, and a step-by-step guidebook to perform the puja with authentic Vedic mantras.",
        category: "Pooja Kits",
        price: 1299,
        sale_price: 999,
        image_url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=600",
        stock: 20,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        title: "Handcrafted Brass Ganesha Idol (6-inch)",
        description: "Bring auspicious energy into your home with this masterfully handcrafted brass Lord Ganesha idol. Featuring intricate detailing, traditional designs, and finished with a protective layer. Hand-molded by local artisans in India.",
        category: "Spiritual Idols",
        price: 2499,
        sale_price: 1999,
        image_url: "https://images.unsplash.com/photo-1608976483483-7d9a10271509?q=80&w=600",
        stock: 15,
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        title: "Pure Marble Dust Radha Krishna Statue",
        description: "An elegant, divine Radha Krishna statue sculpted from premium marble dust and painted with vibrant, durable colors. Perfect for your home mandir, study room, or as a highly auspicious housewarming gift.",
        category: "Spiritual Idols",
        price: 3999,
        sale_price: 3299,
        image_url: "https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=600",
        stock: 8,
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        title: "Organic Sandalwood Dhoop Cups (Box of 12)",
        description: "100% natural, charcoal-free dhoop cups made from organic cow dung, pure herbs, and premium Mysore sandalwood powder. Fills your room with a calming, meditative, and purificatory fragrance that lasts for hours.",
        category: "Incense & Fragrances",
        price: 199,
        sale_price: 149,
        image_url: "https://images.unsplash.com/photo-1612538498456-e861df91d4d0?q=80&w=600",
        stock: 100,
        created_at: new Date().toISOString()
      },
      {
        id: 6,
        title: "Premium Natural Sambrani Cups (Box of 24)",
        description: "Traditional Sambrani cups loaded with natural resin. When burnt, they produce a rich balsamic aroma that drives away negative energy, purifies the atmosphere, and keeps insects at bay.",
        category: "Incense & Fragrances",
        price: 299,
        sale_price: 229,
        image_url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600",
        stock: 75,
        created_at: new Date().toISOString()
      },
      {
        id: 7,
        title: "Classic Solid Brass Panch Aarti Diya",
        description: "A beautifully balanced, heavy-duty brass Diya with five oil-retaining notches and an elegant carved handle. Perfect for performing regular sandhya aarti with camphor or oil wicks.",
        category: "Pooja Essentials",
        price: 799,
        sale_price: 599,
        image_url: "https://images.unsplash.com/photo-1543157148-f7911985088a?q=80&w=600",
        stock: 30,
        created_at: new Date().toISOString()
      },
      {
        id: 8,
        title: "Pure Copper Ganga Kalash (Medium)",
        description: "An authentic, heavy-gauge copper Kalash (Lota) traditionally used for storing water, performing Abhishek, and offering prayers. Storing water in copper has natural ayurvedic health benefits.",
        category: "Pooja Essentials",
        price: 450,
        sale_price: 349,
        image_url: "https://images.unsplash.com/photo-1567593374894-4196b67702f1?q=80&w=600",
        stock: 40,
        created_at: new Date().toISOString()
      }
    ];
    db.products = defaultProducts;
    changed = true;
    console.log('Seeded default products');
  }

  // 3. Seed default offers
  if (db.offers.length === 0) {
    const defaultOffers = [
      {
        id: 1,
        code: "DEV20",
        discount_percentage: 20,
        description: "20% off on all items for our grand launch!",
        is_active: true
      },
      {
        id: 2,
        code: "FESTIVE10",
        discount_percentage: 10,
        description: "10% off for the festive prayer season.",
        is_active: true
      }
    ];
    db.offers = defaultOffers;
    changed = true;
    console.log('Seeded default discount offers');
  }

  if (changed) {
    writeDb();
  }
}

// Initial Seed Call
seedDatabase();

// DATABASE API EXPORTS
const dbAPI = {
  // Users
  getUsers() {
    const db = readDb();
    return db.users;
  },
  getUserByEmail(email) {
    const db = readDb();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  getUserById(id) {
    const db = readDb();
    return db.users.find(u => u.id === parseInt(id));
  },
  createUser(name, email, password, role = 'customer') {
    const db = readDb();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error('Email already registered');
    
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    
    const newId = db.users.reduce((max, u) => u.id > max ? u.id : max, 0) + 1;
    const user = {
      id: newId,
      name,
      email,
      password_hash: passwordHash,
      role: role,
      created_at: new Date().toISOString()
    };
    db.users.push(user);
    writeDb();
    
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Products
  getProducts() {
    const db = readDb();
    return db.products;
  },
  getProductById(id) {
    const db = readDb();
    return db.products.find(p => p.id === parseInt(id));
  },
  createProduct(productData) {
    const db = readDb();
    const newId = db.products.reduce((max, p) => p.id > max ? p.id : max, 0) + 1;
    const newProduct = {
      id: newId,
      title: productData.title,
      description: productData.description,
      category: productData.category,
      price: parseFloat(productData.price),
      sale_price: productData.sale_price ? parseFloat(productData.sale_price) : null,
      image_url: productData.image_url || "https://images.unsplash.com/photo-1609137144813-7d7274017b2b?q=80&w=600",
      stock: parseInt(productData.stock) || 0,
      created_at: new Date().toISOString()
    };
    db.products.push(newProduct);
    writeDb();
    return newProduct;
  },
  updateProduct(id, productData) {
    const db = readDb();
    const index = db.products.findIndex(p => p.id === parseInt(id));
    if (index === -1) throw new Error('Product not found');
    
    db.products[index] = {
      ...db.products[index],
      title: productData.title,
      description: productData.description,
      category: productData.category,
      price: parseFloat(productData.price),
      sale_price: productData.sale_price ? parseFloat(productData.sale_price) : null,
      image_url: productData.image_url || db.products[index].image_url,
      stock: parseInt(productData.stock) || 0
    };
    writeDb();
    return db.products[index];
  },
  deleteProduct(id) {
    const db = readDb();
    const index = db.products.findIndex(p => p.id === parseInt(id));
    if (index === -1) throw new Error('Product not found');
    
    const deleted = db.products.splice(index, 1);
    // clean wishlists references
    db.wishlists = db.wishlists.filter(w => w.product_id !== parseInt(id));
    writeDb();
    return deleted[0];
  },

  // Wishlist
  getWishlist(userId) {
    const db = readDb();
    const productIds = db.wishlists
      .filter(w => w.user_id === parseInt(userId))
      .map(w => w.product_id);
    
    return db.products.filter(p => productIds.includes(p.id));
  },
  toggleWishlist(userId, productId) {
    const db = readDb();
    const uId = parseInt(userId);
    const pId = parseInt(productId);
    
    const index = db.wishlists.findIndex(w => w.user_id === uId && w.product_id === pId);
    let added = false;
    
    if (index === -1) {
      db.wishlists.push({ user_id: uId, product_id: pId });
      added = true;
    } else {
      db.wishlists.splice(index, 1);
    }
    writeDb();
    return { added };
  },

  // Orders
  getOrders() {
    const db = readDb();
    // Return all orders sorted by date desc
    return [...db.orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  getOrdersByUser(userId) {
    const db = readDb();
    return db.orders
      .filter(o => o.user_id === parseInt(userId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  createOrder(orderData) {
    const db = readDb();
    const newId = db.orders.reduce((max, o) => o.id > max ? o.id : max, 0) + 1;
    
    // Deduct stock for items ordered
    const items = orderData.items.map(item => {
      const product = db.products.find(p => p.id === parseInt(item.product_id));
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
      return {
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        title: product ? product.title : 'Deleted Product'
      };
    });

    const newOrder = {
      id: newId,
      user_id: orderData.user_id ? parseInt(orderData.user_id) : null,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      customer_address: orderData.customer_address,
      items: items,
      total_amount: parseFloat(orderData.total_amount),
      coupon_code: orderData.coupon_code || null,
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    db.orders.push(newOrder);
    writeDb();
    return newOrder;
  },
  updateOrderStatus(id, status) {
    const db = readDb();
    const index = db.orders.findIndex(o => o.id === parseInt(id));
    if (index === -1) throw new Error('Order not found');
    
    const oldStatus = db.orders[index].status;
    db.orders[index].status = status;
    
    // Correct stock adjustments when transitioning to or from Cancelled status
    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      // Order is cancelled, add items back to stock
      db.orders[index].items.forEach(item => {
        const product = db.products.find(p => p.id === item.product_id);
        if (product) {
          product.stock += item.quantity;
        }
      });
    } else if (oldStatus === 'Cancelled' && status !== 'Cancelled') {
      // Order is un-cancelled, deduct items from stock
      db.orders[index].items.forEach(item => {
        const product = db.products.find(p => p.id === item.product_id);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
        }
      });
    }
    
    writeDb();
    return db.orders[index];
  },

  // Offers
  getOffers() {
    const db = readDb();
    return db.offers;
  },
  createOffer(offerData) {
    const db = readDb();
    const newId = db.offers.reduce((max, o) => o.id > max ? o.id : max, 0) + 1;
    const newOffer = {
      id: newId,
      code: offerData.code.toUpperCase(),
      discount_percentage: parseInt(offerData.discount_percentage),
      description: offerData.description,
      is_active: offerData.is_active !== undefined ? offerData.is_active : true
    };
    db.offers.push(newOffer);
    writeDb();
    return newOffer;
  },
  updateOffer(id, offerData) {
    const db = readDb();
    const index = db.offers.findIndex(o => o.id === parseInt(id));
    if (index === -1) throw new Error('Offer not found');
    
    db.offers[index] = {
      ...db.offers[index],
      code: offerData.code.toUpperCase(),
      discount_percentage: parseInt(offerData.discount_percentage),
      description: offerData.description,
      is_active: offerData.is_active
    };
    writeDb();
    return db.offers[index];
  },
  deleteOffer(id) {
    const db = readDb();
    const index = db.offers.findIndex(o => o.id === parseInt(id));
    if (index === -1) throw new Error('Offer not found');
    
    const deleted = db.offers.splice(index, 1);
    writeDb();
    return deleted[0];
  }
};

module.exports = dbAPI;
