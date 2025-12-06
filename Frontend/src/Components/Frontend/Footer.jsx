import React from "react";
import logo from '../../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-[#fdf8f3] text-gray-700 border-t text-sm">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo Section */}
        <div>
          {/* <h2 className="text-2xl font-serif mb-1">BLINGG</h2>
          <p className="text-xs tracking-widest text-gray-500">JEWELRY STORE</p> */}
           <img src={logo} alt="logo" className="w-20 h-12" />
        </div>

        {/* About Us */}
        <div>
          <h3 className="font-semibold mb-2 text-black">About us</h3>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">About</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
          </ul>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="font-semibold mb-2 text-black">Shop</h3>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Rings</a></li>
            <li><a href="#" className="hover:underline">Bracelets</a></li>
            <li><a href="#" className="hover:underline">Earrings</a></li>
            <li><a href="#" className="hover:underline">Necklaces</a></li>
          </ul>
        </div>

        {/* Address */}
        <div>
          <h3 className="font-semibold mb-2 text-black">Address</h3>
          <address className="not-italic space-y-1 text-sm text-gray-700">
            <p>123 Fifth Avenue, New York,</p>
            <p>NY 10160</p>
            <p><a href="mailto:contact@info.com" className="hover:underline">contact@info.com</a></p>
            <p><a href="tel:+19292426868" className="hover:underline">929-242-6868</a></p>
          </address>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t text-center py-4 text-xs text-gray-600">
        Copyright © 2025 Vtry | Powered by Vtry
      </div>
    </footer>
  );
}
