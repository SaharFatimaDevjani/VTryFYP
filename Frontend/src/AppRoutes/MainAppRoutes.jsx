import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import FrontendRoute from './Frontend'
import AdminRoute from './Admin'
import AuthRoute from './Auth'

const router = createBrowserRouter([
    FrontendRoute,AdminRoute,AuthRoute


])
export default router
