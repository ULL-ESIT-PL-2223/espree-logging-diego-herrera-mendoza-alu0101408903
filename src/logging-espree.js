import * as escodegen from "escodegen";
import * as espree from "espree";
import * as estraverse from "estraverse";
import * as fs from "fs/promises";


export async function transpile(inputFile, outputFile) {
  let input = await fs.readFile(inputFile, 'utf-8')
  let output = addLogging(input);
  if (outputFile === undefined) {
      console.log(output);
      return;
  }
  await fs.writeFile(outputFile, output);
}

/**
 * @desc Adds logging to the input code.
 * @param {string} code The code to add logging to.
 */
export function addLogging(code) {  
  const ast = espree.parse(code, { ecmaVersion: 6 }, { loc: true });
  estraverse.traverse(ast, {
    enter: function (node, parent) {
      if (node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
          addBeforeCode(node);
      }
    }
  });
  return escodegen.generate(ast);
}

/**
 * @desc Adds a console.log statement before the function
 * @param {Object} node the function node
 */
function addBeforeCode(node) {
  let name = node.id ? node.id.name : '<anonymous function>';
  let lineNum = node.loc.start.line;
  let params = node.params.map(function (argumentos) {
    if (argumentos.type === 'Identifier') {
      return argumentos.name;
    }
    else if (argumentos.type === 'AssignmentPattern') {
      return argumentos.left.name + "=" + argumentos.right.name;
    }
    else if (argumentos.type === 'RestElement') {
      return "..." + argumentos.argument.name;
    }
  });
  params = params.join(', ');
  let beforeCode = `console.log(\`Entering ${name}(${params}) at line ${lineNum}\`);`;
  let beforeNodes = espree.parse(beforeCode, { ecmaVersion: 6 }).body;
  node.body.body = beforeNodes.concat(node.body.body);
}
