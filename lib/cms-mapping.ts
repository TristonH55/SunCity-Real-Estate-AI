// import { SystemType } from "@prisma/client";

// /**
//  * These values MUST match Dataset.php exactly
//  */

// export const CMS_ENQUIRY_TYPES = {
//   pricing: "f176", // New System / Replacement
// };

// export const CMS_PROPERTY_TYPES = {
//   house: "8884",
//   unit: "1b54",
//   townhouse: "7b71",
//   commercial: "a0fe",
// };

// export const CMS_SYSTEM_LOCATIONS = {
//   inside: "9603",
//   outside: "db09",
//   roof: "e4d8",
//   none: "a1f1",
// };

// /**
//  * Prisma SystemType → CMS system code
//  */
// export const CMS_SYSTEM_TYPES: Record<SystemType, string> = {
//   electric: "c730",
//   heat_pump: "43c8",
//   solar_thermosiphon: "8563",
//   solar_split: "8563",
// };

//////// Version test 2
// lib/cms-mapping.ts
// Exact codes from your Dataset.php – used to translate UI labels → CMS codes

export const CMS_ENQUIRY_TYPES = {
    new_system: "f176",  // New System / Replacement
  } as const;

  // Lead status / stage codes. App-created leads go in as "Quoted" (not "New") so
  // SunCity's CRM doesn't fire its New-lead auto-email (Gary confirmed 2026-07-29).
  export const CMS_LEAD_STATUS = {
    new:    "d651",
    quoted: "ee79",
  } as const;
  
  export const CMS_PROPERTY_TYPES = {
    House:       "8884",
    Unit:        "1b54",
    Townhouse:   "7b71",
    Commercial:  "a0fe",
  } as const;
  
  export const CMS_EXISTING_SYSTEM_TYPES = {
    Electric:             "c730",
    Gas:                  "412c",
    Solar:                "8563",
    "Heat Pump":          "43c8",
    "Not Sure":           "bc1e",
    "No Existing System": "4577",
  } as const;
  
  export const CMS_SYSTEM_LOCATIONS = {
    Inside:               "9603",
    Outside:              "db09",
    Roof:                 "e4d8",
    "No Existing System": "a1f1",
  } as const;

  // Maps the Step-1 system type → the CMS "existing system type" label, so we no
  // longer ask it again in Step 4 (like-for-like replacement). Values must be
  // keys of CMS_EXISTING_SYSTEM_TYPES above.
  export const SYSTEM_TYPE_TO_EXISTING = {
    gas:                "Gas",
    electric:           "Electric",
    heat_pump:          "Heat Pump",
    solar_thermosiphon: "Solar",
    solar_split:        "Solar",
  } as const;