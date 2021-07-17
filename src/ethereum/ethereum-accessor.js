const config = require('../../config/config')
const Web3 = require('web3')

/**
 * takes care of direct blockchain communication.
 * * takes location of blockchain from provider (URL or window.ethereum)
 * * if provider didn't state any accounts, privateKey will be transformed into a local account.
 * * constructor will crash if no account can be derived from args.
 * * loop-optimized: if called with identical contractAddress as before, this object will re-use the previous instance.
 */
class ethereumAccessor{

    constructor(provider, privateKey){
        this.contract = undefined;
        this.contractAddress = undefined;
        let initialized = false;
        this.web3 = new Web3(provider);
        if(provider === window.ethereum){
            this.account = this.web3.eth.getAccounts()[0];
            if(this.account){
                initialized = true;
            }
        }
        if(!initialized && privateKey){
            this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
            this.web3.eth.accounts.wallet.add(this.account);
            initialized = true;
        }
        if(!initialized) {
            throw new Error('ETHEREUM-ACCESSOR: no viable account information given!')
        }
    }

    /**
     *
     * @param abi
     * @param bytecode
     * @returns {Promise<*>}
     */
    async deployContract(abi, bytecode) {
        console.log('[ethereumAccessor.deployContract] called');
        console.log('[ethereumAccessor.deployContract] abi:', abi);
        console.log('[ethereumAccessor.deployContract] bytecode', bytecode);

        let contract = new this.web3.eth.Contract(abi);
        let transactionObject = await contract.deploy({data: bytecode});
        console.log('[ethereumAccessor.deployContract] transactionObject', transactionObject)

        const estimatedGas = await transactionObject.estimateGas(
            {gas: 5000000},
            function(error, gasAmount){
                if(gasAmount === 5000000) console.log('[ethereumAccessor.deployContract] Method ran out of gas');
                if(error) console.log('[ethereumAccessor.deployContract] ERROR', error);
            });

        let returnContract;
        await transactionObject
            .send({
                from: this.account.address,
                gas: estimatedGas,
                gasPrice: '1'
            }, function(error, transactionHash){  })
            .on('error', function(error){
                console.error('[ethereumAccessor.deployContract] this shouldn`t happen', error);})
            .then((newContractInstance) => {
                returnContract = newContractInstance;
            });

        console.log('[ethereumAccessor.deployContract] returnContract', returnContract);
        this.contract = returnContract;
        this.contractAddress = returnContract.options.address;
        return this.contractAddress;
    }

    /**
     * adds task to selected Contract.
     * @param contractAddress
     * @param data
     * @param abi
     * @returns {Promise<void>}
     */
    async registerTask(contractAddress, data, abi){
        await this.setCurrentContract(abi, contractAddress);
        await this.contract.methods.createTask(
            data.id,
            data.name,
            data.resource,
            data.proceedMergingGateway,
            data.req,
            data.fin
        ).send({from: this.account.address, gas: 1000000});
    }

    /**
     * adds decision-task to selected Contract.
     * @param contractAddress
     * @param data
     * @param abi
     * @returns {Promise<void>}
     */
    async registerDecisionTask(contractAddress, data, abi) {
        await this.setCurrentContract(abi, contractAddress);
        await this.contract.methods.createTaskWithDecision(
            data.id,
            data.name,
            data.res,
            data.proc,
            data.req,
            data.com,
            data.fin
        ).send({from: this.account.address, gas: 1000000});
    }

    /**
     *
     * @param abi
     * @param contractAddress
     * @param taskID
     * @returns {Promise<number|boolean|string|"rejected"|"fulfilled">}
     */
    async executeTask(abi, contractAddress, taskID){
        await this.setCurrentContract(abi, contractAddress);
        let receipt;
        try{
            receipt = await this.contract.methods.completing(taskID)
                .send({ from: this.account.address, gas: 1000000 })
        } catch (e) {
            console.log("[ethereum-accessor.executeTask] ERROR:",
                e.stack);
            return false;
        }
        //return receipt.events.TaskCompleted.returnValues.success;
        return receipt.status; //this should NEVER be false!
    }

    /**
     *
     * @param abi
     * @param contractAddress
     * @returns {Promise<*>}
     */
    async getEventLog(abi, contractAddress){
        await this.setCurrentContract(abi, contractAddress);
        return await this.contract.methods.getDebugStringeventLog().call({from: this.account.address});
    }

    /**
     *
     * @param abi
     * @param contractAddress
     * @param variableName
     * @param newValue
     * @returns {Promise<void>}
     */
    async updateProcessVariable(abi, contractAddress, variableName, newValue) {
        await this.setCurrentContract(abi, contractAddress);
        this.contract.methods.updateIntProcessVariable(variableName, newValue)
            .send({ from: this.account.address, gas: 1000000 });
    }

    /**
     * makes sure that the passed contract address is the one currently considered.
     * @param abi
     * @param contractAddress
     * @returns {Promise<void>}
     */
    async setCurrentContract(abi, contractAddress){
        if(!(contractAddress && (contractAddress === this.contractAddress))) {
            this.contract = new this.web3.eth.Contract(abi, contractAddress);
            this.contractAddress = contractAddress;
        }
    }

    /**
     * Call a method on the given contract returning the list of tasks associated with it
     * @param abi
     * @param contractAddress
     * @returns {Promise<*>}
     */
    async getTasksForAddress(abi, contractAddress){
        await this.setCurrentContract(abi, contractAddress);
        return await this.contract.methods.getStoredTasks().call({from: this.account.address});
    }
}
module.exports = ethereumAccessor;
