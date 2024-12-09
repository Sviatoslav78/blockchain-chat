const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChatApp Contract", function () {
  let chatApp;
  let owner;
  let firstUser;
  let secondUser;
  let thirdUser;

  beforeEach(async function () {
    // Get signers (accounts for testing)
    [owner, firstUser, secondUser, thirdUser] = await ethers.getSigners();

    // Deploy the contract
    const ChatApp = await ethers.getContractFactory("ChatApp");
    chatApp = await ChatApp.deploy();
    await chatApp.deployed();
  });


  it("Should not allow creating an account if the user already exists", async function () {
    await chatApp.connect(firstUser).createAccount("User1");
    await expect(chatApp.connect(firstUser).createAccount("NewName")).to.be.revertedWith("User already exists");
  });

  it("Should return the correct friends list", async function () {
    // Add users and friends to the contract
    await chatApp.connect(owner).createAccount("Owner");
    await chatApp.connect(firstUser).createAccount("User1");
    await chatApp.connect(secondUser).createAccount("User2");
    await chatApp.connect(thirdUser).createAccount("User3");

    // Add friends to firstUser
    await chatApp.connect(firstUser).addFriend(secondUser.address, "User2");
    await chatApp.connect(firstUser).addFriend(thirdUser.address, "User3");

    // Retrieve friends list
    const friendsList = await chatApp.connect(firstUser).getMyFriendsList();

    // Assert that the returned friends list is correct
    expect(friendsList.length).to.equal(2);
    expect(friendsList[0].name).to.equal("User2");
    expect(friendsList[1].name).to.equal("User3");
  });

  it("Should return an empty list if the user has no friends", async function () {
    // Retrieve friends list for firstUser (no friends yet)
    const friendsList = await chatApp.connect(firstUser).getMyFriendsList();

    // Assert that the returned list is empty
    expect(friendsList.length).to.equal(0);
  });

  it("Should allow users to send messages to friends", async function () {
    // Create accounts and add friends
    await chatApp.connect(firstUser).createAccount("User1");
    await chatApp.connect(secondUser).createAccount("User2");
    await chatApp.connect(firstUser).addFriend(secondUser.address, "User2");

    // Send a message from firstUser to secondUser
    await chatApp.connect(firstUser).sendMessage(secondUser.address, "Hello, User2!");

    // Read messages from firstUser to secondUser
    const messages = await chatApp.connect(secondUser).readMessage(firstUser.address);

    // Assert that the message was sent
    expect(messages.length).to.equal(1);
    expect(messages[0].msg).to.equal("Hello, User2!");
  });

  it("Should not allow sending messages to users who are not friends", async function () {
    await chatApp.connect(firstUser).createAccount("User1");
    await chatApp.connect(secondUser).createAccount("User2");
    await expect(chatApp.connect(firstUser).sendMessage(secondUser.address, "Hello, User2!"))
        .to.be.revertedWith("You are not friends with the given user");
  });

  it("Should return an empty array if there are no messages between users", async function () {
    await chatApp.connect(firstUser).createAccount("User1");
    await chatApp.connect(secondUser).createAccount("User2");

    const messages = await chatApp.connect(firstUser).readMessage(secondUser.address);

    expect(messages.length).to.equal(0);
  });

  it("Should allow a user to create an account and retrieve their username", async function () {
    // Create an account for firstUser
    await chatApp.connect(firstUser).createAccount("User1");

    // Retrieve the username for firstUser
    const username = await chatApp.connect(firstUser).getUsername(firstUser.address);

    // Assert that the retrieved username is correct
    expect(username).to.equal("User1");
  });

  it("Should revert if trying to get the username of a non-registered user", async function () {
    // Trying to get the username of a non-registered user (secondUser)
    await expect(chatApp.connect(firstUser).getUsername(secondUser.address))
        .to.be.revertedWith("User is not registered");
  });

  it("Should return the correct username for multiple users", async function () {
    // Create accounts for firstUser and secondUser
    await chatApp.connect(firstUser).createAccount("User1");
    await chatApp.connect(secondUser).createAccount("User2");

    // Retrieve and verify the usernames
    const username1 = await chatApp.connect(firstUser).getUsername(firstUser.address);
    const username2 = await chatApp.connect(secondUser).getUsername(secondUser.address);

    expect(username1).to.equal("User1");
    expect(username2).to.equal("User2");
  });

});