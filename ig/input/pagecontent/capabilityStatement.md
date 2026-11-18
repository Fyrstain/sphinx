# FHIR server requirements

The [Sphinx FHIR R5 server requirements](CapabilityStatement-SphinxServerRequirements.html) describe the read and search capabilities required for questionnaire and response navigation. The `kind=requirements` statement is a contract for integration, not proof of implementation.

The SDC `$populate` and `$extract` operations are required from the separately configured questionnaire service and are explained in [Search parameters and operations](search-parameters-and-operations.html). Validate the deployed operation signatures and returned Bundles.
