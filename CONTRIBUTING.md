# Contributing to Rerit

Thank you for your interest in contributing to Rerit! We welcome contributions from the community and are pleased to have you here.

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** after following the steps
- **Explain which behavior you expected to see instead** and why
- **Include screenshots and animated GIFs** if possible
- **Include your environment details** (OS, version, etc.)

## 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description** of the suggested enhancement
- **Provide specific examples** to demonstrate the steps
- **Describe the current behavior** and explain the behavior you expected to see instead
- **Explain why this enhancement would be useful** to most Rerit users

## 🚀 Pull Requests

### Development Process

1. **Fork** the repository
2. **Create** a new branch from `main`
3. **Make** your changes
4. **Add** tests if applicable
5. **Ensure** the test suite passes
6. **Update** documentation if needed
7. **Submit** a pull request

### Pull Request Guidelines

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow the TypeScript and React best practices
- Include thoughtfully-worded, well-structured tests
- Document new code based on the [Documentation Styleguide](#documentation-styleguide)
- End all files with a newline

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/rerit-desktop-app.git
cd rerit-desktop-app

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```
feat: add global shortcut customization
fix: resolve clipboard access issue on Linux
docs: update installation instructions
```

## 🏗️ Technical Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code formatting (prettier configuration)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Testing

- Write tests for new features
- Ensure existing tests pass
- Test on multiple platforms when possible

### Documentation

- Update README.md if you change functionality
- Document new APIs and configuration options
- Use clear and concise language

## 📝 Documentation Styleguide

- Use [Markdown](https://guides.github.com/features/mastering-markdown/)
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit lines to 100 characters
- Reference issues and pull requests liberally after the first line

## 🎯 Project Structure

Understanding the project structure will help you navigate and contribute effectively:

```
src/
├── main/           # Electron main process
├── preload/        # Electron preload scripts  
└── renderer/       # React frontend application
```

### Key Areas for Contribution

1. **UI/UX Improvements**: Enhance the user interface and experience
2. **Performance**: Optimize application performance
3. **Features**: Add new tone options, shortcuts, or functionality
4. **Cross-platform**: Improve compatibility across different operating systems
5. **Documentation**: Help improve guides and documentation
6. **Testing**: Add automated tests and improve test coverage

## 🤔 Questions?

Don't hesitate to ask questions! You can:

- Open an issue with the "question" label
- Start a discussion in GitHub Discussions
- Comment on existing issues or pull requests

## 🙏 Recognition

Contributors will be recognized in our README and release notes. We appreciate all forms of contribution, from code to documentation to bug reports.

Thank you for contributing to Rerit! 🎉 