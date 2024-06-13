import { IUserInfo } from '../interfaces/user-info';

export const searchConstants = {
  action: 'search',
  ttl: 'PT1M',
};
export const stgAction = {
  search: 'search',
  select: 'select',
  init: 'init',
  confirm: 'confirm',
  status: 'status',
};
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
export const xplorDomain = {
  course: 'course', // Identifier for course domain
  job: 'job', // Identifier for job domain
  scholarship: 'scholarship', // Identifier for scholarship domain
  retail: 'retail', // Identifier for retail domain
};

export const initConstants = {
  form_url: 'https://implementation-layer-dev.thewitslab.com/applicationForm',
};

export const fulfillments = [
  {
    id: '1234',
    customer: {
      person: {
        name: 'Jane Doe',
        age: '13',
        gender: 'female',
        tags: [
          {
            descriptor: {
              code: 'professional-details',
              name: 'Professional Details',
            },
            list: [
              {
                descriptor: {
                  code: 'profession',
                  name: 'profession',
                },
                value: 'student',
              },
            ],
            display: true,
          },
        ],
      },
      contact: {
        phone: '+91-9663088848',
        email: 'jane.doe@example.com',
      },
    },
  },
];

export const confirmFulfillments = (user: IUserInfo) => [
  {
    id: '1234',
    customer: {
      person: {
        name: user?.kyc?.firstName + ' ' + user?.kyc?.lastName || 'Jane Doe',
        age: '13',
        gender: user?.kyc?.gender || 'Male',
        tags: [
          {
            descriptor: {
              code: 'professional-details',
              name: 'Professional Details',
            },
            list: [
              {
                descriptor: {
                  code: 'profession',
                  name: 'profession',
                },
                value: 'student',
              },
            ],
            display: true,
          },
        ],
      },
      contact: {
        phone: user?.phoneNumber || '+91-9663088848',
        email: user?.kyc?.email || 'jane.doe@example.com',
      },
    },
  },
];
export const billing = {
  id: '{{$randomUUID}}',
  name: 'Jane Doe',
  phone: '+91-9663088848',
  email: 'jane.doe@example.com',
  address: 'No 27, XYZ Lane, etc',
};

export const confirmBilling = (user: IUserInfo) => ({
  id: '{{$randomUUID}}',
  name: user?.kyc?.firstName + ' ' + user?.kyc?.lastName || 'Jane Doe',
  phone: user?.phoneNumber || '+91-9663088848',
  email: user?.kyc?.email || 'jane.doe@example.com',
  address: user?.kyc?.address || 'No 27, XYZ Lane, etc',
});

export enum OrderStatus {
  NOT_STARTED = 'NOT_STARTED',
  STARTED = 'STARTED',
  IN_PROGRESS = 'IN-PROGRESS',
  COMPLETED = 'COMPLETED',
  SUBMITTED = 'SUBMITTED',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  TILL_IN_PROGRESS = 'TILL_IN_PROGRESS',
}
