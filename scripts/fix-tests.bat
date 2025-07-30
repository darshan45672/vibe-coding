@echo off
echo 🔧 Fixing TypeScript Jest testing issues...

REM Install missing type dependencies
echo 📦 Installing missing types...
npm install --save-dev @types/jest @testing-library/jest-dom

REM Create/update Jest types declaration
echo 📝 Creating Jest types declaration...
if not exist types mkdir types
(
echo import '@testing-library/jest-dom'^

echo.
echo declare global {
echo   namespace jest {
echo     interface Matchers^<R^> {
echo       toBeInTheDocument(^): R
echo       toHaveTextContent(text: string ^| RegExp^): R
echo       toBeDisabled(^): R
echo       toHaveClass(className: string^): R
echo       toHaveAttribute(attribute: string, value?: string^): R
echo       toBeVisible(^): R
echo       toHaveValue(value: string ^| number^): R
echo     }
echo   }
echo }
) > types\jest.d.ts

REM Fix test files by adding proper imports
echo 🔧 Fixing test files...

REM Create test directories
if not exist __tests__\components\ui mkdir __tests__\components\ui

REM Fix button test
(
echo import { render, screen, fireEvent } from '@testing-library/react'
echo import '@testing-library/jest-dom'
echo import { Button } from '@/components/ui/button'
echo.
echo describe('Button Component', () => {
echo   test('renders button with text', () => {
echo     render(^<Button^>Click me^</Button^>^)
echo     const button = screen.getByRole('button', { name: /click me/i }^)
echo     expect(button^).toBeInTheDocument(^)
echo   }^)
echo.
echo   test('handles click events', () => {
echo     const handleClick = jest.fn(^)
echo     render(^<Button onClick={handleClick}^>Click me^</Button^>^)
echo     fireEvent.click(screen.getByRole('button'^)^)
echo     expect(handleClick^).toHaveBeenCalledTimes(1^)
echo   }^)
echo.
echo   test('applies variant classes correctly', () => {
echo     render(^<Button variant="destructive"^>Delete^</Button^>^)
echo     const button = screen.getByRole('button'^)
echo     expect(button^).toHaveClass('bg-destructive'^)
echo   }^)
echo }^)
) > __tests__\components\ui\button.test.tsx

REM Fix card test
(
echo import { render, screen } from '@testing-library/react'
echo import '@testing-library/jest-dom'
echo import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
echo.
echo describe('Card Components', () => {
echo   test('renders card with content', () => {
echo     render(
echo       ^<Card^>
echo         ^<CardHeader^>
echo           ^<CardTitle^>Test Title^</CardTitle^>
echo         ^</CardHeader^>
echo         ^<CardContent^>
echo           ^<p^>Test content^</p^>
echo         ^</CardContent^>
echo       ^</Card^>
echo     ^)
echo     expect(screen.getByText('Test Title'^)^).toBeInTheDocument(^)
echo     expect(screen.getByText('Test content'^)^).toBeInTheDocument(^)
echo   }^)
echo }^)
) > __tests__\components\ui\card.test.tsx

echo ✅ Test fixes applied!
echo 💡 Run 'npm test' to verify the tests work
