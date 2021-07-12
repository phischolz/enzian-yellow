const HyperledgerAccessor = require('../../src/hyperledger/hyperledger-accessor')
const HyperLedgerEnzianYellow = require(('../../src/hyperledger/index'))
const assert = require('chai').assert

describe('HL-EnzianYellow-test', async() => {
    let enzian = new HyperLedgerEnzianYellow(undefined, undefined);
    let processAddress;
    it('instantiate', async () => {
        assert.exists(enzian);
        assert.exists(enzian.accessor);
    })

    it('instantiate', async () => {
        let respID = enzian.deployEnzianProcess(undefined)
        assert.exists(respID)
    })

})