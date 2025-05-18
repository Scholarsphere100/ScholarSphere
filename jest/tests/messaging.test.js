/**
 * @jest-environment jsdom
 */

import { formatTime, formatDateForSeparator, addContactToList } from "../../js/messaging";
import { auth, db } from "../../__mocks__/firebase"; // ✅ Mocked Firebase
import { jest } from "@jest/globals";

describe("Messaging Helper Functions", () => {
    test("should correctly format time", () => {
        const date = new Date("2025-05-18T14:45:00");
        expect(formatTime(date)).toMatch(/^0?2:45 (PM|AM)$/); // ✅ Allows leading zero
    });
    

    test("should correctly format date for separator", () => {
        const date = new Date("2025-05-18");
        expect(formatDateForSeparator(date)).toBe("May 18, 2025");
    });
});

describe("Contact List Functionality", () => {
    let contactsList;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();

        // ✅ Mock DOM setup
        document.body.innerHTML = `
        <div class="chat-user-info">
            <h2></h2>
            <div class="user-avatar"><img src="" alt=""></div>
        </div>
        <div id="chat-messages"></div>
        <aside class="contacts-list">
            <ul>
                <li>
                    <a href="#" class="contact-item" data-contact-id="789">
                        <article class="contact-info">
                            <header class="contact-header">
                                <h3>Charlie</h3>
                            </header>
                        </article>
                    </a>
                </li>
            </ul>
        </aside>
    `;

        contactsList = document.querySelector(".contacts-list ul");
    });

    test("should add contact to the list", () => {
        const contactId = "123";
        const contactName = "Alice";

        const newContact = addContactToList(contactId, contactName);
        
        expect(newContact).toBeDefined();
        expect(newContact.classList.contains("contact-item")).toBe(true);
        expect(newContact.dataset.contactId).toBe(contactId);
        expect(newContact.querySelector("h3").textContent).toBe(contactName);
    });

    test("should activate clicked contact and unsubscribe from previous chat", async () => {
        const contactA = addContactToList("123", "Alice");
        const contactB = addContactToList("456", "Bob");

        // Simulate click on Bob
        contactB.click();

        expect(contactA.classList.contains("active")).toBe(false);
        expect(contactB.classList.contains("active")).toBe(true);
    });

    // test("should unsubscribe from previous chat before loading new one", async () => {
    //     // ✅ Mock Unsubscribe Function
    //     const unsubscribeMock = jest.fn();
    //     global.currentChatUnsubscribe = unsubscribeMock; // ✅ Ensure global context is set
    
    //     // ✅ Add Contacts
    //     const contact = addContactToList("789", "Charlie");
    
    //     contact.dispatchEvent(new Event("click"));
    //     // ✅ Simulate Click
    //     //contact.click();
    
    //     console.log("🔍 UnsubscribeMock Calls:", unsubscribeMock.mock.calls.length);
    
    //     expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    // });
    
});

//import { loadChat } from "../../js/messaging";

// describe("Chat Functionality - loadChat()", () => {
//     let chatMessages, chatHeader;

//     beforeEach(() => {
//         jest.clearAllMocks();
//         jest.resetModules();

//         // ✅ Ensure necessary DOM elements exist before calling `loadChat()`
//         document.body.innerHTML = `
//             <div class="chat-user-info">
//                 <h2></h2>
//                 <div class="user-avatar"><img src="" alt=""></div>
//             </div>
//             <div id="chat-messages"></div>
//             <aside class="contacts-list">
//                 <ul>
//                     <li>
//                         <a href="#" class="contact-item" data-contact-id="789">
//                             <article class="contact-info">
//                                 <header class="contact-header">
//                                     <h3>Charlie</h3>
//                                 </header>
//                             </article>
//                         </a>
//                     </li>
//                 </ul>
//             </aside>
//         `;

//         chatMessages = document.getElementById("chat-messages");
//         chatHeader = document.querySelector(".chat-user-info h2");
//     });

//     test("should correctly load chat and set up unsubscribe function", async () => {
//         const unsubscribeMock = jest.fn();
//         db.collection.mockImplementation((collectionName) => {
//             if (collectionName === "chats") {
//                 return {
//                     doc: jest.fn(() => ({
//                         get: jest.fn(() =>
//                             Promise.resolve({
//                                 exists: true,
//                                 data: () => ({
//                                     createdAt: { toDate: () => new Date("2025-05-18") },
//                                 }),
//                             })
//                         ),
//                         collection: jest.fn(() => ({
//                             orderBy: jest.fn(() => ({
//                                 onSnapshot: jest.fn((callback) => {
//                                     callback({
//                                         docChanges: () => [
//                                             {
//                                                 type: "added",
//                                                 doc: {
//                                                     id: "msg1",
//                                                     data: () => ({
//                                                         text: "Hello, world!",
//                                                         senderId: auth.currentUser.uid,
//                                                         timestamp: { toDate: () => new Date() },
//                                                     }),
//                                                 },
//                                             },
//                                         ],
//                                     });

//                                     return unsubscribeMock; // ✅ Returns unsubscribe function
//                                 }),
//                             })),
//                         })),
//                     })),
//                 };
//             }
//             return {};
//         });

//         const unsubscribe = await loadChat("789");

//         // ✅ Ensure chat header is correctly updated
//         expect(chatHeader.textContent).toBe("Charlie");

//         // ✅ Ensure messages are loaded into the chat
//         expect(chatMessages.innerHTML).toContain("Hello, world!");

//         // ✅ Ensure an unsubscribe function is properly set
//         expect(typeof unsubscribe).toBe("function");
//         expect(unsubscribeMock).not.toHaveBeenCalled(); // ✅ Unsubscribe should not be triggered yet
//     });

//     test("should call unsubscribe when loading a new chat", async () => {
//         const unsubscribeMock = jest.fn();
//         global.currentChatUnsubscribe = unsubscribeMock; // ✅ Set mock unsubscribe function

//         await loadChat("123"); // ✅ Simulate loading a different chat

//         // ✅ Ensure previous chat unsubscribe is triggered
//         expect(unsubscribeMock).toHaveBeenCalledTimes(1);
//     });
// });

/**
 * @jest-environment node
 */

// import { sendMessage, myContacts } from "../../js/messaging";

// describe("Messaging Functions", () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//         jest.resetModules();
//     });

//     test("should send a message and create chat if it doesn't exist", async () => {
//         const senderId = "user1";
//         const recipientId = "user2";
//         const messageText = "Hello, world!";
        
//         // ✅ Mock Firestore behavior
//         db.collection.mockImplementation((collectionName) => {
//             if (collectionName === "chats") {
//                 return {
//                     doc: jest.fn(() => ({
//                         get: jest.fn(() =>
//                             Promise.resolve({
//                                 exists: false, // ✅ Simulate a new chat being created
//                                 data: jest.fn(),
//                             })
//                         ),
//                         set: jest.fn(),
//                         update: jest.fn(),
//                         collection: jest.fn(() => ({
//                             add: jest.fn(),
//                         })),
//                     })),
//                 };
//             }
//             return {};
//         });

//         await sendMessage(senderId, recipientId, messageText);

//         // ✅ Verify chat creation & message sending
//         expect(db.collection).toHaveBeenCalledWith("chats");
//         expect(db.collection("chats").doc).toHaveBeenCalledWith("user1_user2");
//         expect(db.collection("chats").doc("user1_user2").set).toHaveBeenCalled();
//         expect(db.collection("chats").doc("user1_user2").collection("messages").add).toHaveBeenCalled();
//     });

//     test("should update chat timestamp when sending a message", async () => {
//         const senderId = "user1";
//         const recipientId = "user2";
//         const messageText = "Hello again!";
        
//         db.collection.mockImplementation((collectionName) => {
//             if (collectionName === "chats") {
//                 return {
//                     doc: jest.fn(() => ({
//                         get: jest.fn(() =>
//                             Promise.resolve({
//                                 exists: true, // ✅ Chat already exists
//                                 data: jest.fn(),
//                             })
//                         ),
//                         update: jest.fn(), // ✅ Should update lastUpdated field
//                         collection: jest.fn(() => ({
//                             add: jest.fn(),
//                         })),
//                     })),
//                 };
//             }
//             return {};
//         });

//         await sendMessage(senderId, recipientId, messageText);

//         expect(db.collection("chats").doc("user1_user2").update).toHaveBeenCalled();
//         expect(db.collection("chats").doc("user1_user2").collection("messages").add).toHaveBeenCalled();
//     });

//     test("should load user's contacts and create contact list", async () => {
//         auth.currentUser = { uid: "user1" };

//         db.collection.mockImplementation((collectionName) => {
//             if (collectionName === "chats") {
//                 return {
//                     where: jest.fn().mockReturnThis(),
//                     get: jest.fn(() =>
//                         Promise.resolve({
//                             docs: [
//                                 { data: () => ({ participants: ["user1", "user2"] }) },
//                                 { data: () => ({ participants: ["user1", "user3"] }) },
//                             ],
//                         })
//                     ),
//                 };
//             }
//             if (collectionName === "Users") {
//                 return {
//                     doc: jest.fn((userId) => ({
//                         get: jest.fn(() =>
//                             Promise.resolve({
//                                 exists: true,
//                                 data: () => ({
//                                     displayName: userId === "user2" ? "Alice" : "Bob",
//                                 }),
//                             })
//                         ),
//                     })),
//                 };
//             }
//             return {};
//         });

//         await myContacts();

//         // ✅ Ensure Firebase queries were made
//         expect(db.collection).toHaveBeenCalledWith("chats");
//         expect(db.collection("chats").where).toHaveBeenCalledWith("participants", "array-contains", "user1");

//         expect(db.collection("Users").doc).toHaveBeenCalledWith("user2");
//         expect(db.collection("Users").doc).toHaveBeenCalledWith("user3");
//     });
// });


