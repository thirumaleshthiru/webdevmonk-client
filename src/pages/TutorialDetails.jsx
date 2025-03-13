import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import MetaData from "../components/MetaData.jsx";
 
const TutorialDetails = () => {
  const { meta_url } = useParams();
  const [tutorial, setTutorial] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conceptsLoading, setConceptsLoading] = useState(true);

  useEffect(() => {
    const fetchTutorialDetails = async () => {
      try {
        setLoading(true);
        // Remove spaces before and after meta_url
        const cleanedMetaUrl = meta_url.trim();
        const response = await axiosInstance.get(`/api/tutorials/tutorialsbymetaurl/${cleanedMetaUrl}`);
        
        if (response.data.data && response.data.data.length > 0) {
          const tutorialData = response.data.data[0];
          setTutorial(tutorialData);
          
          // Fetch concepts after getting tutorial
          try {
            setConceptsLoading(true);
            const conceptsResponse = await axiosInstance.get(`/api/concepts/tutorials/concepts/${tutorialData.tutorial_id}`);
            setConcepts(conceptsResponse.data.data || []);
          } catch (conceptError) {
            console.error("Failed to fetch concepts:", conceptError);
          } finally {
            setConceptsLoading(false);
          }
        } else {
          setError("Tutorial not found");
        }
      } catch (error) {
        console.error("Failed to fetch tutorial details:", error);
        setError(error.response?.data?.message || "Failed to load tutorial details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTutorialDetails();
  }, [meta_url]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Prepare SEO data
  const getSeoData = () => {
    if (!tutorial) return { title: "Loading Tutorial...", meta_description: "", canonical: "" };
    
    const baseUrl = window.location.origin;
    const canonicalUrl = `${baseUrl}/${tutorial.meta_url}`;
     
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": tutorial.tutorial_name,
      "description": tutorial.tutorial_description,
      "provider": {
        "@type": "Organization",
        "name": "webdevmonk", 
        "url": baseUrl
      },
      "dateCreated": tutorial.created_at,
      "url": canonicalUrl,
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "courseWorkload": `${concepts.length} lessons`
      }
    };
    
    if (tutorial.thumbnail) {
      structuredData.image = `http://64.225.84.149:7000/${tutorial.thumbnail}`;
    }
    
    return {
      title: `${tutorial.tutorial_name}`, 
      meta_description: tutorial.tutorial_description.substring(0, 160), 
      canonical: canonicalUrl,
      structuredData: structuredData
    };
  };

  const seoData = getSeoData();

  return (
    <section className="min-h-screen bg-white p-6">
       <MetaData seoData={seoData} />
      
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : error ? (
          <div className="my-12 p-6 border-l-4 border-black bg-gray-100">
            <p className="text-black">{error}</p>
          </div>
        ) : tutorial ? (
          <div>
            <h1 className="text-5xl font-bold text-black mb-8 border-b-2 border-black pb-5">
              {tutorial.tutorial_name}
            </h1>
            
            <div className="mb-6">
              <span className="text-sm text-gray-800">
                {formatDate(tutorial.created_at)}
              </span>
            </div>
            
            {tutorial.thumbnail && (
              <div className="w-full aspect-video mb-10 overflow-hidden">
                <img 
                  src={`http://localhost:7000/uploads/${tutorial.thumbnail}`} 
                  alt={tutorial.tutorial_name} 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            <div className="mb-8">
              <blockquote className="relative pl-8 pr-4 py-2 italic">
                <span className="absolute top-0 left-0 text-6xl leading-none text-gray-300">"</span>
                <p className="text-gray-700 relative z-10">
                  <span className="float-left text-5xl font-serif mr-2 mt-1 text-black">
                    {tutorial.tutorial_description.charAt(0)}
                  </span>
                  {tutorial.tutorial_description.substring(1)}
                </p>
                <span className="absolute bottom-0 right-0 text-6xl leading-none text-gray-300">"</span>
              </blockquote>
            </div>
            
            {/* Table of Contents Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 border-b border-gray-200 pb-2">Table of Contents</h2>
              
              {conceptsLoading ? (
                <div className="flex justify-center items-center my-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : concepts.length === 0 ? (
                <p className="text-gray-700 py-4">No concepts available for this tutorial yet.</p>
              ) : (
                <div className="space-y-4">
                  {concepts.map((concept, index) => (
                    <div key={concept.concept_id} className="group">
                      <Link 
                        to={`/${tutorial.meta_url}/${concept.meta_url}`}
                        className="flex items-center py-2 hover:bg-gray-50 transition-colors pl-2 -ml-2"
                      >
                        <span className="text-gray-400 font-mono mr-4 w-6 text-right">{String(index + 1).padStart(2, '0')}</span>
                        <span className="text-lg text-black font-medium group-hover:text-gray-900">
                          {concept.concept_name}
                        </span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-16">
              <Link
                to="/tutorials"
                className="inline-block border border-black text-black px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors text-center md:text-left w-full md:max-w-[30%]"
              >
                All Tutorials
              </Link>
              
              {concepts.length > 0 && (
                <Link
                  to={`/${tutorial.meta_url}/${concepts[0].meta_url}`}
                  className="inline-block border border-black text-black px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors text-center md:text-left w-full md:max-w-[30%]"
                >
                  Start Learning
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="my-12 text-center">
            <p className="text-xl text-black">Tutorial not found.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TutorialDetails;