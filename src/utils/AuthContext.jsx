import React, { createContext } from 'react'
import { useContext,useState } from 'react';
import Cookies from "js-cookie";



const AuthContext = createContext(null);

function AuthProvider({children}) {

    const [token,setToken] = useState(Cookies.get("token") || null);



    const login = (newToken)=>{

        Cookies.set('token',newToken,{expires:1});
        setToken(newToken);
    }


    const logout = ()=>{

        Cookies.remove('token')
        setToken(null);
    }


  return (
     <AuthContext.Provider value = {{login,logout,token}}>
        {children}
     </AuthContext.Provider>
  )
};


function useAuth(){
    return useContext(AuthContext)
}

export {AuthProvider,useAuth}