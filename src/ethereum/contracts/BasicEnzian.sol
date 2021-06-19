pragma solidity 0.8.0;


import "./domainModel/DecisionEntities.sol";
import "./domainModel/TaskEntities.sol";
import "./domainModel/ProcessEntities.sol";

import "./middleware/TaskLibrary.sol";

contract BasicEnzian {
    ProcessEntities.State processState;
    TaskEntities.DbTask[] public taskList;
    //Event for a Task completion.
    //[FRONTEND] can not read the return value of a function, but events.
    event TaskCompleted(bool indexed success);
    
// EVENT-LOGS

    //The EventLog stores the global Task.IDs
    uint[] public theRealEventLog;
    function getLog() public view returns(uint[] memory theevents) {
        return theRealEventLog;
    }

    // [DEBUGGING] A EventLog containing the Activity-Names of Tasks instead of global IDs
    string[] public debugStringeventLog;
    function getDebugStringeventLog() public view returns(string[] memory theevents) {
        return debugStringeventLog;
    }

// -------------------------------
// FUNCTIONALITY
// -------------------------------

    /*
    * @Param: Creates a Task
    *
    */
    function createTask(
        uint _id,
        string memory _activity,
        address _taskresource,
        DecisionEntities.GatewayType _pmg,
        uint[] memory _requirements,
        uint[] memory _competitors
        ) public {
        
        TaskEntities.Task memory _task = TaskLibrary.createTask(_activity, _taskresource, _pmg, _requirements, _competitors);
        processState.tasks[_id] = (_task);
        
        taskList.push(TaskLibrary.createDbTask(_id, _task));
    }
    
    function createTaskWithDecision(
        uint _id,
        string memory _activity,
        address _taskresource,
        DecisionEntities.GatewayType _pmg,
        uint[] memory _requirements,
        uint[] memory _competitors,
        DecisionEntities.Decision memory _decision
        ) public {
            
            if(_decision.type_ == DecisionEntities.DecisionType.STRINGDESC) {
                processState.string_processVariables[_decision.processVariable] = "";
            } else if(_decision.type_ == DecisionEntities.DecisionType.INTDESC) {
                processState.integer_processVariables[_decision.processVariable] = 0;
            }
            
            createTask(_id, _activity, _taskresource, _pmg, _requirements, _competitors);
            processState.tasks[_id].decision = (_decision);
        }


    /*
    * @Param: sets a Task on completed if resource equal to taskresource
    */
    function completing(uint taskId) public returns (bool success){
        require(!processState.tasks[taskId].completed, "DO NOT REPEAT TASKS!!!");
        TaskEntities.Task memory thetask = processState.tasks[taskId];
        uint endBoss;
        (success, endBoss) = TaskLibrary.completeTask(thetask, processState);
        
        if(thetask.decision.exists) {
            processState.enabled[endBoss] = success;

            //LOCKING
            for (uint i = 0; i < thetask.competitors.length; i++) {
                processState.tasks[(thetask.competitors[i])].completed = success;
            }       

        }
        processState.tasks[taskId].completed = success;
        emit TaskCompleted(success);
        
        if (success) {
            debugStringeventLog.push(thetask.activity);
            theRealEventLog.push(taskId);
        }
        
        return success;
    }
    
    
// -------------------------------
// GETTER
// -------------------------------
    /*
    * @param: Id of a State
    * @returns: status and description of the Task
    */
    function getTaskById(uint _id) public view returns (bool status,
        string memory description, address taskresource, DecisionEntities.GatewayType gateway,
        uint[] memory requirements, uint[] memory competitors){
        return (processState.tasks[_id].completed, processState.tasks[_id].activity, processState.tasks[_id].taskresource,
         processState.tasks[_id].preceedingMergingGateway, processState.tasks[_id].requirements, processState.tasks[_id].competitors);
    }
    
    function getStoredTasks() public view returns (TaskEntities.DbTask[] memory storedTasks){
        return taskList;
    }
    
// -------------------------------
// SETTER
// -------------------------------
    
    function updateIntProcessVariable(string calldata variableName, int newValue) public {
        processState.integer_processVariables[variableName] = newValue;
    }
    
    function updateStringProcessVariable(string calldata variableName, string calldata newValue) public {
        processState.string_processVariables[variableName] = newValue;
    }

}