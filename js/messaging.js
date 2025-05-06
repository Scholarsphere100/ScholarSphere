import { auth, db } from './search.js';

// DOM Elements
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
let currentChatUnsubscribe = null;

// Helper function to format time
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Helper function to format date for the date separator
function formatDateForSeparator(date) {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Add contact to sidebar list
function addContactToList(contactId, contactName) {
    const contactsList = document.querySelector('.contacts-list ul');
    
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
    `;
    
    contactsList.insertAdjacentHTML('beforeend', contactHTML);
    
    // Get the newly added contact element
    const newContact = contactsList.querySelector(`.contact-item[data-contact-id="${contactId}"]`);
    
    // Add click handler
    newContact.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Remove active class from all contacts
        document.querySelectorAll('.contact-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked contact
        newContact.classList.add('active');
        
        // Unsubscribe from previous chat listener
        if (currentChatUnsubscribe) {
            currentChatUnsubscribe();
        }
        
        // Load the chat
        currentChatUnsubscribe = await loadChat(contactId);
    });
    
    return newContact;
}

async function loadChat(contactId) {
    try {
        const currentUserId = auth.currentUser.uid;
        const chatId = [currentUserId, contactId].sort().join('_');
        const chatRef = db.collection('chats').doc(chatId);
        
        // Update chat header
        const contactName = document.querySelector(`.contact-item[data-contact-id="${contactId}"] h3`).textContent;
        document.querySelector('.chat-user-info h2').textContent = contactName;
        document.querySelector('.chat-user-info .user-avatar img').alt = contactName;
        
        // Get the chat document to fetch the createdAt timestamp
        const chatDoc = await chatRef.get();
        let chatDate = new Date(); // Default to current date if not found
        
        if (chatDoc.exists) {
            const chatData = chatDoc.data();
            // Check if createdAt exists and convert to Date object
            if (chatData.createdAt) {
                if (typeof chatData.createdAt.toDate === 'function') {
                    chatDate = chatData.createdAt.toDate();
                } else if (chatData.createdAt instanceof Date) {
                    chatDate = chatData.createdAt;
                } else {
                    chatDate = new Date(chatData.createdAt);
                }
            }
        }
        
        // Format the date for the separator
        const formattedDate = formatDateForSeparator(chatDate);
        
        // Clear current messages and add date separator with the actual chat date
        chatMessages.innerHTML = `
            <article class="message-group date-separator">
                <time datetime="${chatDate.toISOString().split('T')[0]}">${formattedDate}</time>
            </article>
        `;
        
        // Track if we've done initial load
        let initialLoad = true;
        
        // Load and listen for messages
        const messagesQuery = chatRef.collection('messages')
            .orderBy('timestamp', 'asc');
            
        // Set up real-time listener
        const unsubscribe = messagesQuery.onSnapshot(snapshot => {
            // Only clear completely on initial load
            if (initialLoad) {
                // Keep the date separator but clear other messages
                chatMessages.innerHTML = `
                    <article class="message-group date-separator">
                        <time datetime="${chatDate.toISOString().split('T')[0]}">${formattedDate}</time>
                    </article>
                `;
                initialLoad = false;
            }
            
            // Process each message
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const message = change.doc.data();
                    const isCurrentUser = message.senderId === currentUserId;
                    
                    // Check if message already exists in DOM
                    const existingMessage = document.querySelector(`[data-message-id="${change.doc.id}"]`);
                    if (existingMessage) return;
                    
                    // Create message element
                    const messageElement = document.createElement('article');
                    messageElement.className = `message-group ${isCurrentUser ? 'sent' : 'received'}`;
                    messageElement.setAttribute('data-message-id', change.doc.id);
                    
                    const content = document.createElement('section');
                    content.className = 'message-content';
                    
                    const header = document.createElement('header');
                    header.className = 'message-header';
                    
                    if (!isCurrentUser) {
                        const avatar = document.createElement('figure');
                        avatar.className = 'message-avatar';
                        avatar.innerHTML = `<img src="https://via.placeholder.com/40" alt="${contactName}">`;
                        messageElement.appendChild(avatar);
                        
                        const name = document.createElement('h3');
                        name.textContent = contactName;
                        header.appendChild(name);
                    }
                    
                    const time = document.createElement('time');
                    if (message.timestamp && message.timestamp.toDate) {
                        time.setAttribute('datetime', message.timestamp.toDate().toISOString());
                        time.textContent = formatTime(message.timestamp.toDate());
                    } else {
                        const now = new Date();
                        time.setAttribute('datetime', now.toISOString());
                        time.textContent = formatTime(now);
                    }
                    header.appendChild(time);
                    
                    content.appendChild(header);
                    
                    const text = document.createElement('p');
                    text.className = 'message-text';
                    text.textContent = message.text;
                    content.appendChild(text);
                    
                    messageElement.appendChild(content);
                    chatMessages.appendChild(messageElement);
                }
            });
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
        
        return unsubscribe;
        
    } catch (error) {
        console.error('Error loading chat:', error);
        return null;
    }
}

// Send message function
async function sendMessage(senderId, recipientId, messageText) {
    try {
        const chatId = [senderId, recipientId].sort().join('_');
        const chatRef = db.collection('chats').doc(chatId);
        
        // Check if chat exists
        const chatDoc = await chatRef.get();
        
        // If chat doesn't exist, create it with current timestamp
        if (!chatDoc.exists) {
            await chatRef.set({
                participants: [senderId, recipientId],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Just update the lastUpdated field
            await chatRef.update({
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Add message to subcollection
        await chatRef.collection('messages').add({
            senderId: senderId,
            text: messageText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            read: false
        });
        
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

// Load user's contacts
async function myContacts() {
    try {
        const currentUserId = auth.currentUser.uid;
        
        // Clear existing contacts (keep the first one if needed)
        const contactsList = document.querySelector('.contacts-list ul');
        contactsList.innerHTML = '';
        
        // Query chats where current user is a participant
        const querySnapshot = await db.collection('chats')
            .where('participants', 'array-contains', currentUserId)
            .get();
        
        // Process each chat document
        const promises = querySnapshot.docs.map(async doc => {
            const chatData = doc.data();
            const otherParticipantId = chatData.participants.find(id => id !== currentUserId);
            
            if (otherParticipantId) {
                // Get the other user's details
                const userDoc = await db.collection('Users').doc(otherParticipantId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const userName = userData.displayName || userData.name || otherParticipantId;
                    addContactToList(otherParticipantId, userName);
                }
            }
        });
        
        await Promise.all(promises);
        
        // Load first contact by default if available
        const firstContact = contactsList.querySelector('.contact-item');
        if (firstContact) {
            firstContact.classList.add('active');
            currentChatUnsubscribe = await loadChat(firstContact.getAttribute('data-contact-id'));
        }
        
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

// Initialize chat functionality
function initializeChat() {
    // Auto-resize textarea
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            
            if (this.scrollHeight > 150) {
                this.style.height = '150px';
                this.style.overflowY = 'auto';
            } else {
                this.style.overflowY = 'hidden';
            }
        });
    }
    
    // Handle message form submission
    if (messageForm) {
        messageForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const messageText = messageInput.value.trim();
            
            if (messageText && auth.currentUser) {
                const activeContact = document.querySelector('.contact-item.active');
                if (activeContact) {
                    const recipientId = activeContact.getAttribute('data-contact-id');
                    try {
                        await sendMessage(auth.currentUser.uid, recipientId, messageText);
                        messageInput.value = '';
                        messageInput.style.height = 'auto';
                    } catch (error) {
                        console.error('Failed to send message:', error);
                    }
                }
            }
        });
    }
    
    // Initialize when user is authenticated
    auth.onAuthStateChanged(user => {
        if (user) {
            myContacts();
        } else {
            // Clean up when user signs out
            if (currentChatUnsubscribe) {
                currentChatUnsubscribe();
                currentChatUnsubscribe = null;
            }
        }
    });
}

// Start the chat system
document.addEventListener('DOMContentLoaded', initializeChat);