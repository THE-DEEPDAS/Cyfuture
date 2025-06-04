import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const AuthDebug = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [apiTest, setApiTest] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem("token");
    setToken(storedToken || "No token found");

    // Test API
    const testApi = async () => {
      try {
        const response = await api.get("/users/me");
        setApiTest({
          success: true,
          data: response.data,
        });
      } catch (error) {
        setApiTest({
          success: false,
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      }
    };

    if (isAuthenticated) {
      testApi();
    }
  }, [isAuthenticated]);

  return (
    <div
      className="fixed bottom-0 right-0 bg-gray-800 text-white p-4 m-4 rounded-lg shadow-lg z-50 opacity-80 hover:opacity-100 transition-opacity overflow-auto"
      style={{ maxHeight: "500px", maxWidth: "600px" }}
    >
      <h2 className="text-xl font-bold mb-4">Auth Debug</h2>

      <div className="mb-4">
        <h3 className="font-semibold">Auth State:</h3>
        <div className="ml-2">
          <p>Loading: {loading ? "true" : "false"}</p>
          <p>Authenticated: {isAuthenticated ? "true" : "false"}</p>
          <p>User Role: {user?.role || "No user"}</p>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Token:</h3>
        <div className="ml-2 break-all">
          <p className="text-xs">{token}</p>
        </div>
      </div>

      {apiTest && (
        <div className="mb-4">
          <h3 className="font-semibold">API Test:</h3>
          <div className="ml-2">
            <p>Success: {apiTest.success ? "true" : "false"}</p>
            {apiTest.success ? (
              <pre className="text-xs mt-2 bg-gray-900 p-2 rounded overflow-auto">
                {JSON.stringify(apiTest.data, null, 2)}
              </pre>
            ) : (
              <div>
                <p>Error: {apiTest.error}</p>
                <p>Status: {apiTest.status}</p>
                {apiTest.data && (
                  <pre className="text-xs mt-2 bg-gray-900 p-2 rounded overflow-auto">
                    {JSON.stringify(apiTest.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
      >
        Force Logout
      </button>
    </div>
  );
};

export default AuthDebug;
