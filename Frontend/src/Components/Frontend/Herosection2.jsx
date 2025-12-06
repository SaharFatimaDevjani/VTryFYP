import React from "react";

const heroImg = "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/hero.jpg"; // Replace with your stool image URL


export default function HeroSection2(props) {
  return (
    <section
      className="bg-cover bg-center h-[90vh] flex items-center justify-center"
      style={{ backgroundImage: `url(${heroImg})` }}
    >
      <div className="text-center text-white">
        <h6 className="text-sm uppercase mb-2">{props.subHeading}</h6>
        <h1 className="text-4xl font-bold">{props.mainHeading}</h1>
      </div>
    </section>
  );
}