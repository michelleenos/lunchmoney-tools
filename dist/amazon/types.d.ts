export interface AmazonCSVData {
    /**
     * ISO 8601 format (YYYY-MM-DD)
     */
    date?: string;
    items?: string;
    shipping?: string;
    shipping_refund?: string;
    total?: string;
    tax?: string;
    to?: string;
    payments?: string;
    'order id'?: string;
    'order url'?: string;
}
export interface TransformedAmazonData {
    orderId: string;
    orderUrl: string;
    total: string;
    date: string;
    items: string;
    payments?: string;
    to?: string;
}
