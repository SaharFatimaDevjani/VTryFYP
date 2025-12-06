import React from 'react';

import HeroSection from '../../Components/Frontend/HeroSection';
import BrandSlider from '../../Components/Frontend/BrandSlider';
import ProductSection from '../../Components/Frontend/ProductSection'
import AlwaysOnTrend from '../../Components/Frontend/AlwaysOnTrend'
import WhyChooseUs from '../../Components/Frontend/WhyChooseUs'

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


export default function App() {
  return (
    <>
      <HeroSection/>
      <BrandSlider />
      <ProductSection title="Trending Now" />
      <ProductSection title="Best Selling" />
      <AlwaysOnTrend />
      <WhyChooseUs />
    </>
  );
}
