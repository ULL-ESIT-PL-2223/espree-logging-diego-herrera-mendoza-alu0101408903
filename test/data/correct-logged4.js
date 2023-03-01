function factorial(n) {
  console.log(`Entering factorial(${ n }) at line 1`);
  if (n <= 0) {
      return 1;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
      result *= i;
  }
  return result;
}
console.log(factorial(7));
function power(base, exponent) {
  console.log(`Entering power(${ base }, ${ exponent }) at line 12`);
  return Math.pow(base, exponent);
}
console.log(power(10, 3));