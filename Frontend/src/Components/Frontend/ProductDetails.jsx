import React, { useState } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { Link } from 'react-router-dom';

const ProductDetails = ({ product, thumbnails, setSelectedImg, selectedImg, increaseQty, decreaseQty, quantity }) => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left thumbnails */}
        <div className="flex flex-row gap-4 w-full md:w-2/5">
          {/* Main Image */}
          <div className="flex-1 border p-2 rounded flex items-center justify-center">
            <Zoom>
              <img
                src={selectedImg}
                alt="Selected"
                className="w-full h-auto max-h-[400px] object-contain cursor-zoom-in"
              />
            </Zoom>
          </div>
          {/* Thumbnails */}
          <div className="flex flex-col gap-2">
            {thumbnails.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumb ${index}`}
                onClick={() => setSelectedImg(img)}
                className={`w-12 h-12 border p-1 cursor-pointer rounded ${selectedImg === img ? "border-orange-500" : "border-gray-300"}`}
              />
            ))}
          </div>
        </div>

        {/* Product details */}
        <div className="w-full md:w-2/5 space-y-6">
          <h1 className="text-4xl font-serif font-semibold tracking-wide">{product.name}</h1>
          <p className="text-xl font-bold text-rose-600">${product.price} <span className="font-normal text-gray-600">& Free Shipping</span></p>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center space-x-4 mt-6">
            <button onClick={decreaseQty} className="border border-gray-700 px-4 py-1 text-lg font-bold hover:bg-gray-100 transition">-</button>
            <span className="text-lg font-semibold">{quantity}</span>
            <button onClick={increaseQty} className="border border-gray-700 px-4 py-1 text-lg font-bold hover:bg-gray-100 transition">+</button>

            <Link to="/cart">
              <button className="ml-6 px-8 py-2 border border-gray-900 font-semibold hover:bg-black hover:text-white transition">ADD TO CART</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
