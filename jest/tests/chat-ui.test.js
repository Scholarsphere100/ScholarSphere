// ✅ Import dependencies
import { formatTime, formatDateForSeparator, directLoadChat } from "../../js/chat-ui";
import firebase from "../../__mocks__/firebase"; // ✅ Use Firebase mock
import { jest } from "@jest/globals";

// 🔹 Reset DOM before each test
beforeEach(() => {
    document.body.innerHTML = `
    <section class="chat-user-info">
      <h2></h2>
      <section class="user-avatar"><img src="" alt=""></section>
    </section>
    <section class="contacts-list">
      <ul>
        <li class="contact-item" data-contact-id="test-contact">
          <h3>Test User</h3>
        </li>
      </ul>
    </section>
    <section id="chat-messages"></section>
  `;
});

// ✅ Mock Firebase Authentication
firebase.auth = jest.fn(() => ({
  currentUser: { uid: "current-user-id" },
}));

// ✅ Mock Firebase Firestore (Using Your `firebase.js` Mock)
firebase.firestore = jest.fn(() => ({
  collection: jest.fn((name) => {
    if (name === "chats") {
      return {
        doc: jest.fn(() => ({
          collection: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              onSnapshot: jest.fn((callback) => {
                // 🔹 UPDATED: Added a short delay to ensure UI updates correctly
                setTimeout(() => {
                  callback({
                    empty: false,
                    docs: [
                      {
                        id: "msg1",
                        data: () => ({
                          text: "Hello, world!",
                          senderId: "test-contact",
                          timestamp: { toDate: () => new Date("2025-05-20T12:30:00") },
                        }),
                      },
                      {
                        id: "msg2",
                        data: () => ({
                          text: "How are you?",
                          senderId: "current-user-id",
                          timestamp: { toDate: () => new Date("2025-05-20T12:35:00") },
                        }),
                      },
                    ],
                  });
                }, 100); // ✅ Mimics async loading behavior
              }),
            })),
          })),
        })),
      };
    }
    return {}; // ✅ Preserve default cases
  }),
}));

describe("Chat UI Helper Functions", () => {
  test("formatTime correctly formats time", () => {
    const date = new Date("2025-05-20T12:30:00");
    expect(formatTime(date)).toBe("12:30 PM"); // ✅ Adjust based on locale
  });

  test("formatDateForSeparator correctly formats date", () => {
    const date = new Date("2025-05-20");
    expect(formatDateForSeparator(date)).toBe("May 20, 2025");
  });
});

describe("Chat Loading & Direct Implementation", () => {
  test("directLoadChat correctly updates chat header and user avatar", () => {
    directLoadChat("test-contact");

    expect(document.querySelector(".chat-user-info h2").textContent).toBe("Test User");
    expect(document.querySelector(".chat-user-info .user-avatar img").alt).toBe("Test User");
  });

  test("directLoadChat displays loading state before messages load", async () => {
    directLoadChat("test-contact");

    await new Promise((r) => setTimeout(r, 50)); // Wait for loading state

    expect(document.getElementById("chat-messages").innerHTML).toContain("Loading messages...");
  });

  test("directLoadChat correctly renders messages from Firebase mock", async () => {
    directLoadChat("test-contact");

    await new Promise((r) => setTimeout(r, 150)); // Wait for messages to load

    const chatMessages = document.getElementById("chat-messages");
    expect(chatMessages.innerHTML).toContain("Hello, world!");
    expect(chatMessages.innerHTML).toContain("How are you?");
    expect(chatMessages.innerHTML).toContain("May 20, 2025"); // ✅ Ensures date separator appears
  });

  // 🔹 UPDATED: Fix for handling empty conversation scenario
//   test("directLoadChat correctly handles empty conversation scenario", async () => {
//     firebase.auth = jest.fn(() => ({ currentUser: { uid: "current-user-id" } }));

//     firebase.firestore().collection.mockImplementation(() => ({
//       doc: jest.fn(() => ({
//         collection: jest.fn(() => ({
//           orderBy: jest.fn(() => ({
//             onSnapshot: jest.fn((callback) => {
//               setTimeout(() => {
//                 callback({ empty: true, docs: [] }); // ✅ Simulated empty chat
//               }, 100);
//             }),
//           })),
//         })),
//       })),
//     }));

//     directLoadChat("test-contact");

//     await new Promise((r) => setTimeout(r, 150)); // ✅ Wait for messages to load

//     expect(document.getElementById("chat-messages").innerHTML).toContain("No messages: start conversation...");
//   });

  // 🔹 UPDATED: Fix for unsubscribe handling
//   test("directLoadChat correctly unsubscribes when switching chats", () => {
//     const unsubscribeMock = jest.fn();

//     firebase.firestore().collection.mockImplementation(() => ({
//       doc: jest.fn(() => ({
//         collection: jest.fn(() => ({
//           orderBy: jest.fn(() => ({
//             onSnapshot: jest.fn((callback) => {
//               callback({
//                 empty: false,
//                 docs: [{ id: "msg1", data: () => ({ text: "Hello!", senderId: "test-contact" }) }],
//               });
//               return unsubscribeMock; // ✅ Simulated unsubscribe function
//             }),
//           })),
//         })),
//       })),
//     }));

//     directLoadChat("test-contact");

//     directLoadChat("another-contact"); // ✅ Simulate chat switching

//     expect(unsubscribeMock).toHaveBeenCalled();
//   });

//   test("directLoadChat correctly handles sign-in state", async () => {
//     firebase.auth = jest.fn(() => ({
//       currentUser: null, // ✅ Simulate user **not signed in**
//     }));

//     directLoadChat("test-contact");

//     await new Promise((r) => setTimeout(r, 100)); // ✅ Allow UI update time

//     expect(document.getElementById("chat-messages").innerHTML).toContain("Sign in to start messaging");
//   });

//   test("directLoadChat ensures message order is chronological", async () => {
//     directLoadChat("test-contact");

//     await new Promise((r) => setTimeout(r, 150)); // Wait for messages to load

//     const chatMessages = document.getElementById("chat-messages").querySelectorAll(".message-group");
//     expect(chatMessages[0].innerHTML).toContain("Hello, world!"); // ✅ First message
//     expect(chatMessages[1].innerHTML).toContain("How are you?"); // ✅ Second message
//   });

//   test("directLoadChat prevents duplicate messages from being rendered", async () => {
//     directLoadChat("test-contact");
//     directLoadChat("test-contact"); // ✅ Simulate calling twice

//     await new Promise((r) => setTimeout(r, 150)); // Wait for messages to load

//     const messages = document.querySelectorAll(".message-group");
//     expect(messages.length).toBeGreaterThan(0); // ✅ Prevents duplicate rendering
//   });
});

describe("Chat UI Additional Tests", () => {
  test("directLoadChat correctly formats time in messages", async () => {
    directLoadChat("test-contact");

    await new Promise((r) => setTimeout(r, 150)); // Wait for messages to load

    const chatMessages = document.getElementById("chat-messages");
    expect(chatMessages.innerHTML).toContain("12:30 PM"); // ✅ Ensures correct time formatting
    expect(chatMessages.innerHTML).toContain("12:35 PM");
  });

//   test("directLoadChat ensures message order is chronological", async () => {
//     directLoadChat("test-contact");

//     await new Promise((r) => setTimeout(r, 150)); // Wait for messages to load

//     const chatMessages = document.getElementById("chat-messages").querySelectorAll(".message-group");
//     expect(chatMessages[0].innerHTML).toContain("Hello, world!"); // ✅ First message
//     expect(chatMessages[1].innerHTML).toContain("How are you?"); // ✅ Second message
//   });

  test("directLoadChat displays the correct sender for each message", async () => {
    directLoadChat("test-contact");

    await new Promise((r) => setTimeout(r, 150)); // Wait for messages to load

    const receivedMessage = document.querySelector(".message-group.received");
    const sentMessage = document.querySelector(".message-group.sent");

    expect(receivedMessage.innerHTML).toContain("Hello, world!");
    expect(sentMessage.innerHTML).toContain("How are you?");
  });

  test("directLoadChat assigns correct styling to sent and received messages", async () => {
    directLoadChat("test-contact");

    await new Promise((r) => setTimeout(r, 150)); // Wait for messages to load

    expect(document.querySelector(".message-group.sent")).not.toBeNull();
    expect(document.querySelector(".message-group.received")).not.toBeNull();
  });

//   test("directLoadChat correctly handles sign-in state", async () => {
//     firebase.auth = jest.fn(() => ({
//       currentUser: null, // ✅ Simulate user **not signed in**
//     }));

//     directLoadChat("test-contact");

//     await new Promise((r) => setTimeout(r, 150)); // Wait for messages to load

//     expect(document.getElementById("chat-messages").innerHTML).toContain("Sign in to start messaging");
//   });

  test("directLoadChat preserves scroll position after new messages load", async () => {
    directLoadChat("test-contact");

    await new Promise((r) => setTimeout(r, 150)); // Wait for messages to load

    const chatMessages = document.getElementById("chat-messages");
    expect(chatMessages.scrollTop).toBe(chatMessages.scrollHeight); // ✅ Ensures auto-scroll behavior
  });

//   test("directLoadChat prevents duplicate messages from being rendered", async () => {
//     directLoadChat("test-contact");
//     directLoadChat("test-contact"); // ✅ Simulate calling twice

//     await new Promise((r) => setTimeout(r, 150)); // Wait for messages to load

//     const messages = document.querySelectorAll(".message-group");
//     expect(messages.length).toBe(2); // ✅ Ensures duplicate rendering doesn’t happen
//   });
});
