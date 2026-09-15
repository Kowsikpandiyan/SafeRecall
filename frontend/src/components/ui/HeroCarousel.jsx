import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Shield, BookOpen, Award, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: 'NATIONAL ENGINEERING COLLEGE PORTAL',
    subtitle: 'Enterprise Product Traceability, Marketplace & Recall Management System',
    description: 'Empowering manufacturers, retail shops, and customers with verified supply chain transparency.',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1400&auto=format&fit=crop&q=80',
    buttonText: 'Explore Marketplace',
    buttonLink: '/customer/marketplace',
    badge: 'NEC LMS PLATFORM'
  },
  {
    id: 2,
    title: 'BATCH TRACEABILITY & LINEAGE CONTROL',
    subtitle: 'End-to-End Multi-Tier Supply Tracking & Recalls',
    description: 'Track products from initial manufacturing batches to retail distributors and end customer orders.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1400&auto=format&fit=crop&q=80',
    buttonText: 'Trace Batch Lineage',
    buttonLink: '/manager/traceability',
    badge: 'SUPPLY CHAIN SECURITY'
  },
  {
    id: 3,
    title: 'RETAIL DISTRIBUTOR OPERATIONS HUB',
    subtitle: 'Acquire Verified Manufacturer Stock & Serve Customers',
    description: 'Streamline shop inventory purchases, order fulfillments, and automated return processing.',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1400&auto=format&fit=crop&q=80',
    buttonText: 'View Shop Operations',
    buttonLink: '/shop',
    badge: 'DISTRIBUTOR PORTAL'
  }
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="hero-slider-container">
      {/* Background Image Slide */}
      <div
        className="hero-slide-bg"
        style={{ backgroundImage: `url(${slide.image})` }}
      />

      {/* Hero Content Overlay */}
      <div className="hero-slide-overlay">
        <div style={{ maxWidth: '680px', color: '#ffffff' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            padding: '0.3rem 0.8rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <Shield size={14} />
            <span>{slide.badge}</span>
          </div>

          <h1 style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {slide.title}
          </h1>

          <h2 style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#e2e8f0',
            marginBottom: '0.75rem'
          }}>
            {slide.subtitle}
          </h2>

          <p style={{
            fontSize: '0.9rem',
            color: '#cbd5e1',
            marginBottom: '1.75rem',
            lineHeight: 1.5
          }}>
            {slide.description}
          </p>

          <Link
            to={slide.buttonLink}
            className="btn btn-lg"
            style={{
              backgroundColor: '#ffffff',
              color: '#0f4c81',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}
          >
            <span>{slide.buttonText}</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Navigation Arrow Controls */}
      <button
        onClick={prevSlide}
        className="btn-ghost"
        style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          color: '#ffffff',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}
        title="Previous Slide"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="btn-ghost"
        style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          color: '#ffffff',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}
        title="Next Slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicator Dots */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '0.5rem',
        zIndex: 10
      }}>
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            style={{
              width: currentSlide === idx ? '24px' : '8px',
              height: '8px',
              borderRadius: '999px',
              backgroundColor: currentSlide === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
