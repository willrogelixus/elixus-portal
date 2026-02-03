
export type AppState = 'AUTH' | 'INTRO' | 'DASHBOARD' | 'FORM' | 'CONFIRMATION' | 'RESET_PASSWORD';

export interface FormData {
  // Section 1: Legal Business Details
  legalBusinessName: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  zipPostalCode: string;
  country: string;
  businessPhone: string;
  businessEmail: string;
  businessWebsite: string;

  // Section 2: Authorised Representative
  firstName: string;
  lastName: string;
  directEmail: string;
  jobTitle: string;
  jobTitleOther: string;
  directPhone: string;

  // Section 3: Business Classification
  legalEntityType: string;
  legalEntityOther: string;
  businessIndustry: string;
  industryOther: string;
  taxIdEin: string;

  // Section 4: Compliance Assets
  privacyPolicyUrl: string;
  termsConditionsUrl: string;
  optInFormUrl: string;
}

export const INITIAL_FORM_DATA: FormData = {
  legalBusinessName: '',
  streetAddress: '',
  city: '',
  stateProvince: '',
  zipPostalCode: '',
  country: 'United States',
  businessPhone: '',
  businessEmail: '',
  businessWebsite: '',
  firstName: '',
  lastName: '',
  directEmail: '',
  jobTitle: '',
  jobTitleOther: '',
  directPhone: '',
  legalEntityType: '',
  legalEntityOther: '',
  businessIndustry: '',
  industryOther: '',
  taxIdEin: '',
  privacyPolicyUrl: '',
  termsConditionsUrl: '',
  optInFormUrl: '',
};
