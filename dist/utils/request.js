"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doRequest = void 0;
const doRequest = async (method, baseUrl, headersInput = {}, endpoint, args = {}) => {
    const url = new URL(`${baseUrl}/${endpoint}`);
    const headers = {
        ...headersInput,
    };
    if (method === 'GET') {
        Object.entries(args).forEach(([key, value]) => {
            if (value !== undefined) {
                url.searchParams.append(key, value);
            }
        });
    }
    else {
        headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(url.toString(), {
        method,
        headers,
        body: method !== 'GET' ? JSON.stringify(args) : undefined,
    });
    return res;
};
exports.doRequest = doRequest;
