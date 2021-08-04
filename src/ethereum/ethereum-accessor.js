const Web3 = require('web3')
const context = "[EthereumAccessor] "

/**
 * takes care of direct blockchain communication.
 * * takes location of blockchain from provider (URL or window.ethereum)
 * * if provider didn't state any accounts, privateKey will be transformed into a local account.
 * * constructor will crash if no account can be derived from args.
 * * loop-optimized: if called with identical contractAddress as before, this object will re-use the previous instance.
 */
class ethereumAccessor{

    constructor(provider, privateKey){
        console.group(context, "constructor");
        this.printArgs(arguments);

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
        console.groupEnd();
    }

    /**
     *
     * @param abi
     * @param bytecode
     * @returns {Promise<*>}
     */
    async deployContract(abi, bytecode) {
        console.group(context, "deployContract");
        this.printArgs(arguments);

        let contract = new this.web3.eth.Contract(abi);
        let transactionObject = await contract.deploy({data: bytecode});


        const estimatedGas = await transactionObject.estimateGas(
            {gas: 5000000},
            function(error, gasAmount){
                if(gasAmount === 5000000) console.log('Method ran out of gas');
                if(error) console.log('ERROR: ', error);
            });

        let returnContract;
        await transactionObject
            .send({
                from: this.account.address,
                gas: estimatedGas,
                gasPrice: '1'
            }, function(error, transactionHash){  })
            .on('error', function(error){
                console.error(context, 'this shouldn`t happen', error);})
            .then((newContractInstance) => {
                returnContract = newContractInstance;
            });

        console.log('returnContract', returnContract);
        this.contract = returnContract;
        this.contractAddress = returnContract.options.address;
        console.groupEnd();
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
        console.group(context, "registerTask");
        this.printArgs(arguments);
        await this.setCurrentContract(abi, contractAddress);
        await this.contract.methods.createTask(
            data.id,
            data.name,
            data.resource,
            data.proceedMergingGateway,
            data.req,
            data.fin
        ).send({from: this.account.address, gas: 1000000});
        console.groupEnd();
    }

    /**
     * adds decision-task to selected Contract.
     * @param contractAddress
     * @param data
     * @param abi
     * @returns {Promise<void>}
     */
    async registerDecisionTask(contractAddress, data, abi) {
        console.group(context, "registerDecisionTask");
        this.printArgs(arguments);
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
        console.groupEnd();
    }

    /**
     *
     * @param abi
     * @param contractAddress
     * @param taskID
     * @returns {Promise<number|boolean|string|"rejected"|"fulfilled">}
     */
    async executeTask(abi, contractAddress, taskID){
        console.group(context, "executeTask");
        this.printArgs(arguments);
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
        console.groupEnd();
        return receipt.status; //this should NEVER be false!
    }

    /**
     *
     * @param abi
     * @param contractAddress
     * @returns {Promise<*>}
     */
    async getEventLog(abi, contractAddress){
        console.group(context, "getEventLog");
        this.printArgs(arguments);
        await this.setCurrentContract(abi, contractAddress);
        let res =  await this.contract.methods.getDebugStringeventLog().call({from: this.account.address});
        console.groupEnd();
        return res;
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
        console.group(context, "updateProcessVariable");
        this.printArgs(arguments);
        await this.setCurrentContract(abi, contractAddress);
        this.contract.methods.updateIntProcessVariable(variableName, newValue)
            .send({ from: this.account.address, gas: 1000000 });
        console.groupEnd();
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
        console.group(context, "getTasksForAddress");
        this.printArgs(arguments);
        await this.setCurrentContract(abi, contractAddress);
        let res = await this.contract.methods.getStoredTasks().call({from: this.account.address});
        console.groupEnd();
        return res;
    }

    printArgs(args){
        console.groupCollapsed("args:");
        console.dir(args);
        console.groupEnd();
    }
}
module.exports = ethereumAccessor;
