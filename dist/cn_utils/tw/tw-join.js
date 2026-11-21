export const twJoin = (...classLists) => {
    let index = 0;
    let argument;
    let resolvedValue;
    let string = '';
    while (index < classLists.length) {
        if ((argument = classLists[index++])) {
            if ((resolvedValue = toValue(argument))) {
                string && (string += ' ');
                string += resolvedValue;
            }
        }
    }
    return string;
};
const toValue = (mix) => {
    // Fast path for strings
    if (typeof mix === 'string') {
        return mix;
    }
    let resolvedValue;
    let string = '';
    for (let k = 0; k < mix.length; k++) {
        if (mix[k]) {
            if ((resolvedValue = toValue(mix[k]))) {
                string && (string += ' ');
                string += resolvedValue;
            }
        }
    }
    return string;
};
