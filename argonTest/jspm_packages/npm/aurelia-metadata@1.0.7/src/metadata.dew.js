export function dew () {
  throw new Error("Error converting CommonJS file aurelia-metadata\\src\\metadata.js, please post a jspm bug with this message.\nSyntaxError: unknown: Missing semicolon. (10:9)\n\n   8 | * Note for the Typescript to ES5 transpiler: Due to the non-standard compliant implementation of 'extends', these methods, when applied to derived classes, will operate on the parent class and not on the child class. This can be circumvented by either transpiling to ES2015 (ES6) or by making the targetKey parameter class-specific eg. by using target.name for the targetKey parameter.\n   9 | */\n> 10 | interface MetadataType {\n     |          ^\n  11 |   /**\n  12 |   * The metadata key representing pluggable resources.\n  13 |   */\n    at instantiate (C:\\Users\\J\\AppData\\Roaming\\npm\\node_modules\\jspm\\node_modules\\@babel\\parser\\lib\\index.js:72:32)\n    at constructor (C:\\Users\\J\\AppData\\Roaming\\npm\\node_modules\\jspm\\node_modules\\@babel\\parser\\lib\\index.js:367:12)\n    at Parser.raise (C:\\Users\\J\\AppData\\Roaming\\npm\\node_modules\\jspm\\node_modules\\@babel\\parser\\lib\\index.js:3678:19)\n    at Parser.semicolon (C:\\Users\\J\\AppData\\Roaming\\npm\\node_modules\\jspm\\node_modules\\@babel\\parser\\lib\\index.js:4123:10)\n    at Parser.parseExpressionStatement (C:\\Users\\J\\AppData\\Roaming\\npm\\node_modules\\jspm\\node_modules\\@babel\\parser\\lib\\index.js:15399:10)\n    at Parser.parseStatementContent (C:\\Users\\J\\AppData\\Roaming\\npm\\node_modules\\jspm\\node_modules\\@babel\\parser\\lib\\index.js:14930:19)\n    at Parser.parseStatement (C:\\Users\\J\\AppData\\Roaming\\npm\\node_modules\\jspm\\node_modules\\@babel\\parser\\lib\\index.js:14782:17)\n    at Parser.parseBlockOrModuleBlockBody (C:\\Users\\J\\AppData\\Roaming\\npm\\node_modules\\jspm\\node_modules\\@babel\\parser\\lib\\index.js:15441:25)\n    at Parser.parseBlockBody (C:\\Users\\J\\AppData\\Roaming\\npm\\node_modules\\jspm\\node_modules\\@babel\\parser\\lib\\index.js:15432:10)\n    at Parser.parseProgram (C:\\Users\\J\\AppData\\Roaming\\npm\\node_modules\\jspm\\node_modules\\@babel\\parser\\lib\\index.js:14700:10)");
}