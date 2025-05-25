import { auth, db } from "./search.js"
// DOM Elements
const messageForm = document.getElementById("message-form")
const messageInput = document.getElementById("message-input")
const chatMessages = document.getElementById("chat-messages")
let currentChatUnsubscribe = null

// Cache for user profile data to avoid repeated Firebase calls
const userProfileCache = new Map()

// Helper function to format time
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// Helper function to format date for the date separator
function formatDateForSeparator(date) {
  const options = { month: "long", day: "numeric", year: "numeric" }
  return date.toLocaleDateString("en-US", options)
}

/**
 * @param {string} userId - The user ID to fetch data for
 * @returns {Promise<Object>} User data object with combined Firebase Users + Auth data
 */
async function getUserProfileData(userId) {
  try {
    // Check cache first
    if (userProfileCache.has(userId)) {
      return userProfileCache.get(userId)
    }

    console.log('Fetching profile data for user:', userId)
    
    // Get user data from Firebase Users collection (same as comments.js)
    const userDoc = await db.collection('Users').doc(userId).get()
    const userData = userDoc.exists ? userDoc.data() : {}
    
    // Get Firebase Auth user data if this is the current user
    let authUserData = {}
    if (auth.currentUser && auth.currentUser.uid === userId) {
      authUserData = {
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
        email: auth.currentUser.email
      }
    }
    
    // Combine data (same priority as comments.js)
    const combinedData = {
      ...userData,
      // Use the same fallback pattern as comments.js
      displayName: userData.name || userData.displayName || authUserData.displayName || 'Anonymous',
      photoURL: userData.photoURL || authUserData.photoURL || null,
      userRole: userData.isResearcher ? 'Researcher' : 
                userData.isReviewer ? 'Reviewer' : 'Collaborator'
    }
    
    console.log('Combined user data:', combinedData)
    
    // Cache the result
    userProfileCache.set(userId, combinedData)
    return combinedData
  } catch (error) {
    console.error('Error fetching user profile for', userId, ':', error)
    return {
      displayName: 'Anonymous',
      photoURL: null,
      userRole: 'Collaborator'
    }
  }
}

/**
 * Get profile picture URL with fallback to default avatar
 * @param {Object} userData - User data from getUserProfileData
 * @param {string} userName - User's display name for generating initials
 * @returns {string} Profile picture URL
 */
function getProfilePictureUrl(userData, userName) {
  // Use photoURL from combined data (same as comments.js approach)
  if (userData.photoURL && userData.photoURL.trim() !== '') {
    return userData.photoURL
  }

  // Generate a default avatar with user initials
  const initials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
  const colorIndex = userName ? userName.charCodeAt(0) % colors.length : 0
  const backgroundColor = colors[colorIndex]
  
  // Create a data URL for the avatar
  const canvas = document.createElement('canvas')
  canvas.width = 40
  canvas.height = 40
  const ctx = canvas.getContext('2d')
  
  // Draw background circle
  ctx.fillStyle = backgroundColor
  ctx.beginPath()
  ctx.arc(20, 20, 20, 0, 2 * Math.PI)
  ctx.fill()
  
  // Draw initials
  ctx.fillStyle = 'white'
  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initials, 20, 20)
  
  return canvas.toDataURL()
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
async function addContactToList(contactId, userData = null) {
  const contactsList = document.querySelector(".contacts-list ul")

  // Get user data if not provided (using same approach as comments.js)
  if (!userData) {
    userData = await getUserProfileData(contactId)
  }

  const contactName = userData.displayName
  const profilePicUrl = getProfilePictureUrl(userData, contactName)

  const contactHTML = `
        <li>
            <a href="#" class="contact-item" data-contact-id="${contactId}">
                <figure class="contact-avatar">
                    <img src="${profilePicUrl}" alt="${contactName}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2Mzc0OEEiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC4xMzQwMSAxNCA1IDE3LjEzNDAxIDUgMjFIMTlDMTkgMTcuMTM0MDEgMTUuODY2IDE0IDEyIDE0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo='">
                </figure>
                <article class="contact-info">
                    <header class="contact-header">
                        <h3>${contactName}</h3>
                        <p class="contact-role">${userData.userRole}</p>
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

    // Get contact user data for header (same approach as comments.js)
    const contactUserData = await getUserProfileData(contactId)
    const contactName = contactUserData.displayName
    const contactPhotoURL = getProfilePictureUrl(contactUserData, contactName)

    // Update chat header
    document.querySelector(".chat-user-info h2").textContent = contactName
    const headerAvatar = document.querySelector(".chat-user-info .user-avatar img")
    if (headerAvatar) {
      headerAvatar.src = contactPhotoURL
      headerAvatar.alt = contactName
    }

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
        chatMessages.innerHTML = ''
        initialLoad = false
      }

      // Check if there are any messages
      if (snapshot.empty) {
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
              addMessageToUI(message, contactUserData, currentUserId)
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
              }, contactUserData, currentUserId)
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
async function addMessageToUI(message, contactUserData, currentUserId) {
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
    // Get user data for the message sender (same approach as comments.js)
    let senderUserData = contactUserData
    if (!senderUserData || senderUserData.uid !== message.senderId) {
      senderUserData = await getUserProfileData(message.senderId)
    }
    
    const senderName = senderUserData.displayName
    const senderPhotoURL = getProfilePictureUrl(senderUserData, senderName)
    
    const avatar = document.createElement("figure")
    avatar.className = "message-avatar"
    avatar.innerHTML = `<img src="${senderPhotoURL}" alt="${senderName}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2Mzc0OEEiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC4xMzQwMSAxNCA1IDE3LjEzNDAxIDUgMjFIMTlDMTkgMTcuMTM0MDEgMTUuODY2IDE0IDEyIDE0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo='">`
    messageElement.appendChild(avatar)
    
    const name = document.createElement("h3")
    name.textContent = senderName
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

        // Get user data using same approach as comments.js
        const userData = await getUserProfileData(otherParticipantId)
        await addContactToList(otherParticipantId, userData)
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