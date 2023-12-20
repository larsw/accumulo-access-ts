# ts-accumulo-security

An parser generating evaluating functions for Accumulo security expressions.

## Usage

```typescript
import { parse } from 'ts-accumulo-security';

const expression = parse('(A && B) | C');

const result = expression.evaluate({
  labels: new Set(['A', 'B']
)});
```

## API

### `parse(expression: string): EvalFn`

Parses the given expression and returns an `Evalfn` object.
Throws an error if the expression is invalid.

### `EvaluationContext`

An object containing a field `labels` of type `Set<string>` with the authorized labels.

### `EvalFn: (ctx: EvaluationContext) => boolean`

A function that evaluates the expression against the given context.


## Development

### Setup

```bash
bun install
```

### Test

```bash
bun test
```

### Build

```bash
bun build
```

### Publish

```bash
npm publish
```

## License

MIT (c) 2023 - Lars Wilhelmsen. See [LICENSE](LICENSE) for details.
