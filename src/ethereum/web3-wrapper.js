const { create } = require('lodash');
const Web3 = require('web3');
const util = require('util');
const path = require('path');
const config = require('../../config/config')


/**
 * Communication with Blockchain.
 * Does not know anything about bpmn or specific contracts.
 * 
 * Holds contracts.
 * 
 */
class Web3Wrapper {
    
    constructor(provider) {
        this.web3 = new Web3(provider);
        this.initialized = false;
    }

    async init(pk) {
        if(pk){
            this.accounts = await this.web3.eth.accounts.privateKeyToAccount(pk);
        } else {
            this.accounts = await this.web3.eth.getAccounts();
        }
        this.initialized = true;
    }



    async deployContract(compiled, opts) {
    
        let returnContract;

        let thecontract = new this.web3.eth.Contract(compiled.abi);
        let deploy_opt = {
            data: compiled.evm.bytecode.object,
            arguments: opts.arguments
        };
        let transactionObject = await thecontract.deploy(deploy_opt)
        const estimatedGas = await transactionObject.estimateGas();

        await transactionObject
        .send({
            from: opts.from,
            gas: estimatedGas,
            gasPrice: '1'
        }, function(error, transactionHash){  })
        .on('error', function(error){
            console.err("No error should occur.");
        })
        .then((newContractInstance) => {
            returnContract = newContractInstance;
        });

        return returnContract;
    }

    async deployContractSelfSigned(compiled, account) {
        console.log("[web3Wrapper.deployContractSelfSigned] called");
        console.log("[web3Wrapper.deployContractSelfSigned] bytecode: ", compiled.evm.bytecode.object)



        if(!account) account = await this.web3.eth.accounts.privateKeyToAccount(
            global.gConfig.node_account_pk);
        let signed = await account.signTransaction({
            gas: this.web3.utils.toHex('5000000'),
            gasPrice :this.web3.utils.toHex("0"),
            data: compiled.evm.bytecode.object
        })
        console.log('[web3Wrapper.deployContractSelfSigned] signed', signed)
            
        let returnContract = await this.web3.eth.sendSignedTransaction(signed.rawTransaction)
        console.log('[web3Wrapper.deployContractSelfSigned] returnContract:', returnContract)

        return returnContract;
    }

    async deployContractByAbiAndBytecode(abi, bytecode, account) {

    }
}


// Assumption: Metamast has already imjected a Web3 instance into the page
// !! FALSE FOR 2021 !! AND FOR SERVER-SIDE RENDERING !!

//const web3 = new Web3(window.web3.currentProvider);


/*


if(typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
    // Executed inside the browser, and metamask is available
    web3 = new Web3(window.web3.currentProvider);
} else {
    // We are on the browser *OR* the user is not running metamask
    const provider = new Web3.providers.HttpProvider(
        'https://rinkeby.infura.io/v3/559faf9ec0034bb9a265c681df791cdf',
    );
    web3 = new Web3(provider);
}
*/


module.exports = Web3Wrapper;