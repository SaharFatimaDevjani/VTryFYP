import React from "react";

const logos = [
  "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/logo-008.png",
  "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/logo-008.png",
  "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/logo-008.png",
  "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/logo-008.png",
  "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/logo-008.png",
];

export default function BrandSlider() {
  return (
    <section className="py-10 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-10 whitespace-nowrap animate-scroll">
          {logos.concat(logos).map((logo, i) => (
            <img
              key={i}
              src={logo}
              alt={`brand-${i}`}
              className="h-32 inline-block object-contain"
              loading="lazy"
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </section>
  );
}
