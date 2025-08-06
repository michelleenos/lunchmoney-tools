export const doRequest = async (
    method: 'GET' | 'POST' | 'PUT',
    baseUrl: string,
    headersInput: Record<string, string> = {},
    endpoint: string,
    args: { [key: string]: any } = {}
) => {
    const url = new URL(`${baseUrl}/${endpoint}`)
    const headers: Record<string, string> = {
        ...headersInput,
    }

    if (method === 'GET') {
        Object.entries(args).forEach(([key, value]) => {
            if (value !== undefined) {
                url.searchParams.append(key, value)
            }
        })
    } else {
        headers['Content-Type'] = 'application/json'
    }

    const res = await fetch(url.toString(), {
        method,
        headers,
        body: method !== 'GET' ? JSON.stringify(args) : undefined,
    })

    return res
}
