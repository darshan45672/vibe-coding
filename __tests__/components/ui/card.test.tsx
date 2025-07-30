import { render, screen } from '@testing-library/react'
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

  test('renders card without header', () => {
    render(
      <Card>
        <CardContent>
          <p>Content only</p>
        </CardContent>
      </Card>
    )
    expect(screen.getByText('Content only')).toBeInTheDocument()
  })

  test('renders empty card', () => {
    render(<Card data-testid="empty-card" />)
    expect(screen.getByTestId('empty-card')).toBeInTheDocument()
  })
})
