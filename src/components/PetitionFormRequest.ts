interface SignPetitionParams {
  petitionUuid: string;
  parliamentName: string;
  parliamentEmail: string;
  // This should be a Blob (e.g. File) or base64-encoded string converted to Blob
  parliamentSignature: Blob;
}

async function fetchSignPetition(params: SignPetitionParams, token: string = '123') {
  const url = `https://api.lp4q.org/api/petitions/sign-petition`;

  params.set('parliament_agree_checkbox', 1);
  // Perform the request
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      // Note: Do NOT set Content-Type here; the browser will add the correct boundary automatically
      Authorization: `Bearer ${token}`,
    },
    body: params,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sign-petition failed: ${response.status} – ${errorText}`);
  }

  return response.json();
}

// Helper functions for cookie management
function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Helper function to get translation messages
function getTranslation(key: string, fallback: string = ''): string {
  return (window as any)?.signature_translations?.[key] || fallback;
}

// Helper function to display validation messages
function showValidationMessage(message: string, isError: boolean = true) {
  const validationDiv = document.getElementById('validationMessages');
  if (validationDiv) {
    validationDiv.innerHTML = `
      <div class="p-4 rounded-md ${isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-primary border border-green-200'}">
        <div class="flex">
          <div class="flex-shrink-0">
            ${
              isError
                ? '<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>'
                : '<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>'
            }
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">${message}</p>
          </div>
        </div>
      </div>
    `;
    validationDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Helper function to clear validation messages
function clearValidationMessage() {
  const validationDiv = document.getElementById('validationMessages');
  if (validationDiv) {
    validationDiv.innerHTML = '';
  }
}

// Helper function to show thank you message in place of form
function showThankYouMessage(userName: string) {
  const formEl = document.getElementById('petition_form') as HTMLFormElement;
  if (formEl) {
    const thankYouMessage = getTranslation(
      'thank_you_message',
      `Thank you ${userName}! Your signature has been submitted.`
    );
    const alreadySignedMessage = getTranslation('already_signed_message', 'You have already signed this petition.');
    // Remove the form and replace it with the thank you message
    const thankYouDiv = document.createElement('div');
    thankYouDiv.className = 'w-full py-12 mx-auto text-center';
    thankYouDiv.innerHTML = `
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
      <svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">${thankYouMessage}</h3>
      <p class="text-gray-600 mb-6">${alreadySignedMessage}</p>
      <div class="text-sm text-gray-500">
      <p>${getTranslation('signature_recorded', 'Your signature has been recorded and will be included in our petition.')}</p>
      </div>
    `;
    formEl.parentNode?.replaceChild(thankYouDiv, formEl);
  }
}

// Check if user has already signed on page load
function checkIfAlreadySigned() {
  const hasSignedCookie = getCookie('petition_signed');
  const userNameCookie = getCookie('petition_signer_name');

  if (hasSignedCookie === 'true' && userNameCookie) {
    showThankYouMessage(userNameCookie);
    return true;
  }
  return false;
}

// Initialize form handling
const formEl = document.getElementById('petition_form') as HTMLFormElement;
if (!formEl) throw new Error('Could not find #petition_form');

// Check if already signed when page loads
const alreadySigned = checkIfAlreadySigned();

// Only add event listener if not already signed
if (!alreadySigned) {
  formEl?.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Clear any previous validation messages
    clearValidationMessage();

    // 1. Grab everything from the form (including file inputs)…
    const data = new FormData(formEl);

    // 2. Pull out individual values
    //    - .get() returns FormDataEntryValue, so you need to cast
    const petitionUuid = data.get('petition_uuid') as string;
    const name = data.get('parliament_name') as string;
    const email = data.get('parliament_email') as string;
    const parliament_type = data.get('parliament_type') as string;
    const country_id = data.get('country_id') as string;
    const phone_number = data.get('phone_number') as string;
    const phone_prefix = data.get('phone_prefix') as string;
    const status = data.get('status') as string;

    // log out all the form data for debugging
    // console.log('Form data:', Object.fromEntries(data.entries()));

    // Validation
    if (
      !petitionUuid ||
      !name ||
      !email ||
      !parliament_type ||
      !country_id ||
      !phone_number ||
      !phone_prefix ||
      !status
    ) {
      const errorMessage = getTranslation('validation_error', 'Please fill out all fields.');
      showValidationMessage(errorMessage, true);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const emailErrorMessage = getTranslation('email_validation_error', 'Please enter a valid email address.');
      showValidationMessage(emailErrorMessage, true);
      return;
    }

    try {
      // Show loading state
      const submitButton = formEl.querySelector('button[type="submit"]') as HTMLButtonElement;
      const originalButtonText = submitButton?.textContent;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = getTranslation('submitting', 'Submitting...');
      }

      // 3. Call your helper…
      const result = await fetchSignPetition(data as unknown as SignPetitionParams);
      console.log('Success:', result);

      // Set cookies to remember the user has signed
      setCookie('petition_signed', 'true', 365);
      setCookie('petition_signer_name', name, 365);

      // Show thank you message
      showThankYouMessage(name);
    } catch (err) {
      console.error(err);

      // Restore button state
      const submitButton = formEl.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }

      // Show error message
      let errorMessage = getTranslation('generic_error', 'Oops! Something went wrong. Please try again.');

      // Try to parse more specific error from response
      if (err instanceof Error && err.message.includes('Sign-petition failed')) {
        if (err.message.includes('400')) {
          errorMessage = getTranslation('validation_server_error', 'Please check your information and try again.');
        } else if (err.message.includes('422')) {
          errorMessage = getTranslation('duplicate_signature_error', 'This signature has already been submitted.');
        } else if (err.message.includes('500')) {
          errorMessage = getTranslation('server_error', 'Server error. Please try again later.');
        }
      }

      showValidationMessage(errorMessage, true);
    }
  });
}
