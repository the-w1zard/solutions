export function code(strings, ...values) {
    return strings.reduce((result, str, i) => {
        return result + str + (values[i] !== undefined ? String(values[i]) : '');
    }, '');
}
