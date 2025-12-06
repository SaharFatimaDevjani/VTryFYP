import React from 'react';
import { FaShippingFast, FaCreditCard, FaBoxOpen, FaTags, FaMapMarkerAlt } from 'react-icons/fa';

const benefits = [
  { icon: <FaTags />, title: "Big Discounts" },
  { icon: <FaShippingFast />, title: "Free Shipping" },
  { icon: <FaCreditCard />, title: "Secure Payments" },
  { icon: <FaMapMarkerAlt />, title: "Order Tracking" },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 text-center bg-white">
      <p className="text-sm uppercase mb-2">Best in business</p>
      <h2 className="text-2xl font-serif mb-4">Why choose us</h2>
      <p className="max-w-2xl mx-auto text-sm mb-10 text-gray-600">Cras malesuada dolor sit amet est egestas ullamcorper.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {benefits.map((item, i) => (
          <div key={i} className="flex flex-col items-center text-sm">
            <div className="text-2xl mb-2">{item.icon}</div>
            <h4 className="font-medium">{item.title}</h4>
            <p className="text-gray-500 text-xs mt-2">Lorem ipsum dolor sit amet risus.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
