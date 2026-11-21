# **Class Utilities**

## **Functions**

| Function | Props                     | Description                                                                                                |
| -------- | ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `clsx`   | `...inputs: ClassValue[]` | Combines strings, numbers, arrays, and conditional object keys into a single space-separated class string. |

## **Types**

| Type         | Definition                                                                                                                 | Description                                                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ClassValue` | `string \\| number \\| boolean \\| null \\| undefined \\| ClassValue[] \\| Record<string, boolean \\| null \\| undefined>` | Defines the accepted values that can be passed to `clsx`. Supports nested arrays and objects whose keys are included when their values are truthy. |

## **Usage**

### `clsx`

Accepts any number of `ClassValue` arguments and returns a string containing the resulting class names.

**1. Strings**

```
clsx('container', 'active');
// 'container active'
```

**2. Numbers**

```
clsx('width', 100);
// 'width 100'
```

**3. Conditional values**

```
clsx('container', false, null, undefined, 0);
// 'container'
```

**4. Object-based conditional classes**

```
clsx({
  active: true,
  disabled: false,
  hidden: null,
  visible: true,
});
// 'active visible'
```

**5. Arrays**

```
clsx([
  'container',
  'active',
  ['nested', 'child'],
]);
// 'container active nested child'
```

**6. Mixed values**

```
clsx(
  'container',
  100,
  { active: true, disabled: false },
  ['nested', { visible: true }],
);
// 'container 100 active nested visible'
```

**7. Dynamic classes**

```
const isActive = true;
const isDisabled = false;

const classes = clsx(
  'button',
  {
    active: isActive,
    disabled: isDisabled,
  },
);
```

**Return value:**

```
'button active'
```

















































# **Class Name Utilities**

## **Functions**

| Function | Props                     | Description                                                                                                    |
| -------- | ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `cn`     | `...inputs: ClassValue[]` | Combines class values using `clsx` and passes the resulting string to `twMerge` to merge Tailwind CSS classes. |

## **Usage**

### `cn`

Accepts any number of `ClassValue` arguments, combines them using `clsx`, and merges conflicting Tailwind CSS classes using `twMerge`.

**1. Basic usage**

```
cn('container', 'flex', 'items-center');
// 'container flex items-center'
```

**2. Conditional classes**

```
cn('button', {
  active: true,
  disabled: false,
});
// 'button active'
```

**3. Tailwind class merging**

```
cn('px-2 py-1', 'px-4');
// 'py-1 px-4'
```

**4. Conditional Tailwind classes**

```
const isActive = true;

cn(
  'button px-2',
  isActive && 'bg-blue-500',
  'px-4',
);
```

**5. Mixed values**

```
cn(
  'container',
  ['flex', 'items-center'],
  { hidden: false, visible: true },
  'gap-2',
);
```

**Return value:** A string containing the combined and merged class names.

# **Class Variance Authority (CVA)**

## **Types**

| Type                  | Definition                                                 | Description                                                                                               |
| --------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `ClassValue`          | `string \\| undefined \\| null \\| false \\| ClassValue[]` | Defines accepted class values, including strings, falsy values, and nested arrays.                        |
| `VariantRecord`       | `Record<string, Record<string, ClassValue>>`               | Defines a collection of variants, each containing named options mapped to class values.                   |
| `VariantSelection<V>` | `{ [K in keyof V]?: keyof V[K] }`                          | Defines the optional selection of a variant option for each variant key in `V`.                           |
| `CVAConfig<V>`        | Interface                                                  | Defines the configuration accepted by `cva`, including variants, default variants, and compound variants. |

## **Functions**

| Function | Props                                       | Description                                                                                                                                               |
| -------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cx`     | `...inputs: ClassValue[]`                   | Combines strings and nested arrays of class values into a single space-separated string.                                                                  |
| `cva`    | `base: ClassValue`, `config?: CVAConfig<V>` | Creates a class-generation function that combines base classes, selected variants, default variants, compound variants, and an optional additional class. |

## **Usage**

### `cx`

Accepts multiple class values and returns a space-separated string.

**1. Strings**

```
cx('flex', 'items-center');
// 'flex items-center'
```

**2. Nested arrays**

```
cx('flex', ['items-center', ['justify-between']]);
// 'flex items-center justify-between'
```

**3. Falsy values**

```
cx('button', false, null, undefined);
// 'button'
```

**4. Mixed values**

```
cx(
  'button',
  ['flex', 'items-center'],
  false,
  ['gap-2'],
);
// 'button flex items-center gap-2'
```

### `cva`

Accepts a base class value and an optional configuration. Returns a function that accepts variant selections and an optional additional class.

**1. Base classes**

```
const button = cva('button');

button();
// 'button'
```

**2. Variants**

```
const button = cva('button', {
  variants: {
    size: {
      small: 'text-sm',
      large: 'text-lg',
    },
    intent: {
      primary: 'bg-blue-500',
      secondary: 'bg-gray-500',
    },
  },
});

button({ size: 'small', intent: 'primary' });
// 'button text-sm bg-blue-500'
```

**3. Default variants**

```
const button = cva('button', {
  variants: {
    size: {
      small: 'text-sm',
      large: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'small',
  },
});

button();
// 'button text-sm'
```

**4. Override default variants**

```
button({ size: 'large' });
// 'button text-lg'
```

**5. Compound variants**

```
const button = cva('button', {
  variants: {
    intent: {
      primary: 'bg-blue-500',
      secondary: 'bg-gray-500',
    },
    size: {
      small: 'text-sm',
      large: 'text-lg',
    },
  },
  compoundVariants: [
    {
      intent: 'primary',
      size: 'large',
      class: 'font-bold',
    },
  ],
});

button({ intent: 'primary', size: 'large' });
// 'button bg-blue-500 text-lg font-bold'
```

**6. Additional classes**

```
const button = cva('button', {
  variants: {
    size: {
      small: 'text-sm',
      large: 'text-lg',
    },
  },
});

button({
  size: 'large',
  class: 'rounded-md',
});
// 'button text-lg rounded-md'
```

**7. Combining all features**

```
const button = cva('button', {
  variants: {
    intent: {
      primary: 'bg-blue-500',
      secondary: 'bg-gray-500',
    },
    size: {
      small: 'text-sm',
      large: 'text-lg',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'small',
  },
  compoundVariants: [
    {
      intent: 'primary',
      size: 'large',
      class: 'font-bold',
    },
  ],
});

button({
  size: 'large',
  class: 'rounded-md',
});
// 'button bg-blue-500 text-lg font-bold rounded-md'
```

**Return value:** `cva` returns a function that generates a class string based on the supplied variant selections and configuration.

# **Class Name Utilities**

## **Functions**

| Function | Props                     | Description                                                                                                                |
| -------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `cx`     | `...inputs: ClassValue[]` | Combines class values using `clsx` and passes the resulting string to `twMerge` to merge conflicting Tailwind CSS classes. |

## **Usage**

### `cx`

Accepts any number of `ClassValue` arguments, combines them using `clsx`, and merges conflicting Tailwind CSS classes using `twMerge`.

**1. Basic usage**

```
cx('flex', 'items-center', 'gap-2');
// 'flex items-center gap-2'
```

**2. Tailwind class merging**

```
cx('px-2 py-1', 'px-4');
// 'py-1 px-4'
```

**3. Conditional classes**

```
cx('button', {
  active: true,
  disabled: false,
});
```

**4. Nested arrays**

```
cx(
  'container',
  ['flex', ['items-center', 'gap-2']],
);
```

**5. Mixed values**

```
const isActive = true;

cx(
  'button px-2',
  isActive && 'bg-blue-500',
  ['rounded-md', 'px-4'],
);
```

**Return value:** A string containing the combined class names after Tailwind CSS conflict resolution.


# **Tailwind Merge Utilities**


## **Functions**

| Function                        | Props                                                                                                                              | Description                                                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `createClassGroupUtils`         | `config: AnyConfig`                                                                                                                | Creates class-group utilities for identifying class groups and retrieving conflicting class groups.                                |
| `createClassMap`                | `config: Config<AnyClassGroupIds, AnyThemeGroupIds>`                                                                               | Creates a class map from the configured class groups and theme.                                                                    |
| `createConfigUtils`             | `config: AnyConfig`                                                                                                                | Creates configuration utilities, including caching, class parsing, modifier sorting, postfix lookup, and class-group utilities.    |
| `createTailwindMerge`           | `createConfigFirst: () => AnyConfig`, `...createConfigRest: ((config: AnyConfig) => AnyConfig)[]`                                  | Creates a Tailwind class-merging function using an initial configuration and optional subsequent configuration functions.          |
| `extendTailwindMerge`           | `configExtension: ConfigExtension \\| ((config: AnyConfig) => AnyConfig)`, `...createConfig: ((config: AnyConfig) => AnyConfig)[]` | Creates a Tailwind merge function using the default configuration extended with additional configuration.                          |
| `fromTheme`                     | `key: DefaultThemeGroupIds \\| AdditionalThemeGroupIds`                                                                            | Creates a theme getter that retrieves values from a specified theme group.                                                         |
| `createLruCache`                | `maxCacheSize: number`                                                                                                             | Creates a cache with `get` and `set` methods for storing string-keyed values.                                                      |
| `mergeClassList`                | `classList: string`, `configUtils: ConfigUtils`                                                                                    | Processes a class list and removes conflicting Tailwind classes.                                                                   |
| `mergeConfigs`                  | `baseConfig: AnyConfig`, `configExtension: ConfigExtension`                                                                        | Overrides and extends configuration properties, returning the modified base configuration.                                         |
| `createParseClassName`          | `config: AnyConfig`                                                                                                                | Creates a class-name parser that identifies modifiers, important modifiers, base classes, postfix modifiers, and external classes. |
| `createSortModifiers`           | `config: AnyConfig`                                                                                                                | Creates a modifier-sorting function that sorts regular modifiers while preserving order-sensitive modifiers.                       |
| `twJoin`                        | `...classLists: ClassNameValue[]`                                                                                                  | Combines strings and nested class arrays into a space-separated class string.                                                      |
| `twMerge`                       | `...classLists: ClassNameValue[]`                                                                                                  | Combines class values and removes conflicting Tailwind CSS classes.                                                                |
| `isFraction`                    | `value: string`                                                                                                                    | Checks whether a value matches a numeric fraction format.                                                                          |
| `isNumber`                      | `value: string`                                                                                                                    | Checks whether a value represents a number.                                                                                        |
| `isInteger`                     | `value: string`                                                                                                                    | Checks whether a value represents an integer.                                                                                      |
| `isPercent`                     | `value: string`                                                                                                                    | Checks whether a value is a numeric percentage.                                                                                    |
| `isTshirtSize`                  | `value: string`                                                                                                                    | Checks whether a value matches a supported T-shirt size format.                                                                    |
| `isAny`                         | None                                                                                                                               | Always returns `true`.                                                                                                             |
| `isAnyNonArbitrary`             | `value: string`                                                                                                                    | Checks whether a value is neither an arbitrary value nor an arbitrary variable.                                                    |
| `isNamedContainerQuery`         | `value: string`                                                                                                                    | Checks whether a value matches a named container query format.                                                                     |
| `isArbitrarySize`               | `value: string`                                                                                                                    | Checks whether an arbitrary value represents a size.                                                                               |
| `isArbitraryValue`              | `value: string`                                                                                                                    | Checks whether a value uses square-bracket arbitrary-value syntax.                                                                 |
| `isArbitraryLength`             | `value: string`                                                                                                                    | Checks whether an arbitrary value represents a length.                                                                             |
| `isArbitraryNumber`             | `value: string`                                                                                                                    | Checks whether an arbitrary value represents a number.                                                                             |
| `isArbitraryWeight`             | `value: string`                                                                                                                    | Checks whether an arbitrary value represents a weight.                                                                             |
| `isArbitraryFamilyName`         | `value: string`                                                                                                                    | Checks whether an arbitrary value represents a font family name.                                                                   |
| `isArbitraryPosition`           | `value: string`                                                                                                                    | Checks whether an arbitrary value represents a position.                                                                           |
| `isArbitraryImage`              | `value: string`                                                                                                                    | Checks whether an arbitrary value represents an image.                                                                             |
| `isArbitraryShadow`             | `value: string`                                                                                                                    | Checks whether an arbitrary value represents a shadow.                                                                             |
| `isArbitraryVariable`           | `value: string`                                                                                                                    | Checks whether a value uses parenthesized arbitrary-variable syntax.                                                               |
| `isArbitraryVariableLength`     | `value: string`                                                                                                                    | Checks whether an arbitrary variable has a length label.                                                                           |
| `isArbitraryVariableFamilyName` | `value: string`                                                                                                                    | Checks whether an arbitrary variable has a family-name label.                                                                      |
| `isArbitraryVariablePosition`   | `value: string`                                                                                                                    | Checks whether an arbitrary variable has a position label.                                                                         |
| `isArbitraryVariableSize`       | `value: string`                                                                                                                    | Checks whether an arbitrary variable has a size label.                                                                             |
| `isArbitraryVariableImage`      | `value: string`                                                                                                                    | Checks whether an arbitrary variable has an image label.                                                                           |
| `isArbitraryVariableShadow`     | `value: string`                                                                                                                    | Checks whether an arbitrary variable has a shadow label or matches the supported unlabeled shadow format.                          |
| `isArbitraryVariableWeight`     | `value: string`                                                                                                                    | Checks whether an arbitrary variable has a weight label or matches the supported unlabeled weight format.                          |

## **Types and Interfaces**

| Name                   | Props                                                            | Description                                                                                                   |
| ---------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `ClassPartObject`      | `nextPart`, `validators`, `classGroupId`                         | Represents a node in the class-group map, containing child nodes, validators, and an optional class-group ID. |
| `ClassValidatorObject` | `classGroupId`, `validator`                                      | Associates a class-group ID with a class validator.                                                           |
| `ConfigUtils`          | Derived from `createConfigUtils`                                 | Represents the return type of `createConfigUtils`.                                                            |
| `LruCache<Key, Value>` | `get(key)`, `set(key, value)`                                    | Defines the interface for retrieving and storing cached values.                                               |
| `ClassNameValue`       | String, null, undefined, 0, 0n, false, or nested readonly arrays | Defines the accepted values for `twJoin` and `twMerge`.                                                       |

## **Usage**

### `createTailwindMerge`

Creates a Tailwind merge function from an initial configuration factory and optional configuration extension functions.

```
const customMerge = createTailwindMerge(
    getDefaultConfig,
    (config) => config,
);

customMerge('px-2 px-4');
// 'px-4'
```

### `extendTailwindMerge`

Extends the default Tailwind configuration.

```
const customMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            'custom-spacing': ['custom-spacing'],
        },
    },
});

customMerge('custom-spacing px-4');
```

### `fromTheme`

Creates a getter for a specified theme group.

```
const spacing = fromTheme('spacing');

spacing({
    spacing: ['4px', '8px'],
});
```

### `mergeConfigs`

Overrides and extends an existing configuration.

```
const config = getDefaultConfig();

mergeConfigs(config, {
    extend: {
        classGroups: {
            'custom-spacing': ['custom-spacing'],
        },
    },
});
```

### `twJoin`

Combines class strings and nested arrays without resolving Tailwind conflicts.

```
twJoin(
    'flex',
    ['items-center', 'gap-2'],
    'rounded-md',
);
```

### `twMerge`

Combines class values and removes conflicting Tailwind classes.

```
twMerge(
    'px-2 py-1',
    'px-4',
);
// 'py-1 px-4'
```

### `createLruCache`

Creates a cache with a maximum cache size.

```
const cache = createLruCache<string, string>(100);

cache.set('key', 'value');

cache.get('key');
// 'value'
```

### `mergeClassList`

Processes a class string using configuration utilities.

```
const config = getDefaultConfig();
const utils = createConfigUtils(config);

mergeClassList('px-2 px-4', utils);
// 'px-4'
```

### `createParseClassName`

Creates a parser for Tailwind class names.

```
const config = getDefaultConfig();
const parse = createParseClassName(config);

parse('hover:focus:bg-red-500');
```

### `createSortModifiers`

Creates a function for sorting class modifiers.

```
const config = getDefaultConfig();
const sortModifiers = createSortModifiers(config);

sortModifiers(['focus', 'hover', 'active']);
```

### `createConfigUtils`

Creates the utilities used by the class-merging process.

```
const config = getDefaultConfig();
const utils = createConfigUtils(config);

utils.getClassGroupId('px-4');
utils.getConflictingClassGroupIds('p', false);
utils.parseClassName('hover:px-4');
utils.sortModifiers(['focus', 'hover']);
```

### `createClassGroupUtils`

Creates class-group identification and conflict lookup functions.

```
const utils = createClassGroupUtils(getDefaultConfig());

utils.getClassGroupId('px-4');
utils.getConflictingClassGroupIds('p', false);
```

### `createClassMap`

Creates a class map from class-group definitions.

```
const config = getDefaultConfig();

const classMap = createClassMap(config);
```

### **Validators**

The `validators` namespace exposes the following functions.

| Function                        | Usage                                                              |
| ------------------------------- | ------------------------------------------------------------------ |
| `isFraction`                    | `validators.isFraction('1/2')`                                     |
| `isNumber`                      | `validators.isNumber('12')`                                        |
| `isInteger`                     | `validators.isInteger('12')`                                       |
| `isPercent`                     | `validators.isPercent('50%')`                                      |
| `isTshirtSize`                  | `validators.isTshirtSize('xl')`                                    |
| `isAny`                         | `validators.isAny()`                                               |
| `isAnyNonArbitrary`             | `validators.isAnyNonArbitrary('12px')`                             |
| `isNamedContainerQuery`         | `validators.isNamedContainerQuery('@container/sidebar')`           |
| `isArbitrarySize`               | `validators.isArbitrarySize('[length:12px]')`                      |
| `isArbitraryValue`              | `validators.isArbitraryValue('[12px]')`                            |
| `isArbitraryLength`             | `validators.isArbitraryLength('[length:12px]')`                    |
| `isArbitraryNumber`             | `validators.isArbitraryNumber('[number:12]')`                      |
| `isArbitraryWeight`             | `validators.isArbitraryWeight('[weight:700]')`                     |
| `isArbitraryFamilyName`         | `validators.isArbitraryFamilyName('[family-name:Arial]')`          |
| `isArbitraryPosition`           | `validators.isArbitraryPosition('[position:center]')`              |
| `isArbitraryImage`              | `validators.isArbitraryImage('[image:url(test.png)]')`             |
| `isArbitraryShadow`             | `validators.isArbitraryShadow('[shadow:0_0_4px_black]')`           |
| `isArbitraryVariable`           | `validators.isArbitraryVariable('(length:--spacing)')`             |
| `isArbitraryVariableLength`     | `validators.isArbitraryVariableLength('(length:--spacing)')`       |
| `isArbitraryVariableFamilyName` | `validators.isArbitraryVariableFamilyName('(family-name:--font)')` |
| `isArbitraryVariablePosition`   | `validators.isArbitraryVariablePosition('(position:--position)')`  |
| `isArbitraryVariableSize`       | `validators.isArbitraryVariableSize('(size:--size)')`              |
| `isArbitraryVariableImage`      | `validators.isArbitraryVariableImage('(image:--image)')`           |
| `isArbitraryVariableShadow`     | `validators.isArbitraryVariableShadow('(shadow:--shadow)')`        |
| `isArbitraryVariableWeight`     | `validators.isArbitraryVariableWeight('(weight:--weight)')`        |


# **UI Styling Utilities**

## **Constants**

| Name            | Props | Description                                                                                                                                    |
| --------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `focusInput`    | None  | Array of Tailwind CSS classes defining focus ring width, ring color, and border color for focused inputs, including dark-mode styles.          |
| `focusRing`     | None  | Array of Tailwind CSS classes defining an outline, outline offset, focus-visible outline width, and outline color, including dark-mode styles. |
| `hasErrorInput` | None  | Array of Tailwind CSS classes defining error-state ring width, border color, and ring color, including dark-mode styles.                       |

## **Functions**

| Function     | Props        | Description                                                                                                                                |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `formatDate` | `date: Date` | Formats a JavaScript `Date` as a localized date string using the `en-US` locale, with a full month name, numeric day, and four-digit year. |

## **Usage**

### `focusInput`

Provides the class names for focused input styling.

```
<input
  className={twMerge(clsx(focusInput))}
/>
```

### `focusRing`

Provides the class names for focus-visible outline styling.

```
<button
  className={twMerge(clsx(focusRing))}
>
  Button
</button>
```

### `hasErrorInput`

Provides the class names for input error styling.

```
<input
  className={twMerge(clsx(hasErrorInput))}
/>
```

### `formatDate`

Accepts a JavaScript `Date` object and returns a formatted date string.

```
const date = new Date("2026-11-21");

formatDate(date);
// 'November 21, 2026'
```

**Return value:** `string` formatted as `Month Day, Year`.








































