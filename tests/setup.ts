import { vi } from 'vitest'

// const mockEnvVars: Record<string, string> = {
//     LM_API_KEY: 'test-lm-api-key',
//     SW_API_KEY: 'test-sw-api-key',
//     SW_GROUP_ID: '12345',
//     LM_SW_ASSET_ID: '67890',
// }

// vi.mock('../src/utils/env-vars.ts', () => ({
//     getEnvVarString: vi.fn((key: string) => {
//         return mockEnvVars[key]
//     }),
//     getEnvVarNum: vi.fn((key: string) => {
//         const value = mockEnvVars[key]
//         let int = parseInt(value)
//         return int
//     }),
// }))

// global.fetch = vi.fn()
