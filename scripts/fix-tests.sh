#!/bin/bash

echo "🔧 Fixing TypeScript Jest testing issues..."

# Install missing type dependencies
echo "📦 Installing missing types..."
npm install --save-dev @types/jest @testing-library/jest-dom

# Create/update Jest types declaration
echo "📝 Creating Jest types declaration..."
mkdir -p types
cat > types/jest.d.ts << 'EOF'
import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveTextContent(text: string | RegExp): R
      toBeDisabled(): R
      toHaveClass(className: string): R
      toHaveAttribute(attribute: string, value?: string): R
      toBeVisible(): R
      toHaveValue(value: string | number): R
    }
  }
}
EOF

# Fix test files by adding proper imports
echo "🔧 Fixing test files..."

# Fix button test
cat > __tests__/components/ui/button.test.tsx << 'EOF'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  test('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })
})
EOF

# Fix card test
cat > __tests__/components/ui/card.test.tsx << 'EOF'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

describe('Card Components', () => {
  test('renders card with content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Test content</p>
        </CardContent>
      </Card>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })
})
EOF

echo "✅ Test fixes applied!"
echo "💡 Run 'npm test' to verify the tests work"
