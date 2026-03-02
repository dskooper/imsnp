(function() {
    'use strict';
    
    var ws = null;
    var currentContact = null;
    var contacts = {};
    var conversations = {};
    var typingTimers = {};
    var isRedirecting = false;
    
    // theres definitely a better way to do this lmao
    var loginScreen = document.getElementById('loginScreen');
    var mainScreen = document.getElementById('mainScreen');
    var chatScreen = document.getElementById('chatScreen');
    var loginForm = document.getElementById('loginForm');
    var loginBtn = document.getElementById('loginBtn');
    var loginError = document.getElementById('loginError');
    var loginStatus = document.getElementById('loginStatus');
    var statusSelect = document.getElementById('statusSelect');
    var logoutBtn = document.getElementById('logoutBtn');
    var personalMessageInput = document.getElementById('personalMessageInput');
    var setPsmBtn = document.getElementById('setPsmBtn');
    var addContactInput = document.getElementById('addContactInput');
    var addContactBtn = document.getElementById('addContactBtn');
    var contactList = document.getElementById('contactList');
    var chatTitle = document.getElementById('chatTitle');
    var nudgeBtn = document.getElementById('nudgeBtn');
    var closeChatBtn = document.getElementById('closeChatBtn');
    var messageContainer = document.getElementById('messageContainer');
    var messageInput = document.getElementById('messageInput');
    
    // Strip Messenger Plus! format tags from usernames
    function cleanDisplayName(name, maxLength) {
        var cleaned = name.replace(/\[.*?\]/g, '');
        if (maxLength && cleaned.length > maxLength) {
            return cleaned.substring(0, maxLength) + '...';
        }
        return cleaned;
    }
    
    // websocket init
    function connectWebSocket() {
        var protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        var wsUrl = protocol + '//' + window.location.host + '/ws';
        
        console.log('[CLIENT_WS] Connecting to WebSocket:', wsUrl);
        ws = new WebSocket(wsUrl);
        
        ws.onopen = function() {
            console.log('[CLIENT_WS] WebSocket connection opened successfully');
        };
        
        ws.onmessage = function(event) {
            try {
                console.log('[CLIENT_WS] Raw message received (length:', event.data.length, ')');
                var message = JSON.parse(event.data);
                handleServerMessage(message);
            } catch (e) {
                console.error('[CLIENT_WS] Failed to parse message:', e);
                console.error('[CLIENT_WS] Raw message data:', event.data);
            }
        };
        
        ws.onerror = function(error) {
            console.error('[CLIENT_WS] WebSocket error occurred:', error);
            showError('Connection error. Please refresh and try again.');
        };
        
        ws.onclose = function() {
            console.log('[CLIENT_WS] WebSocket connection closed');
            console.log('[CLIENT_WS] isRedirecting flag:', isRedirecting);
            if (!isRedirecting) {
                showError('Connection closed. Please refresh and sign in again.');
            }
        };
    }
    
    function sendMessage(message) {
        console.log('[CLIENT_SEND] Attempting to send message, type:', message.type);
        if (message.type === 'login') {
            console.log('[CLIENT_SEND] Login message details - Email:', message.email);
        }
        if (ws && ws.readyState === WebSocket.OPEN) {
            var jsonStr = JSON.stringify(message);
            console.log('[CLIENT_SEND] WebSocket ready, sending JSON (length:', jsonStr.length, ')');
            ws.send(jsonStr);
            console.log('[CLIENT_SEND] Message sent successfully');
        } else {
            console.error('[CLIENT_SEND] WebSocket not ready, readyState:', ws ? ws.readyState : 'null');
            showError('Not connected to server');
        }
    }
    
    function handleServerMessage(message) {
        if (message.type !== 'typing') { // Don't log typing notifs since otherwise it'll blow up the console
            console.log('[CLIENT_RECEIVE] Received message type:', message.type);
        }
        
        // switch-case of doom and despair
        switch (message.type) {
            case 'redirected':
                console.log('[CLIENT_RECEIVE] Redirect message received');
                handleRedirect(message.server, message.port);
                break;
            case 'authenticated':
                console.log('[CLIENT_RECEIVE] Authenticated message received - login successful!');
                handleAuthenticated();
                break;
            case 'error':
                console.error('[CLIENT_RECEIVE] Error message received:', message.message);
                console.error('[CLIENT_RECEIVE] Full error object:', JSON.stringify(message));
                showError(message.message);
                break;
            case 'contact':
                handleContact(message);
                break;
            case 'group':
                handleGroup(message);
                break;
            case 'presenceUpdate':
                handlePresenceUpdate(message);
                break;
            case 'personalMessageUpdate':
                handlePersonalMessageUpdate(message);
                break;
            case 'contactOffline':
                handleContactOffline(message.email);
                break;
            case 'addedBy':
                handleAddedBy(message);
                break;
            case 'removedBy':
                handleRemovedBy(message.email);
                break;
            case 'conversationReady':
                console.log('[CLIENT] ConversationReady received for:', message.email);
                handleConversationReady(message.email);
                break;
            case 'textMessage':
                handleTextMessage(message);
                break;
            case 'nudge':
                handleNudge(message.email);
                break;
            case 'typing':
                handleTyping(message.email);
                break;
            case 'participantJoined':
                console.log('[CLIENT] ParticipantJoined received for:', message.email);
                handleParticipantJoined(message.email);
                break;
            case 'participantLeft':
                handleParticipantLeft(message.email);
                break;
            case 'displayPicture':
                handleDisplayPicture(message);
                break;
            case 'disconnected':
                handleDisconnected();
                break;
        }
    }
    
    function handleLogin(e) {
        if (e) e.preventDefault();
        
        var email = document.getElementById('email').value.trim();
        var password = document.getElementById('password').value;
        var server = document.getElementById('server').value.trim();
        var port = parseInt(document.getElementById('port').value, 10);
        var nexusUrl = document.getElementById('nexusUrl').value.trim();
        var configServer = document.getElementById('configServer').value.trim();
        
        console.log('[CLIENT_LOGIN] Login attempt initiated');
        console.log('[CLIENT_LOGIN] Email entered:', email);
        console.log('[CLIENT_LOGIN] Email length:', email.length);
        console.log('[CLIENT_LOGIN] Email char codes:', Array.from(email).map(c => c.charCodeAt(0)));
        console.log('[CLIENT_LOGIN] Password length:', password.length);
        console.log('[CLIENT_LOGIN] Server:', server, ':', port);
        console.log('[CLIENT_LOGIN] Nexus URL:', nexusUrl);
        console.log('[CLIENT_LOGIN] Config Server:', configServer || '(none)');
        
        if (!email || !password || !server || !port || !nexusUrl) {
            console.error('[CLIENT_LOGIN] Validation failed - missing required fields');
            showError('Please fill in all required fields');
            return;
        }
        
        console.log('[CLIENT_LOGIN] Validation passed, sending login message');
        loginBtn.disabled = true;
        loginBtn.innerHTML = 'Signing in...';
        hideError();
        hideStatus();
        
        sendMessage({
            type: 'login',
            email: email,
            password: password,
            server: server,
            port: port,
            nexus_url: nexusUrl,
            config_server: configServer || null
        });
        console.log('[CLIENT_LOGIN] Login message sent to server');
    }
    
    function handleRedirect(server, port) {
        console.log('[CLIENT_REDIRECT] Redirect received to', server, ':', port);
        showStatus('Redirecting to ' + server + ':' + port + '...');
        isRedirecting = true;
        ws.close();
        
        // patience is a virtue
        setTimeout(function() {
            console.log('[CLIENT_REDIRECT] Reconnecting WebSocket...');
            connectWebSocket();
            
            // patience is a virtue 2
            setTimeout(function() {
                isRedirecting = false;
                var email = document.getElementById('email').value.trim();
                var password = document.getElementById('password').value;
                var nexusUrl = document.getElementById('nexusUrl').value.trim();
                var configServer = document.getElementById('configServer').value.trim();
                
                console.log('[CLIENT_REDIRECT] Re-attempting login after redirect with email:', email);
                sendMessage({
                    type: 'login',
                    email: email,
                    password: password,
                    server: server,
                    port: port,
                    nexus_url: nexusUrl,
                    config_server: configServer || null
                });
                console.log('[CLIENT_REDIRECT] Redirect login message sent');
            }, 500);
        }, 500);
    }
    
    function handleAuthenticated() {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Sign In';
        hideError();
        showStatus('Signed in successfully!');
        
        setTimeout(function() {
            loginScreen.style.display = 'none';
            mainScreen.style.display = 'block';
            // Adjust contact list height after screen is shown
            setTimeout(adjustContactListHeight, 50);
        }, 500);
    }
    
    function handleContact(contact) {
        contacts[contact.email] = {
            email: contact.email,
            displayName: contact.display_name,
            status: 'Offline',
            personalMessage: '',
            lists: contact.lists,
            groups: contact.groups || []
        };
        updateContactList();
    }
    
    function handleGroup(group) {
        console.log('Group:', group.name, group.guid);
    }
    
    function handlePresenceUpdate(update) {
        if (contacts[update.email]) {
            contacts[update.email].displayName = update.display_name;
            contacts[update.email].status = update.status;
            updateContactList();
        }
    }
    
    function handlePersonalMessageUpdate(update) {
        if (contacts[update.email]) {
            contacts[update.email].personalMessage = update.message;
            updateContactList();
        }
    }
    
    function handleContactOffline(email) {
        if (contacts[email]) {
            contacts[email].status = 'Offline';
            updateContactList();
        }
    }
    
    function handleAddedBy(data) {
        showStatus(data.display_name + ' (' + data.email + ') added you to their contact list');
    }
    
    function handleRemovedBy(email) {
        showStatus(email + ' removed you from their contact list');
    }
    
    function handleConversationReady(email) {
        console.log('[CLIENT] handleConversationReady - email:', email, '| conversations[email]:', !!conversations[email], '| currentContact:', currentContact);
        if (!conversations[email]) {
            conversations[email] = [];
        }
        openChat(email);
        console.log('[CLIENT] handleConversationReady - chat opened for', email);
    }
    
    function handleTextMessage(msg) {
        console.log('[CLIENT] handleTextMessage - from:', msg.email, '| text:', msg.message);
        if (!conversations[msg.email]) {
            conversations[msg.email] = [];
            console.log('[CLIENT] handleTextMessage - initialized conversation for', msg.email);
        }
        
        var message = {
            sender: msg.email,
            text: msg.message,
            time: new Date(),
            color: msg.color
        };
        
        conversations[msg.email].push(message);
        console.log('[CLIENT] handleTextMessage - message stored | currentContact:', currentContact, '| sender:', msg.email);
        
        if (currentContact === msg.email) {
            console.log('Displaying message in UI');
            displayMessage(message, false);
            scrollToBottom();
        }
    }
    
    function handleNudge(email) {
        if (currentContact === email) {
            // Visual feedback
            addSystemMessage('💥 ' + (contacts[email] ? contacts[email].displayName : email) + ' sent you a nudge!');
            
            // Shake animation (with webkit prefix for iOS 6)
            var chatScreen = document.getElementById('chatScreen');
            chatScreen.style.webkitAnimation = 'shake 0.5s';
            chatScreen.style.animation = 'shake 0.5s';
            setTimeout(function() {
                chatScreen.style.webkitAnimation = '';
                chatScreen.style.animation = '';
            }, 500);
            
            // Vibration for mobile
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate([100, 50, 100, 50, 100]);
            }
        }
    }
    
    // Handle typing notification
    // showTypingIndicator is broken atm, fix later
    function handleTyping(email) {
        if (currentContact === email) {
            showTypingIndicator(email);
        }
    }
    
    function handleParticipantJoined(email) {
        console.log('[CLIENT] handleParticipantJoined - email:', email, '| conversations[email]:', !!conversations[email], '| currentContact:', currentContact);
        
        // Initialize conversation if it doesn't exist
        if (!conversations[email]) {
            conversations[email] = [];
            console.log('[CLIENT] handleParticipantJoined - initialized conversations array for', email);
        }
        
        // If this contact isn't currently open in chat, open it
        // (This handles cases where the contact initiated the switchboard)
        if (currentContact !== email) {
            console.log('[CLIENT] handleParticipantJoined - opening chat for', email);
            openChat(email);
        } else {
            // Already in chat with this contact, just add system message
            console.log('[CLIENT] handleParticipantJoined - already in chat with', email, '- adding system message');
            addSystemMessage(email + ' joined the conversation');
        }
    }
    
    function handleParticipantLeft(email) {
        if (currentContact === email) {
            addSystemMessage(email + ' left the conversation');
        }
    }
    
    function handleDisconnected() {
        showError('You have been disconnected from the server');
        setTimeout(function() {
            window.location.reload();
        }, 2000);
    }
    
    function updateContactList() {
        contactList.innerHTML = '';
        
        var sortedContacts = [];
        for (var email in contacts) {
            if (contacts.hasOwnProperty(email)) {
                sortedContacts.push(contacts[email]);
            }
        }
        
        sortedContacts.sort(function(a, b) {
            // Online contacts first
            var aOnline = a.status !== 'Offline';
            var bOnline = b.status !== 'Offline';
            if (aOnline !== bOnline) return bOnline - aOnline;
            
            // Then by display name
            return a.displayName.localeCompare(b.displayName);
        });
        
        for (var i = 0; i < sortedContacts.length; i++) {
            var contact = sortedContacts[i];
            var item = createContactItem(contact);
            contactList.appendChild(item);
        }
    }
    
    function createContactItem(contact) {
        var item = document.createElement('div');
        item.className = 'contact-item';
        
        var statusIndicator = document.createElement('div');
        statusIndicator.className = 'contact-status ' + getStatusClass(contact.status);
        
        var info = document.createElement('div');
        info.className = 'contact-info';
        
        var name = document.createElement('div');
        name.className = 'contact-name';
        name.textContent = cleanDisplayName(contact.displayName);
        
        var email = document.createElement('div');
        email.className = 'contact-email';
        email.textContent = contact.email;
        
        info.appendChild(name);
        info.appendChild(email);
        
        if (contact.personalMessage) {
            var psm = document.createElement('div');
            psm.className = 'contact-psm';
            psm.textContent = contact.personalMessage;
            info.appendChild(psm);
        }
        
        item.appendChild(statusIndicator);
        item.appendChild(info);
        
        item.onclick = function() {
            startConversation(contact.email);
        };
        
        return item;
    }
    
    function getStatusClass(status) {
        if (status === 'Online' || status === 'Idle') return 'online';
        if (status === 'Busy' || status === 'OnThePhone') return 'busy';
        if (status === 'Away' || status === 'BeRightBack' || status === 'OutToLunch') return 'away';
        return 'offline';
    }
    
    function startConversation(email) {
        console.log('startConversation called for:', email);
        if (!conversations[email]) {
            console.log('Sending startConversation request for:', email);
            sendMessage({
                type: 'startConversation',
                email: email
            });
        } else {
            console.log('Conversation already exists, opening chat for:', email);
            openChat(email);
        }
    }
    
    function openChat(email) {
        currentContact = email;
        var contact = contacts[email];
        
        if (contact) {
            chatTitle.textContent = cleanDisplayName(contact.displayName, 28);
        } else {
            // Truncate email if too long
            chatTitle.textContent = email.length > 28 ? email.substring(0, 28) + '...' : email;
        }
        
        messageContainer.innerHTML = '';
        messageInput.value = ''; // Clear input when switching contacts
        
        if (conversations[email] && conversations[email].length) {
            for (var i = 0; i < conversations[email].length; i++) {
                var msg = conversations[email][i];
                displayMessage(msg, msg.sender === getUserEmail());
            }
        }
        
        mainScreen.style.display = 'none';
        chatScreen.style.display = 'block';
        messageInput.focus();
        scrollToBottom();
    }
    
    function getUserEmail() {
        return document.getElementById('email').value.trim();
    }
    
    function displayMessage(message, isSent) {
        console.log('displayMessage called, isSent:', isSent, 'message:', message);
        console.log('messageContainer element:', messageContainer);
        
        if (!messageContainer) {
            console.error('messageContainer is null or undefined!');
            return;
        }
        
        var msgDiv = document.createElement('div');
        msgDiv.className = 'message ' + (isSent ? 'message-sent' : 'message-received');
        console.log('Created msgDiv with className:', msgDiv.className);
        
        var bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        if (!isSent) {
            var sender = document.createElement('div');
            sender.className = 'message-sender';
            sender.textContent = message.sender;
            bubble.appendChild(sender);
        }
        
        var text = document.createElement('div');
        text.textContent = message.text;
        bubble.appendChild(text);
        console.log('Message text:', message.text);
        
        var time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = formatTime(message.time);
        bubble.appendChild(time);
        
        msgDiv.appendChild(bubble);
        messageContainer.appendChild(msgDiv);
        console.log('Message appended to messageContainer, total messages:', messageContainer.children.length);
    }
    
    function addSystemMessage(text) {
        var msgDiv = document.createElement('div');
        msgDiv.className = 'message-system';
        msgDiv.textContent = text;
        messageContainer.appendChild(msgDiv);
        scrollToBottom();
    }
    
    // Show typing indicator
    // Doesn't appear in regular use, fix later
    function showTypingIndicator(email) {
        var existingIndicator = document.getElementById('typing-' + email);
        if (existingIndicator) {
            clearTimeout(typingTimers[email]);
        } else {
            var indicator = document.createElement('div');
            indicator.id = 'typing-' + email;
            indicator.className = 'typing-indicator';
            indicator.textContent = 'typing...';
            messageContainer.appendChild(indicator);
            scrollToBottom();
        }
        
        typingTimers[email] = setTimeout(function() {
            var ind = document.getElementById('typing-' + email);
            if (ind) ind.parentNode.removeChild(ind);
            delete typingTimers[email];
        }, 3000);
    }
    
    function formatTime(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return hours + ':' + minutes + ' ' + ampm;
    }
    
    function scrollToBottom() {
        setTimeout(function() {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }, 100);
    }
    
    function handleSendMessage() {
        var text = messageInput.value.trim();
        console.log('handleSendMessage called, text:', text, 'currentContact:', currentContact);
        if (!text || !currentContact) return;
        
        console.log('[CLIENT] Sending message to', currentContact, '- text:', text.substring(0, 50));
        sendMessage({
            type: 'sendMessage',
            email: currentContact,
            message: text
        });
        
        var msg = {
            sender: getUserEmail(),
            text: text,
            time: new Date()
        };
        
        console.log('Created message object:', msg);
        
        if (!conversations[currentContact]) {
            conversations[currentContact] = [];
        }
        conversations[currentContact].push(msg);
        
        console.log('Calling displayMessage for sent message');
        displayMessage(msg, true);
        messageInput.value = '';
        scrollToBottom();
    }
    
    // Send typing notification
    // Seems to be doing some weird shit
    var typingTimeout = null;
    function handleTyping() {
        if (!currentContact) return;
        
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
        
        sendMessage({
            type: 'sendTyping',
            email: currentContact // shouldn't this be the user's email, not the recipients?
        });
        
        typingTimeout = setTimeout(function() {
            typingTimeout = null;
        }, 2000);
    }
    
    function handleNudgeBtn() {
        if (!currentContact) return;
        
        sendMessage({
            type: 'sendNudge',
            email: currentContact
        });
        
        addSystemMessage('You sent a nudge');
    }
    
    function closeChat() {
        if (currentContact) {
            sendMessage({
                type: 'closeConversation',
                email: currentContact
            });
            delete conversations[currentContact];
        }
        
        currentContact = null;
        chatScreen.style.display = 'none';
        mainScreen.style.display = 'block';
        adjustContactListHeight();
    }
    
    function handleStatusChange() {
        var status = statusSelect.value;
        console.log('Setting status to:', status);
        sendMessage({
            type: 'setPresence',
            status: status
        });
    }
    
    function handleSetPsm() {
        var message = personalMessageInput.value.trim();
        console.log('Setting personal message to:', message);
        sendMessage({
            type: 'setPersonalMessage',
            message: message
        });
        personalMessageInput.value = '';
    }
    
    function handleAddContact() {
        var email = addContactInput.value.trim();
        if (!email) return;
        
        console.log('[CLIENT] Adding contact:', email);
        sendMessage({
            type: 'addContact',
            email: email
        });
        
        addContactInput.value = '';
        showStatus('Contact request sent');
    }
    
    function handleLogout() {
        sendMessage({
            type: 'logout'
        });
        
        contacts = {};
        conversations = {};
        currentContact = null;
        
        ws.close();
        
        // Reload the page instead of just switching screens
        window.location.reload();
    }
    
    function showError(message) {
        loginError.textContent = message;
        loginError.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Sign In';
    }
    
    function hideError() {
        loginError.style.display = 'none';
    }
    
    function showStatus(message) {
        loginStatus.textContent = message;
        loginStatus.style.display = 'block';
    }
    
    function hideStatus() {
        loginStatus.style.display = 'none';
    }
    
    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    loginBtn.addEventListener('click', handleLogin);
    statusSelect.addEventListener('change', handleStatusChange);
    logoutBtn.addEventListener('click', handleLogout);
    setPsmBtn.addEventListener('click', handleSetPsm);
    addContactBtn.addEventListener('click', handleAddContact);
    nudgeBtn.addEventListener('click', handleNudgeBtn);
    closeChatBtn.addEventListener('click', closeChat);
    
    // Message input - send on return
    messageInput.addEventListener('keypress', function(e) {
        if (e.keyCode === 13 || e.which === 13) {
            handleSendMessage();
            e.preventDefault();
        }
    });
    
    // Collapsible section toggles
    var togglePsm = document.getElementById('togglePsm');
    var toggleAddContact = document.getElementById('toggleAddContact');
    var psmSection = document.getElementById('psmSection');
    var addContactSection = document.getElementById('addContactSection');
    
    if (togglePsm && psmSection) {
        togglePsm.addEventListener('click', function() {
            if (psmSection.style.display === 'none') {
                psmSection.style.display = 'block';
                togglePsm.textContent = 'Personal Message ▲';
            } else {
                psmSection.style.display = 'none';
                togglePsm.textContent = 'Personal Message ▼';
            }
            adjustContactListHeight();
        });
    }
    
    if (toggleAddContact && addContactSection) {
        toggleAddContact.addEventListener('click', function() {
            if (addContactSection.style.display === 'none') {
                addContactSection.style.display = 'block';
                toggleAddContact.textContent = 'Add Contact ▲';
            } else {
                addContactSection.style.display = 'none';
                toggleAddContact.textContent = 'Add Contact ▼';
            }
            adjustContactListHeight();
        });
    }
    
    // Message input handlers
    messageInput.addEventListener('keyup', handleTyping);
    
    personalMessageInput.addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {
            handleSetPsm();
            e.preventDefault();
        }
    });
    
    addContactInput.addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {
            handleAddContact();
            e.preventDefault();
        }
    });
    
    function adjustContactListHeight() {
        var collapsibleSections = document.querySelector('.collapsible-sections');
        var content = document.querySelector('#mainScreen .content');
        
        if (collapsibleSections && content && contactList) {
            var contentHeight = content.offsetHeight;
            var sectionsHeight = collapsibleSections.offsetHeight;
            var remainingHeight = contentHeight - sectionsHeight;
            contactList.style.height = remainingHeight + 'px';
        }
    }
    
    // Init
    connectWebSocket();
    adjustContactListHeight();
    
    // Adjust on window resize
    window.addEventListener('resize', adjustContactListHeight);
    window.addEventListener('orientationchange', adjustContactListHeight);
    
})();
