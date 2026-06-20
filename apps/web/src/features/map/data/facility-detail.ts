import type {
  FacilityCategory,
  FacilitySuperCategory,
  WeeklyHours,
} from '../types';

/**
 * FHIR-native clinic detail. Unlike `MapFacility` (a lightweight shape for map
 * markers), this aggregates everything FHIR knows about a facility:
 *   Location + Organization + HealthcareService[] + PractitionerRole[].
 */

export interface FacilityAvailableTime {
  days: string[];
  allDay?: boolean;
  start?: string;
  end?: string;
}

export interface FacilityServiceDetail {
  id: string;
  name?: string;
  categories: string[];
  types: string[];
  specialties: string[];
  comment?: string;
  extraDetails?: string;
  appointmentRequired?: boolean;
  referralMethods: string[];
  eligibility: string[];
  programs: string[];
  languages: string[];
  availableTimes: FacilityAvailableTime[];
}

export interface FacilityPractitionerDetail {
  id: string;
  name: string;
  role?: string;
  specialties: string[];
}

export interface FacilityOrganizationDetail {
  id: string;
  name?: string;
  type?: string;
  phone?: string;
  website?: string;
}

export interface FacilityDetail {
  id: string;
  name: string;
  description?: string;
  status?: string;
  category: FacilityCategory;
  superCategory: FacilitySuperCategory;
  subcategory?: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  position: [number, number];
  phone?: string;
  email?: string;
  website?: string;
  hours: WeeklyHours | '24/7';
  isOpenNow: boolean;
  organization?: FacilityOrganizationDetail;
  services: FacilityServiceDetail[];
  practitioners: FacilityPractitionerDetail[];
  source: 'fhir' | 'mock';
}
