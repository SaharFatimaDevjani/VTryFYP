import React from 'react'
import { Outlet } from 'react-router-dom';
import Navbar from '../../Components/Frontend/Navbar';
import Footer from '../../Components/Frontend/Footer';

const FrontendLayout = () => {
  return (
    <>
    <Navbar />
    <Outlet/>
    <Footer/>
    </>
  )
}

export default FrontendLayout;
