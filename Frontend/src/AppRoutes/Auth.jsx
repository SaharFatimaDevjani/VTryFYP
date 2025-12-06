import React from 'react'
import AuthLayout from '../Layout/Auth/index' 

const AuthRoute = {
    element:<AuthLayout/>,
    children:[
        {
            path:"/login",
            element:<h1>Login</h1>
        },
        {
            path:"/signup",
            element:<h1>SignUp</h1>
        }
    ]
}

export default AuthRoute
