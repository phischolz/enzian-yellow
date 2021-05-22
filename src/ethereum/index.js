const ethereumAccessor = require('./ethereum-accessor');
const basicEnzianCompiled = require('./build/BasicEnzian.json');
const{ GatewayType, DecisionType, operatorBySymbol } = require('../contract-consts');


class EthereumEnzianYellow {

    /**
     *
     *
     * @param provider either window.ethereum, or
     * an HTTP URL with port to access the Blockchain
     *
     * @param [privateKey] if provider is not window.ethereum or doesn't provide accounts, this
     * private Key will be used to access the Chain and operate on it.
     *
     * @param [compiled]
     */
    constructor(provider, privateKey){
        this.accessor = new ethereumAccessor(provider, privateKey);
        this.compiled = basicEnzianCompiled;


    }

    /**
     *
     * @param parsedBPMN
     * @returns {Promise<*>} Contract address of Process.
     */
    async deployEnzianProcess(parsedBPMN){

        let deployedContractAddr = await this.accessor.deployContract(this.compiled.abi, this.compiled.evm.bytecode);

        for(let count = 0; count < parsedBPMN.obj.length; count++) {
            let elem = parsedBPMN.obj[count];

            if(!elem.decisions) {
                let data = {
                    id: elem.task.id,
                    name: elem.task.name,
                    resource: elem.resource? elem.resource : '0x0000000000000000000000000000000000000000',
                    proceedMergingGateway: elem.proceedingMergingGateway? elem.proceedingMergingGateway.id: 0,
                    req: elem.requirements.map(req => req.id),
                    fin: []};
                await this.accessor.registerTask(deployedContractAddr, data, this.compiled.abi);
                
            } else {
                let decisionType = elem.decisions.decisions.processVariable.startsWith('\'\'')
                    ? DecisionType.STRINGDESC.id : DecisionType.INTDESC.id;

                let data = {
                    id:     elem.task.id,
                    name:   elem.task.name,
                    res:    elem.resource? elem.resource : '0x0000000000000000000000000000000000000000',
                    proc:   elem.proceedingMergingGateway? elem.proceedingMergingGateway.id: 0,
                    req:    elem.requirements.map(req => req.id),
                    
                    // if competitors are available, map them to their corresponding id in the model and send the array of competitor-ids
                    com:    elem.competitors? _.map(elem.competitors, (ele) => { return parsedBPMN.idByName(ele); }) : [],
                    fin:    {
                            //endBoss: elem.decisions.lastTask,
                            endBoss: parseInt(parsedBPMN.idByName(elem.decisions.lastTask)),
                            gatewaytype: GatewayType.XOR.id,    // ?
                            type_: decisionType,
                            completed: false,                  // ?
                            exists: true,
                            operator: operatorBySymbol(elem.decisions.decisions.operator).id,
                            processVariable: elem.decisions.decisions.processVariable,
                            s_value: decisionType === DecisionType.STRINGDESC.id? elem.decisions.decisions.localValue: '',
                            i_value: decisionType === DecisionType.INTDESC.id? elem.decisions.decisions.localValue: 0,
                            //  s_value: '',
                            //  i_value: 0,
                        
                            }
                }
                await this.accessor.registerDecisionTask(deployedContractAddr, data, this.compiled.abi);
                
                    
            }
        }
        return deployedContractAddr;

    }

    /**
     *
     * @param contractAddress
     * @param taskID
     * @returns {Promise<number|boolean|string|"rejected"|"fulfilled">}
     */
    async executeTask(contractAddress, taskID){
        return this.accessor.executeTask(this.compiled.abi, contractAddress, taskID);
    }

    /**
     *
     * @param contractAddress
     * @returns {Promise<*>}
     */
    async eventLog(contractAddress){
        return await this.accessor.getEventLog(this.compiled.abi, contractAddress);
    }

    /**
     *
     * @param contractAddress
     * @param variableName
     * @param newValue
     * @returns {Promise<void>}
     */
    async updateProcessVariable(contractAddress, variableName, newValue) {
        await this.accessor.updateProcessVariable(this.compiled.abi, contractAddress, variableName, newValue);
    }
}

module.exports = EthereumEnzianYellow;