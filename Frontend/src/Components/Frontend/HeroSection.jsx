// import React from 'react';
const heroImg = "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/hero.jpg"; // Replace with your stool image URL

export default function HeroSection() {
  return (
    <section
      className="bg-cover bg-center h-[90vh] flex items-center justify-start"
      style={{ backgroundImage: `url(${heroImg})` }}
    >
      <div className="bg-opacity-80 p-8 ml-16 max-w-xl rounded shadow">
        <p className="uppercase text-xs mb-2 tracking-widest">New collection</p>
        <h1 className="text-5xl font-serif mb-4 leading-tight">The new ring <br /> sensation</h1>
        <p className="text-sm mb-6 text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
        </p>
        <button className="border border-black px-6 py-2 font-semibold hover:bg-black hover:text-white transition rounded bg-transparent">
          SHOP NOW
        </button>
      </div>
    </section>
  );
}


