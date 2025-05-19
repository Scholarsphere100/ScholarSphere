import { auth, db } from "./search.js"
// DOM Elements
const messageForm = document.getElementById("message-form")
const messageInput = document.getElementById("message-input")
const chatMessages = document.getElementById("chat-messages")
let currentChatUnsubscribe = null

// Helper function to format time
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// Helper function to format date for the date separator
function formatDateForSeparator(date) {
  const options = { month: "long", day: "numeric", year: "numeric" }
  return date.toLocaleDateString("en-US", options)
}

async function checkAndCreateChatsFromCollaborations() {
  try {
    // Get all collaboration requests with status "accepted"
    const collaborationsSnapshot = await db.collection("collaborationRequests").where("status", "==", "accepted").get()

    if (collaborationsSnapshot.empty) {
      console.log("No accepted collaborations found")
      return
    }

    // Process each accepted collaboration
    const promises = collaborationsSnapshot.docs.map(async (doc) => {
      const collabData = doc.data()
      const senderId = collabData.senderId
      const recipientId = collabData.recipientId

      // Create chat ID (sorted to ensure consistency)
      const chatId = [senderId, recipientId].sort().join("_")

      // Check if chat already exists
      const chatRef = db.collection("chats").doc(chatId)
      const chatDoc = await chatRef.get()

      if (!chatDoc.exists) {
        // Chat doesn't exist, create it
        await chatRef.set({
          participants: [senderId, recipientId],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
          // You might want to add the project reference if relevant
        })

        console.log(`Created new chat between ${senderId} and ${recipientId}`)

        return { created: true, chatId }
      } else {
        console.log(`Chat already exists between ${senderId} and ${recipientId}`)
        return { created: false, chatId }
      }
    })

    const results = await Promise.all(promises)
    console.log("Chat creation process completed:", results)
    return results
  } catch (error) {
    console.error("Error checking/creating chats from collaborations:", error)
    throw error
  }
}
checkAndCreateChatsFromCollaborations()
// Add contact to sidebar list
function addContactToList(contactId, contactName) {
  const contactsList = document.querySelector(".contacts-list ul")

  const contactHTML = `
        <li>
            <a href="#" class="contact-item" data-contact-id="${contactId}">
                <article class="contact-info">
                    <header class="contact-header">
                        <h3>${contactName}</h3>
                    </header>
                    <footer class="contact-footer">
                    </footer>
                </article>
            </a>
        </li>
    `

  contactsList.insertAdjacentHTML("beforeend", contactHTML)

  // Get the newly added contact element
  const newContact = contactsList.querySelector(`.contact-item[data-contact-id="${contactId}"]`)

  // Add click handler
  newContact.addEventListener("click", async (e) => {
    e.preventDefault()

    // Remove active class from all contacts
    document.querySelectorAll(".contact-item").forEach((item) => {
      item.classList.remove("active")
    })

    // Add active class to clicked contact
    newContact.classList.add("active")

    // Unsubscribe from previous chat listener
    if (currentChatUnsubscribe) {
      currentChatUnsubscribe()
    }

    // Load the chat
    currentChatUnsubscribe = await loadChat(contactId)
  })

  return newContact
}

async function loadChat(contactId) {
  try {
    const currentUserId = auth.currentUser.uid
    const chatId = [currentUserId, contactId].sort().join("_")
    const chatRef = db.collection("chats").doc(chatId)

    // Update chat header
    const contactName = document.querySelector(`.contact-item[data-contact-id="${contactId}"] h3`).textContent
    document.querySelector(".chat-user-info h2").textContent = contactName
    document.querySelector(".chat-user-info .user-avatar img").alt = contactName

    // Clear current messages
    chatMessages.innerHTML = ''

    // Track if we've done initial load
    let initialLoad = true

    // Load and listen for messages
    const messagesQuery = chatRef.collection("messages").orderBy("timestamp", "asc")

    // Set up real-time listener
    const unsubscribe = messagesQuery.onSnapshot(async (snapshot) => {
      // Only clear completely on initial load
      if (initialLoad) {
        // Clear messages
        chatMessages.innerHTML = ''
        initialLoad = false
      }

      // Check if there are any messages
      if (snapshot.empty) {
        // Don't show date separator if there are no messages
        chatMessages.innerHTML = `
          <div class="empty-chat-message">
            <p>No messages yet. Start a conversation!</p>
          </div>
        `
        return
      }

      // If we have messages, we need to group them by date
      if (snapshot.docs.length > 0) {
        // Get all messages and organize by date
        const messagesByDate = new Map()
        
        snapshot.docs.forEach(doc => {
          const message = doc.data()
          const messageId = doc.id
          
          // Get message timestamp
          let messageDate = new Date()
          if (message.timestamp && message.timestamp.toDate) {
            messageDate = message.timestamp.toDate()
          } else if (message.timestamp) {
            messageDate = new Date(message.timestamp)
          }
          
          // Create date key (YYYY-MM-DD)
          const dateKey = messageDate.toISOString().split('T')[0]
          
          // Add message to the appropriate date group
          if (!messagesByDate.has(dateKey)) {
            messagesByDate.set(dateKey, [])
          }
          
          messagesByDate.get(dateKey).push({
            id: messageId,
            ...message,
            date: messageDate
          })
        })
        
        // Clear the messages container if this is the first load
        if (initialLoad) {
          chatMessages.innerHTML = ''
        }
        
        // Sort dates chronologically
        const sortedDates = Array.from(messagesByDate.keys()).sort()
        
        // Check if we need to rebuild the entire message list
        const needsRebuild = chatMessages.querySelectorAll('.date-separator').length !== sortedDates.length
        
        if (needsRebuild) {
          // Clear the container and rebuild
          chatMessages.innerHTML = ''
          
          // Process each date group
          sortedDates.forEach(dateKey => {
            const messages = messagesByDate.get(dateKey)
            
            // Add date separator for this group
            const separatorDate = messages[0].date
            const formattedSeparatorDate = formatDateForSeparator(separatorDate)
            
            const separatorElement = document.createElement("article")
            separatorElement.className = "message-group date-separator"
            separatorElement.innerHTML = `
              <time datetime="${dateKey}">${formattedSeparatorDate}</time>
            `
            chatMessages.appendChild(separatorElement)
            
            // Add all messages for this date
            messages.forEach(message => {
              addMessageToUI(message, contactName, currentUserId)
            })
          })
        } else {
          // Just add new messages
          snapshot.docChanges().forEach(change => {
            if (change.type === "added") {
              const message = change.doc.data()
              const messageId = change.doc.id
              
              // Check if message already exists in DOM
              const existingMessage = document.querySelector(`[data-message-id="${messageId}"]`)
              if (existingMessage) return
              
              // Get message timestamp
              let messageDate = new Date()
              if (message.timestamp && message.timestamp.toDate) {
                messageDate = message.timestamp.toDate()
              } else if (message.timestamp) {
                messageDate = new Date(message.timestamp)
              }
              
              // Create date key (YYYY-MM-DD)
              const dateKey = messageDate.toISOString().split('T')[0]
              
              // Check if we need to add a new date separator
              const existingSeparators = Array.from(chatMessages.querySelectorAll('.date-separator time'))
              const separatorExists = existingSeparators.some(time => 
                time.getAttribute('datetime') === dateKey
              )
              
              if (!separatorExists) {
                // Add a new date separator
                const formattedSeparatorDate = formatDateForSeparator(messageDate)
                
                const separatorElement = document.createElement("article")
                separatorElement.className = "message-group date-separator"
                separatorElement.innerHTML = `
                  <time datetime="${dateKey}">${formattedSeparatorDate}</time>
                `
                
                // Find where to insert the separator (in chronological order)
                let inserted = false
                const existingSeps = chatMessages.querySelectorAll('.date-separator')
                for (let i = 0; i < existingSeps.length; i++) {
                  const sepTime = existingSeps[i].querySelector('time')
                  const sepDate = sepTime.getAttribute('datetime')
                  
                  if (dateKey < sepDate) {
                    chatMessages.insertBefore(separatorElement, existingSeps[i])
                    inserted = true
                    break
                  }
                }
                
                if (!inserted) {
                  chatMessages.appendChild(separatorElement)
                }
              }
              
              // Add the message to UI
              addMessageToUI({
                id: messageId,
                ...message,
                date: messageDate
              }, contactName, currentUserId)
            }
          })
        }
      }

      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight
    })

    return unsubscribe
  } catch (error) {
    console.error("Error loading chat:", error)
    return null
  }
}

// Helper function to add a message to the UI
function addMessageToUI(message, contactName, currentUserId) {
  const isCurrentUser = message.senderId === currentUserId
  
  // Create message element
  const messageElement = document.createElement("article")
  messageElement.className = `message-group ${isCurrentUser ? "sent" : "received"}`
  messageElement.setAttribute("data-message-id", message.id)
  
  const content = document.createElement("section")
  content.className = "message-content"
  
  const header = document.createElement("header")
  header.className = "message-header"
  
  if (!isCurrentUser) {
    const avatar = document.createElement("figure")
    avatar.className = "message-avatar"
    avatar.innerHTML = `<img src="https://via.placeholder.com/40" alt="${contactName}">`
    messageElement.appendChild(avatar)
    
    const name = document.createElement("h3")
    name.textContent = contactName
    header.appendChild(name)
  }
  
  const time = document.createElement("time")
  time.setAttribute("datetime", message.date.toISOString())
  time.textContent = formatTime(message.date)
  header.appendChild(time)
  
  content.appendChild(header)
  
  const text = document.createElement("p")
  text.className = "message-text"
  text.textContent = message.text
  content.appendChild(text)
  
  messageElement.appendChild(content)
  
  // Find the right date separator to insert after
  const dateKey = message.date.toISOString().split('T')[0]
  const separators = chatMessages.querySelectorAll('.date-separator')
  let inserted = false
  
  for (let i = 0; i < separators.length; i++) {
    const sepTime = separators[i].querySelector('time')
    const sepDate = sepTime.getAttribute('datetime')
    
    if (sepDate === dateKey) {
      // Find the next separator or end of list
      const nextSep = separators[i+1] || null
      
      // Insert before the next separator or at the end
      if (nextSep) {
        chatMessages.insertBefore(messageElement, nextSep)
      } else {
        chatMessages.appendChild(messageElement)
      }
      
      inserted = true
      break
    }
  }
  
  if (!inserted) {
    chatMessages.appendChild(messageElement)
  }
}

// Send message function
async function sendMessage(senderId, recipientId, messageText) {
  try {
    const chatId = [senderId, recipientId].sort().join("_")
    const chatRef = db.collection("chats").doc(chatId)

    // Check if chat exists
    const chatDoc = await chatRef.get()

    // If chat doesn't exist, create it with current timestamp
    if (!chatDoc.exists) {
      await chatRef.set({
        participants: [senderId, recipientId],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      })
    } else {
      // Just update the lastUpdated field
      await chatRef.update({
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }

    // Add message to subcollection
    await chatRef.collection("messages").add({
      senderId: senderId,
      text: messageText,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      read: false,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

// Load user's contacts
async function myContacts() {
  try {
    const currentUserId = auth.currentUser.uid
    const contactsList = document.querySelector(".contacts-list ul")
    contactsList.innerHTML = ""

    // Use a Set to track added contacts
    const addedContacts = new Set()

    const querySnapshot = await db.collection("chats").where("participants", "array-contains", currentUserId).get()

    const promises = querySnapshot.docs.map(async (doc) => {
      const chatData = doc.data()
      const otherParticipantId = chatData.participants.find((id) => id !== currentUserId)

      if (otherParticipantId && !addedContacts.has(otherParticipantId)) {
        addedContacts.add(otherParticipantId)

        const userDoc = await db.collection("Users").doc(otherParticipantId).get()
        if (userDoc.exists) {
          const userData = userDoc.data()
          const userName = userData.displayName || userData.name || otherParticipantId
          addContactToList(otherParticipantId, userName)
        }
      }
    })

    await Promise.all(promises)

    // Load first contact by default if available
    const firstContact = contactsList.querySelector(".contact-item")
    if (firstContact) {
      firstContact.classList.add("active")
      currentChatUnsubscribe = await loadChat(firstContact.getAttribute("data-contact-id"))
    }
  } catch (error) {
    console.error("Error loading contacts:", error)
  }
}

// Initialize chat functionality
function initializeChat() {
  // Auto-resize textarea
  if (messageInput) {
    messageInput.addEventListener("input", function () {
      this.style.height = "auto"
      this.style.height = this.scrollHeight + "px"

      if (this.scrollHeight > 150) {
        this.style.height = "150px"
        this.style.overflowY = "auto"
      } else {
        this.style.overflowY = "hidden"
      }
    })
  }

  // Handle message form submission
  if (messageForm) {
    messageForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      const messageText = messageInput.value.trim()

      if (messageText && auth.currentUser) {
        const activeContact = document.querySelector(".contact-item.active")
        if (activeContact) {
          const recipientId = activeContact.getAttribute("data-contact-id")
          try {
            await sendMessage(auth.currentUser.uid, recipientId, messageText)
            messageInput.value = ""
            messageInput.style.height = "auto"
          } catch (error) {
            console.error("Failed to send message:", error)
          }
        }
      }
    })
  }

  // Initialize when user is authenticated
  auth.onAuthStateChanged((user) => {
    if (user) {
      myContacts()
    } else {
      // Clean up when user signs out
      if (currentChatUnsubscribe) {
        currentChatUnsubscribe()
        currentChatUnsubscribe = null
      }
    }
  })
}

// Start the chat system
document.addEventListener("DOMContentLoaded", initializeChat)