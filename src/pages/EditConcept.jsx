import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axiosInstance from "../utils/axiosInstance.js";
import { useAuth } from "../utils/AuthContext.jsx";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";

const EditConcept = () => {
  const navigate = useNavigate();
  const { concept_id } = useParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const quillRef = useRef(null);
  
  const [formData, setFormData] = useState({
    concept_name: "",
    concept_description: "",
    concept_content: "",
    meta_title: "",
    meta_description: "",
    meta_url: ""
  });
  
  const [tutorialInfo, setTutorialInfo] = useState({
    tutorial_id: "",
    tutorial_name: ""
  });

  // Check if user is authenticated
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Fetch concept data
  useEffect(() => {
    const fetchConceptData = async () => {
      try {
        setDataLoading(true);
        setError(null);
        
        const response = await axiosInstance.get(`/api/concepts/concepts/${concept_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.data && response.data.data.length > 0) {
          const conceptData = response.data.data[0];
          setFormData({
            concept_name: conceptData.concept_name || "",
            concept_description: conceptData.concept_description || "",
            concept_content: conceptData.concept_content || "",
            meta_title: conceptData.meta_title || "",
            meta_description: conceptData.meta_description || "",
            meta_url: conceptData.meta_url || ""
          });
          
          setTutorialInfo({
            tutorial_id: conceptData.tutorial_id || "",
            tutorial_name: conceptData.tutorial_name || ""
          });
        } else {
          throw new Error("Concept not found");
        }
      } catch (error) {
        console.error("Failed to fetch concept data:", error);
        setError(error.response?.data?.message || "Failed to load concept data. Please try again.");
      } finally {
        setDataLoading(false);
      }
    };

    if (token && concept_id) {
      fetchConceptData();
    }
  }, [token, concept_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      concept_content: content
    }));
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
        const response = await axiosInstance.post("/upload", formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (!response.data || !response.data.url) {
          throw new Error("Image upload failed");
        }
        
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:7000';
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
  }, [token]);

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
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate form data
    if (!formData.concept_name || !formData.concept_content) {
      setError("Concept name and content are required");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.put(`/api/concepts/update/${concept_id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess("Concept updated successfully");
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        navigate('/manage-concepts');
      }, 1500);
    } catch (error) {
      console.error("Failed to update concept:", error);
      setError(error.response?.data?.message || "Failed to update concept. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/manage-concepts');
  };

  if (dataLoading) {
    return (
      <section className="min-h-screen bg-white p-4 sm:p-6 flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-black rounded-full"></div>
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
              Edit Concept
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
              <label htmlFor="tutorial_info" className="block text-sm font-semibold mb-2">
                Tutorial
              </label>
              <input
                type="text"
                id="tutorial_info"
                value={tutorialInfo.tutorial_name}
                readOnly
                className="w-full p-3 border-2 border-gray-300 bg-gray-50 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="concept_name" className="block text-sm font-semibold mb-2">
                Concept Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="concept_name"
                name="concept_name"
                value={formData.concept_name}
                onChange={handleInputChange}
                required
                className="w-full p-3 border-2 border-gray-300 focus:border-black outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="concept_description" className="block text-sm font-semibold mb-2">
                Concept Description
              </label>
              <textarea
                id="concept_description"
                name="concept_description"
                value={formData.concept_description}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-3 border-2 border-gray-300 focus:border-black outline-none transition-colors"
              ></textarea>
            </div>

            <div>
              <label htmlFor="concept_content" className="block text-sm font-semibold mb-2">
                Concept Content <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-gray-300 focus-within:border-black transition-colors overflow-y-auto">
                <ReactQuill
                  ref={quillRef}
                  value={formData.concept_content}
                  onChange={handleContentChange}
                  modules={modules}
                  className="h-96 bg-white"
                  theme="snow"
                  preserveWhitespace={true}
                  forceSync={true}
                />
              </div>
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
                  value={formData.meta_url}
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
                value={formData.meta_description}
                onChange={handleInputChange}
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
                    Update Concept
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

export default EditConcept;