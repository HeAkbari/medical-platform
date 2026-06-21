import {
  referenceId,
  type FhirDocumentReference,
} from '@medical-platform/domain';
import { conceptLabel } from './fhir-format';
import type { DocumentDetail, DocumentRecord } from './clinical-record-types';

function formatBytes(size?: number): string | undefined {
  if (size === undefined) {
    return undefined;
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function title(resource: FhirDocumentReference): string {
  return (
    resource.content?.[0]?.attachment?.title ??
    conceptLabel(resource.type) ??
    'Document'
  );
}

export function fhirDocumentToRecord(
  resource: FhirDocumentReference
): DocumentRecord {
  return {
    id: resource.id ?? '',
    title: title(resource),
    type: conceptLabel(resource.type),
    date: resource.date,
    patientId: referenceId(resource.subject?.reference),
  };
}

export function fhirDocumentToDetail(
  resource: FhirDocumentReference
): DocumentDetail {
  const attachment = resource.content?.[0]?.attachment;

  return {
    ...fhirDocumentToRecord(resource),
    status: resource.status,
    docStatus: resource.docStatus,
    category: conceptLabel(resource.category?.[0]),
    author: resource.author?.[0]?.display,
    custodian: resource.custodian?.display,
    description: resource.description,
    contentType: attachment?.contentType,
    fileTitle: attachment?.title,
    fileSize: formatBytes(attachment?.size),
    fileUrl: attachment?.url,
  };
}
