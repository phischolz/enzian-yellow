pragma solidity 0.8.0;

import "./TaskEntities.sol";

library ProcessEntities {
    struct State {
        mapping(uint => TaskEntities.Task) tasks;
        mapping(string => int) integer_processVariables;
        mapping(string => string) string_processVariables;
        mapping(uint => bool) enabled;
    }
}