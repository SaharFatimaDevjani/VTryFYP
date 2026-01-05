import React from "react";
import {
  FaShippingFast,
  FaCreditCard,
  FaBoxOpen,
  FaTags,
  FaMapMarkerAlt,
} from "react-icons/fa";

const GOLD = "#E1C16E";

const benefits = [
  { icon: <FaTags />, title: "Big Discounts" },
  { icon: <FaShippingFast />, title: "Free Shipping" },
  { icon: <FaCreditCard />, title: "Secure Payments" },
  { icon: <FaMapMarkerAlt />, title: "Order Tracking" },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p
          className="text-xs uppercase tracking-[0.25em] mb-2"
          style={{ color: GOLD }}
        >
          Best in business
        </p>

        <h2 className="text-3xl font-serif mb-4 text-gray-900">
          Why choose us
        </h2>

        <div
          className="mx-auto mb-6 h-[2px] w-20"
          style={{ backgroundColor: GOLD }}
        />

        <p className="max-w-2xl mx-auto text-sm text-gray-600 mb-12">
          Cras malesuada dolor sit amet est egestas ullamcorper.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {benefits.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-sm"
            >
              <div
                className="text-3xl mb-4"
                style={{ color: GOLD }}
              >
                {item.icon}
              </div>

              <h4 className="font-semibold text-gray-900">
                {item.title}
              </h4>

              <p className="text-gray-500 text-xs mt-2 max-w-[180px]">
                Lorem ipsum dolor sit amet risus.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
