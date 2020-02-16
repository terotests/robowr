import { expect } from "chai";
import * as immer from 'immer'
import * as R from "../src/writer";

function genericComment<T>(str: string) {
  return `/* ${str} */`;
}

interface CustomCtx {
  str: string;
}

class TestClass {
  lines : string[] = []
}

interface VariableContext {
  prevCtx?: VariableContext;
  definedVariables: string[]
  intVariables : {name:string, value:number}[]
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
    const ctx = new R.Ctx(null);
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

  test("Test custom context with .walk with defined param", () => {
    const fs = new R.CodeFileSystem();

    // define a context with data
    const ctx = new R.Ctx<{ str: string }>();
    ctx.data = { str: "custom" };

    const code = fs
      .getFile("./builder/gen", "testout.txt")
      .getWriter()
      .walk([["line1"], ["line2"], ctx => ctx.data!.str], ctx)
      .getCode();

    expect(code).to.deep.eq(`line1\nline2\ncustom\n`);
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

  test("Test simple Context Creator", () => {    
    expect(R.Walk(R.CreateContext({cnt:1}),[
      ctx => {
        ctx.data.cnt++;
      }
    ]).data.cnt).to.equal(2)

    // using immer to mutate state is quite fine
    expect(R.Walk(R.CreateContext({cnt:1}),[
      ctx => {
        ctx.data = immer.produce(ctx.data, d => {
          d.cnt+=2
        })
      },
    ]).data.cnt).to.equal(3)

    expect(R.Walk(R.CreateContext({cnt:1}),[
      ctx => {
        ctx.data = immer.produce(ctx.data, d => {
          d.cnt+=2
        })
      },
      ctx => {
        ctx.data = immer.produce(ctx.data, d => {
          d.cnt+=2
        })
      },
    ]).data.cnt).to.equal(5)

    expect(R.Walk(R.CreateContext({cnt:1}),[
      ctx => ctx.produce( d => { d.cnt++ }),
      ctx => ctx.produce( d => { d.cnt++ }),
    ]).data.cnt).to.equal(3)    

    const ctx = R.CreateContext({cnt:1});
    const myFns = [
      ctx => ctx.produce( d => { d.cnt++ }),
      ctx => ctx.produce( d => { d.cnt++ }),
    ];
    R.Walk( ctx, myFns )
    R.Walk( ctx, myFns )

    expect( ctx.data.cnt ).to.equal( 5 )

    expect(R.Walk( 
      R.CreateContext(new TestClass()),
      [
        ctx => { ctx.data.lines.push( 'Does') },
        ctx => { ctx.data.lines.push( 'This') },
        ctx => { ctx.data.lines.push( 'Work') },
      ]
    ).data.lines.join(' ')).to.equal('Does This Work')

    expect(R.Walk( 
      R.CreateContext(new TestClass()),
      [
        ctx => ctx.produce( c => {c.lines.push('Does')} ),
        ctx => ctx.produce( c => {c.lines.push('This')} ),
        ctx => ctx.produce( c => {c.lines.push('Work')} ),
      ]
    ).data.lines.join(' ')).to.equal('Does This Work')



    const DefineIntVariable = (name:string, value:number) => {
      return (ctx:R.Ctx<VariableContext>) => {
        ctx.produce( data => {
          data.definedVariables.push(name)
          data.intVariables.push( {
            name, value
          })
        })
      }
    }

    const IncrementVariable = (name:string, value:number) => {
      return (ctx:R.Ctx<VariableContext>) => {
        ctx.produce( data => {
          for( let i=0; i< data.intVariables.length; i++) {
            if(data.intVariables[i].name === name) {
              data.prevCtx = ctx.data
              data.intVariables[i].value += value              
            }
          }
        })
      }
    }

    const vCtx:VariableContext =  { intVariables : [], definedVariables:[]}

    const varCtx = R.Walk( R.CreateContext( vCtx ), [
      DefineIntVariable('x', 10),
      DefineIntVariable('y', 200),
      IncrementVariable('x', 11),
      ctx => {
        const newCtx = ctx.fork()
        return () => {
          R.Walk(newCtx, [
            IncrementVariable('x', 1),
            ctx => {
              console.log('Sub ctx ', ctx.data)
              expect(ctx.data.intVariables[0].value).to.equal(22)
              expect(ctx.data.intVariables[1].value).to.equal(200)
            }
          ])
        }
      },
      ctx => {
        const newCtx = ctx.fork()
        return () => {
          R.Walk(newCtx, [
            IncrementVariable('x', 101),
            ctx => {
              console.log('Sub ctx ', ctx.data)
              expect(ctx.data.intVariables[0].value).to.equal(122)
            }
          ])
        }
      }
    ])

    expect( varCtx.data.intVariables[0].name).to.equal( 'x' )
    expect( varCtx.data.intVariables[0].value).to.equal( 21 )
    expect( varCtx.data.prevCtx!.intVariables[0].value).to.equal( 10 )

    console.log( 'prev',  varCtx.data.prevCtx )


  });  

  test("Walk Context in Steps", () => {    
    const DefineIntVariable = (name:string, value:number) => {
      return (ctx:R.Ctx<VariableContext>) => {
        ctx.produce( data => {
          data.definedVariables.push(name)
          data.intVariables.push( {
            name, value
          })
        })
      }
    }

    const IncrementVariable = (name:string, value:number) => {
      return (ctx:R.Ctx<VariableContext>) => {
        ctx.produce( data => {
          for( let i=0; i< data.intVariables.length; i++) {
            if(data.intVariables[i].name === name) {
              data.prevCtx = ctx.data
              data.intVariables[i].value += value              
            }
          }
        })
      }
    }
    const vCtx:VariableContext =  { intVariables : [], definedVariables:[]}

    // defines something operated on the context
    const step = [IncrementVariable('x', 1)]

    const varCtx = R.Walk( R.CreateContext( vCtx ), [
      DefineIntVariable('x', 10),
      DefineIntVariable('y', 200)
    ])

    const ctx2 = R.Walk( varCtx, step )
    expect( ctx2.data.intVariables[0].value).to.equal( 11 )
    const ctx3 = R.Walk( ctx2, step )
    expect( ctx3.data.intVariables[0].value).to.equal( 12 )
    const ctx4 = R.Walk( varCtx, [DefineIntVariable('x2', 77)] )
    expect( ctx4.data.intVariables[2].value).to.equal( 77 )

    console.log(R.Walk( ctx4, ctx => {
      return ctx.data.intVariables.map( varName => `const ${varName.name}:number = ${varName.value};`)
    }).writer.getCode())
    /*
    const x:number = 12;
    const y:number = 200;
    const x2:number = 77;    
    */

  });    


  test("Example in the Docs", () => {
    const data = {
      values : [
        'value1',
        'value2',
        'value3'
      ]
    }
    const ctx = R.CreateContext( data );
    const newCtx = R.Walk( ctx, ctx => 
      [`switch( value ) {`,
      ...ctx.data.values.map( name => [
        [`case "${name}":`,
        [[
          `console.log("Found value ${name}");`,
          'break;'
        ]]
      ]
      ]),
      '}']
    )
    console.log(newCtx.writer.getCode())
  });  
});
