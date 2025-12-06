import React from 'react';

const RelatedProducts = ({ relatedProducts }) => {
  return (
    <section className="mt-20">
      <h3 className="text-2xl font-serif mb-6">Related Products</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-7xl">
        {relatedProducts.map((product) => (
          <div key={product.id} className="space-y-2 cursor-pointer">
            <div className="relative">
              {product.sale && (
                <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold z-10">Sale!</span>
              )}
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-48 object-contain border border-gray-300"
              />
            </div>
            <h4 className="font-serif text-sm tracking-wide">{product.name}</h4>
            <p className="text-sm">
              {product.oldPrice && (
                <span className="line-through text-gray-400 mr-2">${product.oldPrice.toFixed(2)}</span>
              )}
              <span className="font-semibold">${product.price.toFixed(2)}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
