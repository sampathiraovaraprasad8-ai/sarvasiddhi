import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Search, Sparkles, Tag } from 'lucide-react';

export default function Shop() {
  const { API_URL } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(5000);
  const [sortBy, setSortBy] = useState('featured');

  // Autocomplete Suggestions State
  const [suggestions, setSuggestions] = useState({ categories: [], products: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categoriesList = ['All', ...new Set(products.map(p => p.category))];

  // Sync category state with search query parameter if any
  const categoryParam = searchParams.get('category');
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('All');
    }
  }, [categoryParam]);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching shop products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [API_URL]);

  // Handle Autocomplete search suggestions
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query === '') {
      setSuggestions({ categories: [], products: [] });
      setShowSuggestions(false);
      return;
    }

    // Filter categories matching query
    const uniqueCats = [...new Set(products.map(p => p.category))];
    const matchedCategories = uniqueCats.filter(cat => 
      cat.toLowerCase().includes(query)
    );

    // Filter products matching query
    const matchedProducts = products.filter(prod => 
      prod.title.toLowerCase().includes(query)
    ).slice(0, 5); // Limit to top 5 matches

    setSuggestions({
      categories: matchedCategories,
      products: matchedProducts
    });
    setShowSuggestions(matchedCategories.length > 0 || matchedProducts.length > 0);
  }, [searchQuery, products]);

  // Filter and sort items
  useEffect(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Search Query Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // Price Filter
    result = result.filter(p => {
      const actualPrice = p.sale_price !== null && p.sale_price < p.price ? p.sale_price : p.price;
      return actualPrice <= priceRange;
    });

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => {
        const pA = a.sale_price !== null ? a.sale_price : a.price;
        const pB = b.sale_price !== null ? b.sale_price : b.price;
        return pA - pB;
      });
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => {
        const pA = a.sale_price !== null ? a.sale_price : a.price;
        const pB = b.sale_price !== null ? b.sale_price : b.price;
        return pB - pA;
      });
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery, priceRange, sortBy]);

  const handleCategoryTab = (category) => {
    if (category === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const handleSuggestionClickCategory = (catName) => {
    setSearchParams({ category: catName });
    setSelectedCategory(catName);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSuggestionClickProduct = (prodId) => {
    setShowSuggestions(false);
    navigate(`/product/${prodId}`);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <div className="section-header" style={{ marginBottom: '30px' }}>
        <h2 className="section-title">Divine Sanctuary Shop</h2>
        <p className="section-subtitle">Auspicious items to enrich your mandir and lifestyle</p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: 'var(--border-radius-md)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '40px',
        border: '1px solid rgba(92,6,18,0.05)',
        display: 'grid',
        gridTemplateColumns: '1fr 200px 180px',
        gap: '20px',
        alignItems: 'center'
      }}>
        {/* Search Input with Autocomplete Dropdown */}
        <div style={{ position: 'relative' }} onMouseLeave={() => setShowSuggestions(false)}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search items or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(suggestions.categories.length > 0 || suggestions.products.length > 0)}
            className="form-input"
            style={{ paddingLeft: '45px' }}
          />

          {/* Autocomplete Dropdown Box */}
          {showSuggestions && (
            <div className="search-suggestions-box">
              {/* Category Suggestions */}
              {suggestions.categories.length > 0 && (
                <div>
                  <div style={{ padding: '8px 20px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-accent-dark)', textTransform: 'uppercase', backgroundColor: '#fdfbf7' }}>
                    Suggested Categories
                  </div>
                  {suggestions.categories.map((cat, idx) => (
                    <div 
                      key={`cat-${idx}`} 
                      onClick={() => handleSuggestionClickCategory(cat)}
                      className="suggestion-item"
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                        <Tag size={12} /> {cat}
                      </span>
                      <span className="suggestion-tag">Filter Category</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Product Title Suggestions */}
              {suggestions.products.length > 0 && (
                <div>
                  <div style={{ padding: '8px 20px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-accent-dark)', textTransform: 'uppercase', backgroundColor: '#fdfbf7' }}>
                    Suggested Products
                  </div>
                  {suggestions.products.map((prod, idx) => (
                    <div 
                      key={`prod-${idx}`} 
                      onClick={() => handleSuggestionClickProduct(prod.id)}
                      className="suggestion-item"
                    >
                      <span style={{ color: 'var(--color-text-dark)', fontSize: '0.9rem' }}>
                        {prod.title}
                      </span>
                      <span className="suggestion-tag" style={{ backgroundColor: 'rgba(226, 168, 43, 0.1)', color: 'var(--color-accent-dark)' }}>View Item</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Max Price Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
            Max Price: ₹{priceRange}
          </label>
          <input 
            type="range" 
            min="100" 
            max="5000" 
            step="50"
            value={priceRange} 
            onChange={(e) => setPriceRange(parseInt(e.target.value))}
            style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
          />
        </div>

        {/* Sort By */}
        <div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="form-input"
            style={{ cursor: 'pointer' }}
          >
            <option value="featured">Sort by: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Sort by: Newest</option>
          </select>
        </div>
      </div>

      {/* Suggested Quick Filters tags below search */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '-25px', marginBottom: '40px', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={14} /> Suggested Searches:
        </span>
        <button onClick={() => handleSuggestionClickCategory('Pooja Kits')} style={{ border: 'none', background: 'none', color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}>Daily Pooja Kits</button>
        <span style={{ color: '#d1d5db' }}>|</span>
        <button onClick={() => handleSuggestionClickCategory('Spiritual Idols')} style={{ border: 'none', background: 'none', color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}>Ganesha Statues</button>
        <span style={{ color: '#d1d5db' }}>|</span>
        <button onClick={() => handleSuggestionClickCategory('Incense & Fragrances')} style={{ border: 'none', background: 'none', color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }}>Sandalwood Dhoop</button>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center',
        marginBottom: '40px'
      }}>
        {categoriesList.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryTab(cat)}
            className="btn"
            style={{
              backgroundColor: selectedCategory === cat ? 'var(--color-primary)' : 'white',
              color: selectedCategory === cat ? 'var(--color-text-light)' : 'var(--color-primary)',
              borderColor: 'var(--color-primary)',
              borderWidth: '1px',
              borderRadius: '25px',
              padding: '8px 22px',
              fontSize: '0.9rem'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid / Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Loading items...</div>
      ) : filteredProducts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'white',
          borderRadius: 'var(--border-radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--color-primary-dark)' }}>No products found</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>Try modifying your filters, search queries, or price sliders.</p>
          <button 
            onClick={() => { setSearchQuery(''); setPriceRange(5000); handleCategoryTab('All'); }} 
            className="btn btn-primary"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Showing {filteredProducts.length} spiritual items
          </div>
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
