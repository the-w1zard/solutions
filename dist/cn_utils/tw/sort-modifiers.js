export const createSortModifiers = (config) => {
    const modifierWeights = new Map();
    config.orderSensitiveModifiers.forEach((mod, index) => {
        modifierWeights.set(mod, 1000000 + index); // High weights for sensitive mods
    });
    return (modifiers) => {
        const result = [];
        let currentSegment = [];
        // Process modifiers in one pass
        for (let i = 0; i < modifiers.length; i++) {
            const modifier = modifiers[i];
            // Check if modifier is sensitive (starts with '[' or in orderSensitiveModifiers)
            const isArbitrary = modifier[0] === '[';
            const isOrderSensitive = modifierWeights.has(modifier);
            if (isArbitrary || isOrderSensitive) {
                // Sort and flush current segment alphabetically
                if (currentSegment.length > 0) {
                    currentSegment.sort();
                    result.push(...currentSegment);
                    currentSegment = [];
                }
                result.push(modifier);
            }
            else {
                // Regular modifier - add to current segment for batch sorting
                currentSegment.push(modifier);
            }
        }
        // Sort and add any remaining segment items
        if (currentSegment.length > 0) {
            currentSegment.sort();
            result.push(...currentSegment);
        }
        return result;
    };
};
