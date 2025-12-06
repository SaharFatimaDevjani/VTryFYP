import React from "react";

import Maps from '../../components/Frontend/Maps';
import MessageUs from '../../components/Frontend/MessageUs';
import HeroSection2 from '../../Components/Frontend/Herosection2'

export default function ContactSection() {
  return (
    <>
      <HeroSection2 subHeading="Get in touch" mainHeading="Contact us"/>
      <MessageUs />
      <Maps />
    </>
  );
}


    