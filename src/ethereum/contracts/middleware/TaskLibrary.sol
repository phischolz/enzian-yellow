pragma solidity 0.8.0;

import "../domainModel/TaskEntities.sol";
import "../domainModel/ProcessEntities.sol";
import "../domainModel/DecisionEntities.sol";

import "./DecisionLibrary.sol";

library TaskLibrary {
    
    function createTask(string memory _activity,
        address _taskresource,
        DecisionEntities.GatewayType _pmg,
        uint[] memory _requirements,
        uint[] memory _competitors) public pure returns (TaskEntities.Task memory newTask) {
            newTask.activity = _activity;
            newTask.preceedingMergingGateway = _pmg;
            newTask.taskresource = _taskresource;
            newTask.requirements = _requirements;
            newTask.completed = false;
            newTask.competitors = _competitors;
            return newTask;
        }
    
    function createDbTask(uint _id, TaskEntities.Task memory _task) public pure returns (TaskEntities.DbTask memory _storedTask) {
        TaskEntities.DbTask memory storedTask;
        storedTask.id = _id;
        storedTask.activity = _task.activity;
        return storedTask;
    }
    
    function completeTask(TaskEntities.Task memory _task, ProcessEntities.State storage _state) public view returns (bool success, uint endBoss) {
        endBoss = 0;
        
        // ORGANISATIONAL PERSPECTIVE
        address resource = _task.taskresource;
        require(resource == address(0) || resource == msg.sender, _task.activity);
        
        // INFORMATIONAL PERSPECTIVE
        
        // evaluate Decision

        if(_task.decision.exists) {
            endBoss = _task.decision.endBoss;
            bool result = evaluateDecision(_task.decision, _state);
            require(result, 'Process Variable is not correct.');
        }
        
        // CONTROL-FLOW PERSPECTIVE
    
        uint[] memory requiredTasksIds = _task.requirements;
        if (requiredTasksIds.length == 0) {
            return (true, endBoss);
        }

        DecisionEntities.GatewayType gateway = _task.preceedingMergingGateway;
            
        if (gateway == DecisionEntities.GatewayType.NONE) {
            return (_state.tasks[requiredTasksIds[0]].completed, endBoss);
        }
        uint fulfilledRequirements = 0;
        // HOW MANY REQUIREMENTS ARE FULFILLED?
        for (uint i = 0; i < requiredTasksIds.length; i++) {
            if (_state.tasks[requiredTasksIds[0]].completed) {
                fulfilledRequirements++;
            }
        }

        if(gateway == DecisionEntities.GatewayType.AND) {
            // alle müssen erfüllt sein
            return (fulfilledRequirements == requiredTasksIds.length, endBoss);
                    
        }
                    
        if (gateway == DecisionEntities.GatewayType.OR) {
            return (fulfilledRequirements > 0, endBoss);
        }
        
        if(gateway == DecisionEntities.GatewayType.XOR) {
            for (uint i = 0; i < requiredTasksIds.length; i++) {

                // requirements of tasks following a merging gateway:
                // tasks following an split gateway must store the end boss and set the required flag to true;
                // NO! better: gateway (give it not--> ) decision stores end boss   
                if (_state.enabled[requiredTasksIds[i]]) {
                    success = _state.tasks[requiredTasksIds[0]].completed;
                }
            }
        }
        
        return (success, endBoss);
    }
    
    function evaluateDecision(DecisionEntities.Decision memory _decision, ProcessEntities.State storage _state) public view returns (bool success){
        if(_decision.type_ == DecisionEntities.DecisionType.STRINGDESC){
            string memory valueOfProcessVariable = _state.string_processVariables[_decision.processVariable];
            return DecisionLibrary.evaluate(valueOfProcessVariable, _decision.s_value, _decision.operator);
        }
        else if(_decision.type_ == DecisionEntities.DecisionType.INTDESC){
            int valueOfProcessVariable = _state.integer_processVariables[_decision.processVariable];
            return DecisionLibrary.evaluate(valueOfProcessVariable, _decision.i_value, _decision.operator);
        }
    }    
}