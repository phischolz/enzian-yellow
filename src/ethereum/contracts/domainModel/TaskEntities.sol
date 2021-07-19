pragma solidity 0.8.0;

import "./DecisionEntities.sol";

library TaskEntities {
    
    struct Task {
        string activity;
        address taskresource;
        bool completed;
        DecisionEntities.GatewayType preceedingMergingGateway;
        uint[] requirements;
        uint[] competitors;
        DecisionEntities.Decision decision;
    }
    
    struct DbTask {
        uint id;
        string activity;
    }
}