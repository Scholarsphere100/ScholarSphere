// chat-ui.js - UI enhancements for the chat interface

document.addEventListener("DOMContentLoaded", () => {
    // Add loading styles
    const loadingStyles = document.createElement("style")
    loadingStyles.textContent = `
      .chat-loading, .contact-loading, .auth-message {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: var(--neutral-color, #888);
        text-align: center;
        padding: 2rem;
      }
      
      .contact-loading {
        height: auto;
        padding: 1.5rem 1rem;
      }
      
      .loading-spinner {
        width: 30px;
        height: 30px;
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: var(--primary-color, #2bdad8);
        animation: spin 1s ease-in-out infinite;
        margin-bottom: 0.5rem;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .empty-chat-message {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: var(--neutral-color, #888);
        font-style: italic;
        text-align: center;
        padding: 2rem;
      }
      
      .empty-chat-message p {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 1rem 2rem;
        border-radius: 8px;
      }
      
      .auth-message p {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: 500;
      }
      
      .user-placeholder {
        height: 48px;
        width: 48px;
        border-radius: 50%;
        background-color: #f0f0f0;
        animation: pulse 1.5s infinite;
      }
      
      .text-placeholder {
        height: 1em;
        margin: 0.5em 0;
        width: 70%;
        background-color: #f0f0f0;
        border-radius: 4px;
        animation: pulse 1.5s infinite;
      }
      
      .short-placeholder {
        width: 40%;
      }
      
      @keyframes pulse {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
      }
    `
    document.head.appendChild(loadingStyles)
  
    // Show loading state for contacts list
    const contactsList = document.querySelector(".contacts-list ul")
    if (contactsList && contactsList.children.length <= 1) {
      contactsList.innerHTML = `
        <li class="contact-loading">
          <div class="loading-spinner"></div>
          <p>Loading contacts...</p>
        </li>
      `
    }
  
    // Show loading state for chat messages
    const chatMessages = document.getElementById("chat-messages")
    if (chatMessages) {
      // Only show loading if there's just the date separator
      if (chatMessages.children.length <= 1) {
        chatMessages.innerHTML = `
          <div class="chat-loading">
            <div class="loading-spinner"></div>
            <p>Loading messages...</p>
          </div>
        `
      }
    }
  
    // Add authentication state listener - using the global firebase object
    if (typeof firebase !== "undefined") {
      const auth = firebase.auth()
      if (auth) {
        auth.onAuthStateChanged((user) => {
          if (!user) {
            // User is not signed in
            if (contactsList) {
              contactsList.innerHTML = `
                <li class="auth-message">
                  <p>Please sign in to view your conversations</p>
                </li>
              `
            }
  
            if (chatMessages) {
              chatMessages.innerHTML = `
                <div class="auth-message">
                  <p>Sign in to start messaging</p>
                </div>
              `
            }
          }
        })
      }
    }
  })
  
  // Helper function to format time (copied from original messaging.js)
  export function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
  
  // Helper function to format date for the date separator (copied from original messaging.js)
  export function formatDateForSeparator(date) {
    const options = { month: "long", day: "numeric", year: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }
  
  /**
   * Direct implementation of message separator functionality
   * Instead of trying to enhance the original function, we'll implement our own
   * version that will be called directly from the HTML
   */
  export function directLoadChat(contactId) {
    try {
      if (typeof firebase === "undefined") {
        console.error("Firebase is not defined")
        return null
      }
  
      const auth = firebase.auth()
      const db = firebase.firestore()
  
      if (!auth.currentUser) {
        console.error("User not authenticated")
        return null
      }
  
      const currentUserId = auth.currentUser.uid
      const chatId = [currentUserId, contactId].sort().join("_")
      const chatRef = db.collection("chats").doc(chatId)
  
      // Update chat header
      const contactName = document.querySelector(`.contact-item[data-contact-id="${contactId}"] h3`).textContent
      document.querySelector(".chat-user-info h2").textContent = contactName
      document.querySelector(".chat-user-info .user-avatar img").alt = contactName
  
      // Show loading state
      const chatMessages = document.getElementById("chat-messages")
      chatMessages.innerHTML = `
        <div class="chat-loading">
          <div class="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      `
  
      // Load and listen for messages
      const messagesQuery = chatRef.collection("messages").orderBy("timestamp", "asc")
  
      // Set up real-time listener
      const unsubscribe = messagesQuery.onSnapshot((snapshot) => {
        // Check if there are any messages
        if (snapshot.empty) {
          // Show empty chat message
          chatMessages.innerHTML = `
            <div class="empty-chat-message">
              <p>No messages: start conversation...</p>
            </div>
          `
          return
        }
  
        // Clear loading state
        chatMessages.innerHTML = ""
  
        // Group messages by date
        const messagesByDate = new Map()
  
        // Process all messages
        snapshot.docs.forEach((doc) => {
          const message = doc.data()
          const messageId = doc.id
  
          // Get message timestamp
          let messageDate = new Date()
          if (message.timestamp && message.timestamp.toDate) {
            messageDate = message.timestamp.toDate()
          }
  
          // Create date key (YYYY-MM-DD)
          const dateKey = messageDate.toISOString().split("T")[0]
  
          // Add message to the appropriate date group
          if (!messagesByDate.has(dateKey)) {
            messagesByDate.set(dateKey, [])
          }
  
          messagesByDate.get(dateKey).push({
            id: messageId,
            ...message,
            date: messageDate,
          })
        })
  
        // Sort dates chronologically
        const sortedDates = Array.from(messagesByDate.keys()).sort()
  
        // Process each date group
        sortedDates.forEach((dateKey) => {
          const messages = messagesByDate.get(dateKey)
  
          // Only proceed if there are messages for this date
          if (messages && messages.length > 0) {
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
            messages.forEach((message) => {
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
              chatMessages.appendChild(messageElement)
            })
          }
        })
  
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight
      })
  
      return unsubscribe
    } catch (error) {
      console.error("Error loading chat:", error)
      return null
    }
  }
  
  // Expose the function globally
  window.directLoadChat = directLoadChat
  
  // Initialize contact click handlers
  document.addEventListener("DOMContentLoaded", () => {
    let currentChatUnsubscribe = null
  
    // Set up contact click handlers
    const setupContactHandlers = () => {
      const contactItems = document.querySelectorAll(".contact-item")
  
      contactItems.forEach((item) => {
        item.addEventListener("click", async (e) => {
          e.preventDefault()
  
          // Remove active class from all contacts
          contactItems.forEach((contact) => {
            contact.classList.remove("active")
          })
  
          // Add active class to clicked contact
          item.classList.add("active")
  
          // Unsubscribe from previous chat listener
          if (currentChatUnsubscribe) {
            currentChatUnsubscribe()
          }
  
          // Get contact ID
          const contactId = item.getAttribute("data-contact-id")
  
          // Load the chat using our direct implementation
          currentChatUnsubscribe = directLoadChat(contactId)
        })
      })
    }
  
    // Run setup after a short delay to ensure DOM is ready
    setTimeout(setupContactHandlers, 1000)
  })
  