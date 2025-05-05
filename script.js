// Counter function with direct POST approach
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initial setup
        updateCounter(0);
        fetchCount();
        
        // Setup button click
        const helpButton = document.getElementById('helpButton');
        if (helpButton) {
            helpButton.addEventListener('click', function() {
                try {
                    // Display thank you message
                    const thankYouElement = document.getElementById('thankYouMessage');
                    if (thankYouElement) {
                        thankYouElement.style.display = 'block';
                    }
                    
                    // Get full name value
                    const fullNameField = document.getElementById('fullNameField');
                    const fullName = fullNameField ? fullNameField.value : 'Anonymous';
                    
                    // Record the click using a form submission (no CORS issues)
                    const iframe = document.createElement('iframe');
                    iframe.name = 'submit-frame';
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                    
                    const form = document.createElement('form');
                    form.action = 'https://script.google.com/macros/s/AKfycbzHMqhNUHsWno3wIjPqHvktp97EPqNF8b-J9JdNr5bvRh-6C4u873C75Cne7uDaApGN/exec';
                    form.method = 'POST';
                    form.target = 'submit-frame';
                    
                    // Add form fields
                    appendInput(form, 'action', 'clicked');
                    appendInput(form, 'fullName', fullName);
                    
                    // Add to document and submit
                    document.body.appendChild(form);
                    form.submit();
                    
                    // Cleanup and refresh counter after delay
                    setTimeout(function() {
                        document.body.removeChild(form);
                        setTimeout(fetchCount, 1500);
                    }, 500);
                } catch (error) {
                    console.error('Error in button click handler:', error);
                }
            });
        }
    } catch (error) {
        console.error('Error in DOMContentLoaded handler:', error);
    }
});

// Helper to create form inputs
function appendInput(form, name, value) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value || '';
    form.appendChild(input);
}

// Update counter display
function updateCounter(count) {
    try {
        count = Number(count) || 0;
        const counterNumber = document.getElementById('counter-number');
        const counterBar = document.getElementById('counter-bar');
        
        if (!counterNumber || !counterBar) {
            console.warn('Counter elements not found');
            return;
        }
        
        // Format the count with commas
        const formattedCount = count.toLocaleString();
        
        // Better Czech language detection - check filename and path
        const pageUrl = window.location.href.toLowerCase();
        const isCzech = pageUrl.includes('cz.html') || 
                       pageUrl.endsWith('/cz') ||
                       pageUrl.includes('/cz?') ||
                       pageUrl.includes('/cz/') ||
                       document.documentElement.lang === 'cs';
        
        // Display count out of 1 billion
        if (isCzech) {
            counterNumber.textContent = formattedCount + ' z 1 000 000 000 lidí, kterým jsme pomohli';
        } else {
            counterNumber.textContent = formattedCount + ' out of 1,000,000,000 people helped';
        }
        
        // Linear scale - bar will be proportional to actual count
        const visualPercentage = (count / 1000000000) * 100;
        counterBar.style.width = visualPercentage + '%';
    } catch (error) {
        console.error('Error updating counter:', error);
    }
}

// Fetch the count
function fetchCount() {
    try {
        // Use simple fetch with error handling
        fetch('https://script.google.com/macros/s/AKfycbzHMqhNUHsWno3wIjPqHvktp97EPqNF8b-J9JdNr5bvRh-6C4u873C75Cne7uDaApGN/exec?action=getCount&v=' + Date.now())
            .then(function(response) {
                if (response.ok) return response.json();
                else {
                    console.error('Count fetch error:', response.status);
                    return {count: 0};
                }
            })
            .then(function(data) {
                updateCounter(data.count);
            })
            .catch(function(error) {
                console.error('Count fetch failed:', error);
                // If fetch fails, try iframe approach (avoids CORS)
                fetchCountViaIframe();
            });
    } catch (error) {
        console.error('Error in fetchCount:', error);
        updateCounter(0);
    }
}

// Alternative count fetcher using iframe
function fetchCountViaIframe() {
    try {
        // Create a hidden iframe and set its src
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = 'https://script.google.com/macros/s/AKfycbzHMqhNUHsWno3wIjPqHvktp97EPqNF8b-J9JdNr5bvRh-6C4u873C75Cne7uDaApGN/exec?action=getCount&output=html';
        
        // When loaded, try to extract count
        iframe.onload = function() {
            try {
                // Try to get content
                const content = iframe.contentDocument.body.textContent;
                const data = JSON.parse(content);
                updateCounter(data.count);
            } catch (e) {
                console.error('Failed to get count via iframe:', e);
                updateCounter(0);
            }
            // Remove iframe after use
            document.body.removeChild(iframe);
        };
        
        document.body.appendChild(iframe);
    } catch (error) {
        console.error('Error in fetchCountViaIframe:', error);
        updateCounter(0);
    }
} 