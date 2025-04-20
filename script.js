document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const textOutput = document.getElementById('textOutput');
    const status = document.getElementById('status');
    
    let recognition;
    let isListening = false;
    let finalTranscript = ''; // Stores all finalized text
    let timeoutId; // For managing interim results

    // Initialize speech recognition
    function initSpeechRecognition() {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                throw new Error('Speech recognition not supported');
            }
            
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            
            recognition.onstart = () => {
                isListening = true;
                status.textContent = 'Status: Listening...';
                document.body.classList.add('listening');
                startBtn.disabled = true;
                stopBtn.disabled = false;
                finalTranscript = ''; // Reset on new session
            };
            
            recognition.onerror = (event) => {
                let errorMessage = 'Error occurred';
                switch(event.error) {
                    case 'no-speech': errorMessage = 'No speech detected'; break;
                    case 'audio-capture': errorMessage = 'Microphone not available'; break;
                    case 'not-allowed': errorMessage = 'Microphone access denied'; break;
                    default: errorMessage = `Error: ${event.error}`;
                }
                status.textContent = `Status: ${errorMessage}`;
                stopRecognition();
            };
            
            recognition.onend = () => {
                if (isListening) {
                    try {
                        recognition.start();
                    } catch (e) {
                        status.textContent = `Status: ${e.message}`;
                        resetUI();
                    }
                }
            };
            
            recognition.onresult = (event) => {
                clearTimeout(timeoutId); // Clear previous timeout
                
                let interimTranscript = '';
                
                // Process all results
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                        interimTranscript = '';
                    } else {
                        interimTranscript = transcript;
                    }
                }
                
                // Update UI with final + current interim result
                textOutput.value = finalTranscript + interimTranscript;
                
                // Clear interim result after 2 seconds if no new speech
                timeoutId = setTimeout(() => {
                    if (interimTranscript) {
                        textOutput.value = finalTranscript;
                    }
                }, 2000);
            };
            
            return true;
        } catch (error) {
            status.textContent = `Status: ${error.message}`;
            startBtn.disabled = true;
            return false;
        }
    }
    
    // Initialize on page load
    if (!initSpeechRecognition()) {
        startBtn.disabled = true;
    }
    
    // Button event listeners
    startBtn.addEventListener('click', startRecognition);
    stopBtn.addEventListener('click', stopRecognition);
    copyBtn.addEventListener('click', copyText);
    clearBtn.addEventListener('click', clearText);
    
    function startRecognition() {
        if (!recognition) return;
        status.textContent = 'Status: Starting...';
        textOutput.placeholder = 'Speak now...';
        try {
            recognition.start();
        } catch (error) {
            status.textContent = `Status: ${error.message}`;
            resetUI();
        }
    }
    
    function stopRecognition() {
        isListening = false;
        if (recognition) {
            try {
                recognition.stop();
            } catch (error) {
                console.error('Error stopping:', error);
            }
        }
        resetUI();
    }
    
    function resetUI() {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        document.body.classList.remove('listening');
        status.textContent = 'Status: Ready';
    }
    
    function copyText() {
        textOutput.select();
        document.execCommand('copy');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => copyBtn.innerHTML = originalText, 2000);
    }
    
    function clearText() {
        finalTranscript = '';
        textOutput.value = '';
        textOutput.placeholder = 'Your transcribed text will appear here...';
    }
});