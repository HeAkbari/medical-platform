#!/usr/bin/env python3
"""Idempotent HAPI FHIR seeder for the medical-platform sandbox.

HAPI runs on an in-memory H2 database, so every container restart wipes all
data. This script rebuilds the full demo dataset with **explicit, stable
string ids** via PUT, so it can be re-run any number of times and always
produces the exact same ids (which the cross-references depend on).

HAPI rejects purely-numeric client-assigned ids, so ids are human-readable
slugs (e.g. `pat-akbari`, `loc-fairfield`). The app never hardcodes ids — it
searches and follows references — so the slug scheme is purely internal.

Usage:
    python docs/oscar/seed.py
    FHIR_BASE_URL=http://localhost:8080/fhir python docs/oscar/seed.py
"""

import json
import os
import re
import urllib.request

BASE = os.environ.get("FHIR_BASE_URL", "http://localhost:8080/fhir").rstrip("/")
HERE = os.path.dirname(os.path.abspath(__file__))

# Numeric ids used inside the source seed files -> stable slug ids.
SLUG = {
    "1002": "prac-rezaei",
    "1003": "prac-ahmadi",
    "1004": "pat-akbari",
    "1005": "pat-karimi",
    "1006": "pat-mohammadi",
    "1007": "appt-cardio",
    "1008": "appt-checkup",
    "1009": "obs-bp",
    "1010": "obs-glucose",
    "1011": "med-atorva",
    "1012": "med-metformin",
    "1015": "loc-jamesbay",
    "1016": "loc-cookpharm",
    "1017": "loc-fairfield",
    "1018": "loc-physio",
    "1019": "loc-psych",
    "1020": "loc-dental",
    "1021": "org-island",
    "1022": "org-coastal",
}

# urn:uuid references (used in the source files) -> slug ids.
URN_SLUG = {
    "urn:uuid:prac-rezaei": "prac-rezaei",
    "urn:uuid:prac-ahmadi": "prac-ahmadi",
    "urn:uuid:pat-akbari": "pat-akbari",
    "urn:uuid:pat-karimi": "pat-karimi",
    "urn:uuid:pat-mohammadi": "pat-mohammadi",
    "urn:uuid:org-island-health": "org-island",
    "urn:uuid:org-coastal-clinics": "org-coastal",
}

PATIENT_SLUG = {"Akbari": "pat-akbari", "Karimi": "pat-karimi", "Mohammadi": "pat-mohammadi"}
PRACTITIONER_SLUG = {"Rezaei": "prac-rezaei", "Ahmadi": "prac-ahmadi"}
LOCATION_SLUGS = ["loc-jamesbay", "loc-cookpharm", "loc-fairfield", "loc-physio", "loc-psych", "loc-dental"]

REF_RE = re.compile(r"^([A-Za-z]+)/(\d+)$")


def load(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as handle:
        return json.load(handle)


# slug -> resource type, so urn references can be expanded to "Type/slug".
REFERENCE_TYPES = {
    "prac-rezaei": "Practitioner",
    "prac-ahmadi": "Practitioner",
    "pat-akbari": "Patient",
    "pat-karimi": "Patient",
    "pat-mohammadi": "Patient",
    "org-island": "Organization",
    "org-coastal": "Organization",
}


def urn_to_ref(urn):
    slug = URN_SLUG[urn]
    rtype = REFERENCE_TYPES[slug]
    return f"{rtype}/{slug}"


def remap_refs(node):
    if isinstance(node, dict):
        return {key: remap_refs(value) for key, value in node.items()}
    if isinstance(node, list):
        return [remap_refs(item) for item in node]
    if isinstance(node, str):
        if node in URN_SLUG:
            return urn_to_ref(node)
        match = REF_RE.match(node)
        if match and match.group(2) in SLUG:
            return f"{match.group(1)}/{SLUG[match.group(2)]}"
    return node


def put(resource, resource_id):
    resource = remap_refs(resource)
    resource["id"] = resource_id
    rtype = resource["resourceType"]
    return {
        "request": {"method": "PUT", "url": f"{rtype}/{resource_id}"},
        "resource": resource,
    }


def counter(prefix):
    n = 0
    while True:
        n += 1
        yield f"{prefix}-{n}"


entries = []

def add_searchable_phone(resource):
    """The app normalises phone numbers to digits-only before searching, but the
    FHIR `phone` token search matches the stored value exactly. Add a digit-only
    telecom alongside the formatted one so login (findByPhone) resolves the
    patient instead of falling through to registration."""
    telecom = resource.get("telecom", [])
    for t in list(telecom):
        if t.get("system") == "phone" and t.get("value"):
            normalized = re.sub(r"\D", "", t["value"])
            existing = {tt.get("value") for tt in telecom}
            if normalized and normalized not in existing:
                telecom.append({"system": "phone", "value": normalized})
    resource["telecom"] = telecom
    return resource


# --- Patients & Practitioners ---------------------------------------------
for entry in load("seed-data.json")["entry"]:
    res = entry["resource"]
    if res["resourceType"] == "Patient":
        entries.append(put(add_searchable_phone(res), PATIENT_SLUG[res["name"][0]["family"]]))
    elif res["resourceType"] == "Practitioner":
        entries.append(put(res, PRACTITIONER_SLUG[res["name"][0]["family"]]))

# --- Locations ------------------------------------------------------------
loc_iter = iter(LOCATION_SLUGS)
for entry in load("seed-facilities.json")["entry"]:
    entries.append(put(entry["resource"], next(loc_iter)))

# --- Organizations / HealthcareServices / PractitionerRoles ---------------
svc_ids = counter("svc")
role_ids = counter("role")
for entry in load("seed-facility-details.json")["entry"]:
    res = entry["resource"]
    if res["resourceType"] == "Organization":
        entries.append(put(res, SLUG[{"Island Health": "1021", "Coastal Community Clinics": "1022"}[res["name"]]]))
    elif res["resourceType"] == "HealthcareService":
        entries.append(put(res, next(svc_ids)))
    elif res["resourceType"] == "PractitionerRole":
        entries.append(put(res, next(role_ids)))

# --- Enriched Observations / Medications + Reports / Dispenses -------------
dr_ids = counter("report")
disp_ids = counter("dispense")
for entry in load("seed-records-detail.json")["entry"]:
    res = entry["resource"]
    rtype = res["resourceType"]
    if rtype in ("Observation", "MedicationRequest"):
        entries.append(put(res, SLUG[res["id"]]))
    elif rtype == "DiagnosticReport":
        entries.append(put(res, next(dr_ids)))
    elif rtype == "MedicationDispense":
        entries.append(put(res, next(disp_ids)))

# --- Immunizations / Conditions / Allergies / Documents -------------------
ids = {
    "Immunization": counter("imm"),
    "Condition": counter("cond"),
    "AllergyIntolerance": counter("allergy"),
    "DocumentReference": counter("doc"),
}
for entry in load("seed-clinical-records.json")["entry"]:
    res = entry["resource"]
    entries.append(put(res, next(ids[res["resourceType"]])))

# --- Enriched Appointments ------------------------------------------------
appt_ids = counter("appt")
for entry in load("seed-appointments-detail.json")["entry"]:
    if entry["request"]["method"] == "DELETE":
        continue
    res = entry["resource"]
    entries.append(put(res, SLUG[res["id"]] if res.get("id") in SLUG else next(appt_ids)))

bundle = {"resourceType": "Bundle", "type": "transaction", "entry": entries}

with open(os.path.join(HERE, "seed-all.json"), "w", encoding="utf-8") as handle:
    json.dump(bundle, handle, indent=2)

request = urllib.request.Request(
    BASE,
    data=json.dumps(bundle).encode("utf-8"),
    headers={"Content-Type": "application/fhir+json"},
    method="POST",
)

try:
    with urllib.request.urlopen(request) as response:
        result = json.load(response)
except urllib.error.HTTPError as error:
    print(f"HTTP {error.code}")
    print(error.read().decode("utf-8")[:2000])
    raise SystemExit(1)

statuses = {}
for entry in result.get("entry", []):
    status = entry.get("response", {}).get("status", "?")
    statuses[status] = statuses.get(status, 0) + 1

print(f"Seeded {len(entries)} resources -> {BASE}")
for status, count in sorted(statuses.items()):
    print(f"  {status}: {count}")
