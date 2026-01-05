import React from "react";

const GOLD = "#E1C16E";

const modelImg =
  "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/bg-01.jpg";
const ringImg =
  "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/bg-02.jpg";

export default function AlwaysOnTrend() {
  return (
    <section className="bg-white py-20">
      {/* ✅ left/right spacing */}
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        {/* ✅ tighter two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-6">
          {/* LEFT TEXT */}
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
              Unique pieces
            </p>

            <h2
              className="font-serif text-5xl md:text-6xl font-semibold whitespace-pre-line text-black"
              style={{ lineHeight: "1.05" }}
            >
              {"BE\nALWAYS\nON\nTREND"}
            </h2>

            <div className="h-[2px] w-20" style={{ backgroundColor: GOLD }} />

            <p className="text-gray-700 text-base max-w-md leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
              tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
            </p>

            {/* ✅ gold outline -> gold fill on hover */}
            <button
              className="mt-2 px-10 py-3 text-sm uppercase tracking-widest border rounded-md transition"
              style={{ borderColor: GOLD, color: GOLD, backgroundColor: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = GOLD;
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = GOLD;
              }}
            >
              Shop Now
            </button>
          </div>

          {/* RIGHT IMAGE STACK (closer, overlap like your ss) */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Back image (model) */}
            <img
              src={modelImg}
              alt="Model"
              className="w-[340px] sm:w-[420px] lg:w-[520px] h-[440px] sm:h-[520px] lg:h-[620px] object-cover rounded-md"
            />

            {/* Front image (rings) */}
            <img
              src={ringImg}
              alt="Rings"
              className="
                absolute
                left-4 sm:left-10 lg:left-[-40px]
                top-32 sm:top-40 lg:top-44
                w-[240px] sm:w-[300px] lg:w-[340px]
                h-[280px] sm:h-[340px] lg:h-[380px]
                object-cover
                rounded-md
                bg-white
              "
              style={{ border: "14px solid white" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
