import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.login(formData);

      if (response.success) {
        // Update auth context with user data
        await login(response.data.user, response.data.data.token);

        // Navigate to intended destination
        navigate(from, { replace: true });
      } else {
        setErrors({
          general: response.message || "Login failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle different types of errors
      if (error.response?.status === 401) {
        setErrors({
          general: "Invalid email or password. Please try again.",
        });
      } else if (error.response?.status === 429) {
        setErrors({
          general: "Too many login attempts. Please try again later.",
        });
      } else if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = {};
        error.response.data.errors.forEach((err) => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
      } else {
        setErrors({
          general: "Network error. Please check your connection and try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (userType) => {
    const demoCredentials = {
      analyst: {
        email: "demo.analyst@example.com",
        password: "demo123",
      },
      investor: {
        email: "demo.investor@example.com",
        password: "demo123",
      },
    };

    setFormData(demoCredentials[userType]);

    // Auto-submit after setting demo credentials
    setTimeout(() => {
      document
        .getElementById("login-form")
        .dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true })
        );
    }, 100);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your Stock Analyst account</p>
        </div>

        {errors.general && <ErrorMessage message={errors.general} />}

        <form id="login-form" onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? "error" : ""}`}
              placeholder="Enter your email"
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? "error" : ""}`}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" name="rememberMe" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : "Sign In"}
          </button>
        </form>

        <div className="demo-section">
          <div className="divider">
            <span>Or try demo accounts</span>
          </div>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-button analyst"
              onClick={() => handleDemoLogin("analyst")}
              disabled={isLoading}
            >
              Demo Analyst
            </button>
            <button
              type="button"
              className="demo-button investor"
              onClick={() => handleDemoLogin("investor")}
              disabled={isLoading}
            >
              Demo Investor
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="register-link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
