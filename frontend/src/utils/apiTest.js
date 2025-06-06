import api from "./api";

// This function can be used to test API connectivity
export const testApiConnection = async () => {
  try {
    console.log("Testing API connection...");
    const response = await api.get("/auth/test");
    console.log("API test response:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("API test failed:", error);
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

// Test user authentication
export const testUserAuth = async () => {
  try {
    console.log("Testing user authentication...");
    const response = await api.get("/users/me");
    console.log("User auth test response:", response.data);
    return { success: true, user: response.data };
  } catch (error) {
    console.error("User auth test failed:", error);
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};
