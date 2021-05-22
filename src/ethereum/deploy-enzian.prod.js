
const basicEnzianCompiled = require('./build/BasicEnzian.json');

/**
 * Compiles, deploys and also links the two required Contracts:
 * The DecisionLibrary and the BasicEnzian.
 */
const deployContractAndLibrary = async(web3Wrapper, compiled, account) => {

  if(!compiled){
    compiled = basicEnzianCompiled;
  }

  let basicEnzian_deployed = await web3Wrapper.deployContractByAbiAndBytecode(compiled.abi, compiled.evm.bytecode.object, account);

   return {
     basicEnzian: basicEnzian_deployed
   };
}

module.exports = deployContractAndLibrary;
