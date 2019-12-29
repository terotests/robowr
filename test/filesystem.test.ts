import { expect } from "chai";

import * as R from "../src/writer";

function genericComment<T>(str: string) {
  return `/* ${str} */`;
}

interface CustomCtx {
  str: string;
}

const CreateIfNode = <T extends R.hasWriter>(
  condition: R.CodeBlock<T>,
  thenBlock: R.CodeBlock<T>,
  elseBlock?: R.CodeBlock<T>
) => {
  return [
    R.Join(["if(", condition, ") {"]),
    [[thenBlock]],
    elseBlock ? ["} else {", [[elseBlock]], "}"] : "}"
  ];
};

describe("Writer generator tests", () => {
  test("README sample 1", () => {
    const ctx = new R.Ctx();
    const fs = new R.CodeFileSystem();
    ctx.writer = fs.getFile("./builder/gen", "testout.txt").getWriter();

    R.Walk(ctx, [
      ["if( x > 10){"],
      [["console.log('x was bigger than ten');"]],
      "} else {",
      [["console.log('x was smaller or equal to ten');"]],
      "}"
    ]);
    console.log(ctx.writer.getCode());
  });
  test("README sample 2", () => {
    const ctx = new R.Ctx();
    const fs = new R.CodeFileSystem();
    ctx.writer = fs.getFile("./builder/gen", "testout.txt").getWriter();

    R.Walk(ctx, [
      CreateIfNode(
        "x > 10",
        "console.log('x was bigger than ten');",
        "console.log('x was smaller or equal to ten');"
      ),
      CreateIfNode("x < 0", "console.log('x was less than zero');")
    ]);
    console.log(ctx.writer.getCode());
  });
  test("Test line generation", () => {
    const ctx = new R.Ctx();
    const fs = new R.CodeFileSystem();
    ctx.writer = fs.getFile("./builder/gen", "testout.txt").getWriter();

    R.Walk(ctx, [["line1"], ["line2"]]);
    expect(ctx.writer.getCode()).to.deep.eq(`line1\nline2\n`);
  });
  test("Test contextless generator", () => {
    const fs = new R.CodeFileSystem();

    const code = fs
      .getFile("./builder/gen", "testout.txt")
      .getWriter()
      .walk([["line1"], ["line2"]])
      .getCode();

    expect(code).to.deep.eq(`line1\nline2\n`);
  });

  test("Test custom context with .walk", () => {
    const fs = new R.CodeFileSystem();
    const code = fs
      .getFile("./builder/gen", "testout.txt")
      .getWriter()
      .walk<{ str: string }>([
        ctx => {
          ctx.data = { str: "hello" };
        },
        ["line1"],
        ["line2"],
        ctx => ctx.data!.str
      ])
      .getCode();

    expect(code).to.deep.eq(`line1\nline2\nhello\n`);

    const code2 = fs
      .getFile("./builder/gen", "testout2.txt")
      .getWriter()
      .walk<string>([
        ctx => {
          ctx.data = "OK";
        },
        ["line1"],
        ["line2"],
        ctx => ctx.data!
      ])
      .getCode();

    expect(code2).to.deep.eq(`line1\nline2\nOK\n`);
  });

  test("generic comment creator", () => {
    const ctx = new R.Ctx();
    const fs = new R.CodeFileSystem();
    ctx.writer = fs.getFile("./builder/gen", "testout.txt").getWriter();

    R.Walk(ctx, [genericComment("ok")]);
    expect(ctx.writer.getCode()).to.deep.eq(`/* ok */\n`);
  });
  test("Test block with indent", () => {
    const ctx = new R.Ctx();
    const fs = new R.CodeFileSystem();
    ctx.writer = fs.getFile("./builder/gen", "testout.txt").getWriter();

    R.Walk(ctx, [["if(){"], [["line2", "line3"]], "}"]);
    expect(ctx.writer.getCode()).to.deep.eq(`if(){\n  line2\n  line3\n}\n`);
  });
  test("Test generator function", () => {
    const ctx = new R.Ctx();
    const fs = new R.CodeFileSystem();
    ctx.writer = fs.getFile("./builder/gen", "testout.txt").getWriter();

    R.Walk(ctx, [["if(){"], [[ctx => "line2", "line3"]], "}"]);
    expect(ctx.writer.getCode()).to.deep.eq(`if(){\n  line2\n  line3\n}\n`);
  });
  test("Test join function", () => {
    const ctx = new R.Ctx();
    const fs = new R.CodeFileSystem();
    ctx.writer = fs.getFile("./builder/gen", "testout.txt").getWriter();

    R.Walk(ctx, [["if(){"], [[ctx => R.Join(["lin", "e2"]), "line3"]], "}"]);
    expect(ctx.writer.getCode()).to.deep.eq(`if(){\n  line2\n  line3\n}\n`);
  });
  test("generic recursive generators", () => {
    const ctx = new R.Ctx();
    const fs = new R.CodeFileSystem();
    ctx.writer = fs.getFile("./builder/gen", "testout.txt").getWriter();

    R.Walk(ctx, [ctx => ctx => ctx => "ok"]);
    expect(ctx.writer.getCode()).to.deep.eq("ok\n");
  });
});
