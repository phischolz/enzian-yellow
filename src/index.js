const parseBPMN = require('./bpmn/parseBPMN');
const EthereumEnzianYellow = require('./ethereum/index');

class EnzianYellow {

    constructor(provider, privateKey, type, opts) {
        console.log("EnzianYellow instantiating");
        switch(type){
            case 'ethereum':
                this.basicEnzianYellow = new EthereumEnzianYellow(provider, privateKey, opts);
                break;
            default:
                type = 'ethereum';
        }
    }

    /**
     *
     * @param bpmnModel
     * @returns {Promise<Requirements>} enzianModel for deployment.
     */
    async parseBpmnModel(bpmnModel) {
        return await parseBPMN(bpmnModel);
    }

    /**
     * returns contract address.
     * @param enzianModel
     * @returns {Promise<string>}
     */
    async deployEnzianModel(enzianModel) {
        return await this.basicEnzianYellow.deployEnzianProcess(enzianModel);
    }

    /**
     *
     * @param bpmnModel
     * @returns {Promise<{deployedModelAddr: string, parsedBPMN: Requirements}>}
     */
    async deployBPMNProcess(bpmnModel) {
        let parsedBPMN = await this.parseBpmnModel(bpmnModel);
        let deployedModelAddr = await this.basicEnzianYellow.deployEnzianProcess(parsedBPMN);
        return { parsedBPMN, deployedModelAddr };
    }

    /**
     *
     * @param contractAddress
     * @param task
     * @returns {Promise<number|boolean|string|"rejected"|"fulfilled">}
     */
    async executeTask(contractAddress, task) {
        return await this.basicEnzianYellow.executeTask(contractAddress, task);
    }

    async updateProcessVariable(contractAddress, variableName, newValue) {
        return await this.basicEnzianYellow.updateProcessVariable(contractAddress, variableName, newValue);
    }

    /**
     *
     * @param contractAddress
     * @returns {Promise<*>}
     */
    async eventLog(contractAddress) {
        return this.basicEnzianYellow.eventLog(contractAddress);
    }

    /**
     * Get a list of tasks associated with a given address
     * @param contractAddress
     * @returns {Promise<*>}
     */
    async tasksForAddress(contractAddress) {
        return this.basicEnzianYellow.tasksForAddress(contractAddress);
    }
}

module.exports = EnzianYellow;

