// src/services/chatService.js

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://stock-analyst-chatgpt-backend.onrender.com";

// Helper function to get auth token (consistent with AuthService)
const getAuthToken = () => {
  return localStorage.getItem("token") || "";
};

const getRefreshToken = () => {
  return localStorage.getItem("refreshToken") || "";
};

// Helper function to refresh token (consistent with AuthService)
const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  console.log("Attempting to refresh token...");

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  const data = await response.json();

  // Update token in localStorage (consistent with AuthService)
  if (data.token) {
    localStorage.setItem("token", data.token);
    return data.token;
  } else {
    throw new Error("No token received from refresh");
  }
};

// Helper function to clear tokens (consistent with AuthService)
const clearTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

// Helper function to make API calls with token refresh
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const makeRequest = async (token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("Making API call to:", url); // Debug log

    const response = await fetch(url, config);
    console.log("Response status:", response.status); // Debug log

    return response;
  };

  try {
    const token = getAuthToken();
    let response = await makeRequest(token);

    // Handle 401 - try to refresh token
    if (response.status === 401 && token) {
      console.log("Token expired, attempting refresh...");
      try {
        const newToken = await refreshAuthToken();
        response = await makeRequest(newToken);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Clear tokens and redirect to login (consistent with AuthService pattern)
        clearTokens();
        window.location.href = "/api/login";
        throw new Error("Authentication failed");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Response data:", data); // Debug log
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

export const chatService = {
  // Send message to AI
  sendMessage: async (message, stockSymbol = null, context = {}) => {
    const payload = {
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    // Add stock symbol if provided
    // if (stockSymbol) {
    //   payload.stockSymbol = stockSymbol;////here made a change vikram
    // }

    return await apiCall("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Get stock analysis

  getStockAnalysis: async (symbol) => {
    try {
      if (!symbol) {
        throw new Error("Stock symbol is required");
      }

      const response = await apiCall(
        `/api/ai/analysis/${symbol.toUpperCase()}`,
        {
          method: "GET",
        }
      );

      return response;
    } catch (error) {
      // Handle specific errors
      if (error.status === 404) {
        throw new Error(`Stock symbol "${symbol}" not found`);
      }
      if (error.status === 429) {
        throw new Error("Too many requests. Please wait.");
      } else {
        throw new Error(
          "Daily limit for stock api key is exceeded. For renew it may take upto 24 hours."
        );
      }
    }
  },

  // Get chat sessions
  getChatSessions: async () => {
    return await apiCall("/api/ai/sessions", {
      method: "GET",
    });
  },

  // Get specific chat session
  getChatSession: async (sessionId) => {
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    return await apiCall(`/api/ai/sessions/${sessionId}`, {
      method: "GET",
    });
  },

  // Delete chat session
  deleteChatSession: async (sessionId) => {
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    return await apiCall(`/api/ai/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },
};
