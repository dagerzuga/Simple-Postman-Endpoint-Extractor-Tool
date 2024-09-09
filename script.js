const extractEndpoints = (data) => {
  const endpoints = [];

  const processItem = (item) => {
      if (item.request?.url) {
          const url = item.request.url;
          if (typeof url === 'object' && url.raw) {
              endpoints.push(url.raw);
          } else if (typeof url === 'string') {
              endpoints.push(url);
          }
      }
      if (item.item) {
          item.item.forEach(processItem);
      }
  };

  data.item.forEach(processItem);
  return endpoints;
};

const displayEndpoints = (endpoints) => {
    const endpointList = document.querySelector('.js-endpoint-list');
    const copyAllButton = document.querySelector('.js-copy-all');
    endpointList.innerHTML = '';
    
    if (endpoints.length > 0) {
        copyAllButton.style.display = 'block';
        endpoints.forEach((endpoint, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${endpoint}
                <button class="js-copy-button copy-button" data-endpoint="${endpoint}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            `;
            li.style.animationDelay = `${index * 0.1}s`;
            li.classList.add('fade-in');
            endpointList.appendChild(li);
        });
    } else {
        copyAllButton.style.display = 'none';
        const li = document.createElement('li');
        li.textContent = 'No endpoints found.';
        endpointList.appendChild(li);
    }
};

const handleFileSelect = async (file) => {
  if (!file) {
      alert('Please select a file first.');
      return;
  }

  try {
      const content = await file.text();
      const data = JSON.parse(content);
      const endpoints = extractEndpoints(data);
      displayEndpoints(endpoints);
  } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please make sure it\'s a valid JSON file.');
  }
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
      showToast('Content copied!');
  }, (err) => {
      console.error('Could not copy text: ', err);
  });
};

const showToast = (message) => {
  const toast = document.querySelector('.js-toast');
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add('show');
  setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
          toast.hidden = true;
      }, 300);
  }, 3000);
};

document.addEventListener('DOMContentLoaded', () => {
    const extractButton = document.querySelector('.js-extract-button');
    const fileInput = document.querySelector('.js-file-input');
    const fileLabel = document.querySelector('.file-label-text');
    const copyAllButton = document.querySelector('.js-copy-all');

  fileInput.addEventListener('change', (event) => {
      const fileName = event.target.files[0]?.name;
      fileLabel.textContent = fileName || 'Choose a Postman collection file';
  });

  extractButton.addEventListener('click', () => {
      extractButton.textContent = 'Extracting...';
      extractButton.disabled = true;

      setTimeout(() => {
          handleFileSelect(fileInput.files[0]);
          extractButton.textContent = 'Extract Endpoints';
          extractButton.disabled = false;
      }, 1000);
  });

  document.addEventListener('click', (event) => {
      if (event.target.closest('.js-copy-button')) {
          const button = event.target.closest('.js-copy-button');
          const endpoint = button.dataset.endpoint;
          copyToClipboard(endpoint);
      }
  });

  copyAllButton.addEventListener('click', () => {
      const endpoints = Array.from(document.querySelectorAll('.js-endpoint-list li'))
          .map(li => li.textContent.trim())
          .join('\n');
      copyToClipboard(endpoints);
  });
});
