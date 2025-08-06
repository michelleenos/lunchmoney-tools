export interface LMTag {
    id: number
    /**
     * User-defined name for the tag
     */
    name: string
    /**
     * User-defined description
     */
    description?: string
    /**
     * If true, the tag will not show up when creating or updating transactions in the Lunch Money app.
     */
    archived: boolean
}
