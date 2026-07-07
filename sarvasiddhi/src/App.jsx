import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Reusable Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';

// Public Customer Views
import Home from './views/Home';
import Shop from './views/Shop';
import ProductDetail from './views/ProductDetail';
import Cart from './views/Cart';
import Wishlist from './views/Wishlist';
import Checkout from './views/Checkout';
import Login from './views/Login';
import OrderTracking from './views/OrderTracking';
import MyOrders from './views/MyOrders';

// Administrative Views
import Dashboard from './views/Admin/Dashboard';
import Products from './views/Admin/Products';
import Orders from './views/Admin/Orders';
import Offers from './views/Admin/Offers';
import Customers from './views/Admin/Customers';

function AppContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flexGrow: 1 }}>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/track-order" element={<OrderTracking />} />
          <Route path="/my-orders" element={<MyOrders />} />

          {/* Protected Administrative Dashboard Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/products" 
            element={
              <AdminRoute>
                <Products />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <AdminRoute>
                <Orders />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/offers" 
            element={
              <AdminRoute>
                <Offers />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/customers" 
            element={
              <AdminRoute>
                <Customers />
              </AdminRoute>
            } 
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
