import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import MetaData from "../components/MetaData.jsx";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/projects/projects");
        setProjects(response.data.data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setError(error.response?.data?.message || "Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getSeoData = () => {
    const baseUrl = window.location.origin;
    const canonicalUrl = `${baseUrl}/projects`;
    
    // Create a description from the projects if available
    let description = "Explore my portfolio of projects and works.";
    if (projects.length > 0) {
      description = `Browse through ${projects.length} projects including ${
        projects.slice(0, 3).map(p => p.project_name).join(", ")
      } and more.`;
    }
    
    // Prepare structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "headline": "Projects Portfolio",
      "description": description,
      "author": {
        "@type": "Organization",
        "name": "webdevmonk" 
      },
      "publisher": {
        "@type": "Organization",
        "name": "webdevmonk",
        "url": baseUrl
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      },
      "itemListElement": projects.map((project, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "CreativeWork",
          "name": project.project_name,
          "description": project.project_description,
          "url": `${baseUrl}/projects/${project.meta_url}`,
          "dateCreated": project.created_at
        }
      }))
    };
    
    return {
      title: "Projects - Portfolio",
      meta_description: description.substring(0, 160).trim(),
      canonical: canonicalUrl,
      structuredData: structuredData
    };
  };

  const seoData = getSeoData();

  return (
    <section className="min-h-screen bg-white p-6">
      <MetaData seoData={seoData} />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold text-black mb-16 border-b-2 border-black pb-5">
          Projects
        </h1>

        {loading ? (
          <div className="flex justify-center items-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : error ? (
          <div className="my-12 p-6 border-l-4 border-black bg-gray-100">
            <p className="text-black">{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="my-12 text-center">
            <p className="text-xl text-black">No projects available at this time.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {projects.map((project, index) => (
              <div key={project.project_id} className="group">
                <div className="flex flex-col">
                  <div className="flex items-start gap-6">
                    <span className="text-8xl font-bold text-gray-500 hidden md:block">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    
                    {project.thumbnail && (
                      <div className="relative aspect-video w-full md:w-64 overflow-hidden mb-6">
                        <img 
                          src={`http://64.225.84.149:7000/uploads/${project.thumbnail}`} 
                          alt={project.project_name} 
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-2 left-2 bg-white px-2 py-1 text-black md:hidden">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                    )}
                    
                    {!project.thumbnail && (
                      <div className="relative aspect-video w-full md:w-64 bg-gray-100 border border-black flex items-center justify-center mb-6">
                        <span className="text-3xl text-gray-400">No Image</span>
                        <div className="absolute top-2 left-2 bg-white px-2 py-1 text-black md:hidden">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-sm text-gray-800">
                      {formatDate(project.created_at)}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-black mb-3">
                    {project.project_name}
                  </h2>
                  
                  <p className="text-gray-700 mb-8 max-w-2xl line-clamp-2">
                    {project.project_description}
                  </p>
                  
                  <div className="flex flex-col md:flex-row gap-4 w-full md:max-w-full">
                    <Link
                      to={`/projects/${project.meta_url}`}
                      className="inline-block border border-black text-black px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors text-center md:text-left w-full md:max-w-[30%]"
                    >
                      View project
                    </Link>
                    
                    {project.demo_link && (
                      <a
                        href={project.demo_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block border border-black text-black px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors text-center md:text-left w-full md:max-w-[30%]"
                      >
                        Demo
                      </a>
                    )}
                  </div>
                </div>
                
                {index < projects.length - 1 && (
                  <div className="h-px w-full bg-gray-500 mt-20"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;