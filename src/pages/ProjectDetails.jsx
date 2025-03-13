import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import { ArrowBigLeft } from "lucide-react";
import MetaData from "../components/MetaData.jsx";

const ProjectDetails = () => {
  const { meta_url } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        // Remove spaces before and after meta_url
        const cleanedMetaUrl = meta_url.trim();
        const response = await axiosInstance.get(`/api/projects/projectsbyurl/${cleanedMetaUrl}`);
        if (response.data.data && response.data.data.length > 0) {
          setProject(response.data.data[0]);
        } else {
          setError("Project not found");
        }
      } catch (error) {
        console.error("Failed to fetch project details:", error);
        setError(error.response?.data?.message || "Failed to load project details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [meta_url]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getSeoData = () => {
    if (!project) return { title: "Loading Project...", meta_description: "", canonical: "" };
    
    const baseUrl = window.location.origin;
    const canonicalUrl = `${baseUrl}/projects/${meta_url}`;
    
    // Extract plain text from project content for meta description
    const tempElement = document.createElement('div');
    tempElement.innerHTML = project.project_content || '';
    const plainText = tempElement.textContent || tempElement.innerText || "";
    const cleanDescription = project.project_description || plainText.substring(0, 160).trim();
    
    // Prepare structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "headline": project.project_name,
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
      "datePublished": project.created_at,
      "dateModified": project.updated_at || project.created_at,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      }
    };
    
    // Add image if available
    if (project.thumbnail) {
      structuredData.image = `${baseUrl}/uploads/${project.thumbnail}`;
    }
    
    return {
      title: `${project.project_name} - Project Details`,
      meta_description: cleanDescription.substring(0, 160).trim(),
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
        ) : project ? (
          <div>
            <h1 className="text-5xl font-bold text-black mb-8 border-b-2 border-black pb-5">
              {project.project_name}
            </h1>
            
            <div className="mb-6">
              <span className="text-sm text-gray-800">
                {formatDate(project.created_at)}
              </span>
            </div>
            
            {project.thumbnail && (
              <div className="w-full aspect-video mb-10 overflow-hidden">
                <img 
                  src={`http://localhost:7000/uploads/${project.thumbnail}`} 
                  alt={project.project_name} 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            <div className="mb-8">
              <blockquote className="relative pl-8 pr-4 py-2 italic">
                <span className="absolute top-0 left-0 text-6xl leading-none text-gray-300">"</span>
                <p className="text-gray-700 relative z-10">
                  <span className="float-left text-5xl font-serif mr-2 mt-1 text-black">
                    {project.project_description.charAt(0)}
                  </span>
                  {project.project_description.substring(1)}
                </p>
                <span className="absolute bottom-0 right-0 text-6xl leading-none text-gray-300">"</span>
              </blockquote>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Project Details</h2>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: project.project_content }}
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-16">
              <Link
                to="/projects"
                className="inline-block border border-black text-black px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors text-center md:text-left w-full md:max-w-[30%]"
              >
                All Projects
              </Link>
              
              {project.demo_link && (
                <a
                  href={project.demo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-black text-black px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors text-center md:text-left w-full md:max-w-[30%]"
                >
                  View Demo
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="my-12 text-center">
            <p className="text-xl text-black">Project not found.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectDetails;