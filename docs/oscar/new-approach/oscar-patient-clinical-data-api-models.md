# OSCAR Patient Clinical Data APIs

این سند مدل خروجی ۵ سرویس زیر را جمع‌بندی می‌کند:

```text
GET /allergies/active?demographicNo={demographicNo}
GET /rx/prescriptions?demographicNo={demographicNo}
GET /rx/drugs/current/{demographicNo}
GET /preventions/immunizations/{demographicNo}
GET /preventions/active?demographicNo={demographicNo}
```

---

## 1. Active Allergies

### Request

```http
GET /oscar/ws/services/allergies/active?demographicNo=2
```

### Empty Response

```json
{
  "allergies": []
}
```

### Response Model

```json
{
  "allergies": [
    {
      "agccs": 0,
      "agcsp": 0,
      "ageOfOnset": "string",
      "archived": false,
      "demographicNo": 2,
      "description": "Penicillin",
      "drugrefId": "string",
      "entryDate": "2026-08-14T00:00:00Z",
      "hicSeqno": 0,
      "hiclSeqno": 0,
      "id": 1,
      "lastUpdateDate": "2026-08-14T00:00:00Z",
      "lifeStage": "string",
      "onsetOfReaction": "string",
      "position": 0,
      "providerNo": "999998",
      "reaction": "Rash",
      "regionalIdentifier": "string",
      "severityOfReaction": "string",
      "startDate": "2026-08-14T00:00:00Z",
      "typeCode": 0
    }
  ]
}
```

---

## 2. Prescriptions

### Request

```http
GET /oscar/ws/services/rx/prescriptions?demographicNo=2
```

### Empty Response

```json
[]
```

### Response Model

```json
[
  {
    "scriptId": 123,
    "demographicNo": 2,
    "providerNo": 999998,
    "datePrescribed": "2026-08-14T00:00:00Z",
    "datePrinted": "2026-08-14T00:00:00Z",
    "textView": "string",
    "reprintCount": 0
  }
]
```

---

## 3. Current Drugs

### Request

```http
GET /oscar/ws/services/rx/drugs/current/2
```

### Empty Response

این endpoint در نسخه فعلی به‌صورت صفحه‌بندی‌شده پاسخ می‌دهد و در صورت نبود داده، لیست داخلی خالی خواهد بود.

ساختار عمومی پاسخ‌های صفحه‌بندی‌شده OSCAR شامل metadataهایی مانند موارد زیر است:

```json
{
  "offset": 0,
  "limit": 0,
  "total": 0,
  "timestamp": "...",
  "content": []
}
```

> نام دقیق فیلد آرایه در این endpoint باید از return type متد Service استخراج شود؛ مدل آیتم Drug قطعی است.

### Drug Item Model

```json
{
  "drugId": 1,
  "brandName": "string",
  "genericName": "string",
  "customName": "string",
  "gcnSeqNo": 0,
  "atc": "string",
  "regionalIdentifier": "string",
  "demographicNo": 2,
  "providerNo": "999998",
  "takeMin": 1.0,
  "takeMax": 1.0,
  "rxDate": "2026-08-14T00:00:00Z",
  "endDate": "2026-08-21T00:00:00Z",
  "writtenDate": "2026-08-14T00:00:00Z",
  "frequency": "string",
  "duration": 7,
  "durationUnit": "days",
  "route": "string",
  "form": "string",
  "method": "string",
  "prn": false,
  "repeats": 0,
  "quantity": 30,
  "instructions": "string",
  "additionalInstructions": "string",
  "archived": false,
  "archivedReason": null,
  "archivedDate": null,
  "strength": 500.0,
  "strengthUnit": "mg",
  "externalProvider": null,
  "outsideProviderOhip": null,
  "longTerm": false,
  "noSubstitutions": false,
  "dispenseInternal": false,
  "dispenseInterval": null,
  "refillDuration": null,
  "refillQuantity": null,
  "patientCompliance": true,
  "nonAuthoritative": false,
  "pickupDate": null,
  "protocol": null,
  "priorRxProtocol": null,
  "eTreatmentType": null,
  "rxStatus": "string",
  "pharmacyId": null
}
```

---

## 4. Immunizations

### Request

```http
GET /oscar/ws/services/preventions/immunizations/2
```

### Empty Response

```json
{
  "preventions": []
}
```

### Response Model

```json
{
  "preventions": [
    {
      "creatorProviderNo": "999998",
      "deleted": false,
      "demographicId": 2,
      "id": 123,
      "ineligible": false,
      "lastUpdateDate": "2026-08-14T00:00:00Z",
      "never": false,
      "nextDate": "2027-08-14T00:00:00Z",
      "preventionDate": "2026-08-14T00:00:00Z",
      "preventionType": "Influenza",
      "providerNo": "999998",
      "refused": false
    }
  ]
}
```

---

## 5. Active Preventions

### Request

```http
GET /oscar/ws/services/preventions/active?demographicNo=2
```

### Empty Response

```json
{
  "preventions": []
}
```

### Response Model

```json
{
  "preventions": [
    {
      "creatorProviderNo": "999998",
      "deleted": false,
      "demographicId": 2,
      "id": 123,
      "ineligible": false,
      "lastUpdateDate": "2026-08-14T00:00:00Z",
      "never": false,
      "nextDate": "2027-08-14T00:00:00Z",
      "preventionDate": "2026-08-14T00:00:00Z",
      "preventionType": "Influenza",
      "providerNo": "999998",
      "refused": false
    }
  ]
}
```

---

## جمع‌بندی

```text
GET /allergies/active
→ AllergyResponse
→ allergies: AllergyTo1[]

GET /rx/prescriptions
→ PrescriptionTo1[]

GET /rx/drugs/current/{demographicNo}
→ Paginated/Search Response
→ DrugTo1[]

GET /preventions/immunizations/{demographicNo}
→ PreventionResponse
→ preventions: PreventionTo1[]

GET /preventions/active
→ PreventionResponse
→ preventions: PreventionTo1[]
```
