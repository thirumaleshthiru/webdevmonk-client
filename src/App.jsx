import './index.css'
import Routex from './utils/Routex'
import CustomNavbar from './components/CustomNavbar'
function App() {
  

  return (
    <>
      
          <div className='flex flex-col min-h-screen'>
                <CustomNavbar />
                <div className='flex-grow mt-10'>
                  <Routex />
                </div>
          </div>
    </>
   
  )
}

export default App
