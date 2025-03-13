import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axiosInstance from "../utils/axiosInstance.js";
import { useAuth } from "../utils/AuthContext.jsx";
import { ArrowLeft, Upload, Save, AlertCircle } from "lucide-react";

const EditProject = () => {
  const navigate = useNavigate();
  const { project_id } = useParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const quillRef = useRef(null);
  
  const [formData, setFormData] = useState({
    project_name: "",
    project_description: "",
    project_content: "",
    demo_link: "",
    meta_title: "",
    meta_description: "",
    meta_url: ""
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setFetchLoading(true);
        const response = await axiosInstance.get(`/api/projects/projects/${project_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const projectData = response.data.data[0];
        if (projectData) {
          setFormData({
            project_name: projectData.project_name || "",
            project_description: projectData.project_description || "",
            project_content: projectData.project_content || "",
            demo_link: projectData.demo_link || "",
            meta_title: projectData.meta_title || "",
            meta_description: projectData.meta_description || "",
            meta_url: projectData.meta_url || ""
          });
          
          if (projectData.thumbnail) {
            setExistingThumbnail(projectData.thumbnail);
            setThumbnailPreview(`http://64.225.84.149:7000/uploads/${projectData.thumbnail}`);
          }
        } else {
          setError("Project not found.");
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
        setError(error.response?.data?.message || "Failed to load project. Please try again.");
      } finally {
        setFetchLoading(false);
      }
    };

    if (project_id && token) {
      fetchProject();
    }
  }, [project_id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      project_content: content
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      setExistingThumbnail(null);
    }
  };

  // Image handler for Quill editor
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append("image", file);
      
      try {
        setLoading(true);
        // Use relative URL path instead of hardcoded URL
        const response = await axiosInstance.post("/upload", formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (!response.data || !response.data.url) {
          throw new Error("Image upload failed");
        }
        
        // Use proper URL construction with API URL from environment or config
        const baseUrl = import.meta.env.VITE_API_URL || 'http://64.225.84.149:7000';
        const imageUrl = `${baseUrl}/uploads/${response.data.url}`;
        
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertEmbed(range.index, "image", imageUrl);
        quill.setSelection(range.index + 1);
      } catch (error) {
        console.error("Error uploading image:", error);
        setError("Failed to upload image. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  }, [token, setError, setLoading]);

  // Quill modules configuration
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ align: [] }],
          ["link", "image", "code-block"],
          ["clean"]
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.project_name || !formData.project_description || !formData.project_content) {
      setError("Project name, description, and content are required.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create FormData object for file upload
      const data = new FormData();
      
      // Append all text fields
      data.append("project_name", formData.project_name);
      data.append("project_description", formData.project_description);
      data.append("project_content", formData.project_content);
      data.append("demo_link", formData.demo_link || "");
      data.append("meta_title", formData.meta_title || "");
      data.append("meta_description", formData.meta_description || "");
      data.append("meta_url", formData.meta_url || "");
      
      // Only append thumbnail if a new one was selected
      if (thumbnail) {
        data.append("thumbnail", thumbnail);
      }
      
      // Use axiosInstance for the request
      await axiosInstance.put(`/api/projects/update/${project_id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(true);
      
      // Scroll to top to show success message
      window.scrollTo(0, 0);
      
      // Optional: redirect after a short delay
      // setTimeout(() => navigate("/manage-projects"), 2000);
      
    } catch (error) {
      console.error("Failed to update project:", error);
      setError(error.response?.data?.message || "Failed to update project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  if (fetchLoading) {
    return (
      <section className="min-h-screen bg-white p-4 sm:p-6 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-black rounded-full"></div>
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
              Edit Project
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
            <p className="text-green-700">Project updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
          <div>
            <label htmlFor="project_name" className="block text-sm font-semibold mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="project_name"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              required
              className="w-full p-3 border-2 border-gray-300 focus:border-black outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="project_description" className="block text-sm font-semibold mb-2">
              Project Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="project_description"
              name="project_description"
              value={formData.project_description}
              onChange={handleChange}
              rows="3"
              required
              className="w-full p-3 border-2 border-gray-300 focus:border-black outline-none transition-colors"
            ></textarea>
          </div>

          <div>
            <label htmlFor="project_content" className="block text-sm font-semibold mb-2">
              Project Content <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-gray-300 focus-within:border-black transition-colors overflow-y-auto">
              <ReactQuill
                ref={quillRef}
                value={formData.project_content}
                onChange={handleContentChange}
                modules={modules}
                className="h-96 bg-white"
                theme="snow"
                preserveWhitespace={true}
                forceSync={true}
              />
            </div>
          </div>

          <div>
            <label htmlFor="demo_link" className="block text-sm font-semibold mb-2">
              Demo Link
            </label>
            <input
              type="url"
              id="demo_link"
              name="demo_link"
              value={formData.demo_link}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full p-3 border-2 border-gray-300 focus:border-black outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-sm font-semibold mb-2">
              Thumbnail {!existingThumbnail && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 w-40 h-40 hover:border-black transition-colors">
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
                  required={!existingThumbnail}
                />
              </label>
              {thumbnailPreview && (
                <button 
                  type="button"
                  onClick={() => {
                    if (existingThumbnail) {
                      setExistingThumbnail(null);
                    }
                    setThumbnail(null);
                    setThumbnailPreview(null);
                  }}
                  className="text-sm text-gray-600 hover:text-black"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {existingThumbnail ? "Leave as is or upload a new thumbnail." : "Required. Image will be used as project thumbnail."}
            </p>
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
                value={formData.meta_title}
                onChange={handleChange}
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
                value={formData.meta_url}
                onChange={handleChange}
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
              value={formData.meta_description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border-2 border-gray-300 focus:border-black outline-none transition-colors"
            ></textarea>
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Update Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditProject;