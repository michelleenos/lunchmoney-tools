export declare const doRequest: (method: "GET" | "POST" | "PUT", baseUrl: string, headersInput: Record<string, string> | undefined, endpoint: string, args?: {
    [key: string]: any;
}) => Promise<Response>;
