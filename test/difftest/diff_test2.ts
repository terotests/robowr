import * as fs from "fs";
import * as path from "path";
import * as path4 from "path";
import * as path18 from "path";

// Comment here...

class Foo {
  anotherRoute() {
    return "This is good!!!";
  }

  caller() {
    console.log("Weoe, Nice, Does this work??? Change 1.");
    for (let i = 0; i < 10; i++) {
      console.log(" i = ", i);
    }
  }

  onExtraFn() {
    console.log("Weoe, Nice, Does this work??? Change 2.");
    for (let i = 0; i < 10; i++) {
      console.log(" i = ", i);
    }
  }

  onExtraFn2() {
    console.log("Weoe, Nice, Does this work??? Change 3.");
    for (let i = 0; i < 10; i++) {
      console.log(" i = ", i);
    }
  }

  onExtraFn3() {
    console.log("Weoe, Nice, Does this work??? BRRRRRRRRR Change 010101");
    for (let i = 0; i < 10; i++) {
      console.log(" i = ", i);
    }
  }

  lastFn() {
    // LOCAL COMMENT!!!
  }

  lastFn3() {}

  lastFn4() {
    // GENS comment Edited too
  }
}
// Nicer!!!
function abc() {
  // Comment changed here for the function below
  return () => {
    return 1 + 2 + 3 + 10;
  };
}

// And to the end
console.log("DONE");
