import React, { useState } from "react";

// Initial Cart data
const initialCart = [
  {
    id: 10,
    name: "Product Name 10",
    price: 1700,
    quantity: 1,
    image:
      "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/earrings-03-a-240x300.jpg",
  },
];

const Cart = () => {
  const [cartItems, setCartItems] = useState(initialCart);

  // Increment Quantity of a Product
  const incrementQuantity = (id) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrement Quantity of a Product
  const decrementQuantity = (id) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Remove an item from Cart
  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  // Calculate the subtotal of all products in the cart
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  };

  return (
    <div className="min-h-screen bg-white font-serif font-light flex flex-col items-center pt-8">
      <h2 className="text-2xl tracking-wide mb-10 font-serif font-normal uppercase text-[#222]">Cart</h2>

      {/* Progress Steps */}
      <div className="mb-12 text-xs flex gap-4 font-semibold text-gray-400 items-center">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#a37f58] text-white">1</span>
        <span className="text-[#a37f58] font-semibold tracking-wide">SHOPPING CART</span>
        <span className="text-lg">&gt;</span>
        <span className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 text-gray-400">2</span>
        <span className="text-gray-400 tracking-wide">CHECKOUT DETAILS</span>
        <span className="text-lg">&gt;</span>
        <span className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 text-gray-400">3</span>
        <span className="text-gray-400 tracking-wide">ORDER COMPLETE</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-6xl">
        {/* Cart Table */}
        <div className="flex-1">
          <div className="overflow-x-auto border border-[#f0e9e0] rounded-md bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[#f9f3eb] font-semibold text-xs text-gray-700">
                <tr>
                  <th className="p-4 text-left font-serif font-semibold">Product</th>
                  <th className="p-4 text-left font-serif font-semibold">Price</th>
                  <th className="p-4 text-center font-serif font-semibold">Quantity</th>
                  <th className="p-4 text-right font-serif font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(({ id, name, price, quantity, image }) => (
                  <tr key={id} className="bg-white border-b border-[#f0e9e0] last:border-b-0">
                    <td className="p-4 flex items-center gap-4 min-w-[220px]">
                      <button
                        onClick={() => removeItem(id)}
                        className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-600 transition-colors duration-150"
                        aria-label="Remove item"
                      >
                        &#x2715;
                      </button>
                      <div className="w-16 h-16 border border-dashed border-gray-300 flex items-center justify-center bg-[#faf7f2]">
                        <img
                          src={image}
                          alt={name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <span className="font-serif text-base text-[#222]">{name}</span>
                    </td>
                    <td className="p-4 text-left text-[#222] font-serif">${price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="p-4 text-center">
                      <div className="inline-flex border border-gray-300 rounded-md overflow-hidden bg-white">
                        <button
                          onClick={() => decrementQuantity(id)}
                          className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 transition"
                        >
                          -
                        </button>
                        <span className="w-10 h-7 flex items-center justify-center text-sm font-serif">
                          {quantity}
                        </span>
                        <button
                          onClick={() => incrementQuantity(id)}
                          className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 transition"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right text-[#222] font-serif">${(price * quantity).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cart Totals */}
        <div className="w-full mb-8 max-w-xs self-start border border-[#f0e9e0] rounded-md p-6 bg-[#f9f3eb] font-serif font-semibold uppercase text-xs tracking-wide shadow-sm">
          <h3 className="mb-4 text-base font-serif font-semibold text-[#222]">Cart Totals</h3>
          <div className="flex justify-between border-b border-[#e4dbd1] py-2 font-normal">
            <span className="font-normal normal-case text-[#222]">Subtotal</span>
            <span className="text-[#222]">${calculateSubtotal().toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[#222]">Total</span>
            <span className="text-[#222]">${calculateSubtotal().toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>

          <label
            htmlFor="coupon"
            className="block text-xs mt-3 text-gray-600 font-normal normal-case"
          >
            Have a coupon?
          </label>
          <input
            id="coupon"
            type="text"
            className="w-full border border-gray-300 mt-1 mb-4 px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#a37f58] transition"
            placeholder="Enter coupon code"
          />

          <button className="w-full border border-black uppercase text-xs tracking-widest py-2 mt-2 hover:bg-black hover:text-white transition font-serif font-semibold rounded-none">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
