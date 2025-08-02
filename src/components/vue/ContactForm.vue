<!-- src/components/vue/ContactForm.vue -->
<template>
    <div class="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
      <div class="mb-8 text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ texts.title }}</h2>
        <p class="text-gray-600 dark:text-gray-400">{{ texts.subtitle }}</p>
      </div>
  
      <div 
        v-if="showSuccess" 
        class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800">{{ texts.success }}</p>
          </div>
        </div>
      </div>
  
     
      <div 
        v-if="errorMessage" 
        class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
          </div>
        </div>
      </div>
  
      <form @submit.prevent="submitForm" class="space-y-6">
    
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ texts.fields.name }} <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            :class="[
              'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent transition-colors',
              'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
              'placeholder-gray-500 dark:placeholder-gray-400',
              errors.name ? 'border-red-500 focus:ring-red-500' : ''
            ]"
            :placeholder="texts.placeholders.name"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
        </div>
  
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ texts.fields.email }} <span class="text-red-500">*</span>
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            :class="[
              'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent transition-colors',
              'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
              'placeholder-gray-500 dark:placeholder-gray-400',
              errors.email ? 'border-red-500 focus:ring-red-500' : ''
            ]"
            :placeholder="texts.placeholders.email"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>
  
        <div>
          <label for="subject" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ texts.fields.subject }}
          </label>
          <input
            id="subject"
            v-model="form.subject"
            type="text"
            :class="[
              'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent transition-colors',
              'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
              'placeholder-gray-500 dark:placeholder-gray-400'
            ]"
            :placeholder="texts.placeholders.subject"
          />
        </div>
  
        <div>
          <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ texts.fields.message }} <span class="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            v-model="form.message"
            required
            rows="5"
            :class="[
              'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent transition-colors resize-vertical',
              'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
              'placeholder-gray-500 dark:placeholder-gray-400',
              errors.message ? 'border-red-500 focus:ring-red-500' : ''
            ]"
            :placeholder="texts.placeholders.message"
          ></textarea>
          <p v-if="errors.message" class="mt-1 text-sm text-red-600">{{ errors.message }}</p>
        </div>
  
       
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="privacy"
              v-model="form.privacy"
              type="checkbox"
              required
              class="w-4 h-4 text-primary-light bg-gray-100 border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary-light dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div class="ml-3 text-sm">
            <label for="privacy" class="text-gray-600 dark:text-gray-400">
              {{ texts.fields.privacy }} <span class="text-red-500">*</span>
            </label>
          </div>
        </div>
        <p v-if="errors.privacy" class="text-sm text-red-600">{{ errors.privacy }}</p>
  
       
        <div>
          <button
            type="submit"
            :disabled="isSubmitting"
            :class="[
              'w-full px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200',
              'bg-primary hover:bg-primary-dark focus:ring-4 focus:ring-primary-light focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isSubmitting ? 'bg-gray-400' : ''
            ]"
          >
            <span v-if="!isSubmitting" class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
              {{ texts.buttons.submit }}
            </span>
            <span v-else class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ texts.buttons.submitting }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed } from 'vue'
  
  
  const props = defineProps({
    locale: {
      type: String,
      default: 'ar'
    },
    apiEndpoint: {
      type: String,
      default: '/api/contact'
    }
  })
  
 
  const form = reactive({
    name: '',
    email: '',
    subject: '',
    message: '',
    privacy: false
  })
  
  const errors = reactive({
    name: '',
    email: '',
    subject: '',
    message: '',
    privacy: ''
  })
  
  const isSubmitting = ref(false)
  const showSuccess = ref(false)
  const errorMessage = ref('')
  
  
  const texts = computed(() => {
    const translations = {
      ar: {
        title: 'تواصل معنا',
        subtitle: 'نحن هنا للإجابة على استفساراتكم ومساعدتكم',
        fields: {
          name: 'الاسم الكامل',
          email: 'البريد الإلكتروني',
          subject: 'الموضوع',
          message: 'الرسالة',
          privacy: 'أوافق على سياسة الخصوصية وأذن بمعالجة بياناتي'
        },
        placeholders: {
          name: 'أدخل اسمك الكامل',
          email: 'أدخل بريدك الإلكتروني',
          subject: 'موضوع الرسالة',
          message: 'اكتب رسالتك هنا...'
        },
        buttons: {
          submit: 'إرسال الرسالة',
          submitting: 'جاري الإرسال...'
        },
        success: 'تم إرسال رسالتك بنجاح! سنقوم بالرد عليك قريباً.',
        errors: {
          required: 'هذا الحقل مطلوب',
          email: 'يرجى إدخال بريد إلكتروني صحيح',
          privacy: 'يجب الموافقة على سياسة الخصوصية',
          server: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.'
        }
      },
      en: {
        title: 'Contact Us',
        subtitle: 'We\'re here to answer your questions and help you',
        fields: {
          name: 'Full Name',
          email: 'Email Address',
          subject: 'Subject',
          message: 'Message',
          privacy: 'I agree to the privacy policy and authorize processing of my data'
        },
        placeholders: {
          name: 'Enter your full name',
          email: 'Enter your email address',
          subject: 'Message subject',
          message: 'Write your message here...'
        },
        buttons: {
          submit: 'Send Message',
          submitting: 'Sending...'
        },
        success: 'Your message has been sent successfully! We\'ll get back to you soon.',
        errors: {
          required: 'This field is required',
          email: 'Please enter a valid email address',
          privacy: 'You must agree to the privacy policy',
          server: 'An error occurred while sending the message. Please try again.'
        }
      }
    }
    
    return translations[props.locale] || translations.en
  })
  

  const validateForm = () => {
   
    Object.keys(errors).forEach(key => {
      errors[key] = ''
    })
  
    let isValid = true
  
    
    if (!form.name.trim()) {
      errors.name = texts.value.errors.required
      isValid = false
    }
  
  
    if (!form.email.trim()) {
      errors.email = texts.value.errors.required
      isValid = false
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.email)) {
        errors.email = texts.value.errors.email
        isValid = false
      }
    }
  
    
    if (!form.message.trim()) {
      errors.message = texts.value.errors.required
      isValid = false
    }
  
   
    if (!form.privacy) {
      errors.privacy = texts.value.errors.privacy
      isValid = false
    }
  
    return isValid
  }
  
  const resetForm = () => {
    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
    form.privacy = false
    
    Object.keys(errors).forEach(key => {
      errors[key] = ''
    })
  }
  
  const submitForm = async () => {
    if (!validateForm()) return
  
    isSubmitting.value = true
    errorMessage.value = ''
    showSuccess.value = false
  
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('email', form.email)
      formData.append('subject', form.subject)
      formData.append('message', form.message)
      formData.append('locale', props.locale)
  
      const response = await fetch(props.apiEndpoint, {
        method: 'POST',
        body: formData
      })
  
      if (response.ok) {
        showSuccess.value = true
        resetForm()

        setTimeout(() => {
          showSuccess.value = false
        }, 5000)
      } else {
        throw new Error('Server error')
      }
    } catch (error) {
      errorMessage.value = texts.value.errors.server
      console.error('Contact form error:', error)
    } finally {
      isSubmitting.value = false
    }
  }
  </script>
  
  <style scoped>
  
  :dir(rtl) .ml-3 {
    margin-left: 0;
    margin-right: 0.75rem;
  }
  
  :dir(rtl) .mr-2 {
    margin-right: 0;
    margin-left: 0.5rem;
  }
  
  
  .focus\:ring-primary-light:focus {
    --tw-ring-color: hsl(178, 100%, 32%);
  }
  
  @media (prefers-color-scheme: dark) {
    .dark\:bg-slate-900 {
      background-color: hsl(var(--aw-color-bg-page-dark));
    }
  }
  </style>