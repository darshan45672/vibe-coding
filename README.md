# Vibe Coding - Insurance Management System

![CI/CD](https://github.com/darshan45672/vibe-coding/workflows/CI/CD%20Pipeline/badge.svg)
![Security](https://github.com/darshan45672/vibe-coding/workflows/Security%20Scan/badge.svg)
![Code Quality](https://github.com/darshan45672/vibe-coding/workflows/Code%20Quality/badge.svg)

A modern insurance management system built with Next.js, featuring comprehensive CI/CD pipeline and security best practices.

## 🚀 Features

- **Modern Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Security First**: Comprehensive security scanning and vulnerability detection
- **Quality Assurance**: Automated testing, linting, and code formatting
- **CI/CD Pipeline**: Fully automated build, test, and deployment process

## 🛡️ Security & Quality

This project implements enterprise-grade security and quality measures:

- **🔍 Secret Detection**: GitLeaks scanning for exposed credentials
- **🛡️ Security Analysis**: Semgrep static analysis for vulnerabilities
- **🔒 Dependency Scanning**: npm audit for known vulnerabilities
- **📝 Code Quality**: ESLint + Prettier for consistent code style
- **🧪 Testing**: Jest + React Testing Library with 70% coverage threshold
- **🔬 Advanced Analysis**: GitHub CodeQL for deep security insights

## 🏗️ Project Structure

```
vibe-coding/
├── app/                    # Next.js app directory
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components
│   └── views/             # Page-specific views
├── lib/                   # Utility functions and stores
├── __tests__/             # Test files
├── .github/               # GitHub Actions workflows
└── public/                # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or later
- npm or yarn

### Installation

### Installation

1. Clone the repository:
```bash
git clone https://github.com/darshan45672/vibe-coding.git
cd vibe-coding
```

2. Install dependencies:
```bash
npm ci
```

3. Run the development server:

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm run format:check    # Check formatting
npm run type-check      # TypeScript type checking

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage

# Security
npm run audit           # Check for vulnerabilities
npm run security:check  # Run security checks

# All-in-one
npm run ci              # Run all CI checks locally
```

## 🧪 Testing

The project includes comprehensive testing setup:

- **Unit Tests**: Jest + React Testing Library
- **Coverage**: Minimum 70% threshold
- **Mocking**: Next.js router and navigation mocks
- **Setup**: Automated test environment configuration

Run tests with:
```bash
npm test
```

## 🔐 Security

### Security Features

- **Secret Detection**: Automated scanning for exposed credentials
- **Dependency Auditing**: Regular vulnerability checks
- **Static Analysis**: Code security analysis with Semgrep
- **Access Control**: Proper authentication and authorization
- **Security Headers**: Next.js security best practices

### Reporting Security Issues

Please review our [Security Policy](SECURITY.md) for information on reporting vulnerabilities.

## 📊 CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

### Pipeline Stages

1. **🔍 GitLeaks**: Secret detection
2. **🛡️ Semgrep**: Security analysis  
3. **🔒 npm audit**: Dependency vulnerabilities
4. **📝 Linting**: Code quality and formatting
5. **🧪 Testing**: Unit tests with coverage
6. **🏗️ Build**: Application compilation
7. **🔬 CodeQL**: Advanced security analysis

### Workflow Files

- `.github/workflows/ci-cd.yml`: Main CI/CD pipeline
- `.github/workflows/security-scan.yml`: Daily security scans
- `.github/workflows/code-quality.yml`: Code quality checks

See [CI/CD Documentation](.github/workflows/README.md) for detailed information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write tests for new features
- Ensure all CI checks pass
- Update documentation as needed

## 📝 Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [React Documentation](https://react.dev) - React concepts and patterns
- [TypeScript Documentation](https://www.typescriptlang.org/docs) - TypeScript handbook
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on every push to main

### Other Platforms

The application can be deployed to any platform that supports Node.js:

- **AWS**: Using AWS Amplify or EC2
- **Netlify**: Static site deployment
- **Docker**: Containerized deployment
- **Railway**: Simple cloud deployment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment platform
- All contributors and maintainers
