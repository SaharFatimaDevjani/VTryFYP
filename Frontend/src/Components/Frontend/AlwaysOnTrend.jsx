import React from 'react';

const modelImg = "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/bg-01.jpg";
const ringImg = "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/bg-02.jpg";

export default function AlwaysOnTrend() {
  return (
    <section className="h-[780px] max-w-7xl mx-auto py-16 relative bg-white justify-center">
      {/* Grid Container */}
      <div className="grid md:grid-cols-3 items-center gap-10">
        {/* Left Text */}
        <div className="max-w-xs space-y-6 md:mt-24">
          <p className="text-xs uppercase text-gray-400 tracking-widest font-sans">Unique pieces</p>
          <h2 className="font-serif text-4xl leading-tight font-semibold whitespace-pre-line" style={{lineHeight: '1.2'}}>
            {'BE\nALWAYS\nON\nTREND'}
          </h2>
          <p className="text-gray-700 text-sm max-w-[280px]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
          </p>
          <button className="border border-black px-8 py-2 text-sm uppercase tracking-wide hover:bg-black hover:text-white transition">
            Shop Now
          </button>
        </div>

        {/* Center Ring Image */}
        <div className="flex justify-center relative">
          <img 
            src={ringImg} 
            alt="Rings" 
            className="z-[2] object-contain rounded-md shadow-md absolute right-0 top-1/2 transform translate-x-[10%] -translate-y-1/4"
          />
        </div>

        {/* Empty div for grid spacing */}
        <div></div>
      </div>

      {/* Model Image - Positioned absolutely to break out of grid */}
      <div className="absolute right-0 top-0">
        <img 
          src={modelImg} 
          alt="Model" 
          className="h-[740px] w-[540px] rounded-md shadow-md"
        />
      </div>
    </section>
  );
}
