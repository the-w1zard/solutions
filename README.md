## CN UTILS

<details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[Class Utilities]</span> </strong></summary>


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

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[Class Name Utilities]</span> </strong></summary>


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

</details>

 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[Class Variance Authority (CVA)]</span> </strong></summary>


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


</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[Class Name Utilities]</span> </strong></summary>

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

</details>

 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[Tailwind Merge Utilities]</span> </strong></summary>


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

</details>

 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[UI Styling Utilities]</span> </strong></summary>

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
</details>

## CRDT'S

<details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[AW_SET]</span> </strong></summary>

A binary-backed, add/remove set with delta synchronization, per-node sequence tracking, peer digests, and tombstone compaction.

## API

| Member          | Props                                             | Description                                                                                                                          |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `AW_SET`        | `localNodeId: string`, `initialCapacity?: number` | Creates a set associated with a local node ID. Initial capacity defaults to `1024` rows.                                             |
| `add`           | `element: string`                                 | Adds an element with a new local sequence tag.                                                                                       |
| `remove`        | `element: string`                                 | Tombstones all active occurrences of the specified element.                                                                          |
| `has`           | `element: string`                                 | Returns whether the element has at least one active occurrence.                                                                      |
| `values`        | None                                              | Returns an array of unique active elements.                                                                                          |
| `version`       | Getter                                            | Returns the local node's current action sequence number.                                                                             |
| `generateDelta` | `sinceVersion?: number`                           | Generates a binary synchronization delta containing rows newer than the supplied version. Defaults to `0`.                           |
| `mergeDelta`    | `deltaBytes: Uint8Array`, `senderNodeId: string`  | Merges a received delta, records the sender's digest, and incorporates received sequence knowledge.                                  |
| `compact`       | None                                              | Removes tombstoned rows whose removal has been acknowledged by every directly synchronized peer. Returns the number of rows removed. |

## Usage

### Constructor

Creates a set for a node. The optional second argument specifies initial row capacity.

```
const set = new AW_SET("node-1");
const setWithCapacity = new AW_SET("node-2", 2048);
```

### `add`

Adds an element and assigns it a new local sequence number.

```
set.add("apple");
set.add("banana");
```

### `remove`

Marks active occurrences of an element as tombstoned.

```
set.remove("apple");
```

### `has`

Checks whether an element is currently active.

```
const exists = set.has("banana");
// true
```

### `values`

Returns all unique active elements.

```
const items = set.values();
// ["banana"]
```

### `version`

Reads the local action sequence counter.

```
const currentVersion = set.version;
```

### `generateDelta`

Generates a binary delta containing rows whose tag or removal sequence exceeds `sinceVersion`.

```
const delta = set.generateDelta();

// Generate rows newer than version 10
const partialDelta = set.generateDelta(10);
```

### `mergeDelta`

Merges a received delta and identifies the peer that sent it.

```
const sender = new AW_SET("node-1");
const receiver = new AW_SET("node-2");

sender.add("apple");

const delta = sender.generateDelta();

receiver.mergeDelta(delta, "node-1");
```

### `compact`

Removes tombstoned rows acknowledged by all peers recorded through synchronization.

```
const removedRows = set.compact();
```

Returns the number of rows removed. Returns `0` when no peers have been synchronized or no tombstoned rows are safe to remove.

## Synchronization Example

```
const nodeA = new AW_SET("node-A");
const nodeB = new AW_SET("node-B");

nodeA.add("apple");
nodeA.add("banana");

// A sends its delta to B
nodeB.mergeDelta(nodeA.generateDelta(), "node-A");

// B sends its delta back to A
nodeA.mergeDelta(nodeB.generateDelta(), "node-B");

// Both nodes now incorporate the received state
console.log(nodeA.values());
console.log(nodeB.values());
```

## Storage Layout

Each row occupies **24 bytes** in the underlying `ArrayBuffer`.

| Offset  | Size    | Field             | Description                                                   |
| ------- | ------- | ----------------- | ------------------------------------------------------------- |
| `0`     | 4 bytes | Element Hash      | Element identity hash (`u32`).                                |
| `4`     | 4 bytes | Add Tag ID        | Creator's sequence number when the element was added (`u32`). |
| `8`     | 4 bytes | Creator Node Hash | Hash identifying the creating node (`u32`).                   |
| `12`    | 1 byte  | Status            | `0` = active, `1` = tombstoned.                               |
| `13–15` | 3 bytes | Padding           | Reserved bytes.                                               |
| `16`    | 4 bytes | Remover Node Hash | Hash identifying the removing node (`u32`).                   |
| `20`    | 4 bytes | Remove Seq        | Removing node's sequence number (`u32`).                      |

Element and node names are maintained in separate hash-to-name maps. Synchronization deltas include the required identity tables, node digest, and selected rows.

</details>

<details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[CASUAL_CURSOR]</span> </strong></summary>

A binary causal cursor that encapsulates an origin node hash, local log sequence, and causal version-vector frontier in a compact binary token.

## API

| Member          | Props                                                      | Description                                                                              |
| --------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `CASUAL_CURSOR` | `originNodeId: string`, `initialFrontierCapacity?: number` | Creates a cursor for an origin node. Initial frontier capacity defaults to `16` entries. |
| `advance`       | `newSequence: bigint`, `frontier: VERSION_VECTOR`          | Updates the local sequence and frontier snapshot.                                        |
| `serialize`     | None                                                       | Returns a `Uint8Array` containing the cursor's binary representation.                    |
| `fromBinary`    | `bytes: Uint8Array`                                        | Static method that reconstructs a cursor from a binary token.                            |
| `dominates`     | `other: CASUAL_CURSOR`                                     | Compares cursor sequence or frontier state to determine dominance.                       |
| `offset`        | Getter                                                     | Returns the local sequence as a `bigint`.                                                |

## Usage

### Constructor

Creates a cursor associated with an origin node.

```
const cursor = new CASUAL_CURSOR("node-1");

// Specify initial frontier capacity
const cursorWithCapacity = new CASUAL_CURSOR("node-2", 32);
```

### `advance`

Updates the cursor's local sequence and accepts a version vector for the frontier snapshot.

```
cursor.advance(100n, versionVector);
```

### `serialize`

Produces the binary representation of the cursor.

```
const token = cursor.serialize();
```

### `fromBinary`

Reconstructs a cursor from a serialized binary token. Invalid magic headers throw an error.

```
const restored = CASUAL_CURSOR.fromBinary(token);
```

### `dominates`

Checks whether the cursor dominates another cursor.

```
const isDominant = cursor.dominates(restored);
```

### `offset`

Reads the cursor's current local sequence.

```
const currentOffset = cursor.offset;
```

## Binary Layout

The cursor uses a 16-byte header followed by a frontier section.

| Offset | Size               | Field                  | Description                                                     |
| ------ | ------------------ | ---------------------- | --------------------------------------------------------------- |
| `0`    | 4 bytes            | Magic Header / Version | `0x43535201` (`CSR1`).                                          |
| `4`    | 4 bytes            | Origin Node Hash       | Origin node identifier hash (`Uint32`).                         |
| `8`    | 8 bytes            | Local Sequence         | Local log offset (`BigUint64`).                                 |
| `16`   | 4 bytes            | Frontier Entry Count   | Number of frontier entries (`Uint32`).                          |
| `20`   | 16 bytes per entry | Frontier Entries       | Node hash (4 bytes), sequence (8 bytes), and padding (4 bytes). |

## Dependencies

| Import           | Description                                                                           |
| ---------------- | ------------------------------------------------------------------------------------- |
| `VERSION_VECTOR` | Version-vector type used by `advance`.                                                |
| `CausalRelation` | Imported causal relation symbol; not referenced in the supplied class implementation. |

Implement frontier serialization and comparison
</details>

<details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[DELTA_STORE]</span> </strong></summary>

A binary delta-state CRDT LWW-register bank backed by a contiguous `ArrayBuffer` slab. Stores key hashes, timestamps, node hashes, and numeric values in fixed-size binary slots.

## API

| Member | Props | Description |
|---|---|---|
| `DELTA_STORE` | `initialCapacity?: number` | Creates a store with an initial capacity of `1024` slots by default. |
| `set` | `key: string`, `value: number`, `timestamp: number`, `nodeIdHash: number` | Inserts or updates a key using Last-Write-Wins conflict resolution. |
| `get` | `key: string` | Returns the stored numeric value, or `undefined` if the key is not found. |
| `generateDelta` | `peerLastVersion: number` | Generates a binary delta packet containing the current store's slot data and version. |
| `mergeDelta` | `deltaBytes: Uint8Array` | Merges a received binary delta using timestamp and node hash conflict resolution. |

## Usage

### Constructor

Creates a store with the specified initial slot capacity.

```ts
const store = new DELTA_STORE();

// Specify initial capacity
const largeStore = new DELTA_STORE(2048);
```

### `set`

Inserts a new key or applies an update using LWW ordering. A greater timestamp wins; equal timestamps are resolved by the greater node ID hash.

```ts
store.set("temperature", 21.5, 1000, 1);
store.set("temperature", 22.0, 1001, 1);
```

### `get`

Retrieves the numeric value associated with a key.

```ts
const temperature = store.get("temperature");
// 22.0

const missing = store.get("unknown");
// undefined
```

### `generateDelta`

Generates a binary packet containing the local version, slot count, and current slot data.

```ts
const delta = store.generateDelta(0);
```

### `mergeDelta`

Merges a received packet into the local store. Existing entries are updated when the incoming timestamp wins, with node ID hash used to resolve equal timestamps. New entries are inserted.

```ts
const nodeA = new DELTA_STORE();
const nodeB = new DELTA_STORE();

nodeA.set("temperature", 22.0, 1001, 1);

const delta = nodeA.generateDelta(0);

nodeB.mergeDelta(delta);

const temperature = nodeB.get("temperature");
// 22.0
```

## Binary Storage Layout

Each slot occupies **24 bytes**.

| Offset | Size | Field | Description |
|---|---:|---|---|
| `0` | 4 bytes | Key Hash | Hashed string key (`Uint32`). |
| `4` | 8 bytes | Timestamp | LWW timestamp (`Float64`). |
| `12` | 4 bytes | Node ID Hash | Originating node hash (`Uint32`). |
| `16` | 8 bytes | Value | Numeric payload (`Float64`). |

## Delta Packet Layout

The generated packet contains an 8-byte header followed by the slot data.

| Offset | Size | Field | Description |
|---|---:|---|---|
| `0` | 4 bytes | Version | Local version counter (`Uint32`). |
| `4` | 4 bytes | Slot Count | Number of slots included (`Uint32`). |
| `8` | Variable | Slot Data | Contiguous 24-byte records. |

</details>

<details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[G_SET]</span> </strong></summary>

A high-performance binary Grow-Only Set (G-Set) CRDT backed by a contiguous `ArrayBuffer` slab. Maintains elements in ascending hash order, using binary search for lookups and sorted insertion for set operations.

## API

| Member | Props | Description |
|---|---|---|
| `G_SET` | `initialCapacity?: number` | Creates a set with an initial capacity of `1024` records by default. |
| `add` | `element: string`, `metadata?: number` | Adds an element with optional numeric metadata. Returns `true` if inserted or `false` if its hash already exists. |
| `has` | `element: string` | Checks whether the element's hash exists in the set. |
| `generateDelta` | None | Generates a binary delta containing the complete set contents. |
| `mergeDelta` | `deltaBytes: Uint8Array` | Merges a received binary delta into the local set. |
| `size` | Getter | Returns the number of records in the set. |

## Usage

### Constructor

Creates a G-Set with the specified initial record capacity.

```ts
const set = new G_SET();

// Specify initial capacity
const largeSet = new G_SET(2048);
```

### `add`

Adds an element and optional metadata. Returns `true` when inserted and `false` when the element's hash already exists.

```ts
const added = set.add("apple");
const addedWithMetadata = set.add("banana", 42);
```

### `has`

Checks whether an element's hash exists in the set.

```ts
const exists = set.has("apple");
// true
```

### `generateDelta`

Serializes the complete set into a binary delta packet.

```ts
const delta = set.generateDelta();
```

### `mergeDelta`

Merges the contents of a received binary delta using set union.

```ts
const nodeA = new G_SET();
const nodeB = new G_SET();

nodeA.add("apple");
nodeA.add("banana", 42);

const delta = nodeA.generateDelta();

nodeB.mergeDelta(delta);

console.log(nodeB.has("apple"));
// true
```

### `size`

Returns the number of records currently stored.

```ts
const count = set.size;
```

## Binary Storage Layout

Each record occupies **16 bytes**.

| Offset | Size | Field | Description |
|---|---:|---|---|
| `0` | 4 bytes | Element Hash | String element hash (`Uint32`), maintained in ascending order. |
| `4` | 8 bytes | Metadata | Numeric metadata (`Float64`). |
| `12` | 4 bytes | Reserved | Padding / alignment space. |

## Delta Packet Layout

The generated packet contains a 4-byte header followed by the complete record data.

| Offset | Size | Field | Description |
|---|---:|---|---|
| `0` | 4 bytes | Record Count | Number of records (`Uint32`). |
| `4` | Variable | Record Data | Contiguous 16-byte records. |
</details>

<details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[VERSION_VECTOR]</span> </strong></summary>

A high-performance binary Version Vector backed by a contiguous `ArrayBuffer` slab. Maintains node ID hashes in ascending order and stores each node's sequence counter as a `BigUint64`.

## API

| Member           | Props                                             | Description                                                                                                |
| ---------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `CausalRelation` | Enum                                              | Defines the four possible causal relationships: `EQUAL`, `BEFORE`, `AFTER`, and `CONCURRENT`.              |
| `VERSION_VECTOR` | `localNodeId: string`, `initialCapacity?: number` | Creates a version vector associated with a local node ID. Initial capacity defaults to `16` entries.       |
| `incrementLocal` | None                                              | Increments the sequence number associated with the local node and returns the updated value as a `bigint`. |
| `increment`      | `nodeIdHash: number`                              | Increments the sequence number for the specified node hash and returns the updated value.                  |
| `get`            | `nodeIdHash: number`                              | Returns the sequence number for a node hash, or `0n` if no entry exists.                                   |
| `set`            | `nodeIdHash: number`, `seq: bigint`               | Sets or inserts a node's sequence number.                                                                  |
| `merge`          | `remote: VERSION_VECTOR`                          | Merges another version vector using point-wise maximum sequence values.                                    |
| `compare`        | `other: VERSION_VECTOR`                           | Compares two vectors and returns their causal relationship as a `CausalRelation` value.                    |

## Causal Relations

| Enum Member                 | Value | Description                                      |
| --------------------------- | ----- | ------------------------------------------------ |
| `CausalRelation.EQUAL`      | `0`   | Both vectors contain identical sequence values.  |
| `CausalRelation.BEFORE`     | `-1`  | This vector is causally before the other vector. |
| `CausalRelation.AFTER`      | `1`   | This vector is causally after the other vector.  |
| `CausalRelation.CONCURRENT` | `2`   | Neither vector causally dominates the other.     |

## Usage

### Constructor

Creates a version vector for a local node.

```
const vector = new VERSION_VECTOR("node-1");

// Specify initial capacity
const largeVector = new VERSION_VECTOR("node-2", 32);
```

### `incrementLocal`

Increments the sequence counter for the node configured in the constructor.

```
const sequence = vector.incrementLocal();
// 1n
```

### `increment`

Increments the sequence counter for a specified node hash.

```
const sequence = vector.increment(12345);
// 1n
```

### `get`

Retrieves the sequence counter associated with a node hash.

```
const sequence = vector.get(12345);
```

### `set`

Sets or inserts a sequence counter for a node hash.

```
vector.set(12345, 10n);
```

### `merge`

Merges another version vector into the current vector. For each node hash, the greater sequence value is retained.

```
const local = new VERSION_VECTOR("node-1");
const remote = new VERSION_VECTOR("node-2");

local.incrementLocal();
remote.incrementLocal();

local.merge(remote);
```

### `compare`

Determines the causal relationship between two version vectors.

```
const relation = local.compare(remote);

if (relation === CausalRelation.EQUAL) {
  // Vectors are equal
} else if (relation === CausalRelation.BEFORE) {
  // Local vector is before remote
} else if (relation === CausalRelation.AFTER) {
  // Local vector is after remote
} else if (relation === CausalRelation.CONCURRENT) {
  // Vectors are concurrent
}
```

## Binary Storage Layout

Each node entry occupies **16 bytes**.

| Offset | Size    | Field            | Description                                                     |
| ------ | ------- | ---------------- | --------------------------------------------------------------- |
| `0`    | 4 bytes | Node ID Hash     | Node identifier hash (`Uint32`), maintained in ascending order. |
| `4`    | 8 bytes | Sequence Counter | Node's sequence number (`BigUint64`).                           |
| `12`   | 4 bytes | Reserved         | Padding / alignment space.                                      |

Document hash collisions and validationExplain missing-node zero semantics

</details>

<details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[CIRCUITBREAKER]</span> </strong></summary>

A distributed circuit breaker that protects asynchronous operations, tracks consecutive failures, applies configurable cooldowns, and coordinates state changes across peers through a bus.

## API

| Member | Props | Description |
|---|---|---|
| `CBCircuitState` | Type | Circuit states: `'closed'`, `'open'`, and `'half-open'`. |
| `CBCircuitBreakerOptions` | Interface | Configuration for failure thresholds, cooldown behavior, half-open attempts, failure classification, and timeouts. |
| `CIRCUITBREAKER` | `name: string`, `opts: CBCircuitBreakerOptions`, `onChange: (from, to) => void`, `staff: any` | Creates a circuit breaker associated with a named protected resource and a bus handle. |
| `state` | Property | Current circuit state. Initially `'closed'`. |
| `execute` | `fn: () => Promise<T>`, `fallback?: () => Promise<T> \| T` | Executes a protected operation, applying timeout and failure handling, and invokes the fallback when provided if the circuit blocks the request or the operation fails. |
| `forceOpen` | None | Immediately opens the circuit and sets its cooldown to the configured maximum. |
| `forceClose` | None | Resets failure and trip counters, restores the initial cooldown, and closes the circuit. |
| `canAttempt` | None | Checks whether another operation can be attempted. Transitions an expired open circuit to half-open. |
| `recordSuccess` | None | Records a successful operation and closes a half-open circuit. |
| `recordFailure` | None | Records a failure and evaluates whether the circuit should open. |
| `cooldownRemainingMs` | Getter | Returns the remaining open-state cooldown in milliseconds. |
| `transition` | Internal | Changes the circuit state, invokes `onChange`, and optionally broadcasts the transition. |
| `trip` | Internal | Opens the circuit, updates the trip count, resets counters, and calculates the next cooldown. |
| `withTimeout` | Internal | Rejects an operation if it exceeds the configured timeout. |

## Configuration

### `CBCircuitBreakerOptions`

| Option | Type | Description |
|---|---|---|
| `failureThreshold` | `number` | Consecutive failures required to open the circuit. |
| `cooldownMs` | `number` | Initial cooldown duration. |
| `cooldownMaxMs` | `number` | Maximum cooldown duration. |
| `cooldownFactor` | `number` | Exponential cooldown multiplier between trips. |
| `halfOpenMaxAttempts` | `number` | Maximum half-open attempts before reopening the circuit. |
| `isFailure` | `(err: unknown) => boolean` | Determines whether an error counts as a circuit failure. Defaults to treating every error as a failure. |
| `timeoutMs` | `number` | Optional operation timeout. Timed-out operations are treated as failures by the default classifier. |

## Usage

### Constructor

Creates a circuit breaker for a named resource. The name also identifies its distributed bus state channel.

```ts
const dbBreaker = new CIRCUITBREAKER(
  "postgres-primary",
  {
    failureThreshold: 5,
    cooldownMs: 1000,
    cooldownMaxMs: 30000,
    cooldownFactor: 2,
    halfOpenMaxAttempts: 3,
    timeoutMs: 4000,
    isFailure: (err) => !(err instanceof ClientValidationError),
  },
  (from, to) => console.log(`[postgres-primary] ${from} → ${to}`),
  staff,
);
```

### `execute`

Runs an asynchronous operation through the circuit breaker. An optional fallback is invoked when the circuit is blocking or the protected operation fails.

```ts
async function getUser(id: string) {
  return dbBreaker.execute(
    () => db.query("SELECT * FROM users WHERE id = $1", [id]),
    () => cache.getStale(`user:${id}`),
  );
}
```

### `state`

Reads the current circuit state.

```ts
const currentState = dbBreaker.state;
```

### `canAttempt`

Checks whether the circuit currently permits another operation.

```ts
if (dbBreaker.canAttempt()) {
  // An operation may be attempted
}
```

### `recordSuccess`

Records a successful operation.

```ts
dbBreaker.recordSuccess();
```

### `recordFailure`

Records a failed operation.

```ts
dbBreaker.recordFailure();
```

### `forceOpen`

Immediately opens the circuit using the maximum configured cooldown.

```ts
dbBreaker.forceOpen();
```

### `forceClose`

Resets the circuit's failure counters and closes it.

```ts
dbBreaker.forceClose();
```

### `cooldownRemainingMs`

Reads the remaining cooldown while the circuit is open.

```ts
const remaining = dbBreaker.cooldownRemainingMs;
```

## Circuit States

| State | Description |
|---|---|
| `closed` | Normal operation. Requests are permitted and consecutive failures are tracked. |
| `open` | Requests are blocked until the cooldown expires. |
| `half-open` | Allows a limited number of attempts to determine whether the protected resource has recovered. |

## Distributed State Synchronization

The circuit breaker uses the supplied `staff` bus handle to synchronize state with peers.

| Bus Operation | Channel | Description |
|---|---|---|
| `stateDRS` | `circuit:${name}`, `'state'` | Subscribes to remote circuit state changes. |
| `sendsub` | `circuit:${name}`, `'state'` | Broadcasts local state transitions with the state, opening timestamp, cooldown, and trip count. |

</details>

<details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[CQRS]</span> </strong></summary>

A command/query/event mediator implementing CQRS-style request handling, optimistic updates, offline command queueing, query caching, undo/redo history, and optional cross-tab event synchronization.

## API

| Member | Props | Description |
|---|---|---|
| `CQRS` | `opts?: { channelName?: string; crossTabSync?: boolean }` | Creates a CQRS mediator. Optionally enables cross-tab event synchronization through a named `BroadcastChannel`. |
| `state` | Getter | Returns the current connection state: `'online'` or `'offline'`. |
| `pendingOffline` | Getter | Returns the number of commands waiting in the offline queue. |
| `registerCommand` | `type: string`, `fn: CommandHandler`, `opts?: CommandOpts` | Registers a command handler and its execution options. |
| `registerQuery` | `type: string`, `fn: QueryHandler`, `opts?: QueryOpts` | Registers a query handler and its caching options. |
| `dispatch` | `command: Command` | Dispatches a command to its registered handler and returns a `Promise` containing the handler result. |
| `query` | `q: Query`, `opts?: QueryOpts` | Executes a registered query, using its cache configuration and optional per-request overrides. |
| `publish` | `event: DomainEvent \| { type: string; p: any }` | Publishes an event locally and broadcasts it to other tabs when cross-tab synchronization is enabled. |
| `on` | `eventType: string`, `handler: (p: any) => void` | Registers an event listener and returns an unsubscribe function. |
| `undo` | None | Removes the most recent successful command from the undo stack and invokes its rollback handler when available. |
| `redo` | None | Removes the most recent entry from the redo stack and dispatches its command again. |

## Configuration

### Constructor Options

| Option | Type | Description |
|---|---|---|
| `channelName` | `string` | BroadcastChannel name. Defaults to `'cqrs-bus'`. |
| `crossTabSync` | `boolean` | Enables cross-tab event synchronization when `BroadcastChannel` is available. |

### Command Registration

`registerCommand` accepts a command type, handler, and optional configuration.

```ts
interface CommandOpts {
  optimistic?: (command: Command) => any;
  rollback?: (command: Command, previousState: any) => void;
  idempotent?: boolean;
  offline?: boolean;
}
```

| Option | Description |
|---|---|
| `optimistic` | Applies an optimistic update before the command handler completes. |
| `rollback` | Restores state after a failed command or when undo is invoked. |
| `idempotent` | Enables duplicate suppression when the command includes an `_idempotencyKey`. |
| `offline` | Queues the command when the bus is offline. |

### Query Registration

`registerQuery` accepts a query type, handler, and optional cache configuration.

```ts
interface QueryOpts {
  ttlMs?: number;
  staleMs?: number;
}
```

| Option | Description |
|---|---|
| `ttlMs` | Cache freshness duration in milliseconds. Fresh cached results are returned directly. |
| `staleMs` | Maximum cache age for serving stale data while refreshing in the background. Defaults to `ttlMs`. |

## Usage

### Constructor

```ts
const bus = new CQRS({
  channelName: "document-events",
  crossTabSync: true,
});
```

### `registerCommand`

Registers a command handler with optional optimistic updates, idempotency, and offline queueing.

```ts
bus.registerCommand(
  "renameDocument",
  async (cmd) => {
    return api.patch(`/docs/${cmd.id}`, { name: cmd.name });
  },
  {
    optimistic: (cmd) => ({ name: cmd.name }),
    idempotent: true,
    offline: true,
  },
);
```

### `registerQuery`

Registers a query handler with cache expiration settings.

```ts
bus.registerQuery(
  "getDocument",
  async (q) => api.get(`/docs/${q.id}`),
  {
    ttlMs: 30_000,
  },
);
```

### `dispatch`

Dispatches a registered command.

```ts
const result = await bus.dispatch({
  type: "renameDocument",
  id: "42",
  name: "Q3 Report",
});
```

Commands configured for offline execution are queued when the bus is offline.

### `query`

Executes a registered query and returns its result.

```ts
const doc = await bus.query({
  type: "getDocument",
  id: "42",
});
```

### `publish`

Publishes a domain event to local listeners and, when enabled, other tabs.

```ts
bus.publish({
  type: "documentRenamed",
  p: { id: "42", name: "Q3 Report" },
});
```

### `on`

Subscribes to an event and receives an unsubscribe function.

```ts
const unsubscribe = bus.on("documentRenamed", (evt) => {
  refreshSidebar(evt);
});

// Remove the listener
unsubscribe();
```

### `undo`

Invokes the rollback handler for the most recent undo entry, when available.

```ts
bus.undo();
```

### `redo`

Redispatches the most recent command in the redo stack.

```ts
bus.redo();
```

### `state`

Reads the current connection state.

```ts
const connectionState = bus.state;
// 'online' | 'offline'
```

### `pendingOffline`

Reads the number of commands waiting for network connectivity.

```ts
const pending = bus.pendingOffline;
```

## Command Lifecycle

| Stage | Behavior |
|---|---|
| Registration | Associates a command type with its handler and options. |
| Idempotency | Suppresses repeated commands carrying an already-seen `_idempotencyKey` when idempotency is enabled. |
| Offline handling | Queues commands configured with `offline: true` when disconnected. |
| Optimistic application | Applies the optimistic callback before executing the handler. |
| Execution | Calls the registered command handler. |
| Success | Adds the command to undo history, clears redo history, publishes a `.completed` event, and invalidates related query cache entries. |
| Failure | Invokes the rollback callback when available, publishes a `.failed` event, and rethrows the error. |

## Query Caching

Queries use a key derived from the query type and its remaining properties, excluding `type`.

| Cache Condition | Behavior |
|---|---|
| Matching request already in flight | Returns the existing in-flight promise. |
| Cache age below `ttlMs` | Returns cached data directly. |
| Cache age below `staleMs` but outside TTL | Returns stale data and refreshes in the background. |
| Cache missing or beyond stale duration | Executes the query handler and awaits the result. |

Successful query execution updates the cache timestamp and stored data.

## Offline Queue

The bus tracks browser connectivity through `online` and `offline` window events.

- Commands with `offline: true` are queued when the state is `'offline'`.
- Optimistic updates are applied when those commands are queued.
- When connectivity returns, the queue is drained sequentially.
- If a queued command fails, it is returned to the front of the queue and draining stops.
- `pendingOffline` exposes the current queue length.

## Cross-Tab Synchronization

When `crossTabSync` is enabled and `BroadcastChannel` is available, the bus creates a channel using `channelName` or the default `'cqrs-bus'`.

Published events are broadcast using the following message structure:

```ts
{
  type: string;
  p: any;
}
```

Messages received from other tabs are re-emitted through the local event emitter. Commands are not redispatched across tabs.


</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[DIFFPATCH]</span> </strong></summary>

A structural diff and patch utility that generates compact deltas between values, applies changes while preserving references to untouched object subtrees, and supports reversing deltas to restore previous values.

It supports object changes, array differences, configurable array identity matching, and word-level text diffs with exact whitespace reconstruction.

## API

| Member | Props | Description |
|---|---|---|
| `DIFFPATCH` | `config?: DiffPatchConfig` | Creates a diff/patch engine with configurable array and text diff thresholds. |
| `setObjectHash` | `pattern: string \| RegExp`, `fn: (item: any, index: number) => string` | Registers an identity function for matching array elements at paths matching the supplied pattern. |
| `clone` | `value: T` | Recursively clones arrays and objects while returning primitive values unchanged. |
| `diff` | `left: T`, `right: T`, `path?: string` | Generates a delta describing the differences between two values. Returns `undefined` when no difference exists. |
| `patch` | `base: T`, `delta: Delta` | Applies a delta to a base value and returns the reconstructed value. |
| `unpatch` | `patched: T`, `delta: Delta` | Reverses a previously applied delta to reconstruct the original value. |
| `reverse` | `delta: Delta` | Generates a delta that reverses the supplied delta. |

## Configuration

### `DiffPatchConfig`

| Option | Default | Description |
|---|---:|---|
| `arrayDiffThreshold` | `500` | Maximum array length for using keyed or LCS-based array diffing. Larger arrays use index-based comparison. |
| `textDiffThreshold` | `60` | Minimum length of either string that enables word-level text diffing. |
| `textDiffMaxLength` | `20_000` | Maximum combined string length for word-level text diffing. |

## Delta Formats

Deltas represent changes using different formats depending on the value being compared.

| Delta Shape | Description |
|---|---|
| `[oldValue, newValue]` | Replaces an existing value. |
| `[newValue]` | Adds a value. |
| `[oldValue, 0, 0]` | Deletes a value. |
| `[ops, 0, 2]` | Represents a word-level text diff. |
| `{ key: delta }` | Represents changes to object properties. |
| `{ _t: 'a', ... }` | Represents array changes. |

Text operations use the following structure:

```ts
type TextOp = [0 | 1 | -1, string];

//  0 = unchanged text
//  1 = inserted text
// -1 = deleted text
```

Whitespace is retained as independent tokens, allowing text reconstruction without losing spacing.

## Usage

### Constructor

Creates a diff/patch instance using default or custom configuration.

```ts
const dp = new DIFFPATCH();

const custom = new DIFFPATCH({
  arrayDiffThreshold: 250,
  textDiffThreshold: 80,
  textDiffMaxLength: 10_000,
});
```

### `setObjectHash`

Registers an identity function for matching objects in arrays at a specified path. This allows array elements to be matched by identity rather than position.

```ts
dp.setObjectHash(/^tasks$/, (item) => item.id);
```

### `diff`

Generates a delta between two values.

```ts
const before = {
  name: "Sprint 1",
  tasks: [
    { id: "a", done: false },
    { id: "b", done: false },
  ],
};

const after = {
  name: "Sprint 1",
  tasks: [
    { id: "a", done: true },
    { id: "b", done: false },
    { id: "c", done: false },
  ],
};

const delta = dp.diff(before, after);
```

The resulting delta can be transmitted instead of sending the entire updated object.

### `patch`

Applies a delta to a base value.

```ts
const reconstructed = dp.patch(before, delta);
```

Object patching creates a new object while retaining references to unchanged properties and their subtrees.

### `unpatch`

Reconstructs the original value by applying the reverse of a delta.

```ts
const rolledBack = dp.unpatch(reconstructed, delta);
```

### `reverse`

Creates a reversed delta that can be applied to the patched value.

```ts
const reverseDelta = dp.reverse(delta);

const restored = dp.patch(reconstructed, reverseDelta);
```

### `clone`

Creates a recursive copy of an object or array.

```ts
const copy = dp.clone({
  name: "Sprint 1",
  tasks: [{ id: "a", done: false }],
});
```

## Diff Strategies

| Value Type | Strategy | Description |
|---|---|---|
| Identical values | Reference/value comparison | Returns `undefined` when both values are strictly equal. |
| Primitive values and type changes | Replacement delta | Stores the original and replacement values. |
| Objects | Property-level diff | Generates deltas only for added, removed, or changed properties. |
| Small arrays with a registered hasher | Keyed array diff | Matches elements using the registered identity function and records additions, removals, moves, and nested changes. |
| Small arrays without a hasher | LCS array diff | Uses longest common subsequence comparison to identify additions and removals. |
| Large arrays | Index-based diff | Compares array entries by index when either array exceeds `arrayDiffThreshold`. |
| Strings | Word-level text diff | Uses token-based longest common subsequence comparison when the configured thresholds permit it. |

## Structural Sharing

Object patching creates a new outer object while retaining references to untouched properties.

```ts
const before = {
  user: { name: "Alex" },
  settings: { theme: "dark" },
};

const delta = {
  user: {
    name: ["Alex", "Jordan"],
  },
};

const after = dp.patch(before, delta);

after !== before;                    // true
after.user !== before.user;          // true
after.settings === before.settings;  // true
```

This allows consumers to detect changed branches through reference comparisons without recreating unchanged object subtrees.

</details> 

 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[HYBRID_LOGICAL_CLOCK]</span> </strong></summary>


A Hybrid Logical Clock (HLC) that combines physical wall-clock timestamps with a logical counter and optional node identifier. Generates timestamp strings, incorporates remote timestamps, and compares timestamps by wall time and logical counter.

## API

| Member | Props | Description |
|---|---|---|
| `HYBRID_LOGICAL_CLOCK` | `nodeId?: string` | Creates a clock associated with an optional node identifier. Generates a random identifier when none is supplied. |
| `tick` | None | Advances the local clock and returns a timestamp string containing wall time, logical counter, and node ID when available. |
| `update` | `remoteTimestamp: string` | Updates the local clock using a received remote timestamp. |
| `compare` | `a: string`, `b: string` | Compares two timestamps by wall time and logical counter. Returns their numeric difference at the first differing component. |

## Timestamp Format

The clock generates timestamps using the following format:

```text
wallTime:logical:nodeId
```

| Component | Description |
|---|---|
| `wallTime` | Physical timestamp obtained from `Date.now()`. |
| `logical` | Logical counter used to distinguish timestamps sharing the same wall time. |
| `nodeId` | Optional identifier associated with the clock instance. |

When no node ID is available, the timestamp contains only the wall time and logical counter.

## Usage

### Constructor

Creates a clock with a supplied node identifier or generates one automatically.

```ts
const clock = new HYBRID_LOGICAL_CLOCK("node-1");

const automaticClock = new HYBRID_LOGICAL_CLOCK();
```

### `tick`

Generates the next local timestamp.

If physical time has advanced, the wall time is updated and the logical counter resets to zero. Otherwise, the logical counter increments.

```ts
const timestamp = clock.tick();

// Example: "1732147200000:0:node-1"
```

### `update`

Incorporates a remote timestamp into the local clock.

```ts
const remoteTimestamp = "1732147200000:4:node-2";

clock.update(remoteTimestamp);

const nextTimestamp = clock.tick();
```

The update compares the remote wall time with the local wall time and current physical time to determine the resulting local clock state.

### `compare`

Compares two timestamp strings using their wall-time and logical-counter components.

```ts
const a = "1732147200000:2:node-1";
const b = "1732147200000:5:node-2";

const result = clock.compare(a, b);

// Negative: a precedes b
// Zero: wall time and logical counter are equal
// Positive: a follows b
```

The node identifier is not included in the comparison.

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[HYBRID_LOGICAL_CLOCK_CRDT]</span> </strong></summary>

# ``
A Hybrid Logical Clock implementation designed for distributed CRDT systems. Combines physical wall-clock time, a logical counter, and a stable node identifier to generate timestamp strings with deterministic total ordering.

Remote timestamps are incorporated with bounded clock-skew adoption. The canonical timestamp string is used for wire communication, while parsed components are used for local computation.

## API

| Member | Props | Description |
|---|---|---|
| `HLCTimestamp` | `string` | Opaque HLC timestamp in canonical wire format. |
| `HLCParts` | `readonly [wall: number, logical: number, node: string]` | Parsed timestamp containing all three components. |
| `HLCParsed` | `readonly [wall: number, logical: number]` | Parsed numeric timestamp components. |
| `HLCNodeId` | `string` | Stable node identifier associated with an HLC instance. |
| `IHLC` | Interface | Defines the public instance methods: `tick`, `update`, and `compare`. |
| `IHLCClass` | Interface | Defines the constructor and static `MAX_SKEW_MS` property. |
| `HLCFactory` | Type | Callable singleton factory with attached constructor metadata and a `new()` method for creating independent instances. |
| `SplitHLC` | `(ts: HLCTimestamp) => HLCParts` | Function type for splitting a timestamp into its three components. |
| `ParseHLC` | `(ts: HLCTimestamp) => HLCParsed` | Function type for extracting the numeric timestamp components. |
| `HLCSurface` | Type | Complete factory surface with `splitHLC` and `parseHLC` helpers. |
| `splitHLC` | `ts: string` | Splits a timestamp into wall time, logical counter, and node ID. |
| `parseHLC` | `ts: string` | Extracts wall time and logical counter from a timestamp. |
| `isHLCTimestamp` | `v: unknown` | Performs a structural check for a nonempty string containing at least two colon-separated components. |
| `HYBRID_LOGICAL_CLOCK_CRDT` | `nodeId?: string` | Creates an HLC instance with a supplied node ID or generates one automatically. |
| `MAX_SKEW_MS` | Static readonly property | Maximum permitted remote wall-clock adoption ahead of local physical time. Defaults to `60_000` milliseconds. |
| `tick` | None | Generates the next locally originated HLC timestamp. |
| `update` | `remoteTimestamp: string` | Incorporates a remote timestamp into the local clock with bounded wall-clock adoption. |
| `compare` | `a: string`, `b: string` | Compares timestamps by wall time, logical counter, and lexical node ID, producing a deterministic total order. |

## Timestamp Wire Format

The canonical timestamp representation is:

```text
wallTime:logical:nodeId
```

| Component | Type | Description |
|---|---|---|
| `wallTime` | `number` | Physical wall-clock time in milliseconds since the Unix epoch. |
| `logical` | `number` | Logical counter distinguishing events sharing the same wall-clock millisecond. |
| `nodeId` | `string` | Stable identifier for the originating HLC instance. |

The node identifier must not contain `:` because the timestamp uses colon-separated fields.

The timestamp string is the canonical representation used for bus communication, CRDT operations, event ordering, and merge keys. Parsed tuples are used for computation rather than as wire representations.

## Usage

### Constructor

Creates an HLC instance with a supplied node identifier or generates one automatically.

```ts
const clock = new HYBRID_LOGICAL_CLOCK_CRDT("node-1");

const automaticClock = new HYBRID_LOGICAL_CLOCK_CRDT();
```

### `tick`

Generates the next timestamp for a locally originated event.

- If physical time advances, updates `wallTime` and resets `logical` to zero.
- Otherwise, increments the logical counter.
- Returns the canonical three-component timestamp string.

```ts
const timestamp = clock.tick();

// Example: "1732147200000:0:node-1"
```

### `update`

Merges a remote timestamp into the local clock.

Remote wall time is clamped to at most `MAX_SKEW_MS` ahead of the current physical time.

```ts
const remote = "1732147200000:4:node-2";

clock.update(remote);

const next = clock.tick();
```

The update behavior is:

| Condition | Result |
|---|---|
| Adopted remote wall time exceeds local wall time | Adopts the remote wall time and sets the logical counter to `remoteLogical + 1`. |
| Adopted remote wall time equals local wall time | Sets the logical counter to `max(localLogical, remoteLogical) + 1`. |
| Remote wall time is behind and physical time exceeds local wall time | Advances to physical time and resets the logical counter to zero. |
| Remote wall time is behind and physical time has not advanced beyond local wall time | Leaves the local clock unchanged. |
| Parsed numeric components are non-finite | Ignores the update. |

### `compare`

Provides deterministic total ordering across HLC timestamps.

Comparison proceeds in this order:

1. Wall-clock timestamp.
2. Logical counter.
3. Lexical node identifier.

```ts
const a = "1732147200000:2:node-1";
const b = "1732147200000:2:node-2";

const result = clock.compare(a, b);

// Negative: a precedes b
// Zero: timestamps have identical components
// Positive: a follows b
```

The node identifier provides deterministic ordering when two timestamps have identical wall-clock and logical components.

### `splitHLC`

Splits a timestamp into its three components.

```ts
const [wall, logical, node] = splitHLC(
  "1732147200000:4:node-1",
);
```

Returns:

```ts
[1732147200000, 4, "node-1"]
```

Non-finite numeric components are returned as `0`. A missing node component is returned as an empty string.

### `parseHLC`

Extracts only the numeric components.

```ts
const [wall, logical] = parseHLC(
  "1732147200000:4:node-1",
);
```

Returns:

```ts
[1732147200000, 4]
```

### `isHLCTimestamp`

Checks whether an unknown value structurally resembles an HLC timestamp.

```ts
isHLCTimestamp("1732147200000:4:node-1"); // true
isHLCTimestamp("1732147200000:4");       // true
isHLCTimestamp("");                      // false
isHLCTimestamp(null);                    // false
isHLCTimestamp(12345);                   // false
```

This is a structural check, not a complete timestamp validity check.

## Clock Skew Protection

`MAX_SKEW_MS` defines the maximum amount by which a remote wall clock can advance local wall time beyond the current physical clock.

<text id="skew" />

```ts
HYBRID_LOGICAL_CLOCK_CRDT.MAX_SKEW_MS;
// 60000
```

The default limit is 60 seconds. Remote timestamps further ahead are clamped to `Date.now() + MAX_SKEW_MS` before clock adoption.

## Factory Surface

The documented factory interface exposes a callable singleton accessor, constructor metadata, an independent-instance factory, and parsing helpers.

| Access | Description |
|---|---|
| `staff.HLC()` | Lazily constructs and returns the singleton HLC instance. |
| `staff.HLC.class` | Exposes the HLC constructor through `IHLCClass`. |
| `staff.HLC.new()` | Constructs a fresh HLC instance rather than returning the singleton. |
| `staff.HLC.splitHLC` | Exposes the timestamp splitting helper. |
| `staff.HLC.parseHLC` | Exposes the numeric parsing helper. |

The complete exposed surface is represented by `HLCSurface`.

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[LWW_REGISTER]</span> </strong></summary>


A Last-Write-Wins (LWW) Register that stores a value alongside a Hybrid Logical Clock (HLC) timestamp. Supports local writes, state serialization, state restoration, and merging replicated registers using HLC-based timestamp comparison.

The HLC comparison determines which value wins during a merge, incorporating logical counters and node identifiers rather than relying exclusively on synchronized wall clocks.

## API

| Member | Props | Description |
|---|---|---|
| `HLCState` | `wall: number`, `logical: number`, `node: string` | Represents the parsed components of an HLC timestamp. |
| `LWWState<T>` | `value: T \| undefined`, `stamp: string`, `_hlc?: HLCState` | Represents the transferable state of an LWW register, including its value and timestamp. |
| `LWW_REGISTER<T>` | `nodeId: string`, `hlc: HYBRID_LOGICAL_CLOCK`, `initial?: T` | Creates a typed register with an optional initial value and an HLC instance. |
| `set` | `value: T` | Updates the stored value and generates a new HLC timestamp. |
| `get` | None | Returns the currently stored value or `undefined`. |
| `merge` | `other: LWW_REGISTER<T> \| LWWState<T>` | Merges another register or serialized state when its timestamp is newer. |
| `getState` | None | Returns the current value and timestamp as an `LWWState<T>`. |
| `setState` | `state: LWWState<T>` | Replaces the register's current value and timestamp with the supplied state. |

## Usage

### Constructor

Creates a register associated with a node ID and HLC instance. An optional initial value can be supplied.

```ts
const register = new LWW_REGISTER(
  "node-1",
  hlc,
  "Initial value",
);

const emptyRegister = new LWW_REGISTER<string>(
  "node-2",
  hlc,
);
```

### `set`

Stores a new value and advances the associated HLC to generate its timestamp.

```ts
register.set("Updated value");
```

### `get`

Retrieves the currently stored value.

```ts
const value = register.get();
```

### `merge`

Accepts either another `LWW_REGISTER` instance or an `LWWState` object. The incoming state replaces the local state only when its HLC timestamp compares greater.

```ts
register.merge(remoteRegister);
```

Merging serialized state:

```ts
register.merge({
  value: "Remote value",
  stamp: "1732147200000:4:node-2",
});
```

### `getState`

Exports the current register value and timestamp.

```ts
const state = register.getState();
```

Returns:

```ts
{
  value: "Updated value",
  stamp: "1732147200000:1:node-1",
}
```

### `setState`

Restores or replaces the register using an existing state object.

```ts
register.setState(state);
```

## State Structure

### `HLCState`

| Field | Type | Description |
|---|---|---|
| `wall` | `number` | Physical wall-clock component. |
| `logical` | `number` | Logical counter component. |
| `node` | `string` | Node identifier component. |

### `LWWState<T>`

| Field | Type | Description |
|---|---|---|
| `value` | `T \| undefined` | Stored register value. |
| `stamp` | `string` | HLC timestamp used for conflict resolution. |
| `_hlc` | `HLCState` (optional) | Optional parsed HLC components. |

## Merge Resolution

The register uses `hlc.compare()` to determine which state wins.

| Comparison | Result |
|---|---|
| Incoming timestamp is greater | Incoming value and timestamp replace the local state. |
| Incoming timestamp is equal | Local state remains unchanged. |
| Incoming timestamp is smaller | Local state remains unchanged. |

The HLC timestamp provides ordering through its wall-time, logical-counter, and node-identifier components.

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[LWW_ELEMENTAL]</span> </strong></summary>


A high-performance Last-Write-Wins Element Set (LWW-Element-Set) CRDT.

Maintains separate timestamped add and remove records for each element. Elements are considered active according to the latest add/remove timestamps, with deterministic node-ID tie-breaking and a configurable bias for equal timestamps from the same node.

## API

| Member | Props | Description |
|---|---|---|
| `TimestampedEntry` | `timestamp: number`, `nodeId: string` | Timestamp and originating node identifier for an element operation. |
| `LWWElementSetPayload` | `adds`, `removes` | Serialized add and remove entries, represented as arrays of `[element, TimestampedEntry]` tuples. |
| `LWW_ELEMENTAL` | `tieBreakBias?: 'add' \| 'remove'` | Creates an LWW-Element-Set. Defaults to `'add'`. |
| `add` | `element: string`, `timestamp: number`, `nodeId: string` | Records an add operation when it is newer than the existing add record. |
| `remove` | `element: string`, `timestamp: number`, `nodeId: string` | Records a remove operation when it is newer than the existing remove record. |
| `has` | `element: string` | Determines whether an element is currently active. |
| `values` | None | Returns all currently active elements. |
| `merge` | `remote: LWWElementSetPayload` | Merges remote add and remove records using point-wise LWW comparison. |
| `exportState` | None | Exports the complete add/remove state as an `LWWElementSetPayload`. |

## Configuration

### `tieBreakBias`

Controls the result when an element's add and remove timestamps are equal and both operations have the same node ID.

| Value | Result |
|---|---|
| `'add'` | Element remains present. |
| `'remove'` | Element is absent. |

Default: `'add'`.

When equal timestamps have different node IDs, the lexicographically higher node ID wins, regardless of the configured bias.

## Usage

### Constructor

```ts
const set = new LWW_ELEMENTAL();

const removeWinsSet = new LWW_ELEMENTAL('remove');
```

### `add`

Records an element's add timestamp and node ID. Replaces the existing add record only when the incoming entry is newer.

```ts
set.add("apple", 100, "node-1");
set.add("banana", 105, "node-2");
```

### `remove`

Records an element's remove timestamp and node ID. Replaces the existing remove record only when the incoming entry is newer.

```ts
set.remove("apple", 110, "node-1");
```

### `has`

Checks whether an element is currently active.

```ts
const exists = set.has("apple");
```

Resolution rules:

| Condition | Result |
|---|---|
| No add record exists | `false` |
| Add exists, no remove exists | `true` |
| Add timestamp is greater | `true` |
| Remove timestamp is greater | `false` |
| Timestamps equal, same node ID | Uses `tieBreakBias` |
| Timestamps equal, different node IDs | Higher node ID wins |

### `values`

Returns an array containing all active elements.

```ts
const activeElements = set.values();
```

The method iterates over elements with recorded add operations and includes only those for which `has()` returns `true`.

### `merge`

Merges a remote payload into the local set. Add and remove records are merged independently, retaining the newer entry for each element.

```ts
const remoteState = remoteSet.exportState();

set.merge(remoteState);
```

The merge uses timestamp comparison first and lexicographical node-ID comparison when timestamps are equal.

### `exportState`

Exports both internal maps as arrays of element-entry tuples.

```ts
const payload = set.exportState();
```

## Payload Structure

`LWWElementSetPayload` contains two independent collections:

```ts
interface LWWElementSetPayload {
  adds: [string, TimestampedEntry][];
  removes: [string, TimestampedEntry][];
}

interface TimestampedEntry {
  timestamp: number;
  nodeId: string;
}
```

Example:

```ts
{
  adds: [
    ["apple", { timestamp: 100, nodeId: "node-1" }],
    ["banana", { timestamp: 105, nodeId: "node-2" }]
  ],
  removes: [
    ["apple", { timestamp: 110, nodeId: "node-1" }]
  ]
}
```

## Merge and Conflict Resolution

The set maintains separate latest-operation records for additions and removals. Each record is compared independently using:

1. Higher timestamp wins.
2. If timestamps are equal, higher node ID wins.

After merging, `has()` evaluates the resulting add and remove records to determine membership. The `tieBreakBias` applies only when the add and remove timestamps are equal and their node IDs are also equal.
</details>

 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[MV_REGISTER]</span> </strong></summary>


A Multi-Value Register (MV-Register) CRDT that preserves concurrent values instead of silently discarding them.

Unlike `LWW_REGISTER`, which retains only the latest value, `MV_REGISTER` keeps independently stamped values observable until divergence is explicitly resolved with `collapse()`.

Merging uses set union keyed by unique HLC stamps. This makes the merge operation idempotent, commutative, and associative.

## API

| Member | Props | Description |
|---|---|---|
| `MVEntry<T>` | `value: T`, `stamp: string` | Represents a stored value and its HLC timestamp. |
| `MV_REGISTER<T>` | `nodeId: string`, `hlc: HYBRID_LOGICAL_CLOCK`, `initial?: T` | Creates a multi-value register with an optional initial value. |
| `set` | `value: T` | Writes a new value, removing entries ordered before the new HLC stamp while preserving concurrent entries. |
| `values` | None | Returns all currently observable values. |
| `entriesOf` | None | Returns all current entries, including their stamps. |
| `concurrency` | None | Returns the number of currently retained entries. |
| `get` | None | Returns the highest-ordered value without discarding concurrent alternatives. |
| `merge` | `other: MV_REGISTER<T> \| MVEntry<T>[]` | Merges entries by unique stamp without replacing existing entries with the same stamp. |
| `getState` | None | Exports the current entries as an array. |
| `setState` | `state: MVEntry<T>[]` | Replaces the current entries with the supplied state. |
| `collapse` | `resolve?: (entries: MVEntry<T>[]) => MVEntry<T>` | Resolves divergence to one entry, using HLC ordering by default or a custom resolver. |

## Usage

### Constructor

Creates a register associated with a node ID and HLC instance. An optional initial value is written immediately.

```ts
const reg = new MV_REGISTER<string>(
  staff.instanceId,
  hlc,
);

const initialized = new MV_REGISTER<string>(
  staff.instanceId,
  hlc,
  "initial",
);
```

### `set`

Writes a new value with a fresh HLC timestamp.

Entries whose stamps compare lower than the new stamp are removed. Entries that are concurrent with the new stamp remain observable.

```ts
reg.set("value-a");
reg.set("value-b");
```

### `values`

Returns the values of all currently retained entries.

```ts
const currentValues = reg.values();
```

This is useful for exposing concurrent values to application-level conflict handling or user interfaces.

### `entriesOf`

Returns all retained entries, including their timestamps.

```ts
const entries = reg.entriesOf();
```

Example result:

```ts
[
  { value: "value-a", stamp: "1732147200000:1:node-1" },
  { value: "value-b", stamp: "1732147200000:1:node-2" },
]
```

### `concurrency`

Returns the number of retained entries.

```ts
if (reg.concurrency() > 1) {
  showConflictUI(reg.values());
}
```

A count of `1` indicates that only one value is currently retained. A count greater than `1` indicates divergence.

### `get`

Returns the value with the highest HLC ordering without removing the other entries.

```ts
const resolvedValue = reg.get();
```

This provides a default LWW-style view while preserving concurrent alternatives in the register.

### `merge`

Accepts another `MV_REGISTER` or an array of `MVEntry<T>` objects.

Entries are merged by stamp. Existing entries with the same stamp are retained; previously unseen stamps are added.

```ts
reg.merge(remoteRegister);
```

Merging serialized entries:

```ts
reg.merge(remoteRegister.getState());
```

### `getState`

Exports all current entries as an array suitable for state transfer or replication.

```ts
const state = reg.getState();
```

### `setState`

Replaces the register's current entries with the supplied state.

```ts
reg.setState(remoteState);
```

The existing entries are cleared before the supplied entries are inserted.

### `collapse`

Explicitly resolves divergence to a single surviving entry.

Without a custom resolver, the entry with the highest HLC timestamp wins.

```ts
reg.collapse();
```

A custom resolver receives all current entries and returns the entry to retain:

```ts
reg.collapse((entries) => {
  return entries.find((entry) => entry.value === preferredValue)!;
});
```

The register is cleared and replaced with the selected entry. The method returns the surviving value.

If the register contains zero or one entry, it returns `get()` without performing a collapse.

## State Structure

### `MVEntry<T>`

| Field | Type | Description |
|---|---|---|
| `value` | `T` | Stored value. |
| `stamp` | `string` | HLC timestamp identifying the write. |

Internally, entries are stored in a `Map` keyed by their stamp.

## Merge and Conflict Resolution

The register distinguishes between merging replicated state and explicitly resolving divergence.

| Operation | Behavior |
|---|---|
| `set()` | Removes entries ordered before the new write and preserves concurrent entries. |
| `merge()` | Performs set-union by stamp, adding entries not already present. |
| `get()` | Returns the highest-ordered value without discarding alternatives. |
| `collapse()` | Reduces the register to one selected entry. |

The default resolution order uses `HYBRID_LOGICAL_CLOCK.compare()`, matching the timestamp ordering used by `LWW_REGISTER`. A custom `collapse()` resolver allows application-specific conflict policies.

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[OR_SET]</span> </strong></summary>


An Observed-Remove Set (OR-Set) CRDT that supports distributed additions and removals while preserving concurrent additions.

Each addition receives a unique tag generated from an HLC timestamp and the originating node ID. Removals record the specific tags currently observed for an item rather than removing the item globally.

This provides the OR-Set guarantee: a concurrent addition with a new tag survives a removal that did not observe it.

## API

| Member | Props | Description |
|---|---|---|
| `ORSetState<T>` | `adds`, `removes` | Serialized set state containing tagged additions and removal tombstones. |
| `OR_SET<T>` | `nodeId: string`, `hlc: HYBRID_LOGICAL_CLOCK` | Creates an observed-remove set associated with a node and HLC instance. |
| `add` | `item: T` | Adds an item with a newly generated unique tag. |
| `remove` | `item: T` | Marks every currently observed tag for the item as removed. |
| `has` | `item: T` | Checks whether at least one active tag exists for the item. |
| `values` | None | Returns unique currently active items. |
| `merge` | `other: OR_SET<T> \| ORSetState<T>` | Merges another set or serialized state by unioning additions and removal tags. |
| `getState` | None | Exports the current additions and removal tombstones. |
| `setState` | `state: ORSetState<T>` | Replaces the current set state. |

## Usage

### Constructor

Creates a set using a node identifier and HLC instance.

```ts id="o5dr3w"
const set = new OR_SET<string>(
  "node-1",
  hlc,
);
```

### `add`

Adds an item with a unique tag generated from the HLC timestamp and node ID.

```ts id="7nx9fm"
set.add("apple");
set.add("banana");
```

Each addition creates a separate tagged entry, including repeated additions of the same item.

### `remove`

Removes all currently observed tags associated with the supplied item.

```ts id="j0g5hw"
set.remove("apple");
```

The operation does not prevent future additions. An addition created concurrently on another node receives a different tag and survives unless that tag is subsequently observed and removed.

### `has`

Checks whether an item has at least one addition tag that has not been removed.

```ts id="u7d2cm"
const exists = set.has("apple");
```

### `values`

Returns unique active items, excluding entries whose tags have been removed.

```ts id="4m8qle"
const activeItems = set.values();
```

Item deduplication uses `JSON.stringify()` for the uniqueness key.

### `merge`

Merges another `OR_SET` instance or an `ORSetState<T>` payload.

```ts id="x3m9pv"
set.merge(remoteSet);
```

Merging serialized state:

```ts id="q2f6kb"
set.merge(remoteSet.getState());
```

The merge performs two unions:

- Additions are inserted when their tags are not already present.
- Removal tombstones are added to the local removal set.

Neither collection removes existing records during merging.

### `getState`

Exports the current additions and removal tombstones.

```ts id="n4x8dw"
const state = set.getState();
```

Returns an `ORSetState<T>` containing:

- `adds`: all tagged addition entries.
- `removes`: removal entries containing the original item and tag.

### `setState`

Replaces the current additions and removal tombstones with the supplied state.

```ts id="c6v2ha"
set.setState(state);
```

## State Structure

### `ORSetState<T>`

| Field | Type | Description |
|---|---|---|
| `adds` | `{ item: T; tag: string }[]` | Tagged addition entries. |
| `removes` | `{ item: T; tag: string }[]` | Tagged removal tombstones. |

Each tag identifies an individual addition.

Example:

```ts id="f8k2qa"
{
  adds: [
    { item: "apple", tag: "1732147200000:1:node-1" },
    { item: "banana", tag: "1732147200000:2:node-1" }
  ],
  removes: [
    { item: "apple", tag: "1732147200000:1:node-1" }
  ]
}
```

 
</details>

 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[OPTIMISTIC]</span> </strong></summary>

Per-entity stacked optimistic update manager with reconciliation, partial rollback, and optional cross-tab visibility.

Maintains an ordered stack of pending mutations for each entity. Each mutation stores a prediction function that is replayed against the current confirmed base and all preceding mutations.

This allows multiple updates to the same entity to remain independently pending, even when their confirmation or failure responses arrive out of order.

## API

| Member | Props | Description |
|---|---|---|
| `OPTIMISTIC` | `bus: unknown`, `config?: OptimisticConfig` | Creates an optimistic update manager. |
| `apply<T>` | `entityKey: string`, `predict: Predictor<T>`, `meta?: { commandId?: string }` | Adds a prediction to an entity's mutation stack and returns its mutation ID. |
| `confirm` | `mutationId: string`, `actual: unknown` | Confirms a mutation and replaces its prediction with a reconciled, fixed value. |
| `fail` | `mutationId: string`, `error?: unknown` | Removes a failed mutation without removing other mutations in the stack. |
| `getState<T>` | `entityKey: string` | Returns the base state with all pending mutations applied in order. |
| `isPending` | `entityKey: string` | Indicates whether an entity has pending mutations. |
| `pendingCount` | `entityKey?: string` | Returns the pending mutation count for one entity or across all entities. |
| `setReconciler` | `pattern: string \| RegExp`, `fn: (predicted, actual) => any` | Registers a custom reconciliation function for matching entities. |
| `setSnapshotSource` | `pattern: string \| RegExp`, `fn: (entityKey: string) => any` | Registers a source for retrieving an entity's confirmed base state. |
| `on` | `event`, `handler` | Subscribes to optimistic lifecycle events and returns an unsubscribe function. |
| `destroy` | None | Closes cross-tab communication, clears event listeners, and clears mutation stacks. |

## Configuration

The constructor accepts an optional `OptimisticConfig`.

The implementation uses these configuration properties:

| Property | Description |
|---|---|
| `crossTabSync` | Enables BroadcastChannel-based synchronization when `BroadcastChannel` is available. |
| `channelName` | BroadcastChannel name. Defaults to `'optimistic-sync'`. |
| `defaultReconciler` | Fallback reconciliation function when no entity-specific reconciler matches. |

The default reconciliation behavior returns the actual value supplied to `confirm()`.

## Usage

### Constructor

```ts
const optimistic = new OPTIMISTIC(bus, {
  crossTabSync: true,
  channelName: "document-sync",
});
```

Cross-tab synchronization is initialized only when enabled and the `BroadcastChannel` API is available.

### `setSnapshotSource`

Registers a function that retrieves the confirmed base state for matching entity keys.

```ts
optimistic.setSnapshotSource(
  /^document:/,
  (key) => this.kvdb.get(key),
);
```

The snapshot source is consulted whenever the manager calculates an entity's state. This allows confirmed state to remain owned by an external store such as KVDB or RDB.

Multiple sources can be registered. The most recently registered matching source takes precedence.

### `setReconciler`

Registers a custom function for reconciling a predicted value with the actual server result.

```ts
optimistic.setReconciler(
  /^document:/,
  (predicted, actual) => ({
    ...predicted,
    ...actual,
    localDraftNotes: predicted.localDraftNotes,
  }),
);
```

This allows server-confirmed fields to replace predicted fields while preserving selected local-only data.

Multiple reconcilers can be registered. The most recently registered matching reconciler takes precedence over earlier matches and the default reconciler.

### `apply`

Adds a mutation to the entity's stack and returns a unique mutation ID.

The prediction must be a function rather than a static value. It receives the state produced by the confirmed base and preceding mutations.

```ts
const mutationId = optimistic.apply(
  "document:42",
  (base) => ({
    ...base,
    name: "Draft 1",
  }),
);
```

An optional command ID can be attached as metadata:

```ts
const mutationId = optimistic.apply(
  "document:42",
  (base) => ({
    ...base,
    name: "Draft 2",
  }),
  { commandId: "rename-document" },
);
```

Each mutation receives a generated ID that can later be passed to `confirm()` or `fail()`.

### `confirm`

Confirms a mutation using the actual result.

The manager calculates the state immediately before that mutation, replays its prediction, and passes the predicted result and actual result through the applicable reconciler.

The mutation's prediction is then replaced with a function returning the reconciled value. Mutations above it remain in the stack and continue replaying on top.

```ts
optimistic.confirm(mutationId, {
  name: "Server-confirmed name",
});
```

Confirmation does not require responses to arrive in the same order as mutations were applied.

### `fail`

Removes only the specified mutation from its entity's stack.

```ts
optimistic.fail(mutationId);
```

An optional error can be supplied:

```ts
optimistic.fail(mutationId, error);
```

Mutations above the failed mutation remain in the stack and are replayed without the removed layer.

If the stack becomes empty, the entity's stack is deleted.

### `getState`

Returns the entity's current UI-facing state by applying every mutation in order over its confirmed base.

```ts
const document = optimistic.getState<Document>(
  "document:42",
);
```

The calculation is:

1. Retrieve the confirmed base from the matching snapshot source.
2. Apply the first mutation's prediction.
3. Apply each subsequent mutation to the result.
4. Return the final projected state.

If no snapshot source matches, the base state is `undefined`.

### `isPending`

Checks whether an entity has any mutations in its stack.

```ts
const pending = optimistic.isPending("document:42");
```

### `pendingCount`

Returns the number of mutations currently stored.

For one entity:

```ts
const count = optimistic.pendingCount("document:42");
```

Across all entities:

```ts
const total = optimistic.pendingCount();
```

### `on`

Subscribes to lifecycle events. Returns a function that removes the registered handler.

```ts
const unsubscribe = optimistic.on(
  "optimistic:applied",
  ({ entityKey, mutationId }) => {
    console.log(entityKey, mutationId);
  },
);

unsubscribe();
```

### `destroy`

Closes the BroadcastChannel if one was created, clears event listeners, and removes all mutation stacks.

```ts
optimistic.destroy();
```

## Stacked Mutation Behavior

The mutation stack allows updates to be confirmed or rolled back independently.

Consider two consecutive edits to the same document:

```ts
const m1 = optimistic.apply(
  "document:42",
  (base) => ({ ...base, name: "Draft 1" }),
);

const m2 = optimistic.apply(
  "document:42",
  (base) => ({ ...base, name: "Draft 2" }),
);
```

The visible state is `Draft 2`, because the second prediction is applied over the first.

If the first mutation is confirmed:

```ts
optimistic.confirm(m1, { name: "Draft 1" });
```

The first mutation becomes a fixed reconciled value. The second mutation remains pending and replays over it, so the visible state remains `Draft 2`.

If the second mutation then fails:

```ts
optimistic.fail(m2);
```



</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[PN_COUNTER]</span> </strong></summary>



A state-based Positive-Negative Counter (PN-Counter) CRDT that supports independent increments and decrements across multiple replicas.

Each replica maintains two independent node-indexed counters:

- `positive`: accumulated increments.
- `negative`: accumulated decrements.

The counter's value is the sum of all positive contributions minus the sum of all negative contributions.

## USAGE

```ts
const likes = new PN_COUNTER(staff.instanceId);

likes.increment();
likes.increment(3);
likes.decrement();

console.log(likes.value()); // 3
```

### Synchronization

Exchange states through the bus and merge incoming contributions:

```ts
staff.multisub('[COUNTERS]', 'post:42:likes', (state: PNCounterState) =>
    likes.merge(state)
);

staff.sendsub('[COUNTERS]', 'post:42:likes', likes.delta());
```

`delta()` sends only the local replica's contributions rather than the complete counter state.

## API

### `PNCounterState`

```ts
export interface PNCounterState {
    positive: Record<string, number>;
    negative: Record<string, number>;
}
```

| Property | Description |
|---|---|
| `positive` | Increment totals indexed by replica node ID. |
| `negative` | Decrement totals indexed by replica node ID. |

### `PN_COUNTER`

**Constructor**

```ts
constructor(nodeId: string)
```

Identifies the replica whose contributions this counter maintains.

| Method | Signature | Description |
|---|---|---|
| `increment` | `(amount = 1): void` | Adds an increment to the local replica's positive counter. |
| `decrement` | `(amount = 1): void` | Adds a decrement to the local replica's negative counter. |
| `value` | `(): number` | Returns the sum of positive contributions minus negative contributions. |
| `merge` | `(other: PN_COUNTER \| PNCounterState): void` | Merges another counter or serialized state. |
| `getState` | `(): PNCounterState` | Returns copies of both counter maps. |
| `setState` | `(state: PNCounterState): void` | Replaces the current state with copies of the supplied maps. |
| `delta` | `(): PNCounterState` | Returns only the local replica's positive and negative contributions. |

## MERGE STRATEGY

`merge()` performs an element-wise maximum across both maps.

```ts
this.positive[node] = Math.max(
    this.positive[node] ?? 0,
    count
);
```

Each replica only grows its own node slot. Taking the maximum when merging ensures that receiving an older state cannot overwrite a larger contribution.

This makes state merging:

- **Idempotent:** merging the same state repeatedly has no additional effect.
- **Commutative:** merge order does not affect the result.
- **Associative:** grouping merges does not affect the result.

## DELTA SYNCHRONIZATION

`delta()` returns only the current replica's entries:

```ts
{
    positive: {
        [nodeId]: positiveCount
    },
    negative: {
        [nodeId]: negativeCount
    }
}
```


</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[DRSHeartbeatManager]</span> </strong></summary>



A heartbeat manager that tracks active nodes using an `OR_SET` and periodically broadcasts the current membership state through a supplied send function.

The manager uses a `HYBRID_LOGICAL_CLOCK` to advance its clock during periodic and manual check-ins.

## USAGE

```ts
const heartbeat = new DRSHeartbeatManager(
    staff.instanceId,
    hlc,
    '[HEARTBEAT]',
    'active:nodes',
    (rt, subChannel, payload) => staff.sendsub(rt, subChannel, payload)
);

heartbeat.start((activeNodes) => {
    console.log(activeNodes);
});
```

### Manual check-in

```ts
heartbeat.ping();
```

### Receiving remote state

```ts
heartbeat.handleIncomingState(remoteState, (activeNodes) => {
    console.log(activeNodes);
});
```

### Stopping

```ts
heartbeat.stop();
```

## API

### `DRSHeartbeatManager<T = string>`

**Constructor**

```ts
constructor(
    nodeId: string,
    hlc: HYBRID_LOGICAL_CLOCK,
    rt: string,
    subChannel: string,
    sendSubFn: (rt: string, subChannel: string, p: any) => void,
    intervalMs = 30000
)
```

| Parameter | Description |
|---|---|
| `nodeId` | Identifier of the local replica. |
| `hlc` | Hybrid Logical Clock used for check-ins. |
| `rt` | Root channel passed to the send function. |
| `subChannel` | Sub-channel passed to the send function. |
| `sendSubFn` | Function used to broadcast the OR-Set state. |
| `intervalMs` | Heartbeat interval in milliseconds. Defaults to `30000`. |

### Methods

| Method | Signature | Description |
|---|---|---|
| `start` | `(onStateChange?): void` | Starts the periodic heartbeat interval. |
| `handleIncomingState` | `(remoteState, onStateChange?): void` | Merges incoming OR-Set state and optionally reports the resulting active nodes. |
| `ping` | `(): void` | Advances the HLC, registers the local node, and broadcasts the current state. |
| `stop` | `(): void` | Clears the heartbeat interval and resets its timer reference. |
| `getActiveNodes` | `(): T[]` | Returns the current OR-Set values. |

Both `start` and `handleIncomingState` accept an optional callback:

```ts
(activeNodes: T[]) => void
```

## HEARTBEAT CYCLE

When `start()` runs, it creates an interval using `intervalMs`. Each interval execution:

1. Advances the HLC with `tick()`.
2. Creates a fresh `OR_SET` for the next liveness window.
3. Adds the local node ID to the new set.
4. Broadcasts the serialized state through `sendSubFn`.
5. Invokes `onStateChange`, if supplied, with the current set values.

Calling `start()` while an interval is already active does not create another interval.

## STATE SYNCHRONIZATION

Incoming state is merged into the current OR-Set:

```ts
heartbeat.handleIncomingState(remoteState);
```

The manager uses `OR_SET<T>` for membership tracking and `ORSetState<T>` as the incoming and outgoing synchronization format.

The callback receives the resulting values after each incoming merge.

## MANUAL HEARTBEAT

`ping()` provides an explicit check-in outside the periodic interval. It advances the HLC, adds the local node ID to the current OR-Set, and broadcasts the resulting state.

## ACTIVE MEMBERSHIP

```ts
const activeNodes = heartbeat.getActiveNodes();
```

Returns the values currently held by the manager's OR-Set.


</details>

 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[SEMAPHORE]</span> </strong></summary>


A semaphore implementation supporting local and distributed concurrency control.

- **Local mode:** HLC-ordered acquisition queue, configurable capacity, automatic lease expiration, and permit renewal.
- **Distributed mode:** RAFT-backed replicated state machine using committed log entries to coordinate permit acquisition, release, and renewal across nodes.

## USAGE

### Local mode

```ts
const semaphore = new SEMAPHORE({
    limit: 3,
    leaseMs: 30_000,
});

const permit = await semaphore.acquire({ label: 'expensive-op' });

try {
    await doExpensiveWork();
} finally {
    await permit.release();
}
```

### Distributed mode

```ts
const raft = await RAFT.create({
    clusterId: 'expensive-op',
    nodeId: instanceId,
    peerIds: otherInstanceIds,
}, staff);

const clusterSemaphore = new SEMAPHORE({
    limit: 3,
    distributed: true,
    nodeId: instanceId,
    raft,
    leaseMs: 20_000,
});

const permit = await clusterSemaphore.acquire({
    label: 'expensive-op',
    timeoutMs: 10_000,
});

try {
    await doExpensiveClusterWideThrottledWork();
} finally {
    await permit.release();
}
```

## CONFIGURATION

`SemaphoreConfig` is referenced by the constructor and contains the following configuration properties used by the implementation.

| Property | Description | Default |
|---|---|---|
| `limit` | Maximum number of active permits. | Required |
| `leaseMs` | Permit lease duration in milliseconds. | `30000` |
| `distributed` | Enables RAFT-backed distributed mode. | `false` |
| `pollIntervalMs` | Interval between distributed commit-index checks. | `75` |
| `hlc` | Optional `HYBRID_LOGICAL_CLOCK` instance for local queue ordering. | New instance |
| `raft` | RAFT instance used by distributed mode. | Required in distributed mode |
| `nodeId` | Local replica identifier. | Required in distributed mode |

Distributed mode requires both `raft` and `nodeId`.

## API

### `SEMAPHORE`

**Constructor**

```ts
constructor(config: SemaphoreConfig)
```

### Methods

| Method | Signature | Description |
|---|---|---|
| `acquire` | `(opts?): Promise<Permit>` | Acquires a permit, waiting for capacity when necessary. |
| `tryAcquire` | `(opts?): Permit \| null` | Attempts immediate acquisition in local mode. Returns `null` when capacity is unavailable or distributed mode is enabled. |
| `stats` | `(): object` | Returns active permits, queued requests, oldest wait duration, and configured limit. |
| `setLimit` | `(n: number): void` | Changes the configured permit limit. |
| `destroy` | `(): void` | Stops local waiting requests, clears their timers, and clears active local permits. |

### Acquisition options

```ts
{
    timeoutMs?: number;
    label?: string;
}
```

- `timeoutMs`: Maximum time to wait for a permit.
- `label`: Optional identifier associated with the permit.

### Permit

The acquired permit exposes:

| Property / Method | Description |
|---|---|
| `id` | Unique permit identifier. |
| `label` | Optional acquisition label. |
| `acquiredAt` | Acquisition timestamp. |
| `release()` | Releases the permit. |
| `renew()` | Renews the permit's lease. |

## LOCAL MODE

Local mode maintains:

- `active`: A map of currently active permits.
- `queue`: Waiting acquisition requests.

When capacity is available, `acquire()` grants a permit immediately.

When capacity is full, requests enter the queue with an HLC timestamp. `insertFair()` orders waiting requests using `hlc.compare()`, giving the queue its HLC-based ordering.

When a permit is released or expires, `drainLocalQueue()` grants available capacity to queued requests in order.

### Permit lifecycle

1. `grantLocal()` creates a permit and starts its lease timer.
2. `release()` clears the timer and removes the permit.
3. `renew()` resets the lease timer.
4. Lease expiration automatically releases the permit.
5. `drainLocalQueue()` grants waiting requests when capacity becomes available.

### Acquisition timeout

A queued request can specify `timeoutMs`. If the timeout expires before acquisition, the request is removed from the queue and its promise rejects.

## DISTRIBUTED MODE

Distributed mode uses RAFT's committed log as the ordering authority for permit operations.

The replicated commands are:

| Command | Purpose |
|---|---|
| `ACQUIRE` | Requests a permit with the configured limit and lease duration. |
| `RELEASE` | Removes a permit from the holder state. |
| `RENEW` | Updates a permit's renewal timestamp. |

Capacity is evaluated when commands are applied to the committed log.

Each node maintains a local `holders` map and an `appliedIndex` tracking the latest committed entry applied locally.

### Distributed acquisition

`acquireDistributed()`:

1. Proposes an `ACQUIRE` command.
2. Applies newly committed entries.
3. Checks whether the requested permit appears in `holders`.
4. Returns a distributed permit when acquisition succeeds.
5. Waits for commit-index progress and retries when capacity is full.

The acquisition deadline is checked throughout the retry process.

### Replicated state application

`applyCommitted()`:

- Checks whether snapshot catch-up is required.
- Restores holder state from an available RAFT snapshot.
- Replays committed log entries in index order.
- Advances `appliedIndex` after each applied entry.

`applyEntryPure()` implements the state transition logic and returns a new holder map. It is also used by RAFT compaction.

### Distributed permit lifecycle

- `releaseDistributed()` proposes a `RELEASE` command.
- `renewDistributed()` proposes a `RENEW` command.
- Both apply newly committed entries afterward.

Distributed permit release and renewal are asynchronous.

### Commit progress

Distributed acquisition uses `waitForCommitProgress()` to poll `raft.commitIndex` at the configured `pollIntervalMs`.

RAFT does not expose a commit-event hook in this implementation, so waiting for capacity freed by another node is poll-based.

### Lease expiration

The replicated state reducer checks existing holders against their lease duration when applying commands. Expired holders are removed during state application.

Distributed lease expiration uses `Date.now()` at apply-time.

## MONITORING

```ts
const stats = semaphore.stats();
```

Returns:

```ts
{
    active: number;
    queued: number;
    oldestWaitMs: number;
    limit: number;
}
```

In local mode, `queued` and `oldestWaitMs` reflect the actual waiting queue.

In distributed mode, `active` reflects the locally applied holder map, while `queued` and `oldestWaitMs` are returned as `0`.

## RAFT COMPACTION

When distributed mode is enabled, the constructor arms a periodic compaction interval.

`armCompaction()` invokes `raft.compact()` every 60 seconds, using `applyEntryPure()` as the state reducer and an empty holder map as the initial state.

## DESTROY

`destroy()` marks the semaphore as destroyed, rejects queued local acquisitions, clears their timeout timers, and clears active local permit lease timers.

Subsequent `acquire()` and `tryAcquire()` calls reject or throw with `SEMAPHORE destroyed`.


</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[TOMBSTONE_COMPACTOR]</span> </strong></summary>



Manages deletion tombstones, peer acknowledgment watermarks, and tombstone garbage collection.

The compactor tracks causal acknowledgment progress across peers and removes tombstones when their causal context has been acknowledged and their configured grace period has elapsed.

## TYPES

### `PeerWatermarkMap`

```ts
export type PeerWatermarkMap = Map<string, number>;
```

Maps peer node IDs to their sequence or logical clock watermarks.

### `TombstoneRecord`

```ts
export interface TombstoneRecord {
    id: string;
    deletedAt: number;
    causalContext: PeerWatermarkMap;
    generation: number;
}
```

| Property | Description |
|---|---|
| `id` | Entity identifier associated with the deletion. |
| `deletedAt` | Causal timestamp or logical clock value when deletion occurred. |
| `causalContext` | Snapshot of peer acknowledgment watermarks when the tombstone was recorded. |
| `generation` | Optional metadata or generation counter for tombstone validation. |

### `CompactionStats`

```ts
export interface CompactionStats {
    tombstonesRemoved: number;
    bytesReclaimedApprox: number;
    activeWatermark: number;
}
```

| Property | Description |
|---|---|
| `tombstonesRemoved` | Number of tombstones removed during compaction. |
| `bytesReclaimedApprox` | Approximate reclaimed memory footprint in bytes. |
| `activeWatermark` | Current global minimum peer watermark. |

## USAGE

```ts
const compactor = new TOMBSTONE_COMPACTOR(5000);

compactor.updatePeerWatermark('node-a', 120);
compactor.updatePeerWatermark('node-b', 115);

compactor.recordTombstone('entity-42', 100, 1);

const suppressed = compactor.isTombstoned('entity-42', Date.now());

const stats = compactor.compact(Date.now());
```

## API

### `TOMBSTONE_COMPACTOR`

**Constructor**

```ts
constructor(gcGracePeriodMs = 5000)
```

Configures the minimum grace period, in milliseconds, before acknowledged tombstones can be removed.

### Methods

| Method | Signature | Description |
|---|---|---|
| `updatePeerWatermark` | `(nodeId: string, watermark: number): void` | Registers or updates a peer's acknowledgment watermark and recalculates the global minimum. |
| `recordTombstone` | `(id: string, timestamp: number, generation = 1): void` | Records a deletion tombstone with a snapshot of current peer watermarks. |
| `isTombstoned` | `(id: string, currentTimestamp: number): boolean` | Checks whether an entity has a recorded tombstone. |
| `compact` | `(currentTimestamp: number): CompactionStats` | Removes tombstones satisfying acknowledgment and grace-period conditions. |
| `clear` | `(): void` | Clears tombstones, peer watermarks, and the global minimum watermark. |

## WATERMARK TRACKING

The compactor maintains:

- `tombstones`: Entity IDs mapped to their `TombstoneRecord`.
- `peerWatermarks`: Latest registered watermark for each peer.
- `globalMinWatermark`: Minimum watermark across registered peers.

`updatePeerWatermark()` updates the peer's value and recalculates the global minimum.

If no peer watermarks are registered, the global minimum is reset to `0`.

## TOMBSTONE RECORDING

`recordTombstone()` captures the current peer watermark map as the tombstone's causal context.

```ts
const causalContext = new Map(this.peerWatermarks);
```

The resulting record contains the entity ID, deletion timestamp, causal context, and generation.

Recording another tombstone for the same ID replaces its existing map entry.

## GLOBAL ACKNOWLEDGMENT

`isGloballyAcked()` checks the tombstone's causal context against the currently registered peer watermarks.

For every peer recorded in the causal context, its current watermark must be greater than or equal to the required watermark.

If no peers are registered, the method returns `false`.

## COMPACTION

`compact()` evaluates each recorded tombstone against two conditions:

1. **Global acknowledgment:** All peers represented in the tombstone's causal context have reached their required watermarks.
2. **Grace period:** The elapsed time since deletion is greater than or equal to `gcGracePeriodMs`.

When both conditions are satisfied, the tombstone is removed.

The approximate reclaimed footprint is calculated as:

```ts
id.length * 2 + 32
```

The method returns the number of removed tombstones, estimated reclaimed bytes, and current global minimum watermark.

## CLEAR

```ts
compactor.clear();
```

Resets all tracked state:

- Removes every tombstone.
- Removes every peer watermark.
- Resets `globalMinWatermark` to `0`.


</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[YMIR]</span> </strong></summary>


A generic server-state synchronization class that maintains local and server values, supports subscriptions, optimistic updates, retry handling, and configurable conflict resolution.

Successful writes update the local and server values, notify subscribers, and synchronize the resolved value through the staff SSE and messaging interfaces.

## USAGE

```ts
const ymir = new YMIR<User>(
    staff,
    'user:42',
    {
        conflictStrategy: 'server-wins',
        retry: {
            maxAttempts: 3,
            baseDelay: 1000,
            maxDelay: 10_000,
            backoff: 'exponential',
        },
    }
);

const unsubscribe = ymir.subscribe((value) => {
    console.log(value);
});

const result = await ymir.write(updatedUser, {
    optimistic: true,
    fetcher: saveUser,
});
```

## STATE

| Property | Type | Description |
|---|---|---|
| `serverValue` | `T \| null` | Last successfully received server value. |
| `localValue` | `T \| null` | Current local value. |
| `serverVersion` | `number` | Server version counter, initialized to `0`. |
| `staff` | `any` | Staff instance supplied to the constructor. |

## CONSTRUCTOR

```ts
constructor(
    staff: any,
    key: string,
    opts: YmirOptions<T> = {}
)
```

| Parameter | Description |
|---|---|
| `staff` | Staff instance providing SSE and messaging interfaces. |
| `key` | Synchronization key. |
| `opts` | Optional prefetch, retry, and conflict-resolution configuration. |

## API

| Method | Signature | Description |
|---|---|---|
| `subscribe` | `(fn: (value: T) => void): () => void` | Registers a value listener and returns an unsubscribe function. |
| `shouldPrefetch` | `(): boolean` | Checks whether the configured prefetch threshold has elapsed. |
| `write` | `(newValue: T, options: YmirWriteOptions<T>): Promise<T>` | Performs a server write with optional optimistic notification and retries. |

## SUBSCRIPTIONS

`subscribe()` registers a listener in the internal listener set.

```ts
const unsubscribe = ymir.subscribe((value) => {
    render(value);
});

// Remove the listener
unsubscribe();
```

Successful writes notify all registered listeners through the internal `notify()` method.

## PREFETCH

`shouldPrefetch()` determines whether enough time has elapsed since the last prefetch timestamp.

```ts
const shouldLoad = ymir.shouldPrefetch();
```

The threshold is configured through `opts.prefetchThreshold`.

Default:

```ts
30_000
```

## WRITE AND RETRY

`write()` accepts a new value and write options containing a fetcher.

```ts
await ymir.write(newValue, {
    optimistic: true,
    fetcher: async (value) => saveValue(value),
});
```

The write lifecycle:

1. Updates `localValue`.
2. Notifies subscribers immediately when `optimistic` is enabled.
3. Calls the supplied fetcher.
4. Resolves the local and server values using the configured conflict strategy.
5. Updates `localValue` and `serverValue`.
6. Notifies subscribers with the resolved value.
7. Calls `staff.sse.sseSet()` with the synchronization key and resolved value.
8. Sends the resolved value through `staff.send()`.

### Retry configuration

The retry behavior is controlled through `opts.retry`.

| Property | Default | Description |
|---|---:|---|
| `maxAttempts` | `3` | Maximum number of fetch attempts. |
| `baseDelay` | `1000` | Base retry delay in milliseconds. |
| `maxDelay` | `10000` | Maximum calculated delay. |
| `backoff` | `'exponential'` | Retry delay strategy. |

Supported backoff strategies:

| Strategy | Delay |
|---|---|
| `exponential` | `min(baseDelay * 2^attempt, maxDelay)` |
| `linear` | `min(baseDelay * (attempt + 1), maxDelay)` |
| Other values | `baseDelay` |

If all attempts fail, the last captured error is thrown. For non-optimistic writes, subscribers are notified with the existing server value when one is available.

## CONFLICT RESOLUTION

The private `resolve()` method selects the value returned after a successful fetch.

The strategy is configured through `opts.conflictStrategy`.

| Strategy | Behavior |
|---|---|
| `server-wins` | Returns the server value. |
| `client-wins` | Returns the local value. |
| `merge` | Calls `opts.mergeFn(local, server)` when provided. |
| `version` | Compares the configured version field and returns the value with the higher version. |

The default strategy is `server-wins`.

### Version strategy

The version field defaults to `version` and can be customized through `opts.versionField`.

```ts
const field = opts.versionField ?? 'version';

const localVersion = (local as any)[field] ?? 0;
const serverVersion = (server as any)[field] ?? 0;

return localVersion >= serverVersion ? local : server;
```

### Merge strategy

The merge strategy uses the supplied merge function:

```ts
opts.mergeFn(local, server)
```

## SYNCHRONIZATION

After a successful write, the resolved value is synchronized through two staff interfaces:

```ts
staff.sse.sseSet(key, resolved);

staff.send('[THE_WIZARD]', `sse:${key}`, {
    data: resolved,
});
```

The SSE key and messaging channel are derived from the constructor's `key`.


</details>

## DATE &  TIME
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[TEMPORAL_SHIFT]</span> </strong></summary>


A date and time utility module covering parsing, formatting, arithmetic, timezone conversion, natural-language dates, range operations, recurrence expansion, calendar calculations, and date-picker selection.

## Core Types

| Type | Definition / Purpose |
|---|---|
| `Unit` | `'millisecond' \| 'second' \| 'minute' \| 'hour' \| 'day' \| 'week' \| 'month' \| 'year'` |
| `Density` | `'minute' \| 'hour' \| 'day' \| 'week' \| 'month'` |
| `Mode` | `'single' \| 'multi' \| 'range' \| 'range-min' \| 'week' \| 'quarter' \| 'month' \| 'year'` |
| `Range` | `{ start: Date; end: Date }` |
| `RRuleOptions` | Recurrence frequency and optional interval, count, end date, weekday, and month-day filters |
| `RecurringEvent` | A `Range` with an `rrule` |
| `Conflict` | Two overlapping ranges and their overlap |
| `DateMatcher` | A date, date range, predicate, disabled-date configuration, or array of matchers |

### Recurrence Configuration

```ts
interface RRuleOptions {
  freq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval?: number
  count?: number
  until?: Date
  byDay?: number[]
  byMonthDay?: number[]
}

interface RecurringEvent extends Range {
  rrule: RRuleOptions
}
```

### Date Matching

`DateMatcher` supports:

- A specific `Date`.
- A `{ from, to? }` date range.
- A configuration containing `before`, `after`, `dayOfWeek`, `dates`, or `fn`.
- A predicate `(date: Date) => boolean`.
- Arrays of matchers.

## Parsing and Formatting

| Function | Description |
|---|---|
| `parse(input, tz?)` | Parses a string, timestamp, or `Date`; optionally shifts it into a timezone representation |
| `tryParse(input, tz?)` | Non-throwing variant of `parse`; returns `null` on failure |
| `format(date, template)` | Formats a date using the module's token system |
| `formatInTZ(date, template, tz)` | Formats an instant using wall-clock time in the specified timezone |
| `parseISO(str)` | Validates and parses an ISO 8601 string |
| `formatISO(date, opts?)` | Returns an ISO string, optionally date-only |
| `toLocalString(date, opts?, locale?)` | Formats a date using `Intl.DateTimeFormat` locale options |

### Format Tokens

| Token | Output |
|---|---|
| `YYYY` / `YY` | Four-digit / two-digit year |
| `MM` / `M` | Padded / unpadded month |
| `DD` / `D` | Padded / unpadded day |
| `HH` / `H` | 24-hour clock |
| `hh` / `h` | 12-hour clock |
| `mm` / `m` | Padded / unpadded minutes |
| `ss` | Seconds |
| `A` / `a` | AM / PM |
| `dd` | Two-letter weekday |
| `ddd` | Three-letter weekday |
| `dddd` | Full weekday |
| `MMM` | Three-letter month |
| `MMMM` | Full month |

Longer tokens are processed before shorter tokens.

### Built-in Format Presets

| Preset | Options |
|---|---|
| `full` | Short weekday, numeric year, short month, day, two-digit hour and minute |
| `dm` | Short month and day |
| `dmy` | Year, short month, and day |
| `dmyw` | Short weekday, year, short month, and day |
| `t` | Two-digit hour and minute |

## Date Arithmetic

| Function | Description |
|---|---|
| `add(date, amount, unit)` | Adds a specified amount of time |
| `sub(date, amount, unit)` | Subtracts a specified amount of time |
| `diff(a, b, unit)` | Calculates the difference between two dates in the requested unit |
| `startOf(date, unit)` | Returns the beginning of a minute, hour, day, week, or month |
| `endOf(date, unit)` | Returns the end of a minute, hour, day, week, or month |

`add` and `sub` return new `Date` instances. Calendar units use native date setters; millisecond through week arithmetic is performed through the corresponding date fields.

`diff` uses elapsed milliseconds for units through weeks. Month and year differences use calendar-field arithmetic.

## Timezone Operations

| Function | Description |
|---|---|
| `tzOffset(tz, date?)` | Returns the timezone offset in minutes |
| `toTZ(date, tz)` | Shifts a date so its UTC getters represent wall-clock time in the target timezone |
| `fromTZ(date, tz)` | Converts a shifted wall-clock representation back to an absolute instant |
| `localTZ()` | Returns the system's resolved timezone |

Timezone conversion uses `Intl.DateTimeFormat` rather than a Temporal dependency.

**Important:** `toTZ()` returns a shifted `Date`, not an ordinary instant representation. Read its fields using `getUTC*()` methods. Do not use local getters such as `getHours()` or `getDate()` on that result.

`formatInTZ()` handles this conversion and formatting in one call. `fromTZ()` performs two offset-resolution passes when converting back to an instant.

## Range and Conflict Operations

| Function | Description |
|---|---|
| `overlaps(a, b)` | Checks whether two ranges overlap |
| `getOverlap(a, b)` | Returns the overlapping range or `null` |
| `findConflicts(events)` | Finds all pairwise overlaps in an array of ranges |
| `isDateInRange(date, range)` | Checks whether a date falls within a range |

`overlaps()` uses exclusive boundaries: `a.start < b.end && a.end > b.start`.

`isDateInRange()` uses inclusive boundaries.

## Relative and Natural-Language Dates

| Function | Description |
|---|---|
| `relative(date, from?)` | Produces a compact relative-time label |
| `parseNatural(input, from?)` | Parses supported natural-language date expressions |
| `tryParseNatural(input, from?)` | Non-throwing variant returning `null` on failure |

### Relative-Time Output

`relative()` uses compact units:

- `just now`
- `5m ago`
- `2h ago`
- `3d ago`
- `2w ago`
- `4mo ago`
- `1y ago`
- `in 2h`

### Supported Natural-Language Expressions

Examples include:

```ts
parseNatural('today')
parseNatural('tomorrow')
parseNatural('yesterday')
parseNatural('now')

parseNatural('next week')
parseNatural('last week')
parseNatural('this month')
parseNatural('next quarter')

parseNatural('next monday')
parseNatural('next friday at 9am')

parseNatural('in 30 minutes')
parseNatural('in 2 days')
parseNatural('3 weeks ago')

parseNatural('at 9am')
parseNatural('at 14:30')

parseNatural('January 15')
parseNatural('15 Jan')
parseNatural('March 15th')
```

The optional `from` date provides the reference point for relative expressions. Time-only expressions roll forward to the following day when the resolved time has already passed relative to `from`.

If a supported expression does not match, `parseNatural()` falls back to native `Date` parsing before throwing.

## Recurrence and Scheduling

| Function | Description |
|---|---|
| `expandRecurring(event, viewStart, viewEnd)` | Expands a recurring event into ranges within a viewing window |
| `weekLoad(events, weekStart)` | Calculates total overlapping event duration in minutes |
| `snapToSlot(date, minutes)` | Rounds a date's minute field to the nearest slot |
| `durationLabel(ms)` | Formats a duration as minutes or hours and minutes |
| `isTravelDay(eventA, eventB)` | Checks whether events in different cities occur on the same day |

`expandRecurring()` supports daily, weekly, monthly, and yearly frequencies, with optional interval, count, end-date, weekday, and month-day constraints. Each generated occurrence preserves the original event duration.

## Date Comparisons and Calendar Calculations

| Function | Description |
|---|---|
| `isSameDay(a, b)` | Checks whether two dates share a calendar day |
| `isSameWeek(a, b)` | Checks whether two dates belong to the same Sunday-based week |
| `isSameMonth(a, b)` | Checks whether two dates share a month and year |
| `isSameHour(a, b)` | Checks whether two dates share a day and hour |
| `isSameMinute(a, b)` | Checks whether two dates share a day, hour, and minute |
| `isWeekend(date)` | Checks whether a date falls on Saturday or Sunday |
| `isLeapYear(year)` | Checks whether a year is a leap year |
| `daysInMonth(year, month)` | Returns the number of days in a month |
| `clamp(date, min, max)` | Constrains a date to the supplied bounds |
| `startOfDay(d)` | Returns the start of the date's local calendar day |
| `startOfMonth(d)` | Returns the first day of the month |
| `endOfMonth(d)` | Returns the last day of the month |
| `startOfWeek(d, weekStartsOn)` | Returns the start of a week using the specified weekday |
| `addDays(d, n)` | Adds calendar days |
| `addMonths(d, n)` | Adds calendar months |
| `subMonths(d, n)` | Subtracts calendar months |
| `diffDays(a, b)` | Returns the signed calendar-day difference |
| `getDaysBetween(a, b)` | Returns the absolute calendar-day difference |
| `getWeekNumber(d)` | Returns the ISO-style week number |
| `getWeekOfMonth(date, weekStartsOn?)` | Returns the date's week index within its month |
| `getDaysInWeek(date, weekStartsOn?)` | Returns the seven dates in a week |
| `getMonthName(date, locale?, format?)` | Returns a localized month name |
| `getDayName(date, locale?, format?)` | Returns a localized weekday name |
| `getWeekDays(weekStartsOn, locale)` | Returns localized short weekday labels |
| `getQuarter(date)` | Returns the zero-based quarter index |
| `quarterStart(year, quarter)` | Returns the first day of a quarter |
| `quarterEnd(year, quarter)` | Returns the last day of a quarter |
| `getLocaleWeekStart()` | Returns the inferred locale week-start day |

Weekday indexes use JavaScript's convention: Sunday is `0`, Saturday is `6`.

`getQuarter()` returns a zero-based index (`0`–`3`).

## Disabled-Date Matching

`matchesDisabled(d, matcher?)` evaluates whether a date matches a disabled-date rule.

Supported matcher forms:

```ts
type DateMatcher =
  | Date
  | { from: Date; to?: Date }
  | {
      before?: Date
      after?: Date
      dayOfWeek?: number[]
      dates?: Date[]
      fn?: (date: Date) => boolean
    }
  | ((date: Date) => boolean)
  | DateMatcher[]
```

Matcher arrays are evaluated recursively. A missing matcher returns `false`.

## Calendar Grid and Selection

| Function | Description |
|---|---|
| `getMonthGrid(month, weekStartsOn, fixedWeeks)` | Builds a calendar grid of seven-day rows |
| `sortDates(dates, order?)` | Returns a sorted copy of a date array |
| `resolveSelection(date, mode, current, min?, max?, excludeDisabled?, disabled?)` | Resolves a selection according to the requested mode |
| `isDaySelected(date, mode, selected)` | Checks whether a date is selected |
| `isRangeStart(date, mode, selected)` | Checks whether a date is the start of a selection |
| `isRangeEnd(date, mode, selected)` | Checks whether a date is the end of a selection |
| `isRangeMiddle(date, mode, selected)` | Checks whether a date falls inside a selected range |
| `defaultFormatters(locale)` | Creates default calendar display formatters |

### Selection Modes

| Mode | Selection result |
|---|---|
| `single` | A single `Date` |
| `multi` | An array of selected dates |
| `range` | `{ from: Date \| null; to: Date \| null }` |
| `range-min` | Range selection with a minimum-day constraint |
| `week` | A week range |
| `month` | A month range |
| `quarter` | A quarter range |
| `year` | A calendar-year range |

For `multi`, selecting an existing date removes it. The optional `max` limit prevents adding more dates once the maximum is reached.

For `week`, `excludeDisabled` filters disabled dates from the generated week before constructing the returned range.

For `range` and `range-min`, the first selection establishes the start. The next selection completes the range, reversing the endpoints when necessary. `range-min` uses `min` to enforce a minimum range length.

### Calendar Formatters

`defaultFormatters(locale)` returns:

```ts
{
  formatDay,
  formatWeekday,
  formatMonthCaption,
  formatYearCaption,
  formatWeekNumber
}
```

These provide localized weekday and month captions, numeric day and year labels, and stringified week numbers.

## Deprecated Compatibility Exports

| Export | Replacement |
|---|---|
| `buildMonth(year, month, weekStartsOn)` | `getMonthGrid(new Date(year, month, 1), weekStartsOn, true)` |
| `isDateDisabled` | `matchesDisabled` |

Both deprecated exports remain available for backward compatibility.


</details>

## DATABASES

 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[CACHE]</span> </strong></summary>

# `CACHE`

In-memory browser storage with serialized values, keyed access, batch operations, subscriptions, cross-tab synchronization, optional TTL cleanup, and asynchronous waiters.

## INSTANCE

```ts
export class CACHE
export const cache = new CACHE()
```

The exported `cache` is a shared `CACHE` instance.

## STORAGE

Values are stored in an internal `Map<string, string>` named `mem`. A separate `memory` map holds temporary runtime data, including pending waiters.

| Member | Description |
|---|---|
| `mem` | Serialized key-value storage |
| `memory` | Temporary runtime storage |
| `_channel` | Optional `BroadcastChannel` |
| `_localChange` | Local broadcast synchronization flag |
| `ttl_active` | Enables TTL timer refresh |
| `ttl_minutes` | TTL duration, default `10` minutes |
| `memoryTimer` | Optional cleanup timer |

When TTL is active, `touchMemory()` resets the timer. On expiration, both internal maps are cleared.

## SERIALIZATION

### `ser(value: unknown): string`

Serializes values into strings.

- Strings are returned unchanged.
- Other values use `JSON.stringify`.
- `Map` values are encoded with the `__type: 'Map'` marker and recursively serialized keys and values.
- `Set` values are encoded with the `__type: 'Set'` marker and recursively serialized entries.

### `deser(raw: string | null): any`

Deserializes stored values.

- `null` returns `null`.
- Encoded Maps and Sets are reconstructed.
- JSON values are parsed.
- Values that cannot be parsed are returned unchanged.

## MEMORY OPERATIONS

| Method | Description |
|---|---|
| `get(key)` | Retrieves and deserializes a value; returns `null` when unavailable |
| `getMany(keys)` | Retrieves multiple keys into a record |
| `set(key, value)` | Serializes and stores a value |
| `update(key, value)` | Updates an existing key |
| `setMany(entries)` | Stores multiple entries |
| `delete(key)` | Deletes a key |
| `deleteMany(keys)` | Deletes multiple keys |
| `has(key)` | Checks whether a key exists |
| `clear()` | Clears both internal maps and subscribers |

Storage operations are browser-only. On the server, reads return their empty or unavailable result and writes return without performing an operation.

`set` and `update` resolve any pending `waitFor` calls for the key before completing the write.

### Usage

```ts
await cache.set('user', { id: 1, name: 'Ada' })

const user = cache.get('user')

await cache.update('user', { id: 1, name: 'Grace' })

const entries = await cache.getMany(['user', 'settings'])

await cache.setMany({
    theme: 'dark',
    language: 'en'
})

await cache.delete('user')
await cache.deleteMany(['theme', 'language'])

const exists = cache.has('settings')
```

## SUBSCRIPTIONS

### `subscribe<T>(key: string, cb: (value: T) => void): () => void`

Subscribes to changes for a specific key.

- Registers the callback under the key.
- Immediately invokes it with the current value when one exists.
- Invokes subscribers when the key is set, updated, or deleted.
- Returns an unsubscribe function.
- Removes the key's subscriber set when its final subscriber is removed.

```ts
const unsubscribe = cache.subscribe<User>('user', (value) => {
    console.log(value)
})

await cache.set('user', { id: 1, name: 'Ada' })

unsubscribe()
```

Subscriber exceptions are caught and logged without interrupting other callbacks.

## WAITERS

### `waitFor<T>(key: string): Promise<T>`

Waits for a value to become available under a key.

- Immediately resolves if the key already has a value.
- Otherwise registers a resolver in the temporary `memory` map.
- Resolves when `set` or `update` writes the key.
- Multiple callers can wait for the same key.

```ts
const pending = cache.waitFor<User>('user')

await cache.set('user', { id: 1, name: 'Ada' })

const user = await pending
```

## CROSS-TAB SYNCHRONIZATION

When `BroadcastChannel` is available, the constructor creates a channel named `sauron_storage_sync`.

### `_broadcast(...)`

```ts
_broadcast(
    key: string,
    value: string,
    storageType: string,
    fn: string,
    path?: string,
    domain?: string,
    options?: any
): void
```

Broadcasts storage changes with the key, serialized value, storage type, operation, and optional metadata.

The channel listener processes messages with `storageType === 'mem'`:

- `fn === 'delete'` removes the key and emits `undefined`.
- Other operations update the stored serialized value and emit its deserialized value.

Messages are ignored when `_localChange` is set; the flag is then reset.

## LOCKING

### `_withLock<T>(key: string, fn: () => T | Promise<T>): Promise<T>`

Runs a storage operation under a browser lock when `navigator.locks` is available.

The lock name is `mem_write_${key}`. When the Lock API is unavailable, the callback executes directly.

`set`, `update`, and `delete` use this helper for their map mutations.

## INTERNAL METHODS

| Method | Description |
|---|---|
| `touchMemory()` | Resets the optional TTL cleanup timer |
| `_emit(key, value)` | Notifies subscribers for a key |
| `_peek(key)` | Reads and deserializes a key without the public `get` null fallback |

## USAGE SUMMARY

```ts
import { cache } from './cache'

// Store
await cache.set('session', { token: 'abc' })

// Read
const session = cache.get('session')

// Check
if (cache.has('session')) {
    // Key exists
}

// Subscribe
const unsubscribe = cache.subscribe('session', (value) => {
    console.log(value)
})

// Wait for a value
const nextSession = cache.waitFor('next-session')

// Delete
await cache.delete('session')

// Unsubscribe
unsubscribe()
```

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[COOKIE]</span> </strong></summary>

# `COOKIE`

Browser cookie storage with serialized values, configurable cookie attributes, in-memory caching, batch operations, subscriptions, cross-tab synchronization, optional TTL cleanup, and asynchronous waiters.

## INSTANCE

```ts
export class COOKIE
export const cookie = new COOKIE()
```

The exported `cookie` is a shared `COOKIE` instance.

## STORAGE

Cookie values are stored in the browser's `document.cookie` and cached in an internal `Map<S, unknown>` named `memory`.

| Member | Description |
|---|---|
| `memory` | In-memory cookie cache and temporary waiter storage |
| `_channel` | Optional `BroadcastChannel` |
| `_localChange` | Local broadcast synchronization flag |
| `ttl_active` | Enables TTL timer refresh |
| `ttl_minutes` | TTL duration, default `30` minutes |
| `memoryTimer` | Optional cleanup timer |
| `subscribers` | Per-key subscriber callbacks |

When TTL is active, `touchMemory()` resets the timer. On expiration, the in-memory map is cleared.

## SERIALIZATION

### `ser(value: unknown): string`

Serializes values into strings.

- Strings are returned unchanged.
- Other values use `JSON.stringify`.
- `Map` values are encoded with the `__type: 'Map'` marker and recursively serialized keys and values.
- `Set` values are encoded with the `__type: 'Set'` marker and recursively serialized entries.

### `deser(raw: string | null): any`

Deserializes stored values.

- `null` returns `null`.
- Encoded Maps and Sets are reconstructed.
- JSON values are parsed.
- Values that cannot be parsed are returned unchanged.

## COOKIE OPTIONS

Cookie-writing methods accept the following options:

| Option | Type | Description |
|---|---|---|
| `maxAge` | `number` | Cookie lifetime in seconds |
| `path` | `string` | Cookie path |
| `domain` | `string` | Cookie domain |
| `secure` | `boolean` | Adds the `Secure` attribute |
| `httpOnly` | `boolean` | Adds the `HttpOnly` attribute |
| `sameSite` | `'strict' \| 'lax' \| 'none'` | SameSite policy |

The raw cookie writer URL-encodes the key and serialized value, then appends the supplied attributes.

## COOKIE OPERATIONS

| Method | Description |
|---|---|
| `get(key)` | Retrieves and deserializes a cookie, using the memory cache when available |
| `getMany(keys)` | Retrieves multiple cookies into a record |
| `set(key, value, options?)` | Serializes and writes a cookie |
| `update(key, value, options?)` | Updates an existing cookie |
| `setMany(entries, options?)` | Writes multiple cookies |
| `delete(key, path?, domain?)` | Expires a cookie |
| `deleteMany(keys)` | Deletes multiple cookies |
| `has(key)` | Checks the memory cache and browser cookies |
| `clear()` | Expires cached cookies and clears memory and subscribers |

Storage operations are browser-only. On the server, reads return their empty or unavailable result and writes return without performing an operation.

`set` and `update` resolve pending `waitFor` calls for the key before completing the write.

### Usage

```ts
await cookie.set('session', { token: 'abc' }, {
    maxAge: 3600,
    path: '/',
    secure: true,
    sameSite: 'lax'
})

const session = cookie.get('session')

await cookie.update('session', { token: 'updated' })

const entries = await cookie.getMany(['session', 'settings'])

await cookie.setMany({
    theme: 'dark',
    language: 'en'
}, { maxAge: 86400 })

await cookie.delete('session')
await cookie.deleteMany(['theme', 'language'])
```

## SUBSCRIPTIONS

### `subscribe<T>(key: string, cb: (value: T) => void): () => void`

Subscribes to changes for a specific cookie key.

- Registers the callback under the key.
- Immediately invokes it with the current value when one exists.
- Invokes subscribers when the key is set, updated, or deleted.
- Returns an unsubscribe function.
- Removes the key's subscriber set when its final subscriber is removed.

```ts
const unsubscribe = cookie.subscribe<User>('session', (value) => {
    console.log(value)
})

await cookie.set('session', { name: 'Ada' })

unsubscribe()
```

Subscriber exceptions are caught and logged without interrupting other callbacks.

## WAITERS

### `waitFor<T>(key: string): Promise<T>`

Waits for a cookie value to become available.

- Immediately resolves if the key already has a value.
- Otherwise registers a resolver in the temporary memory map.
- Resolves when `set` or `update` writes the key.
- Multiple callers can wait for the same key.

```ts
const pending = cookie.waitFor<User>('session')

await cookie.set('session', { name: 'Ada' })

const session = await pending
```

## CROSS-TAB SYNCHRONIZATION

When `BroadcastChannel` is available, the constructor creates a channel named `sauron_storage_sync`.

### `_broadcast(...)`

```ts
_broadcast(
    key: string,
    value: string,
    storageType: string,
    fn: string,
    path?: string,
    domain?: string,
    options?: any
): void
```

Broadcasts cookie changes with the key, serialized value, storage type, operation, and optional cookie metadata.

The channel listener processes messages with `storageType === 'cookie'`:

- `fn === 'delete'` removes the key from memory and emits `undefined`.
- Other operations update the in-memory value and emit its deserialized value.

Messages are ignored when `_localChange` is set; the flag is then reset.

## LOCKING

### `_withLock<T>(key: string, fn: () => T | Promise<T>): Promise<T>`

Runs a cookie operation under a browser lock when `navigator.locks` is available.

The lock name is `cookie_write_${key}`. When the Lock API is unavailable, the callback executes directly.

`set`, `update`, and `delete` use this helper for their cookie and memory mutations.

## INTERNAL METHODS

| Method | Description |
|---|---|
| `touchMemory()` | Resets the optional TTL cleanup timer |
| `getCookieRaw(key)` | Reads and URL-decodes a raw browser cookie |
| `setCookieRaw(key, value, options?)` | Writes a URL-encoded cookie with its configured attributes |
| `_emit(key, value)` | Notifies subscribers for a key |
| `_peek(key)` | Reads the cached or browser cookie value |

## USAGE SUMMARY

```ts
import { cookie } from './cookie'

// Store
await cookie.set('session', { token: 'abc' }, {
    maxAge: 3600,
    path: '/',
    sameSite: 'lax'
})

// Read
const session = cookie.get('session')

// Check
if (cookie.has('session')) {
    // Cookie exists
}

// Subscribe
const unsubscribe = cookie.subscribe('session', (value) => {
    console.log(value)
})

// Wait for a value
const nextSession = cookie.waitFor('next-session')

// Delete
await cookie.delete('session')

// Unsubscribe
unsubscribe()
```

</details>

 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[GT]</span> </strong></summary>

# `GT`

Global runtime storage backed by `globalThis`, with typed serialization, keyed access, batch operations, subscriptions, cross-tab synchronization, optional TTL cleanup, and asynchronous waiters.

## INSTANCE

```ts
export class GT
export const gt = new GT()
```

The exported `gt` is a shared `GT` instance.

## STORAGE

Values are stored directly as properties on `globalThis`, using the supplied label as the property key.

| Member | Description |
|---|---|
| `ttl_minutes` | TTL duration, default `30` minutes |
| `ttl_active` | Enables TTL timer refresh |
| `_GT_SUBSCRIBERS` | Subscriber sets indexed by label |
| `_GT_MEMORY` | Serialized runtime values and pending waiters |
| `memory` | Temporary in-memory storage |
| `_waiters` | Waiter storage |
| `_channel` | Optional `BroadcastChannel` |
| `_localChange` | Local broadcast synchronization flag |
| `memoryTimer` | Optional cleanup timer |
| `_globalNotifyCache` | WeakMap-based notification cache |
| `_notifyCache` | WeakMap-based subscriber notification cache |

When TTL is active, `touchMemory()` resets the cleanup timer. On expiration, the internal `memory` map is cleared.

## SERIALIZATION

### `ser(value: U): S`

Recursively serializes values while preserving their types through explicit type markers.

| Value | Serialization marker |
|---|---|
| `Map` | `__type: 'Map'` |
| `Set` | `__type: 'Set'` |
| Array | `__type: 'Array'` |
| Object | `__type: 'Object'` |
| Primitive | `__type: 'Primitive'` |

Map keys and values, Set entries, array elements, and object properties are recursively serialized.

Primitive values, including strings, numbers, booleans, and `null`, are wrapped to preserve their original types.

### `deser<T, Z>(raw): A`

Reconstructs serialized values recursively.

- Maps are reconstructed as `Map` instances.
- Sets are reconstructed as `Set` instances.
- Arrays are reconstructed as arrays.
- Objects are reconstructed as objects with deserialized properties.
- Primitives return their original values.
- `null` and `undefined` are returned unchanged.
- Parsing failures return the original input.

## GLOBAL OPERATIONS

| Method | Description |
|---|---|
| `set(label, value)` | Assigns a value to `globalThis[label]` |
| `setMany(entries)` | Assigns multiple global values |
| `get(label)` | Retrieves a global value |
| `getMany(keys)` | Retrieves multiple global values into a record |
| `update(label, value)` | Updates an existing global property |
| `delete(label)` | Deletes a global property |
| `deleteMany(keys)` | Deletes multiple global properties |
| `has(label)` | Checks whether a global property exists |
| `clear()` | Deletes tracked global properties and clears internal subscriber and memory maps |

Operations that access global values are browser-only. On the server, reads return their unavailable result and writes return without performing an operation.

`set` and `update` resolve pending `waitFor` calls for the label before completing the write.

### Usage

```ts
await gt.set('APP_CONFIG', {
    theme: 'dark',
    enabled: true
})

const config = gt.get('APP_CONFIG')

await gt.update('APP_CONFIG', {
    theme: 'light',
    enabled: true
})

const values = await gt.getMany([
    'APP_CONFIG',
    'APP_STATE'
])

await gt.setMany({
    APP_THEME: 'dark',
    APP_LANGUAGE: 'en'
})

await gt.delete('APP_CONFIG')
```

## ASYNCHRONOUS ACCESS

### `getAsync(label: string): Promise<any>`

Retrieves a global value asynchronously.

- Returns the existing value immediately when it is not `undefined`.
- Otherwise waits for the label to receive a value through `waitFor`.

### `waitFor<T>(key: string): Promise<T>`

Waits for a global value to become available.

- Immediately resolves when the value already exists.
- Otherwise registers a resolver in `_GT_MEMORY`.
- Multiple callers can wait for the same key.
- Resolves when `set` or `update` writes the label.

```ts
const config = await gt.getAsync('APP_CONFIG')

// Alternatively
const pending = gt.waitFor<AppConfig>('APP_CONFIG')

await gt.set('APP_CONFIG', {
    theme: 'dark'
})

const value = await pending
```

## SUBSCRIPTIONS

### `subscribe<T>(label: string, cb: (value: T) => void): () => void`

Subscribes to changes for a global property.

- Registers the callback in `_GT_SUBSCRIBERS`.
- Immediately invokes it with the current value when one exists.
- Invokes subscribers when the label is set, updated, or deleted.
- Returns an unsubscribe function.
- Removes the label's subscriber set when its final subscriber is removed.

### `_emit(label: string, value: any): void`

Notifies all subscribers registered for a label.

Subscriber exceptions are caught and logged without interrupting other callbacks.

```ts
const unsubscribe = gt.subscribe<AppConfig>(
    'APP_CONFIG',
    (value) => {
        console.log(value)
    }
)

await gt.set('APP_CONFIG', {
    theme: 'dark'
})

unsubscribe()
```

## CROSS-TAB SYNCHRONIZATION

When `BroadcastChannel` is available, the constructor creates a channel named `sauron_storage_sync`.

### `_broadcast(...)`

```ts
_broadcast(
    key: string,
    value: any,
    storageType: string,
    fn: string,
    path?: string,
    domain?: string,
    options?: any
): void
```

Broadcasts global storage changes.

The channel listener handles messages with `storageType === 'gt'`:

- `fn === 'delete'` deletes the corresponding `globalThis` property, removes its memory entry, and emits `undefined`.
- `fn === 'set'` assigns the received value to `globalThis`, updates its memory entry, and emits the deserialized value.

Messages are ignored when `_localChange` is set; the flag is then reset.

## LOCKING

### `_withLock<T>(key: string, fn: () => T | Promise<T>): Promise<T>`

Runs a global storage mutation under a browser lock when `navigator.locks` is available.

The lock name is `gt_write_${key}`. When the Lock API is unavailable, the callback executes directly.

`set`, `update`, and `delete` use this helper for their global property mutations.

## INTERNAL METHODS

| Method | Description |
|---|---|
| `touchMemory()` | Resets the optional TTL cleanup timer |
| `_peek(label)` | Reads a global property without the public `get` fallback |
| `_emit(label, value)` | Notifies subscribers for a label |
| `_broadcast(...)` | Sends a cross-tab storage message |
| `_withLock(key, fn)` | Executes a mutation under a keyed browser lock |

## USAGE SUMMARY

```ts
import { gt } from './gt'

// Set a global value
await gt.set('APP_STATE', {
    initialized: true
})

// Read
const state = gt.get('APP_STATE')

// Check
if (gt.has('APP_STATE')) {
    // Global property exists
}

// Subscribe
const unsubscribe = gt.subscribe('APP_STATE', (value) => {
    console.log(value)
})

// Wait for a value
const pending = gt.getAsync('APP_CONFIG')

// Delete
await gt.delete('APP_STATE')

// Unsubscribe
unsubscribe()
```

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[IDB_KV]</span> </strong></summary>

# `INDEXED_DB`

IndexedDB storage wrapper with configurable database and object-store names, serialized values, asynchronous CRUD operations, in-memory caching, subscriptions, cross-tab synchronization, optional TTL cleanup, waiters, index management, cursor iteration, and database lifecycle controls.

## INSTANCE

```ts
export const isBrowser = typeof window !== 'undefined'

export class INDEXED_DB
export const indexed_db = new INDEXED_DB()
```

`indexed_db` is the exported shared instance.

## CONFIGURATION

### Constructor

```ts
constructor(
    k: A = '_DB_STORE_NAME_LAYER_',
    sl: A = '_DB_NAME_LAYER_',
    ms: A = '_HADRON_DISRUPTOR_',
    rt: A = '_THE_HADRON_PARTICLE_DISRUPTOR_SINULARITY_'
)
```

| Property | Default | Description |
|---|---|---|
| `k` | `'_DB_STORE_NAME_LAYER_'` | Object-store name |
| `sl` | `'_DB_NAME_LAYER_'` | Database name |
| `ms` | `'_HADRON_DISRUPTOR_'` | Stored configuration value |
| `rt` | `'_THE_HADRON_PARTICLE_DISRUPTOR_SINULARITY_'` | Stored configuration value |

The constructor assigns these values to the public `k`, `sl`, `ms`, and `rt` properties.

## STATE

| Member | Description |
|---|---|
| `rt` | Runtime configuration value |
| `ms` | Master configuration value |
| `sl` | Database name |
| `k` | Object-store name |
| `_db` | Active `IDBDatabase` instance or `null` |
| `_isOpen` | Database-open state |
| `memory` | Serialized in-memory cache and pending waiters |
| `_channel` | Optional `BroadcastChannel` |
| `_localChange` | Local broadcast synchronization flag |
| `subscribers` | Per-key subscriber callbacks |
| `ttl_active` | Enables TTL timer refresh |
| `ttl_minutes` | TTL duration, default `30` minutes |
| `memoryTimer` | Optional cleanup timer |

When TTL is active, `touchMemory()` resets the cleanup timer. On expiration, the in-memory map is cleared.

## SERIALIZATION

### `ser(value: unknown): string`

Serializes values into strings.

- Strings are returned unchanged.
- Other values use `JSON.stringify`.
- Maps are encoded with a `__type: 'Map'` marker and recursively serialized keys and values.
- Sets are encoded with a `__type: 'Set'` marker and recursively serialized entries.

### `deser(raw: string | null): any`

Deserializes stored values.

- `null` returns `null`.
- Encoded Maps and Sets are reconstructed.
- JSON values are parsed.
- Values that cannot be parsed are returned unchanged.

## DATABASE INITIALIZATION

### `open(__db = this._db): Promise<IDBDatabase>`

Opens the configured IndexedDB database.

- Reuses the supplied database when available.
- Opens the database using version `1`.
- Creates the configured object store when it does not exist.
- Updates `_db` and `_isOpen` after a successful open.
- Rejects when the IndexedDB request fails.

### `tx(mode: IDBTransactionMode): Promise<IDBObjectStore>`

Opens the database and returns an object store using the requested transaction mode.

### `req<T>(r: IDBRequest<T>): Promise<T>`

Converts an IndexedDB request into a Promise, resolving with its result or rejecting with its error.

## CORE CRUD

| Method | Description |
|---|---|
| `get(key)` | Retrieves and deserializes a value |
| `getMany(keys)` | Retrieves multiple keys into a record |
| `set(key, value)` | Serializes and stores a value |
| `update(key, value)` | Updates an existing key |
| `setMany(entries)` | Stores multiple entries |
| `delete(key)` | Deletes a stored key |
| `deleteMany(keys)` | Deletes multiple keys |
| `has(key)` | Checks whether a key exists |
| `clear()` | Clears the object store, memory cache, and subscribers |
| `keys()` | Retrieves all object-store keys |

Storage methods use the configured object store and IndexedDB transactions.

The `get` method checks the memory cache first, then reads from IndexedDB. Retrieved values are cached in serialized form.

`set` and `update` resolve pending `waitFor` calls for the key before completing the write.

### Usage

```ts
await indexed_db.set('user', {
    id: 1,
    name: 'Ada'
})

const user = await indexed_db.get('user')

await indexed_db.update('user', {
    id: 1,
    name: 'Grace'
})

const entries = await indexed_db.getMany([
    'user',
    'settings'
])

await indexed_db.setMany({
    theme: 'dark',
    language: 'en'
})

const exists = await indexed_db.has('user')

await indexed_db.delete('user')
await indexed_db.deleteMany(['theme', 'language'])
```

## SUBSCRIPTIONS

### `subscribe<T>(key: string, cb: (value: T) => void): () => void`

Subscribes to changes for a specific key.

- Registers the callback under the key.
- Immediately invokes it with the cached value when one exists.
- Invokes subscribers when the key is set, updated, or deleted.
- Returns an unsubscribe function.
- Removes the key's subscriber set when its final subscriber is removed.

### `_emit(key: string, value: any): void`

Notifies all subscribers registered for a key.

Subscriber exceptions are caught and logged without interrupting other callbacks.

```ts
const unsubscribe = indexed_db.subscribe<User>(
    'user',
    (value) => {
        console.log(value)
    }
)

await indexed_db.set('user', {
    id: 1,
    name: 'Ada'
})

unsubscribe()
```

## WAITERS

### `waitFor<T>(key: string): Promise<T>`

Waits for a value to become available under a key.

- Immediately resolves when the cached value already exists.
- Otherwise registers a resolver in the memory map.
- Multiple callers can wait for the same key.
- Resolves when `set` or `update` writes the key.

```ts
const pending = indexed_db.waitFor<User>('user')

await indexed_db.set('user', {
    id: 1,
    name: 'Ada'
})

const user = await pending
```

## CROSS-TAB SYNCHRONIZATION

When `BroadcastChannel` is available, the constructor creates a channel named `sauron_storage_sync`.

### `_broadcast(...)`

```ts
_broadcast(
    key: string,
    value: string,
    storageType: string,
    fn: string,
    path?: string,
    domain?: string,
    options?: any
): void
```

Broadcasts storage changes with the key, serialized value, storage type, operation, and optional metadata.

The channel listener processes messages with `storageType === 'idb'`:

- `fn === 'delete'` removes the key from memory and emits `undefined`.
- Other operations update the memory cache and emit the deserialized value.

Messages are ignored when `_localChange` is set; the flag is then reset.

## LOCKING

### `_withLock<T>(key: string, fn: () => T | Promise<T>): Promise<T>`

Runs a storage mutation under a browser lock when `navigator.locks` is available.

The lock name is `idb_write_${key}`. When the Lock API is unavailable, the callback executes directly.

`set`, `update`, and `delete` use this helper for their mutations.

## DATABASE LIFECYCLE

### `close(): void`

Closes the active database connection.

- Closes `_db` when a connection exists.
- Sets `_isOpen` to `false`.
- Resets `_db` to `null`.

### `isOpen(): boolean`

Returns the current `_isOpen` state.

### `getDatabaseInfo(): any`

Returns database information:

```ts
{
    isOpen: boolean,
    type: 'IndexedDB',
    sl: A,
    k: A,
    hasDb: boolean
}
```

## BULK RETRIEVAL

| Method | Return type | Description |
|---|---|---|
| `getAllItems()` | `Promise<Record<string, string>>` | Retrieves all keys and their values into a record |
| `getAllKeys()` | `Promise<string[]>` | Retrieves all object-store keys |
| `getAllValues()` | `Promise<string[]>` | Retrieves all object-store values |
| `count()` | `Promise<number>` | Returns the number of records in the object store |

These methods use IndexedDB's `getAllKeys`, `getAll`, and `count` requests.

## INDEX MANAGEMENT

### `createIndex(indexName, keyPath, options?)`

```ts
createIndex(
    indexName: string,
    keyPath: string,
    options?: IDBIndexParameters
): Promise<void>
```

Opens the database using version `2` and creates the specified index when it does not already exist.

### `deleteIndex(indexName)`

```ts
deleteIndex(indexName: string): Promise<void>
```

Opens the database using version `2` and deletes the specified index when it exists.

### INDEX QUERIES

| Method | Description |
|---|---|
| `getByIndex(indexName, value)` | Retrieves one record matching an index value |
| `getAllByIndex(indexName, value)` | Retrieves all records matching an index value |
| `getKeysByIndex(indexName, value)` | Retrieves all record keys matching an index value |

### Usage

```ts
await indexed_db.createIndex(
    'email',
    'email',
    { unique: true }
)

const user = await indexed_db.getByIndex(
    'email',
    'ada@example.com'
)

const users = await indexed_db.getAllByIndex(
    'role',
    'admin'
)

const userKeys = await indexed_db.getKeysByIndex(
    'role',
    'admin'
)

await indexed_db.deleteIndex('email')
```

## CURSOR ITERATION

### `iterateAll(callback): Promise<void>`

```ts
iterateAll(
    callback: (key: string, value: string) => void
): Promise<void>
```

Opens a read-only cursor over the object store.

For each record, the callback receives its key and value. Iteration continues until the cursor is exhausted, then the Promise resolves.

```ts
await indexed_db.iterateAll((key, value) => {
    console.log(key, value)
})
```

## INTERNAL METHODS

| Method | Description |
|---|---|
| `touchMemory()` | Resets the optional TTL cleanup timer |
| `open()` | Opens or reuses the database connection |
| `tx(mode)` | Creates a transaction and returns its object store |
| `req(request)` | Converts an IndexedDB request into a Promise |
| `_peek(key)` | Reads a cached value without accessing IndexedDB |
| `_emit(key, value)` | Notifies subscribers |
| `_broadcast(...)` | Sends a cross-tab storage message |
| `_withLock(key, fn)` | Executes a mutation under a keyed browser lock |

## USAGE SUMMARY

```ts
import { indexed_db } from './indexed_db'

// Store
await indexed_db.set('APP_STATE', {
    initialized: true
})

// Read
const state = await indexed_db.get('APP_STATE')

// Check
const exists = await indexed_db.has('APP_STATE')

// List keys
const keys = await indexed_db.keys()

// Count records
const total = await indexed_db.count()

// Subscribe
const unsubscribe = indexed_db.subscribe(
    'APP_STATE',
    (value) => {
        console.log(value)
    }
)

// Wait for a value
const pending = indexed_db.waitFor('APP_CONFIG')

// Close the database connection
indexed_db.close()

// Unsubscribe
unsubscribe()
```

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[KV_IDB]</span> </strong></summary>

# `IDB_KV`

Structured-clone IndexedDB key-value storage with transaction batching, SWR memory caching, in-flight request deduplication, write-through updates, HLC-based cross-tab synchronization, subscriptions, migrations, conflict resolution, and async cursor iteration.

## DESIGN

`IDB_KV` is built around eight design principles:

1. **Structured clone:** Native IndexedDB values without a JSON serialization round-trip. Supports native structured-clone types such as `Map`, `Set`, `Date`, and `Blob`.
2. **Transaction batching:** Operations queued within a microtask share one IndexedDB transaction.
3. **SWR memory cache:** In-memory caching, in-flight request deduplication, and write-through updates.
4. **Cross-tab synchronization:** BroadcastChannel messages coordinated using Hybrid Logical Clocks.
5. **Pub/sub:** Subscriptions return teardown functions and support integration with `onFlush`.
6. **Explicit versioning:** Migrations are registered through `defineMigration`.
7. **Async iteration:** Cursor results are exposed through an async iterator.
8. **Zero dependencies:** Browser and Bun/Node environments, with `fake-indexeddb` for Node testing.

## INSTANCE

```ts
export class INDEXED_DB
export const IDB_KV = new INDEXED_DB()
```

`IDB_KV` is the exported shared instance.

## TYPES

### `Teardown`

```ts
export type Teardown =
    | void
    | null
    | (() => void)
    | { unsubscribe(): void }
    | { [Symbol.dispose](): void }
    | Teardown[]
```

Represents a cleanup operation, supporting functions, unsubscribe objects, disposable objects, and nested teardown collections.

### `runTeardown(t: Teardown): void`

Executes teardown operations.

- Ignores `null` and `undefined`.
- Calls teardown functions directly.
- Recursively processes arrays.
- Calls `unsubscribe()` when available.
- Otherwise calls `[Symbol.dispose]()` when available.

### `reportError(e: unknown): void`

Reports errors through `globalThis.reportError` when available. Otherwise schedules the error to be thrown through `queueMicrotask`.

## CONFIGURATION

### `IndexedDbOptions`

The constructor accepts an `IndexedDbOptions` object.

| Option | Default | Description |
|---|---|---|
| `dbName` | `'the_wizard'` | IndexedDB database name |
| `storeName` | `'the_wizards_tardis'` | Object-store name |
| `version` | `1` | Initial database version |
| `nodeId` | Random generated ID | Node identifier used by HLC |
| `ttlMs` | `30 * 60 * 1000` | Memory cache TTL |
| `onFlush` | `queueMicrotask(fn)` | Schedules transaction flushing |
| `onError` | `reportError` | Handles subscriber and migration errors |

### Constructor

```ts
constructor(opts: IndexedDbOptions = {})
```

Initializes the database configuration, memory cache, transaction queue, subscribers, BroadcastChannel, and Hybrid Logical Clock.

The default BroadcastChannel name is:

```ts
`sauron_idb_sync:${dbName}:${storeName}`
```

## STATE

| Member | Description |
|---|---|
| `dbName` | Database name |
| `storeName` | Object-store name |
| `_version` | Configured database version |
| `_migrations` | Registered version migration functions |
| `_nodeId` | Local node identifier |
| `_hlc` | Hybrid Logical Clock instance |
| `_onFlush` | Transaction flush scheduler |
| `_onError` | Error handler |
| `_db` | Active database connection |
| `_opening` | Shared in-flight database-opening Promise |
| `memory` | SWR cache containing `EntryRecord` values |
| `inflight` | In-flight reads indexed by key |
| `ttlMs` | Memory cache lifetime |
| `pending` | Queued transaction operations |
| `flushScheduled` | Flush scheduling state |
| `_closed` | Lifecycle closed state |
| `subscribers` | Per-key subscriber callbacks |
| `_channel` | Optional BroadcastChannel |
| `_localChange` | Local broadcast synchronization flag |

## MIGRATIONS

### `defineMigration(version: N, fn: Migration): this`

Registers a migration function for a database version.

- Stores the migration under its version.
- Raises the configured database version when the supplied version is higher.
- Returns the current instance for chaining.

Migrations execute during `onupgradeneeded`, starting at `oldVersion + 1` and continuing through the configured version.

The configured object store is created when it does not already exist.

### Usage

```ts
const db = new INDEXED_DB({
    dbName: 'app',
    storeName: 'records'
})

db.defineMigration(2, (database, oldVersion) => {
    const store = database.objectStoreNames.contains('records')
        ? null
        : database.createObjectStore('records')
})

db.defineMigration(3, (database, oldVersion) => {
    const store = req.transaction!.objectStore('records')
})
```

## DATABASE OPENING

### `open(): Promise<IDBDatabase>`

Opens the configured IndexedDB database.

- Returns the existing connection when already open.
- Reuses `_opening` when an opening operation is already in progress.
- Rejects when `indexedDB` is unavailable.
- Runs registered migrations during upgrades.
- Clears `_opening` after success or failure.
- Closes the connection on version changes.
- Resets `_db` when the connection closes.

Concurrent callers share the same opening Promise.

## TRANSACTION BATCHING

Operations are queued in `pending` and flushed through the configured `_onFlush` scheduler.

### `scheduleFlush(): void`

Schedules a flush only when one is not already scheduled.

### `flush(): Promise<void>`

Processes the pending operations in a single read-write transaction.

Supported queued operations:

| Operation | IndexedDB request | Result |
|---|---|---|
| `get` | `store.get(key)` | Stored record value |
| `put` | `store.put(record, key)` | Updates cache, broadcasts, emits |
| `del` | `store.delete(key)` | Removes cache entry, broadcasts, emits |
| `has` | `store.getKey(key)` | Boolean existence result |
| `keys` | `store.getAllKeys()` | All keys |
| `clear` | `store.clear()` | Clears cache and broadcasts |
| `cursor` | `store.openCursor(range)` | Array of key-value pairs |

Each queued operation receives its own resolution or rejection callback.

A failed database open or transaction creation rejects the queued operations.

## RECORD STRUCTURE

Stored values use an `EntryRecord` containing:

| Field | Description |
|---|---|
| `value` | Structured-clone value |
| `hlc` | Hybrid Logical Clock timestamp |
| `nodeId` | Originating node identifier |
| `ts` | Local timestamp from `Date.now()` |

The HLC metadata supports cross-tab conflict ordering without relying solely on wall-clock timing.

## CORE CRUD

| Method | Description |
|---|---|
| `get<T = A>(key, chain?)` | Retrieves a cached or queued database value |
| `getOrThrow<T = A>(key, chain?)` | Retrieves a value or throws when the result is `undefined` |
| `has(key, chain?)` | Checks memory first, otherwise queues a database existence check |
| `set<T = A>(key, value, chain?)` | Updates memory immediately and queues a database write |
| `setMany(entries)` | Writes multiple entries |
| `update<T = A>(key, updater, chain?)` | Reads the previous value, applies an updater, and writes the result |
| `delete(key, chain?)` | Removes the memory entry and queues deletion |
| `deleteMany(keys)` | Deletes multiple keys |
| `clear(chain?)` | Clears memory and queues an object-store clear |
| `keys(chain?)` | Retrieves all stored keys |

Methods accepting `chain` pass their results through `MCR_Combo`.

### `get<T = A>(key: S, chain?: CHAIN)`

Checks the memory cache first.

- Returns `undefined` for an empty key.
- Returns the cached value when available.
- Otherwise queues a database read.
- Repeated in-flight reads for the same key share one Promise.

### `getOrThrow<T = A>(key: S, chain?: CHAIN)`

Uses `get` and throws when the immediate result is `undefined`.

### `set<T = A>(key: S, value: T, chain?: CHAIN)`

Performs a write-through memory update before queuing the database write.

The memory record receives an HLC timestamp, node ID, and local timestamp.

### `update<T = A>(key: S, updater: (prev: T | undefined) => T, chain?: CHAIN)`

Retrieves the previous value, passes it to the updater, stores the resulting value, and returns it through `MCR_Combo`.

### Usage

```ts
const db = IDB_KV

await db.set('user', {
    id: 1,
    name: 'Ada'
})

const user = await db.get<User>('user')

await db.update<User>('user', (previous) => ({
    ...previous,
    name: 'Grace'
}))

await db.setMany({
    theme: 'dark',
    language: 'en'
})

const exists = await db.has('user')

await db.delete('user')
await db.deleteMany(['theme', 'language'])

await db.clear()
```

## IN-FLIGHT DEDUPLICATION

### `_enqueueGet<T>(key: S)`

Queues a database read while deduplicating concurrent requests for the same key.

- Checks `inflight` for an existing Promise.
- Reuses the existing Promise when present.
- Otherwise queues one `get` operation.
- Removes the Promise from `inflight` when it settles.

### WRITE COALESCING

Multiple operations scheduled within the same flush window are collected in `pending` and submitted through one IndexedDB transaction.

This reduces transaction setup overhead compared with opening a separate transaction for every operation.

## PUB/SUB

### `subscribe<T = A>(key: S, cb: Subscriber<T>, chain?: CHAIN): Teardown`

Subscribes to changes for a key.

- Registers the callback in the key's subscriber set.
- Immediately invokes it with the cached value when available.
- Returns a teardown function.
- Removes the subscriber set when its final callback is removed.
- Routes callback errors through `_onError`.

### `select<T = A, S = A>(key, selector, cb, chain?): Teardown`

Creates a selector-based subscription.

The selector extracts a value from each update. The callback fires on the first notification and subsequently only when `Object.is` detects a changed selected value.

### `_emit(key: S, value: A): void`

Notifies all subscribers registered for a key.

### Usage

```ts
const unsubscribe = db.subscribe<User>(
    'user',
    (user) => {
        console.log(user)
    }
)

const unsubscribeName = db.select<User, string>(
    'user',
    (user) => user?.name,
    (name) => {
        console.log(name)
    }
)

runTeardown([unsubscribe, unsubscribeName])
```

## WAITERS

### `waitFor<T = A>(key: S, opts?: { timeoutMs?: number }): Promise<T>`

Waits for a value to become available.

- Immediately resolves when the memory cache already contains the key.
- Otherwise subscribes to the key.
- Ignores `undefined` notifications.
- Automatically unsubscribes after receiving a value.
- Supports an optional timeout.
- Rejects with a descriptive error when the timeout expires.

```ts
const user = await db.waitFor<User>('user', {
    timeoutMs: 5000
})
```

## ASYNC ITERATION

### `entries(range?: IDBKeyRange): AsyncIterableIterator<[string, A]>`

Exposes object-store cursor results through an async iterator.

The cursor is loaded into a buffer on the first `next()` call. Subsequent calls return buffered key-value pairs until iteration is complete.

```ts
for await (const [key, value] of db.entries()) {
    console.log(key, value)
}
```

An optional `IDBKeyRange` restricts the cursor results.

## CROSS-TAB SYNCHRONIZATION

Synchronization uses BroadcastChannel messages and Hybrid Logical Clock timestamps.

### Broadcast operations

| Method | Message type | Description |
|---|---|---|
| `_broadcastPut(key, rec)` | `put` | Broadcasts a stored record |
| `_broadcastDel(key)` | `del` | Broadcasts deletion |
| `_broadcastClear()` | `clear` | Broadcasts a store clear |

### `_onRemote(msg)`

Processes incoming messages.

**Put**

- Requires a record with an HLC timestamp.
- Updates the local HLC using the remote timestamp.
- Compares the local and remote HLC values when a local record exists.
- Retains the local record when its HLC is greater than or equal to the remote timestamp.
- Otherwise updates memory and emits the remote value.

**Delete**

- Removes the key from memory.
- Emits `undefined`.

**Clear**

- Clears the memory cache.
- Emits `undefined` under the special key `__clear__`.

## CONFLICT RESOLUTION

### `merge<T = A>(key: S, incoming: T, policy: ConflictResolver<T>): Promise<void>`

Merges an incoming value with the existing value using a supplied conflict resolver.

- Retrieves the local value.
- Stores the incoming value directly when no local value exists.
- Generates a new HLC timestamp.
- Passes both values and conflict metadata to the resolver.
- Stores the resolved value.

The resolver receives:

```ts
{
    key: string,
    localHlc: string,
    remoteHlc: string,
    nodeId: string
}
```

The policy determines the resulting value.

## MEMORY CACHE CONTROL

### `touchMemory(): void`

Resets the memory cleanup timer using `ttlMs`.

When the timer expires, the memory cache is cleared.

### `invalidateMemory(key?: S): void`

Forces subsequent reads to rehydrate from IndexedDB.

- With a key, removes only that cached entry.
- Without a key, clears the entire memory cache.

```ts
db.invalidateMemory('user')

// Invalidate everything
db.invalidateMemory()
```

## LIFECYCLE

### `close(): Promise<void>`

Closes the database wrapper.

- Sets `_closed` to `true`.
- Clears the memory timer.
- Closes the BroadcastChannel.
- Closes the active database connection.
- Resets `_db` to `null`.

### `isOpen(): boolean`

Returns whether `_db` currently contains an active database connection.

### `info(): Promise<{ isOpen: boolean; dbName: string; storeName: string; version: number; count: number }>`

Opens the database when necessary and returns its current configuration and record count.

## USAGE SUMMARY

```ts
import { IDB_KV } from './idb_kv'

// Write
await IDB_KV.set('APP_STATE', {
    initialized: true
})

// Read
const state = await IDB_KV.get('APP_STATE')

// Subscribe
const unsubscribe = IDB_KV.subscribe('APP_STATE', (value) => {
    console.log(value)
})

// Select a slice
const unsubscribeSelected = IDB_KV.select(
    'APP_STATE',
    (value) => value?.initialized,
    (initialized) => {
        console.log(initialized)
    }
)

// Wait for a value
const pending = IDB_KV.waitFor('APP_CONFIG')

// Iterate
for await (const [key, value] of IDB_KV.entries()) {
    console.log(key, value)
}

// Inspect
const info = await IDB_KV.info()

// Clean up
runTeardown([unsubscribe, unsubscribeSelected])

// Close
await IDB_KV.close()
```

</details>



 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[LOCAL STORAGE]</span> </strong></summary>

# `LS` — LocalStorage

Browser-based persistent key-value storage backed by `localStorage`, with an in-memory cache, serialization for `Map` and `Set`, cross-tab synchronization through `BroadcastChannel`, per-key write locking, subscriptions, and promise-based waiters.

## Export

```ts
export class LS
export const ls = new LS()
```

## Configuration and state

| Property | Description |
|---|---|
| `ttl_active` | Enables memory TTL refresh when accessed. Defaults to `false`. |
| `ttl_minutes` | Memory TTL duration in minutes. Defaults to `30`. |
| `memoryTimer` | Timer used to expire cached memory. |
| `memory` | In-memory cache of serialized values. |
| `_channel` | Optional `BroadcastChannel` instance. |
| `_localChange` | Tracks locally initiated channel changes. |
| `subscribers` | Per-key subscriber callbacks. |

When the TTL is active, `touchMemory()` resets the expiration timer. After the configured interval, it clears the memory cache and calls `localStorage.clear()`.

## Serialization

### `ser(value)`

Serializes values into strings.

- `Map` values are encoded as entries with the `__type: 'Map'` marker.
- `Set` values are encoded with the `__type: 'Set'` marker.
- Strings are returned unchanged.
- Other values use `JSON.stringify`.

### `deser(raw)`

Deserializes stored strings.

- Reconstructs `Map` and `Set` instances.
- Parses ordinary JSON values.
- Returns `null` for `null` input.
- Returns the original string if parsing fails.

## Storage API

| Method | Signature | Description |
|---|---|---|
| `get` | `get(key: string)` | Reads a value from memory or `localStorage`. |
| `getMany` | `getMany(keys: string[]): Promise<Record<string, any>>` | Reads multiple keys. |
| `set` | `set(key: string, value: string \| object)` | Serializes and stores a value. |
| `update` | `update(key: string, value: string \| object)` | Replaces an existing value. |
| `setMany` | `setMany(entries: Record<string, any>): Promise<void>` | Stores multiple entries. |
| `delete` | `delete(key: string)` | Removes a key. |
| `deleteMany` | `deleteMany(keys: string[])` | Removes multiple keys. |
| `has` | `has(key: string): boolean` | Checks whether a key exists. |
| `clear` | `clear()` | Clears local storage, memory, and subscribers. |

Writes use `_withLock()` when the browser supports `navigator.locks`, with a per-key lock name prefixed by `ls_write_`.

## Subscriptions

### `subscribe<T>(key, cb)`

Registers a callback for changes to a specific key.

```ts
const unsubscribe = ls.subscribe<User>('user', (value) => {
    console.log(value)
})

// Remove the subscription
unsubscribe()
```

If a current value is available, the callback is invoked immediately. Unsubscribing removes the callback and removes the key's subscriber set when empty.

### Change notifications

`_emit(key, value)` invokes registered callbacks after local `set`, `update`, and `delete` operations. Subscriber exceptions are caught and logged.

## Waiting for values

### `waitFor<T>(key)`

Returns a promise that resolves when the key receives a value.

```ts
const user = await ls.waitFor<User>('user')
```

If the key already has a value, the promise resolves immediately. Otherwise, its resolver is stored in the in-memory `__waiters_${key}` set and resolved by a subsequent `set` or `update`.

## Cross-tab synchronization

The constructor creates a `BroadcastChannel` named `sauron_storage_sync` when `BroadcastChannel` is available.

Messages are filtered by `storageType === 'ls'`.

| Operation | Remote behavior |
|---|---|
| `set` | Updates `localStorage` and the in-memory cache. |
| `delete` | Removes the key from `localStorage` and the in-memory cache. |

Local writes are broadcast through `_broadcast(key, value, storageType, fn)`. The `_localChange` flag is used to skip the corresponding locally initiated channel message.

## Usage

```ts
import { ls } from './local_storage'

// Store values
await ls.set('user', { id: 1, name: 'Alice' })
await ls.set('settings', new Map([
    ['theme', 'dark'],
]))

// Read values
const user = ls.get('user')
const settings = ls.get('settings')

// Check existence
if (ls.has('user')) {
    await ls.update('user', { id: 1, name: 'Bob' })
}

// Subscribe to changes
const unsubscribe = ls.subscribe('user', (value) => {
    console.log('User changed:', value)
})

// Remove values
await ls.delete('user')
unsubscribe()
```

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[REGISTRY]</span> </strong></summary>

# `REGISTRIES`

Named, isolated Sauron state registries backed by a shared `globalThis` registry collection. Each registry maintains its own state, key subscriptions, global subscriptions, and per-key batch queues.

## GLOBAL REGISTRY STORAGE

```ts
const REGISTRIES =
    (globalThis as any).__sauron_scoped_registries ??
    ((globalThis as any).__sauron_scoped_registries = {})
```

All registry instances are stored under `globalThis.__sauron_scoped_registries`.

Creating a registry with an existing name returns the existing instance rather than creating another store.

## EXPORTS

| Export | Description |
|---|---|
| `createRegistry(name?)` | Creates or retrieves a named registry. |
| `getRegistry(name)` | Retrieves a registry by name. |
| `getAllRegistries()` | Returns the global registry collection. |
| `getGR(label, registry)` | Retrieves a value from the imported global `state` using its label. |

## `createRegistry(name?)`

```ts
createRegistry(
    name: string = _bid.id()
): SauronState & {
    name: string
    destroy(): void
}
```

Creates an isolated registry with its own internal infrastructure.

Each instance maintains:

| Internal structure | Purpose |
|---|---|
| `_state` | Registry key-value storage |
| `_listeners` | Per-key subscriber sets |
| `_globalListeners` | Subscribers receiving all key changes |
| `_batches` | Keys currently undergoing batch operations |
| `_batchQueue` | Pending values for batched keys |
| `_batchOpts` | Pending options for batched keys |

The returned API exposes the following methods.

## REGISTRY API

### `get<T>(key): T | undefined`

Retrieves a value from the registry.

```ts
const value = registry.get<User>('user')
```

### `set<T>(key, value, opts?): void`

Stores a value or applies an updater function.

```ts
registry.set('count', 1)

registry.set<number>('count', (previous) =>
    (previous ?? 0) + 1
)
```

Options:

| Option | Type | Description |
|---|---|---|
| `triggerRender` | `boolean` | Optional render-related setting passed through the set operation. |

When the new value is `Object.is`-equal to the previous value, no update or notification occurs.

Otherwise, the registry:

1. Updates `_state`.
2. Notifies listeners registered for the key.
3. Notifies all global listeners.

### `delete(key): boolean`

Deletes a key and its pending batch value and options.

Returns `false` when the key does not exist. Otherwise, deletes it, notifies global listeners with `undefined`, and returns `true`.

### `getByPrefix<T>(prefix): { key: string; value: T }[]`

Returns entries whose string keys begin with the supplied prefix.

```ts
const entries = registry.getByPrefix<User>('user:')
```

### `getAll<T = any>(): Record<any, T>`

Returns all registry entries as an object.

### `subscribe<T>(key, listener): () => void`

Subscribes to changes for one key.

```ts
const unsubscribe = registry.subscribe<User>(
    'user',
    (value) => {
        console.log(value)
    }
)

unsubscribe()
```

Returns a cleanup function that removes the listener.

### `subscribeAll(listener): () => void`

Subscribes to changes across all keys.

The listener receives the changed key and its new value. Deletions are reported with `undefined`.

```ts
const unsubscribe = registry.subscribeAll((key, value) => {
    console.log(key, value)
})
```

### `batch(key, fn): void`

Batches updates for a specific key.

While the key is in `_batches`, calls to `set` calculate their next values but queue the final value and options instead of immediately updating state or notifying listeners.

After `fn` completes, the queued value is committed through `set`.

```ts
registry.batch('count', () => {
    registry.set<number>('count', 1)
    registry.set<number>('count', (previous) =>
        (previous ?? 0) + 1
    )
})
```

Only the final queued value and options for that key are committed.

### `clear(): void`

Clears the registry's internal state and infrastructure:

- `_state`
- `_listeners`
- `_globalListeners`
- `_batches`
- `_batchQueue`
- `_batchOpts`

### `destroy(): void`

Destroys the registry by calling `clear()` and removing its named entry from `REGISTRIES`.

## REGISTRY LOOKUP

### `getRegistry(name)`

Returns the registry stored under the supplied name.

```ts
const registry = getRegistry('APP_STATE')
```

### `getAllRegistries()`

Returns the complete shared registry collection.

```ts
const registries = getAllRegistries()
```

### `getGR(label, registry)`

Retrieves a value from the imported global `state` using `label`.

```ts
const value = getGR('APP_STATE', 'SAURON')
```

The `registry` argument is part of the function signature but is not used by the implementation.

## USAGE

```ts
import {
    createRegistry,
    getRegistry,
    getAllRegistries,
    getGR
} from './registries'

// Create an isolated registry
const registry = createRegistry('APP_STATE')

// Store and retrieve values
registry.set('count', 0)
registry.set<number>('count', (previous) =>
    (previous ?? 0) + 1
)

const count = registry.get<number>('count')

// Subscribe to a key
const unsubscribe = registry.subscribe<number>(
    'count',
    (value) => console.log(value)
)

// Subscribe to all changes
const unsubscribeAll = registry.subscribeAll(
    (key, value) => console.log(key, value)
)

// Batch updates
registry.batch('count', () => {
    registry.set('count', 10)
    registry.set('count', 20)
})

// Retrieve entries
const entries = registry.getByPrefix('user:')
const all = registry.getAll()

// Retrieve named registries
const existing = getRegistry('APP_STATE')
const registries = getAllRegistries()

// Global state lookup
const globalValue = getGR('APP_STATE', 'SAURON')

// Cleanup
unsubscribe()
unsubscribeAll()
registry.destroy()
```

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[SCOPED REGISTRY]</span> </strong></summary>

# `SCOPED REGISTRIES`

Creates completely isolated, independently managed Sauron state registries. Each scoped registry owns its state Map, key listeners, global listeners, and per-key batch queues.

Unlike the shared named registry collection, `createScopedReg` creates a new registry instance on every call and does not register it globally.

## EXPORTS

| Export | Description |
|---|---|
| `SauronRegistry` | Interface defining the scoped registry API. |
| `createScopedReg(name?)` | Creates an isolated registry instance. |

## `SauronRegistry`

Extends `SauronState` and defines the following API:

| Member | Signature | Description |
|---|---|---|
| `name` | `readonly string` | Diagnostic registry name. |
| `get<T>` | `(key: string \| symbol) => T \| undefined` | Reads a value. |
| `set<T>` | `(key, value, opts?) => void` | Writes a value or updater result. |
| `delete` | `(key: string \| symbol) => boolean` | Removes a key and reports whether it existed. |
| `getByPrefix<T>` | `(prefix: string) => { key: string; value: T }[]` | Retrieves entries with matching string-key prefixes. |
| `getAll<T>` | `() => Record<string \| symbol, T>` | Returns a snapshot of registry entries. |
| `subscribe<T>` | `(key, listener) => () => void` | Subscribes to one key. |
| `subscribeAll` | `(listener) => () => void` | Subscribes to all key changes. |
| `batch` | `(key, fn) => void` | Coalesces writes for one key. |
| `clear` | `() => void` | Clears state and listeners. |
| `destroy` | `() => void` | Clears the registry. |

## `createScopedReg(name?)`

```ts
createScopedReg(
    name: string = _bid.id()
): SauronRegistry
```

Creates a new registry with an automatically generated diagnostic name unless one is supplied.

Each instance maintains independent internal structures:

| Internal structure | Purpose |
|---|---|
| `_state` | Key-value state stored in a `Map`. |
| `_listeners` | Per-key subscriber sets. |
| `_batches` | Keys currently undergoing batch operations. |
| `_batchQueue` | Pending values for batched keys. |
| `_batchOpts` | Pending options for batched keys. |
| `_globalListeners` | Subscribers receiving changes across all keys. |

## STATE OPERATIONS

### `get<T>(key)`

Returns the value associated with a string or symbol key, or `undefined` when absent.

### `set<T>(key, value, opts?)`

Accepts either a direct value or an updater function receiving the previous value.

```ts
registry.set('count', 1)

registry.set<number>('count', (previous) =>
    (previous ?? 0) + 1
)
```

Options:

| Option | Type | Description |
|---|---|---|
| `triggerRender` | `boolean` | Optional render-related setting. |

If the new value is `Object.is`-equal to the previous value, no state update or notification occurs.

Otherwise, the registry updates its state and notifies:

1. Listeners subscribed to the specific key.
2. All global listeners.

Listener errors are caught and logged with the registry name.

### `delete(key)`

Removes the key and its pending batch value and options.

Returns `true` when the key existed and `false` otherwise.

When a key is deleted, global listeners receive the key and `undefined`. Per-key listeners are not notified.

### `getByPrefix<T>(prefix)`

Returns entries whose keys are strings beginning with the supplied prefix. Symbol keys are excluded.

```ts
const users = registry.getByPrefix<User>('user:')
```

### `getAll<T>()`

Returns the registry entries as an object snapshot.

## SUBSCRIPTIONS

### `subscribe<T>(key, listener)`

Registers a listener for one key and returns an unsubscribe function.

```ts
const unsubscribe = registry.subscribe<User>(
    'user',
    (value) => {
        console.log(value)
    }
)

unsubscribe()
```

When the final listener is removed, its key is removed from the internal listener map.

### `subscribeAll(listener)`

Registers a listener for all key changes.

The callback receives:

```ts
(key: string | symbol, value: unknown) => void
```

Updates provide the new value; deletions provide `undefined`.

```ts
const unsubscribe = registry.subscribeAll((key, value) => {
    console.log(key, value)
})
```

## BATCHING

### `batch(key, fn)`

Coalesces multiple `set` calls for the same key into one committed update.

During the batch:

- The key is marked as active in `_batches`.
- Each `set` calculates its next value using the current stored state.
- The latest calculated value and options replace the previous queued values.
- No state update or listener notification occurs until the batch commits.

After `fn` completes, the queued value is committed through `registry.set()`.

```ts
registry.batch('count', () => {
    registry.set('count', 1)
    registry.set('count', 2)
    registry.set('count', 3)
})
```

The final queued value is committed once, producing one update and notification cycle.

## LIFECYCLE

### `clear()`

Clears all internal state and subscriptions:

- `_state`
- `_listeners`
- `_batches`
- `_batchQueue`
- `_batchOpts`
- `_globalListeners`

### `destroy()`

Calls `registry.clear()`.

Unlike the globally named registry implementation, this scoped registry does not maintain a global registry collection or remove itself from one.

## USAGE

```ts
import { createScopedReg } from './scoped_registries'

// Create independent registries
const appRegistry = createScopedReg('APP')
const userRegistry = createScopedReg('USERS')

// Store values
appRegistry.set('count', 0)
userRegistry.set('current', {
    id: 1,
    name: 'Alice'
})

// Read values
const count = appRegistry.get<number>('count')
const user = userRegistry.get<User>('current')

// Subscribe
const unsubscribe = userRegistry.subscribe<User>(
    'current',
    (value) => console.log(value)
)

// Observe all changes
const unsubscribeAll = appRegistry.subscribeAll(
    (key, value) => console.log(key, value)
)

// Batch updates
appRegistry.batch('count', () => {
    appRegistry.set('count', 10)
    appRegistry.set('count', 20)
})

// Retrieve entries
const entries = userRegistry.getByPrefix('user:')
const snapshot = userRegistry.getAll()

// Cleanup
unsubscribe()
unsubscribeAll()

appRegistry.destroy()
userRegistry.destroy()
```

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[SESSION STORAGE]</span> </strong></summary>



# `SESSION` & `SESSION_STATE`

Session-backed browser storage and scoped reactive state management. The module provides a `SESSION` storage adapter, nested registry maps, persistent-key support, subscriptions, batched updates, and convenience functions for accessing scoped state.

## REGISTRY CONSTANTS

| Constant | Value |
|---|---|
| `ROOT_REG` | `'__THE_WIZARD_REG__'` |
| `MASTER_REG` | `'__SAURON__'` |
| `SLAVE_REG` | `'__STATE__'` |

These constants identify the default root, master, and slave registry levels.

## `SESSION`

Browser `sessionStorage` adapter with an in-memory cache, serialization, cross-context synchronization, subscriptions, and asynchronous storage operations.

```ts
export class SESSION
export const session = new SESSION()
```

### Storage behavior

- Uses `sessionStorage` as its persistent backing store for the current browser session.
- Maintains a `Map<string, unknown>` memory cache.
- Supports recursive serialization and deserialization of `Map` and `Set` values.
- Uses `BroadcastChannel('sauron_storage_sync')` for cross-context synchronization.
- Identifies its broadcast messages with `storageType: 'ss'`.
- Uses a generated `_echoId` to ignore messages originating from the same instance.
- Uses `navigator.locks` with the `ss_write_${key}` lock name when available.
- Provides optional memory-cache expiration through `ttl_active` and `ttl_minutes` (default: 30 minutes).

### Methods

| Method | Description |
|---|---|
| `get(key)` | Retrieves and deserializes a value, checking memory before `sessionStorage`. |
| `getMany(keys)` | Retrieves multiple keys into a record. |
| `set(key, value)` | Serializes and stores a value, updates waiters, broadcasts the change, and emits to subscribers. |
| `update(key, value)` | Updates an existing key and emits the resulting value. |
| `setMany(entries)` | Stores multiple key/value entries. |
| `delete(key)` | Removes a key from storage and memory, broadcasts deletion, and emits `undefined`. |
| `deleteMany(keys)` | Removes multiple keys. |
| `subscribe(key, cb)` | Subscribes to changes for one key and returns an unsubscribe function. |
| `clear()` | Clears session storage while preserving the value stored under `ROOT_REG`; clears memory and subscribers. |
| `has(key)` | Checks whether a key exists in memory or session storage. |
| `waitFor<T>(key, timeoutMs?)` | Resolves when a value is written, or rejects when the timeout expires. |
| `ser(value)` | Serializes supported values. |
| `deser(raw)` | Deserializes stored values. |
| `_broadcast(...)` | Publishes a storage change through the broadcast channel. |

### Serialization

`Map` and `Set` values are represented using tagged JSON structures. Nested entries and values are recursively serialized.

- Strings are stored unchanged.
- Other values are serialized with `JSON.stringify`.
- `deser` reconstructs tagged `Map` and `Set` values.
- Values that cannot be parsed as JSON are returned as their original strings.

### Waiting for values

```ts
const value = await session.waitFor<MyType>('ready', 30_000)
```

`waitFor` first checks the current value. If it is `undefined`, it registers a waiter under `__waiters_${key}`. A subsequent `set` resolves registered waiters. The default timeout is 30 seconds.

### Subscriptions

```ts
const unsubscribe = session.subscribe<MyType>('user', value => {
    // Handle updated value
})

unsubscribe()
```

A subscription immediately receives the current value when `_peek` returns something other than `undefined`. Local writes and received broadcast messages notify subscribers.

---

## `getNestedStoreMap`

Retrieves or creates a nested `Map` inside the session-backed root registry.

```ts
export function getNestedStoreMap<K, V>(
    sl_reg: any = SLAVE_REG,
    ms_reg: any = MASTER_REG,
    globalKey: any = ROOT_REG
): Map<K, V>
```

The nested structure is:

```text
ROOT_REG
└── MASTER_REG
    └── SLAVE_REG
        └── Map<K, V>
```

Each level is created when it does not already exist. The returned map is the storage location used by the scoped session store.

---

## `session_store`

Low-level scoped storage operations backed by `getNestedStoreMap`.

```ts
export const session_store
```

### Methods

| Method | Description |
|---|---|
| `get<T>(key, opts?)` | Reads a scoped value, falling back to its persistent copy when the key is marked for persistence. |
| `set<T>(key, value, opts?)` | Writes a value or updater result and notifies key listeners when `triggerRender` is enabled. |
| `subscribe<T>(key, listener, opts?)` | Registers a listener for a key and returns an unsubscribe function. |
| `delete(key, opts?)` | Deletes the scoped value and its persistent copy when applicable; notifies and removes key listeners. |
| `entries<T>(opts?)` | Returns all entries in the selected scoped map. |
| `persist(key, opts?)` | Marks a key for persistent-value handling. |
| `unpersist(key, opts?)` | Removes the persistence marker and stored persistent copy. |
| `has(key, opts?)` | Checks the scoped map and eligible persistent storage. |
| `clear(opts?)` | Clears scoped state and its key listeners. |
| `clearPersistent(opts?)` | Clears persistent values and persistence markers. |

### Persistent keys

Persistence is managed through two additional scoped maps:

- `${sl_reg}_PERSISTENT` stores persistent values.
- `${sl_reg}_PERSIST_KEYS` records keys marked for persistence.

Calling `persist(key)` marks the key. Subsequent `set` calls also update its persistent copy. `get` checks that copy when the regular scoped state does not contain the key.

---

## `getScopedStateMetadata`

Retrieves or initializes metadata associated with a scoped registry.

```ts
export function getScopedStateMetadata(
    sl_reg: any = SLAVE_REG,
    ms_reg: any = MASTER_REG,
    globalKey: any = ROOT_REG
)
```

The metadata is stored under `${sl_reg}_META` in the selected master map.

| Field | Type | Purpose |
|---|---|---|
| `_batches` | `Set<string \| symbol>` | Keys currently being batched. |
| `_batchQueue` | `Map<string \| symbol, any>` | Queued values for batched keys. |
| `_batchOpts` | `Map<string \| symbol, { triggerRender?: boolean }>` | Queued update options. |
| `_globalListeners` | `Set<(key, value) => void>` | Listeners receiving changes across keys. |
| `_waiters` | `Map<string \| symbol, Set<(value) => void>>` | Waiter collections. |

---

## `session_state`

Higher-level scoped state API built on `session_store` and `getScopedStateMetadata`.

```ts
export const session_state
```

### Methods

| Method | Description |
|---|---|
| `get<T>(key, opts?)` | Reads a scoped value. |
| `set<T>(key, value, opts?)` | Writes a value or updater result, with optional render notifications. |
| `delete(key, opts?)` | Deletes a value and notifies global listeners when it existed. |
| `getByPrefix<T>(prefix, opts?)` | Returns string-keyed entries beginning with the supplied prefix. |
| `getAll<T>(opts?)` | Returns a record containing all scoped entries. |
| `subscribe<T>(key, listener, opts?)` | Subscribes to changes for one key. |
| `subscribeAll(listener, opts?)` | Subscribes to changes across all keys in the selected scope. |
| `batch(key, fn, opts?)` | Coalesces multiple writes to the same key into one final write. |
| `clear(opts?)` | Clears scoped state and its batch metadata and global listeners. |

### Update behavior

`set` accepts either a direct value or an updater function:

```ts
session_state.set('count', 1)

session_state.set<number>('count', prev => (prev ?? 0) + 1)
```

The default `triggerRender` value is `true`. When enabled, the underlying store notifies key listeners and `session_state` notifies global listeners with the final value.

### Batching

```ts
session_state.batch('count', () => {
    session_state.set('count', 1)
    session_state.set('count', 2)
    session_state.set('count', 3)
})
```

Writes to the batched key are queued. After the callback completes, the queued value is written once through `session_store.set`.

---

## Type definitions

### `ScopeOptions`

```ts
export interface ScopeOptions {
    sl_reg?: any
    ms_reg?: any
    globalKey?: any
}
```

Selects the slave, master, and root registry levels for scoped operations.

### `OptimisticHookState`

```ts
export interface OptimisticHookState {
    previousValue: any
    isPending: boolean
}
```

### `SStorageContext<T>`

```ts
export interface SStorageContext<T = any> {
    id: string
    DefaultValue?: T
    Provider?: any
    sl_reg?: string
    ms_reg?: string
    globalKey?: string
}
```

### `SStorageState`

```ts
export interface SStorageState {
    get<T>(key: string, opts?: ScopeOptions): T | undefined
    set<T>(
        key: string,
        value: T | ((prev: T | undefined) => T),
        opts?: { triggerRender?: boolean } & ScopeOptions
    ): void
    delete(key: string, opts?: ScopeOptions): boolean
    getByPrefix<T>(
        prefix: string,
        opts?: ScopeOptions
    ): { key: string; value: T }[]
    getAll<T = any>(opts?: ScopeOptions): Record<string, T>
    subscribe<T>(
        key: string,
        listener: (value: T) => void,
        opts?: ScopeOptions
    ): () => void
    subscribeAll(
        listener: (key: string, value: any) => void,
        opts?: ScopeOptions
    ): () => void
    batch(
        key: string,
        fn: () => void,
        opts?: ScopeOptions
    ): void
    clear(opts?: ScopeOptions): void
}
```

### `SauronContext<T>`

```ts
export interface SauronContext<T> {
    id: string
    DefaultValue?: T
    Provider?: any
    sl_reg?: string
    ms_reg?: string
    globalKey?: string
}
```

### `SauronState`

```ts
interface SauronState {
    get<T>(key: string | symbol, opts?: ScopeOptions): T | undefined
    set<T>(
        key: string | symbol,
        value: T | ((prev: T | undefined) => T),
        opts?: { triggerRender?: boolean } & ScopeOptions
    ): void
    delete(key: string | symbol, opts?: ScopeOptions): boolean
    getByPrefix<T>(
        prefix: string,
        opts?: ScopeOptions
    ): { key: string; value: T }[]
    getAll<T = any>(opts?: ScopeOptions): Record<string | symbol, T>
    subscribe<T>(
        key: string | symbol,
        listener: (value: T) => void,
        opts?: ScopeOptions
    ): () => void
    subscribeAll(
        listener: (key: string | symbol, value: any) => void,
        opts?: ScopeOptions
    ): () => void
    clear(opts?: ScopeOptions): void
    waitFor<T = any>(
        key: string | symbol,
        opts: ScopeOptions
    ): Promise<T>
    batch?(key: any, fn: () => void): void
}
```

---

## Convenience functions

The module exposes short-form functions that delegate to `session_state`.

| Function | Description |
|---|---|
| `publishSSC(key, value, opts?)` | Publishes a value through `session_state.set`. |
| `subscribeSSC<T>(key, listener, opts?)` | Subscribes to a key. |
| `getAllSSC<T>(opts?)` | Retrieves all values in a scope. |
| `setSSC<T>(label, value, triggerRender?, sl_reg?, ms_reg?, globalKey?)` | Sets a labeled value. |
| `getSSC<T>(label, sl_reg?, ms_reg?, globalKey?)` | Retrieves a labeled value. |
| `subSSC<T>(label, fn, sl_reg?, ms_reg?, globalKey?)` | Subscribes to a labeled value. |
| `deleteSSC(label, sl_reg?, ms_reg?, globalKey?)` | Deletes a labeled value. |
| `subAllSSC(fn, sl_reg?, ms_reg?, globalKey?)` | Subscribes to all changes in a scope. |

### Examples

```ts
// Write and read scoped state
setSSC('user', { id: 1, name: 'User' })

const user = getSSC<{ id: number; name: string }>('user')

// Subscribe to a value
const unsubscribe = subSSC('user', user => {
    console.log(user)
})

// Subscribe to all changes
const unsubscribeAll = subAllSSC((key, value) => {
    console.log(key, value)
})

// Delete a value
deleteSSC('user')

// Direct scoped access
session_state.set('count', 1, {
    sl_reg: 'COUNTER',
    ms_reg: 'APP'
})
```



</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[STATE]</span> </strong></summary>



# `BYTE_ID`, `STORE` & `STATE`

Global in-memory identifier generation and scoped state management. The module provides a shared numeric ID counter, nested `Map`-based storage, persistent-key handling, per-key subscriptions, global subscriptions, and batched state updates.

## `BYTE_ID`

Lightweight ID generator using a shared `Uint32Array` counter and an epoch value to extend the counter across 32-bit rollover.

```ts
class BYTE_ID
export const _bid = new BYTE_ID()
```

### Properties

| Property | Type | Description |
|---|---|---|
| `MAX_PENDING` | `number` | Maximum pending-operation capacity: `4096`. |
| `sentTimestamps` | `Float64Array` | Preallocated timestamp storage with `MAX_PENDING` entries. |
| `pendingResolvers` | `Array` | Preallocated resolver array with `MAX_PENDING` entries. |
| `cursor` | `number` | Public cursor, initially `0`. |

### Methods

| Method | Description |
|---|---|
| `id()` | Generates a string ID using the shared global counter and instance epoch. |
| `_sid()` | Returns the result of `id()`. |

### ID format

```text
epoch:counter
```

The counter is stored on `globalThis._sauronIdCounter` as a `Uint32Array(1)`. Each call increments the shared counter. When the counter wraps to zero, the instance's `epoch` increments.

```ts
const id = _bid.id()
const sid = _bid._sid()
```

---

## Registry constants

| Constant | Value |
|---|---|
| `ROOT_STATE_REG` | `'__ROOT_STATE_REG__'` |
| `MASTER_STATE_REG` | `'__MASTER_STATE_REG__'` |
| `SLAVE_STATE_REG` | `'__SLAVE_STATE_REG__'` |

These constants define the default root, master, and slave levels of the global state registry.

## `ScopeOptions`

```ts
interface ScopeOptions {
    sl_reg?: any
    ms_reg?: any
    globalKey?: any
}
```

Selects the registry scope used by storage and state operations.

---

## `getStateStoreMap`

Retrieves or creates a nested `Map` in the global registry.

```ts
export function getStateStoreMap<K, V>(
    sl_reg: any = SLAVE_STATE_REG,
    ms_reg: any = MASTER_STATE_REG,
    globalKey: any = ROOT_STATE_REG
): Map<K, V>
```

The registry hierarchy is:

```text
globalThis[ROOT_STATE_REG]
└── MASTER_STATE_REG
    └── SLAVE_STATE_REG
        └── Map<K, V>
```

Each level is initialized when missing. The resulting map is shared through the corresponding `globalThis` registry property.

---

## `store`

Low-level state storage backed by nested `Map` instances.

```ts
export const store
```

### Methods

| Method | Description |
|---|---|
| `get<T>(key, opts?)` | Retrieves a value from scoped state, restoring it from persistent storage when marked for persistence. |
| `set<T>(key, value, opts?)` | Stores a direct value or updater result and optionally notifies key listeners. |
| `subscribe<T>(key, listener, opts?)` | Registers a key listener and returns an unsubscribe function. |
| `delete(key, opts?)` | Removes a value and its persistence metadata when applicable; notifies and removes key listeners. |
| `entries<T>(opts?)` | Returns all entries in the selected scoped state map. |
| `persist(key, opts?)` | Marks a key for persistent-value handling. |
| `unpersist(key, opts?)` | Removes the persistence marker and stored persistent value. |
| `has(key, opts?)` | Checks the scoped state and eligible persistent storage. |
| `clear(opts?)` | Clears scoped state and its key listeners. |
| `clearPersistent(opts?)` | Clears persistent values and persistence markers. |

### Value updates

`set` accepts either a direct value or an updater function:

```ts
store.set('count', 1)

store.set<number>('count', prev => (prev ?? 0) + 1)
```

Updates use `Object.is` to skip unchanged values. When a value changes, the store:

1. Writes the new value to the scoped state map.
2. Updates its persistent copy if the key is marked for persistence.
3. Notifies key listeners when `triggerRender` is enabled.

`triggerRender` defaults to `true`.

### Persistent values

Persistence uses two additional maps within the selected scope:

| Map | Purpose |
|---|---|
| `${sl_reg}_PERSISTENT` | Stores persistent copies of values. |
| `${sl_reg}_PERSIST_KEYS` | Tracks keys marked for persistence. |

Calling `persist(key)` marks a key. Subsequent writes update its persistent copy. If the regular state map no longer contains the key, `get` can restore the value from the persistent map and repopulate the regular state map.

---

## `SauronState`

Public state interface implemented by the exported `state` object.

```ts
export interface SauronState {
    get<T>(
        key: string | symbol,
        opts?: ScopeOptions
    ): T | undefined

    set<T>(
        key: string | symbol,
        value: T | ((prev: T | undefined) => T),
        opts?: { triggerRender?: boolean } & ScopeOptions
    ): void

    delete(
        key: string | symbol,
        opts?: ScopeOptions
    ): boolean

    getByPrefix<T>(
        prefix: string,
        opts?: ScopeOptions
    ): { key: string; value: T }[]

    getAll<T = any>(
        opts?: ScopeOptions
    ): Record<string | symbol, T>

    subscribe<T>(
        key: string | symbol,
        listener: (value: T) => void,
        opts?: ScopeOptions
    ): () => void

    subscribeAll(
        listener: (key: string | symbol, value: any) => void,
        opts?: ScopeOptions
    ): () => void

    batch(
        key: string | symbol,
        fn: () => void,
        opts?: ScopeOptions
    ): void

    clear(opts?: ScopeOptions): void
}
```

---

## `getContextStateMetadata`

Retrieves or initializes metadata for a scoped state registry.

```ts
export function getContextStateMetadata(
    sl_reg: any = SLAVE_STATE_REG,
    ms_reg: any = MASTER_STATE_REG,
    globalKey: any = ROOT_STATE_REG
)
```

Metadata is stored in the master registry under `${sl_reg}_META`.

| Field | Type | Purpose |
|---|---|---|
| `_batches` | `Set<string \| symbol>` | Tracks keys currently being batched. |
| `_batchQueue` | `Map<string \| symbol, any>` | Holds queued values for batched keys. |
| `_batchOpts` | `Map<string \| symbol, { triggerRender?: boolean }>` | Holds queued update options. |
| `_globalListeners` | `Set<(key, value) => void>` | Holds listeners subscribed to all changes in the scope. |

---

## `state`

High-level scoped state API built on `store` and `getContextStateMetadata`.

```ts
export const state: SauronState
export default state
```

### Methods

| Method | Description |
|---|---|
| `get<T>(key, opts?)` | Retrieves a value from the selected scope. |
| `set<T>(key, value, opts?)` | Writes a value or updater result and notifies scoped global listeners. |
| `delete(key, opts?)` | Deletes a value and notifies global listeners when the key existed. |
| `getByPrefix<T>(prefix, opts?)` | Returns string-keyed entries beginning with the supplied prefix. |
| `getAll<T>(opts?)` | Returns all scoped entries as a record. |
| `subscribe<T>(key, listener, opts?)` | Subscribes to changes for one key. |
| `subscribeAll(listener, opts?)` | Subscribes to changes across all keys in the selected scope. |
| `batch(key, fn, opts?)` | Coalesces multiple writes to one key into a final write. |
| `clear(opts?)` | Clears scoped state, batch metadata, and global listeners. |

### Global subscriptions

`subscribeAll` registers a listener in the scope's `_globalListeners` set. The listener receives the changed key and its resulting value. Deletions are reported with `undefined`.

```ts
const unsubscribe = state.subscribeAll((key, value) => {
    console.log(key, value)
})

unsubscribe()
```

### Batched updates

```ts
state.batch('count', () => {
    state.set('count', 1)
    state.set('count', 2)
    state.set('count', 3)
})
```

While the key is in a batch, `set` queues the calculated value and update options instead of writing immediately. After the callback completes, the queued value is written once through `store.set`.

---

## Convenience functions

The module also exports direct functions that delegate to `state`.

| Function | Description |
|---|---|
| `publish(key, value, opts?)` | Publishes a value through `state.set`. |
| `subscribe<T>(key, listener, opts?)` | Subscribes to a key. |
| `getAll<T>(opts?)` | Retrieves all values in a scope. |
| `set<T>(label, value, triggerRender?, sl_reg?, ms_reg?, globalKey?)` | Sets a labeled value. |
| `get<T>(label, sl_reg?, ms_reg?, globalKey?)` | Retrieves a labeled value. |
| `subcribe<T>(label, fn, sl_reg?, ms_reg?, globalKey?)` | Subscribes to a labeled value. |
| `del(label, sl_reg?, ms_reg?, globalKey?)` | Deletes a labeled value. |
| `subAll(fn, sl_reg?, ms_reg?, globalKey?)` | Subscribes to all changes in a scope. |

### Usage

```ts
// Set and retrieve values
set('user', { id: 1, name: 'User' })

const user = get<{ id: number; name: string }>('user')

// Subscribe to a specific key
const unsubscribe = subscribe('user', value => {
    console.log(value)
})

// Subscribe to every key change
const unsubscribeAll = subAll((key, value) => {
    console.log(key, value)
})

// Delete a value
del('user')

// Use a custom scope
state.set('count', 1, {
    sl_reg: 'COUNTER',
    ms_reg: 'APP'
})
```



</details>


## ENCRYPTION


 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[CRYPTO]</span> </strong></summary>



# `DISRUPTOR_CRYPTO`

Cross-runtime cryptographic utility providing serialization, secure random generation, hashing, key derivation, authenticated encryption, key-pair generation, and binary encoding.

The implementation supports Web Crypto and Node.js crypto providers, selecting the available implementation for each operation.

## Class

```ts
export class DISRUPTOR_CRYPTO
```

## Runtime capabilities

| Capability | Web Crypto | Node.js Crypto |
|---|---|---|
| Random bytes | `crypto.getRandomValues` | `randomBytes` |
| HMAC-SHA256 | Async | Sync and async |
| SHA-256 | Async | Sync and async |
| HKDF-SHA256 | Async | Async |
| AES-256-GCM | Async | Async and sync |
| PBKDF2-SHA256 | — | Sync |
| Ed25519 key generation | — | Sync |
| ML-KEM-768 key generation | — | Sync |
| Encoding | Native browser APIs | Buffer |

### Runtime properties

| Property | Description |
|---|---|
| `hasNode` | Indicates whether the runtime exposes Node.js process information. |
| `_hasSubtle` | Indicates whether Web Crypto subtle operations and `getRandomValues` are available. |
| `_nodeCrypto` | Cached Node.js crypto module reference. |
| `_hmacCache` | Map used to hold HMAC results for the synchronous path when Web Crypto is the only available option. |

`ready()` reports whether Web Crypto subtle functionality or a Node.js crypto provider is available.

---

## Serialization

### `ser(value)`

```ts
ser(value: unknown): string
```

Serializes values into strings.

- Strings are returned unchanged.
- Other values are serialized using `JSON.stringify`.
- `Map` values use a tagged `{ __type: "Map", value }` representation.
- `Set` values use a tagged `{ __type: "Set", value }` representation.
- Nested map keys, values, and set entries are recursively serialized.

### `deser(raw)`

```ts
deser(raw: string | null): any
```

Deserializes serialized values.

- `null` returns `null`.
- Tagged maps are reconstructed as `Map` instances.
- Tagged sets are reconstructed as `Set` instances.
- Other valid JSON is parsed.
- Parsing failures return the original string.

---

## Random bytes

### `random_bytes(size?)`

```ts
random_bytes(size = 32): Uint8Array
```

Generates random bytes using the available provider:

1. Web Crypto `getRandomValues`.
2. Node.js `randomBytes`.
3. A `Math.random` fallback when neither provider is available.

The fallback is explicitly not cryptographically secure. The implementation comments specify that the bus must refuse authentication initialization without real randomness.

---

## HMAC-SHA256

### `hash_hmac_hex_async(secret, data)`

```ts
async hash_hmac_hex_async(
    secret: string | Uint8Array,
    data: string | Uint8Array
): Promise<string>
```

Computes an HMAC-SHA256 digest asynchronously.

- Accepts strings or byte arrays for both arguments.
- Uses Web Crypto when available.
- Falls back to Node.js `createHmac`.
- Returns the digest as hexadecimal.
- Returns an empty string when neither provider is available.

### `hash_hmac_hex(secret, data)`

```ts
hash_hmac_hex(
    secret: string | Uint8Array,
    data: string | Uint8Array
): string
```

Computes HMAC-SHA256 synchronously using Node.js crypto. Throws when Node.js crypto is unavailable.

### `hash_hmac(secret, data)`

```ts
hash_hmac(
    secret: string | Uint8Array,
    data: string | Uint8Array
): string
```

Synchronous alias for `hash_hmac_hex`.

---

## SHA-256

### `hash_sha256_hex(data)`

```ts
async hash_sha256_hex(
    data: string | Uint8Array
): Promise<string>
```

Computes SHA-256 asynchronously using Web Crypto or Node.js crypto. Returns hexadecimal output, or an empty string when neither provider is available.

### `hash_sha256(data)`

```ts
hash_sha256(data: string | Uint8Array): string
```

Computes SHA-256 synchronously using Node.js crypto. Throws when Node.js crypto is unavailable.

---

## Key derivation

### `derive_hkdf(ikm, salt, info, length?)`

```ts
async derive_hkdf(
    ikm: Uint8Array,
    salt: Uint8Array,
    info: Uint8Array,
    length = 32
): Promise<Uint8Array>
```

Derives key material using HKDF-SHA256.

- Accepts input key material, salt, and context information as byte arrays.
- Defaults to a 32-byte output.
- Uses Web Crypto `deriveBits` or Node.js `hkdfSync`.
- Returns a zero-filled byte array of the requested length when neither provider is available.

### `derive_key(password, salt, iterations?, length?)`

```ts
derive_key(
    password: string,
    salt: Uint8Array,
    iterations = 310_000,
    length = 32
): Uint8Array
```

Derives key material using PBKDF2-SHA256 through Node.js crypto.

- Default iteration count: `310_000`.
- Default output length: `32` bytes.
- Throws when Node.js crypto is unavailable.

---

## AES-GCM encryption

### `encrypt_aes_gcm(key, iv, data)`

```ts
async encrypt_aes_gcm(
    key: Uint8Array,
    iv: Uint8Array,
    data: Uint8Array
): Promise<Uint8Array>
```

Encrypts byte data using AES-GCM.

- Uses Web Crypto or Node.js `createCipheriv`.
- Node.js output appends the authentication tag to the ciphertext to match Web Crypto's output format.
- Returns the original data when neither provider is available.

### `decrypt_aes_gcm(key, iv, ct)`

```ts
async decrypt_aes_gcm(
    key: Uint8Array,
    iv: Uint8Array,
    ct: Uint8Array
): Promise<Uint8Array>
```

Decrypts AES-GCM ciphertext.

- Uses Web Crypto or Node.js `createDecipheriv`.
- Node.js extracts the final 16 bytes as the authentication tag.
- Returns the original ciphertext when neither provider is available.

### `symmetric_encrypt(p, key)`

```ts
symmetric_encrypt(
    p: string,
    key: Uint8Array
): {
    ciphertext: string
    nonce: string
}
```

Synchronous Node.js AES-256-GCM encryption.

- Requires a 32-byte key.
- Generates a random 12-byte nonce.
- Encrypts UTF-8 plaintext.
- Appends the authentication tag to the ciphertext.
- Returns Base64-encoded ciphertext and nonce.

### `symmetric_decrypt(p, key)`

```ts
symmetric_decrypt(
    p: { ciphertext: string; nonce: string },
    key: Uint8Array
): string
```

Synchronous Node.js AES-256-GCM decryption.

- Requires a 32-byte key.
- Decodes the ciphertext and nonce from Base64.
- Validates the 12-byte nonce and minimum 16-byte authentication tag.
- Verifies the authentication tag during decryption.
- Returns the decrypted UTF-8 string.

---

## Key-pair generation

### `generate_key_pair(_type)`

```ts
generate_key_pair(_type: string): {
    publicKey: Uint8Array
    secretKey: Uint8Array
}
```

Generates an Ed25519 key pair using Node.js crypto.

- Public key is exported in DER/SPKI format.
- Private key is exported in DER/PKCS8 format.
- Both are returned as `Uint8Array` values.

The `_type` parameter is accepted but the implementation generates Ed25519 keys.

### `pqc_generate_KEM_keys()`

```ts
pqc_generate_KEM_keys(): {
    publicKey: Uint8Array
    secretKey: Uint8Array
    algorithm: string
}
```

Generates an ML-KEM-768 key pair using Node.js crypto.

- Public key is exported in DER/SPKI format.
- Private key is exported in DER/PKCS8 format.
- Returns the algorithm identifier `"ML-KEM-768"`.
- Requires a Node.js crypto provider supporting `ml-kem-768`.

---

## Encoding utilities

| Method | Signature | Description |
|---|---|---|
| `to_utf8_bytes` | `(str: string): Uint8Array` | Encodes a string as UTF-8 bytes. |
| `to_hex` | `(data: Uint8Array): string` | Encodes bytes as hexadecimal. |
| `from_hex` | `(hex: string): Uint8Array` | Decodes hexadecimal into bytes. |
| `to_base64` | `(data: Uint8Array): string` | Encodes bytes as Base64. |
| `from_base64` | `(str: string): Uint8Array` | Decodes Base64 into bytes. |

Encoding selects the available implementation:

- UTF-8 uses `TextEncoder`, then Node.js `Buffer`, then a byte-level fallback.
- Hex and Base64 use Node.js `Buffer` when available.
- Browser environments use manual hexadecimal conversion and `btoa`/`atob` for Base64.

---

## Internal byte and provider utilities

| Method | Description |
|---|---|
| `_buf(bytes)` | Copies bytes into a `Uint8Array` backed by a new `ArrayBuffer`. |
| `_getNodeCrypto()` | Lazily loads and caches `node:crypto` when running in Node.js. |
| `ready()` | Reports whether Web Crypto subtle functionality or Node.js crypto is available. |

The `_getNodeCrypto` method returns the cached provider when already loaded, returns `null` outside Node.js, and catches module-loading failures.

---

## Secure comparison

### `secure_equal(a, b)`

```ts
secure_equal(a: Uint8Array, b: Uint8Array): boolean
```

Compares two byte arrays without returning early on the first differing byte.

The comparison incorporates the length difference and iterates through the maximum input length, treating missing bytes as zero.



</details>

## HTTP

 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[HTTP_CLIENT]</span> </strong></summary>

# `HTTP_CLIENT`

A zero-dependency HTTP client built on the Fetch API. Provides Axios-style request methods, interceptors, request deduplication, retry policies, timeout and cancellation handling, response caching, circuit breakers, request/response transformations, validation, and download progress reporting.

## EXPORTS

| Export | Description |
|---|---|
| `RequestConfig` | Request configuration interface |
| `HTTP_CLIENT` | HTTP client implementation |

The implementation also defines internal `HttpError` and `InterceptorManager<T>` classes.

## REQUEST CONFIGURATION

`RequestConfig` extends `RequestInit`, excluding its native `headers` property and defining a `HeadersInit` replacement.

| Property | Type | Description |
|---|---|---|
| `url` | `string` | Request URL |
| `baseURL` | `string` | Base URL for relative request URLs |
| `method` | `string` | HTTP method |
| `headers` | `HeadersInit` | Request headers |
| `params` | `Record<string, unknown>` | Query parameters |
| `timeout` | `number` | Request timeout in milliseconds |
| `retry` | `axiosRetryConfig \| false` | Retry configuration or disabled retries |
| `dedupe` | `boolean` | Enables request deduplication; defaults to `true` |
| `tag` | `string` | Cancellation-group identifier |
| `revalidate` | `boolean` | Enables ETag-based conditional requests |
| `_retryAttempt` | `number` | Internal retry-attempt field |
| `cache` | `'force-cache' \| 'no-cache' \| 'default'` | Cache mode |
| `cacheTTL` | `number` | TTL cache duration in milliseconds |
| `circuit_breaker` | `{ failureThreshold: number; timeout: number }` | Circuit-breaker configuration |
| `retry_strategy` | `'exponential-backoff' \| 'linear' \| 'fixed'` | Retry delay strategy |
| `retry_delay` | `number` | Linear or fixed retry delay |
| `signal` | `AbortSignal` | Caller-provided cancellation signal |
| `circuit_breaker_key` | `string` | Circuit-breaker instance key |
| `validate_response` | `(data: any) => boolean` | Response validation after parsing |
| `validate` | `(data: unknown) => boolean` | Response validation during parsing |
| `onDownloadProgress` | `(loaded: number, total: number \| null) => void` | Download progress callback |
| `interceptors_request` | `(config: RequestConfig) => RequestConfig \| Promise<RequestConfig>` | Per-request configuration interceptor |
| `interceptors_response` | `(error: any) => any \| Promise<any>` | Per-request error recovery interceptor |
| `transform_request` | `(data: any) => any` | Request-body transformation |
| `transform_response` | `(data: any) => any` | Parsed response transformation |
| `validate_status` | `(status: number) => boolean` | Custom HTTP status acceptance |
| `on_progress` | `(progress: { loaded: number; total: number \| null; percentage: number }) => void` | Structured download progress callback |

Other standard `RequestInit` properties are available through the interface extension.

## INITIALIZATION

```ts
const api = new HTTP_CLIENT({
    baseURL: 'http://localhost:3000/',
    timeout: 10_000,
    retry: {
        attempts: 3,
        retryOn: [429, 502, 503, 504],
    },
});
```

Defaults:

| Setting | Default |
|---|---|
| `method` | `'GET'` |
| `baseURL` | `'http://localhost:3000/'` |
| `timeout` | `10_000` |
| `dedupe` | `true` |

`create(config)` creates another `HTTP_CLIENT`, merging the current defaults with the supplied configuration.

## HTTP METHODS

| Method | Signature |
|---|---|
| `get` | `get<T>(url, config?)` |
| `post` | `post<T>(url, body?, config?)` |
| `put` | `put<T>(url, body?, config?)` |
| `patch` | `patch<T>(url, body?, config?)` |
| `delete` | `delete<T>(url, config?)` |
| `head` | `head<T>(url, config?)` |
| `request` | `request<T>(config)` |

Each method returns a `Promise<HttpResponse<T>>`.

```ts
const response = await api.get('/users', {
    params: {
        active: true,
    },
});

const created = await api.post('/users', {
    name: 'User',
});
```

### Request bodies

`post`, `put`, and `patch` serialize request bodies through `serializeBody`:

- `null` and `undefined` produce no body.
- `FormData`, `Blob`, and strings are passed through.
- Other values are JSON-serialized.
- JSON requests receive `Content-Type: application/json` when no content type is already present.
- `transform_request` can transform the body before serialization.

## INTERCEPTORS

The client exposes separate request and response interceptor managers:

```ts
api.interceptors.request.use(
    (config) => {
        config.headers = new Headers(config.headers);
        config.headers.set('Authorization', `Bearer ${getToken()}`);
        return config;
    },
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        throw error;
    },
);
```

`InterceptorManager<T>` provides:

| Method | Description |
|---|---|
| `use(fulfilled, rejected?)` | Registers an interceptor and returns its numeric ID |
| `eject(id)` | Removes an interceptor by ID |
| `run(value)` | Runs fulfilled handlers sequentially |
| `runError(error)` | Runs rejection handlers until one recovers or all fail |

Request interceptors run before request deduplication and execution. The optional `interceptors_request` configuration callback runs afterward.

On request failure, the optional `interceptors_response` callback runs before the response interceptor manager. A recovered value is returned when truthy.

## REQUEST DEDUPLICATION

GET requests are deduplicated by default.

The deduplication key combines the request method and resolved URL. Concurrent matching requests reuse the same in-flight promise.

```ts
const first = api.get('/users');
const second = api.get('/users');

const [a, b] = await Promise.all([first, second]);
```

Set `dedupe: false` to disable this behavior for an individual request.

## RETRY POLICIES

Retries can be disabled, configured with an object, or specified as a numeric attempt count.

```ts
const response = await api.get('/data', {
    retry: {
        attempts: 3,
        retryOn: [408, 429, 500, 502, 503, 504],
        base: 300,
        factor: 2,
        max: 8000,
    },
    retry_strategy: 'exponential-backoff',
});
```

Default retry configuration:

| Property | Default |
|---|---:|
| `attempts` | `3` |
| `retryOn` | `408, 429, 500, 502, 503, 504` |
| `base` | `300` ms |
| `factor` | `2` |
| `max` | `8000` ms |

Supported strategies:

| Strategy | Delay |
|---|---|
| `exponential-backoff` | Randomized exponential delay, capped by `max` |
| `linear` | `retry_delay * (attempt + 1)` |
| `fixed` | Constant `retry_delay` |

The exponential strategy uses `axioscomputeBackoff`. Linear and fixed strategies default to a `retry_delay` of `300` ms.

Retries are applied to configured HTTP status failures and network or timeout failures. Explicit caller cancellation is not retried.

## CACHING AND REVALIDATION

Two in-memory caches are maintained:

- `ttlCache`: stores response bodies with expiration timestamps.
- `etagCache`: stores ETags and response bodies for conditional requests.

### TTL cache

```ts
const response = await api.get('/users', {
    cache: 'force-cache',
    cacheTTL: 60_000,
});
```

A valid cached response is returned without issuing a network request. Successful responses are stored with an expiration time calculated from `Date.now() + cacheTTL`.

### ETag revalidation

```ts
const response = await api.get('/users', {
    revalidate: true,
});
```

When a cached ETag exists, the client sends `If-None-Match`. A `304` response returns the previously cached body.

## CANCELLATION

Requests can be associated with a group using `tag`.

```ts
api.get('/stats', {
    tag: 'dashboard',
});

api.cancelGroup('dashboard');
```

`cancelGroup(tag)` aborts every controller currently registered under that tag and removes the group.

A caller-provided `AbortSignal` is also supported:

```ts
const controller = new AbortController();

api.get('/users', {
    signal: controller.signal,
});

controller.abort();
```

The client combines the caller's signal with its internal controller, allowing cancellation through either the caller signal or the configured timeout.

## CIRCUIT BREAKERS

Circuit breakers are created per configured key and stored in the client's `circuitBreakers` map.

```ts
const response = await api.get('/service', {
    circuit_breaker: {
        failureThreshold: 5,
        timeout: 60_000,
    },
    circuit_breaker_key: 'service-api',
});
```

The breaker is backed by `CIRCUITBREAKER`.

Configuration mapping:

| HTTP configuration | Circuit-breaker configuration |
|---|---|
| `failureThreshold` | `failureThreshold` |
| `timeout` | `cooldownMs` |
| `timeout * 10` | `cooldownMaxMs` |
| `2` | `cooldownFactor` |
| `1` | `halfOpenMaxAttempts` |
| Request timeout | `timeoutMs` |

When no explicit `circuit_breaker_key` is supplied, the resolved request URL is used as the key.

## RESPONSE PROCESSING

`parseBody` handles JSON and text responses based on the response content type.

Processing includes:

1. Reading the response body.
2. Reporting download progress when configured.
3. Parsing JSON or text.
4. Applying `transform_response`.
5. Applying the optional `validate` callback.
6. Recording the ETag when revalidation is enabled.

`validate_response` is applied afterward in `execute`.

The `validate_status` callback overrides the default `Response.ok` status check.

### Progress callbacks

```ts
const response = await api.get('/large-file', {
    onDownloadProgress: (loaded, total) => {
        console.log(loaded, total);
    },
    on_progress: ({ loaded, total, percentage }) => {
        console.log(`${percentage}%`, loaded, total);
    },
});
```

When the response provides a `content-length`, percentage is calculated from the number of bytes received. When total length is unavailable, percentage is reported as `0`.

## URL AND QUERY PARAMETER HANDLING

Relative URLs are resolved against `baseURL`. Absolute HTTP and HTTPS URLs are used directly.

`serializeParams` handles query values as follows:

| Value | Serialization |
|---|---|
| `null` / `undefined` | Omitted |
| Array | Repeated `key[]` parameters |
| Object | JSON string |
| Primitive | String conversion |

Existing query strings are preserved by appending additional parameters with `&`.

## ERRORS

`HttpError` extends `Error` and exposes:

| Property | Type |
|---|---|
| `name` | `'HttpError'` |
| `status` | `number \| null` |
| `config` | `RequestConfig` |
| `response` | `Response \| undefined` |

HTTP status failures include the response object. Network and timeout failures use a `null` status.

## INTERNAL HELPERS

| Helper | Purpose |
|---|---|
| `axioscomputeBackoff` | Randomized exponential retry delay |
| `linearBackoff` | Linear retry delay |
| `fixedBackoff` | Constant retry delay |
| `serializeParams` | Query parameter serialization |
| `serializeBody` | Request body preparation |
| `dedupeKey` | Request deduplication key |
| `buildUrl` | URL and query construction |
| `execute` | Fetch execution, retries, and response validation |
| `computeDelay` | Selects the configured retry strategy |
| `resolveRetry` | Resolves retry configuration |
| `wait` | Asynchronous delay |
| `parseBody` | Response parsing, transformation, validation, and progress |
| `buildResponse` | Constructs the `HttpResponse<T>` result |




</details>

## LOGIC GATES


 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[PLINKO]</span> </strong></summary>
# `PlinkoSession`

Stateful evaluator for traversing a `PlinkoTree`. Maintains the active branch tier, current traversal path, session state, and shared metadata while evaluating payloads against node matchers and executing matched nodes.

## CLASS

```ts
export class PlinkoSession<TState = any, TPayload = any>
```

| Generic | Default | Description |
|---|---|---|
| `TState` | `any` | Session state type |
| `TPayload` | `any` | Payload evaluated against the tree |

## CONSTRUCTOR

```ts
constructor(
    initialState: TState,
    tree: PlinkoTree<TState, TPayload>,
    options: PlinkoOptions<TState, TPayload> = {}
)
```

Initializes the session with:

- `initialState`: Initial session state.
- `tree`: Root `PlinkoTree` and initial active node map.
- `options`: Session configuration and lifecycle callbacks.

## SESSION STATE

| Field | Description |
|---|---|
| `currentNodeMap` | Active tier of nodes being evaluated |
| `rootTree` | Original tree used when resetting |
| `state` | Current session state |
| `currentPath` | Names of successfully traversed nodes |
| `metadata` | Shared `Map<string, any>` available through the evaluation context |
| `aborted` | Indicates whether the session has been aborted |

## PUBLIC METHODS

### `getState()`

```ts
getState(): TState
```

Returns the current session state.

### `getPath()`

```ts
getPath(): string[]
```

Returns a copy of the current traversal path.

### `reset()`

```ts
reset(): void
```

Resets the session to its initial traversal position:

- Restores the root tree as the active node map.
- Clears the traversal path.
- Clears session metadata.
- Resets the aborted flag.

The current state is not reassigned.

### `evaluate(p, replyFn)`

```ts
async evaluate(
    p: TPayload,
    replyFn: (
        data: unknown,
        targetSc?: string
    ) => Promise<unknown>
): Promise<{
    success: boolean;
    path: string[];
    result?: any;
    terminal: boolean;
}>
```

Evaluates a payload against the currently active tier and executes the first matching node.

**Evaluation sequence**

1. Checks whether the session has been aborted.
2. Copies the current path into a local path tracker.
3. Creates a `PlinkoContext` containing the current state, payload, path, metadata, reply function, and abort callback.
4. Iterates through the active node map in entry order.
5. Awaits each node's `matcher` until a match is found.
6. Runs the matched node's lifecycle hooks and execution function.
7. Invokes the transition callback.
8. Updates the current path and active branch map.
9. Returns the evaluation result and terminal status.

**Node lifecycle**

| Stage | Operation |
|---|---|
| Matching | `node.matcher(p, ctx)` |
| Before execution | `node.hooks?.beforeEnter(p, ctx)` |
| Execution | `node.execute(p, ctx)` |
| After execution | `node.hooks?.afterExit(executionResult, ctx)` |
| Transition | `options.onTransition(pathTracker, nextPath, p)` |

All asynchronous matcher, hook, and execution operations are awaited.

**Abort behavior**

The context exposes:

```ts
abort(reason = 'Explicitly aborted')
```

Calling it marks the session as aborted and throws an error with the supplied reason.

A subsequent `evaluate` call returns:

```ts
{
    success: false,
    path: currentPath,
    result: new Error('Plinko session aborted'),
    terminal: true,
}
```

**Evaluation outcomes**

| Condition | `success` | `terminal` |
|---|---:|---:|
| Matching node executes successfully with branches | `true` | `false` |
| Matching node executes successfully without branches | `true` | `true` |
| No matching branch is found | `false` | `false` |
| Matcher throws | `false` | `false` |
| Lifecycle hook or execution throws | `false` | `false` |
| Session was already aborted | `false` | `true` |

When a matcher throws, `options.onError` receives the error, attempted path, and payload.

When execution or a lifecycle hook throws, `options.onError` receives the error, matched path, and payload.

**Branch traversal**

When the matched node has nonempty `branches`, those branches become the next active node map.

When the matched node has no subbranches, it is terminal. If `autoResetOnTerminal` is enabled, the session resets automatically.



</details>

 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[SWITCHBOARD]</span> </strong></summary>


</details>

## MODULES


 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[APPARATION]</span> </strong></summary>

# `APPARATION`

`APPARATION` provides TypeScript utility types, type-level transformations, generic inference helpers, and runtime no-op values for satisfying interfaces and common JavaScript types without implementing their actual behavior.

The module exports the `CreateApparation` class and a shared instance under both `a` and `Apparation`.

## EXPORTS

| Export | Description |
|---|---|
| `CreateApparation` | Class containing generic type helpers and runtime no-op factories |
| `a` | Shared `CreateApparation` instance |
| `Apparation` | Alias of the shared `a` instance |

```ts
const a = new CreateApparation();

export { a, a as Apparation };
```

## TYPE UTILITIES

### Conditional and transformation types

| Type | Purpose |
|---|---|
| `DDD<T, U, X, Y>` | Returns `X` when `T` extends `U`, otherwise `Y`. Tuple wrapping prevents distributive conditional behavior. |
| `GGG<T, U, Y, X>` | Checks whether `T` extends `Promise<string>` and returns `X` when it does; otherwise returns `U`. |
| `SplitTT<S, D>` | Splits a string literal type using delimiter `D`, producing a tuple. |
| `ShiftTT<T>` | Removes the first element from a tuple. |
| `BrandDD<T, B>` | Applies a nominal brand using a unique symbol. |
| `IsNeverrr<T>` | Resolves to `true` when `T` is `never`, otherwise `false`. |
| `Partialll<T>` | Makes every property of `T` optional. |

```ts
type DDD<T, U, X, Y> =
  [T] extends [U] ? X : Y;

type GGG<T, U, Y, X> =
  T extends Promise<infer U extends string> ? X : U;

type SplitTT<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Rest}`
    ? [Head, ...SplitTT<Rest, D>]
    : [S];

type ShiftTT<T> =
  T extends [any, ...infer R] ? R : never;

declare const brand: unique symbol;

type BrandDD<T, B> = T & { [brand]: B };

type IsNeverrr<T> =
  [T] extends [never] ? true : false;

type Partialll<T> = {
  [K in keyof T]?: T[K];
};
```

### Getter generation

`XXXxx` generates getters for selected properties. `XXXX` generates getters for every property.

```ts
type XXXxx<K extends keyof T, T> = {
  [P in K as `get${Capitalize<string & P>}`]: () => T[P];
};

type XXXX<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
```

Example:

```ts
type User = {
  name: string;
  age: number;
};

type UserGetters = XXXX<User>;

// {
//   getName: () => string;
//   getAge: () => number;
// }
```

### Fluent and polymorphic types

`BuildeRRr` defines a fluent interface whose `with()` method returns `this`.

```ts
export interface BuildeRRr {
  with(x: string): this;
}
```

The polymorphic `this` return type preserves the concrete subclass type.

```ts
class Aaa {
  self(): this {
    return this;
  }
}

class BB extends Aaa {}

const instance = new BB().self();
// BB
```

## ADDITIONAL TYPE AND INFERENCE HELPERS

The `CreateApparation` class exposes methods for common TypeScript inference and declaration patterns.

| Method | Purpose |
|---|---|
| `f<const T>(x)` | Uses a const type parameter to preserve literal inference. |
| `ff<T>(arr, fallback)` | Uses `NoInfer<T>` to prevent the fallback argument from contributing to inference of `T`. |
| `config` | Demonstrates `satisfies` while retaining the inferred object type. |
| `assert(x)` | Assertion function declaring that `x` is a string. |
| `fff<T>(Ctor)` | Accepts a constructor type. |
| `ffff(...args)` | Accepts a readonly tuple of `[string, number]`. |

```ts
public f<const T>(x: T) {}

public ff<T>(arr: T[], fallback: NoInfer<T>) {}

public config =
  { a: 1, b: 'x' } satisfies Record<string, string | number>;

public assert(x: unknown): asserts x is string {}

public fff<T extends new (...args: any[]) => any>(Ctor: T) {}

public ffff(...args: readonly [string, number]) {}
```

## GENERIC NO-OP FACTORIES

These methods return placeholder values that satisfy generic return types without implementing application behavior.

| Method | Return type | Runtime value |
|---|---|---|
| `any<T>()` | `T` | Empty object cast to `T` |
| `anyGeneric<T>()` | `T` | Empty object cast to `T` |
| `anyProp<T>(v)` | `T` | Returns the supplied value |
| `anyProp2<T>(v)` | `T` | Returns the supplied value cast to `T` |
| `anyProp3(v)` | `any` | Returns the supplied value |
| `anyAs(v)` | `any` | Returns the supplied string or undefined cast to `any` |
| `simpleNoop<T>()` | `T` | Empty object cast to `T` |
| `universal<T>()` | `T` | Proxy-backed universal placeholder |
| `universalNoop<T>()` | `T` | Proxy-backed universal placeholder |

### Universal Proxy

`universal<T>()` and `universalNoop<T>()` return a Proxy-backed placeholder intended to satisfy complicated types, including interfaces with method chains.

The Proxy provides:

- No-op functions for arbitrary string properties.
- Method calls that return the underlying target.
- Ignored property assignments and deletions.
- Empty own-key enumeration.
- Empty iterator behavior.
- Empty-string `toString()` and `valueOf()` results.
- Special handling for `then`, `catch`, and `finally` to avoid promise-like behavior.
- Callable and constructable Proxy traps.

```ts
const universal = Apparation.universal<CSEAdapter>();

universal.send({ type: 'message', data: 'hello' });
universal.onMessage(() => {});
universal.onConnect?.(() => {});
universal.onDisconnect?.(() => {});

return universal;
```

This allows a placeholder to satisfy an interface without implementing its actual methods.

## PROMISE AND FUNCTION FACTORIES

| Method | Return type | Behavior |
|---|---|---|
| `promise<T>()` | `Promise<T>` | Resolves to an empty object cast to `T`. |
| `booleanPromise()` | `Promise<boolean>` | Resolves to `false`. |
| `void()` | `void` | Performs no operation. |
| `func<T>()` | `() => T` | Returns a function producing an empty object cast to `T`. |
| `funcVoid()` | `() => void` | Returns an empty function. |
| `noopPromise<T>()` | `Promise<T>` | Resolves to an empty object cast to `T`. |
| `noopBooleanPromise()` | `Promise<boolean>` | Resolves to `false`. |
| `noopVoid()` | `void` | Performs no operation. |
| `noopFunction<T>()` | `() => T` | Returns a function producing an empty object cast to `T`. |
| `promiseInstance<T>()` | `Promise<T>` | Resolves to an empty object cast to `T`. |

### Thenable and async iterable

`thenable<T>()` returns a `PromiseLike<T>` whose `then` method returns a promise that never settles.

`asyncIterable<T>()` returns an async iterable whose iterator waits indefinitely.

```ts
public thenable<T = any>(): PromiseLike<T> {
  return {
    then: (_onF?: any, _onR?: any) => new Promise<T>(() => {})
  } as any;
}

public asyncIterable<T = any>(): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]: async function* () {
      await new Promise(() => {});
    }
  } as any;
}
```

## PRIMITIVE FACTORIES

| Method | Return type | Runtime value |
|---|---|---|
| `null()` | `null` | `null` |
| `primitive<T>()` | `T` | `undefined` cast to `T` |
| `string()` | `string` | `''` |
| `number()` | `number` | `0` |
| `boolean()` | `boolean` | `false` |
| `bigint()` | `bigint` | `0n` |
| `symbol()` | `symbol` | `Symbol('apparation')` |
| `undefined()` | `undefined` | `undefined` |
| `undefinedString()` | `string` | `'undefined'` |
| `function_()` | `(...args: any[]) => any` | Empty function |

`primitive<T>()` supports `string`, `number`, `boolean`, `bigint`, `symbol`, and `undefined`.

## STRUCTURED VALUE FACTORIES

| Method | Return type | Runtime value |
|---|---|---|
| `typedArray<T>()` | `T extends ArrayBufferView` | Empty `Uint8Array` cast to `T` |
| `dataView()` | `DataView` | DataView over an empty ArrayBuffer |
| `arrayBuffer()` | `ArrayBuffer` | Empty ArrayBuffer |
| `map<K, V>()` | `Map<K, V>` | Empty Map |
| `set<T>()` | `Set<T>` | Empty Set |
| `date()` | `Date` | `new Date(0)` |
| `regexp()` | `RegExp` | `/(?:)/` |
| `error(msg?)` | `Error` | Error with default message `[Apparation]` |
| `iterable<T>()` | `Iterable<T>` | Empty array cast to Iterable |
| `iterator<T>()` | `Iterator<T>` | Empty array iterator |
| `object<T>()` | `T extends object` | Empty object cast to `T` |
| `plainObject<T>()` | `T extends object` | Empty object cast to `T` |
| `array<T>()` | `T[]` | Empty array |
| `weakMap<K, V>()` | `WeakMap<K, V>` | Empty WeakMap |
| `weakSet<T>()` | `WeakSet<T>` | Empty WeakSet |
| `url()` | `URL` | `new URL('about:blank')` |
| `urlSearchParams()` | `URLSearchParams` | Empty URLSearchParams |
| `buffer()` | `Buffer` | `Buffer.alloc(0)` |
| `_ArrayBuffer()` | `Uint8Array` | Empty Uint8Array |

## MAYBE-PROMISE HELPERS

### `SZU<T>`

`SZU<T>` resolves to `undefined` when `T` is exactly `undefined`; otherwise it preserves `T`.

```ts
export type SZU<T = Promise<any>> =
  [T] extends [undefined] ? undefined : T;
```


## USAGE

The shared instance is available through either export name:

```ts
import { Apparation } from './apparations';

// Generic placeholder
const value = Apparation.any<MyInterface>();

// Promise placeholder
const pending = Apparation.promise<MyResult>();

// Function placeholder
const callback = Apparation.func<MyResult>();

// Universal interface placeholder
const adapter = Apparation.universal<MyAdapter>();

// Primitive placeholders
const text = Apparation.string();
const count = Apparation.number();
const enabled = Apparation.boolean();

// Structured placeholders
const map = Apparation.map<string, number>();
const values = Apparation.array<string>();
const timestamp = Apparation.date();
```

## PURPOSE

`Apparation` provides reusable placeholders for:

- Satisfying generic return types.
- Supplying no-op implementations for interfaces.
- Preserving literal and generic type inference.
- Constructing empty values for common built-in types.
- Providing promise, thenable, and async iterable placeholders.
- Handling complicated adapter interfaces through Proxy-backed no-op objects.

These factories provide type-compatible placeholder values; they do not implement the underlying behavior represented by the requested type.

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[DEFER]</span> </strong></summary>

# `DEFER_ENGINE`

`DEFER_ENGINE` is a dependency-driven task scheduler. Tasks register the dependency keys they require and execute when every key has been provided. Dependencies can be published individually or in batches, replaced with newer values, resolved without a meaningful value, or invalidated.

The module exports the `DEFER_ENGINE` class and a shared instance named `DEFER_`.

## EXPORTS

| Export | Description |
|---|---|
| `DEFER_ENGINE` | Dependency-driven task scheduler |
| `DEFER_` | Shared `DEFER_ENGINE` instance |

```ts
export const DEFER_ = new DEFER_ENGINE();
```

## TYPES

| Type | Definition | Purpose |
|---|---|---|
| `DeferredKey` | `string` | Dependency identifier |
| `DeferredState` | `'pending' \| 'running'` | Task execution state |
| `DeferredTask` | Task record | Stores task ID, dependencies, callback, and state |
| `DeferredEntry` | `{ v: any; version: number }` | Stores a dependency value and version |
| `DeferredStats` | Statistics object | Tracks registration, execution, completion, failure, and cancellation |

### `DeferredTask`

```ts
type DeferredTask = {
  id: number;
  deps: DeferredKey[];
  fn: (...v: any[]) => any;
  state: DeferredState;
};
```

### `DeferredEntry`

```ts
type DeferredEntry = {
  v: any;
  version: number;
};
```

### `DeferredStats`

```ts
type DeferredStats = {
  registered: number;
  executed: number;
  completed: number;
  failed: number;
  cancelled: number;
};
```

## INTERNAL STATE

Each engine maintains:

| Field | Description |
|---|---|
| `deps` | Map of available dependency keys to their values and versions |
| `tasks` | Map of registered tasks indexed by numeric ID |
| `nextId` | Incrementing task identifier |
| `draining` | Prevents concurrent scheduler drain operations |
| `drainAgain` | Requests another scheduler pass when work is registered during draining |
| `stats` | Task lifecycle counters |
| `onError` | Default task failure handler |
| `onSuccess` | Default task completion handler |

The initial statistics are all zero.

Default callbacks log task failures and successful fulfillment.

## CONSTRUCTOR

```ts
new DEFER_ENGINE()
```

Creates an empty scheduler with no registered dependencies or tasks.

## PUBLIC METHODS

### `run(deps, fn): number`

Registers a task with one or more dependency keys.

```ts
run(
  deps: DeferredKey | DeferredKey[],
  fn: (...v: any[]) => any
): number
```

- Accepts one dependency key or an array of keys.
- Deduplicates dependency keys using `Set`.
- Assigns and returns an incrementing task ID.
- Increments `stats.registered`.
- Immediately invokes the scheduler drain.
- Executes the callback only when every dependency is available.

Dependency values are passed to the callback in the same order as the registered dependency keys.

```ts
DEFER_.run(
  ['DISPATCH_ENGINE._sub', 'ATOM'],
  (dispatch, atom) => {
    // Runs when both dependencies are available.
  }
);
```

### `provide(key, value): void`

Publishes or replaces a dependency value.

```ts
provide(key: DeferredKey, value: any): void;
```

Each publication increments that dependency's version. Publishing an existing key replaces its value and triggers the scheduler.

### `provide(values): void`

Publishes multiple dependencies in one operation.

```ts
provide(values: Record<DeferredKey, any>): void;
```

Each record entry is published with its own incremented version. The scheduler drains after the batch has been processed.

```ts
DEFER_.provide({
  'DISPATCH_ENGINE._sub': this.DISRUPTOR_LVL2,
  ATOM: atom
});
```

### `resolve(key): void`

Marks a dependency as available without providing a meaningful value.

```ts
resolve(key: DeferredKey): void
```

Internally delegates to `provide(key, undefined)`.

The dependency is considered ready because readiness checks whether the key exists, not whether its value is defined.

### `invalidate(key): boolean`

Removes a dependency from the available dependency map.

```ts
invalidate(key: DeferredKey): boolean
```

Returns the result of `Map.delete()`.

Invalidating a dependency prevents pending tasks from becoming ready through that key. Already-dispatched tasks are unaffected.

### `has(key): boolean`

Checks whether a dependency is currently available.

```ts
has(key: DeferredKey): boolean
```

### `get<T>(key): T | undefined`

Retrieves a dependency's currently published value.

```ts
get<T = any>(key: DeferredKey): T | undefined
```

### `cancel(id): boolean`

Cancels a pending task.

```ts
cancel(id: number): boolean
```

- Returns `false` when the task does not exist or is already running.
- Removes a pending task from the task map.
- Increments `stats.cancelled`.
- Returns `true` when cancellation succeeds.

Running tasks cannot be cancelled through this method.

### `inspect()`

Returns a snapshot of scheduler statistics, available dependencies, pending tasks, and running tasks.

```ts
inspect()
```

The returned object contains:

| Property | Description |
|---|---|
| `stats` | Copy of the current statistics |
| `dependencies` | Available dependency keys and their versions |
| `pending` | Pending task IDs, dependencies, and missing dependencies |
| `running` | Running task IDs and their dependencies |

Dependency entries expose `{ key, version }`.

Pending entries expose `{ id, deps, missing }`.

Running entries expose `{ id, deps }`.

### `clear(): void`

Removes all pending tasks and clears all available dependencies.

Pending tasks removed during clearing increment `stats.cancelled`.

Running tasks are retained and are not cancelled. Statistics are not reset.

## EXECUTION MODEL

### Dependency readiness

A task becomes eligible when every registered dependency key exists in the dependency map.

```ts
private ready(task: DeferredTask): boolean {
  return task.deps.every(k => this.deps.has(k));
}
```

A dependency can contain `undefined` and still satisfy readiness when published through `resolve()`.

### Scheduler drain

The private `drain()` method processes eligible tasks in registration order.

1. Prevents reentrant drain execution using `draining`.
2. Marks an eligible task as `running` before invoking its callback.
3. Increments `stats.executed`.
4. Collects dependency values in registration order.
5. Invokes the task callback with those values.
6. Handles synchronous results, asynchronous results, and thrown errors.
7. Repeats the drain when another operation requests it during execution.

Claiming a task before invoking its callback prevents duplicate dispatch.

### Synchronous tasks

A task returning a non-thenable value is completed immediately.

- Increments `stats.completed`.
- Calls `onSuccess`.
- Removes the task from the task map.

### Asynchronous tasks

A task returning a thenable is wrapped with `Promise.resolve()`.

- Fulfillment increments `stats.completed` and calls `onSuccess`.
- Rejection increments `stats.failed` and invokes the error reporter.
- The task is removed in `finally`.

### Failure handling

Synchronous callback errors and asynchronous rejections increment `stats.failed`.

The private `report()` method invokes `onError` with the error, task ID, and dependency keys. Exceptions thrown by the error handler are swallowed so error reporting cannot interrupt the scheduler.

## STATISTICS

| Counter | Meaning |
|---|---|
| `registered` | Total tasks registered |
| `executed` | Tasks dispatched for execution |
| `completed` | Successfully completed tasks |
| `failed` | Tasks that threw or rejected |
| `cancelled` | Pending tasks cancelled or removed by `clear()` |

Statistics are cumulative and are not reset by `clear()`.

## USAGE

### Register work before dependencies are available

```ts
DEFER_.run(
  ['DISPATCH_ENGINE._sub', 'ATOM'],
  (dispatch, atom) => {
    // Runs only when both dependencies are available.
  }
);

DEFER_.provide('DISPATCH_ENGINE._sub', this.DISRUPTOR_LVL2);

DEFER_.provide('ATOM', atom);
```

### Register work with one dependency

```ts
DEFER_.run(
  'DISPATCH_ENGINE._sub',
  dispatch => {
    // Runs when DISPATCH_ENGINE._sub becomes available.
  }
);
```

### Publish multiple dependencies

```ts
DEFER_.provide({
  'DISPATCH_ENGINE._sub': this.DISRUPTOR_LVL2,
  ATOM: atom
});
```

### Inspect scheduler state

```ts
const snapshot = DEFER_.inspect();

snapshot.stats;
snapshot.dependencies;
snapshot.pending;
snapshot.running;
```

### Cancel pending work

```ts
const id = DEFER_.run('ENGINE_READY', () => {
  // Deferred execution.
});

DEFER_.cancel(id);
```

### Invalidate and republish a dependency

```ts
DEFER_.invalidate('ENGINE_READY');

DEFER_.provide('ENGINE_READY', engine);
```

## LIFECYCLE SUMMARY

| Operation | Effect |
|---|---|
| `run()` | Registers work and attempts execution |
| `provide()` | Publishes values and attempts execution |
| `resolve()` | Publishes an available dependency with `undefined` |
| `invalidate()` | Removes dependency availability |
| `cancel()` | Removes a pending task |
| `inspect()` | Returns scheduler state |
| `clear()` | Removes pending tasks and all dependencies |

`DEFER_` provides a shared dependency-driven execution queue for coordinating initialization and dispatch across components that become available at different times.

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[MODULE RIFTS]</span> </strong></summary>
# `MODULE_RIFTS`

`MODULE_RIFTS` provides a shared dynamic module loader with URL-based module identification, cached imports, in-flight import deduplication, loaded-module inspection, and named-export lookup.

Modules are loaded through dynamic `import()`. Successfully loaded modules are retained in a static registry shared across `MODULE_RIFTS` instances.

## CLASS

```ts
export class MODULE_RIFTS
```

## STATIC STATE

| Property | Type | Description |
|---|---|---|
| `loaded` | `Map<string, A>` | Public registry of successfully loaded modules, indexed by resolved module URL |
| `inflight` | `Map<string, Promise<A>>` | Tracks imports currently in progress to prevent duplicate loading |
| `moduleExports` | `Map<string, Map<string, A>>` | Indexes named exports by export name and source module |

`loaded` is public and static. The other two registries are private and static.

## CONSTRUCTOR AND ROOT

```ts
public root: A;

constructor(root: A = null)
```

Stores the supplied root reference.

### `FULFIL_THIS_NOW(r): void`

Replaces the current root reference.

```ts
FULFIL_THIS_NOW(r: A)
```

### `REFRESH_ROOT()`

Refreshes the root through its `acquire_root()` method using the `MODULE_RIFTS` identifier.

```ts
REFRESH_ROOT() {
  return this.root.acquire_root('MODULE_RIFTS');
}
```

## MODULE IDENTIFICATION

### `keyFor(specifier): string`

Resolves a module specifier into its canonical URL.

```ts
keyFor(specifier: string): string
```

Resolution behavior:

1. Attempts `import.meta.resolve(specifier)`.
2. If resolution throws, falls back to `new URL(specifier, import.meta.url).href`.

Relative fallback paths are resolved relative to the module containing `MODULE_RIFTS`.

The resulting URL is used as the registry key for loaded modules and in-flight imports.

### `isLoaded(specifier): boolean`

Checks whether a module has already been loaded.

```ts
isLoaded(specifier: string): boolean
```

Resolves the supplied specifier through `keyFor()` and checks the static `loaded` map.

### `modules`

Returns the loaded-module registry as a readonly map view.

```ts
get modules(): ReadonlyMap<string, A>
```

Each entry contains the resolved module URL and its imported module namespace.

### `getLoaded<T>(specifier): T | undefined`

Retrieves an already-loaded module without initiating an import.

```ts
getLoaded<T = A>(specifier: string): T | undefined
```

Returns the cached module namespace or `undefined` when the module has not been loaded.

## MODULE LOADING

### `load<T>(specifier): Promise<T>`

Loads a module dynamically and caches its module namespace.

```ts
load<T = A>(specifier: string): Promise<T>
```

The loading sequence is:

1. Resolve the specifier using `keyFor()`.
2. Return the cached module immediately when it already exists in `loaded`.
3. Return the existing promise when the same module is already being imported.
4. Otherwise, initiate a dynamic `import()` using the resolved URL.
5. Store the successfully imported module in `loaded`.
6. Remove the completed import from `inflight`.
7. Return the imported module namespace.

If the import fails, its in-flight entry is removed and the error is rethrown. A subsequent call can therefore retry the import.

### Idempotent loading

Repeated calls for the same resolved module URL reuse the existing loaded module or in-flight promise.

```ts
await rifts.load('the-cloud/hook-system');

// Later — no additional import when already loaded.
if (rifts.isLoaded('the-cloud/hook-system')) {
  const mod = rifts.getLoaded('the-cloud/hook-system');
  mod.store;
}
```

### Runtime loading

```ts
await rifts.load('./some-module.js');
```

## EXPORT DISCOVERY

### `export<T>(name, specifier?): T | undefined`

Retrieves a named export from a loaded module or discovers it across all indexed module exports.

```ts
export<T = A>(
  name: string,
  specifier?: string
): T | undefined
```

When a specific module specifier is provided:

- Retrieves the module through `getLoaded()`.
- Returns the requested named export.
- Returns `undefined` when the module or export is unavailable.

When no specifier is provided:

- Looks up the export name in the static `moduleExports` registry.
- Returns `undefined` when no indexed source exists.
- Returns the export when exactly one source exists.
- Throws an error when multiple sources exist.

The ambiguity error identifies every matching module URL:

```ts
throw new Error(
  `Ambiguous export "${name}" found in: ${[...sources.keys()].join(', ')}`
);
```

### `indexExports(key, mod)`

Private helper that indexes the enumerable own string-keyed exports of a module.

```ts
private indexExports(key: string, mod: A): void
```

Each export name maps to a collection of source module URLs and their corresponding export values.

## USAGE

### Load a module during initialization

```ts
await rifts.load('the-cloud/hook-system');
```

### Check without triggering an import

```ts
if (rifts.isLoaded('the-cloud/hook-system')) {
  const mod = rifts.getLoaded('the-cloud/hook-system');

  mod.store;
}
```

### Load a module at runtime

```ts
await rifts.load('./some-module.js');
```

### Inspect loaded modules

```ts
for (const [path, mod] of rifts.modules) {
  console.log(path, Object.keys(mod));
}
```

### Discover an export across loaded modules

```ts
const fn = rifts.export<(v: string) => void>('someFunction');
```

If more than one indexed module provides that export name, the lookup throws an ambiguity error.

### Retrieve an export from a specific module

```ts
const mod = rifts.export(
  'someFunction',
  './some-module.js'
);
```

### Resolve and load directly

```ts
import { resolve } from '#rifts/resolve';

const mod = await resolve('./some-module.js');

const fn = rifts.export('someFunction');
```

## API SUMMARY

| API | Purpose |
|---|---|
| `load(specifier)` | Dynamically imports and caches a module |
| `isLoaded(specifier)` | Checks whether a module is loaded |
| `getLoaded(specifier)` | Retrieves a cached module without importing |
| `modules` | Exposes the loaded-module registry |
| `keyFor(specifier)` | Resolves a module specifier to a URL |
| `export(name, specifier?)` | Retrieves a named export |
| `FULFIL_THIS_NOW(root)` | Replaces the root reference |
| `REFRESH_ROOT()` | Acquires the `MODULE_RIFTS` root |

## LOADING MODEL

`MODULE_RIFTS` separates module loading into three shared registries:

- `loaded` stores completed imports.
- `inflight` stores imports currently in progress.
- `moduleExports` provides named-export lookup across indexed modules.

The static registries allow multiple instances to share the same loaded-module cache and in-flight import tracking.

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[NODE MODULE RIFTS]</span> </strong></summary>

# `NODE_MODULE_RIFTS`

`NODE_MODULE_RIFTS` provides synchronous Node.js module loading through `require()`, with a shared module cache, named-export indexing, and direct module or export retrieval.

Unlike `MODULE_RIFTS`, which uses dynamic `import()` and asynchronous loading, `NODE_MODULE_RIFTS` uses a `blindRequire` function and returns loaded modules synchronously.

The module exports the `NODE_MODULE_RIFTS` class and a shared instance named `node_module_rifts`.

## EXPORTS

| Export | Description |
|---|---|
| `NODE_MODULE_RIFTS` | Synchronous Node.js module loader |
| `node_module_rifts` | Shared loader instance |

```ts
export const node_module_rifts = new NODE_MODULE_RIFTS();
```

## STATIC STATE

| Property | Type | Description |
|---|---|---|
| `loaded` | `Map<string, A>` | Successfully loaded modules, indexed by their original specifier |
| `moduleExports` | `Map<string, Map<string, A>>` | Named-export index mapping export names to their source modules |
| `blindRequire` | `Function` | Dynamically constructed function that invokes `require(specifier)` |

The module registries are static, allowing multiple instances to share loaded modules and indexed exports.

## CONSTRUCTOR AND ROOT

```ts
public root: A;

constructor(root: A = null)
```

Stores the supplied root reference.

### `FULFIL_THIS_NOW(r): void`

Replaces the current root reference.

```ts
FULFIL_THIS_NOW(r: A)
```

### `REFRESH_ROOT()`

Refreshes the root through its `acquire_root()` method using the `NODE_MODULE_RIFTS` identifier.

```ts
REFRESH_ROOT() {
  return this.root.acquire_root('NODE_MODULE_RIFTS');
}
```

## MODULE INSPECTION

### `isLoaded(specifier): boolean`

Checks whether a module specifier exists in the static loaded-module registry.

```ts
isLoaded(specifier: string): boolean
```

### `modules`

Returns the loaded-module registry as a readonly map view.

```ts
get modules(): ReadonlyMap<string, A>
```

### `getLoaded<T>(specifier): T | undefined`

Retrieves an already-loaded module without triggering another `require()`.

```ts
getLoaded<T = A>(specifier: string): T | undefined
```

Returns `undefined` when the specifier has not been loaded.

## EXPORT INDEXING

### `indexExports(key, mod): void`

Private helper that indexes enumerable own string-keyed properties of a loaded module.

```ts
private indexExports(key: string, mod: A): void
```

- Ignores falsy module values.
- Ignores values that are neither objects nor functions.
- Iterates through `Object.keys(mod)`.
- Stores each export under its name in the static `moduleExports` registry.
- Associates each export with its source module specifier.

### `export<T>(name, specifier?): T | undefined`

Retrieves a named export.

```ts
export<T = A>(
  name: string,
  specifier?: string
): T | undefined
```

**With a module specifier:**

- Retrieves the loaded module through `getLoaded()`.
- Returns the requested property.
- Returns `undefined` if the module or property is unavailable.

**Without a module specifier:**

- Searches the indexed exports across loaded modules.
- Returns `undefined` if no source exists.
- Returns the export when exactly one source exists.
- Throws an ambiguity error when multiple modules provide the same export name.

The ambiguity error identifies the matching source specifiers.

## MODULE LOADING

### `load<T>(specifier): T`

Synchronously loads a Node.js module.

```ts
load<T = A>(specifier: string): T
```

Execution sequence:

1. Checks the static `loaded` registry.
2. Returns the cached module if already loaded.
3. Calls `blindRequire(specifier)` when no cached module exists.
4. Stores the returned module in `loaded`.
5. Indexes its named exports through `indexExports()`.
6. Returns the loaded module.

Loading is synchronous and uses the original specifier as the cache key.

### `import<T>(specifier): T`

Alias for `load()`.

```ts
import<T = A>(specifier: string): T {
  return this.load<T>(specifier);
}
```

### `importAll<T>(specifier): T`

Also delegates directly to `load()` and returns the complete module.

```ts
importAll<T = A>(specifier: string): T
```

### `importNamed<T>(specifier, name): T | undefined`

Retrieves a named export from a specific loaded module.

```ts
importNamed<T = A>(
  specifier: string,
  name: string
): T | undefined
```

Delegates to `export(name, specifier)`.

## USAGE

### Load a Node.js module

```ts
const fs = node_module_rifts.load('node:fs');
```

### Import the complete module

```ts
const path = node_module_rifts.importAll('node:path');
```

### Check whether a module is loaded

```ts
if (node_module_rifts.isLoaded('node:fs')) {
  const fs = node_module_rifts.getLoaded('node:fs');
}
```

### Retrieve a named export

```ts
const readFile = node_module_rifts.importNamed<
  typeof import('node:fs').readFile
>('node:fs', 'readFile');
```

### Discover an export across loaded modules

```ts
const fn = node_module_rifts.export<
  (value: string) => void
>('someFunction');
```

If multiple indexed modules provide `someFunction`, the lookup throws an ambiguity error.

### Inspect loaded modules

```ts
for (const [specifier, mod] of node_module_rifts.modules) {
  console.log(specifier, Object.keys(mod));
}
```

## API SUMMARY

| API | Purpose |
|---|---|
| `load(specifier)` | Synchronously loads and caches a module |
| `import(specifier)` | Alias for `load()` |
| `importAll(specifier)` | Loads and returns the complete module |
| `importNamed(specifier, name)` | Retrieves a named export from a specific module |
| `export(name, specifier?)` | Retrieves a specific or globally indexed export |
| `isLoaded(specifier)` | Checks module availability |
| `getLoaded(specifier)` | Retrieves a cached module |
| `modules` | Exposes the loaded-module registry |
| `FULFIL_THIS_NOW(root)` | Replaces the root reference |
| `REFRESH_ROOT()` | Acquires the `NODE_MODULE_RIFTS` root |

## LOADING MODEL

`NODE_MODULE_RIFTS` uses a synchronous loading path:

- `blindRequire` performs the actual Node.js `require()`.
- `loaded` prevents repeated loading of the same specifier.
- `moduleExports` enables named-export discovery across loaded modules.
- `import`, `importAll`, and `importNamed` provide convenience accessors over the same loading and lookup mechanisms.

The loader does not maintain an in-flight promise registry; module loading and caching happen synchronously.

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[REACTIVE STORE]</span> </strong></summary>

# `REACTIVE_STORE`

`REACTIVE_STORE` is a lightweight keyed reactive store for `RiftRecord` values. It maintains records in a `Map` and supports per-key subscriptions. Updating a record notifies all listeners registered for that key.

The module exports the `RiftRecord` interface and a shared store instance named `STORE`.

## EXPORTS

| Export | Description |
|---|---|
| `RiftRecord<T>` | Record structure stored by the reactive store |
| `STORE` | Shared `REACTIVE_STORE` instance |

## TYPES

### `RiftRecord<T>`

```ts
export interface RiftRecord<T = A> {
  opened: B;
  claimed: B;
  value?: T;
  createdAt: N;
  openedAt?: N;
}
```

| Property | Type | Description |
|---|---|---|
| `opened` | `B` | Opened state |
| `claimed` | `B` | Claimed state |
| `value` | `T \| undefined` | Optional record value |
| `createdAt` | `N` | Record creation timestamp |
| `openedAt` | `N \| undefined` | Optional opening timestamp |

### `StoreListener<T>`

```ts
type StoreListener<T = A> = (v: RiftRecord<T>) => void;
```

Defines the callback invoked when a subscribed record is updated.

## CLASS

```ts
class REACTIVE_STORE
```

The store maintains two internal maps:

| Field | Type | Description |
|---|---|---|
| `records` | `Map<S, RiftRecord<A>>` | Stores records by key |
| `listeners` | `Map<S, Set<StoreListener<A>>>` | Stores listener sets by key |

## PUBLIC METHODS

### `get<T>(key): RiftRecord<T> | undefined`

Retrieves the record associated with a key.

```ts
get<T = A>(key: S): RiftRecord<T> | undefined
```

Returns `undefined` when the key does not exist.

### `set<T>(key, record): void`

Stores or replaces a record and notifies subscribers registered for that key.

```ts
set<T = A>(
  key: S,
  record: RiftRecord<T>
): void
```

Notification behavior:

- Stores the supplied record.
- Retrieves the listeners for the key.
- Iterates over a snapshot of the listener set.
- Invokes each listener with the updated record.
- Catches listener exceptions individually so one failing listener does not prevent the remaining listeners from running.

### `sub<T>(key, fn): () => V`

Subscribes to updates for a specific key.

```ts
sub<T = A>(
  key: S,
  fn: StoreListener<T>
): () => V
```

Creates a listener set when one does not already exist and registers the callback.

Returns an unsubscribe function that:

1. Retrieves the listener set for the key.
2. Removes the supplied callback.
3. Removes the key's listener set when it becomes empty.

Subscribing does not immediately invoke the callback with the current record.

### `delete(key): void`

Deletes the record and its associated listener set.

```ts
delete(key: S): void
```

### `clear(): void`

Clears all records and all subscriptions.

### `size`

Returns the number of stored records.

```ts
get size(): N
```

## SHARED INSTANCE

```ts
export const STORE = new REACTIVE_STORE();
```

`STORE` provides a shared store instance for keyed record access and subscriptions.

## USAGE

### Store a record

```ts
STORE.set('module-1', {
  opened: true,
  claimed: false,
  value: moduleData,
  createdAt: Date.now()
});
```

### Retrieve a record

```ts
const record = STORE.get('module-1');
```

### Subscribe to record updates

```ts
const unsubscribe = STORE.sub('module-1', record => {
  // Handle updated record.
});
```

### Unsubscribe

```ts
unsubscribe();
```

### Delete a record

```ts
STORE.delete('module-1');
```

### Inspect store size

```ts
const count = STORE.size;
```

### Clear the store

```ts
STORE.clear();
```

## API SUMMARY

| API | Purpose |
|---|---|
| `get(key)` | Retrieves a record |
| `set(key, record)` | Stores a record and notifies listeners |
| `sub(key, fn)` | Subscribes to updates and returns an unsubscribe function |
| `delete(key)` | Deletes a record and its listeners |
| `clear()` | Clears all records and subscriptions |
| `size` | Returns the number of stored records |

`REACTIVE_STORE` provides keyed record storage with isolated per-key notifications and listener cleanup.

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[RIFT MAELSTROM]</span> </strong></summary>


# `MAELSTROM`

`MAELSTROM` is a unified runtime registry and module-resolution system. It manages local and shared rifts, records solver outcomes, coordinates dependency waiters, schedules deferred work, loads modules, detects runtime environments, and provides fallback values.

The implementation uses one rift registry for stored values, module entries, solver results, and dependency signals. Deferred task records are maintained separately as scheduler state.

## CORE TYPES AND CLASSES

### `Rift<T = A>`

Implements `RiftLike<T>` as an in-memory promise-backed entry.

| Property | Description |
|---|---|
| `opened` | Whether the rift has been opened |
| `claimed` | Whether a solver has claimed the entry |
| `value` | Current stored value |
| `createdAt` | Creation timestamp |
| `openedAt` | Timestamp when opened |
| `listeners` | Entry subscribers |
| `solver` | Solver responsible for the recorded outcome |
| `store` | Store kind associated with the outcome |
| `version` | Entry version counter |
| `inflight` | In-flight promise |
| `exports` | Named-export index stored on the entry |

**Methods**

- `wait(timeoutMs = 0)` — Returns the entry's pending promise. A timeout is optional; when supplied, the returned promise rejects if the rift does not open in time.
- `open(v?)` — Opens the entry, stores its value, resolves the pending promise, and notifies subscribers. The first open wins until reset.
- `reset()` — Clears the opened and claimed state, removes the current value and timestamp, and creates a new pending promise.
- `claim()` — Claims the entry once. Subsequent claims return `false`.
- `onOpen(listener)` — Subscribes to value notifications and returns an unsubscribe function.

**Getters**

- `isOpen`
- `isClaimed`
- `current`

### `REACTIVE_STORE`

A Map-backed store used by shared `CloudRift` entries.

| Method / Property | Description |
|---|---|
| `get<T>(key)` | Retrieves a stored record |
| `set<T>(key, record)` | Stores a record and notifies subscribers |
| `sub<T>(key, fn)` | Subscribes to record changes |
| `delete(key)` | Removes a record and its listeners |
| `clear()` | Clears all records and listeners |
| `size` | Number of stored records |

The exported singleton is:

```ts
export const RX_STORE = new REACTIVE_STORE();
```

### `CloudRift<T = A>`

Implements `RiftLike<T>` using `RX_STORE` rather than an instance-local promise.

Its record contains:

```ts
{
    opened: boolean;
    claimed: boolean;
    value: T | undefined;
    createdAt: number;
    openedAt: number | undefined;
}
```

**Methods**

- `wait(timeoutMs = 0)` — Returns the current value when already open; otherwise waits for the shared record, optionally with a timeout.
- `open(value?)` — Updates the shared record to opened. An already-open record is left unchanged.
- `reset()` — Reinitializes the record while preserving its original `createdAt`.
- `claim()` — Marks the shared record claimed once.
- `onOpen(listener)` — Subscribes to record updates and invokes the listener when the record is opened.

**Getters**

- `createdAt`
- `openedAt`
- `isOpen`
- `isClaimed`
- `current`

`wait_and_promise<T>()` is the internal shared-record waiting helper. It subscribes before rechecking the open state to close the gap between checking and subscribing.

## MAELSTROM STATE

The class maintains the following primary state:

| Field | Purpose |
|---|---|
| `root` | Application root reference |
| `rifts` | The single registry of named rift entries |
| `multiWaiters` | Waiters spanning multiple dependency labels |
| `nextWaiterId` | Multi-waiter identifier counter |
| `deferTasks` | Deferred task records |
| `nextDeferId` | Deferred task identifier counter |
| `draining` | Indicates an active scheduler drain |
| `drainAgain` | Requests another scheduler pass |
| `deferStats` | Deferred task lifecycle counters |
| `autoCloud` | Cached automatic cloud-store selection |
| `ENV_STATE` | Detected environment information |
| `shout` | `ORC_SHOUT` logging instance |

The deferred task counters are:

```ts
{
    registered: 0,
    executed: 0,
    completed: 0,
    failed: 0,
    cancelled: 0
}
```

## CONSTRUCTION AND ROOT

```ts
constructor(root: A = null)
```

Sets the root reference and invokes `RITUAL_OF_BINDING()`.

```ts
FULFIL_THIS_NOW(r: A): V
REFRESH_ROOT(): A
```

- `FULFIL_THIS_NOW` replaces the root reference.
- `REFRESH_ROOT` attempts to retrieve the root through `acquire_root('MAELSTROM')`, falling back to the existing root if unavailable or if an error occurs.

## RIFT REGISTRY

### Store selection

The registry supports three store kinds:

- `local` — Creates an instance-local `Rift`.
- `cloud` — Creates a shared `CloudRift`.
- `auto` — Detects cloud support once and selects the corresponding implementation.

`detectCloudSupport()` checks for a browser window or document.

### Registry methods

| Method | Description |
|---|---|
| `rf(k)` | Returns the `${k}_RIFTS_` label |
| `get<T>(name, store?)` | Retrieves or creates a named rift |
| `hasRift(name)` | Checks whether a label exists in the registry |
| `deleteRift(name)` | Removes a named entry |
| `resetRift(name)` | Resets an existing entry |
| `clearRifts()` | Clears the registry |
| `size` | Number of registered rifts |
| `inspect()` | Returns metadata for every registered rift |

`inspect()` returns entries containing `name`, `isOpen`, `isClaimed`, `createdAt`, and `openedAt`.

### Guard

```ts
guard<T, RR>(
    name: S,
    fn: (unlockValue: T) => RR | Promise<RR>,
    timeoutMs?: N
): Promise<RR>
```

Waits for the named rift and invokes `fn` with its resolved value.

## SHARED RESULTS

Solver outcomes are recorded directly on their corresponding rift entries. The `results` property is computed from the registry rather than maintained in a second results map.

### Recording

The internal `record<T>()` method:

1. Retrieves the named rift.
2. Assigns its `solver` and `store` provenance.
3. Increments its `version`.
4. Opens the rift with the recorded value.
5. Reopens the `__results__` sentinel with the latest result record.
6. Releases multi-label waiters.
7. Triggers the deferred scheduler.

A result record contains:

```ts
{
    label: S;
    solver: Solver;
    store: StoreKind;
    value: T | undefined;
    ok: boolean;
    openedAt: number;
}
```

`ok` is true when the value is neither `undefined` nor `null`.

### Results API

| Method / Property | Description |
|---|---|
| `results` | Computed array of recorded solver outcomes |
| `result<T>(label)` | Retrieves one recorded outcome |
| `resultsFrom(solver)` | Filters outcomes by solver |
| `onResult(listener)` | Subscribes through the `__results__` sentinel entry |

## SOLVER OPERATIONS

### `read<T>(label, store?)`

Reads the current rift value and records the operation under the `get` solver.

### `get_value<T>(label)`

Convenience wrapper around `read<T>()`.

### `place<T>(label, value, store?)`

Opens the named rift with a value and records the operation under `place`.

### `smash_n_grab<T>(label, module?, wait?, store?)`

Returns a result envelope through the `MaybePromise` helper.

Its resolution paths include:

- Returning an already-open rift value.
- Waiting when no module is supplied and a wait duration is provided.
- Opening the rift with the supplied module when a label and module are supplied without a wait.
- Attempting module resolution after an error.
- Returning an apparation fallback when the operation cannot resolve.

The envelope fields used by the method include `is_waiting`, `isLoaded`, `get`, and `mod`.

### `create_rift<T>(label, module, store?)`

Creates or opens a named rift when a module value is supplied. Records successful outcomes under `create_rift`. If the initial operation fails, it attempts module resolution.

### `use_rift<T>(label, wait?, apparation?, store?)`

Resolves a rift through the following paths:

1. Returns and records an already-open value.
2. Waits on an already-claimed rift.
3. Attempts synchronous module resolution.
4. Returns the supplied apparation fallback when no value is available.

### `resolve_global_rift<T>(name, wait = 20000, fallback?)`

Returns an open value, waits on a claimed rift, or returns the fallback.

### `resolve_rift_initial<T>(name, v)`

Calls `resolve_global_rift` with a 15-second wait and `v` as the fallback.

### `has(module)`

Checks for a module through the rift registry, loaded-module state, an open rift, synchronous `require`, and asynchronous import fallback.

## PROBING AND NAMED EXPORTS

### `probe<T>(label, filePath, comp_name, fallback)`

Convenience wrapper around `use_if_available`.

### `use_if_available<T>(label, filePath, comp_name, fallback, opts?)`

Provides a synchronous fallback while a named export is loaded in the background.

- Uses `label` as the rift key.
- Uses `filePath` as the import target.
- Uses `comp_name` to select the named export.
- Claims the rift to prevent repeated probes.
- Returns the fallback immediately while the rift is unresolved.
- Returns the resolved rift value on subsequent calls.

The optional `opts.store` selects the rift store.

## MODULE RESOLUTION

### Runtime import helpers

The class defines:

- `blindImport` — Dynamic import without a static module dependency.
- `blindRequire` — Optional synchronous `require` loader.
- `has_require` — Whether synchronous `require` is available.
- `hasNode` — Whether the runtime identifies as Node.
- `hasBun` — Whether the runtime identifies as Bun.

### `key_for(specifier)`

Resolves a module specifier relative to the MAELSTROM module, using `import.meta.resolve` where available and URL resolution as a fallback.

### `has_local(filePath, module?)`

Checks whether a file exists relative to the current working directory in Node or Bun environments.

### `get_module<T>(module, filePath?)`

Attempts module resolution in this order:

1. Synchronous `require`.
2. Local file read when the supplied path exists.
3. Synchronous local-path `require`.
4. Node builtin resolution.
5. Working-directory module resolution.
6. Dynamic import as the asynchronous last resort.

Synchronous paths are attempted before returning a promise.

### Namespace helpers

- `createSafeProxy()` — Creates a proxy that suppresses missing-module property access, calls, and construction.
- `toNamespace(m)` — Converts primitive module values into `{ default: m }`.
- `extractNamed(ns, comp_name)` — Retrieves a named export from a namespace or its default export.
- `normalizeFallback(fallback, fallbackDefault)` — Normalizes a value or factory into a fallback function.

## CONJURATION

### `conjure<T, F>(options)`

Cached module resolution using a rift keyed by `moduleName`.

The options include:

- `moduleName`
- `fallback`
- `module`
- `cache`
- `preferRequire`
- `importPromise`
- Environment-specific import candidates

Behavior:

- Uses `conjure_uncached` when caching is disabled or no module name is supplied.
- Returns the existing rift value when already open.
- Claims an unresolved rift before starting resolution.
- Opens the rift and records the result after resolution.
- Other callers wait on the same rift.

### `conjure_uncached<T, F>(options)`

Performs module resolution without using the cached rift flow.

Resolution considers:

1. Explicit import promises or supplied environment values.
2. Detected runtime adapters, compilers, module level, platform, and bundler.
3. Default supplied imports.
4. Forced values.
5. Named exports through synchronous `require`.
6. Preferred or ordinary synchronous `require`.
7. Dynamic import as the asynchronous fallback.

The fallback defaults to the safe proxy when no fallback is provided.

The asynchronous path uses a 10-second timeout when it has no module or import candidate to resolve.

### Library rift helpers

| Method | Description |
|---|---|
| `conjure_lib_rift<T>(label, cache?, module?)` | Conjures a module namespace and opens a rift |
| `conjure_named_lib_rift<T>(label, comp_name, cache?, module?)` | Conjures a named export and opens a rift |
| `conjure_lib_init(label, module?)` | Performs uncached module-level initialization |
| `conjure_named_lib_init<T>(label, comp_name, module?)` | Performs uncached named-export initialization |

## MODULE CACHE AND EXPORT INDEX

Loaded modules are stored in the main registry under `mod:` labels. Synchronously required modules use `req:` labels.

The export index and in-flight promise are stored directly on the corresponding rift entry.

### `isLoaded(specifier)`

Checks whether the resolved `mod:` entry is open.

### `getLoaded<T>(specifier)`

Returns the currently loaded module value, if present.

### `export_of<T>(name, specifier?)`

Retrieves a named export.

- With `specifier`, reads the export directly from that loaded module.
- Without `specifier`, searches the export indexes of loaded modules.
- Returns `undefined` when no match exists.
- Throws an error when multiple modules provide the requested export.

### `load_module<T>(specifier)`

Asynchronously imports a module.

- Returns an existing loaded value immediately.
- Reuses an existing in-flight promise.
- Opens the module rift and indexes named exports after successful import.
- Clears the in-flight reference after completion.
- Allows another attempt after an import failure.

### `require_module<T>(specifier)`

Synchronous counterpart to `load_module`.

- Returns an existing cached module when available.
- Returns `undefined` when `require` is unavailable.
- Otherwise requires the module, opens its `req:` rift, indexes exports, and records the outcome.

## SIGNAL WAITING

### `wait_for(deps, fn)`

Registers a callback for one or more dependency labels.

- A single dependency uses the entry's `onOpen` subscription.
- Multiple dependencies create one `Waiter` entry in `multiWaiters`.
- Multi-dependency callbacks run when all dependency labels have opened.
- Duplicate dependency labels are removed.
- An already-open single dependency invokes the callback immediately.

Returns a numeric waiter ID.

### `cancel_wait(id)`

Removes a matching multi-dependency waiter and returns whether it was found.

### `wait_and_promise<T>(timeoutMs, key, isOpen, current)`

Waits for a single rift through its subscription mechanism.

It subscribes before checking the supplied open state, resolves immediately if the rift opened during subscription, and optionally rejects after the timeout.

## DEFERRED TASK SCHEDULER

Deferred tasks execute when all their dependency rifts are open. Dependency values remain in the main rift registry; `deferTasks` stores task definitions and execution state.

### `defer(deps, fn)`

Registers a task and immediately runs the scheduler.

- Accepts one dependency label or an array.
- Removes duplicate dependency labels.
- Executes immediately when all dependencies are ready.
- Returns a numeric task ID.

### `provide`

Two overloads are available:

```ts
provide(k: S, v: A): void;
provide(deps: Record<S, A>): void;
```

Publishes one or more dependency values.

Each dependency rift is reset, opened with the supplied value, versioned, and recorded under the `manual` solver before the scheduler runs.

### Dependency access

| Method | Description |
|---|---|
| `resolve(k)` | Marks a dependency available by providing `undefined` |
| `invalidate(k)` | Removes a dependency rift |
| `deferHas(k)` | Checks whether a dependency rift is open |
| `deferGet<T>(k)` | Retrieves its current value |

### Cancellation and inspection

| Method | Description |
|---|---|
| `cancel(id)` | Cancels a pending task |
| `deferInspect()` | Returns scheduler statistics, pending tasks, missing dependencies, and running tasks |
| `deferClear()` | Removes pending tasks and increments the cancellation count |

### Scheduler behavior

The internal `drain()` method:

1. Prevents overlapping drain loops.
2. Finds pending tasks whose dependencies are all open.
3. Marks each task as running before execution.
4. Supplies dependency values to the task callback.
5. Tracks synchronous and asynchronous completion.
6. Records failures and invokes the error handler.
7. Removes completed or failed tasks.

The scheduler supports re-entrant drain requests through `drainAgain`.

Default handlers:

- `deferOnError` logs failed tasks.
- `deferOnSuccess` logs fulfilled tasks.

## ENVIRONMENT DETECTION

### Candidate lists

The class exposes static candidate lists:

- `MODULE_LEVEL_CANDIDATES`
- `PLATFORM_CANDIDATES`
- `COMPILER_CANDIDATES`
- `BUNDLER_CANDIDATES`
- `ADAPTER_CANDIDATES`
- `CAPABILITY_CANDIDATES`

These lists contain package and runtime identifiers used during environment detection.

### `detectCapability(name)`

Checks runtime availability for supported capabilities, including:

- Shared workers
- Service workers
- Node worker support
- BroadcastChannel
- Electron
- Named pipes
- Native message host and client

Unknown capability names return `false`.

### `detectBundler()`

Identifies Bun, pnpm, Yarn, or npm from runtime and package-manager information.

### `check(moduleName)`

Checks whether a module can be resolved.

- Uses a `check:${moduleName}` rift.
- Claims the check once.
- Attempts resolution through `conjure_uncached`.
- Records the resulting boolean.
- Returns the cached rift promise.

### `detect_environment(env_lib?)`

Runs environment detection asynchronously.

It identifies:

- The module-level package
- The platform
- Available compilers
- Available adapters
- The bundler

When `env_lib` is supplied, it is used as the module-level candidate instead of the default list.

The completed state is stored in `ENV_STATE` and recorded under `ENV_DETECTION`.

### `useEnvState()`

Returns a copy of the detected environment state, with:

```ts
{
    rt: 'ENV_DETECTION';
    subChannel: '[CSE_ENV]';
}
```

If detection has not completed, it logs a warning once and returns the current defaults.

## APPARATION

`apparation` provides fallback values and no-op factories for unresolved dependencies.

| Method | Return value |
|---|---|
| `any<T>()` | Empty object cast to `T` |
| `anyGeneric<T>()` | Empty object cast to `T` |
| `anyProp<T>(v)` | Supplied value |
| `anyProp2<T>(v)` | Supplied value cast to `T` |
| `anyProp3(v)` | Supplied value |
| `anyAs(v)` | Supplied value cast to `A` |
| `promise<T>()` | Resolved promise containing an empty object |
| `booleanPromise()` | Promise resolving to `false` |
| `void()` | No-op |
| `func<T>()` | Function returning an empty object cast to `T` |
| `funcVoid()` | No-op function |
| `universal<T>()` | Proxy-based fallback object |
| `universalNoop<T>()` | Proxy-based no-op fallback |
| `simpleNoop<T>()` | Empty object |
| `noopPromise<T>()` | Resolved promise containing an empty object |
| `noopBooleanPromise()` | Promise resolving to `false` |
| `noopVoid()` | No-op |
| `noopFunction<T>()` | Function returning an empty object |
| `thenable<T>()` | Promise-like object with a pending `then` |
| `asyncIterable<T>()` | Async iterable that remains pending |
| `null()` | `null` |
| `primitive<T>()` | `undefined` cast to `T` |
| `string()` | Empty string |
| `number()` | `0` |
| `boolean()` | `false` |
| `bigint()` | `0n` |
| `symbol()` | New symbol |
| `undefined()` | `undefined` |
| `undefinedString()` | `'undefined'` |
| `function_()` | No-op function |
| `typedArray<T>()` | Empty `Uint8Array` cast to `T` |
| `dataView()` | Empty `DataView` |
| `arrayBuffer()` | Empty `ArrayBuffer` |
| `map<K,V>()` | Empty `Map` |
| `set<T>()` | Empty `Set` |
| `date()` | Date at timestamp zero |
| `regexp()` | Empty-match regular expression |
| `error(msg?)` | Error instance |
| `iterable<T>()` | Empty array cast to `Iterable<T>` |
| `iterator<T>()` | Empty array iterator |
| `object<T>()` | Empty object |
| `plainObject<T>()` | Empty record |
| `array<T>()` | Empty array |
| `weakMap<K,V>()` | Empty `WeakMap` |
| `weakSet<T>()` | Empty `WeakSet` |
| `promiseInstance<T>()` | Resolved promise containing an empty object |
| `url()` | `about:blank` URL |
| `urlSearchParams()` | Empty `URLSearchParams` |
| `buffer()` | Empty Node Buffer or `Uint8Array` |
| `_ArrayBuffer()` | Empty `Uint8Array` |

## VALUE TYPE IDENTIFICATION

### `what_is_this_item_exactly(v)`

Returns a string identifying the supplied value's detected type, or `undefined` when no supported classification matches.

The detection order is:

1. Thenables
2. Async iterables
3. Null
4. Primitive types
5. Functions
6. ArrayBuffer views
7. Map and Set
8. Date and RegExp
9. Error
10. Synchronous iterables
11. Array
12. WeakMap and WeakSet
13. Promise
14. ArrayBuffer
15. Node Buffer
16. URL and URLSearchParams
17. Plain objects

## RESET

### `reset()`

Clears MAELSTROM's runtime state:

- Rift registry
- Multi-dependency waiters
- Deferred task records
- Deferred task statistics
- Automatic cloud-store selection
- Environment detection state

It restores the default environment state and clears the one-time environment warning flag only through the existing constructor state initialization; the method itself resets `warnedUseBeforeReady` only if explicitly assigned elsewhere.

## EXPORT

```ts
export const maelstrom = new MAELSTROM();
```

The module exports the singleton `maelstrom`, which provides the shared registry, solver operations, module resolution, dependency signaling, deferred scheduler, environment detection, and fallback factory surface.


</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[WAITER]</span> </strong></summary>


# `WAITER_REGISTRY`

`WAITER_REGISTRY` is a keyed dependency-waiting registry. It tracks callbacks against one or more signal keys and executes each callback when all registered dependencies have been marked ready.

Unlike a single-key subscription mechanism, the registry maintains explicit indexes for pending waiters, allowing readiness notifications and cancellation to operate across multiple dependencies.

## TYPES

### `WaiterDep`

```ts
type WaiterDep = SignalKey | SignalKey[];
```

Accepts one signal key or an array of signal keys.

### `WaiterFn<T = any>`

```ts
type WaiterFn<T = any> = (v?: T) => void;
```

Callback invoked when all registered dependencies are ready.

### `WaiterEntry`

```ts
type WaiterEntry = {
    id: number;
    deps: SignalKey[];
    fn: WaiterFn;
    ready: Set<SignalKey>;
};
```

| Property | Description |
|---|---|
| `id` | Unique waiter identifier |
| `deps` | Dependency keys being tracked |
| `fn` | Callback to execute |
| `ready` | Set of dependencies already marked ready |

## CLASS

```ts
export class WAITER_REGISTRY
```

### Constructor and root

```ts
constructor(root: A = null)
FULFIL_THIS_NOW(r: A)
REFRESH_ROOT()
```

- `root` stores the supplied root reference.
- `FULFIL_THIS_NOW(r)` replaces the root reference.
- `REFRESH_ROOT()` retrieves the root through `acquire_root('WAITER_REGISTRY')`.

### Internal state

| Field | Description |
|---|---|
| `entries` | Maps waiter IDs to their `WaiterEntry` records |
| `byKey` | Maps each signal key to the IDs of waiters depending on it |
| `nextId` | Incrementing waiter identifier counter |

## METHODS

### `WAIT_FOR<T = any>(deps, fn): number`

Registers a callback against one or more dependencies.

```ts
WAIT_FOR<T = any>(
    deps: WaiterDep,
    fn: WaiterFn<T>
): number
```

Behavior:

1. Normalizes the dependency argument into an array.
2. Removes duplicate dependency keys.
3. Generates a unique waiter ID.
4. Creates a `WaiterEntry` with an empty `ready` set.
5. Registers the entry in `entries`.
6. Adds its ID to the `byKey` index for every dependency.
7. Returns the waiter ID.

### `READY<T = any>(k, v?): void`

Marks a dependency as ready.

```ts
READY<T = any>(k: SignalKey, v?: T): void
```

For every waiter registered against the supplied key:

1. Adds the key to the entry's `ready` set.
2. Checks whether every dependency has become ready.
3. Removes completed waiters from both indexes.
4. Invokes the callback with the supplied value.

Callback errors are rethrown asynchronously through `queueMicrotask`, so one callback error does not interrupt processing of the remaining waiters.

### `CANCEL_WAIT(id): boolean`

Cancels a registered waiter by ID.

Returns `true` when the waiter existed and was removed, otherwise `false`.

### Internal `remove(id): boolean`

Removes a waiter from:

- The `entries` map.
- Every dependency's ID set in `byKey`.
- Any empty `byKey` sets after removal.

Returns whether an entry was removed.

## USAGE

### Single dependency

```ts
public waiters = new WAITER_REGISTRY();

waiters.WAIT_FOR('staff', () => {
    staff.initializeSomething();
});
```

The callback runs when `staff` is marked ready.

### Multiple dependencies

```ts
waiters.WAIT_FOR(['staff', 'database'], () => {
    // Runs after both dependencies are ready.
});
```

The callback runs only after both keys have been marked ready.

### Marking dependencies ready

```ts
this.waiters.READY(atom.key, value);
```

The supplied value is passed to callbacks released by that readiness notification.

### Cancellation

```ts
const id = waiters.WAIT_FOR(['staff', 'database'], initialize);

waiters.CANCEL_WAIT(id);
```


</details>


## PERFORMANCE


 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[MICROTASKS]</span> </strong></summary>

# `MICROTASK`

A microtask scheduling and batching utility built entirely on `queueMicrotask` and Promise-compatible microtask ordering. It deliberately avoids `process.nextTick` so scheduling behavior remains consistent across Node.js and Bun.

## Exports

| Export | Signature | Description |
|---|---|---|
| `microtask` | `(fn: FlushCallback): void` | Schedules a callback directly on the microtask queue. |
| `batch` | `<T>(fn: () => T): T` | Groups synchronous writes into one scheduled flush. |
| `openBatch` | `(): BatchScope` | Opens an explicit batch scope that can span asynchronous work. |
| `closeBatch` | `(scope: BatchScope): void` | Closes an explicit batch scope. |
| `isBatching` | `(): boolean` | Reports whether a regular or explicit batch is active. |
| `onFlush` | `(cb: FlushCallback): void` | Registers a callback for the next batch flush. |
| `flush` | `<T>(fn?: () => T): T \| void` | Runs an optional function and synchronously flushes pending callbacks. |

## Internal State

| Variable | Purpose |
|---|---|
| `batchDepth` | Tracks nested synchronous `batch()` and `flush(fn)` calls. |
| `openScopes` | Tracks explicit batch scopes. |
| `dirty` | Set of callbacks awaiting execution. |
| `flushScheduled` | Prevents scheduling multiple pending drain microtasks. |

`FlushCallback` is `() => void`. `BatchScope` is a `symbol`.

## Scheduling

### `microtask(fn)`

Schedules a callback directly using `queueMicrotask`.

```ts
microtask(() => {
    updateSomething();
});
```

This is raw scheduling: it does not batch or deduplicate callbacks.

### `onFlush(cb)`

Registers a callback in the pending callback set and schedules a drain.

```ts
onFlush(() => {
    notifySubscribers();
});
```

Callbacks are stored in a `Set`, so registering the same function more than once before a flush results in one execution.

### Drain behavior

The internal `scheduleDrain()` schedules at most one drain microtask at a time.

When `drain()` runs:

1. Clears the scheduled flag.
2. Returns if there are no pending callbacks.
3. If an explicit batch scope remains open, retains the callbacks and schedules another drain.
4. Otherwise, swaps out the pending callback set and executes its callbacks.

Callbacks registered during a drain are placed in the new pending set and handled by a subsequent drain.

## Batching

### `batch(fn)`

Groups writes performed during the synchronous execution of `fn`.

```ts
batch(() => {
    store.set('name', 'Ada');
    store.set('status', 'ready');
});
```

Nested calls collapse into the outer synchronous batch.

For asynchronous functions, batching covers only the synchronous prefix before the first `await`. The batch depth is decremented as soon as the function returns control, preventing subscribers from remaining stale throughout an arbitrary asynchronous wait.

The function's return value is preserved.

### `openBatch()` and `closeBatch(scope)`

Provides explicit control over a batch that intentionally spans asynchronous work.

```ts
const scope = openBatch();

try {
    updateLocalState();
    await performOperation();
    updateRelatedState();
} finally {
    closeBatch(scope);
}
```

Each call to `openBatch()` creates a unique symbol and adds it to `openScopes`.

While at least one explicit scope remains open, scheduled drains retain pending callbacks instead of executing them. Closing the final scope schedules a drain when callbacks are pending.

Nested explicit scopes remain active until all have been closed.

### `isBatching()`

Returns `true` when either a synchronous batch is active or at least one explicit scope remains open.

```ts
if (isBatching()) {
    // A batch is currently active.
}
```

## Synchronous Flush

### `flush(fn?)`

Without an argument, synchronously executes pending callbacks:

```ts
flush();
```

With a function, executes it inside a synchronous batch, then flushes pending callbacks:

```ts
const result = flush(() => {
    store.set('ready', true);
    return 'complete';
});
```

The function's return value is returned after the flush.

The internal `flushSync()` refuses to execute while an explicit batch scope is open. This prevents a synchronous flush from prematurely ending a deliberately asynchronous batch.

A regular `batch()` scope does not prevent an explicit synchronous flush.

## Execution Model

| Operation | Execution behavior |
|---|---|
| `microtask(fn)` | Direct microtask scheduling; no deduplication. |
| `onFlush(cb)` | Deduplicated callback registration followed by scheduled draining. |
| `batch(fn)` | Groups synchronous work; nested batches collapse. |
| `openBatch()` | Prevents pending callbacks from being flushed until all explicit scopes close. |
| `closeBatch(scope)` | Releases one explicit scope and schedules pending work when the final scope closes. |
| `flush()` | Synchronously drains pending callbacks unless an explicit scope is open. |
| `flush(fn)` | Runs a function, then synchronously drains pending callbacks. |



</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[PERFORMANCE TIMER]</span> </strong></summary>

# `PERFORMANCE_TIMER`

A performance measurement and tracing utility built on Node.js `AsyncLocalStorage` and `performance.now()`. It records execution durations, nested timing relationships, checkpoints, success/failure status, and optional performance events through a supplied `staff` transport.

## Types

### `TimingRecord`

| Property | Type | Description |
|---|---|---|
| `id` | `string` | Unique timing identifier. |
| `label` | `string` | Timing operation name. |
| `scopeId` | `string` | Request or execution scope identifier. |
| `parentId` | `string \| null` | Parent timing identifier. |
| `start` | `number` | Start timestamp from `performance.now()`. |
| `end` | `number` | End timestamp. |
| `duration` | `number` | Inclusive execution duration in milliseconds. |
| `selfDuration` | `number` | Duration excluding direct child timings. |
| `success` | `boolean` | Whether the operation completed successfully. |
| `error` | `string?` | Recorded error message. |
| `checkpoints` | `Checkpoint[]` | Intermediate timing measurements. |

Each checkpoint contains:

```ts
{
    label: string;
    at: number;
    sinceStart: number;
    sinceLast: number;
}
```

### `Gate`

```ts
interface Gate {
    match: (timing: TimingRecord) => boolean;
    execute: (timing: TimingRecord) => void;
}
```

A gate evaluates completed timing records and executes its callback when its match function returns `true`.

## Construction

```ts
const timer = new PERFORMANCE_TIMER(staff?);
```

The optional `staff` argument provides transport integration for checkpoint and completed-record events.

## Timing Lifecycle

### `start(label, opts?)`

```ts
start(
    label: string,
    opts?: {
        scopeId?: string;
        parentId?: string;
        gates?: Gate[];
    }
): string
```

Creates a timing record and returns its unique ID.

- Uses the supplied `scopeId`, or the current asynchronous request scope.
- If no request scope exists, generates a scope ID using the current timestamp and a random suffix.
- Associates the timing with `parentId` when provided.
- Registers supplied gates with the timer.

### `checkpoint(id, label)`

```ts
checkpoint(id: string, label: string): void
```

Records an intermediate timestamp without ending the timing.

Each checkpoint captures:

- `at`: absolute `performance.now()` timestamp.
- `sinceStart`: elapsed time since the timing began.
- `sinceLast`: elapsed time since the previous checkpoint, or since the start for the first checkpoint.

When `staff` is configured, the checkpoint is sent through:

```ts
staff.send(
    { id, label, sinceStart, sinceLast },
    '[PERF_TIMER]',
    `${timing.scopeId}:checkpoint`
);
```

### `end(id, opts?)`

```ts
end(
    id: string,
    opts?: {
        success?: boolean;
        error?: any;
    }
): void
```

Completes a timing record.

- Calculates inclusive duration.
- Defaults `success` to `true`.
- Converts an optional error into a string message.
- Calculates self duration by subtracting direct child durations.
- Executes registered gates.
- Invokes registered record handlers.
- Sends the completed record through `staff` when configured.

The self-duration calculation is:

\[
\text{selfDuration} =
\text{duration} - \sum \text{direct child durations}
\]

## Automatic Measurement

### `measure(label, fn, opts?)`

```ts
async measure<T>(
    label: string,
    fn: (checkpoint: (label: string) => void) => Promise<T> | T,
    opts?: {
        scopeId?: string;
        parentId?: string;
        gates?: Gate[];
    }
): Promise<T>
```

Wraps a function in the complete start/checkpoint/end lifecycle.

```ts
const result = await timer.measure('database-query', async checkpoint => {
    checkpoint('query-start');

    const rows = await database.query();

    checkpoint('query-complete');
    return rows;
});
```

On success, the timing ends with `success: true` and the result is returned.

On failure, the timing ends with `success: false`, records the error, and rethrows it.

## Retrieving Timings

### `getTiming(id)`

Returns a timing record with formatted duration fields, or `undefined` when the ID does not exist.

Additional fields:

| Property | Description |
|---|---|
| `durationFormatted` | Duration formatted to three decimal places with `ms`. |
| `selfDurationFormatted` | Self duration formatted to three decimal places with `ms`. |

### `getChildren(parentId)`

Returns the timing records associated with a parent's direct child IDs. Returns an empty array when no children are registered.

### `getReport(label?)`

Returns aggregate statistics for completed timings, optionally filtered by label.

Returns `null` when no matching completed timings exist.

The report contains:

| Field | Description |
|---|---|
| `count` | Number of completed timings. |
| `successful` | Number of successful timings. |
| `failed` | Number of failed timings. |
| `min` / `max` | Minimum and maximum duration. |
| `avg` | Average duration. |
| `p50` / `p90` / `p99` | Duration percentile values. |
| `minFormatted` / `maxFormatted` | Formatted minimum and maximum. |
| `avgFormatted` | Formatted average. |
| `p50Formatted` / `p90Formatted` / `p99Formatted` | Formatted percentiles. |

Percentile values are selected from the sorted duration list using the index:

```ts
Math.min(durations.length - 1, Math.floor(durations.length * p))
```

## Trace Export

### `exportTrace(label?)`

```ts
exportTrace(label?: string): string
```

Exports completed timings as JSON in Trace Event Format.

The output contains:

- `B` events for timing starts.
- `E` events for timing ends, including success and error metadata.
- `i` events for checkpoints.

Timestamps are converted from milliseconds to microseconds.

The generated trace JSON can be opened in Chrome tracing (`chrome://tracing`), Perfetto, and speedscope-compatible workflows.

```ts
const trace = timer.exportTrace();
```

## Record Handlers

### `onRecord(handler)`

```ts
onRecord(handler: (timing: TimingRecord) => void): () => void
```

Registers a callback invoked whenever a timing ends.

Returns an unsubscribe function that removes the handler.

```ts
const unsubscribe = timer.onRecord(timing => {
    console.log(timing.label, timing.duration);
});

unsubscribe();
```

## Request Scoping

### `runInScope(requestId, fn)`

```ts
runInScope<T>(requestId: string, fn: () => T): T
```

Runs a function inside an `AsyncLocalStorage` request context.

Timing operations started within that asynchronous context automatically inherit its `requestId` as their `scopeId`, unless an explicit scope ID is supplied.

```ts
await timer.runInScope('request-123', async () => {
    await timer.measure('load-user', async () => {
        return database.getUser();
    });

    await timer.measure('load-settings', async () => {
        return database.getSettings();
    });
});
```

This allows request-level timing association without manually passing scope identifiers through every function.

## Transport Events

When constructed with a `staff` instance, the timer publishes two event types:

| Event | Channel | Payload |
|---|---|---|
| Checkpoint | `${scopeId}:checkpoint` | `{ id, label, sinceStart, sinceLast }` |
| Completed record | `${scopeId}:record` | Complete `TimingRecord` |

Both use the `[PERF_TIMER]` transport label.

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[QUEUE]</span> </strong></summary>

# `QUEUE` / `TIERED_QUEUE`

A task scheduling system with configurable concurrency, retries, timeouts, priority ordering, queue controls, idle notifications, and sequential priority-tier execution.

The module provides two queue abstractions:

- `Queue`: Executes asynchronous tasks with configurable concurrency.
- `TIERED_QUEUE`: Stages tasks into numeric priority tiers and executes each tier as a concurrent batch before advancing to the next.

## `Queue`

### Construction

```ts
const q = new Queue(optionsOrConcurrent);
```

Accepts either a concurrency number or a `QueueOptions` object.

| Option | Default | Description |
|---|---:|---|
| `concurrent` | `1` | Maximum number of simultaneously running tasks. |
| `retry` | `0` | Number of additional attempts after failure. |
| `timeout` | `0` | Task timeout in milliseconds. Zero disables timeouts. |
| `priority` | `false` | Enables priority-based insertion. |
| `onError` | No-op | Called with the error and failed task. |
| `onComplete` | No-op | Called with the successful result. |
| `onChange` | No-op | Called when queue state changes. |

### Running Tasks

#### `run(taskOrTasks, taskOptions?)`

```ts
run<T>(
    taskOrTasks:
        | (() => Promise<T>)
        | (() => Promise<T>)[],
    taskOptions?: {
        priority?: number;
        label?: string;
    }
): Promise<T | T[]>
```

Accepts one asynchronous task or an array of tasks.

- A single task returns its result.
- An array schedules every task and returns `Promise.all()` results.
- Optional task metadata includes `priority` and `label`.

```ts
const result = await q.run(async () => {
    return await loadData();
});

const results = await q.run([
    () => loadUsers(),
    () => loadSettings(),
]);
```

#### Priority ordering

When `priority` is enabled, tasks are inserted before the first queued task with a lower priority value.

Higher numeric priority values therefore execute earlier. Tasks with equal priority retain insertion order.

When priority ordering is disabled, tasks are appended to the queue.

### Execution and Retry

The queue starts processing automatically when tasks are added, unless paused.

It fills available concurrency slots and starts additional tasks as running tasks settle.

Each task is executed through `executeWithRetry()`:

- `retry` controls the number of additional attempts.
- `timeout` applies a timeout to each individual attempt.
- Exhausted failures reject the task promise and invoke `onError`.
- Successful execution resolves the task promise and invokes `onComplete`.

Timeouts reject with `Error('Timeout')`.

### Queue Lifecycle

| Method | Description |
|---|---|
| `start()` | Resumes processing and checks whether the queue is idle. |
| `stop()` | Pauses the queue from starting additional tasks. |
| `clear()` | Removes pending tasks and notifies listeners of the change. |
| `flush()` | Removes pending tasks and rejects their promises with `Error('Queue flushed')`. |
| `onIdle()` | Resolves immediately if idle, otherwise waits for the next fully idle state. |

`stop()` does not cancel tasks already running.

`clear()` removes pending tasks without explicitly rejecting their promises. `flush()` rejects them.

### Idle Notifications

```ts
await q.onIdle();
```

Resolves when:

- No pending tasks remain.
- No tasks are running.
- The queue is not paused.

Idle listeners are stored and resolved together when the queue reaches that state. No polling is used.

### Queue Manipulation

| Method | Description |
|---|---|
| `removeAt(index)` | Removes a pending task and rejects it with `Error('Removed from queue')`. |
| `moveUp(index)` | Moves a pending task one position toward the front. |
| `moveDown(index)` | Moves a pending task one position toward the end. |
| `moveToNext(index)` | Moves a pending task to the front. |
| `moveToLast(index)` | Moves a pending task to the end. |

These operations affect pending tasks, not running tasks.

### Inspection

| Method / Property | Description |
|---|---|
| `peek()` | Returns the next pending task. |
| `peekAll()` | Returns a copy of all pending tasks. |
| `getRunning()` | Returns a copy of currently running tasks. |
| `size` | Number of pending tasks. |
| `isEmpty` | Whether no pending tasks exist. |
| `isRunning` | Whether at least one task is active. |
| `isPausedState` | Whether the queue is paused. |
| `pending` | Number of pending tasks. |
| `active` | Number of running tasks. |

### Configuration Updates

```ts
q.setOptions({
    concurrent: 4,
    retry: 2,
    timeout: 5000,
});
```

Updates the queue configuration by merging the supplied partial options with the existing options.

## `queue()` Factory

Creates a `Queue` instance and exposes its operations through a callable function.

```ts
const tasks = queue({
    concurrent: 4,
    retry: 2,
    timeout: 5000,
});
```

The returned function schedules tasks directly:

```ts
const result = await tasks(async () => {
    return await loadData();
});
```

It exposes the following attached methods:

| Method | Description |
|---|---|
| `start()` | Resumes processing. |
| `stop()` | Pauses processing. |
| `clear()` | Clears pending tasks. |
| `flush()` | Rejects and removes pending tasks. |
| `onIdle()` | Waits for the queue to become idle. |
| `peek()` | Returns the next pending task. |
| `peekAll()` | Returns all pending tasks. |
| `getRunning()` | Returns active tasks. |
| `removeAt(i)` | Removes a pending task by index. |
| `moveUp(i)` | Moves a task up one position. |
| `moveDown(i)` | Moves a task down one position. |
| `moveToNext(i)` | Moves a task to the front. |
| `moveToLast(i)` | Moves a task to the end. |
| `setOptions(opts)` | Updates queue configuration. |

The factory also exposes live getter properties:

- `size`
- `isEmpty`
- `isRunning`
- `isPausedState`
- `pending`
- `active`

## `TIERED_QUEUE`

Executes tasks in ascending numeric priority tiers.

Tasks are staged when registered and remain dormant until `execute()` releases their tier. All tasks in a tier are queued before that tier starts, allowing the queue's concurrency configuration to control execution within the batch.

The next tier does not begin until every task in the current tier has settled and the tier queue has reached its idle state.

### Construction

```ts
const tiers = new TIERED_QUEUE({
    defaultConcurrent: 100,
    retry: 0,
    timeout: 30_000,
    onTierComplete: (tier, results) => {},
    onTierError: (tier, error) => {},
});
```

| Option | Default | Description |
|---|---:|---|
| `defaultConcurrent` | `100` | Default concurrency for each tier. |
| `retry` | `0` | Default retry count. |
| `timeout` | `30_000` | Default task timeout in milliseconds. |
| `onTierComplete` | — | Called after a tier finishes with its accumulated successful results. |
| `onTierError` | — | Called when a task in a tier fails. |

### `REG(tier, options?)`

Registers a numeric tier and creates its underlying queue if it does not already exist.

```ts
tiers.REG(0);
tiers.REG(1, { concurrent: 8 });
tiers.REG(2, { timeout: 10_000 });
```

Tier queues are created paused. Their configuration uses the following precedence:

1. Tier-specific options.
2. `TIERED_QUEUE` constructor configuration.
3. Defaults.

The tier queues use priority ordering disabled.

Tiers are stored in ascending numeric order.

### `ADD(tier, label, task, options?)`

```ts
ADD<T = A>(
    tier: N,
    label: S,
    task: () => P<T>,
    options?: TierOptions
): P<T | UD>
```

Registers a task in a tier without executing it.

The returned promise settles when `execute()` reaches that tier.

```ts
const userTask = tiers.ADD(
    0,
    'load-user',
    async () => {
        return await loadUser();
    },
);
```

A failed task resolves its returned promise with `undefined` and is still reported as a queue failure through the underlying queue.

### `ADD_BATCH(tier, tasks, options?)`

```ts
ADD_BATCH<T>(
    tier: N,
    tasks: Array<{
        label: S;
        task: () => Promise<T>;
    }>,
    options?: TierOptions
): P<(T | UD)[]>
```

Adds multiple tasks to the same priority tier.

```ts
const results = tiers.ADD_BATCH(1, [
    {
        label: 'load-users',
        task: () => loadUsers(),
    },
    {
        label: 'load-settings',
        task: () => loadSettings(),
    },
]);
```

The returned promise uses `Promise.all()` over the individual staged task promises.

All tasks added to the tier, including tasks previously registered at that tier, are released together when execution reaches it.

### `execute()`

```ts
async execute(): Promise<Map<N, A[]>>
```

Executes registered tiers in ascending numeric order.

For each tier:

1. Retrieves its staged tasks.
2. Removes the staged entries from the staging list.
3. Adds every task to the paused tier queue.
4. Starts the tier queue.
5. Waits for all scheduled task promises to settle using `Promise.allSettled()`.
6. Waits for the queue's idle notification.
7. Invokes `onTierComplete`.
8. Stores a snapshot of successful results in the returned map.

```ts
const results = await tiers.execute();
```

The returned `Map` associates each tier number with its accumulated successful results.

A task failure does not prematurely advance execution to the next tier. Failed tasks resolve their individual `ADD()` promises with `undefined`, while successful values are accumulated in the tier's result list.

### `getStatus()`

Returns a status snapshot for every registered tier.

```ts
tiers.getStatus();
```

Each entry contains:

| Property | Description |
|---|---|
| `tier` | Numeric tier identifier. |
| `staged` | Number of tasks waiting for release. |
| `pending` | Number of tasks in the underlying queue. |
| `active` | Number of currently running tasks. |
| `completed` | Number of successful results accumulated. |

### `clear()`

Clears staged tasks, underlying pending queues, and accumulated results.

- Staged task promises are rejected with `Tier ${tier} cleared before execution`.
- Each underlying queue has its pending tasks cleared.
- Accumulated tier results are emptied.
- Already-running tasks are not force-cancelled.

## Tier Execution Model

For tiers `0`, `1`, and `2`, execution follows this sequence:

```text
Tier 0
  ├── Task A ──┐
  ├── Task B ──┼── All settle
  └── Task C ──┘
        |
        v
Tier 1
  ├── Task D ──┐
  └── Task E ──┴── All settle
        |
        v
Tier 2
  └── Task F ───── All settle
        |
        v
     Complete
```

Concurrency applies within each tier. Numeric tier ordering controls when each batch is released.

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[SCHEDULER]</span> </strong></summary>
# `SCHEDULER`

A priority-based cooperative task scheduler with per-scope queues, round-robin scope selection, cancellation, reprioritization, request scoping, yielding, and time-budgeted chunk execution.

Tasks are organized by priority tier and execution scope. Within each priority tier, scopes are selected round-robin so that background work belonging to one request does not monopolize execution over other scopes at the same priority.

## Types

### `Priority`

```ts
type Priority =
    | 'immediate'
    | 'user-blocking'
    | 'normal'
    | 'background'
    | 'idle';
```

### `Task`

```ts
export interface Task {
    cancel(): void;
    reprioritize(next: Priority): void;
}
```

The handle returned by scheduling operations exposes cancellation and reprioritization.

### `ScheduledTask`

```ts
export interface ScheduledTask {
    priority: Priority;
    scope: symbol | string;
    fn: () => void;
    signal?: AbortSignal;
    cancelled: boolean;
}
```

### Other Types

| Type | Definition |
|---|---|
| `BatchScope` | `symbol` |
| `FlushCallback` | `() => void` |

## Scheduler State

### `PRIORITY_ORDER`

```ts
export const PRIORITY_ORDER: Priority[] = [
    'immediate',
    'user-blocking',
    'normal',
    'background',
    'idle',
];
```

Defines the priority traversal order. The scheduler selects work from the first nonempty eligible tier.

### `GLOBAL_SCOPE`

A shared symbol used as the default global scope.

```ts
export const GLOBAL_SCOPE = Symbol('global-scope');
```

### `queues`

```ts
Record<Priority, Map<symbol | string, ScheduledTask[]>>
```

Stores pending tasks by priority and scope.

Each priority has its own map, and each scope maps to a FIFO task array.

### `scopeCursors`

```ts
Record<Priority, number>
```

Tracks the round-robin position independently for each priority tier.

### Internal Scheduling State

| Variable | Purpose |
|---|---|
| `loopScheduled` | Prevents duplicate scheduled drain loops. |
| `currentScope` | Scope inherited by newly scheduled tasks. |

## Scheduling

### `schedule(fn, opts?)`

```ts
schedule(
    fn: () => void,
    opts?: {
        priority?: Priority;
        scope?: string;
        signal?: AbortSignal;
    }
): Task
```

Schedules a callback and returns a task handle.

Defaults:

| Option | Default |
|---|---|
| `priority` | `'normal'` |
| `scope` | Current scope |
| `signal` | `undefined` |

```ts
const task = schedule(() => {
    performBackgroundWork();
}, {
    priority: 'background',
    scope: 'request-123',
});
```

Non-immediate tasks are appended to their scope's queue and trigger the scheduling loop.

`immediate` tasks bypass the tier queues and are scheduled directly through `microtask()`.

### Cancellation

```ts
task.cancel();
```

Marks the scheduled task as cancelled. When execution reaches the task, `runOne()` skips it.

### Reprioritization

```ts
task.reprioritize('user-blocking');
```

Moves a pending task from its existing priority queue into its new priority queue.

The operation:

1. Returns without changes if the task is cancelled or already has the requested priority.
2. Removes the task from its previous scope queue when present.
3. Removes the old scope entry if its queue becomes empty.
4. Updates the task's priority.
5. Enqueues it at the new priority.

## Priority Scheduling

### `enqueue(task)`

Routes tasks according to priority.

- `immediate`: schedules `runOne()` using `microtask()`.
- Other priorities: inserts the task into the corresponding scope queue and schedules the drain loop.

### `scheduleLoop()`

Schedules a drain through `setImmediate()`.

A scheduling flag ensures that only one drain callback is pending at a time.

### `pickNext()`

Selects the next eligible task.

The selection process:

1. Traverses `PRIORITY_ORDER`.
2. Skips the `immediate` tier.
3. Selects the next scope using that tier's round-robin cursor.
4. Removes the first task from that scope's FIFO queue.
5. Removes empty scope queues.
6. Advances the scope cursor.
7. Returns the selected task.

Higher-priority tiers are considered before lower-priority tiers.

### `runOne(task)`

Executes a scheduled callback unless it has been cancelled or its optional `AbortSignal` is aborted.

During execution, `currentScope` is temporarily set to the task's scope and restored afterward.

### `drainOne()`

Processes one selected task and schedules another drain when queued work remains.

This keeps non-immediate scheduling incremental rather than draining an entire tier in one callback.

## Request Scoping

### `withRequestScope(requestId, fn)`

```ts
withRequestScope<T>(
    requestId: string,
    fn: () => T
): T
```

Temporarily assigns a request identifier as the current scheduling scope.

Tasks scheduled inside the callback inherit that scope unless they specify another one.

```ts
withRequestScope('request-123', () => {
    schedule(() => loadUser(), {
        priority: 'normal',
    });

    schedule(() => loadSettings(), {
        priority: 'background',
    });
});
```

The previous scope is restored after the callback returns, including when it throws.

## Cooperative Yielding

### `yieldToScheduler()`

```ts
yieldToScheduler(): Promise<void>
```

Returns a promise that resolves when a scheduled normal-priority callback executes.

```ts
await yieldToScheduler();
```

The continuation always re-enters at `'normal'` priority, regardless of the caller's original priority.

This prevents a background task from allowing its continuation to jump ahead of pending user-blocking work merely because it yielded.

The continuation is scheduled using the current scope.

## Chunked Execution

### `scheduleChunked(work, opts?)`

```ts
scheduleChunked(
    work:
        | Iterable<() => void>
        | Iterator<() => void>,
    opts?: {
        priority?: Priority;
        scope?: string;
        chunkBudgetMs?: number;
    }
): Task
```

Schedules an iterable or iterator of synchronous work functions and executes them in time-budgeted chunks.

Defaults:

| Option | Default |
|---|---|
| `priority` | `'normal'` |
| `scope` | Current scope |
| `chunkBudgetMs` | `5` milliseconds |

```ts
const task = scheduleChunked(workItems, {
    priority: 'background',
    scope: 'request-123',
    chunkBudgetMs: 5,
});
```

Each chunk:

1. Records its start time using `performance.now()`.
2. Retrieves and executes work functions from the iterator.
3. Checks elapsed time after each function.
4. Stops the current chunk when the time budget is reached.
5. Schedules another chunk at the configured priority and scope.

Execution continues until the iterator is exhausted or the task is cancelled.

### Chunked Task Controls

The returned `Task` handle provides:

- `cancel()`: prevents further chunks from executing.
- `reprioritize(next)`: changes the priority used when scheduling subsequent chunks.

## Execution Model

| Priority | Scheduling behavior |
|---|---|
| `immediate` | Direct `microtask()` execution. |
| `user-blocking` | First queued priority tier. |
| `normal` | Executed after higher-priority work. |
| `background` | Executed after normal work. |
| `idle` | Executed after all higher-priority tiers. |

Within each non-immediate tier, scopes receive round-robin selection while tasks within an individual scope retain FIFO ordering.

Chunked tasks yield back to the scheduler between chunks, allowing other eligible work to execute.

</details>





## ZERO

 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[ARCANE REGISTRY]</span> </strong></summary>

# `zeroArcaneRegistry`

A registry initialization function that uses `useSXX` to track whether its initialization pass has completed and populates `ZeroStore` from its existing entries.

## Imports

```ts
import { useSXX } from '../tricks/ssx';
import ZeroStore from './zero_store';
```

## Signature

```ts
export function zeroArcaneRegistry<T = A>(
    name: string,
    result: A
)
```

## Initialization

The function creates a boolean state value initialized to `false`:

```ts
const [s, setS] = useSXX<Boolean>(false);
```

When `s` is `false`, it:

1. Retrieves all entries through `ZeroStore.getAll()`.
2. Iterates over the returned entries.
3. Checks each key using `ZeroStore.get(key)`.
4. Skips keys whose existing value is not `undefined`.
5. Iterates over the entry's values and writes each one using `ZeroStore.set(key, value)`.
6. Sets the initialization state to `true`.

```ts
if (s === false) {
    for (const [key, values] of Object.entries(ZeroStore.getAll())) {
        const existing = ZeroStore.get(key);
        if (existing !== undefined) continue;

        for (const value of values) {
            ZeroStore.set(key, value);
        }
    }

    setS(true);
}
```

## Parameters

| Parameter | Type | Description |
|---|---|---|
| `name` | `string` | Named input parameter. |
| `result` | `A` | Result input parameter. |

## Dependencies

| Dependency | Usage |
|---|---|
| `useSXX` | Maintains the initialization boolean state. |
| `ZeroStore.getAll()` | Retrieves existing store entries. |
| `ZeroStore.get(key)` | Checks whether a key already has a value. |
| `ZeroStore.set(key, value)` | Writes values into the store. |

## Initialization Behavior

The state flag prevents the initialization loop from running again after `setS(true)` takes effect. Existing keys with non-`undefined` values are skipped; keys with `undefined` values are populated from the retrieved entries.

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[NEXUS MIRROR]</span> </strong></summary>

# `zeroNexusMirror`

Creates a nested Proxy that mirrors values stored in `ZeroStore`. Missing categories and properties are represented by stubs created through `makeStub`, with caller-location metadata supplied by `getCallerLocation`.

## Imports

```ts
import { getCallerLocation } from "../tricks/get_caller_location";
import { makeStub } from "../tricks/stubs";
import ZeroStore from "./zero_store";
```

## Signature

```ts
export function zeroNexusMirror(excludeName: string)
```

## Proxy Structure

The returned value is a Proxy over an empty object.

### Category access

The outer Proxy intercepts property access:

```ts
get: (_t: A, name: string) => {
    if (name === excludeName) {
        return makeStub({
            category: excludeName,
            key: name,
            location: getCallerLocation()
        });
    }

    return new Proxy([], { /* ... */ });
}
```

- If the requested name matches `excludeName`, returns a stub immediately.
- Otherwise, returns an inner Proxy over an empty array.

### Property access

The inner Proxy retrieves the category's value from `ZeroStore`:

```ts
const arr = ZeroStore.get(name);
```

Its behavior is:

| Condition | Result |
|---|---|
| The category value is falsy | Returns a stub. |
| `prop in arr` | Returns the existing property value. |
| Property does not exist | Returns a stub. |

Stub creation includes:

```ts
makeStub({
    category: name,
    key: String(prop),
    location: getCallerLocation()
});
```

Existing properties are returned directly from the stored value.

## Parameters

| Parameter | Type | Description |
|---|---|---|
| `excludeName` | `string` | Category name that receives a stub immediately instead of an inner Proxy. |

## Dependencies

| Dependency | Purpose |
|---|---|
| `ZeroStore.get(name)` | Retrieves the stored category value. |
| `makeStub(options)` | Creates a stub for excluded categories, missing categories, and missing properties. |
| `getCallerLocation()` | Supplies caller-location metadata to each stub. |

## Usage

```ts
const mirror = zeroNexusMirror("excludedCategory");

const category = mirror.someCategory;
const value = mirror.someCategory.someProperty;
```

The returned mirror resolves category and property access dynamically against `ZeroStore`.

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[STORE]</span> </strong></summary>
# `ZeroStore`

An EventEmitter-based in-memory store with keyed and global subscriptions, asynchronous change iteration, conditional waiting, scoped persistent state, batching notifications, and time-travel history integration.

## Imports and Exports

```ts
import { EventEmitter } from "node:events";

export { ZeroStore };
export default new ZeroStore();
```

The module exports the `ZeroStore` class as a named export and a shared singleton as its default export.

## Class Structure

```ts
class ZeroStore extends EventEmitter
```

| Field | Description |
|---|---|
| `#waiters` | Per-key sets of pending wait operations. |
| `#data` | Primary key-value storage. |
| `#subs` | Key-specific subscriber sets. |
| `#anySubs` | Global subscriber set. |
| `#frozen` | Prevents subsequent calls to `set`. |
| `#context` | Nested context maps used by scoped storage. |
| `r` | Default root key: `"_root_k_"`. |
| `m` | Default master key: `"_master_k_"`. |
| `s` | Default slave key: `"_slave_k_"`. |

## Scoped Storage

### `getMap<K, V>(slave?, master?, rk?)`

Returns a nested `M2<K, V>` map associated with a root, master, and slave scope.

```ts
public getMap<K, V>(
    slave: A = this.s,
    master: A = this.m,
    rk: A = this.r
): M2<K, V>
```

The hierarchy is:

```text
root
└── master
    └── slave
        └── key → value
```

The default implementation uses the instance's private `#context` map.

### `getMetadata(s?, m?, r?)`

Retrieves or creates metadata associated with a scoped registry.

The metadata structure includes:

| Property | Purpose |
|---|---|
| `_batches` | Tracks keys currently being batched. |
| `_batchQueue` | Stores queued values. |
| `_batchOpts` | Stores queued write options. |
| `_history` | Per-key time-travel history. |
| `_timeTravel` | Per-key time-travel positions. |
| `_globalListeners` | Scoped global change listeners. |
| `_global_subscribers` | Named global subscriber groups. |
| `_waiters` | Per-key waiter callbacks. |
| `_sys` | System metadata. |
| `_sealed` | Sealed key tracking. |
| `_frozen` | Frozen key tracking. |
| `_keyContracts` | Key contract metadata. |
| `_conflicts` | Conflict records. |
| `_conflictStrategies` | Conflict resolution strategies: `"latest"`, `"fail"`, or `"accumulate"`. |
| `_causal` | Causal history data. |
| `_scopes` | Scope metadata. |
| `_msgHandlers` | Message handler groups. |
| `_lastWriteSource` | Last write source per key. |
| `_mainMap` | Main map metadata. |
| `_tupleCache` | Tuple cache. |
| `_weakMap` | Weak object-to-string mapping. |
| `_boundaries` | Weak object boundary mapping. |

### Notification Scheduling

Two WeakMap-backed caches prevent duplicate scheduled notifications for the same key:

- `_globalNotifyCache`
- `_notifyCache`

` scheduleGlobalNotify(key, meta, opts)` schedules a global notification through `onFlush`. When executed, it resolves registered waiters and invokes scoped global listeners with the final stored value.

`scheduleNotify(key, listeners, state)` schedules key-specific listener callbacks through `onFlush`.

`_emit(key, sl_reg?, ms_reg?, globalKey?)` schedules both notification types for a scoped key.

## Scoped `store` API

The public `store` property exposes a scoped storage interface.

| Method | Description |
|---|---|
| `get<T>(key, opts?)` | Retrieves a value, restoring it from persistent storage when applicable. |
| `set<T>(key, value, opts?)` | Writes a value or updater result, records history, and schedules notifications. |
| `subscribe<T>(key, listener, opts?)` | Registers a key-specific listener and returns an unsubscribe function. |
| `delete(key, opts?)` | Deletes a value and its persistence metadata, then notifies key listeners. |
| `entries<T>(opts?)` | Returns the active scoped entries. |
| `persist(key, opts?)` | Marks a key for persistent storage. |
| `unpersist(key, opts?)` | Removes a key's persistence marker and stored persistent value. |
| `has(key, opts?)` | Checks active or marked persistent storage. |
| `clear(opts?)` | Clears active scoped values and key listeners. |
| `clearPersistent(opts?)` | Clears persistent values and persistence markers. |
| `_emit(key, sl_reg?, ms_reg?, globalKey?)` | Schedules scoped key and global notifications. |

### Scope Options

The scoped methods use these properties:

| Option | Default | Description |
|---|---|---|
| `sl_reg` | `this.s` | Slave registry name. |
| `ms_reg` | `this.m` | Master registry name. |
| `globalKey` | `this.r` | Root registry name. |
| `triggerRender` | `true` for `set` | Controls notification scheduling. |
| `cap` | `200` for `set` | Maximum retained history entries per key. |

### Persistence

Persistent values are stored in separate scoped maps:

```text
${sl_reg}_PERSISTENT
${sl_reg}_PERSIST_KEYS
```

A key must be marked with `persist(key)` before writes are mirrored into its persistent map.

`get` checks active state first. If the active value is absent and the key is marked persistent, it restores the persistent value into active state.

`delete` removes persistence metadata and the persistent value when the key is marked.

### Time-Travel History

The scoped `set` method records changes unless:

```ts
this.root.TIME_TRAVEL._time_travel_reverting
```

is active.

Each history entry contains:

```ts
{
    k,
    prev,
    next,
    ts: Date.now(),
    undone: false
}
```

A new write truncates the redo tail after the most recent non-undone entry. History is capped by `cap`, defaulting to `200`.

Writes using `Object.is`-equal values are ignored.

## Direct Store Operations

### `set(key, value)`

Writes a value and notifies matching waiters.

```ts
public set(key: A, value: A): this
```

Throws `Error("Store is frozen")` when the store has been frozen.

### `setLazy(key, make)`

Evaluates a factory and stores its result.

```ts
public setLazy(key: A, make: () => A): this
```

### `delete(key)`

Deletes a key and notifies waiters with `undefined`.

Returns `false` when the key does not exist and `true` when deletion succeeds.

### `clear()`

Notifies waiters for existing keys with `undefined`, then clears the primary data map.

### `get<T>(key, fallback?)`

Retrieves a value, returning the optional fallback when the key does not exist.

```ts
public get<T = A>(key: S): T | UD;
public get<T = A>(key: S, fallback: T): T;
```

### Additional Accessors

| Method | Description |
|---|---|
| `getAll()` | Returns a clone of the primary data map. |
| `has(key)` | Checks whether a key exists. |
| `toJSON()` | Returns the primary map as an object. |
| `entries()` | Returns entries as an array. |
| `keys()` | Returns all keys. |
| `values()` | Returns all values. |
| `find(pred)` | Finds a matching entry through the underlying map. |
| `findKey(pred)` | Finds a matching key. |
| `group(fn)` | Groups entries using the supplied function. |
| `pick(keys)` | Returns selected keys. |
| `omit(keys)` | Returns entries excluding selected keys. |
| `snapshot()` | Returns a cloned primary map. |
| `equals(other)` | Compares the primary map against another value. |

## Subscriptions

`subscribe` supports three forms.

### Key-specific callback

```ts
store.subscribe(key, (value, prev, key) => {
    console.log(`${key} changed:`, prev, "->", value);
});
```

Returns an unsubscribe function.

### Global callback

```ts
store.subscribe((value, prev, key) => {
    console.log("any change:", key);
});
```

Receives notifications for all keys.

### Async iterator

```ts
for await (const value of store.subscribe("token", { immediate: true })) {
    await refreshWith(value);

    if (value === "stop") break;
}
```

Returns an async generator that yields values for the requested key.

With `immediate: true`, the current value is yielded first when the key exists.

The iterator buffers incoming changes so a slow consumer does not lose queued events. Its subscriptions are removed when iteration exits.

### Subscription Options

```ts
{ immediate?: boolean }
```

For callback subscriptions, `immediate: true` schedules an initial callback through `queueMicrotask` when the key already exists. The previous value supplied to this initial callback is `undefined`.

### Subscription Management

| Method | Description |
|---|---|
| `unsubscribeAll(fns)` | Removes the supplied functions from keyed and global subscriptions. |
| `subscribersOf(keys)` | Returns the union of subscribers registered for the supplied keys. |

## Waiting for Values

### `wait(key, opts?)`

Returns a Promise that resolves when a matching value is written.

```ts
public wait(
    key: A,
    {
        predicate = () => true,
        timeout,
        immediate = true,
        signal
    }: A = {}
)
```

Options:

| Option | Description |
|---|---|
| `predicate(value, prev)` | Determines whether a write satisfies the wait. |
| `timeout` | Timeout in milliseconds; rejects when exceeded. |
| `immediate` | Checks the current value before registering a waiter. Defaults to `true`. |
| `signal` | Optional `AbortSignal` for cancellation. |

Behavior:

- If the current value satisfies the predicate and `immediate` is enabled, resolves immediately.
- Otherwise, registers a waiter for the key.
- Matching writes resolve the waiter and remove its timeout and abort listener.
- An aborted signal rejects with an `AbortError`.
- A timeout rejects with a `TimeoutError`.

### Convenience Methods

```ts
waitChange(key, opts = {})
```

Waits for a subsequent change by setting `immediate: false`.

```ts
waitFor(key, predicate, opts = {})
```

Waits until the supplied predicate is satisfied by the current or a subsequent value.

## Atomic Operations

| Method | Description |
|---|---|
| `setIfAbsent(key, value)` | Writes only when the key does not exist. |
| `setIfPresent(key, value)` | Writes only when the key already exists. |
| `replace(key, value)` | Alias for `setIfPresent`. |
| `update(key, fn, initial)` | Updates a value through a callback receiving the previous value and existence flag. |
| `inc(key, by = 1)` | Increments a numeric value by the supplied amount. |
| `touch(key)` | Creates an `undefined` entry only when the key is absent. |

These operations notify waiters when they successfully modify the store.

`touch` returns `false` when the key already exists and `true` when it creates the entry.

## Freeze

```ts
store.freeze();
```

Prevents subsequent calls to the direct `set` method. A frozen store throws `Error("Store is frozen")` when `set` is called.

## Usage

### Key-specific subscriptions

```ts
const store = require("./store");

const unsub = store.subscribe("user", (value, prev, key) => {
    console.log(`${key} changed:`, prev, "->", value);
});

store.set("user", "Alice");
store.set("other", 1);

unsub();
```

### Global subscriptions

```ts
const unsub = store.subscribe((value, prev, key) => {
    console.log("any change:", key);
});

store.set("user", "Alice");

unsub();
```

### Async iteration

```ts
for await (const value of store.subscribe("token", { immediate: true })) {
    await refreshWith(value);

    if (value === "stop") break;
}
```

### Waiting for a matching value

```ts
const value = await store.wait("user", {
    predicate: (value) => value !== undefined,
    timeout: 5000
});
```

### Scoped persistence

```ts
store.store.persist("user");

store.store.set("user", "Alice");

const user = store.store.get("user");
```

## Internal Dependencies

The implementation uses the following runtime primitives and project utilities:

| Dependency | Usage |
|---|---|
| `EventEmitter` from `node:events` | Base class for `ZeroStore`. |
| `M2` | Primary, scoped, and metadata map storage. |
| `SET2` | Subscriber and waiter sets. |
| `MaybePromise` | Wraps selected store return values. |
| `onFlush` | Schedules scoped notification callbacks. |
| `queueMicrotask` | Schedules immediate subscription callbacks. |
| `setTimeout` / `clearTimeout` | Implements waiter timeouts. |
| `AbortSignal` | Supports waiter cancellation. |

</details>
 
 <details style="font-size: 14.5px;"><summary><strong><span style="font-size: 16px; font-family: monospace">[TWO PASS COLLECTION]</span> </strong></summary>

# `zeroTwoPassCollection`

Executes a factory twice to collect category constants and specifications during the first pass, then exposes those collected values through a resolving Proxy during the second pass.

## Imports

```ts
import { buildCtx } from "../tricks/build_ctx";
import { makeStub } from "../tricks/stubs";
import { zeroNexusMirror } from "./zero_nexus_mirror";
```

## Signature

```ts
export function zeroTwoPassCollection<
    R extends Record<string, any>
>(
    categoryName: string,
    factory: (ctx: SelfType) => R
)
```

## Parameters

| Parameter | Type | Description |
|---|---|---|
| `categoryName` | `string` | Category name passed to `zeroNexusMirror`. |
| `factory` | `(ctx: SelfType) => R` | Factory executed once for collection and again for resolution. |

## Execution Flow

### Pass 1 — Collection

Creates the reference mirror and a fallback stub Proxy:

```ts
const refs = zeroNexusMirror(categoryName);

const stubProxy = new Proxy({}, {
    get: () => makeStub()
});
```

The factory executes using a context built from these references:

```ts
const pass1 = factory(buildCtx(refs, stubProxy));
```

The returned entries are inspected for two properties:

- `constants`
- `specs`

Available values are collected into separate records:

```ts
const collectedConstants: Record<string, any> = {};
const collectedSpecs: Record<string, any> = {};

for (const key in pass1) {
    if (pass1[key]?.constants) {
        collectedConstants[key] = pass1[key].constants;
    }

    if (pass1[key]?.specs) {
        collectedSpecs[key] = pass1[key].specs;
    }
}
```

### Pass 2 — Resolution

Creates a nested Proxy that exposes the collected values by key.

The outer Proxy intercepts category access. The inner Proxy handles property access:

| Requested property | Behavior |
|---|---|
| `constants` | Resolves `collectedConstants[key]`. |
| `specs` | Resolves `collectedSpecs[key]`. |
| Any other property | Returns `makeStub()`. |

When a collected record exists, another Proxy exposes its properties. Existing properties return their actual values; missing properties return stubs.

If the requested constants or specs record does not exist, the property access returns a stub.

The factory then executes again:

```ts
const pass2 = factory(
    buildCtx(refs, resolveProxy)
);
```

## Return Value

```ts
return { pass2, refs };
```

| Property | Description |
|---|---|
| `pass2` | Factory result from the second execution. |
| `refs` | Reference mirror created through `zeroNexusMirror(categoryName)`. |

## Usage

```ts
const { pass2, refs } = zeroTwoPassCollection(
    "category",
    (ctx) => ({
        // Factory definitions
    })
);
```

## Dependencies

| Dependency | Purpose |
|---|---|
| `buildCtx` | Builds the factory context for each pass. |
| `makeStub` | Supplies fallback values for unresolved Proxy accesses. |
| `zeroNexusMirror` | Creates the reference mirror shared by both factory executions. |

</details>



## TRICKS




