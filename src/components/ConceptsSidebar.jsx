import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import { ChevronRight, ChevronLeft, BookOpen, Menu } from "lucide-react";

const ConceptsSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tutorial_meta_url: tutorialMetaUrl } = useParams(); // Fixed param name
  const location = useLocation();
  
  // Extract the current concept meta URL from the path if it exists
  const currentPath = location.pathname;
  const pathParts = currentPath.split('/');
  const currentConceptMetaUrl = pathParts.length > 2 ? pathParts[pathParts.length - 1] : null;

  useEffect(() => {
    // When on mobile, sidebar should be closed by default
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Initial check
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchConcepts = async () => {
      if (!tutorialMetaUrl) return;
      
      try {
        setLoading(true);
        console.log("Fetching concepts for tutorial:", tutorialMetaUrl);
        const response = await axiosInstance.get(`/api/concepts/tutorials/meta_url/${tutorialMetaUrl}`);
        
        // Debug the response structure
        console.log("API Response:", response);
        
        // Check the structure of response.data
        if (response.data.data) {
          setConcepts(response.data.data);
          console.log("Concepts set:", response.data.data);
        } else {
          // If the API returns just the array directly
          setConcepts(response.data);
          console.log("Concepts set directly:", response.data);
        }
      } catch (error) {
        console.error("Failed to fetch concepts:", error);
        setError(error.response?.data?.message || "Failed to load concepts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchConcepts();
  }, [tutorialMetaUrl]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Close sidebar when a concept is clicked on mobile
  const handleConceptClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  // Force sidebar to be open on desktop
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsOpen(true);
    }
  }, []);

  return (
    <>
      {/* Toggle button - visible when sidebar is closed */}
      <button 
        onClick={toggleSidebar}
        className={`fixed top-24 z-40 p-2 bg-black text-white rounded-r-md transition-all cursor-pointer ${
          isOpen ? "left-[20%] md:left-[20%] md:block hidden" : "left-0"
        }`}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
      </button>
      
      {/* Overlay for mobile - only visible when sidebar is open on mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full bg-white z-30 shadow-lg overflow-y-auto transition-all duration-300 transform ${
          isOpen 
            ? "w-full md:w-[20%] translate-x-0" 
            : "w-0 -translate-x-full"
        }`}
      >
        <div className="p-4 h-full">
          <div className="flex items-center justify-between mb-6 pt-4">
            <h2 className="text-xl font-bold flex items-center">
              <BookOpen size={20} className="mr-2" />
              Contents
            </h2>
            <button 
              onClick={toggleSidebar}
              className="md:hidden text-gray-500 hover:text-black"
              aria-label="Close sidebar"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center my-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : concepts.length === 0 ? (
            <p className="text-gray-500">No concepts available</p>
          ) : (
            <ul className="space-y-2">
              {concepts.map((concept, index) => (
                <li key={concept.concept_id}>
                  <Link
                    to={`/${tutorialMetaUrl}/${concept.meta_url}`}
                    className={`flex items-center py-2 px-2 rounded-md hover:bg-gray-100 transition-colors ${
                      currentConceptMetaUrl === concept.meta_url 
                        ? "bg-gray-100 font-medium" 
                        : ""
                    }`}
                    onClick={handleConceptClick}
                  >
                    <span className="w-6 text-gray-400 font-mono text-sm mr-2">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="line-clamp-2">{concept.concept_name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default ConceptsSidebar;