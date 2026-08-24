import '@testing-library/jest-dom/vitest'

import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never

afterEach(() => cleanup())
