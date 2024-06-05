/**
 * Enum representing different domains within the application.
 * Each domain corresponds to a specific area of functionality or service.
 */
export enum DomainsEnum {
  JOB_DOMAIN = 'onest:work-opportunities', // Domain for job-related services
  COURSE_DOMAIN = 'onest:learning-experiences', // Domain for course-related services
  SCHOLARSHIP_DOMAIN = 'onest:financial-support', // Domain for scholarship-related services
  RETAIL_DOMAIN = 'ONDC:RET10', // Domain for retail-related services
}

/**
 * Object mapping domain names to their corresponding identifiers.
 * Used for internal reference and consistency across the application.
 */
export enum xplorDomain {
  COURSE = 'course', // Identifier for course domain
  JOB = 'job', // Identifier for job domain
  SCHOLARSHIP = 'scholarship', // Identifier for scholarship domain
  RETAIL = 'retail', // Identifier for retail domain
}

export enum Languages {
  ENGLISH = 'en',
  HINDI = 'hi',
  PUNJABI = 'pa',
  PORTUGUESE = 'pt',
  SPANISH = 'es',
}
