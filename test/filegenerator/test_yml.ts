const outputExampleForYml = () => [
  `main:`,
  [
    [
      `abc:`,
      [[`nested:`, [[`-heippa!!!`]], `second:`, [[`-something33`]]]],
      `abc:`,
      [[`nested:`, [[`-something here diff`]], `second:`, [[`-something`]]]]
    ]
  ],
  `my_test:`,
  [
    [
      `abc:`,
      [[`nested:`, [[`-something`]], `second:`, [[`-something`]]]],
      `abc:`,
      [[`nested:`, [[`-something`]], `second:`, [[`-something`]]]]
    ]
  ],

  `my_test2:`,
  [
    [
      `abc:`,
      [[`nested:`, [[`-something`]], `second:`, [[`-something`]]]],
      `abc:`,
      [[`nested:`, [[`-something`]], `second:`, [[`-something`]]]]
    ]
  ],

  `main2:`,
  [
    [
      `abc:`,
      [[`nested:`, [[`-something1`]], `second:`, [[`-something2`]]]],
      `abc:`,
      [[`nested:`, [[`-something666`]], `second:`, [[`-something4`]]]]
    ]
  ]
];