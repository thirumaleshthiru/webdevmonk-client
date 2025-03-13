import React from 'react'
import { Route,Routes,Link } from 'react-router-dom';
import Home from '../pages/Home';
import Tutorials from '../pages/Tutorials';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import CreateTutorial from '../pages/CreateTutorial';
import ManageTutorials from '../pages/ManageTutorials';
import EditTutorial from '../pages/EditTutorial';
import CreateConcepts from '../pages/CreateConcept';
import ManageConcepts from '../pages/ManageConcepts';
import EditConcept from '../pages/EditConcept';
import CreateProject from '../pages/CreateProject';
import Projects from '../pages/Projects';
import ManageProjects from '../pages/ManageProjects';
import EditProject from '../pages/EditProject';
import ProjectDetails from '../pages/ProjectDetails';
import TutorialDetails from '../pages/TutorialDetails';
import ConceptDetails from '../pages/ConceptDetails';
 function Routex() {
  return (
    <>
        <Routes>
            <Route path='/' element={<Home />}  />
 
            <Route path='/tutorials' element = {<Tutorials />} />
            <Route path='/projects' element = {<Projects />} />
            <Route path='/login' element = {<Login />} />
            <Route path='/dashboard' element = {<Dashboard />} />
            <Route path='/create-tutorial' element = {<CreateTutorial />} />
            <Route path='/manage-tutorials' element = {<ManageTutorials />} />
            <Route path='/edit-tutorial/:tutorial_id' element = {<EditTutorial />} />
            <Route path='/create-concept' element = {<CreateConcepts />} />
            <Route path='/manage-concepts' element = {<ManageConcepts />} />
            <Route path='/edit-concept/:concept_id' element = {<EditConcept />} />
            <Route path='/create-project' element = {<CreateProject />} />
            <Route path='/manage-project' element = {<ManageProjects />} />
            <Route path='/edit-project/:project_id' element = {<EditProject />} />
            <Route path='/projects/:meta_url' element = {<ProjectDetails />} />
            <Route path='/:meta_url' element = {<TutorialDetails />} />
              <Route path='/:tutorial_meta_url/:concept_meta_url' element = {<ConceptDetails />} />



        </Routes>
    </>
  )
}

export default Routex