# Heritage Research Workflow

Every heritage record follows this pipeline:

1. Identify a candidate place.
2. Collect government, archaeological, archival, academic and local sources.
3. Separate documented facts from traditions, legends and unverified claims.
4. Give each source a stable `source_id`.
5. Store claims with the source that supports them.
6. Mark incomplete records as `partial-verification` instead of guessing.
7. Add coordinates only after location verification.
8. Review before promoting a record to `verified`.

## Evidence states

- `verified`: supported by sufficiently strong documentary/archaeological evidence.
- `partial-verification`: some facts are supported, but important fields remain unresolved.
- `traditional-claim`: preserved as cultural tradition without presenting it as established chronology.
- `needs-review`: conflicting or insufficient evidence.

## First temple

`GHA-TEM-0001` is the first working research record. It currently uses a government tourism source for its basic identification and deliberately leaves chronology and coordinates unresolved until stronger evidence is found.
