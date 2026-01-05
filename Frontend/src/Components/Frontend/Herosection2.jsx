import React from "react";
import heroImg from "../../assets/hero2.png"; // ✅ make sure file exists in src/assets/hero2.png

export default function HeroSection2({ subHeading, mainHeading }) {
  return (
    <section
      className="relative h-[50vh] bg-cover bg-center flex items-center justify-center overflow-hidden"
      style={{ backgroundImage: `url(${heroImg})` }}
    >
      {/* ✅ Premium overlay: dark on left/center (text), lighter on right (jewelry) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/20" />

      {/* ✅ Extra soft vignette for premium depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.10),rgba(0,0,0,0.55))]" />

      {/* Text */}
      <div className="relative text-center text-white px-4">
        <h6 className="text-sm md:text-base uppercase tracking-widest mb-3 text-gray-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
          {subHeading}
        </h6>

        <h1 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
          {mainHeading}
        </h1>

        {/* small premium accent line under heading (optional but looks great) */}
        <div className="mx-auto mt-5 h-[3px] w-16 rounded-full bg-[#E1C16E] opacity-90" />
      </div>
    </section>
  );
}
