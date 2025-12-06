import React from "react";
import { useNavigate } from "react-router-dom";

const products = [
  {
    id: 10,
    name: "Product Name 10",
    price: "$1,700.00",
    image:
      "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/bracelet-01-a-600x750.jpg",
  },
  {
    id: 11,
    name: "Product Name 11",
    price: "$400.00",
    image:
      "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/earrings-04-a-240x300.jpg",
  },
  {
    id: 12,
    name: "Product Name 12",
    price: "$350.00",
    image:
      "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/earrings-05-a-240x300.jpg",
  },
  {
    id: 13,
    name: "Product Name 12",
    price: "$350.00",
    image:
      "https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/earrings-04-a-240x300.jpg",
  },
];

export default function ProductSection({ title }) {
  const navigate = useNavigate();

  const handleClick = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <section className="py-10 text-center">
      <h2 className="text-2xl font-serif mb-2">{title}</h2>
      <div className="mx-auto w-16 border-b-2 border-black mb-6"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="text-left cursor-pointer"
            onClick={() => handleClick(product.id)}
          >
            <img
              src={product.image}
              alt={product.name}
              className="aspect-square w-full object-cover mb-2"
            />
            <h4 className="text-sm">{product.name}</h4>
            <p className="text-sm font-semibold">{product.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
