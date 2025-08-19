import { LMTag } from '../types/tags.ts'

export const adjustTags = (
    existing: LMTag[],
    { add, remove }: { add?: (string | number)[]; remove?: (string | number)[] }
): (string | number)[] => {
    let newTags = [...existing]
    let tagsToFilter = [...(add || []), ...(remove || [])]

    newTags = newTags.filter((tag) => {
        if (
            tagsToFilter.find((t) => typeof t === 'number' && t === tag.id) ||
            tagsToFilter.find((t) => typeof t === 'string' && t === tag.name)
        ) {
            return false
        }
        return true
    })

    return [...newTags.map((t) => t.name), ...(add || [])]
}
