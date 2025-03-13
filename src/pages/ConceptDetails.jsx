import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import ConceptsSidebar from "../components/ConceptsSidebar.jsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MetaData from "../components/MetaData.jsx";

const ConceptDetails = () => {
  const { tutorial_meta_url: tutorialMetaUrl, concept_meta_url: conceptMetaUrl } = useParams();
  const [concept, setConcept] = useState(null);
  const [allConcepts, setAllConcepts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConceptAndSiblings = async () => {
      try {
        setLoading(true);
        console.log("Fetching concept details for:", conceptMetaUrl);
        
        // First fetch the specific concept using the correct endpoint
        const conceptResponse = await axiosInstance.get(`/api/concepts/conceptsbyurl/${conceptMetaUrl}`);
        console.log("Concept response:", conceptResponse);
        
        if (conceptResponse.data.data && conceptResponse.data.data.length > 0) {
          setConcept(conceptResponse.data.data[0]);
          
          // Then fetch all concepts for this tutorial to enable prev/next navigation
          const tutorialResponse = await axiosInstance.get(`/api/concepts/tutorials/meta_url/${tutorialMetaUrl}`);
          console.log("Tutorial concepts response:", tutorialResponse);
          
          if (tutorialResponse.data.data) {
            setAllConcepts(tutorialResponse.data.data);
          }
        } else {
          setError("Concept not found");
        }
      } catch (error) {
        console.error("Failed to fetch concept details:", error);
        setError(error.response?.data?.message || "Failed to load concept details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (conceptMetaUrl && tutorialMetaUrl) {
      fetchConceptAndSiblings();
    }
  }, [tutorialMetaUrl, conceptMetaUrl]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Find the current concept's index in the array of all concepts
  const currentIndex = concept ? allConcepts.findIndex(c => c.concept_id === concept.concept_id) : -1;
  
  // Get prev and next concept meta_urls
  const prevConcept = currentIndex > 0 ? allConcepts[currentIndex - 1] : null;
  const nextConcept = currentIndex < allConcepts.length - 1 ? allConcepts[currentIndex + 1] : null;

  // Navigate to previous or next concept
  const navigateToConcept = (conceptMetaUrl) => {
    navigate(`/${tutorialMetaUrl}/${conceptMetaUrl}`);
    // Scroll to top when navigating
    window.scrollTo(0, 0);
  };

 
  const getSeoData = () => {
    if (!concept) return { title: "Loading Concept...", meta_description: "", canonical: "" };
    
    const baseUrl = window.location.origin;
    const canonicalUrl = `${baseUrl}/${tutorialMetaUrl}/${conceptMetaUrl}`;
    
 
    const tempElement = document.createElement('div');
    tempElement.innerHTML = concept.concept_content;
    const plainText = tempElement.textContent || tempElement.innerText || "";
    const cleanDescription = plainText.substring(0, 160).trim();  
    
    // Prepare structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": concept.concept_name,
      "description": cleanDescription,
      "author": {
        "@type": "Organization",
        "name": "webdevmonk"  
      },
      "publisher": {
        "@type": "Organization",
        "name": "webdevmonk",  
        "url": baseUrl
      },
      "datePublished": concept.created_at,
      "dateModified": concept.updated_at || concept.created_at,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      },
      "isPartOf": {
        "@type": "Course",
        "name": concept.tutorial_name,
        "url": `${baseUrl}/${tutorialMetaUrl}`
      },
      "position": currentIndex + 1
    };
    
    return {
      title: `${concept.concept_name}`,
      meta_description: cleanDescription,
      canonical: canonicalUrl,
      structuredData: structuredData
    };
  };

  const seoData = getSeoData();

  return (
    <div className="min-h-screen bg-white flex relative">
       <MetaData seoData={seoData} />
      
      {/* Sidebar */}
      <ConceptsSidebar />
      
      {/* Main content */}
      <section className="w-full md:ml-0 p-6 transition-all">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : error ? (
            <div className="my-12 p-6 border-l-4 border-black bg-gray-100">
              <p className="text-black">{error}</p>
            </div>
          ) : concept ? (
            <div>
              <div className="mb-4">
                <Link 
                  to={`/${tutorialMetaUrl}`}
                  className="text-sm text-gray-600 hover:text-black inline-flex items-center"
                >
                  <ChevronLeft size={16} />
                  <span>Back to {concept.tutorial_name}</span>
                </Link>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 border-b-2 border-black pb-5">
                {concept.concept_name}
              </h1>
              
              <div className="mb-6">
                <span className="text-sm text-gray-800">
                  {formatDate(concept.created_at)}
                </span>
              </div>
              
              <div className="mb-12">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: concept.concept_content }}
                />
              </div>
              
              {/* Completely redesigned pagination */}
              <div className="grid grid-cols-2 gap-4 mt-16 pt-6 border-t border-gray-200">
                {prevConcept ? (
                  <button
                    onClick={() => navigateToConcept(prevConcept.meta_url)}
                    className="flex flex-col items-start text-left border border-gray-300 rounded p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center text-blue-600 mb-1">
                      <ChevronLeft size={16} />
                      <span className="ml-1">Previous</span>
                    </div>
                    <span className="text-sm text-gray-800 line-clamp-1">
                      {prevConcept.concept_name}
                    </span>
                  </button>
                ) : (
                  <div></div>
                )}
                
                {nextConcept ? (
                  <button
                    onClick={() => navigateToConcept(nextConcept.meta_url)}
                    className="flex flex-col items-end text-right border border-gray-300 rounded p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center text-blue-600 mb-1">
                      <span className="mr-1">Next</span>
                      <ChevronRight size={16} />
                    </div>
                    <span className="text-sm text-gray-800 line-clamp-1">
                      {nextConcept.concept_name}
                    </span>
                  </button>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          ) : (
            <div className="my-12 text-center">
              <p className="text-xl text-black">Concept not found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ConceptDetails;