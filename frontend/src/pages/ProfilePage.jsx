import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile, updateUserProfile } from '../redux/actions/authActions';
import Loader from '../components/common/Loader';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.auth);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    // Add more fields as needed
  });

  useEffect(() => {
    if (!userInfo) {
      dispatch(getUserProfile());
    } else {
      setForm({
        name: userInfo.name || '',
        email: userInfo.email || '',
        phone: userInfo.phone || '',
        // Add more fields as needed
      });
    }
  }, [dispatch, userInfo]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile(form));
    setEditMode(false);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="alert-danger">{error}</div>
      ) : (
        <div className="bg-dark-800 p-6 rounded-lg shadow-md">
          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-input mt-1 block w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input mt-1 block w-full"
                  required
                  disabled
                />
              </div>
              <div>
                <label className="block text-gray-300">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="form-input mt-1 block w-full"
                />
              </div>
              {/* Add more fields as needed */}
              <div className="flex gap-2 mt-4">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-outline" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          ) : (
            <div>
              <p className="text-gray-300 mb-2"><span className="font-semibold">Name:</span> {form.name}</p>
              <p className="text-gray-300 mb-2"><span className="font-semibold">Email:</span> {form.email}</p>
              <p className="text-gray-300 mb-2"><span className="font-semibold">Phone:</span> {form.phone}</p>
              {/* Add more fields as needed */}
              <button className="btn-primary mt-4" onClick={handleEdit}>Edit</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
