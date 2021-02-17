pragma solidity 0.8.0;


import "DecisionLibrary.sol";

contract BasicEnzian {

// CONTROL-FLOW PERSPECTIVE

    enum GatewayType {NONE, AND, OR, XOR}

    struct Task {
        string activity;
        address taskresource;
        bool completed;
        GatewayType preceedingMergingGateway;
        uint[] requirements;
        uint[] competitors;
        Decision decision;
    }
    
    // The global Task.ID is mapped to the Task
    mapping(uint => Task) tasks;
    //Event for a Task completion.
    //[FRONTEND] can not read the return value of a function, but events.
    event TaskCompleted(bool indexed success);


// ORGANISATIONAL PERSPECTIVE


// INFORMATIONAL PERSPECTIVE
    
    enum DecisionType{STRINGDESC,INTDESC,TIMEDESC}

   struct Decision{
        uint endBoss;
        GatewayType gatewaytype;
        DecisionType type_;
        bool completed;
        bool exists;        
        DecisionLibrary.Operator operator;
        string processVariable;
        string s_value;
        int[] i_value;
    }

    
    // RENAME: PROCESS VARIABLES
    //string[] public string_processVariables;
    //string[] public integer_processVariables;
    mapping(string => int) public integer_processVariables;
    mapping(string => string) public string_processVariables;
    
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
        GatewayType _pmg,
        uint[] memory _requirements,
        uint[] memory _competitors
        ) public {
                                
        Task memory myStruct;
        myStruct.activity = _activity;
        myStruct.taskresource = _taskresource;
        myStruct.completed = false;
        myStruct.preceedingMergingGateway = _pmg;
        myStruct.requirements = _requirements;
        myStruct.competitors = _competitors;
        tasks[_id] = (myStruct);
    }
    
    
     function createTaskWithDecision(
        uint _id,
        string memory _activity,
        address _taskresource,
        GatewayType _pmg,
        uint[] memory _requirements,
        uint[] memory _competitors,
        Decision memory _decision
        ) public {

        if(_decision.type_ == DecisionType.STRINGDESC) {
            string_processVariables[_decision.processVariable] = "";
        } else if(_decision.type_ == DecisionType.INTDESC) {
            integer_processVariables[_decision.processVariable] = 5;
        }

        createTask(_id, _activity, _taskresource, _pmg, _requirements, _competitors);

        tasks[_id].decision = _decision;

    }
    
    function updateIntProcessVariable(string calldata variableName, int newValue) public {
        integer_processVariables[variableName] = newValue;
    }
    
    function updateStringProcessVariable(string calldata variableName, string calldata newValue) public {
        string_processVariables[variableName] = newValue;
    }

    function getIntProcessVariableValue(string calldata variableName) public view returns (int thevalue) {
        return integer_processVariables[variableName];
    }


    /*
    * @Param: sets a Task on completed if resource equal to taskresource
    */
    function completing(uint taskId) public returns (bool success){
        
    // ORGANISATIONAL PERSPECTIVE
        
        address resource = tasks[taskId].taskresource;
        require(resource == address(0) || resource == msg.sender, tasks[taskId].activity);

    // INFORMATIONAL PERSPECTIVE
        
        // evaluate Decision
        
        if(tasks[taskId].decision.exists) {
            bool result = evaluateDecision(tasks[taskId].decision);
            require(result, 'Process Variable is not correct.');
        }
        
        
        
    // CONTROL-FLOW PERSPECTIVE
    
        uint[] memory requiredTasksIds = tasks[taskId].requirements;
        if (requiredTasksIds.length == 0) {
            success = true;
        }
        else {
            GatewayType gateway = tasks[taskId].preceedingMergingGateway;
            
            if (gateway == GatewayType.NONE) {
                if (isTaskCompletedById(requiredTasksIds[0]) == true) {
                    success = true;
                }
            }
            else {
                uint fulfilledRequirements;
                // HOW MANY REQUIREMENTS ARE FULFILLED?
               for (uint i = 0; i < requiredTasksIds.length; i++) {
                    if (isTaskCompletedById(requiredTasksIds[i]) == true) {
                        fulfilledRequirements++;
                    }
                }
                
                if(gateway == GatewayType.AND) {
                  
                  // alle müssen erfüllt sein
                    if (fulfilledRequirements == requiredTasksIds.length) {
                       success = true;
                    }
                    
                }
                else {
                    

                    // enabled müssen erfüllt sein
                    // enabled ist,
                    //  decision stores
                    
                    if(gateway == GatewayType.OR) {
                    // F
                    // if forAll enabledFor(F) are executed OK
    
                        success = true;
                    }
                    else if(gateway == GatewayType.XOR) {
                        if (fulfilledRequirements == 1 || fulfilledRequirements == 2) {
                            success = true;
                        }
                         //LOCKING
        
                        // requirements of tasks following a merging gateway:
                        // tasks following an split gateway must store the end boss and set the required flag to true;
                        // NO! better: gateway (give it not--> ) decision stores end boss
                    }
                    
                } // END ELSE GATEWAY DECISION
            } // END ELSE GATEWAY
        }
        

        

        if(success) {
            tasks[taskId].completed = true;
            theRealEventLog.push(taskId);
            debugStringeventLog.push(tasks[taskId].activity);
            emit TaskCompleted(true);
        }
        else {
            emit TaskCompleted(false);
        }
        
        return success;
        
    }
    
    function evaluateTest(int i1, int[] memory i2, DecisionLibrary.Operator op) public pure returns (bool equality) {
        return DecisionLibrary.evaluate(i1, i2, op);
    }

    function evaluateDecision(Decision memory _decision) public view returns (bool success){
        if(_decision.type_ == DecisionType.STRINGDESC){
            string memory valueOfProcessVariable = string_processVariables[_decision.processVariable];
            return DecisionLibrary.evaluate(valueOfProcessVariable, _decision.s_value, _decision.operator);
        }
        else if(_decision.type_ == DecisionType.INTDESC){
            int valueOfProcessVariable = integer_processVariables[_decision.processVariable];
            return DecisionLibrary.evaluate(valueOfProcessVariable, _decision.i_value, _decision.operator);
        }
    }    
    
    
// -------------------------------
// GETTER
// -------------------------------


    /*
    * @param: ID of a Task
    * @returns: bool value if task is completed
    */
    function isTaskCompletedById(uint _id) public view returns (bool success){
          return (tasks[_id].completed);
    }

    /*
    * @param: Id of a State
    * @returns: status and description of the Task
    */
    function getTaskById(uint _id) public view returns (bool status,
        string memory description, address taskresource, GatewayType gateway,
        uint[] memory requirements, uint[] memory competitors){
        return (tasks[_id].completed, tasks[_id].activity, tasks[_id].taskresource,
         tasks[_id].preceedingMergingGateway, tasks[_id].requirements, tasks[_id].competitors);
    }

    function decisionTest() public pure returns(uint drei) {
        uint zwo = DecisionLibrary.returnZwo();
        return zwo+5;

    }

}

