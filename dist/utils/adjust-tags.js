export const adjustTags = (existing, { add, remove }) => {
    let newTags = [...existing];
    let tagsToFilter = [...(add || []), ...(remove || [])];
    newTags = newTags.filter((tag) => {
        if (tagsToFilter.find((t) => typeof t === 'number' && t === tag.id) ||
            tagsToFilter.find((t) => typeof t === 'string' && t === tag.name)) {
            return false;
        }
        return true;
    });
    return [...newTags.map((t) => t.name), ...(add || [])];
};
