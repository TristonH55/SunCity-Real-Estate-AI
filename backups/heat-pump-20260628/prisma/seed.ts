// import "dotenv/config";
// import { prisma } from "../src/lib/prisma";

// async function main() {
//   console.log("🌱 Seeding regions...");

//   const regions = [
//     { code: "sunshine_coast", name: "Sunshine Coast" },
//     { code: "brisbane_northside", name: "Brisbane Northside" },
//     { code: "brisbane_southside", name: "Brisbane Southside" },
//     { code: "gold_coast", name: "Gold Coast" },
//     { code: "wide_bay", name: "Wide Bay" },
//   ];

//   for (const region of regions) {
//     await prisma.region.upsert({
//       where: { code: region.code },
//       update: {},
//       create: region,
//     });
//   }

//   console.log("✅ Regions seeded");
// }



// main()
//   .finally(() => prisma.$disconnect());

//   async function seedElectricSystems(prisma: any) {
//     console.log("🌱 Seeding electric systems...");

//     const systems = [
//       // =========================
//       // AquaMAX / Vulcan – Mild Steel
//       // =========================
//       { brand: "AquaMAX / Vulcan", model: "Electric 50L Mild Steel",  systemType: "electric", tankMaterial: "mild_steel", capacityLitres: 50,  warrantyPrimaryYears: 7,  warrantySecondaryYears: null, notes: "Equivalent to Rheem manufactured system", active: true },
//       { brand: "AquaMAX / Vulcan", model: "Electric 80L Mild Steel",  systemType: "electric", tankMaterial: "mild_steel", capacityLitres: 80,  warrantyPrimaryYears: 7,  warrantySecondaryYears: null, notes: "Equivalent to Rheem manufactured system", active: true },
//       { brand: "AquaMAX / Vulcan", model: "Electric 125L Mild Steel", systemType: "electric", tankMaterial: "mild_steel", capacityLitres: 125, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Rheem manufactured system", active: true },
//       { brand: "AquaMAX / Vulcan", model: "Electric 160L Mild Steel", systemType: "electric", tankMaterial: "mild_steel", capacityLitres: 160, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Rheem manufactured system", active: true },
//       { brand: "AquaMAX / Vulcan", model: "Electric 250L Mild Steel", systemType: "electric", tankMaterial: "mild_steel", capacityLitres: 250, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Rheem manufactured system", active: true },
//       { brand: "AquaMAX / Vulcan", model: "Electric 315L Mild Steel", systemType: "electric", tankMaterial: "mild_steel", capacityLitres: 315, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Rheem manufactured system", active: true },
//       { brand: "AquaMAX / Vulcan", model: "Electric 400L Mild Steel", systemType: "electric", tankMaterial: "mild_steel", capacityLitres: 400, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Rheem manufactured system", active: true },

//       // =========================
//       // Dux / Thermann – Mild Steel
//       // =========================
//       { brand: "Dux / Thermann", model: "Electric 50L Mild Steel",  systemType: "electric", tankMaterial: "mild_steel", capacityLitres: 50,  warrantyPrimaryYears: 7,  warrantySecondaryYears: null, notes: "Equivalent to Dux manufactured system", active: true },
//       { brand: "Dux / Thermann", model: "Electric 80L Mild Steel",  systemType: "electric", tankMaterial: "mild_steel", capacityLitres: 80,  warrantyPrimaryYears: 7,  warrantySecondaryYears: null, notes: "Equivalent to Dux manufactured system", active: true },
//       { brand: "Dux / Thermann", model: "Electric 125L Mild Steel", systemType: "electric", tankMaterial: "mild_steel", capacityLitres: 125, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Dux manufactured system", active: true },
//       { brand: "Dux / Thermann", model: "Electric 160L Mild Steel", systemType: "electric", tankMaterial: "mild_steel", capacityLitres: 160, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Dux manufactured system", active: true },
//       { brand: "Dux / Thermann", model: "Electric 250L Mild Steel", systemType: "electric", tankMaterial: "mild_steel", capacityLitres: 250, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Dux manufactured system", active: true },
//       { brand: "Dux / Thermann", model: "Electric 315L Mild Steel", systemType: "electric", tankMaterial: "mild_steel", capacityLitres: 315, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Dux manufactured system", active: true },
//       { brand: "Dux / Thermann", model: "Electric 400L Mild Steel", systemType: "electric", tankMaterial: "mild_steel", capacityLitres: 400, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Dux manufactured system", active: true },

//       // =========================
//       // Rheem Stellar – Stainless Steel
//       // =========================
//       { brand: "Rheem Stellar", model: "Electric 50L Stainless",  systemType: "electric", tankMaterial: "stainless_steel", capacityLitres: 50,  warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Stainless steel tank", active: true },
//       { brand: "Rheem Stellar", model: "Electric 80L Stainless",  systemType: "electric", tankMaterial: "stainless_steel", capacityLitres: 80,  warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Stainless steel tank", active: true },
//       { brand: "Rheem Stellar", model: "Electric 125L Stainless", systemType: "electric", tankMaterial: "stainless_steel", capacityLitres: 125, warrantyPrimaryYears: 12, warrantySecondaryYears: null, notes: "Stainless steel tank", active: true },
//       { brand: "Rheem Stellar", model: "Electric 160L Stainless", systemType: "electric", tankMaterial: "stainless_steel", capacityLitres: 160, warrantyPrimaryYears: 12, warrantySecondaryYears: null, notes: "Stainless steel tank", active: true },
//       { brand: "Rheem Stellar", model: "Electric 250L Stainless", systemType: "electric", tankMaterial: "stainless_steel", capacityLitres: 250, warrantyPrimaryYears: 12, warrantySecondaryYears: null, notes: "Stainless steel tank", active: true },
//       { brand: "Rheem Stellar", model: "Electric 315L Stainless", systemType: "electric", tankMaterial: "stainless_steel", capacityLitres: 315, warrantyPrimaryYears: 12, warrantySecondaryYears: null, notes: "Stainless steel tank", active: true },
//     ];

//     for (const system of systems) {
//       await prisma.system.upsert({
//         where: { model: system.model },
//         update: system,
//         create: system,
//       });
//     }

//     console.log("✅ Electric systems seeded");
//   }

import { Prisma } from "@prisma/client";

import { SystemType, TankMaterial } from "@prisma/client";
import "dotenv/config";
import { prisma } from "../lib/prisma";

// =========================
// Seed Regions
// =========================
async function seedRegions() {
  console.log("🌱 Seeding regions...");

  const regions = [
    { code: "sunshine_coast", name: "Sunshine Coast" },
    { code: "brisbane_northside", name: "Brisbane Northside" },
    { code: "brisbane_southside", name: "Brisbane Southside" },
    { code: "gympie", name: "Gympie" },
    { code: "gold_coast", name: "Gold Coast" },
    { code: "wide_bay", name: "Wide Bay" },
  ];

  for (const region of regions) {
    await prisma.region.upsert({
      where: { code: region.code },
      update: {},
      create: region,
    });
  }

  console.log("✅ Regions seeded");
}


// =========================
// Seed Electric Systems
// =========================
async function seedElectricSystems() {
  console.log("🌱 Seeding electric systems...");

  const systems = [
    // =========================
    // AquaMAX / Vulcan – Mild Steel
    // =========================
    { brand: "AquaMAX / Vulcan", model: "Electric 50L Mild Steel", systemType: SystemType.electric, tankMaterial: TankMaterial.mild_steel, capacityLitres: 50, warrantyPrimaryYears: 7, warrantySecondaryYears: null, notes: "Equivalent to Rheem manufactured system", active: true },
    { brand: "AquaMAX / Vulcan", model: "Electric 80L Mild Steel", systemType: SystemType.electric, tankMaterial: TankMaterial.mild_steel, capacityLitres: 80, warrantyPrimaryYears: 7, warrantySecondaryYears: null, notes: "Equivalent to Rheem manufactured system", active: true },
    { brand: "AquaMAX / Vulcan", model: "Electric 125L Mild Steel", systemType: SystemType.electric, tankMaterial: TankMaterial.mild_steel, capacityLitres: 125, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Rheem manufactured system", active: true },
    { brand: "AquaMAX / Vulcan", model: "Electric 160L Mild Steel", systemType: SystemType.electric, tankMaterial: TankMaterial.mild_steel, capacityLitres: 160, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Rheem manufactured system", active: true },
    { brand: "AquaMAX / Vulcan", model: "Electric 250L Mild Steel", systemType: SystemType.electric, tankMaterial: TankMaterial.mild_steel, capacityLitres: 250, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Rheem manufactured system", active: true },
    { brand: "AquaMAX / Vulcan", model: "Electric 315L Mild Steel", systemType: SystemType.electric, tankMaterial: TankMaterial.mild_steel, capacityLitres: 315, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Rheem manufactured system", active: true },
    { brand: "AquaMAX / Vulcan", model: "Electric 400L Mild Steel", systemType: SystemType.electric, tankMaterial: TankMaterial.mild_steel, capacityLitres: 400, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Rheem manufactured system", active: true },

    // =========================
    // Dux / Thermann – Mild Steel
    // =========================
    { brand: "Dux / Thermann", model: "Electric 50L Mild Steel", systemType: SystemType.electric, tankMaterial: TankMaterial.mild_steel, capacityLitres: 50, warrantyPrimaryYears: 7, warrantySecondaryYears: null, notes: "Equivalent to Dux manufactured system", active: true },
    { brand: "Dux / Thermann", model: "Electric 80L Mild Steel", systemType: SystemType.electric, tankMaterial: TankMaterial.mild_steel, capacityLitres: 80, warrantyPrimaryYears: 7, warrantySecondaryYears: null, notes: "Equivalent to Dux manufactured system", active: true },
    { brand: "Dux / Thermann", model: "Electric 125L Mild Steel", systemType: SystemType.electric, tankMaterial: TankMaterial.mild_steel, capacityLitres: 125, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Dux manufactured system", active: true },
    { brand: "Dux / Thermann", model: "Electric 160L Mild Steel", systemType: SystemType.electric, tankMaterial: TankMaterial.mild_steel, capacityLitres: 160, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Dux manufactured system", active: true },
    { brand: "Dux / Thermann", model: "Electric 250L Mild Steel", systemType: SystemType.electric, tankMaterial: TankMaterial.mild_steel, capacityLitres: 250, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Dux manufactured system", active: true },
    { brand: "Dux / Thermann", model: "Electric 315L Mild Steel", systemType: SystemType.electric, tankMaterial: TankMaterial.mild_steel, capacityLitres: 315, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Dux manufactured system", active: true },
    { brand: "Dux / Thermann", model: "Electric 400L Mild Steel", systemType: SystemType.electric, tankMaterial: TankMaterial.mild_steel, capacityLitres: 400, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Equivalent to Dux manufactured system", active: true },

    // =========================
    // Rheem Stellar – Stainless Steel
    // =========================
    { brand: "Rheem Stellar", model: "Electric 50L Stainless", systemType: SystemType.electric, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 50, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Stainless steel tank", active: true },
    { brand: "Rheem Stellar", model: "Electric 80L Stainless", systemType: SystemType.electric, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 80, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: "Stainless steel tank", active: true },
    { brand: "Rheem Stellar", model: "Electric 125L Stainless", systemType: SystemType.electric, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 125, warrantyPrimaryYears: 12, warrantySecondaryYears: null, notes: "Stainless steel tank", active: true },
    { brand: "Rheem Stellar", model: "Electric 160L Stainless", systemType: SystemType.electric, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 160, warrantyPrimaryYears: 12, warrantySecondaryYears: null, notes: "Stainless steel tank", active: true },
    { brand: "Rheem Stellar", model: "Electric 250L Stainless", systemType: SystemType.electric, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 250, warrantyPrimaryYears: 12, warrantySecondaryYears: null, notes: "Stainless steel tank", active: true },
    { brand: "Rheem Stellar", model: "Electric 315L Stainless", systemType: SystemType.electric, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 315, warrantyPrimaryYears: 12, warrantySecondaryYears: null, notes: "Stainless steel tank", active: true },
  ];

  await prisma.system.createMany({
    data: systems,
    skipDuplicates: true,
  });

  console.log("✅ Electric systems seeded");
}

// =========================
// HEAT PUMPS
// =========================


// =========================
// Seed Heat Pump Systems
// =========================
async function seedHeatPumpSystems() {
  console.log("🌱 Seeding heat pump systems...");

  const systems = [
    // =========================
    // Rheem Ambipower – Mild Steel
    // =========================
    { brand: "Rheem Ambipower", model: "Heat Pump 180L Mild Steel", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.mild_steel, capacityLitres: 180, warrantyPrimaryYears: 7, warrantySecondaryYears: null, notes: null, active: true },
    { brand: "Rheem Ambipower", model: "Heat Pump 280L Mild Steel", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.mild_steel, capacityLitres: 280, warrantyPrimaryYears: 7, warrantySecondaryYears: null, notes: null, active: true },

    // =========================
    // iStore – Mild Steel
    // =========================
    { brand: "iStore", model: "Heat Pump 180L Mild Steel", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.mild_steel, capacityLitres: 180, warrantyPrimaryYears: 5, warrantySecondaryYears: null, notes: "Rheem all-in-one system", active: true },
    { brand: "iStore", model: "Heat Pump 270L Mild Steel", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.mild_steel, capacityLitres: 270, warrantyPrimaryYears: 5, warrantySecondaryYears: null, notes: "Rheem all-in-one system", active: true },

    // =========================
    // Envirosun – Mild Steel
    // =========================
    { brand: "Envirosun", model: "Heat Pump 180L Mild Steel", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.mild_steel, capacityLitres: 180, warrantyPrimaryYears: 7, warrantySecondaryYears: null, notes: null, active: true },
    { brand: "Envirosun", model: "Heat Pump 330L Mild Steel", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.mild_steel, capacityLitres: 330, warrantyPrimaryYears: 7, warrantySecondaryYears: null, notes: null, active: true },

    // =========================
    // Stiebel Eltron / Thermann – Mild Steel
    // =========================
    { brand: "Stiebel Eltron / Thermann", model: "Heat Pump 50L Mild Steel", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.mild_steel, capacityLitres: 50, warrantyPrimaryYears: 7, warrantySecondaryYears: null, notes: "Equivalent Stiebel Eltron system", active: true },
    { brand: "Stiebel Eltron / Thermann", model: "Heat Pump 80L Mild Steel", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.mild_steel, capacityLitres: 80, warrantyPrimaryYears: 7, warrantySecondaryYears: null, notes: "Equivalent Stiebel Eltron system", active: true },

    // =========================
    // OMNI X – Stainless Steel
    // =========================
    { brand: "OMNI X", model: "Heat Pump 180L Stainless", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 180, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: null, active: true },
    { brand: "OMNI X", model: "Heat Pump 250L Stainless", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 250, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: null, active: true },
    { brand: "OMNI X", model: "Heat Pump 340L Stainless", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 340, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: null, active: true },
    { brand: "OMNI X", model: "Heat Pump 420L Stainless", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 420, warrantyPrimaryYears: 10, warrantySecondaryYears: null, notes: null, active: true },

    // =========================
    // Reclaim / Sanden – Stainless Steel (Split)
    // =========================
    { brand: "Reclaim / Sanden", model: "Heat Pump 250L Stainless Split", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 250, warrantyPrimaryYears: 15, warrantySecondaryYears: null, notes: "Panasonic split system", active: true },
    { brand: "Reclaim / Sanden", model: "Heat Pump 315L Stainless Split", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 315, warrantyPrimaryYears: 15, warrantySecondaryYears: null, notes: "Panasonic split system", active: true },
    { brand: "Reclaim / Sanden", model: "Heat Pump 400L Stainless Split", systemType: SystemType.heat_pump, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 400, warrantyPrimaryYears: 15, warrantySecondaryYears: null, notes: "Panasonic split system", active: true },
  ];

  await prisma.system.createMany({
    data: systems,
    skipDuplicates: true,
  });

  console.log("✅ Heat pump systems seeded");
}


// =========================
// Seed Solar Systems
// =========================
async function seedSolarSystems() {
  console.log("🌱 Seeding solar systems...");

  const systems = [
    // =========================
    // THERMOSIPHON SOLAR SYSTEMS
    // =========================

    // Envirosun
    { brand: "Envirosun", model: "TS Plus 180L 1 Panel", systemType: SystemType.solar_thermosiphon, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 180, warrantyPrimaryYears: 10, warrantySecondaryYears: 7, notes: "Thermosiphon – 1 panel", active: true },
    { brand: "Envirosun", model: "TS Plus 300L 2 Panel", systemType: SystemType.solar_thermosiphon, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 300, warrantyPrimaryYears: 10, warrantySecondaryYears: 7, notes: "Thermosiphon – 2 panel", active: true },
    { brand: "Envirosun", model: "THX Plus 300L 2 Panel", systemType: SystemType.solar_thermosiphon, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 300, warrantyPrimaryYears: 10, warrantySecondaryYears: 10, notes: "Thermosiphon – glycol / frost protected", active: true },

    // Rheem
    { brand: "Rheem", model: "Hi-Line 180L 2 Panel", systemType: SystemType.solar_thermosiphon, tankMaterial: TankMaterial.mild_steel, capacityLitres: 180, warrantyPrimaryYears: 5, warrantySecondaryYears: 5, notes: "Thermosiphon – 2 panel", active: true },
    { brand: "Rheem", model: "Hi-Line Premier 52L 300L 2 Panel", systemType: SystemType.solar_thermosiphon, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 300, warrantyPrimaryYears: 10, warrantySecondaryYears: 7, notes: "Thermosiphon – Premier stainless", active: true },

    // Rinnai
    { brand: "Rinnai", model: "Prestige 330L 2 Panel", systemType: SystemType.solar_thermosiphon, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 330, warrantyPrimaryYears: 10, warrantySecondaryYears: 7, notes: "Thermosiphon – 2 panel", active: true },

    // Solahart
    { brand: "Solahart", model: "L Series 300L 2 Panel", systemType: SystemType.solar_thermosiphon, tankMaterial: TankMaterial.mild_steel, capacityLitres: 300, warrantyPrimaryYears: 5, warrantySecondaryYears: 5, notes: "Thermosiphon – 2 panel", active: true },
    { brand: "Solahart", model: "J Series 300L 2 Panel", systemType: SystemType.solar_thermosiphon, tankMaterial: TankMaterial.mild_steel, capacityLitres: 300, warrantyPrimaryYears: 5, warrantySecondaryYears: 5, notes: "Thermosiphon – glycol / frost protected", active: true },

    // Sunrain
    { brand: "Sunrain", model: "MK11 300L 2 Panel", systemType: SystemType.solar_thermosiphon, tankMaterial: TankMaterial.stainless_steel, capacityLitres: 300, warrantyPrimaryYears: 7, warrantySecondaryYears: 5, notes: "Thermosiphon – Chinese made", active: true },

    // =========================
    // SPLIT SOLAR SYSTEMS
    // =========================

    // Envirosun
    { brand: "Envirosun", model: "AS 250L 2 Panel", systemType: SystemType.solar_split, tankMaterial: TankMaterial.mild_steel, capacityLitres: 250, warrantyPrimaryYears: 7, warrantySecondaryYears: 7, notes: "Split solar – 2 panel", active: true },
    { brand: "Envirosun", model: "AS 315L 3 Panel", systemType: SystemType.solar_split, tankMaterial: TankMaterial.mild_steel, capacityLitres: 315, warrantyPrimaryYears: 7, warrantySecondaryYears: 7, notes: "Split solar – 3 panel", active: true },
    { brand: "Envirosun", model: "AS 400L 2 Panel", systemType: SystemType.solar_split, tankMaterial: TankMaterial.mild_steel, capacityLitres: 400, warrantyPrimaryYears: 7, warrantySecondaryYears: 7, notes: "Split solar – 2 panel", active: true },
    { brand: "Envirosun", model: "AS 400L 3 Panel", systemType: SystemType.solar_split, tankMaterial: TankMaterial.mild_steel, capacityLitres: 400, warrantyPrimaryYears: 7, warrantySecondaryYears: 7, notes: "Split solar – 3 panel", active: true },

    // Rheem
    { brand: "Rheem", model: "Lo-Line 250L 2 Panel", systemType: SystemType.solar_split, tankMaterial: TankMaterial.mild_steel, capacityLitres: 250, warrantyPrimaryYears: 5, warrantySecondaryYears: 5, notes: "Split solar – 2 panel", active: true },
    { brand: "Rheem", model: "Lo-Line 315L 2 Panel", systemType: SystemType.solar_split, tankMaterial: TankMaterial.mild_steel, capacityLitres: 315, warrantyPrimaryYears: 5, warrantySecondaryYears: 5, notes: "Split solar – 2 panel", active: true },
    { brand: "Rheem", model: "Lo-Line 400L 2 Panel", systemType: SystemType.solar_split, tankMaterial: TankMaterial.mild_steel, capacityLitres: 400, warrantyPrimaryYears: 5, warrantySecondaryYears: 5, notes: "Split solar – 2 panel", active: true },
    { brand: "Rheem", model: "Lo-Line 400L 3 Panel", systemType: SystemType.solar_split, tankMaterial: TankMaterial.mild_steel, capacityLitres: 400, warrantyPrimaryYears: 5, warrantySecondaryYears: 5, notes: "Split solar – 3 panel", active: true },

    // Dux
    { brand: "Dux", model: "Ecosmart 250L 2 Panel", systemType: SystemType.solar_split, tankMaterial: TankMaterial.mild_steel, capacityLitres: 250, warrantyPrimaryYears: 5, warrantySecondaryYears: 5, notes: "Split solar – 2 panel", active: true },
    { brand: "Dux", model: "Ecosmart 315L 2 Panel", systemType: SystemType.solar_split, tankMaterial: TankMaterial.mild_steel, capacityLitres: 315, warrantyPrimaryYears: 5, warrantySecondaryYears: 5, notes: "Split solar – 2 panel", active: true },
    { brand: "Dux", model: "Ecosmart 400L 2 Panel", systemType: SystemType.solar_split, tankMaterial: TankMaterial.mild_steel, capacityLitres: 400, warrantyPrimaryYears: 5, warrantySecondaryYears: 5, notes: "Split solar – 2 panel", active: true },
    { brand: "Dux", model: "Ecosmart 400L 3 Panel", systemType: SystemType.solar_split, tankMaterial: TankMaterial.mild_steel, capacityLitres: 400, warrantyPrimaryYears: 5, warrantySecondaryYears: 5, notes: "Split solar – 3 panel", active: true },
  ];

  await prisma.system.createMany({
    data: systems,
    skipDuplicates: true,
  });

  console.log("✅ Solar systems seeded");
}
// =========================
// EXTRAS
// =========================
import { ExtraSystemType } from "@prisma/client";

// =========================
// Seed Extras WORKING USE THIS ONE
// =========================
// async function seedExtras() {
//   console.log("🌱 Seeding extras...");

//   const extras = [
//     // =========================
//     // ALL SYSTEMS
//     // =========================
//     { code: "electrical_isolator_rcd", name: "Electrical isolator & RCD", systemType: ExtraSystemType.all, notes: null, active: true },
//     { code: "safe_tray_mildred_valve", name: "Safe tray / Mildred valve", systemType: ExtraSystemType.all, notes: null, active: true },
//     { code: "remove_old_tank", name: "Remove old tank & disposal", systemType: ExtraSystemType.all, notes: null, active: true },
//     { code: "concrete_base", name: "Concrete base (if required)", systemType: ExtraSystemType.all, notes: null, active: true },

//     // =========================
//     // SOLAR ONLY
//     // =========================
//     { code: "double_storey_highset", name: "Double storey / highset roof (crane included)", systemType: ExtraSystemType.solar, notes: null, active: true },
//     { code: "two_visit_job", name: "2 visit job (disconnect & return)", systemType: ExtraSystemType.solar, notes: null, active: true },
//     { code: "temporary_tank", name: "Temporary tank install (up to 30 days)", systemType: ExtraSystemType.solar, notes: null, active: true },
//     { code: "cyclone_frame", name: "Cyclone frame (Wide Bay & above only)", systemType: ExtraSystemType.solar, notes: "Wide Bay & above only", active: true },
//     { code: "flat_roof_frame", name: "Flat roof frame", systemType: ExtraSystemType.solar, notes: null, active: true },
//     { code: "side_tilt_frame", name: "Side tilt frame (custom pitch)", systemType: ExtraSystemType.solar, notes: "Custom pitch, exclusions may apply", active: true },
//   ];

//   await prisma.extra.createMany({
//     data: extras,
//     skipDuplicates: true,
//   });

//   console.log("✅ Extras seeded");
// }

// =========================
// Seed Extras TEST ONLY
// =========================
// =========================
// Seed Extras (FINAL — FK SAFE)
// =========================
async function seedExtras() {
  console.log("🌱 Seeding extras...");

  // 🔥 IMPORTANT: delete prices FIRST (FK safe)
  await prisma.extraPrice.deleteMany({});
  await prisma.extra.deleteMany({});

  const extras = [
    // =========================
    // ALL SYSTEMS
    // =========================
    { code: "electrical_isolator_rcd", name: "Electrical isolator & RCD", systemType: ExtraSystemType.all, active: true },
    { code: "safe_tray_mildred_valve", name: "Safe tray / Mildred valve", systemType: ExtraSystemType.all, active: true },
    { code: "remove_old_tank", name: "Remove old tank & disposal", systemType: ExtraSystemType.all, active: true },
    { code: "concrete_base", name: "Concrete base (if required)", systemType: ExtraSystemType.all, active: true },

    // =========================
    // ELECTRIC — Darren's same-location replacement add-ons (electric-only)
    // =========================
    { code: "cupboard_install_electric", name: "Cupboard installation", systemType: ExtraSystemType.electric, active: true },
    { code: "safe_catch_tray_electric", name: "Safe / Catch Tray", systemType: ExtraSystemType.electric, active: true },
    { code: "mildred_valve_electric", name: "Mildred anti-flood valve", systemType: ExtraSystemType.electric, active: true },
    { code: "support_base_electric", name: "Concrete / Poly support base", systemType: ExtraSystemType.electric, active: true },

    // =========================
    // SOLAR — COMMON
    // =========================
    { code: "double_storey_highset", name: "Double storey / highset roof", systemType: ExtraSystemType.solar, active: true },
    { code: "two_visit_job", name: "2 visit job (disconnect & return)", systemType: ExtraSystemType.solar, active: true },
    { code: "temporary_tank", name: "Temporary tank install", systemType: ExtraSystemType.solar, active: true },
    { code: "side_tilt_frame", name: "Side tilt frame", systemType: ExtraSystemType.solar, active: true },

    // =========================
    // SOLAR — THERMOSIPHON
    // =========================
    { code: "flat_roof_frame_thermo", name: "Flat roof frame (Thermosiphon)", systemType: ExtraSystemType.solar, active: true },
    { code: "cyclone_frame_thermo", name: "Cyclone frame (Thermosiphon)", systemType: ExtraSystemType.solar, active: true },

    // =========================
    // SOLAR — SPLIT
    // =========================
    { code: "flat_roof_frame_split", name: "Flat roof frame (Split solar)", systemType: ExtraSystemType.solar, active: true },
    { code: "cyclone_frame_split", name: "Cyclone frame (Split solar)", systemType: ExtraSystemType.solar, active: true },
  ];

  await prisma.extra.createMany({ data: extras });

  console.log("✅ Extras seeded correctly");
}



// =========================
// 1... Seed Electric System Prices (EX-GST)
// =========================
async function seedElectricSystemPrices() {
  console.log("🌱 Seeding electric system prices (ex-GST)...");

  // Fetch regions
  const regions = await prisma.region.findMany();
  const regionMap = Object.fromEntries(regions.map(r => [r.code, r.id]));

  // Fetch electric systems
  const systems = await prisma.system.findMany({
    where: { systemType: "electric" },
  });
  //const systemMap = Object.fromEntries(systems.map(s => [s.model, s.id]));
  //new test
  const systemMap = Object.fromEntries(   systems.map(s => [`${s.brand} | ${s.model}`, s.id]) );

  const prices = [
    // =========================
    // AquaMAX / Vulcan – Mild Steel
    // =========================
    ["AquaMAX / Vulcan | Electric 50L Mild Steel", 1500, 1500, 1600, 1600, 1700, 1825],
    ["AquaMAX / Vulcan | Electric 80L Mild Steel", 1650, 1650, 1750, 1750, 1850, 1975],
    ["AquaMAX / Vulcan | Electric 125L Mild Steel", 1700, 1700, 1800, 1800, 1900, 2025],
    ["AquaMAX / Vulcan | Electric 160L Mild Steel", 1850, 1850, 1950, 1950, 2050, 2175],
    ["AquaMAX / Vulcan | Electric 250L Mild Steel", 1900, 1900, 2000, 2000, 2100, 2225],
    ["AquaMAX / Vulcan | Electric 315L Mild Steel", 2000, 2000, 2100, 2100, 2200, 2325],
    ["AquaMAX / Vulcan | Electric 400L Mild Steel", 2300, 2300, 2400, 2400, 2500, 2625],

    // =========================
    // Dux / Thermann – Mild Steel
    // =========================
    ["Dux / Thermann | Electric 50L Mild Steel", 1600, 1600, 1700, 1700, 1800, 1925],
    ["Dux / Thermann | Electric 80L Mild Steel", 1750, 1750, 1850, 1850, 1950, 2075],
    ["Dux / Thermann | Electric 125L Mild Steel", 1850, 1850, 1950, 1950, 2050, 2175],
    ["Dux / Thermann | Electric 160L Mild Steel", 1950, 1950, 2050, 2050, 2150, 2275],
    ["Dux / Thermann | Electric 250L Mild Steel", 2000, 2000, 2100, 2100, 2200, 2325],
    ["Dux / Thermann | Electric 315L Mild Steel", 2100, 2100, 2200, 2200, 2300, 2425],
    ["Dux / Thermann | Electric 400L Mild Steel", 2450, 2450, 2550, 2550, 2650, 2775],

    // =========================
    // Rheem Stellar – Stainless Steel
    // =========================
    ["Rheem Stellar | Electric 50L Stainless", 1800, 1800, 1900, 1900, 2000, 2125],
    ["Rheem Stellar | Electric 80L Stainless", 1950, 1950, 2050, 2050, 2150, 2275],
    ["Rheem Stellar | Electric 125L Stainless", 2000, 2000, 2100, 2100, 2200, 2325],
    ["Rheem Stellar | Electric 160L Stainless", 2150, 2150, 2250, 2250, 2350, 2425],
    ["Rheem Stellar | Electric 250L Stainless", 2200, 2200, 2300, 2300, 2400, 2525],
    ["Rheem Stellar | Electric 315L Stainless", 2300, 2300, 2400, 2400, 2500, 2625],
  ];

  const regionOrder = [
    "sunshine_coast",
    "brisbane_northside",
    "brisbane_southside",
    "gympie",
    "gold_coast",
    "wide_bay",
  ];
  

  const data: Prisma.SystemPriceCreateManyInput[] = [];

  for (const [model, ...regionPrices] of prices) {
    const systemId = systemMap[model];
    if (!systemId) continue;

    regionPrices.forEach((price, index) => {
      const regionId = regionMap[regionOrder[index]];
      if (!regionId) return;

      data.push({
        systemId,
        regionId,
        price,
      });
    });
  }

  await prisma.systemPrice.createMany({ data });

  console.log("✅ Electric system prices seeded");
}





// =========================
// Seed Heat Pump System Prices (EX-GST)
// =========================
async function seedHeatPumpSystemPrices() {
  console.log("🌱 Seeding heat pump system prices (ex-GST)...");

  // Fetch regions
  const regions = await prisma.region.findMany();
  const regionMap = Object.fromEntries(regions.map(r => [r.code, r.id]));

  // Fetch heat pump systems
  const systems = await prisma.system.findMany({
    where: { systemType: "heat_pump" },
  });

  /**
   * KEY FORMAT (VERY IMPORTANT)
   * `${brand} ${capacityLitres}`
   *
   * Examples:
   * "Rheem Ambipower 180"
   * "Stiebel Eltron / Thermann 50"
   * "OMNI X 250"
   * "Reclaim / Sanden 315"
   */
  const systemMap = Object.fromEntries(
    systems.map(s => [`${s.brand} ${s.capacityLitres}`, s.id])
  );

  const prices: [string, number, number, number, number, number, number][] = [
    // =========================
    // Rheem Ambipower
    // =========================
    ["Rheem Ambipower 180", 3300, 3300, 3400, 3400, 3500, 3625],
    ["Rheem Ambipower 280", 3550, 3550, 3650, 3650, 3750, 3875],

    // =========================
    // iStore
    // =========================
    ["iStore 180", 3350, 3350, 3450, 3450, 3550, 3675],
    ["iStore 270", 3500, 3500, 3600, 3600, 3700, 3825],

    // =========================
    // Envirosun
    // =========================
    ["Envirosun 180", 3200, 3200, 3300, 3300, 3400, 3525],
    ["Envirosun 330", 3450, 3450, 3550, 3550, 3650, 3775],

    // =========================
    // Stiebel Eltron / Thermann
    // =========================
    ["Stiebel Eltron / Thermann 50", 3650, 3650, 3750, 3750, 3850, 3975],
    ["Stiebel Eltron / Thermann 80", 3950, 3950, 4050, 4050, 4150, 4275],

    // =========================
    // OMNI X – Stainless
    // =========================
    ["OMNI X 180", 3350, 3350, 3450, 3450, 3550, 3675],
    ["OMNI X 250", 3450, 3450, 3550, 3550, 3650, 3775],
    ["OMNI X 340", 3550, 3550, 3650, 3650, 3750, 3875],
    ["OMNI X 420", 3700, 3700, 3800, 3800, 3900, 4025],

    // =========================
    // Reclaim / Sanden (Split)
    // =========================
    ["Reclaim / Sanden 250", 6450, 6450, 6550, 6550, 6650, 6725],
    ["Reclaim / Sanden 315", 6650, 6650, 6750, 6750, 6850, 6975],
    ["Reclaim / Sanden 400", 6900, 6900, 7000, 7000, 7100, 7250],
  ];

  const regionOrder = [
    "sunshine_coast",
    "brisbane_northside",
    "brisbane_southside",
    "gympie",
    "gold_coast",
    "wide_bay",
  ];

  const data: Prisma.SystemPriceCreateManyInput[] = [];

  for (const [key, ...regionPrices] of prices) {
    const systemId = systemMap[key];

    if (!systemId) {
      console.warn(`⚠️ No system found for price key: ${key}`);
      continue;
    }

    regionPrices.forEach((price, index) => {
      const regionId = regionMap[regionOrder[index]];
      if (!regionId) return;

      data.push({
        systemId,
        regionId,
        price,
      });
    });
  }

  await prisma.systemPrice.createMany({ data });

  console.log("✅ Heat pump system prices seeded");
}





// =========================
// Seed Solar System Prices (EX-GST)
// =========================
async function seedSolarSystemPrices() {
  console.log("🌱 Seeding solar system prices (ex-GST)...");

  const regions = await prisma.region.findMany();
  const regionMap = Object.fromEntries(regions.map(r => [r.code, r.id]));

  const systems = await prisma.system.findMany({
    where: {
      systemType: { in: ["solar_thermosiphon", "solar_split"] },
    },
  });
  //const systemMap = Object.fromEntries(systems.map(s => [s.model, s.id]));
  //new test
  // 🔑 BRAND + MODEL KEY (CRITICAL FIX)
  const systemMap = Object.fromEntries(
  systems.map(s => [`${s.brand} | ${s.model}`, s.id])
  );


  // Remove existing solar prices (safe re-run)
  // await prisma.systemPrice.deleteMany({
  //   where: { systemId: { in: Object.values(systemMap) } },
  // });

  const prices: [string, number, number, number, number, number, number][] = [
    // =========================
    // THERMOSIPHON
    // =========================
    ["Envirosun | TS Plus 180L 1 Panel", 4900, 4900, 5000, 5000, 5100, 5225],
    ["Envirosun | TS Plus 300L 2 Panel", 5350, 5350, 5450, 5450, 5550, 5675],
    ["Envirosun | THX Plus 300L 2 Panel", 6750, 6750, 6850, 6850, 6950, 7075],

    ["Rheem | Hi-Line 180L 2 Panel", 5575, 5575, 5675, 5675, 5775, 6000],
    ["Rheem | Hi-Line Premier 52L 300L 2 Panel", 5850, 5850, 5950, 5950, 6050, 6275],

    ["Rinnai | Prestige 330L 2 Panel", 7650, 7650, 7750, 7750, 7850, 7975],
    ["Solahart | L Series 300L 2 Panel", 7250, 7250, 7350, 7350, 7450, 7575],
    ["Solahart | J Series 300L 2 Panel", 8050, 8150, 8250, 8250, 8350, 8575],
    ["Sunrain | MK11 300L 2 Panel", 5225, 5225, 5325, 5325, 5425, 5575],

    // =========================
    // SPLIT SOLAR
    // =========================
    ["Envirosun | AS 250L 2 Panel", 5100, 5100, 5200, 5200, 5300, 5425],
    ["Envirosun | AS 315L 3 Panel", 5250, 5250, 5350, 5350, 5450, 5575],
    ["Envirosun | AS 400L 2 Panel", 5550, 5550, 5650, 5650, 5750, 5875],
    ["Envirosun | AS 400L 3 Panel", 6200, 6200, 6300, 6300, 6400, 6575],

    ["Rheem | Lo-Line 250L 2 Panel", 5775, 5775, 5875, 5875, 5975, 6100],
    ["Rheem | Lo-Line 315L 2 Panel", 5850, 5950, 6050, 6050, 6150, 6275],
    ["Rheem | Lo-Line 400L 2 Panel", 6100, 6100, 6200, 6200, 6300, 6425],
    ["Rheem | Lo-Line 400L 3 Panel", 6950, 6950, 7050, 7050, 7150, 7275],

    ["Dux | Ecosmart 250L 2 Panel", 5800, 5800, 5600, 5600, 5700, 5825],
    ["Dux | Ecosmart 315L 2 Panel", 5900, 5900, 6000, 6000, 6100, 6275],
    ["Dux | Ecosmart 400L 2 Panel", 6100, 6100, 6200, 6200, 6300, 6425],
    ["Dux | Ecosmart 400L 3 Panel", 6900, 6900, 7000, 7000, 7100, 7225],
  ];

  const regionOrder = [
    "sunshine_coast",
    "brisbane_northside",
    "brisbane_southside",
    "gympie",
    "gold_coast",
    "wide_bay",
  ];
  

  const data: Prisma.SystemPriceCreateManyInput[] = [];

  for (const [model, ...regionPrices] of prices) {
    const systemId = systemMap[model];
    if (!systemId) continue;

    regionPrices.forEach((price, index) => {
      const regionId = regionMap[regionOrder[index]];
      if (!regionId) return;

      data.push({
        systemId,
        regionId,
        price,
      });
    });
  }

  await prisma.systemPrice.createMany({ data });

  console.log("✅ Solar system prices seeded");
}


// =========================
// Seed Extras Pricing (EX-GST) first 1
// =========================
// async function seedExtraPrices() {
//   console.log("🌱 Seeding extras pricing (ex-GST)...");

//   const regions = await prisma.region.findMany();
//   const extras = await prisma.extra.findMany();

//   const regionMap: Record<string, string> = {};
//   const extraMap: Record<string, string> = {};

//   regions.forEach(r => (regionMap[r.code] = r.id));
//   extras.forEach(e => (extraMap[e.code] = e.id));

//   await prisma.extraPrice.deleteMany({});

//   const regionOrder = [
//     "sunshine_coast",
//     "brisbane_northside",
//     "brisbane_southside",
//     "gympie",
//     "gold_coast",
//     "wide_bay",
//   ];
  

//   const data: Prisma.ExtraPriceCreateManyInput[] = [];

//   // -------------------------
//   // ALL REGIONS — FLAT PRICES
//   // -------------------------
//   const flatPrices: Record<string, number> = {
//     electrical_isolator_rcd: 350,
//     safe_tray_mildred_valve: 65,
//     concrete_base: 65,
//     remove_old_tank: 0, // INCLUDED
//     double_storey_highset: 1100,
//     temporary_tank: 550,
//     flat_roof_frame: 550,
//     side_tilt_frame: 750,
//   };

//   for (const code of Object.keys(flatPrices)) {
//     const extraId = extraMap[code];
//     if (!extraId) continue;

//     for (const regionCode of regionOrder) {
//       const regionId = regionMap[regionCode];
//       if (!regionId) continue;

//       data.push({
//         extraId,
//         regionId,
//         price: flatPrices[code],
//       });
//     }
//   }

//   // -------------------------
//   // 2-VISIT JOB (REGIONAL)
//   // -------------------------
//   const twoVisitExtraId = extraMap["two_visit_job"];
//   if (twoVisitExtraId) {
//     for (const regionCode of regionOrder) {
//       const regionId = regionMap[regionCode];
//       if (!regionId) continue;

//       data.push({
//         extraId: twoVisitExtraId,
//         regionId,
//         price: regionCode === "sunshine_coast" ? 250 : 300,
//       });
//     }
//   }

//   // -------------------------
//   // CYCLONE FRAME (WIDE BAY ONLY)
//   // -------------------------
//   const cycloneExtraId = extraMap["cyclone_frame"];
//   const wideBayRegionId = regionMap["wide_bay"];

//   if (cycloneExtraId && wideBayRegionId) {
//     data.push({
//       extraId: cycloneExtraId,
//       regionId: wideBayRegionId,
//       price: 925, // Thermosiphon
//     });

//     data.push({
//       extraId: cycloneExtraId,
//       regionId: wideBayRegionId,
//       price: 850, // Split
//     });
//   }

//   await prisma.extraPrice.createMany({ data });

//   console.log("✅ Extras pricing seeded");
// }

/////////////////EXTRAS VERSION 2 WORKING USE THIS ////////////
// =========================
// Seed Extras Pricing (EX-GST)
// =========================
// async function seedExtraPrices() {
//   console.log("🌱 Seeding extras pricing (ex-GST)...");

//   const regions = await prisma.region.findMany();
//   const extras = await prisma.extra.findMany();

//   const regionMap = Object.fromEntries(regions.map(r => [r.code, r.id]));
//   const extraMap = Object.fromEntries(extras.map(e => [e.code, e.id]));

//   await prisma.extraPrice.deleteMany({});

//   const regionOrder = [
//     "sunshine_coast",
//     "brisbane_northside",
//     "brisbane_southside",
//     "gympie",
//     "gold_coast",
//     "wide_bay",
//   ];

//   const data: Prisma.ExtraPriceCreateManyInput[] = [];

//   // -------------------------
//   // FLAT PRICES (ALL SYSTEMS)
//   // -------------------------
//   const flatPrices = {
//     electrical_isolator_rcd: 350,
//     safe_tray_mildred_valve: 65,
//     concrete_base: 65,
//     remove_old_tank: 0,
//     double_storey_highset: 1100,
//     temporary_tank: 550,
//     side_tilt_frame: 750,
//   };

//   for (const [code, price] of Object.entries(flatPrices)) {
//     for (const regionCode of regionOrder) {
//       data.push({
//         extraId: extraMap[code],
//         regionId: regionMap[regionCode],
//         price,
//       });
//     }
//   }

//   // -------------------------
//   // FLAT ROOF FRAME (SOLAR TYPE DIFFERENCE)
//   // -------------------------
//   const flatRoofId = extraMap["flat_roof_frame"];

//   if (flatRoofId) {
//     for (const regionCode of regionOrder) {
//       data.push(
//         {
//           extraId: flatRoofId,
//           regionId: regionMap[regionCode],
//           price: 750, // Thermosiphon
//         },
//         {
//           extraId: flatRoofId,
//           regionId: regionMap[regionCode],
//           price: 650, // Split Solar
//         }
//       );
//     }
//   }

//   // -------------------------
//   // 2 VISIT JOB
//   // -------------------------
//   const twoVisitId = extraMap["two_visit_job"];
//   if (twoVisitId) {
//     for (const regionCode of regionOrder) {
//       data.push({
//         extraId: twoVisitId,
//         regionId: regionMap[regionCode],
//         price: regionCode === "sunshine_coast" ? 250 : 300,
//       });
//     }
//   }

//   // -------------------------
//   // CYCLONE FRAME — WIDE BAY ONLY
//   // -------------------------
//   const cycloneId = extraMap["cyclone_frame"];
//   if (cycloneId) {
//     data.push({
//       extraId: cycloneId,
//       regionId: regionMap["wide_bay"],
//       price: 925,
//     });
//   }

//   await prisma.extraPrice.createMany({ data });
//   console.log("✅ Extras pricing seeded correctly");
// }


///////// SEED EXTRAS PRICING TEST ONLY///
// =========================
// Seed Extras Pricing (FINAL — SCHEMA-CORRECT)
// =========================
async function seedExtraPrices() {
  console.log("🌱 Seeding extras pricing (ex-GST)...");

  // HARD RESET (required)
  await prisma.extraPrice.deleteMany({});

  const regions = await prisma.region.findMany();
  const extras = await prisma.extra.findMany();

  const regionMap = Object.fromEntries(regions.map(r => [r.code, r.id]));
  const extraMap  = Object.fromEntries(extras.map(e => [e.code, e.id]));

  const data: Prisma.ExtraPriceCreateManyInput[] = [];

  /*
    REGION CODES
    ------------------------------------------------
    sunshine_coast
    brisbane_northside
    brisbane_southside
    gympie
    gold_coast
    wide_bay   (PDF: Toowoomba / Wide Bay)
  */

  // =================================================
  // ALL SYSTEMS (TRUE FLAT EXTRAS)
  // =================================================
  const flatAllRegions = {
    electrical_isolator_rcd: 350,
    safe_tray_mildred_valve: 65,
    concrete_base: 65,
    remove_old_tank: 0,
  };

  for (const [code, price] of Object.entries(flatAllRegions)) {
    for (const regionId of Object.values(regionMap)) {
      data.push({
        extraId: extraMap[code],
        regionId,
        price,
      });
    }
  }

  // =================================================
  // ELECTRIC — Darren's same-location replacement add-ons (flat, all regions)
  // =================================================
  const flatElectric = {
    cupboard_install_electric: 50,
    safe_catch_tray_electric: 165,
    mildred_valve_electric: 225,
    support_base_electric: 65,
  };

  for (const [code, price] of Object.entries(flatElectric)) {
    for (const regionId of Object.values(regionMap)) {
      data.push({
        extraId: extraMap[code],
        regionId,
        price,
      });
    }
  }

  // =================================================
  // TEMPORARY TANK — SOLAR (ALL REGIONS)
  // PDF: $150 everywhere
  // =================================================
  for (const regionId of Object.values(regionMap)) {
    data.push({
      extraId: extraMap["temporary_tank"],
      regionId,
      price: 150,
    });
  }

  // =================================================
  // DOUBLE STOREY / HIGHSET — SOLAR
  // =================================================
  const doubleStoreyPrices: Record<string, number> = {
    sunshine_coast: 350,
    brisbane_northside: 350,
    brisbane_southside: 350,
    gympie: 350,
    gold_coast: 350,
    wide_bay: 500,
  };

  for (const [regionCode, price] of Object.entries(doubleStoreyPrices)) {
    data.push({
      extraId: extraMap["double_storey_highset"],
      regionId: regionMap[regionCode],
      price,
    });
  }

  // =================================================
  // 2 VISIT JOB — SOLAR (DIFFERENT FOR SPLIT VS THERMO)
  // =================================================

  // THERMOSIPHON
  const twoVisitThermo: Record<string, number> = {
    sunshine_coast: 300,
    brisbane_northside: 300,
    brisbane_southside: 350,
    gympie: 350,
    gold_coast: 450,
    wide_bay: 600,
  };

  // SPLIT
  const twoVisitSplit: Record<string, number> = {
    sunshine_coast: 250,
    brisbane_northside: 300,
    brisbane_southside: 350,
    gympie: 350,
    gold_coast: 450,
    wide_bay: 600,
  };

  for (const regionCode of Object.keys(regionMap)) {
    data.push(
      {
        extraId: extraMap["two_visit_job"],
        regionId: regionMap[regionCode],
        price: twoVisitThermo[regionCode],
      }
    );
  }

  // =================================================
  // FLAT ROOF FRAME — SOLAR TYPE
  // =================================================
  for (const regionId of Object.values(regionMap)) {
    data.push(
      {
        extraId: extraMap["flat_roof_frame_thermo"],
        regionId,
        price: 750,
      },
      {
        extraId: extraMap["flat_roof_frame_split"],
        regionId,
        price: 650,
      }
    );
  }

  // =================================================
  // SIDE TILT FRAME
  // PDF: NOT AVAILABLE IN WIDE BAY
  // =================================================
  const sideTiltRegions = [
    "sunshine_coast",
    "brisbane_northside",
    "brisbane_southside",
    "gympie",
    "gold_coast",
  ];

  for (const regionCode of sideTiltRegions) {
    data.push({
      extraId: extraMap["side_tilt_frame"],
      regionId: regionMap[regionCode],
      price: 1500,
    });
  }

  // =================================================
  // CYCLONE FRAME — WIDE BAY ONLY
  // =================================================
  data.push(
    {
      extraId: extraMap["cyclone_frame_thermo"],
      regionId: regionMap["wide_bay"],
      price: 925,
    },
    {
      extraId: extraMap["cyclone_frame_split"],
      regionId: regionMap["wide_bay"],
      price: 850,
    }
  );

  await prisma.extraPrice.createMany({ data });

  console.log("✅ Extras pricing seeded EXACTLY to PDF");
}



// =========================
// MAIN
// =========================
async function main() {
  await seedRegions();

  // RESET ALL SYSTEM PRICES ONCE
  await prisma.systemPrice.deleteMany({});

  await seedElectricSystems();
  await seedHeatPumpSystems();
  await seedSolarSystems();
  await seedExtras();

  await seedElectricSystemPrices();
  await seedHeatPumpSystemPrices();
  await seedSolarSystemPrices();
  await seedExtraPrices();

}




main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
