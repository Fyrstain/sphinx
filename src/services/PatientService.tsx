// Resources
import { Bundle, Patient } from "fhir/r5";
// FHIR
import Client from "fhir-kit-client";

/////////////////////////////////////
//             Client              //
/////////////////////////////////////

const fhirClient = new Client({
  baseUrl: process.env.REACT_APP_FHIR_URL ?? "fhir",
});

export interface ResourceSelectItem {
  value: string;
  display: string;
}

/////////////////////////////////////
//            Functions            //
/////////////////////////////////////

/**
 * Load the list of Patient to display in a select type component.
 *
 * @returns the promise of a Questionnaire.
 */
async function getPatientList(): Promise<ResourceSelectItem[]> {
  return fhirClient
    .search({
      resourceType: "Patient",
      searchParams: {
        _elements: "id, name",
        _count: 100000,
      },
    })
    .then((response) => {
      if (response.resourceType !== "Bundle") {
        return [];
      }
      const bundle: Bundle = response as Bundle;

      var selectItems: ResourceSelectItem[] = [];
      bundle.entry
        ?.filter((e) => e.resource?.resourceType === "Patient")
        .map((e) => e.resource)
        .forEach((resource) => {
          var patient = resource as Patient;

          const given = patient.name?.at(0)?.given?.at(0);
          const family = patient.name?.at(0)?.family;
          var display;
          if (given) {
            display = given;
          }
          if (family) {
            display = display ? display + " " + family : family;
          }
          display = display ?? patient.id ?? "";

          selectItems.push({ value: patient.id ?? "", display: display });
        });
      return selectItems;
    });
}

///////////////////////////////
//        exports            //
///////////////////////////////

const PatientService = {
  getPatientList,
};

export default PatientService;
