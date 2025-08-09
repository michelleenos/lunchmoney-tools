export interface LMCategory {
    id: number;
    name: string;
    description?: string;
    is_income: boolean;
    exclude_from_budget: boolean;
    exclude_from_totals: boolean;
    archived?: boolean;
    archived_on?: string;
    updated_at?: string;
    created_at?: string;
    is_group: boolean;
    group_id?: number;
    order?: number;
    children?: Pick<LMCategory, 'id' | 'name' | 'description' | 'created_at'>[];
    group_category_name?: string;
}
