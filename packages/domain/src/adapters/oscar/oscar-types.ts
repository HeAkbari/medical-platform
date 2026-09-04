/**
 * `GET /providerService/providers_json` (paginated list, `OscarPaginated<OscarProvider>`)
 * / `.../provider/{id}` (single object) — verified live against the sponsor
 * sandbox. `providers_json` replaced the WADL-default `providers` endpoint,
 * which only ever produced XML.
 */
export interface OscarProvider {
  providerNo: number | string;
  firstName: string;
  lastName: string;
  name?: string;
  comments?: string;
  phone: string;
  billingNo?: string | null;
  workPhone?: string;
  address?: {
    province: string | null;
    postal: string | null;
    city: string | null;
    address: string;
  };
  team?: string;
  // `true`/`false` in the verified sample — not the `status` code the design
  // doc originally guessed at.
  enabled?: boolean;
  providerType: string;
  sex?: string | null;
  ohipNo?: string | null;
  specialty: string;
  dob?: string | null;
  hsoNo?: string | null;
  providerActivity?: string;
  rmaNo?: string | null;
  signedConfidentiality?: number | null;
  practitionerNo?: string | null;
  practitionerNoType?: string | null;
  email: string;
  title?: string | null;
  lastUpdateUser?: string;
  lastUpdateDate?: number;
}

/** `POST /schedule/{demographicNo}/appointmentHistory` item — verified shape (endpoint itself currently 500s live, see docs/oscar/new-approach/oscar-appointment-query-apis.md). */
export interface OscarAppointmentTo1 {
  id: number;
  providerNo: string;
  appointmentDate: string;
  startTime: string;
  endTime?: string;
  name: string;
  demographicNo: number;
  notes: string;
  reason: string;
  status: string;
}

export interface OscarSchedulingResponse {
  appointments: OscarAppointmentTo1[] | null;
}

/** `GET /schedule/fetchProviderAppts/{providerNo}/{sDate}/{eDate}` item — verified live. */
export interface OscarProviderPeriodAppsTo {
  appointmentNo: number;
  providerNo: string;
  appointmentDate: string;
  demographicNo: number;
  notes: string;
  status: string;
  name: string;
}

export interface OscarPaginated<T> {
  offset: number;
  limit: number;
  total: number;
  content: T[];
}

/**
 * `GET /schedule/{providerNo}/day/{date}` item — verified live (2026-09-01,
 * see docs/oscar/new-approach/oscar-appointment-query-apis.md). NOTE: no
 * `appointmentDate` field despite the old (pre-verification) guess — the day
 * comes from the request's own `date` path param, not from this item; `date`
 * here is an epoch-ms timestamp whose exact meaning is unverified and
 * intentionally unused (see oscarDayApptToDomain). `startTime` is 12-hour
 * ("10:00 AM"), `duration` is a string like "14m ".
 */
export interface OscarDayApptItem {
  appointmentNo?: number;
  id?: number;
  providerNo?: string;
  demographicNo?: number;
  date?: number;
  startTime?: string;
  duration?: string;
  type?: string;
  notes?: string;
  status?: string;
  name?: string;
}

/**
 * `GET /allergies/active?demographicNo=` — verified live response model, see
 * docs/oscar/new-approach/oscar-patient-clinical-data-api-models.md §1.
 */
export interface OscarAllergy {
  id: number;
  demographicNo: number;
  description: string;
  reaction?: string;
  severityOfReaction?: string;
  onsetOfReaction?: string;
  startDate?: string;
  entryDate?: string;
  archived: boolean;
  providerNo: string;
}

export interface OscarAllergyResponse {
  allergies: OscarAllergy[];
}

/**
 * `GET /rx/drugs/current/{demographicNo}` / `/rx/drugs/archived/{demographicNo}`
 * item — verified live response model (§3). The exact paginated wrapper
 * field name for this specific endpoint isn't 100% confirmed (doc note:
 * "باید از return type متد Service استخراج شود") — assumed `content` to
 * match every other paginated OSCAR endpoint verified so far; recheck
 * against real data if this comes back wrong.
 */
export interface OscarDrug {
  drugId: number;
  demographicNo: number;
  providerNo: string;
  brandName?: string;
  genericName?: string;
  customName?: string;
  rxDate?: string;
  endDate?: string | null;
  writtenDate?: string;
  frequency?: string;
  duration?: number;
  durationUnit?: string;
  route?: string;
  form?: string;
  repeats?: number;
  quantity?: number;
  instructions?: string;
  additionalInstructions?: string;
  archived: boolean;
  rxStatus?: string;
}

/**
 * `GET /preventions/immunizations/{demographicNo}` / `/preventions/active` —
 * verified live response model (§4/§5).
 */
export interface OscarPrevention {
  id: number;
  demographicId: number;
  preventionType: string;
  preventionDate?: string;
  nextDate?: string | null;
  never: boolean;
  refused: boolean;
  ineligible: boolean;
  deleted: boolean;
  providerNo: string;
}

export interface OscarPreventionResponse {
  preventions: OscarPrevention[];
}

/**
 * `GET /dxRegisty/getDiseaseRegistry?demographicNo=` — endpoint confirmed
 * live (returns `[]` for a patient with no registry entries), but the
 * populated item shape has NOT been verified against real data. Kept
 * defensive/loose on purpose — do not trust field names here until a real
 * populated sample is seen (see docs/oscar/new-approach/deferred-items.md §6).
 */
export interface OscarDiseaseRegistryItem {
  id?: number | string;
  demographicNo?: number;
  dxCode?: string;
  codeType?: string;
  description?: string;
  status?: string;
  startDate?: string;
  updateDate?: string;
  providerNo?: string;
  notes?: string;
}

/**
 * `GET /labs/hl7LabsByDemographicNo?demographicNo=&offset=&limit=` —
 * endpoint confirmed live (returns `{"messages":[]}` when empty — note the
 * wrapper key is `messages`, NOT `content` like other paginated OSCAR
 * endpoints). The populated item shape has NOT been verified against real
 * data — kept defensive/loose on purpose (see
 * docs/oscar/new-approach/deferred-items.md §7).
 */
export interface OscarHl7LabMessage {
  id?: number | string;
  demographicNo?: number;
  labType?: string;
  testName?: string;
  dateTime?: string;
  collectedDate?: string;
  status?: string;
  accessionNumber?: string;
}

export interface OscarHl7LabsResponse {
  messages: OscarHl7LabMessage[];
}
