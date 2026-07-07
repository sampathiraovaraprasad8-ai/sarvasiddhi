import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [wishlist, setWishlist] = useState([]);
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine base API url (uses environment variable in production, empty for local proxying)
  const API_URL = import.meta.env.VITE_API_URL || '';

  // Fetch logged in user profile and their wishlist
  useEffect(() => {
    const loadUserAndData = async () => {
      if (!token) {
        setUser(null);
        setWishlist([]);
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // Fetch wishlist for authenticated user
          const wishlistRes = await fetch(`${API_URL}/api/wishlist`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (wishlistRes.ok) {
            const wishlistData = await wishlistRes.json();
            setWishlist(wishlistData);
          }
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Error fetching user context:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserAndData();
  }, [token]);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Handle Authentication
  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setWishlist([]);
  };

  // Cart Functions
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateCartQty = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist Functions
  const toggleWishlist = async (product) => {
    // If guest, alert to login
    if (!token) {
      alert('Please log in or register to save items in your wishlist.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/wishlist/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.added) {
          setWishlist(prev => [...prev, product]);
        } else {
          setWishlist(prev => prev.filter(p => p.id !== product.id));
        }
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => p.id === productId);
  };

  // Notification management (For admin)
  const fetchNotifications = async () => {
    if (!token || user?.role !== 'admin') return;
    try {
      const res = await fetch(`${API_URL}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
    }
  };

  const clearNotifications = async () => {
    if (!token || user?.role !== 'admin') return;
    try {
      const res = await fetch(`${API_URL}/api/admin/notifications/clear`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActiveNotifications([]);
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const markNotificationRead = async (id) => {
    if (!token || user?.role !== 'admin') return;
    try {
      const res = await fetch(`${API_URL}/api/admin/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActiveNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  // Periodically poll for notifications if admin is logged in
  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [token, user]);

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        loading,
        cart,
        wishlist,
        activeNotifications,
        API_URL,
        login,
        logout,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        toggleWishlist,
        isInWishlist,
        fetchNotifications,
        clearNotifications,
        markNotificationRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
