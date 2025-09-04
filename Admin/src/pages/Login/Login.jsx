import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import '../../i18n';
import config from '../../config/config';

const Login = ({ url, setIsAuthenticated }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${config.BACKEND_URL}/api/admin/login`, formData);
      
      if (response.data.success) {
        // Lưu token vào localStorage
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));
        
        setIsAuthenticated(true);
        toast.success(t('login.success'));
        navigate('/admin');
      } else {
        toast.error(response.data.message || t('login.failed'));
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Hiển thị lỗi cụ thể
      let errorMessage = t('login.failed');
      let detailedError = '';
      
      if (error.response) {
        // Server trả về response với status code
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        detailedError = `Status: ${error.response.status}\nResponse: ${JSON.stringify(error.response.data, null, 2)}`;
      } else if (error.request) {
        // Request được gửi nhưng không nhận được response
        errorMessage = 'No response from server';
        detailedError = 'Request was sent but no response received. Please check if the backend is running.';
      } else {
        // Lỗi khác
        errorMessage = error.message || 'Unknown error occurred';
        detailedError = error.stack || 'No stack trace available';
      }
      
      // Hiển thị toast với lỗi ngắn gọn
      toast.error(errorMessage);
      
      // Hiển thị modal với lỗi chi tiết
      setErrorDetails(detailedError);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{t('login.title')}</h1>
          <p>{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">{t('login.email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('login.emailPlaceholder')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('login.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('login.passwordPlaceholder')}
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? t('login.signingIn') : t('login.signIn')}
          </button>
        </form>

        {/* Error Modal */}
        {showErrorModal && (
          <div className="error-modal-overlay">
            <div className="error-modal">
              <div className="error-modal-header">
                <h3>🔍 Error Details</h3>
                <button 
                  className="error-modal-close"
                  onClick={() => setShowErrorModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="error-modal-body">
                <p className="error-summary">
                  <strong>Error occurred during login:</strong>
                </p>
                <pre className="error-details">
                  {errorDetails}
                </pre>
                <div className="error-tips">
                  <p><strong>💡 Troubleshooting tips:</strong></p>
                  <ul>
                    <li>Check if backend server is running</li>
                    <li>Verify API endpoint is correct</li>
                    <li>Check network connection</li>
                    <li>Review server logs for more details</li>
                  </ul>
                </div>
              </div>
              <div className="error-modal-footer">
                <button 
                  className="error-modal-btn"
                  onClick={() => setShowErrorModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
