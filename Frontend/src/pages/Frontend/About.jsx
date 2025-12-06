import React from "react";

import AboutFounder from '../../components/Frontend/AboutFounder';
import HowAllStartedSection from '../../components/Frontend/HowAllStartedSection';
import HeroSection2 from '../../Components/Frontend/Herosection2'

const AboutPage = () => (
  <>
  <HeroSection2 subHeading="A few words" mainHeading="About us"/>
  <div className="about-page max-w-7xl mx-auto px-5 py-10 font-serif text-gray-900">
    <AboutFounder />
    <HowAllStartedSection />
    
  </div>
  </>
);

export default AboutPage;
