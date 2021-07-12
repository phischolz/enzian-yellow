const context = "[HyperledgerAccessor] ";
'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./utils/CAUtil');
const { buildCCPOrg1, buildWallet } = require('./utils/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

function prettyJSONString(inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}
//TODO IMPL
//TODO DOC

const NONE = JSON.stringify('');
const NONEARRAY = JSON.stringify([]);

class HyperledgerAccessor {

    initialized = false;
    ccp;
    caClient;
    wallet;
    gateway;
    network;
    contract;

    constructor(provider, privateKey){
        console.group(context, "construction");
        this.printArgs(arguments);
        console.groupEnd();
    }

    async init(){
        // build an in memory object with the network configuration (also known as a connection profile)
        this.ccp = buildCCPOrg1();

        // build an instance of the fabric ca services client based on
        // the information in the network configuration
        this.caClient = buildCAClient(FabricCAServices, this.ccp, 'ca.org1.example.com');

        // setup the wallet to hold the credentials of the application user
        this.wallet = await buildWallet(Wallets, walletPath);

        // in a real application this would be done on an administrative flow, and only once
        await enrollAdmin(this.caClient, this.wallet, mspOrg1);

        // in a real application this would be done only when a new user was required to be added
        // and would be part of an administrative flow
        await registerAndEnrollUser(this.caClient, this.wallet, mspOrg1, org1UserId, 'org1.department1');

        // Create a new gateway instance for interacting with the fabric network.
        // In a real application this would be done as the backend server session is setup for
        // a user that has been verified.
        this.gateway = new Gateway();
        await this.connect();
        this.network = await this.gateway.getNetwork(channelName);
        this.contract = await this.network.getContract(chaincodeName);
        this.initialized = true;
    }

    async connect(){
        await this.gateway.connect(this.ccp, {
            wallet: this.wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
    }

    async deployProcess() {
        console.group(context, "deployProcess");
        this.printArgs(arguments);

        console.log('calling createProcess...');
        let returnValue = (await this.contract.submitTransaction('createProcess')).toString();
        console.log('... createProcess returned Key: ', returnValue);

        console.groupEnd();
        return returnValue;
    }

    async registerTask(processAddress, data){
        console.group(context, "registerTask");
        this.printArgs(arguments);

        let ans = (await this.contract.submitTransaction(
            'createTask',
            processAddress,
            data.id,
            data.name? data.name : NONE,
            data.resource? data.resource : NONE,
            data.competitors? JSON.stringify(data.competitors) : NONEARRAY,
            data.precedingMergingGateway? data.precedingMergingGateway : 0,
            data.requirements? JSON.stringify(data.requirements) : NONEARRAY,
            '')).toString()

        if(!ans) console.log('Contract returned empty answer -> Success');
        else console.log('Contract returned non-empty answer -> Failure');
        console.groupEnd();
        return (!ans);
    }

    async registerDecisionTask(processAddress, taskID) {
        console.group(context, "registerDecisionTask");
        this.printArgs(arguments);



        console.groupEnd();
        return undefined;
        //TODO
    }

    async executeTask(processAddress, taskID){
        console.group(context, "executeTask");
        this.printArgs(arguments);

        let ans = JSON.parse((await this.contract.submitTransaction(
            'executeTask',
            processAddress,
            taskID
        )).toString())

        console.log('answer by executeTask (success value): ', ans);
        console.groupEnd();
        return ans;
    }

    async getEventLog(processAddress){
        console.group(context, "getEventLog");
        this.printArgs(arguments);

        let ans = JSON.parse((await this.contract.submitTransaction(
            'getEventLog',
            processAddress
        )).toString())
        ans = Array.from(ans, x => (typeof x === 'string')? parseInt(x) : x)

        console.log('getEventLog returned: ', ans)
        console.groupEnd();
        return ans;
    }

    async getAllTasks(processAddress, possibleOnly = false){
        console.group(context, "getAllTasks");
        this.printArgs(arguments);
        console.debug("not implemented yet, nothing affected!")
        console.groupEnd();
        return undefined;
        //TODO
    }

    async createProcessVariable(processAddress, variableID, initialValue, variableName){
        console.group(context, "createProcessVariable");
        this.printArgs(arguments);
        console.debug("not implemented yet, nothing affected!")
        console.groupEnd();
        return undefined;
        //TODO
    }

    async getProcessVariable(processAddress, variableName){
        console.group(context, "getProcessVariable");
        this.printArgs(arguments);
        console.debug("not implemented yet, nothing affected!")
        console.groupEnd();
        return undefined;
        //TODO
    }

    async updateProcessVariable(processAddress, variableID, newValue) {
        console.group(context, "updateProcessVariable");
        this.printArgs(arguments);
        console.debug("not implemented yet, nothing affected!")
        console.groupEnd();
        return undefined;
        //TODO
    }

    printArgs(args){
        console.groupCollapsed("args:");
        console.dir(args);
        console.groupEnd();
    }
}

module.exports = HyperledgerAccessor;