---
name: Bug report
about: Create a report to help us improve
title: ''
labels: ''
assignees: ''

---

**Describe the issue**  
Briefly explain the problem you encountered while using the CompanyCam TypeScript SDK. If the behavior is different from what's described in `companycam-openapi-spec.yaml`, please mention that.

**Where does it happen?**  
List the API endpoints, SDK methods, or TypeScript interfaces involved. If possible, include links to the relevant part of the spec.

**How to reproduce the problem**  
Steps to see the issue:

1. Set up the client (base URL, auth token, etc.)
2. Call `...`
3. What did you see? `...`

If the issue is with generated types or documentation, include the commands or scripts you used.

**What did you expect to happen?**  
Describe what you thought would happen, based on the OpenAPI spec, documentation, or previous experience.

**What actually happened?**  
Paste any error messages, stack traces, or APIError details. Please remove or hide any sensitive information.

**Your setup**

- SDK version (from `package.json` or npm):
- Node.js version:
- Operating context or environment (react app, Google cloud functions, etc.):
- Other tools (e.g., pnpm, yarn, CI service):

**Spec reference**  
Copy or link to the relevant part of `companycam-openapi-spec.yaml` that shows the expected behavior.

**Tests**  
Did you run `npm test`? If you have a failing test case, please share it.

**Anything else?**  
Add any other details that might help, such as retry settings, rate limiter changes, or differences between environments.
