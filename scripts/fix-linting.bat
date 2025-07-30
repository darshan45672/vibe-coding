@echo off
REM Script to help fix common linting issues in the codebase

echo 🔧 Fixing common linting issues...

REM Create backup
echo 📦 Creating backup...
git stash push -m "backup before lint fixes"

echo 🎨 Auto-fixing with Prettier...
npm run format

echo 🔍 Auto-fixing with ESLint...
npm run lint:fix

echo 📋 Checking remaining issues...
npm run lint:strict
if errorlevel 1 (
    echo.
    echo ⚠️ Some issues still remain. Manual fixes needed:
    echo 1. Replace 'any' types with specific types
    echo 2. Replace alert^(^) calls with proper UI components
    echo 3. Remove unused variables
    echo 4. Fix unescaped quotes in JSX
    echo.
    echo 💡 Run 'npm run lint:strict' to see detailed issues
)

echo.
echo ✅ Auto-fixing complete!
echo 🚀 Review changes and commit when ready

pause
