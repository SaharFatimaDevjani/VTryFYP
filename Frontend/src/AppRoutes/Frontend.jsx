import React from 'react'
import FrontendLayout from '../Layout/Frontend/index' 

import Main from '../pages/Frontend/Main';
import ContactSection from '../pages/Frontend/ContactSection';
import AboutPage from '../pages/Frontend/About';
import ProductDetail from '../pages/Frontend/ProductDetail';
import Cart from '../pages/Frontend/Viewcart';



const FrontendRoute = {
    element:<FrontendLayout/>,
    children:[
        {
            path:"/",
            element:<Main />
        },
        {
            path:"/contact",
            element:<ContactSection />
        },
        {
            path:"/about",
            element:<AboutPage />
        },
        {
            path:"/product/:productId",
            element:<ProductDetail />
        },
        {
            path:"/cart",
            element:<Cart />
        }
    ]
}

export default FrontendRoute

