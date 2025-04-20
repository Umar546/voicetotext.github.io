document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const textOutput = document.getElementById('textOutput');
    const status = document.getElementById('status');
    
    let recognition;
    let isListening = false;
    let finalTranscript = '';
    let lastResultIndex = 0; // Track processed results

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
                finalTranscript = '';
                lastResultIndex = 0;
            };
            
            recognition.onerror = (event) => {
                stopRecognition();
                status.textContent = `Status: Error - ${event.error}`;
            };
            
            recognition.onend = () => {
                if (isListening) recognition.start();
            };
            
            recognition.onresult = (event) => {
                let interimTranscript = '';
                
                // Only process new results since last call
                for (let i = lastResultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                        interimTranscript = '';
                    } else {
                        interimTranscript = transcript;
                    }
                }
                
                lastResultIndex = event.results.length;
                textOutput.value = finalTranscript + interimTranscript;
            };
            
            return true;
        } catch (error) {
            status.textContent = `Status: ${error.message}`;
            startBtn.disabled = true;
            return false;
        }
    }
    
    // Initialize
    if (!initSpeechRecognition()) {
        startBtn.disabled = true;
    }
    
    // Button handlers
    startBtn.addEventListener('click', () => {
        if (recognition) recognition.start();
    });
    
    stopBtn.addEventListener('click', stopRecognition);
    
    function stopRecognition() {
        isListening = false;
        if (recognition) recognition.stop();
        resetUI();
    }
    
    function resetUI() {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        document.body.classList.remove('listening');
        status.textContent = 'Status: Ready';
    }
    
    copyBtn.addEventListener('click', () => {
        textOutput.select();
        document.execCommand('copy');
    });
    
    clearBtn.addEventListener('click', () => {
        finalTranscript = '';
        textOutput.value = '';
    });
});