

export function code(strings: TemplateStringsArray, ...values: unknown[]): string {
    return strings.reduce((result, str, i) => {
        return result + str + (values[i] !== undefined ? String(values[i]) : '');
    }, '');
}
