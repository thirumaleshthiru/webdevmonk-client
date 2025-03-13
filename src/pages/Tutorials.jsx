import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";

const Tutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/tutorials/tutorials");
        setTutorials(response.data.data);
      } catch (error) {
        console.error("Failed to fetch tutorials:", error);
        setError(error.response?.data?.message || "Failed to load tutorials. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTutorials();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <section className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold text-black mb-16 border-b-2 border-black pb-5">
          Tutorials
        </h1>

        {loading ? (
          <div className="flex justify-center items-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : error ? (
          <div className="my-12 p-6 border-l-4 border-black bg-gray-100">
            <p className="text-black">{error}</p>
          </div>
        ) : tutorials.length === 0 ? (
          <div className="my-12 text-center">
            <p className="text-xl text-black">No tutorials available at this time.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {tutorials.map((tutorial, index) => (
              <div key={tutorial.tutorial_id} className="group">
                <div className="flex flex-col">
                  <span className="text-8xl font-bold text-gray-500 mb-4">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  
                  <div className="mb-6">
                    <span className="text-sm text-gray-800">
                      {formatDate(tutorial.created_at)}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-black mb-3">
                    {tutorial.tutorial_name}
                  </h2>
                  
                  <p className="text-gray-700 mb-8 max-w-2xl line-clamp-2">
                    {tutorial.tutorial_description}
                  </p>
                  
                  <Link
                    to={`/${tutorial.meta_url}`}
                    className="inline-block border border-black text-black px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors text-center md:text-left w-full md:max-w-[30%]"
                  >
                    Read now
                  </Link>
                </div>
                
                {index < tutorials.length - 1 && (
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

export default Tutorials;