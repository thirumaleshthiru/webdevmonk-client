import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";
import { useAuth } from "../utils/AuthContext.jsx";
import { ArrowLeft, Upload, AlertCircle } from "lucide-react";

const CreateTutorial = () => {
  const [formData, setFormData] = useState({
    tutorial_name: "",
    tutorial_description: "",
    meta_title: "",
    meta_description: "",
    meta_url: ""
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tutorial_name || !formData.tutorial_description) {
      setError("Tutorial name and description are required.");
      return;
    }
    
    if (!thumbnail) {
      setError("Thumbnail image is required.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create FormData object for file upload
      const data = new FormData();
      
      // Append all text fields
      data.append("tutorial_name", formData.tutorial_name);
      data.append("tutorial_description", formData.tutorial_description);
      data.append("meta_title", formData.meta_title || "");
      data.append("meta_description", formData.meta_description || "");
      data.append("meta_url", formData.meta_url || "");
      
      // Critical: Make sure this field name matches what the backend expects
      data.append("thumbnail", thumbnail);
      
      // Use axiosInstance for the request
      const response = await axiosInstance.post("/api/tutorials/create", data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(true);
      window.scroll(0,0)
      
    } catch (error) {
      console.error("Failed to create tutorial:", error);
      setError(error.response?.data?.message || "Failed to create tutorial. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <section className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-16 border-b-2 border-black pb-2">
          <button
            onClick={goBack}
            className="mr-6 p-2 border border-black text-black hover:bg-black hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-6xl font-bold text-black">
            Create Tutorial
          </h1>
        </div>

        {error && (
          <div className="my-6 p-4 border-l-4 border-black bg-gray-100 flex items-start">
            <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-1" />
            <p className="text-black">{error}</p>
          </div>
        )}

        {success && (
          <div className="my-6 p-4 border-l-4 border-green-500 bg-green-50">
            <p className="text-green-700">Tutorial created successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10" encType="multipart/form-data">
          <div className="space-y-2">
            <label htmlFor="tutorial_name" className="block text-lg font-medium text-black">
              Tutorial Name*
            </label>
            <input
              id="tutorial_name"
              name="tutorial_name"
              type="text"
              value={formData.tutorial_name}
              onChange={handleChange}
              className="w-full border-b-2 border-gray-400 py-2 px-1 text-black focus:border-black focus:outline-none bg-transparent"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tutorial_description" className="block text-lg font-medium text-black">
              Tutorial Description*
            </label>
            <textarea
              id="tutorial_description"
              name="tutorial_description"
              value={formData.tutorial_description}
              onChange={handleChange}
              rows={5}
              className="w-full border-2 border-gray-400 py-2 px-3 text-black focus:border-black focus:outline-none bg-transparent"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="thumbnail" className="block text-lg font-medium text-black">
              Thumbnail*
            </label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-400 w-40 h-40 hover:border-black transition-colors">
                {thumbnailPreview ? (
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload size={24} className="text-gray-500" />
                    <span className="text-sm text-gray-500 mt-2">Upload image</span>
                  </div>
                )}
                <input
                  id="thumbnail"
                  name="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  required
                />
              </label>
              {thumbnailPreview && (
                <button 
                  type="button"
                  onClick={() => {
                    setThumbnail(null);
                    setThumbnailPreview(null);
                  }}
                  className="text-sm text-gray-600 hover:text-black"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">Required. Image will be used as tutorial thumbnail.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="meta_title" className="block text-lg font-medium text-black">
                Meta Title
              </label>
              <input
                id="meta_title"
                name="meta_title"
                type="text"
                value={formData.meta_title}
                onChange={handleChange}
                className="w-full border-b-2 border-gray-400 py-2 px-1 text-black focus:border-black focus:outline-none bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="meta_url" className="block text-lg font-medium text-black">
                Meta URL
              </label>
              <input
                id="meta_url"
                name="meta_url"
                type="text"
                value={formData.meta_url}
                onChange={handleChange}
                className="w-full border-b-2 border-gray-400 py-2 px-1 text-black focus:border-black focus:outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="meta_description" className="block text-lg font-medium text-black">
              Meta Description
            </label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description}
              onChange={handleChange}
              rows={3}
              className="w-full border-2 border-gray-400 py-2 px-3 text-black focus:border-black focus:outline-none bg-transparent"
            />
          </div>

          <div className="flex justify-end mt-10">
            <button
              type="button"
              onClick={goBack}
              className="border border-gray-400 text-gray-600 px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="border border-black text-black px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-4 w-4 border-b-2 border-current mr-2"></span>
                  Saving...
                </span>
              ) : (
                "Create Tutorial"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateTutorial;