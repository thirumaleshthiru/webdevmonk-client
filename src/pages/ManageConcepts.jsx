import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import { useAuth } from "../utils/AuthContext.jsx";
import { Plus, Edit, Trash2, Filter, Search, AlertCircle, CheckCircle2 } from "lucide-react";

const ManageConcepts = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [concepts, setConcepts] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [selectedTutorial, setSelectedTutorial] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Fetch tutorials for filter dropdown
  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const response = await axiosInstance.get("/api/tutorials/tutorials", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setTutorials(response.data.data);
      } catch (error) {
        console.error("Failed to fetch tutorials:", error);
        setError(error.response?.data?.message || "Failed to load tutorials. Please try again.");
      }
    };

    if (token) {
      fetchTutorials();
    }
  }, [token]);

  // Fetch concepts based on selected tutorial
  useEffect(() => {
    const fetchConcepts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!selectedTutorial) {
          setConcepts([]);
          setLoading(false);
          return;
        }
        
        const response = await axiosInstance.get(`/api/concepts/tutorials/concepts/${selectedTutorial}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setConcepts(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch concepts:", error);
        setError(error.response?.data?.message || "Failed to load concepts. Please try again.");
        setConcepts([]);
      } finally {
        setLoading(false);
      }
    };

    if (token && selectedTutorial) {
      fetchConcepts();
    }
  }, [token, selectedTutorial]);

  // Handle tutorial selection change
  const handleTutorialChange = (e) => {
    setSelectedTutorial(e.target.value);
  };

  // Filter concepts based on search query
  const filteredConcepts = concepts.filter(concept => 
    concept.concept_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (concept.concept_description && concept.concept_description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Navigate to create concept page
  const handleCreateConcept = () => {
    navigate("/create-concept");
  };

  // Navigate to edit concept page
  const handleEditConcept = (conceptId) => {
    navigate(`/edit-concept/${conceptId}`);
  };

  // Delete concept
  const handleDeleteConcept = async (conceptId) => {
    if (!window.confirm("Are you sure you want to delete this concept? This action cannot be undone.")) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/concepts/delete/${conceptId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove deleted concept from state
      setConcepts(prevConcepts => prevConcepts.filter(concept => concept.concept_id !== conceptId));
      
      // Show success message
      setSuccess("Concept deleted successfully");
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to delete concept:", error);
      setError(error.response?.data?.message || "Failed to delete concept. Please try again.");
      
      // Hide error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  return (
    <section className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-16 border-b-2 border-black pb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-2">
              Manage Concepts
            </h1>
            <p className="text-gray-600">Organize and manage your learning concepts</p>
          </div>
          <button
            onClick={handleCreateConcept}
            className="mt-4 sm:mt-0 px-6 py-3 border border-black bg-black text-white font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center"
          >
            <Plus size={18} className="mr-2" />
            Create Concept
          </button>
        </div>

        {error && (
          <div className="my-6 p-4 border-l-4 border-red-500 bg-red-50 flex items-start">
            <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-1 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="my-6 p-4 border-l-4 border-green-500 bg-green-50 flex items-start">
            <CheckCircle2 size={20} className="mr-2 flex-shrink-0 mt-1 text-green-500" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="md:w-1/3">
            <div className="flex items-center border-2 border-gray-300 focus-within:border-black p-3 transition-colors">
              <Filter size={20} className="mr-2 text-gray-500" />
              <select
                value={selectedTutorial}
                onChange={handleTutorialChange}
                className="w-full bg-transparent outline-none"
              >
                <option value="">Select a Tutorial</option>
                {tutorials.map((tutorial) => (
                  <option key={tutorial.tutorial_id} value={tutorial.tutorial_id}>
                    {tutorial.tutorial_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:w-2/3">
            <div className="flex items-center border-2 border-gray-300 focus-within:border-black p-3 transition-colors">
              <Search size={20} className="mr-2 text-gray-500" />
              <input
                type="text"
                placeholder="Search concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full outline-none"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin h-8 w-8 border-b-2 border-black rounded-full"></div>
          </div>
        ) : selectedTutorial ? (
          filteredConcepts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConcepts.map((concept) => (
                <div
                  key={concept.concept_id}
                  className="border-2 border-gray-200 hover:border-black transition-colors p-6 flex flex-col h-full"
                >
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{concept.concept_name}</h3>
                  {concept.concept_description && (
                    <p className="text-gray-600 mb-6 flex-grow line-clamp-3">
                      {concept.concept_description}
                    </p>
                  )}
                  <div className="flex justify-end space-x-2 mt-auto pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEditConcept(concept.concept_id)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Edit concept"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteConcept(concept.concept_id)}
                      className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-500"
                      aria-label="Delete concept"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 border border-gray-200">
              <p className="text-gray-600 mb-2">No concepts found for this tutorial.</p>
              <button
                onClick={handleCreateConcept}
                className="mt-4 px-6 py-2 border border-black bg-black text-white font-semibold hover:bg-gray-800 transition-colors inline-flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Create New Concept
              </button>
            </div>
          )
        ) : (
          <div className="text-center py-16 bg-gray-50 border border-gray-200">
            <p className="text-gray-600 mb-2">Please select a tutorial to view its concepts.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageConcepts;