const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');
const linker = require("solc/linker");
const { DECISION_LIBRARY_ROPSTEN } = require('../global');

/**
 * Compiles given smart contract, linking it with libraries if present
 * @param fileName - name of the file, containng the contract
 * @param fileFolder - Name of the folder, containing the contract file
 * @param libraries - map with names and addresses of the linked libraries
 * @returns {Promise<*>} - compiled contract
 */
const compileOne = async (fileName, fileFolder, libraries) => {
            //remove output file
            const buildPath = path.resolve(__dirname, 'build');
            fs.removeSync(buildPath + '\\' + fileName.replace('.sol', '.json'));


            const contractPath = path.resolve(__dirname, 'contracts', fileFolder, fileName);
            const source = fs.readFileSync(contractPath, 'UTF-8');

            let input = {
                language: 'Solidity',
                sources: {
                    [fileName] : {
                        content: source
                    }
                },
                settings: {
                    libraries: libraries ? libraries : {},
                    outputSelection: {
                        '*': {
                            '*': [ '*' ]
                        }
                    }
                }
            };

            const output = JSON.parse(solc.compile(JSON.stringify(input), { import: getLibrarySource }));

            // create build folder if not exists
            fs.ensureDirSync(buildPath);
            fs.outputJsonSync(path.resolve(buildPath,  fileName.replace('.sol', '.json')), output.contracts[fileName][fileName.replace('.sol', '')]);

            return output.contracts[fileName][fileName.replace('.sol', '')];
    

}

function getLibrarySource(dependency) {
    const isMiddleWare = dependency.includes('Library');
    dependency = dependency.substring(dependency.lastIndexOf('/') + 1);
    const source = fs.readFileSync(path.resolve(__dirname, 'contracts',isMiddleWare ? 'middleware' : 'domainModel', dependency), 'UTF-8');

      return {
        contents:
        source
      };
}

const linkLibrary = (contract, contractName, libraryAddress) => {
    let hexAddress = libraryAddress.slice(2);
    hexAddress = Array(40 - hexAddress.length + 1).join('0') + hexAddress;
    const finalByteCode = contract.evm.bytecode.object.split('__' + Object.keys(linker.findLinkReferences(contract.evm.bytecode.object))[0] + '__').join(hexAddress);
    contract.evm.bytecode.object = finalByteCode
    contract.evm.deployedBytecode.object = finalByteCode
    const buildPath = path.resolve(__dirname, 'build');
    fs.outputJsonSync(path.resolve(buildPath,  contractName + '.json'), contract);
}

module.exports = { compileOne, linkLibrary }
