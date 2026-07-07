import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { Package, Sparkles, Wind, Flame, Shield, Award, Compass, RefreshCw } from 'lucide-react';

export default function Home() {
  const { API_URL } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);
  const [categories, setCategories] = useState(['Pooja Kits', 'Spiritual Idols', 'Incense & Fragrances', 'Pooja Essentials']);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const prodRes = await fetch(`${API_URL}/api/products`);
        if (prodRes.ok) {
          const prods = await prodRes.json();
          setFeaturedProducts(prods.slice(0, 4));
          if (prods.length > 0) {
            const uniqueCats = [...new Set(prods.map(p => p.category))];
            setCategories(uniqueCats);
          }
        }

        const offerRes = await fetch(`${API_URL}/api/offers`);
        if (offerRes.ok) {
          const offers = await offerRes.json();
          setActiveOffers(offers.filter(o => o.is_active));
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [API_URL]);

  const handleCategoryClick = (category) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="animate-fade-in spiritual-bg-gradient" style={{ minHeight: '100vh' }}>
      
      {/* Promotional Offers Strip */}
      {activeOffers.length > 0 && (
        <div className="offers-strip">
          ✨ CELEBRATION DISCOUNTS: Apply coupon code <span style={{ color: '#fff', border: '1px dashed #e2a82b', padding: '2px 8px', borderRadius: '4px', margin: '0 5px' }}>{activeOffers[0].code}</span> and receive <b>{activeOffers[0].discount_percentage}% OFF</b> at checkout!
        </div>
      )}

      {/* Hero Section */}
      <section className="hero" style={{ borderBottom: '3px solid var(--color-accent)' }}>
        <div className="container" style={{ padding: '40px 0' }}>
          
          {/* Glass Panel wrapper to avoid plain text/backgrounds */}
          <div className="glass-hero-container">
            {/* Logo Rendering */}
            <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
              <img 
                src="/logo.jpg" 
                alt="Sarvasiddhi Altar Logo" 
                style={{ 
                  width: '90px', 
                  height: '90px', 
                  borderRadius: '50%', 
                  border: '3px solid var(--color-accent)', 
                  boxShadow: '0 0 15px rgba(226, 168, 43, 0.5)' 
                }} 
              />
            </div>
            <span className="hero-subtitle">Welcoming Peace & Auspiciousness Home</span>
            
            {/* Elegant Header styling */}
            <h2 className="hero-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '3.2rem', color: '#ffffff' }}>
              Purity Assured Divine <span style={{ color: 'var(--color-accent)' }} className="gold-text-glow">Pooja Samagri</span>
            </h2>
            
            {/* Elegant ❖ Traditional Separator */}
            <div className="gold-divider">
              <span>❖ ❖ ❖</span>
            </div>

            <p className="hero-description" style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '650px', margin: '0 auto 35px', fontSize: '1.1rem', fontWeight: 300, lineHeight: 1.6 }}>
              Explore our hand-curated collections of organic incense sticks, brass idols, complete spiritual puja boxes, and pure copper essentials. Authentically sourced from sacred sites and hand-crafted with absolute devotion.
            </p>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/shop')} className="btn btn-accent" style={{ padding: '12px 28px' }}>
                Shop Catalog
              </button>
              <button 
                onClick={() => navigate('/shop?category=Pooja Kits')} 
                className="btn btn-secondary" 
                style={{ color: '#fff', borderColor: '#fff', padding: '12px 28px' }}
              >
                Complete Pooja Kits
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Categories Section */}
      <section style={{ padding: '80px 0 40px' }} className="spiritual-bg-gradient">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sacred Collections</h2>
            <div style={{ color: 'var(--color-accent-dark)', fontSize: '1.2rem', margin: '5px 0' }}>❖</div>
            <p className="section-subtitle">Select a category to explore our authentic materials</p>
          </div>
          
          <div className="category-grid">
            {categories.map((cat) => {
              let IconComponent = Package;
              const nameLower = cat.toLowerCase();
              if (nameLower.includes('idol') || nameLower.includes('statue') || nameLower.includes('god') || nameLower.includes('brass')) {
                IconComponent = Sparkles;
              } else if (nameLower.includes('incense') || nameLower.includes('fragrance') || nameLower.includes('dhoop') || nameLower.includes('flame')) {
                IconComponent = Flame;
              } else if (nameLower.includes('essential') || nameLower.includes('kit') || nameLower.includes('box')) {
                IconComponent = Package;
              } else {
                IconComponent = Compass;
              }
              
              return (
                <div key={cat} className="category-card" onClick={() => handleCategoryClick(cat)} style={{ border: '1px solid rgba(226, 168, 43, 0.25)' }}>
                  <div className="category-icon" style={{ backgroundColor: 'rgba(226, 168, 43, 0.1)', color: 'var(--color-accent-dark)' }}>
                    <IconComponent size={28} />
                  </div>
                  <span className="category-name">{cat}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Propositions / Trust Seals */}
      <section style={{ 
        padding: '60px 0', 
        backgroundColor: '#120608', 
        color: '#fff', 
        borderTop: '2px solid var(--color-accent)', 
        borderBottom: '2px solid var(--color-accent)'
      }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
          
          <div style={{ textAlign: 'center', padding: '10px 20px' }}>
            <div style={{ color: 'var(--color-accent)', marginBottom: '15px' }}><Shield size={38} style={{ margin: '0 auto' }} /></div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '10px', color: '#fff', fontFamily: 'var(--font-heading)' }}>100% Purity Guaranteed</h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Chemical-free logs, pure sandalwood powder, and heavy copper/brass alloys. We assure absolute sanctity.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '10px 20px' }}>
            <div style={{ color: 'var(--color-accent)', marginBottom: '15px' }}><Award size={38} style={{ margin: '0 auto' }} /></div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '10px', color: '#fff', fontFamily: 'var(--font-heading)' }}>Artisanal Vedic Craft</h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Idols hand-carved by local master artists in India, preserving traditional Vedic proportions and aesthetics.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '10px 20px' }}>
            <div style={{ color: 'var(--color-accent)', marginBottom: '15px' }}><RefreshCw size={38} style={{ margin: '0 auto' }} /></div>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '10px', color: '#fff', fontFamily: 'var(--font-heading)' }}>Secure Cash on Delivery</h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Order risk-free with cash payments on arrival. Sturdy shock-proof packaging ensures items arrive safely.
            </p>
          </div>

        </div>
      </section>

      {/* Featured Products Section */}
      <section style={{ padding: '80px 0' }} className="spiritual-bg-gradient">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Auspicious Best Sellers</h2>
            <div style={{ color: 'var(--color-accent-dark)', fontSize: '1.2rem', margin: '5px 0' }}>❖</div>
            <p className="section-subtitle">Recommended spiritual items for your daily rituals</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>Loading catalog...</div>
          ) : (
            <>
              <div className="product-grid" style={{ marginBottom: '50px' }}>
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => navigate('/shop')} className="btn btn-primary" style={{ padding: '12px 30px', border: '1px solid var(--color-accent)', backgroundColor: 'var(--color-primary)' }}>
                  View Complete Shop Collection
                </button>
              </div>
            </>
          )}
        </div>
      </section>

    </div>
  );
}
