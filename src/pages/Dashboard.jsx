import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";
import { useEffect } from "react";
 import { 
  BookOpen, 
  FolderPlus, 
  Files, 
  Folder, 
  FolderEdit, 
  Lightbulb,
  Brain,
  LogOut
} from "lucide-react";

const Dashboard = () => {
  const { logout,token } = useAuth();
 const navigate = useNavigate();
  useEffect(()=>{
    if(!token){
        navigate('/')
    }
  },[token])

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    {
      section: "Tutorials",
      items: [
        { name: "Create Tutorial", path: "/create-tutorial", icon: <BookOpen size={20} /> },
        { name: "Manage Tutorials", path: "/manage-tutorials", icon: <Files size={20} /> }
      ]
    },
    {
      section: "Projects",
      items: [
        { name: "Create Project", path: "/create-project", icon: <FolderPlus size={20} /> },
        { name: "Manage Projects", path: "/manage-project", icon: <FolderEdit size={20} /> }
      ]
    },
    {
      section: "Concepts",
      items: [
        { name: "Create Concept", path: "/create-concept", icon: <Lightbulb size={20} /> },
        { name: "Manage Concepts", path: "/manage-concepts", icon: <Brain size={20} /> }
      ]
    }
  ];

  return (
    <section className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between  gap-3 mb-16 border-b-2 border-black pb-5 flex-col md:flex-row">
          <h1 className="text-6xl font-bold text-black">
            Dashboard
          </h1>
          
        </div>

        <div className="space-y-20">
          {menuItems.map((section, sectionIndex) => (
            <div key={section.section} className="group">
              <h2 className="text-3xl font-bold text-black mb-8">
                {section.section}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center border border-black p-6 text-black hover:bg-black hover:text-white transition-colors group"
                  >
                    <span className="p-3 bg-gray-100 rounded-full mr-4 group-hover:bg-white group-hover:text-black transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-xl font-medium">{item.name}</span>
                  </Link>
                ))}
              </div>

              {sectionIndex < menuItems.length - 1 && (
                <div className="h-px w-full bg-gray-500 mt-20"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;