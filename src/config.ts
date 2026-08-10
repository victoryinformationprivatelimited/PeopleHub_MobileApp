/**
 * Mobile has no Vite-style dev proxy and no relative-URL trick — every request
 * needs an absolute URL, and (per ESS-Mobile-App-Plan.md §1) must send
 * X-Tenant-ID explicitly since mobile has no Origin/Referer/Host for the
 * backend's TenantDomainResolver to fall back to.
 *
 * apiBaseUrl points at the local dev backend for now (same one ESS web's
 * Vite proxy points at — see PeopleHub-ESS/vite.config.ts). Swap for a real
 * environment URL before anything beyond local dev testing.
 */
const config = {
  apiBaseUrl: "http://localhost:5014",
  tenantId: "essdevlocal",
};

export default config;
