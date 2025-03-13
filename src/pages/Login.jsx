import { useState,useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import { useAuth } from "../utils/AuthContext.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login,token } = useAuth();
  const navigate = useNavigate();

  useEffect(()=>{
    if(token){
        navigate('/dashboard')
    }
  },[token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.post("/api/auth/login", {
        email,
        password
      });
      
      // Assuming the token is returned in response.data.token
      const token = response.data.token;
      
      // Use the login function from AuthContext
      login(token);
      
      // Redirect to home or dashboard page
      navigate("/");
      
    } catch (error) {
      console.error("Login failed:", error);
      setError(
        error.response?.data?.message || 
        "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-black mb-16 border-b-2 border-black pb-2">
          Login
        </h1>

        {error && (
          <div className="my-6 p-4 border-l-4 border-black bg-gray-100">
            <p className="text-black">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-lg font-medium text-black">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b-2 border-gray-400 py-2 px-1 text-black focus:border-black focus:outline-none bg-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-lg font-medium text-black">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b-2 border-gray-400 py-2 px-1 text-black focus:border-black focus:outline-none bg-transparent"
              placeholder="••••••••"
              required
            />
          </div>

           

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-black text-black px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-4 w-4 border-b-2 border-current mr-2"></span>
                Logging in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

     
      </div>
    </section>
  );
};

export default Login;