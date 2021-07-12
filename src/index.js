const parseBPMN = require('./bpmn/parseBPMN');
const EthereumEnzianYellow = require('./ethereum/index');
const HyperledgerEnzianYellow = require('./hyperledger/index')

class EnzianYellow {

    constructor(provider, privateKey, type) {
        console.log('Enzian-yellow: passed type arg: ', type);
        switch(type){
            case 'ethereum':
                console.log("constructing eth-enzian-dev:");
                console.log("provider: " + provider)
                console.log("private key: " + privateKey)
                console.log("type: " + type);
                this.basicEnzianYellow = new EthereumEnzianYellow(provider, privateKey);
                break;

            case 'hyperledger':
                this.basicEnzianYellow = new HyperledgerEnzianYellow(provider, privateKey);
                break;
            default:
                console.log("DEFAULT-constructing eth-enzian-dev:");
                console.log("provider: " + provider)
                console.log("i provider metamask?: " + (provider === window.ethereum))
                console.log("private key: " + privateKey)
                console.log("type: " + "ethereum");
                this.basicEnzianYellow = new EthereumEnzianYellow(provider, privateKey, "ethereum");
                break;
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
}

module.exports = EnzianYellow;

