import * as escodegen from "escodegen";
import * as espree from "espree";
import * as estraverse from "estraverse";
import * as fs from "fs/promises";

function getLineOffsets(str) {
  const regex = /\r?\n/g;
  const offsets = [0];
  while (regex.test(str)) offsets.push(regex.lastIndex);
  offsets.push(str.length);
  return offsets;
}

export async function transpile(inputFile, outputFile) {
  let input = await fs.readFile(inputFile, 'utf-8')
  let output = addLogging(input);
  if (outputFile === undefined) {
      console.log(output);
      return;
  }
  await fs.writeFile(outputFile, output);
}

export function addLogging(code) {
  let lineStarts = getLineOffsets(code);
  let lineNum = 0;   
  const ast = espree.parse(code, { ecmaVersion: 6 });
  estraverse.traverse(ast, {
    enter: function (node, parent) {
      if (node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
          while (lineStarts[lineNum] < node.body.body[0].start) lineNum++;
          addBeforeCode(node, lineNum - 1);
      }
    }
  });
  return escodegen.generate(ast);
}

function addBeforeCode(node, lineNum) {
  let name = node.id ? node.id.name : '<anonymous function>';
  let params = node.params.map(function (argumentos) {
    return "${ " + argumentos.name + " }";
  });
  params = params.join(', ');
  let beforeCode = `console.log(\`Entering ${name}(${params}) at line ${lineNum}\`);`;
  let beforeNodes = espree.parse(beforeCode, { ecmaVersion: 6 }).body;
  node.body.body = beforeNodes.concat(node.body.body);
}
