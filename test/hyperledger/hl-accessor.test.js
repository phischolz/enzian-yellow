const HyperledgerAccessor = require('../../src/hyperledger/hyperledger-accessor')
const assert = require('chai').assert

describe('HL-accessor-test', async() => {
    let accessor = new HyperledgerAccessor(undefined, undefined);
    let processAddress;
    it('instantiate', async() => {
        await accessor.init();
    })

    it('createProcess', async function(){
        processAddress = await accessor.deployProcess();
        assert.exists(processAddress);
    })

    it('createTask', async function(){
        let data = {
            id: 0,
            name: 'a',
            resource: '',
            precedingMergingGateway: 0,
            requirements: [],
            competitors: []};
        let ans = await accessor.registerTask(processAddress, data);
        assert.isTrue(ans);
    })

    it('executeTask', async function(){
        let ans = await accessor.executeTask(processAddress, 0);
        assert.isTrue(ans);
    })

    it('getEventLog', async function(){
        let ans = await accessor.getEventLog(processAddress);
        assert.instanceOf(ans, Array);
        assert.equal(0, ans[0]);
    })
})