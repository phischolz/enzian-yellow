const { compileOne } = require('../ethereum/compile.dev');
const Web3Wrapper = require("../ethereum/web3-wrapper.js");
const Web3 = require('web3');
const config = require("../../config/config")

main = async() => {

  // CHRYSALIS
  // This was used to initialize the chrysalis-bpm Blockchain Network.
  // let provider = new Web3(new Web3.providers.HttpProvider('http://85.215.90.101:4191'))

  
  let provider = new Web3(new Web3.providers.HttpProvider(global.gConfig.node_http_url + ':' +
      global.gConfig.node_http_port))
  web3Wrapper = new Web3Wrapper(provider);
  await web3Wrapper.init();

  // Compile and Deploy the DecisionEntities contract
  let decisionEntitiesCompiled = await compileOne('DecisionEntities.sol', 'domainModel')
  let decisionEntitiesDeployed = await web3Wrapper.deployContractSelfSigned(decisionEntitiesCompiled)

  // Compile and Deploy the TaskEntities contract
  let taskEntitiesCompiled = await compileOne('TaskEntities.sol', 'domainModel',
      {'DecisionEntities.sol': {'DecisionEntities': decisionEntitiesDeployed.contractAddress}})
  let taskEntitiesDeployed = await  web3Wrapper.deployContractSelfSigned(taskEntitiesCompiled)

  // Compile and Deploy the ProcessEntities contract
  let processEntitiesCompiled = await compileOne('ProcessEntities.sol', 'domainModel',
      {'TaskEntities.sol': {'TaskEntities': taskEntitiesDeployed.contractAddress}})
  let processEntitiesDeployed = await web3Wrapper.deployContractSelfSigned(processEntitiesCompiled)

  // Compile and Deploy the DecisionLibrary Contract
  let decisionLibraryCompiled = await compileOne('DecisionLibrary.sol', 'middleware',
      {'DecisionEntities.sol': {'DecisionEntities': decisionEntitiesDeployed.contractAddress}});

  // let decisionLibraryDeployed = await web3Wrapper.deployContract(decisionLibraryCompiled, { from: web3Wrapper.accounts[0]  });
  let decisionLibraryDeployed = await web3Wrapper.deployContractSelfSigned(decisionLibraryCompiled);
  console.log(decisionLibraryDeployed)

  // Compile and Deploy the TaskLibrary contract
  let taskLibraryCompiled = await compileOne('TaskLibrary.sol', 'middleware',
      {
        'TaskEntities.sol': {'TaskEntities': taskEntitiesDeployed.contractAddress},
        'DecisionEntities.sol': {'DecisionEntities': decisionEntitiesDeployed.contractAddress},
        'ProcessEntities.sol': {'ProcessEntities': processEntitiesDeployed.contractAddress},
        'DecisionLibrary.sol': {'DecisionLibrary': decisionLibraryDeployed.contractAddress}
      })
  let taskLibraryDeployed = await web3Wrapper.deployContractSelfSigned(taskLibraryCompiled)

  //when using chrysalis, decisionLibraryDeployed has a field contractAddress || when using metamask, it is called _address
  //let basicEnzian_compiled = await compileOne('BasicEnzian.sol', decisionLibraryDeployed._address);

  // Compile the Process Contract. The output is written to the src/ethereum/build folder (BasicEnzian.json)
  let basicEnzian_compiled = await compileOne('BasicEnzian.sol', '',
      {
        'TaskEntities.sol': {'TaskEntities': taskEntitiesDeployed.contractAddress},
        'DecisionEntities.sol': {'DecisionEntities': decisionEntitiesDeployed.contractAddress},
        'ProcessEntities.sol': {'ProcessEntities': processEntitiesDeployed.contractAddress},
        'TaskLibrary.sol': {'TaskLibrary': taskLibraryDeployed.contractAddress}
      });


  console.log("LIBRARY ADDRESS");
  console.log('DecisionEntities: ', decisionEntitiesDeployed.contractAddress);
  console.log('TaskEntities: ', taskEntitiesDeployed.contractAddress);
  console.log('ProcessEntities: ', processEntitiesDeployed.contractAddress);
  console.log('DecisionLibrary: ', decisionLibraryDeployed.contractAddress);
  console.log('TaskLibrary: ', taskLibraryDeployed.contractAddress)
  console.log("CONTRACT_ABI");
  console.log(basicEnzian_compiled.abi);
}

main();
