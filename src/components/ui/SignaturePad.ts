// Types
interface SignaturePadConfig {
  name: string;
  canvasId: string;
  fileInputId: string;
  translations: {
    validation: {
      required: string;
      invalidFormat: string;
      imageTooBig: string;
      imageLoadError: string;
    };
  };
}

interface Position {
  x: number;
  y: number;
}

class SignaturePad {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private hiddenFileInput: HTMLInputElement;
  private uploadFileInput: HTMLInputElement;
  private drawSection: HTMLElement;
  private uploadSection: HTMLElement;
  private previewContainer: HTMLElement;
  private previewImg: HTMLImageElement;
  private validationDiv: HTMLElement;
  private config: SignaturePadConfig;

  private isDrawing: boolean = false;
  private hasSignature: boolean = false;
  private currentMethod: 'draw' | 'upload' = 'draw';

  constructor(container: HTMLElement, config: SignaturePadConfig) {
    this.container = container;
    this.config = config;
    this.initializeElements();
    this.initializeCanvas();
    this.bindEvents();

    // Store instance on container for external access
    (this.container as any).signaturePad = this;
  }

  private initializeElements(): void {
    this.canvas = this.container.querySelector(`#${this.config.canvasId}`) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas with id ${this.config.canvasId} not found`);
    }

    this.ctx = this.canvas.getContext('2d')!;
    this.hiddenFileInput = this.container.querySelector('.signature-file-input') as HTMLInputElement;
    this.uploadFileInput = this.container.querySelector('.signature-upload-input') as HTMLInputElement;
    this.drawSection = this.container.querySelector('[data-method="draw"]') as HTMLElement;
    this.uploadSection = this.container.querySelector('[data-method="upload"]') as HTMLElement;
    this.previewContainer = this.container.querySelector('.signature-preview') as HTMLElement;
    this.previewImg = this.container.querySelector('.signature-preview-img') as HTMLImageElement;
    this.validationDiv = this.container.querySelector('.signature-validation') as HTMLElement;
  }

  private initializeCanvas(): void {
    // Set canvas size to match the displayed size
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;

    // Set the actual canvas size
    this.canvas.width = displayWidth;
    this.canvas.height = displayHeight;

    // Set up drawing context
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // DON'T fill with white background - leave transparent
    // this.ctx.fillStyle = '#fff';
    // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    console.log('Canvas initialized:', {
      width: this.canvas.width,
      height: this.canvas.height,
      displayWidth,
      displayHeight,
    });
  }

  private bindEvents(): void {
    // Method toggle
    const radioButtons = this.container.querySelectorAll('.method-radio') as NodeListOf<HTMLInputElement>;
    radioButtons.forEach((radio) => {
      radio.addEventListener('change', (e) => {
        console.log('Method changed to:', radio.value);
        if (radio.checked) {
          this.toggleMethod(radio.value as 'draw' | 'upload');
        }
      });
    });

    // Canvas events
    this.bindCanvasEvents();

    // Clear button
    const clearBtn = this.container.querySelector('[data-action="clear"]') as HTMLElement;
    clearBtn?.addEventListener('click', () => {
      console.log('Clear button clicked');
      this.clearSignature();
    });

    // Remove button
    const removeBtn = this.container.querySelector('[data-action="remove"]') as HTMLElement;
    removeBtn?.addEventListener('click', () => this.removeUploadedImage());

    // File upload
    this.uploadFileInput?.addEventListener('change', (e) => this.handleFileUpload(e));
  }

  private bindCanvasEvents(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => {
      console.log('Mouse down:', e);
      this.startDrawing(e);
    });
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDrawing) {
        this.draw(e);
      }
    });
    this.canvas.addEventListener('mouseup', () => {
      console.log('Mouse up');
      this.stopDrawing();
    });
    this.canvas.addEventListener('mouseleave', () => {
      console.log('Mouse leave');
      this.stopDrawing();
    });

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      console.log('Touch start:', e);
      this.startDrawing(e);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.isDrawing) {
        this.draw(e);
      }
    });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      console.log('Touch end');
      this.stopDrawing();
    });
  }

  private toggleMethod(method: 'draw' | 'upload'): void {
    console.log('Toggling method to:', method);
    this.currentMethod = method;
    this.clearValidation();

    if (method === 'draw') {
      this.drawSection.classList.remove('hidden');
      this.uploadSection.classList.add('hidden');
      this.uploadFileInput.removeAttribute('required');
      this.uploadFileInput.setAttribute('required','true');
      this.hiddenFileInput.required = true;
      this.removeUploadedImage();

      // Re-initialize canvas when switching to draw mode
      setTimeout(() => {
        this.initializeCanvas();
      }, 100);
    } else {
      this.drawSection.classList.add('hidden');
      this.uploadSection.classList.remove('hidden');
      this.hiddenFileInput.removeAttribute('required');
      this.uploadFileInput.setAttribute('required','true');
      this.clearSignature();
    }
  }

  private getPosition(e: MouseEvent | TouchEvent): Position {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    console.log('Position:', { x, y, rect });
    return { x, y };
  }

  private startDrawing(e: MouseEvent | TouchEvent): void {
    if (this.currentMethod !== 'draw') return;

    console.log('Starting drawing');
    this.isDrawing = true;
    const pos = this.getPosition(e);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
    this.clearValidation();
  }

  private draw(e: MouseEvent | TouchEvent): void {
    if (!this.isDrawing || this.currentMethod !== 'draw') return;

    const pos = this.getPosition(e);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();

    if (!this.hasSignature) {
      this.hasSignature = true;
      console.log('First signature mark detected');
    }
  }

  private stopDrawing(): void {
    if (this.isDrawing) {
      console.log('Stopping drawing');
      this.isDrawing = false;
      this.ctx.beginPath(); // Reset path
      if (this.hasSignature) {
        this.updateHiddenInput();
      }
    }
  }

  private clearSignature(): void {
    console.log('Clearing signature');
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // DON'T refill with white background - leave transparent
    // this.ctx.fillStyle = '#fff';
    // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.hasSignature = false;
    this.updateHiddenInput();
    this.clearValidation();
  }

  private handleFileUpload(e: Event): void {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showValidation(this.config.translations.validation.invalidFormat);
      target.value = '';
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      this.showValidation(this.config.translations.validation.imageTooBig);
      target.value = '';
      return;
    }

    const img = new Image();
    img.onload = () => {
      this.previewImg.src = URL.createObjectURL(file);
      this.previewContainer.classList.remove('hidden');
      this.updateHiddenInput(file);
      this.clearValidation();
    };

    img.onerror = () => {
      this.showValidation(this.config.translations.validation.imageLoadError);
      target.value = '';
    };

    img.src = URL.createObjectURL(file);
  }

  private removeUploadedImage(): void {
    this.uploadFileInput.value = '';
    this.previewContainer.classList.add('hidden');
    if (this.previewImg.src && this.previewImg.src.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewImg.src);
    }
    this.updateHiddenInput();
    this.clearValidation();
  }

  private updateHiddenInput(file?: File): void {
    if (this.currentMethod === 'draw' && this.hasSignature) {
      // Convert canvas to blob and create a file
      this.canvas.toBlob((blob) => {
        if (blob) {
          const signatureFile = new File([blob], 'signature.png', { type: 'image/png' });
          this.setFileToInput(signatureFile);
        }
      }, 'image/png');
    } else if (this.currentMethod === 'upload' && file) {
      this.setFileToInput(file);
    } else {
      // Clear the input
      this.hiddenFileInput.value = '';
      // Create empty FileList
      const dataTransfer = new DataTransfer();
      this.hiddenFileInput.files = dataTransfer.files;
    }
  }

  private setFileToInput(file: File): void {
    try {
      // Create a new FileList with the file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      this.hiddenFileInput.files = dataTransfer.files;

      // Trigger change event for form validation
      this.hiddenFileInput.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (error) {
      console.error('Error setting file to input:', error);
    }
  }

  private showValidation(message: string): void {
    this.validationDiv.textContent = message;
    this.validationDiv.classList.remove('hidden');
  }

  private clearValidation(): void {
    this.validationDiv.classList.add('hidden');
    this.validationDiv.textContent = '';
  }

  public validate(): boolean {
    const hasDrawnSignature = this.currentMethod === 'draw' && this.hasSignature;
    const hasUploadedSignature = this.currentMethod === 'upload' && this.uploadFileInput.files?.length;

    if (!hasDrawnSignature && !hasUploadedSignature) {
      this.showValidation(this.config.translations.validation.required);
      return false;
    }

    this.clearValidation();
    return true;
  }
}

// Initialize all signature pads on the page
function initializeSignaturePads() {
  console.log('Initializing signature pads...');
  const containers = document.querySelectorAll('.signature-pad-container');
  console.log('Found containers:', containers.length);

  containers.forEach((container, index) => {
    console.log(`Initializing container ${index + 1}...`);

    // Skip if already initialized
    if ((container as any).signaturePad) {
      console.log('Already initialized, skipping...');
      return;
    }

    const hiddenInput = container.querySelector('.signature-file-input') as HTMLInputElement;
    const canvas = container.querySelector('.signature-canvas') as HTMLCanvasElement;

    console.log('Found elements:', { hiddenInput: !!hiddenInput, canvas: !!canvas });

    if (hiddenInput && canvas) {
      const config: SignaturePadConfig = {
        name: hiddenInput.name,
        canvasId: canvas.id,
        fileInputId: hiddenInput.id,
        translations: {
          validation: {
            required: 'Signature is required',
            invalidFormat: 'Please upload a valid image file',
            imageTooBig: 'Image file is too large (max 5MB)',
            imageLoadError: 'Error loading image',
          },
        },
      };

      try {
        new SignaturePad(container as HTMLElement, config);
        console.log('SignaturePad initialized successfully');
      } catch (error) {
        console.error('Error initializing signature pad:', error);
      }
    }
  });
}

// Initialize on DOM content loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSignaturePads);
} else {
  initializeSignaturePads();
}

// Also initialize on navigation (for Astro view transitions)
document.addEventListener('astro:page-load', initializeSignaturePads);

// Export for external validation
(window as any).validateSignaturePads = () => {
  const containers = document.querySelectorAll('.signature-pad-container');
  let allValid = true;

  containers.forEach((container) => {
    const signaturePad = (container as any).signaturePad;
    if (signaturePad && !signaturePad.validate()) {
      allValid = false;
    }
  });

  return allValid;
};
