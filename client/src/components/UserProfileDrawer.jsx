import { useState, useEffect } from "react";


export const UserProfileDrawer = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userPersona, setUserPersona] = useState(null);
  const [editablePersona, setEditablePersona] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  
  // API endpoint - adjust if your backend runs on a different port/host
  const API_ENDPOINT = "http://54.225.14.110";

  const fetchUserPersona = () => {
    // Use the API endpoint to fetch the user persona
    fetch(`${API_ENDPOINT}/get-user-persona`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Only update state if the data has changed
        if (JSON.stringify(data) !== JSON.stringify(userPersona)) {
          setUserPersona(data);
          // Initialize editable copy when we get new data
          if (!isEditing) {
            setEditablePersona(JSON.parse(JSON.stringify(data)));
          }
          setLastUpdated(new Date());
        }
      })
      .catch(error => {
        console.error("Error loading user persona:", error);
      });
  };

  // Save changes using the backend API
  const saveChanges = () => {
    setSaveStatus("saving");
    
    fetch(`${API_ENDPOINT}/update-user-persona`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: editablePersona })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        setSaveStatus("saved");
        setUserPersona(editablePersona);
        setIsEditing(false);
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    })
    .catch(err => {
      console.error("Error saving file:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 2000);
    });
  };

  // Format different value types for display
  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return " ";
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return " ";
      }
      return value.join(", ");
    }
    
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(", ");
    }
    
    return value.toString();
  };

  // Handle field changes
  const handleFieldChange = (key, value) => {
    // Create a copy of the editable persona
    const updatedPersona = {...editablePersona};
    
    // Handle different data types
    if (Array.isArray(userPersona[key])) {
      updatedPersona[key] = value.split(",").map(item => item.trim());
    } else if (typeof userPersona[key] === 'object' && userPersona[key] !== null) {
      // For objects, this is a simple implementation - for complex objects you'll need more logic
      const obj = {};
      value.split(",").forEach(pair => {
        const [k, v] = pair.split(":").map(part => part.trim());
        if (k && v) obj[k] = v;
      });
      updatedPersona[key] = obj;
    } else if (typeof userPersona[key] === 'number') {
      updatedPersona[key] = Number(value);
    } else if (typeof userPersona[key] === 'boolean') {
      updatedPersona[key] = value === 'true';
    } else {
      updatedPersona[key] = value;
    }
    
    setEditablePersona(updatedPersona);
  };

  // Initial load
  useEffect(() => {
    fetchUserPersona();
  }, []);

  // Set up polling only when not in editing mode
  useEffect(() => {
    if (isEditing) return;
    
    const intervalId = setInterval(() => {
      fetchUserPersona();
    }, 5000); // 5000 ms = 5 seconds

    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, [userPersona, isEditing]);

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If we're exiting edit mode without saving, reset to original
      setEditablePersona(JSON.parse(JSON.stringify(userPersona)));
    } else {
      // Make sure we have a fresh copy to edit
      setEditablePersona(JSON.parse(JSON.stringify(userPersona)));
    }
    setIsEditing(!isEditing);
  };

  // Cancel editing and revert changes
  const cancelEditing = () => {
    setEditablePersona(JSON.parse(JSON.stringify(userPersona)));
    setIsEditing(false);
  };

  return (
    <>
      {/* User Profile Button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </button>

      {/* User Persona Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 pointer-events-auto flex z-50">
          {/* Backdrop */}
          <div 
            className="bg-black bg-opacity-50 absolute inset-0" 
            onClick={() => {
              if (isEditing) {
                if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
                  setIsEditing(false);
                  setDrawerOpen(false);
                }
              } else {
                setDrawerOpen(false);
              }
            }}
          />
          
          {/* Drawer */}
          <div className="bg-white w-96 h-full absolute right-0 shadow-lg transform transition-transform duration-300 ease-in-out overflow-auto">
            <div className="p-4 bg-pink-500 text-white flex justify-between items-center">
              <h2 className="font-bold text-xl">User Profile</h2>
              <div className="flex gap-2">
                <button 
                  onClick={toggleEditMode}
                  className="text-white"
                  title={isEditing ? "View Mode" : "Edit Mode"}
                >
                  {isEditing ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  )}
                </button>
                <button 
                  onClick={() => {
                    if (isEditing && JSON.stringify(editablePersona) !== JSON.stringify(userPersona)) {
                      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
                        setIsEditing(false);
                        setDrawerOpen(false);
                      }
                    } else {
                      setDrawerOpen(false);
                    }
                  }}
                  className="text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {isEditing && (
              <div className="bg-blue-50 p-3 flex justify-between items-center border-b border-blue-200">
                <span className="text-sm text-blue-700">Edit Mode</span>
                <div className="flex gap-2">
                  <button 
                    onClick={saveChanges}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    disabled={saveStatus === "saving"}
                  >
                    {saveStatus === "saving" ? "Saving..." : "Save"}
                  </button>
                  <button 
                    onClick={cancelEditing}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {saveStatus === "saved" && (
              <div className="bg-green-100 text-green-800 p-2 text-center text-sm">
                Changes saved successfully!
              </div>
            )}
            
            {saveStatus === "error" && (
              <div className="bg-red-100 text-red-800 p-2 text-center text-sm">
                Error saving changes. Please try again.
              </div>
            )}
            
            <div className="p-4">
              {userPersona ? (
                <div className="space-y-4">
                  {Object.entries(isEditing ? editablePersona : userPersona).map(([key, value]) => (
                    <div key={key} className="border-b pb-2">
                      <h3 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                      {isEditing ? (
                        <div>
                          {Array.isArray(value) || typeof value === 'object' ? (
                            <textarea
                              className="w-full p-2 border rounded mt-1 text-sm"
                              value={formatValue(value)}
                              onChange={(e) => handleFieldChange(key, e.target.value)}
                              rows={3}
                            />
                          ) : typeof value === 'boolean' ? (
                            <select
                              className="w-full p-2 border rounded mt-1"
                              value={value.toString()}
                              onChange={(e) => handleFieldChange(key, e.target.value)}
                            >
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          ) : (
                            <input
                              type={typeof value === 'number' ? 'number' : 'text'}
                              className="w-full p-2 border rounded mt-1"
                              value={value}
                              onChange={(e) => handleFieldChange(key, e.target.value)}
                            />
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {Array.isArray(value) 
                              ? "Comma-separated list" 
                              : typeof value === 'object' && value !== null
                              ? "Format as key: value, key2: value2" 
                              : ""}
                          </p>
                        </div>
                      ) : (
                        <p>{formatValue(value)}</p>
                      )}
                    </div>
                  ))}
                  
                  {lastUpdated && !isEditing && (
                    <div className="text-xs text-gray-500 mt-4">
                      Last updated: {lastUpdated.toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <p>Loading user data...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

