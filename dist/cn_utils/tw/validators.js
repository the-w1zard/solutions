const arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
const arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
const fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
const imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
export const isFraction = (value) => fractionRegex.test(value);
export const isNumber = (value) => !!value && !Number.isNaN(Number(value));
export const isInteger = (value) => !!value && Number.isInteger(Number(value));
export const isPercent = (value) => value.endsWith('%') && isNumber(value.slice(0, -1));
export const isTshirtSize = (value) => tshirtUnitRegex.test(value);
export const isAny = () => true;
const isLengthOnly = (value) => lengthUnitRegex.test(value) && !colorFunctionRegex.test(value);
const isNever = () => false;
const isShadow = (value) => shadowRegex.test(value);
const isImage = (value) => imageRegex.test(value);
export const isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
export const isNamedContainerQuery = (value) => value.startsWith('@container') &&
    ((value[10] === '/' && value[11] !== undefined) ||
        (value[11] === 's' && value[16] !== undefined && value.startsWith('-size/', 10)) ||
        (value[11] === 'n' && value[18] !== undefined && value.startsWith('-normal/', 10)));
export const isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
export const isArbitraryValue = (value) => arbitraryValueRegex.test(value);
export const isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
export const isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
export const isArbitraryWeight = (value) => getIsArbitraryValue(value, isLabelWeight, isAny);
export const isArbitraryFamilyName = (value) => getIsArbitraryValue(value, isLabelFamilyName, isNever);
export const isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
export const isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
export const isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
export const isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
export const isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
export const isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
export const isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
export const isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
export const isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
export const isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
export const isArbitraryVariableWeight = (value) => getIsArbitraryVariable(value, isLabelWeight, true);
// Helpers
const getIsArbitraryValue = (value, testLabel, testValue) => {
    const result = arbitraryValueRegex.exec(value);
    if (result) {
        if (result[1]) {
            return testLabel(result[1]);
        }
        return testValue(result[2]);
    }
    return false;
};
const getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
    const result = arbitraryVariableRegex.exec(value);
    if (result) {
        if (result[1]) {
            return testLabel(result[1]);
        }
        return shouldMatchNoLabel;
    }
    return false;
};
// Labels
const isLabelPosition = (label) => label === 'position' || label === 'percentage';
const isLabelImage = (label) => label === 'image' || label === 'url';
const isLabelSize = (label) => label === 'length' || label === 'size' || label === 'bg-size';
const isLabelLength = (label) => label === 'length';
const isLabelNumber = (label) => label === 'number';
const isLabelFamilyName = (label) => label === 'family-name';
const isLabelWeight = (label) => label === 'number' || label === 'weight';
const isLabelShadow = (label) => label === 'shadow';
