import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import { useAuth } from "../utils/AuthContext.jsx";
import { ArrowLeft, Save, AlertCircle, X, Image } from "lucide-react";

const EditTutorial = () => {
  const { tutorial_id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [tutorial, setTutorial] = useState({
    tutorial_name: "",
    tutorial_description: "",
    meta_title: "",
    meta_description: "",
    meta_url: "",
    thumbnail: ""
  });

  // Check if user is authenticated
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Fetch tutorial data
  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/tutorials/tutorials/${tutorial_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Handle the array response format
        const tutorialData = response.data.data[0];
        if (tutorialData) {
          setTutorial({
            tutorial_name: tutorialData.tutorial_name || "",
            tutorial_description: tutorialData.tutorial_description || "",
            meta_title: tutorialData.meta_title || "",
            meta_description: tutorialData.meta_description || "",
            meta_url: tutorialData.meta_url || "",
            thumbnail: tutorialData.thumbnail || ""
          });
          
          if (tutorialData.thumbnail) {
            setThumbnailPreview(`http://localhost:7000/uploads/${tutorialData.thumbnail}`);
          }
        } else {
          setError("Tutorial not found");
        }
      } catch (error) {
        console.error("Failed to fetch tutorial:", error);
        setError(error.response?.data?.message || "Failed to load tutorial. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (token && tutorial_id) {
      fetchTutorial();
    }
  }, [token, tutorial_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTutorial(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('tutorial_name', tutorial.tutorial_name);
      formData.append('tutorial_description', tutorial.tutorial_description);
      formData.append('meta_title', tutorial.meta_title);
      formData.append('meta_description', tutorial.meta_description);
      formData.append('meta_url', tutorial.meta_url);
      
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      await axiosInstance.put(`/api/tutorials/update/${tutorial_id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess("Tutorial updated successfully");
        
    } catch (error) {
      console.error("Failed to update tutorial:", error);
      setError(error.response?.data?.message || "Failed to update tutorial. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const goBack = () => {
    navigate('/manage-tutorials');
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-b-2 border-black rounded-full"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-16 border-b-2 border-black pb-4">
          <div className="flex items-center mb-4 sm:mb-0">
            <button
              onClick={goBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">
              Edit Tutorial
            </h1>
          </div>
        </div>

        {error && (
          <div className="my-6 p-4 border-l-4 border-black bg-gray-100 flex items-start">
            <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-1" />
            <p className="text-black">{error}</p>
          </div>
        )}

        {success && (
          <div className="my-6 p-4 border-l-4 border-green-500 bg-green-50 flex items-start">
            <div className="mr-2 flex-shrink-0 mt-1">✓</div>
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            <div>
              <label htmlFor="tutorial_name" className="block text-sm font-semibold mb-2">
                Tutorial Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="tutorial_name"
                name="tutorial_name"
                value={tutorial.tutorial_name}
                onChange={handleInputChange}
                required
                className="w-full p-3 border-2 border-gray-300 focus:border-black outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="tutorial_description" className="block text-sm font-semibold mb-2">
                Tutorial Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="tutorial_description"
                name="tutorial_description"
                value={tutorial.tutorial_description}
                onChange={handleInputChange}
                required
                rows="5"
                className="w-full p-3 border-2 border-gray-300 focus:border-black outline-none transition-colors"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="meta_title" className="block text-sm font-semibold mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="meta_title"
                  name="meta_title"
                  value={tutorial.meta_title}
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="meta_url" className="block text-sm font-semibold mb-2">
                  Meta URL
                </label>
                <input
                  type="text"
                  id="meta_url"
                  name="meta_url"
                  value={tutorial.meta_url}
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-gray-300 focus:border-black outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="meta_description" className="block text-sm font-semibold mb-2">
                Meta Description
              </label>
              <textarea
                id="meta_description"
                name="meta_description"
                value={tutorial.meta_description}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-3 border-2 border-gray-300 focus:border-black outline-none transition-colors"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Thumbnail
              </label>
              
              {thumbnailPreview ? (
                <div className="relative w-full sm:w-48 h-48 border-2 border-gray-300 mb-4">
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'http://localhost:7000/uploads/default_thumbnail.png';
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    title="Remove thumbnail"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full sm:w-48 h-48 border-2 border-dashed border-gray-300 mb-4 hover:border-gray-500 transition-colors">
                  <Image size={32} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No thumbnail selected</p>
                </div>
              )}
              
              <div className="flex items-center">
                <label 
                  htmlFor="thumbnail" 
                  className="cursor-pointer border border-black text-black px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                >
                  {thumbnailPreview ? "Change Thumbnail" : "Upload Thumbnail"}
                </label>
                <input 
                  type="file" 
                  id="thumbnail" 
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={goBack}
                className="px-6 py-3 border border-gray-300 text-black font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 border border-black bg-black text-white font-semibold hover:bg-gray-800 transition-colors flex items-center"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditTutorial;