import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

//INTERNAL IMPORT
import {
  checkIfWalletConnected,
  connectWallet,
  connectWithContract,
} from "../Utils/apiFeature";

export const ChatAppContext = React.createContext();

export const ChatAppProvider = ({ children }) => {
  //USESTATE
  const [account, setAccount] = useState("");
  const [userName, setUserName] = useState("");
  const [friendLists, setFriendLists] = useState([]);
  const [friendMsg, setFriendMsg] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLists, setUserLists] = useState([]);
  const [error, setError] = useState("");

  //CHAT USER DATA
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserAddress, setCurrentUserAddress] = useState("");

  const router = useRouter();

  //FETCH DATA
  const fetchData = async () => {
    try {
      const address = await checkIfWalletConnected();
      if (address) {
        //GET CONTRACT
        const contract = await connectWithContract();
        //GET ACCOUNT
        const connectAccount = await connectWallet();
        setAccount(connectAccount);
        //GET USER NAME
        const userName = await contract.getUsername(connectAccount);
        setUserName(userName);
        //GET MY FRIEND LIST
        const friendLists = await contract.getMyFriendsList();
        setFriendLists(friendLists);

        //GET ALL APP USER LIST
        const userList = await contract.getAllAppUsers();
        const newArray = userList.filter(
          (user) => user.accountAddress.toLowerCase() !== address
        );

        const filterArray = filterUsersExcludingFriends(newArray, friendLists);
        console.log(filterArray);
        setUserLists(filterArray);
      }
    } catch (error) {
      // setError("Please Install And Connect Your Wallet");
      console.log(error);
    }
  };

  function filterUsersExcludingFriends(newArray, friendLists) {
    const friendAddresses = new Set(friendLists.map((friend) => friend.pubkey));

    return newArray.filter((user) => !friendAddresses.has(user.accountAddress));
  }
  useEffect(() => {
    fetchData();
  }, []);

  //READ MESSAGE
  const readMessage = async (friendAddress) => {
    try {
      const address = await checkIfWalletConnected();
      if (address) {
        const contract = await connectWithContract();
        const read = await contract.readMessage(friendAddress);
        setFriendMsg(read);
      }
    } catch (error) {
      console.log("Currently You Have no Message");
    }
  };

  //CREATE ACCOUNT
  const createAccount = async ({ name }) => {
    console.log(name, account);
    try {
      if (!name || !account)
        return setError("Name And Account Address cannot be empty");

      const contract = await connectWithContract();
      console.log(contract);
      const getCreatedUser = await contract.createAccount(name);

      setLoading(true);
      await getCreatedUser.wait();
      setLoading(false);
      window.location.reload();
    } catch (error) {
      setError("Error while creating your account Pleas reload browser");
    }
  };

  //ADD THE FRIEND
  const addFriends = async ({ name, userAddress }) => {
    console.log(name, userAddress);
    try {
      if (!name || !userAddress) return setError("Please provide data");
      const contract = await connectWithContract();
      const addMyFriend = await contract.addFriend(userAddress, name);
      setLoading(true);
      await addMyFriend.wait();
      setLoading(false);
      router.push("/");
      window.location.reload();
    } catch (error) {
      setError("Something went wrong while adding friends, try again");
    }
  };

  //SEND MESSAGE TO YOUR FRIEND
  const sendMessage = async ({ msg, address }) => {
    try {
      if (!msg || !address) return setError("Please Type your Message");

      const contract = await connectWithContract();
      const addMessage = await contract.sendMessage(address, msg);
      setLoading(true);
      await addMessage.wait();
      setLoading(false);
      window.location.reload();
    } catch (error) {
      setError("Please reload and try again");
    }
  };

  //READ INFO
  const readUser = async (userAddress) => {
    const contract = await connectWithContract();
    const userName = await contract.getUsername(userAddress);
    setCurrentUserName(userName);
    setCurrentUserAddress(userAddress);
  };
  return (
    <ChatAppContext.Provider
      value={{
        readMessage,
        createAccount,
        addFriends,
        sendMessage,
        readUser,
        connectWallet,
        checkIfWalletConnected,
        account,
        userName,
        friendLists,
        friendMsg,
        userLists,
        loading,
        error,
        currentUserName,
        currentUserAddress,
      }}
    >
      {children}
    </ChatAppContext.Provider>
  );
};
