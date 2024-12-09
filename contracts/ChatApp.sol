pragma solidity >=0.7.0 <0.9.0;

contract ChatApp {

    //USER STRUCT
    struct user {
        string name;
        friend[] friendList;
    }

    struct friend {
        address pubkey;
        string name;
    }

    struct message {
        address sender;
        uint256 timestamp;
        string msg;
    }

    struct AllUsers {
        string name;
        address accountAddress;
    }

    AllUsers[] getAllUsers;

    mapping(address => user) userList;
    mapping(bytes32 => message[]) allMessages;

    function userExists(address pubkey) public view returns (bool){
        return bytes(userList[pubkey].name).length > 0;
    }

    function createAccount(string calldata name) external {
        require(userExists(msg.sender) == false, "User already exists");
        require(bytes(name).length > 0, "Username cannot be empty");

        userList[msg.sender].name = name;

        getAllUsers.push(AllUsers(name, msg.sender));
    }

    function getUsername(address pubkey) external view returns (string memory){
        require(userExists(pubkey), "User is not registered");
        return userList[pubkey].name;
    }

    function addFriend(address friendKey, string calldata name) external {
        require(userExists(msg.sender), "Create an account first");
        require(userExists(friendKey), "User is not registered!");
        require(msg.sender != friendKey, "Users cannot add yourself as a friend");
        require(areFriends(msg.sender, friendKey) == false, "These users are already friends");

        _addFriend(msg.sender, friendKey, name);
        _addFriend(friendKey, msg.sender, userList[msg.sender].name);
    }

    function areFriends(address firstPubKey, address secPubKey) internal view returns (bool){

        if (userList[firstPubKey].friendList.length > userList[secPubKey].friendList.length) {
            address tmp = firstPubKey;
            firstPubKey = secPubKey;
            secPubKey = tmp;
        }

        for (uint256 i = 0; i < userList[firstPubKey].friendList.length; i++) {

            if (userList[firstPubKey].friendList[i].pubkey == secPubKey) return true;
        }
        return false;
    }

    function _addFriend(address myAddress, address friendKey, string memory name) internal {
        friend memory newFriend = friend(friendKey, name);
        userList[myAddress].friendList.push(newFriend);
    }

    function getMyFriendsList() external view returns (friend[] memory){
        return userList[msg.sender].friendList;
    }

    function _getChatCode(address pubkey1, address pubkey2) internal pure returns (bytes32){
        if (pubkey1 < pubkey2) {
            return keccak256(abi.encodePacked(pubkey1, pubkey2));
        } else
            return keccak256(abi.encodePacked(pubkey2, pubkey1));
    }

    function sendMessage(address friendKey, string calldata _msg) external {
        require(userExists(msg.sender), "Create an account first");
        require(userExists(friendKey), "User is not registered");
        require(areFriends(msg.sender, friendKey), "You are not friends with the given user");

        bytes32 chatCode = _getChatCode(msg.sender, friendKey);
        message memory newMsg = message(msg.sender, block.timestamp, _msg);
        allMessages[chatCode].push(newMsg);
    }

    function readMessage(address friendKey) external view returns (message[] memory){
        bytes32 chatCode = _getChatCode(msg.sender, friendKey);
        return allMessages[chatCode];
    }

    function getAllAppUsers() public view returns (AllUsers[] memory){
        return getAllUsers;
    }
}