import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import BrowseEvents from './pages/BrowseEvents'
import EventDetails from './pages/EventDetails';
import EventRegistrations from './pages/EventRegistrations'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/events" element={<MyEvents />} />
        <Route path="/browse-events" element={<BrowseEvents />} />
        <Route path="/event-details/:eventid" element={<EventDetails />} />
         <Route path="/events/:eventid/registrations" element={<EventRegistrations />} />
      </Routes>
    </Router>
  );
}

export default App;
