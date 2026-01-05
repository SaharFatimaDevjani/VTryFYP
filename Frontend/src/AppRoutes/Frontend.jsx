import React from "react";
import FrontendLayout from "../Layout/Frontend/index";

import Main from "../pages/Frontend/Main";
import ContactSection from "../pages/Frontend/ContactSection";
import AboutPage from "../pages/Frontend/About";
import ProductDetail from "../pages/Frontend/ProductDetail";
import Cart from "../pages/Frontend/Viewcart";
import Profile from "../pages/Frontend/Profile";
import CategoryProducts from "../pages/Frontend/CategoryProducts";

import Shop from "../pages/Frontend/Shop";        // ✅ NEW
import Checkout from "../pages/Frontend/Checkout"; // ✅ NEW

const FrontendRoute = {
  element: <FrontendLayout />,
  children: [
    { path: "/", element: <Main /> },
    { path: "/shop", element: <Shop /> },           // ✅ NEW
    { path: "/checkout", element: <Checkout /> },   // ✅ NEW
    { path: "/contact", element: <ContactSection /> },
    { path: "/about", element: <AboutPage /> },
    { path: "/product/:productId", element: <ProductDetail /> },
    { path: "/cart", element: <Cart /> },
    { path: "/profile", element: <Profile /> },

    { path: "/category/:categoryId", element: <CategoryProducts /> },
  ],
};

export default FrontendRoute;
