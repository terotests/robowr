import * as R from "../src/writer/";
import { expect } from "chai";

describe("Test creating filesystem and writing into it", () => {
  test("filesystem", () => {
    const fs = new R.CodeFileSystem();
    expect(fs.files.length).to.equals(0);
  });
  test("Test creating two independent writers to a same file", () => {
    const fs = new R.CodeFileSystem();
    const wr1 = fs.getFile("/", "foo.txt").getWriter();
    wr1.out("a");
    const wr2 = fs.getFile("/", "foo.txt").getWriter();
    wr2.out("b");
    expect(wr2.getCode()).to.equal("ab");
  });

  test("Fork file and write around the fork with newlines", () => {
    const fs = new R.CodeFileSystem();
    const w = fs.getFile("/", "foo.txt").getWriter();
    w.out("a", true);
    const fork = w.fork();
    w.out("c", true);
    fork.out("b", true);
    expect(w.getCode()).to.equal("a\nb\nc\n");
  });

  test("Fork file and write around the fork", () => {
    const fs = new R.CodeFileSystem();
    const w = fs.getFile("/", "foo.txt").getWriter();
    w.out("a");
    const fork = w.fork();
    w.out("c");
    fork.out("b");
    expect(w.getCode()).to.equal("abc");
  });
});
