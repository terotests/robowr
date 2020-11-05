# Robowr Code Generator Library 3.0

Robowr is a code generator, which can generate any code that can be written in text format.

# New: code difference added to code writer

Current version adds `useDiff` option, which is enabled by default. Each directory will have `.diff` subdirectory which
is generated for the purpose of diffing the originally written file to the current version.

1. If the files are not changed, the code generator will overrride changes
2. If the files are changed the code generator will follow the changes made in the changed files

```
    R.CreateContext({})
      .file("./", "diff_test.ts")
      .write([`if(true) {`, [[`console.log("OK");`]], `}`])
      .save("./test/difftest", { useDiff: true, usePrettier: true });
```

# Installing

```
npm i -g robowr
```

# Create a simple generator from command line

You can start creating generators from scratch but sometimes it is easier to create them from source code automatically.

Basicly what you need is just a source file to transform to a generator. The generated generator will include the source code
for re-creating the given file. You can then use the generated generator to generate more similar files.

## From stdin

```
cat hello.ts | robowr
```

```
cat hello.ts | robowr -o gen/HelloWorld.ts
```

## Import File as generator template

```
robowr -f docker-compose.yml
```

or if you want to specify the output file

```
robowr -f docker-compose.yml -o createDocker.ts
```

To create it you can use for example `ts-node`

```
ts-node createDocker.ts
```

# Using programmatically

Example of creating some static HTML content. Notice that using the context variables is absolutely optional.
In the example they are used to define `title` and imported scripts for the HTML files. It is absolutely
fine to use anything else to manage internal state of the generator.

```typescript
import * as R from "robowr";

const head = (code: any) => ["<head>", [[code]], "</head>"];
const title = (code: any) => ["<title>", [[code]], "</title>"];
const script = (code: string) => [`<srcipt src="${code}"></script>`];
R.CreateContext({
  title: "Sample",
  scriptFiles: ["src/utils.js", "src/index.js"],
})
  .file("./", "index.html")
  .write([
    "<html>",
    (ctx) =>
      head([
        title(ctx.data.title + " Index"),
        ctx.data.scriptFiles.map(script),
      ]),
    [
      [
        // <-- indentation
        "<body>",
        [["Genrated Index"]],
        "</body>",
      ],
    ],
    "</html>",
  ])
  .file("./", "home.html")
  .write([
    "<html>",
    (ctx) => head(title(ctx.data.title + " Home")),
    [
      [
        // <-- indentation
        "<body>",
        [["Generated Home"]],
        "</body>",
      ],
    ],
    "</html>",
  ])
  .save("./static/");
```

# Examples

Contexts are generic, so you can use any support data as parameter to the writer.

First initialize the context

```typescript
import * as R from "robowr";

// The data used by the robowr
const data = {
  values: ["value1", "value2", "value3"],
};
const ctx = R.CreateContext({ values: [] });
```

Then you can create code using the context and return string, arrays, nested arrays (blocks)
or functions which will be evaluated lazily.

```typescript
const newCtx = R.Walk(ctx, (ctx) => [
  `switch( value ) {`,
  ...ctx.data.values.map((name) => [
    [`case "${name}":`, [[`console.log("Found value ${name}");`, "break;"]]],
  ]),
  "}",
]);
```

To get the code call `newCtx.writer.getCode()`

```typescript
// The generated code from above
switch (value) {
  case "value1":
    console.log("Found value value1");
    break;
  case "value2":
    console.log("Found value value2");
    break;
  case "value3":
    console.log("Found value value3");
    break;
}
```

Since context is passed to callback functions you can use them to fine grained control of the
generator or you can use then just to make code easier to write

```typescript
// simple function returning a comment block
const CreateIfNode = <T extends R.hasWriter>(
  condition: R.CodeBlock<T>,
  thenBlock: R.CodeBlock<T>,
  elseBlock?: R.CodeBlock<T>
) => {
  return [
    R.Join(["if(", condition, ") {"]),
    [[thenBlock]],
    elseBlock ? ["} else {", [[elseBlock]], "}"] : "}",
  ];
};
```

```typescript
R.Walk(ctx, [
  CreateIfNode(
    "x > 10",
    "console.log('x was bigger than ten');",
    "console.log('x was smaller or equal to ten');"
  ),
]);
```

## Modifying context by the generators

Sometimes you want to modify the context before the output is written, for example you can
run multipled passes to the context before actually outputting any code.

This is very simple, any callback function can simply modify the data variable in the context

```typescript
const ctx = R.CreateContext({ users: [] });
const newCtx = R.Walk(ctx, (ctx) => {
  ctx.data.users.push("New User");
});
```

### Immutable context

Context can be immutable, you can use any immutable library with the context data or you can
use the built-in Immer -support like this

```typescript
expect(
  R.Walk(R.CreateContext({ cnt: 1 }), [
    (ctx) =>
      ctx.produce((d) => {
        d.cnt++;
      }),
    (ctx) =>
      ctx.produce((d) => {
        d.cnt++;
      }),
  ]).data.cnt
).to.equal(3);
```
