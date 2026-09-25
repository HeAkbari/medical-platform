# OSCAR Appointment Query APIs

## 1. نوبت‌های یک پزشک در یک روز

### Request

``` http
GET /oscar/ws/services/schedule/{providerNo}/day/{date}
```

### Path Parameters

``` text
providerNo : string
date       : string
```

### Response

خروجی یک آرایه از `PatientListApptItemBean` است.

اگر نوبتی وجود نداشته باشد:

``` json
[]
```

ساختار کلی:

``` json
[
  {
    "...": "..."
  }
]
```

> فیلدهای دقیق `PatientListApptItemBean` در این مرحله استخراج نشده‌اند.

------------------------------------------------------------------------

## 2. نوبت‌های یک پزشک در یک بازه زمانی

### Request

``` http
GET /oscar/ws/services/schedule/fetchProviderAppts/{providerNo}/{sDate}/{eDate}
```

### Path Parameters

``` text
providerNo : string
sDate      : string
eDate      : string
```

### Response Type

``` text
ProviderPeriodAppsResponse
```

این کلاس از `AbstractSearchResponse<ProviderPeriodAppsTo>` ارث می‌برد و
لیست نوبت‌ها در `content` قرار می‌گیرد.

### Response Structure

``` json
{
  "offset": 0,
  "limit": 20,
  "total": 1,
  "timestamp": 1786664434120,
  "content": [
    {
      "appointmentNo": 123,
      "providerNo": "999998",
      "appointmentDate": "...",
      "demographicNo": 2,
      "notes": "Booked from patient app",
      "location": "",
      "resources": "",
      "status": "t",
      "lastUpdateUser": "999998",
      "updateDatetime": 1786664434120,
      "name": "JOHN MACDONALD"
    }
  ],
  "query": null
}
```

### ProviderPeriodAppsTo

هر آیتم `content` شامل این فیلدها است:

``` text
appointmentNo   : Integer
providerNo      : String
appointmentDate : Date
demographicNo   : Integer
notes           : String
location        : String
resources       : String
status          : String
lastUpdateUser  : String
updateDatetime  : Long
name            : String
```

------------------------------------------------------------------------

## 3. تاریخچه نوبت‌های یک بیمار

### Request

``` http
POST /oscar/ws/services/schedule/{demographicNo}/appointmentHistory
```

### Path Parameters

``` text
demographicNo : int
```

### Request Body

این endpoint به Body نیاز ندارد.

### Response Type

``` text
SchedulingResponse
```

نوبت‌های بیمار در فیلد زیر قرار می‌گیرند:

``` text
appointments: AppointmentTo1[]
```

### Response Structure

``` json
{
  "appointment": null,
  "statuses": null,
  "types": null,
  "reasons": null,
  "appointments": [
    {
      "id": 123,
      "providerNo": "999998",
      "appointmentDate": "...",
      "startTime": "...",
      "endTime": "...",
      "name": "JOHN MACDONALD",
      "demographicNo": 2,
      "programId": 0,
      "notes": "...",
      "reason": "Others",
      "location": "",
      "resources": "",
      "type": "",
      "style": null,
      "billing": null,
      "status": "t",
      "importedStatus": null,
      "createDateTime": "...",
      "updateDateTime": "...",
      "creator": "999998",
      "lastUpdateUser": "999998",
      "remarks": "",
      "urgency": "",
      "creatorSecurityId": null,
      "bookingSource": "OSCAR",
      "reasonCode": 17,
      "demographic": null,
      "provider": null,
      "billingDetail": null
    }
  ]
}
```

### AppointmentTo1

``` text
id                : Integer
providerNo        : String
appointmentDate   : Date
startTime         : Date
endTime           : Date
name              : String
demographicNo     : int
programId         : int
notes             : String
reason            : String
location          : String
resources         : String
type              : String
style             : String
billing           : String
status            : String
importedStatus    : String
createDateTime    : Date
updateDateTime    : Date
creator           : String
lastUpdateUser    : String
remarks           : String
urgency           : String
creatorSecurityId : Integer
bookingSource     : BookingSource
reasonCode        : Integer
demographic       : Demographic
provider          : Provider
billingDetail     : BillingDetailTo1
```

------------------------------------------------------------------------

## جمع‌بندی

``` text
GET /schedule/{providerNo}/day/{date}
→ نوبت‌های یک پزشک در یک روز
→ Array<PatientListApptItemBean>

GET /schedule/fetchProviderAppts/{providerNo}/{sDate}/{eDate}
→ نوبت‌های یک پزشک در یک بازه
→ ProviderPeriodAppsResponse
→ content: ProviderPeriodAppsTo[]

POST /schedule/{demographicNo}/appointmentHistory
→ تاریخچه نوبت‌های یک بیمار
→ SchedulingResponse
→ appointments: AppointmentTo1[]
```

### کاربرد پیشنهادی

``` text
day
→ نمایش/بررسی نوبت‌های روزانه پزشک

fetchProviderAppts
→ واکشی نوبت‌های پزشک در یک بازه زمانی

appointmentHistory
→ نمایش My Appointments / تاریخچه نوبت‌های بیمار
```
