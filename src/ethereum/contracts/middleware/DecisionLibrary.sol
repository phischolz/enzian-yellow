pragma solidity 0.8.0;

import "../domainModel/DecisionEntities.sol";

library DecisionLibrary {
    
    function evaluate(string memory s1, string memory s2, DecisionEntities.Operator _op) public pure returns (bool isEqual) {
        bool equals = keccak256(bytes(s1)) == keccak256(bytes(s2));
        return _op == DecisionEntities.Operator.EQUAL? equals : !equals; 
    }

    // Evaluates a decision based on int
    function evaluate(int i1, int[] memory i2, DecisionEntities.Operator _op) public pure returns (bool isEqual) {
        
        // a < b
        if(_op == DecisionEntities.Operator.LESS) return i1 < i2[0];
        // a > b
        if(_op == DecisionEntities.Operator.GREATER)  return i1 > i2[0];
        // a = b
        if(_op == DecisionEntities.Operator.EQUAL) return i1 == i2[0];
        // a <= b
        if(_op == DecisionEntities.Operator.LEQ) return i1 <= i2[0];
        // a >= b
        if(_op == DecisionEntities.Operator.GEQ) return i1 >= i2[0];
        // e
        
        if(_op == DecisionEntities.Operator.ELEMENT){
            for (uint elementid = 0; elementid < i2.length ; elementid++){
                if (i1 == i2[elementid]){
                    return true;
                }
            }           
        }
        return false;
    }
    
    function returnZwo() public pure returns(uint zwo) {
        return 7;
    }
}