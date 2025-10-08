export declare const doRequest: (method: "GET" | "POST" | "PUT" | "DELETE", baseUrl: string, headersInput: Record<string, string> | undefined, endpoint: string, args?: {
    [key: string]: any;
}) => Promise<Response>;
