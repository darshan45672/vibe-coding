# CI/CD Pipeline Documentation

## Overview

This project implements a comprehensive **sequential CI/CD pipeline** using GitHub Actions that includes security scanning, code quality checks, testing, and deployment automation. Each stage must complete successfully before the next stage begins, ensuring fail-fast behavior.

## 🔄 Pipeline Execution Flow

The pipeline executes in the following **strict sequential order**:

```
1. 🔍 GitLeaks (Secret Detection)
   ↓ (must succeed)
2. 🛡️ Semgrep (Security Analysis)
   ↓ (must succeed)
3. 🔒 Dependency Check (npm audit)
   ↓ (must succeed)
4. 📝 Linting & Formatting (ESLint + Prettier)
   ↓ (must succeed)
5. 🧪 Unit Testing (Jest + Coverage)
   ↓ (must succeed)
6. 🏗️ Build (Next.js compilation)
   ↓ (must succeed)
7. 🔬 CodeQL Analysis (Advanced security)
   ↓ (must succeed)
8. 🚀 Deploy (Production - main branch only)
   ↓ (always runs)
9. 📊 Pipeline Summary (Results overview)
```

**⚠️ Fail-Fast Behavior**: If any stage fails, the entire pipeline stops and subsequent stages will not execute.

## Pipeline Stages

### 1. 🔍 GitLeaks - Secret Detection
- **Purpose**: Scans for exposed secrets, API keys, and sensitive information
- **Tool**: GitLeaks
- **Configuration**: `.gitleaks.toml`
- **Triggers**: Every push and pull request

### 2. 🛡️ Semgrep Security Analysis
- **Purpose**: Static analysis for security vulnerabilities
- **Tool**: Semgrep with JavaScript/TypeScript rulesets
- **Configuration**: `.semgrep.yml`
- **Focus Areas**: 
  - Security vulnerabilities
  - Code quality issues
  - React-specific problems
  - Next.js best practices

### 3. 🔒 Dependency Vulnerability Check
- **Purpose**: Identifies known vulnerabilities in npm packages
- **Tool**: npm audit
- **Audit Level**: Moderate and above
- **Output**: JSON report for analysis

### 4. 📝 Linting and Formatting
- **Purpose**: Code style consistency and quality
- **Tools**: 
  - ESLint (with Next.js and TypeScript rules)
  - Prettier (code formatting)
  - TypeScript compiler (type checking)
- **Configuration**: 
  - `eslint.config.mjs`
  - `.prettierrc`
  - `.prettierignore`

### 5. 🧪 Unit Testing
- **Purpose**: Automated test generation and execution
- **Framework**: Jest with React Testing Library
- **Coverage**: Minimum 70% coverage threshold
- **Configuration**: 
  - `jest.config.js`
  - `jest.setup.js`

### 6. 🏗️ Build
- **Purpose**: Application compilation and bundling
- **Tool**: Next.js build system
- **Output**: Static build artifacts
- **Validation**: Build success verification

### 7. 🔬 CodeQL Analysis
- **Purpose**: Advanced security analysis by GitHub
- **Languages**: JavaScript, TypeScript
- **Queries**: Security-extended and quality queries
- **Integration**: Results appear in Security tab

## Additional Features

### 🤖 Dependabot
- **Purpose**: Automated dependency updates
- **Configuration**: `.github/dependabot.yml`
- **Schedule**: Weekly for regular updates, daily for security
- **Scope**: npm packages and GitHub Actions

### 📊 Code Quality Monitoring
- **Separate workflow**: `code-quality.yml`
- **Metrics**: File counts, lines of code, complexity
- **Reports**: Detailed ESLint and Prettier results

### 🔍 Security Scanning
- **Separate workflow**: `security-scan.yml`
- **Tools**: Trivy vulnerability scanner
- **Schedule**: Daily automated scans
- **Integration**: SARIF upload to GitHub Security

## Workflow Triggers

### Main CI/CD Pipeline (`ci-cd.yml`)
- Push to `main`, `dev`, `develop` branches
- Pull requests to `main`, `dev`, `develop` branches
- Manual workflow dispatch

### Security Scan (`security-scan.yml`)
- Daily at 2 AM UTC
- Push to `main`, `dev` branches (when code files change)
- Manual workflow dispatch

### Code Quality (`code-quality.yml`)
- Pull requests to `main`, `dev` branches
- Push to `main`, `dev` branches

## Configuration Files

| File | Purpose |
|------|---------|
| `.gitleaks.toml` | GitLeaks secret detection rules |
| `.semgrep.yml` | Semgrep security analysis rules |
| `.prettierrc` | Prettier formatting configuration |
| `.prettierignore` | Files to ignore for Prettier |
| `eslint.config.mjs` | ESLint linting rules |
| `jest.config.js` | Jest testing configuration |
| `jest.setup.js` | Jest test environment setup |
| `SECURITY.md` | Security policy and reporting |

## Environment Variables

The pipeline uses the following environment variables:

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- `GITLEAKS_LICENSE`: Optional GitLeaks license key
- `NODE_VERSION`: Node.js version (set to '20')

## Artifacts

The pipeline generates several artifacts:

- **Build Output**: Compiled Next.js application
- **Test Results**: Coverage reports and test output
- **Security Reports**: GitLeaks, Semgrep, npm audit results
- **Code Quality**: ESLint and Prettier reports

## Status Badges

Add these badges to your README to show pipeline status:

```markdown
![CI/CD](https://github.com/darshan45672/vibe-coding/workflows/CI/CD%20Pipeline/badge.svg)
![Security](https://github.com/darshan45672/vibe-coding/workflows/Security%20Scan/badge.svg)
![Code Quality](https://github.com/darshan45672/vibe-coding/workflows/Code%20Quality/badge.svg)
```

## Local Development

To run the same checks locally:

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Run formatting check
npm run format:check

# Run type checking
npm run type-check

# Run tests
npm run test

# Run security audit
npm run audit

# Run all CI checks
npm run ci
```

## Troubleshooting

### Common Issues

1. **Test Failures**: Ensure all components have proper test-ids and follow testing best practices
2. **Linting Errors**: Run `npm run lint:fix` to auto-fix issues
3. **Formatting Issues**: Run `npm run format` to auto-format code
4. **Security Vulnerabilities**: Update dependencies and review security advisories
5. **Build Failures**: Check TypeScript errors and ensure all imports are valid

### Getting Help

- Check the [Security Policy](SECURITY.md) for security-related issues
- Review workflow logs in the GitHub Actions tab
- Ensure all required secrets and environment variables are configured
