export const concatArrays = (array1, array2) => {
    // Pre-allocate for better V8 optimization
    const combinedArray = new Array(array1.length + array2.length);
    for (let i = 0; i < array1.length; i++) {
        combinedArray[i] = array1[i];
    }
    for (let i = 0; i < array2.length; i++) {
        combinedArray[array1.length + i] = array2[i];
    }
    return combinedArray;
};
