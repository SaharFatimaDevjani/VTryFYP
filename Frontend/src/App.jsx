import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './AppRoutes/MainAppRoutes';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

//import Frontend from '././AppRoutes/Frontend'; 
import Admin from '././AppRoutes/Admin'; 

export default function App() {
  return (
    
    <RouterProvider router={router} />
    
  );
}
