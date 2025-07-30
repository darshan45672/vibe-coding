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
