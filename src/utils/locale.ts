import { z } from 'zod';

// 1. Define your schema
export const LocaleSchema = z.object({
  meta: z.object({
    title: z.string(),
    description: z.string(),
  }),

  menu: z.array(
    z.object({
      label: z.string(),
      link: z.string(),
    })
  ),

  podcast: z.object({
    title: z.string(),
    subtitle: z.string(),
    desc: z.string(),
    join: z.string(),
    fullTitle: z.string(),
  }),

  petitions: z.object({
    latestSignatures: z.string(),
    signatures: z.string(),
    published_at: z.string(),
    expires_at: z.string(),
    goal: z.string(),
    signButton: z.string(),
    cta: z.object({
      title: z.string(),
      subtitle: z.string(),
    }),
  }),

  states: z.object({
    loading: z.string(),
  }),

  signature: z.object({
    thank_you_message: z.string(),
    already_signed_message: z.string(),
    signature_recorded: z.string(),
    validation_error: z.string(),
    email_validation_error: z.string(),
    submitting: z.string(),
    generic_error: z.string(),
    validation_server_error: z.string(),
    duplicate_signature_error: z.string(),
    server_error: z.string(),
    title: z.string(),
    fields: z.object({
      name: z.object({
        label: z.string(),
        placeholder: z.string(),
      }),
      email: z.object({
        label: z.string(),
        placeholder: z.string(),
      }),
      signature: z.object({
        label: z.string(),
        uploadSignature: z.string(),
      }),
      phone: z.object({
        label: z.string(),
        placeholder: z.string(),
      }),
      previousParliamentDesignation: z.object({
        label: z.string(),
      }),
      currentParliamentDesignation: z.object({
        label: z.string(),
      }),
      country: z.object({
        label: z.string(),
      }),
    }),
    actions: z.object({
      draw: z.string(),
      upload: z.string(),
      clear: z.string(),
      remove: z.string(),
      submit: z.string(),
    }),
    instructions: z.object({
      drawSignature: z.string(),
      uploadSignature: z.string(),
    }),
    validation: z.object({
      parliament_name: z.object({ required: z.string() }),
      parliament_email: z.object({
        required: z.string(),
        invalid: z.string(),
      }),
      country_id: z.object({ required: z.string() }),
      phone_prefix: z.object({ required: z.string() }),
      phone_number: z.object({
        required: z.string(),
        invalid: z.string(),
      }),
    }),
  }),

  header: z.object({
    live: z.string(),
    search: z.string(),
    login: z.string(),
    logout: z.string(),
    register: z.string(),
    monthlyReport: z.string(),
    donate: z.string(),
    sections: z.array(
      z.object({
        title: z.string(),
        path: z.string(),
      })
    ),
  }),

  lastNews: z.object({
    readMore: z.string(),
    title: z.string(),
    desc: z.string(),
  }),

  activity: z.object({
    title: z.string(),
    desc: z.string(),
  }),

  media: z.object({
    title: z.string(),
    desc: z.string(),
  }),

  press: z.object({
    title: z.string(),
    desc: z.string(),
  }),

  quote: z.object({
    title: z.string(),
    desc: z.string(),
  }),

  subscribe: z.object({
    title: z.string(),
    email: z.string(),
    subBtn: z.string(),
    thankyou: z.string(),
    close: z.string(),
    error: z.string(),
    success: z.string(),
    already: z.string(),
  }),

  footer: z.object({
    rights: z.string(),
    members: z.string(),
  }),

  otherPage: z.object({
    title: z.string(),
    subtitle: z.string(),
    desc: z.string(),
  }),
});

// 2. Infer TypeScript type
export type LocaleSchema = z.infer<typeof LocaleSchema>;

// 3. Validation helper
export function validateLocaleSchema(raw: unknown): LocaleSchema {
  return LocaleSchema.parse(raw);
}