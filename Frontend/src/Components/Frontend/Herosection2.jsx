import React from "react";

const heroImg =
  "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/hero.jpg";

export default function HeroSection2({ subHeading, mainHeading }) {
  return (
    <section
      className="relative h-[50vh] bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${heroImg})` }}
    >
      {/* 🔲 Overlay */}
      <div className="absolute inset-0 bg-black/35"></div>

      {/* 📝 Text */}
      <div className="relative text-center text-white px-4">
        <h6 className="text-sm md:text-base uppercase tracking-widest mb-3 text-gray-200">
          {subHeading}
        </h6>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
          {mainHeading}
        </h1>
      </div>
    </section>
  );
}
