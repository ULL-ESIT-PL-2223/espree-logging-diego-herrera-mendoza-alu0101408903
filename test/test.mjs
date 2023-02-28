import { transpile } from "../src/logging-espree.js";
import assert from 'assert';
import * as fs from "fs/promises";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
import Tst from './test-description.mjs';

const Test = Tst.map(t => ({
  input: __dirname + '/data/' + t.input,
  output: __dirname + '/data/' + t.output,
  correctLogged: __dirname + '/data/' + t.correctLogged,
  correctOut: __dirname + '/data/' + t.correctOut,
})
)

function removeSpaces(s) {
  return s.replace(/\s/g, '');
}

for (let i = 0; i < Test.length; i++) {
  it(`addLogging(${Tst[i].input}, ${Tst[i].output})`, async () => {
    transpile(Test[i].input, Test[i].output);
    const output = await fs.readFile(Test[i].output, 'utf-8');
    const expected = await fs.readFile(Test[i].correctLogged, 'utf-8');
    assert.equal(removeSpaces(output), removeSpaces(expected));
    // Run the output program and check the logged output is what expected
    const logged = execSync(`node ${Test[i].output}`).toString();
    const expectedLogged = await fs.readFile(Test[i].correctOut, 'utf-8');
    assert.equal(logged, expectedLogged);
  });
}


