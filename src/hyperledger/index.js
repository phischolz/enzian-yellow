const hyperledgerAccessor = require('./hyperledger-accessor');
const context = "[HyperledegerEnzianYellow] "


//TODO DOC (first doc in accessor)


class HyperledgerEnzianYellow {

    constructor(provider, privateKey) {
        console.group(context, "construction");
        this.printArgs(arguments);

        this.accessor = new hyperledgerAccessor(provider, privateKey);

        console.groupEnd();
    }

    async deployEnzianProcess(parsedBPMN){
        console.group(context, "DeployEnzianProcess");
        this.printArgs(arguments);
        if(!this.accessor.initialized) await this.accessor.init();

        let deployedProcessAddress = await this.accessor.deployProcess();

        for(let count = 0; count < parsedBPMN.obj.length; count++) {
            let elem = parsedBPMN.obj[count];

            if(!elem.decisions) {
                let data = {
                    id: elem.task.id,
                    name: elem.task.name,
                    resource: elem.resource,
                    precedingMergingGateway: elem.proceedingMergingGateway,
                    requirements: elem.requirements.map(req => req.id),
                    competitors: []};
                await this.accessor.registerTask(deployedProcessAddress, data);

            } else {
                //TODO
            }
        }

        console.groupEnd();
        return deployedProcessAddress;
    }

    async executeTask(processAddress, taskID){
        console.group(context, "executeTask");
        this.printArgs(arguments);
        if(!this.accessor.initialized) await this.accessor.init();

        let response = await this.accessor.executeTask(processAddress, taskID);

        console.groupEnd();
        return response;
    }

    async eventLog(processAddress){
        console.group(context, "eventLog");
        this.printArgs(arguments);
        if(!this.accessor.initialized) await this.accessor.init();

        let response = await this.accessor.getEventLog(processAddress);

        console.groupEnd();
        return response;
    }

    async updateProcessVariable(processAddress, variableName, newValue) {
        console.group(context, "updateProcessVariable");
        this.printArgs(arguments);
        if(!this.accessor.initialized) await this.accessor.init();

        let response = await this.accessor.updateProcessVariable(processAddress, variableName, newValue);

        console.groupEnd();
        return response;
    }

    async getProcessVariable(processAddress, variableName) {
        console.group(context, "getAllTasks");
        this.printArgs(arguments);
        if(!this.accessor.initialized) await this.accessor.init();

        let response = await this.accessor.getProcessVariable(processAddress, variableName)

        console.groupEnd();
        return response;
    }

    async getAllTasks(processAddress, possibleOnly = false) {
        console.group(context, "getAllTasks");
        this.printArgs(arguments);
        if(!this.accessor.initialized) await this.accessor.init();

        let response = await this.accessor.getAllTasks(processAddress, possibleOnly);

        console.groupEnd();
        return response;
    }

    printArgs(args){
        console.groupCollapsed("args:");
        console.dir(args);
        console.groupEnd();
    }
}

module.exports = HyperledgerEnzianYellow;