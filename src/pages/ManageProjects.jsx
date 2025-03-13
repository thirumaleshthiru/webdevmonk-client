import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import { useAuth } from "../utils/AuthContext.jsx";
import { ArrowLeft, Edit, Trash2, Plus, AlertCircle } from "lucide-react";

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/projects/projects", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setProjects(response.data.data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setError(error.response?.data?.message || "Failed to load projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token]);

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      setDeleteLoading(projectId);
      await axiosInstance.delete(`/api/projects/delete/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove deleted project from state
      setProjects(prev => prev.filter(project => project.project_id !== projectId));
    } catch (error) {
      console.error("Failed to delete project:", error);
      setError(error.response?.data?.message || "Failed to delete project. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (projectId) => {
    navigate(`/edit-project/${projectId}`);
  };

  const handleCreateNew = () => {
    navigate("/create-project");
  };

  const goBack = () => {
    navigate(-1);
  };

  // Function to truncate text with ellipsis
  const truncateText = (text, maxLength) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <section className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-16 border-b-2 items-center border-black pb-4">
          <div className="flex items-center mb-4 sm:mb-0 justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black">
              Manage Projects
            </h1>
          </div>
          <button
            onClick={handleCreateNew}
            className="border border-black text-black px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors flex items-center justify-center sm:justify-start w-full sm:w-auto mt-4 sm:mt-0"
          >
            <Plus size={18} className="mr-2" />
            Create New
          </button>
        </div>

        {error && (
          <div className="my-6 p-4 border-l-4 border-black bg-gray-100 flex items-start">
            <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-1" />
            <p className="text-black">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-b-2 border-black rounded-full"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-10 sm:py-16 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 text-lg mb-4">No projects found</p>
            <button
              onClick={handleCreateNew}
              className="border border-black text-black px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors inline-flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            {projects.map((project) => (
              <div 
                key={project.project_id} 
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-40 md:w-48 h-40 sm:h-full bg-gray-100 flex-shrink-0">
                    {project.thumbnail ? (
                      <img 
                        src={`http://localhost:7000/uploads/${project.thumbnail}`}
                        alt={project.project_name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'http://localhost:7000/uploads/default_thumbnail.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-6 flex-grow">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                      <div className="mb-4 sm:mb-0 pr-0 sm:pr-4">
                        <h2 className="text-xl font-bold mb-2">{project.project_name}</h2>
                        <p className="text-gray-600 mb-4">
                          {truncateText(project.project_description, 120)}
                        </p>
                        {project.demo_link && (
                          <p className="text-sm text-gray-500 mb-2">
                            Demo Link: <a href={project.demo_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{project.demo_link}</a>
                          </p>
                        )}
                        {project.meta_url && (
                          <p className="text-sm text-gray-500 mb-2">
                            URL: {project.meta_url}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          Created: {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 self-end sm:self-start">
                        <button
                          onClick={() => handleEdit(project.project_id)}
                          className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(project.project_id)}
                          className="p-2 text-gray-600 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
                          title="Delete"
                          disabled={deleteLoading === project.project_id}
                        >
                          {deleteLoading === project.project_id ? (
                            <div className="animate-spin h-5 w-5 border-b-2 border-current rounded-full"></div>
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageProjects;