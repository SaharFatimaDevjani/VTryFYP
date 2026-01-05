import React from "react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  // Local hero image
  const heroUrl = "/src/assets/hero.png";

  return (
    <section className="w-full">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-black">
          {/* Background image */}
          <img
            src={heroUrl}
            alt="Accessories hero"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />

          {/* Premium overlay (no shadow, better contrast) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />

          {/* Content */}
          <div className="relative z-10 p-8 md:p-14">
            <p className="text-white/80 text-sm md:text-base">
              Accessories for Him &amp; Her
            </p>

            <h1 className="mt-2 text-white text-3xl md:text-5xl font-extrabold leading-tight">
              Elevate your style with premium accessories
            </h1>

            <p className="mt-4 text-white/80 max-w-xl text-sm md:text-base leading-relaxed">
              Watches, jewelry, and curated pieces — designed for both men and women.
              Shop the latest arrivals and best sellers.
            </p>

            {/* Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {/* Primary – Vanilla Gold */}
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl
           bg-[#E1C16E] text-[#111111] font-semibold
           hover:bg-[#C9A24D] transition-all duration-300"

              >
                Shop Now
              </Link>

              {/* Secondary – Gold outline */}
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl
           border border-[#E1C16E] text-[#E1C16E] font-semibold
           hover:bg-[#C9A24D]/10 transition-all duration-300"

              >
                Contact Us
              </Link>
            </div>

            {/* Tags */}
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs border border-white/15">
                Men
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs border border-white/15">
                Women
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs border border-white/15">
                Watches
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs border border-white/15">
                Jewelry
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
