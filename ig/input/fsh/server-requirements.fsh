Instance: SphinxServerRequirements
InstanceOf: CapabilityStatement
Usage: #definition
Title: "Sphinx FHIR R5 server requirements"
Description: "Resource and operation integration prerequisites of the Sphinx questionnaire front-end; these are requirements, not tested server conformance."
* status = #draft
* kind = #requirements
* experimental = true
* date = "2026-11-18"
* publisher = "Fyrstain"
* fhirVersion = #5.0.0
* format[+] = #json
* rest[0].mode = #server
* rest[0].resource[0].type = #Questionnaire
* rest[0].resource[0].interaction[0].code = #read
* rest[0].resource[0].interaction[1].code = #search-type
* rest[0].resource[1].type = #QuestionnaireResponse
* rest[0].resource[1].interaction[0].code = #read
* rest[0].resource[1].interaction[1].code = #search-type
