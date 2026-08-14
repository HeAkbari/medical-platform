/** `GET /providerService/providers` (XML list) / `.../provider/{id}` (JSON) — verified live against the sponsor sandbox. */
export interface OscarProvider {
  providerNo: number | string;
  firstName: string;
  lastName: string;
  providerType: string;
  specialty: string;
  email: string;
  phone: string;
  workPhone?: string;
  status: number | string;
}

/** `fast-xml-parser` output shape for the `<List><Item>...</Item></List>` wrapper. */
export interface OscarXmlList<T> {
  List: { Item: T[] };
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
 * `GET /schedule/{providerNo}/day/{date}` item — field names NOT yet fully
 * verified live (see docs/oscar/new-approach/oscar-appointment-query-apis.md);
 * kept loose on purpose until confirmed against real sandbox data.
 */
export interface OscarDayApptItem {
  appointmentNo?: number;
  id?: number;
  providerNo?: string;
  demographicNo?: number;
  appointmentDate?: string;
  startTime?: string;
  notes?: string;
  status?: string;
  name?: string;
}
