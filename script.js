document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const textOutput = document.getElementById('textOutput');
    const status = document.getElementById('status');
    
    let recognition;
    let isListening = false;
    
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
            };
            
            recognition.onerror = (event) => {
                let errorMessage = 'Error occurred';
                switch(event.error) {
                    case 'no-speech':
                        errorMessage = 'No speech detected';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Microphone not available';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Microphone access denied';
                        break;
                    default:
                        errorMessage = `Error: ${event.error}`;
                }
                status.textContent = `Status: ${errorMessage}`;
                stopRecognition();
            };
            
            recognition.onend = () => {
                if (isListening) {
                    // Auto-restart if not manually stopped
                    try {
                        recognition.start();
                    } catch (e) {
                        status.textContent = `Status: ${e.message}`;
                        resetUI();
                    }
                }
            };
            
            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                // Preserve existing text while appending new results
                textOutput.value = textOutput.value + finalTranscript;
                
                // Show interim results only if there's no final result yet
                if (finalTranscript === '' && interimTranscript !== '') {
                    textOutput.value = textOutput.value + interimTranscript;
                }
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
        if (!recognition) {
            status.textContent = 'Status: Recognition not initialized';
            return;
        }
        
        try {
            // Clear previous error states
            status.textContent = 'Status: Starting...';
            textOutput.placeholder = 'Speak now...';
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
                console.error('Error stopping recognition:', error);
            }
        }
        resetUI();
    }
    
    function resetUI() {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        document.body.classList.remove('listening');
        if (!status.textContent.includes('Error')) {
            status.textContent = 'Status: Ready';
        }
    }
    
    function copyText() {
        try {
            textOutput.select();
            document.execCommand('copy');
            
            // Visual feedback
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (error) {
            status.textContent = 'Status: Copy failed';
        }
    }
    
    function clearText() {
        textOutput.value = '';
        textOutput.placeholder = 'Your transcribed text will appear here...';
    }
    
    // Handle browser tab switching
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isListening) {
            stopRecognition();
            status.textContent = 'Status: Paused (tab inactive)';
        }
    });
});