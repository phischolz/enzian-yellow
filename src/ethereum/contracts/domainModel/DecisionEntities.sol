pragma solidity 0.8.0;

library DecisionEntities{
    enum GatewayType {NONE, AND, OR, XOR}

    enum Operator{LESS,GREATER,EQUAL,NEQ,LEQ,GEQ,ELEMENT}
    
    enum DecisionType{STRINGDESC,INTDESC,TIMEDESC}

   struct Decision{
        uint endBoss;
        GatewayType gatewaytype;
        DecisionType type_;
        bool completed;
        bool exists;        
        Operator operator;
        string processVariable;
        string s_value;
        int[] i_value;
    }
}