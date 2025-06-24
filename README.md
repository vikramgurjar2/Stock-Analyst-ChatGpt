![dashboard_AI_CHAT](https://github.com/user-attachments/assets/ba26014b-5894-45b7-ad8a-d9594bdec9b6)
![dashboard1](https://github.com/user-attachments/assets/b4afd494-0711-41cd-bcc8-a0551ee06265)
![dashboard2](https://github.com/user-attachments/assets/40b619cd-bf57-4cf2-9745-7624579f49ba)
![dashboard_report](https://github.com/user-attachments/assets/98ad8a29-7371-4481-bd86-627e6a6ee2ee)
![dashboard_invest](https://github.com/user-attachments/assets/dfab46a5-e1fc-40b5-97bd-05e1d1acdeda)

# Stock Analyst ChatGPT System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://www.mongodb.com/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen.svg)](https://stock-analyst-chat-gpt.vercel.app/)

An AI-powered stock analysis platform that combines conversational AI capabilities with advanced technical analysis tools. Built with the MERN stack and integrated with Gemini AI for intelligent stock analysis and portfolio optimization.

## 🌐 Live Demo

**🔗 [Try the Live Application](https://stock-analyst-chat-gpt.vercel.app/)**

Experience the full functionality of the Stock Analyst ChatGPT System with our live deployment. Test the AI-powered stock analysis, chat interface, and portfolio optimization features in real-time.

## 🚀 Features

- **Conversational AI Analysis**: Chat with an AI analyst for real-time stock insights
- **Technical Analysis**: RSI, MACD, Moving Averages, Bollinger Bands, and more
- **Portfolio Optimization**: AI-powered allocation recommendations with risk metrics
- **Real-time Data**: Live stock prices and instant market updates
- **Role-based Access**: Separate interfaces for analysts and investors
- **Historical Reporting**: Track analysis history and performance over time
- **Risk Management**: Sharpe ratio, Beta, VaR calculations
- **Interactive Charts**: Real-time candlestick charts with technical overlays

## 🛠️ Tech Stack

**Frontend:**
- React.js 18.2.0
- Tailwind CSS
- Chart.js/Recharts
- Socket.io-client
- Axios

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose
- Socket.io
- JWT Authentication
- bcrypt

**AI & APIs:**
- Google Gemini 1.5 Flash API
- Alpha Vantage Stock API
- Technical Indicators Library

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** 18.x or higher
- **npm** 8.x or higher
- **MongoDB** 7.0 or higher (local installation or MongoDB Atlas)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/stock-analyst-chatgpt.git
cd stock-analyst-chatgpt
```

### 2. Install All Dependencies

```bash
npm run install-deps
```

This command will install dependencies for the root, backend, and frontend directories.

### 3. Environment Variables Setup

Create a `.env` file in the **backend** directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.g24j7qz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=7d

# API Keys
GEMINI_API_KEY=your-gemini-api-key-here
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key-here

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Create a `.env` file in the **frontend** directory:

```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_SOCKET_URL=http://localhost:5001
```

### 4. Get API Keys

#### Gemini AI API Key:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy and paste it into your `.env` file

#### Alpha Vantage API Key:
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account
3. Get your free API key
4. Copy and paste it into your `.env` file

## 🚀 Running the Application

### Development Mode

Start both backend and frontend servers simultaneously:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5001`
- Frontend server on `http://localhost:3000`

### Individual Server Commands

**Start Backend Only:**
```bash
npm run dev
```

**Start Frontend Only:**
```bash
npm start
```

### Production Mode

**Build the frontend:**
```bash
npm run build
```

**Start production server:**
```bash
npm start
```

## 📁 Project Structure

```
stock-analyst-chatgpt/
├── backend/                 # Node.js/Express API Server
│   ├── config/             # Database configuration
│   │   └── database.js
│   ├── controllers/        # Business logic controllers
│   │   ├── aiC.js         # Secondary AI controller
│   │   ├── aiController.js # Primary AI analysis controller
│   │   ├── authController.js # Authentication logic
│   │   └── stockController.js # Stock data controller
│   ├── middleware/         # Custom middleware
│   │   └── auth.js        # JWT authentication middleware
│   ├── models/            # MongoDB schemas
│   │   ├── Chat.js        # Chat history schema
│   │   ├── Stock.js       # Stock data schema
│   │   └── User.js        # User schema with roles
│   ├── routes/            # API endpoints
│   │   ├── ai.js          # AI analysis routes
│   │   ├── auth.js        # Authentication routes
│   │   ├── stocks.js      # Stock data routes
│   │   └── users.js       # User management routes
│   ├── services/          # External API integrations
│   │   └── stockServices.js # Stock data processing
│   ├── sockets/           # WebSocket handlers
│   │   └── stockSocket.js # Real-time price updates
│   └── server.js          # Main server file
├── frontend/              # React.js Client Application
│   └── src/
│       ├── components/    # React components
│       │   ├── auth/     # Login/Register components
│       │   ├── chat/     # AI chat interface
│       │   ├── common/   # Shared components
│       │   ├── dashboard/ # Main dashboard components
│       │   ├── investors/ # Investor management
│       │   └── reports/  # Historical reports
│       ├── hooks/        # Custom React hooks
│       │   ├── useChat.js
│       │   └── useStockData.js
│       ├── services/     # API service layers
│       │   ├── authService.js
│       │   ├── chatService.js
│       │   ├── stockService.js
│       │   └── socketClient.js
│       ├── context/      # React context providers
│       │   └── AuthContext.js
│       └── utils/        # Helper functions
│           ├── formatters.js
│           └── notifications.js
└── package.json          # Root package configuration
```

## 🎯 Usage

### For Investors:
1. **Register/Login** with investor role
2. **Chat Interface**: Ask questions like "Should I buy AAPL?" or "Analyze TSLA technical indicators"
3. **Dashboard**: View your portfolio overview and performance metrics
4. **Reports**: Access historical analysis and recommendations

### For Analysts:
1. **Login** with analyst credentials
2. **Manage Multiple Portfolios**: Access assigned investor accounts
3. **Advanced Analysis**: Use comprehensive technical analysis tools
4. **Generate Reports**: Create detailed analysis reports for clients

### Sample Chat Queries:
- "What's the technical analysis for Apple stock?"
- "Should I buy Tesla today?"
- "Analyze the risk of my current portfolio"
- "What's the optimal allocation for a balanced portfolio?"

## 🔒 Authentication & Roles

The system supports two user roles:

- **Investors**: Personal portfolio access, basic analysis tools
- **Analysts**: Multiple portfolio access, advanced tools, report generation

JWT-based authentication with secure password hashing ensures data protection.

## 📊 Technical Analysis Features

- **RSI (Relative Strength Index)**: 14-period momentum oscillator
- **MACD**: Moving Average Convergence Divergence with signal line
- **Moving Averages**: Simple and Exponential (customizable periods)
- **Bollinger Bands**: 20-period with 2 standard deviations
- **Risk Metrics**: Sharpe ratio, Beta coefficient, volatility analysis
- **Portfolio Optimization**: Modern Portfolio Theory implementation

## 🌐 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration with validation
- `POST /login` - User login with credentials
- `GET /me` - Get current authenticated user
- `POST /logout` - Logout current user
- `POST /refresh-token` - Refresh JWT token

### AI & Chat Routes (`/api/ai`)
- `POST /chat` - Send message to AI analyst
- `GET /analysis/:symbol` - Get AI stock analysis for symbol
- `GET /sessions` - Get all chat sessions for user
- `GET /sessions/:sessionId` - Get specific chat session
- `DELETE /sessions/:sessionId` - Delete chat session

### User Management Routes (`/api/users`)
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `GET /all` - Get all users (with role-based filtering)
- `GET /:id` - Get user by ID (with access control)
- `POST /assign-analyst` - Assign analyst to investor (analyst only)
- `DELETE /remove-analyst/:investorId` - Remove analyst assignment (analyst only)
- `GET /analyst/investors` - Get assigned investors for current analyst
- `GET /investor/analyst` - Get assigned analyst for current investor
- `PUT /preferences` - Update user preferences (notifications, theme)
- `GET /available/investors` - Get unassigned investors for analyst assignment
- `GET /stats/overview` - Get user statistics overview
- `POST /update-login` - Update last login timestamp

### Stock Data Routes (`/api/stocks`)
- `GET /quote/:symbol` - Get single stock quote by symbol
- `POST /quotes` - Get multiple stock quotes in bulk
- `GET /search` - Search stocks by query string
- `GET /watchlist` - Get current user's watchlist
- `POST /watchlist/refresh` - Refresh all watchlist stocks
- `POST /watchlist` - Add stock to watchlist
- `DELETE /watchlist/:symbol` - Remove stock from watchlist
- `GET /history/:symbol` - Get historical price data
- `GET /trending` - Get trending stocks list
- `GET /movers` - Get market movers (gainers/losers)
- `GET /portfolio` - Get user's portfolio summary
- `GET /market-status` - Get current market status

### Rate Limiting & Security
- **Rate Limiting**: 100 requests per 15 minutes per user
- **Authentication**: JWT tokens required for all protected routes
- **Validation**: Input validation on all POST/PUT requests
- **CORS**: Configured for frontend domain access

## 🚨 Troubleshooting

### Common Issues:

**MongoDB Connection Error:**
- Ensure MongoDB is running locally or check your Atlas connection string
- Verify network access and credentials

**API Key Errors:**
- Double-check your Gemini AI and Alpha Vantage API keys
- Ensure keys are properly set in environment variables

**Port Already in Use:**
- Change the PORT in your backend `.env` file
- Kill existing processes using the ports

**Build Errors:**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📈 Performance

- **Response Time**: < 2 seconds for AI analysis
- **Concurrent Users**: Supports 100+ simultaneous users
- **Uptime**: 99.7% availability during testing
- **Real-time Updates**: Sub-second price updates

## 🔮 Future Enhancements

- Mobile application development
- Advanced machine learning models
- Cryptocurrency analysis
- Social sentiment integration
- Institutional-grade compliance features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vikram Singh**

- GitHub: [@vikramgurjar2](https://github.com/vikramgurjar2)

## 🙏 Acknowledgments

- OpenAI for conversational AI capabilities
- Alpha Vantage for reliable stock data
- MongoDB for flexible data storage
- React community for excellent frontend tools

---

⭐ If you found this project helpful, please give it a star!

## 📞 Support

If you have any questions or need help setting up the project, please:

1. Check the [Issues](https://github.com/your-username/stock-analyst-chatgpt/issues) page
2. Create a new issue if your problem isn't already addressed

---
