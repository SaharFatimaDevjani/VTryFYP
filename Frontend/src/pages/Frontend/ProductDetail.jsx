import React, { useState } from 'react';
import ProductDetails from '../../components/Frontend/ProductDetails';
import DescriptionAndReviews from '../../components/Frontend/DescriptionAndReviews';
import RelatedProducts from '../../components/Frontend/RelatedProducts';

const relatedProducts = [
  { id: 12, name: 'Product Name 12',
    price: 350,
     img: 'https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/earrings-03-a-240x300.jpg' },
  { id: 7, name: 'Product Name 7', price: 500,
     img: 'https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/earrings-05-a-240x300.jpg' },
  { id: 8, name: 'Product Name 8', price: 390, oldPrice: 450,
     img: 'https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/earrings-01-a-240x300.jpg', sale: true },
  { id: 11, name: 'Product Name 11', price: 400,
     img: 'https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/earrings-06-a-240x300.jpg' },
];
const thumbnails = [
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80" 
 ];

const product = {
  name: 'Product Name 10',
  price: 1700,
  description: 'This is a description of the product.',
};

export default function ProductDetail() {
  const [quantity, setQuantity] = useState(1);
  const [selectedImg, setSelectedImg] = useState(thumbnails[0]);

  const increaseQty = () => setQuantity((qty) => qty + 1);
  const decreaseQty = () => setQuantity((qty) => (qty > 1 ? qty - 1 : 1));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <ProductDetails
        product={product}
        thumbnails={thumbnails}
        setSelectedImg={setSelectedImg}
        selectedImg={selectedImg}
        increaseQty={increaseQty}
        decreaseQty={decreaseQty}
        quantity={quantity}
      />
      <DescriptionAndReviews product={product} />
      <RelatedProducts relatedProducts={relatedProducts} />
    </div>
  );
}
