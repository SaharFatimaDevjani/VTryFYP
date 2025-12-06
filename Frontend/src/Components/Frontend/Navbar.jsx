import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

export default function Navbar() {
  return (
    <header className="flex justify-between items-center py-4 px-8 border-b text-sm font-medium">
      <nav className="flex space-x-6">
        <Link to="/rings">RINGS</Link>
        <Link to="/bracelets">BRACELETS</Link>
        <Link to="/earrings">EARRINGS</Link>
        <Link to="/necklaces">NECKLACES</Link>
      </nav>
      <div className="text-xl font-bold tracking-wide">
        {/* BLINGG <span className="block text-xs font-light">JEWELRY STORE</span> */}

        {/* <img src={logo} alt="logo" className="w-6 h-6" /> */}
        <img src={logo} alt="logo" className="w-20 h-12" />
      </div>
      <div className="flex space-x-4">
        <Link to="/">HOME</Link>
        <Link to="/about">ABOUT</Link>
        <Link to="/contact">CONTACT</Link>
        <div className="relative">
          <Link to="/cart" className="mr-4">
            <span role="img" aria-label="cart">
              🛒
            </span>{" "}
            Cart
          </Link>

          <span className="absolute -top-2 -right-2 bg-black text-white text-xs px-1 rounded-full">
            1
          </span>
        </div>
      </div>
    </header>
  );
}
