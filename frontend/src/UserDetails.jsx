import { useAuth } from "./contexts/useAuth.jsx";
import { useState, useEffect, useRef } from 'react';
import { TiDelete, TiWeatherPartlySunny } from "react-icons/ti";
import { useNavigate } from 'react-router-dom';
import { FaPowerOff } from "react-icons/fa6";
import DeleteFavCityModal from './DeleteFavCityModal';

function UserDetails() {
  const { token, user, setUser, logout } = useAuth();
  const [myFavs, setMyFavs] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalUserData, setOriginalUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFavId, setCurrentFavId] = useState(null);

  const navigate = useNavigate();
  const usernameRef = useRef(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);

  useEffect(() => {
    const fetchMyFavs = async () => {
      if (!token) return;

      try {
        const response = await fetch('http://localhost:8000/api/favouritecities/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch favourite cities');
        }

        const data = await response.json();
        setMyFavs(data);
      } catch (error) {
        console.error('Error fetching favourite cities:', error.message);
      }
    };

    if (user) setOriginalUserData(user);
    fetchMyFavs();
  }, [token, user]);

  const handleModifyData = () => setIsEditMode(true);

  const handleCancel = () => {
    if (originalUserData) {
      usernameRef.current.value = originalUserData.username;
      firstNameRef.current.value = originalUserData.first_name;
      lastNameRef.current.value = originalUserData.last_name;
    }
    setIsEditMode(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const updatedData = {
      username: usernameRef.current.value,
      first_name: firstNameRef.current.value,
      last_name: lastNameRef.current.value,
    };

    try {
      const response = await fetch(`http://localhost:8000/api/user/${user.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Failed to update user');
      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoToWeather = () => navigate('/');

  const openModal = (favId) => {
    setCurrentFavId(favId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentFavId(null);
  };

  const deleteFavourite = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/favouritecities/${currentFavId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete favorite city');
      setMyFavs((prevFavs) => prevFavs.filter((fav) => fav.id !== currentFavId));
      closeModal();
    } catch (error) {
      console.error('Error deleting favorite city:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10">
      <div className="w-full max-w-screen-md bg-white p-10 rounded-xl ring-8 ring-white ring-opacity-40">
        {user ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <button onClick={handleGoToWeather} className="flex items-center bg-blue-400 hover:bg-blue-700 px-4 py-2 rounded text-white">
                <TiWeatherPartlySunny size="1.2em" color="white" />
              </button>
              <p className="font-semibold text-2xl text-center flex-grow">Hi, {user.first_name ? user.first_name : user.username}!</p>
              <button onClick={handleLogout} className="flex items-center bg-blue-400 hover:bg-blue-700 px-4 py-2 rounded text-white">
                <FaPowerOff size="1.2em" color="white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input type="text" defaultValue={user.username} ref={usernameRef} disabled={!isEditMode} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" defaultValue={user.first_name} ref={firstNameRef} disabled={!isEditMode} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" defaultValue={user.last_name} ref={lastNameRef} disabled={!isEditMode} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" />
              </div>

              {isEditMode ? (
                <div className="flex justify-center gap-4">
                  <button type="submit" className="w-32 p-2 bg-blue-500 text-white rounded-md">Save Changes</button>
                  <button type="button" onClick={handleCancel} className="w-32 p-2 bg-gray-500 text-white rounded-md">Cancel</button>
                </div>
              ) : (
                <button type="button" onClick={handleModifyData} className="w-full p-3 bg-blue-500 text-white rounded-md">Modify Data</button>
              )}
            </form>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">My Favourite Cities</h3>
              <ul className="space-y-2">
                {myFavs.map((f) => (
                  <li key={f.id} className="flex justify-between items-center border-b py-2">
                    <span className="text-sm">{f.city.name}, {f.city.state} - {f.city.country}</span>
                    <TiDelete onClick={() => openModal(f.id)} className="cursor-pointer text-red-500 hover:text-red-700" />
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal for deleting favorite city */}
            {isModalOpen && (
              <DeleteFavCityModal 
                onConfirm={deleteFavourite} 
                onCancel={closeModal} 
                message="Are you sure you want to delete this favorite city?" 
              />
            )}
          </>
        ) : (
          <p>Loading user data...</p>
        )}
      </div>
    </div>
  );
}

export default UserDetails;