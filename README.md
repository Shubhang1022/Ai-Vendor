# Vendor Price Platform

An AI-powered web platform that enables local vendors to discover competitive pricing and negotiate deals through intelligent automation. The platform provides real-time market intelligence and automated negotiation capabilities to help small and medium businesses optimize their pricing strategies and supplier relationships.

## 🚀 Features

- **AI-Driven Price Discovery**: Get competitive price recommendations within 3 seconds
- **Automated Negotiation**: AI-powered negotiation bots that work within your constraints
- **Real-Time Market Intelligence**: Live market data, trends, and competitor analysis
- **Deal Management**: Track negotiations, manage deals, and analyze performance
- **Multi-Factor Authentication**: Enterprise-grade security with TOTP support
- **Role-Based Access Control**: Granular permissions for different user types
- **Integration APIs**: Connect with existing business systems
- **Export Capabilities**: Generate reports in CSV, PDF, and JSON formats

## 🏗️ Architecture

The platform follows a microservices architecture with:

- **Frontend**: React.js with TypeScript
- **Backend Services**: Node.js with Express.js
- **AI/ML Components**: Python with TensorFlow/PyTorch
- **Databases**: PostgreSQL, MongoDB, Redis
- **Message Queue**: Apache Kafka
- **Infrastructure**: Docker containers with Kubernetes

## 📋 Current Implementation Status

### ✅ Completed Services
- **Authentication Service** - JWT-based auth with MFA support

### 🚧 In Development
- Vendor Management Service
- Price Discovery Service
- Market Intelligence Service
- Negotiation Service
- Deal Management Service
- Integration & Export Services
- Frontend Web Application

## 🛠️ Prerequisites

- **Node.js** v18 or higher
- **Redis** for session management
- **PostgreSQL** for user data
- **Docker** (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/vendor-price-platform.git
cd vendor-price-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
```bash
cd services/auth
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start Required Services
```bash
# Start Redis (required for auth service)
redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:alpine
```

### 5. Run the Authentication Service
```bash
cd services/auth
npm run dev
```

The auth service will be available at `http://localhost:3001`

## 🔧 Development

### Project Structure
```
vendor-price-platform/
├── services/
│   ├── auth/                 # Authentication service
│   ├── vendor/              # Vendor management (planned)
│   ├── price-discovery/     # Price discovery engine (planned)
│   └── ...
├── packages/                # Shared packages
├── .kiro/
│   └── specs/              # Feature specifications
└── README.md
```

### Available Scripts

```bash
# Install dependencies for all services
npm install

# Run all services in development mode
npm run dev

# Build all services
npm run build

# Run tests for all services
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Authentication Service

The auth service provides:

#### Endpoints
- `GET /health` - Health check
- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/mfa/setup` - Setup multi-factor authentication
- `POST /api/mfa/enable` - Enable MFA
- `POST /api/mfa/disable` - Disable MFA
- `GET /api/mfa/status` - Get MFA status

#### Example Usage
```bash
# Health check
curl http://localhost:3001/health

# Login (returns JWT tokens)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Access protected endpoint
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Auth Service Tests
```bash
cd services/auth
npm test
```

The test suite includes:
- **Unit Tests**: Specific functionality and edge cases
- **Property-Based Tests**: Universal properties across all inputs
- **Integration Tests**: End-to-end API testing

## 🐳 Docker Deployment

### Build and Run Auth Service
```bash
cd services/auth
docker build -t vendor-auth-service .
docker run -p 3001:3001 --env-file .env vendor-auth-service
```

### Using Docker Compose (Coming Soon)
```bash
docker-compose up -d
```

## 📊 Monitoring and Health Checks

Each service includes:
- Health check endpoints
- Request logging with correlation IDs
- Error tracking and monitoring
- Performance metrics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Multi-Factor Authentication**: TOTP support with QR codes
- **Role-Based Access Control**: Granular permission system
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **Security Headers**: Helmet.js for security headers
- **CORS Configuration**: Configurable cross-origin policies

## 📈 Performance

- **Response Time**: Price discovery within 3 seconds
- **Market Alerts**: Real-time notifications within 5 minutes
- **Scalability**: Microservices architecture for horizontal scaling
- **Caching**: Redis for session and data caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use property-based testing for business logic
- Follow the existing code style
- Update documentation as needed

## 📝 API Documentation

API documentation is available at `/api/docs` when running in development mode.

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Authentication Service
- [ ] Vendor Management Service
- [ ] Basic Price Discovery

### Phase 2
- [ ] Market Intelligence Service
- [ ] Negotiation Service
- [ ] Deal Management

### Phase 3
- [ ] Frontend Application
- [ ] Advanced AI Features
- [ ] Integration APIs

### Phase 4
- [ ] Mobile Application
- [ ] Advanced Analytics
- [ ] Enterprise Features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions

## 🙏 Acknowledgments

- Built with modern web technologies and AI/ML frameworks
- Inspired by the need to democratize pricing intelligence for small businesses
- Thanks to all contributors and the open-source community

---

**Note**: This project is under active development. The authentication service is fully functional, while other services are being implemented according to the project roadmap.