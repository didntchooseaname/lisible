# Security Policy

## Supported versions

Lisible is pre 1.0. Only the latest release on the `main` branch receives security fixes.

| Version | Supported |
| --- | --- |
| latest release | yes |
| older releases | no |

## Scope

This policy covers the Lisible framework itself: the shared core, the variants, and the scripts shipped in this repository. It does not cover sites that people build with Lisible, nor the third party UI kits that some variants draw from.

## Reporting a vulnerability

Please do not open a public issue for security problems.

Use GitHub private vulnerability reporting instead: go to the Security tab of this repository and click "Report a vulnerability". This keeps the report private while it is being triaged.

What to expect:

- An acknowledgement within 7 days.
- An assessment and, when the report is confirmed, a fix or mitigation plan within 30 days.
- Credit in the release notes if you want it.

Lisible builds fully static sites, so most classes of server side vulnerabilities do not apply. Reports about the build pipeline, generated markup (for example XSS through markdown or frontmatter), and the bundled client scripts are all in scope and welcome.
