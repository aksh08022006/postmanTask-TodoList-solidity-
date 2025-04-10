// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
    struct Task {
        string description;
        bool isCompleted;
        uint priority; // 0 = Low, 1 = Medium, 2 = High
    }

    mapping(address => Task[]) private userTasks;

    event TaskAdded(address user, string description, uint priority);
    event TaskCompleted(address user, uint index);
    event TaskDeleted(address user, uint index);
    event TaskEdited(address user, uint index, string newDescription);

    function addTask(string memory _description, uint _priority) public {
        require(_priority <= 2, "Invalid priority (0 = Low, 1 = Medium, 2 = High)");
        userTasks[msg.sender].push(Task(_description, false, _priority));
        emit TaskAdded(msg.sender, _description, _priority);
    }

    function markTaskCompleted(uint _index) public {
        require(_index < userTasks[msg.sender].length, "Invalid index");
        userTasks[msg.sender][_index].isCompleted = true;
        emit TaskCompleted(msg.sender, _index);
    }

    function deleteTask(uint _index) public {
        require(_index < userTasks[msg.sender].length, "Invalid index");
        userTasks[msg.sender][_index] = userTasks[msg.sender][userTasks[msg.sender].length - 1];
        userTasks[msg.sender].pop();
        emit TaskDeleted(msg.sender, _index);
    }

    function editTask(uint _index, string memory _newDescription) public {
        require(_index < userTasks[msg.sender].length, "Invalid index");
        userTasks[msg.sender][_index].description = _newDescription;
        emit TaskEdited(msg.sender, _index, _newDescription);
    }

    function getTasks() public view returns (Task[] memory) {
        return userTasks[msg.sender];
    }
}