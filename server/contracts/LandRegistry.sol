// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LandRegistry {
    address public owner;
    uint256 public totalLands;
    uint256 public totalUsers;

    struct Land {
        uint256 id;
        string location;
        uint256 size;
        address owner;
        bool isVerified;
    }

    struct User {
        string name;
        string role;
        bool isRegistered;
    }

    mapping(uint256 => bool) public buildingPermits;
    mapping(uint256 => Land) public lands;
    mapping(address => User) public users;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    event LandTransferred(uint256 indexed landId, address indexed from, address indexed to);

    constructor() {
        owner = msg.sender;
    }

    function registerUser(string memory _name, string memory _role) public {
        require(!users[msg.sender].isRegistered, "User already registered");
        users[msg.sender] = User(_name, _role, true);
        totalUsers++;
    }

    function registerLand(string memory _location, uint256 _size) public {
        require(users[msg.sender].isRegistered, "User not registered");
        totalLands++;
        lands[totalLands] = Land(totalLands, _location, _size, msg.sender, false);
    }

    function verifyLand(uint256 _landId) public onlyOwner {
        require(lands[_landId].id != 0, "Land does not exist");
        lands[_landId].isVerified = true;
    }

    function transferLand(address _to, uint256 _landId) public {
        require(lands[_landId].owner == msg.sender, "You are not the owner of this land.");
        require(users[_to].isRegistered, "The recipient is not a registered user.");
        lands[_landId].owner = _to;
        emit LandTransferred(_landId, msg.sender, _to);
    }

    function grantBuildingPermission(uint256 _landId) public onlyOwner {
        require(lands[_landId].id != 0, "Land does not exist");
        buildingPermits[_landId] = true;
    }

    function getTotalLands() public view returns (uint256) {
        return totalLands;
    }

    function getTotalUsers() public view returns (uint256) {
        return totalUsers;
    }

    function getVerifiedLandsCount() public view returns (uint256) {
        uint256 count = 0;
        for (uint i = 1; i <= totalLands; i++) {
            if (lands[i].isVerified) {
                count++;
            }
        }
        return count;
    }
}