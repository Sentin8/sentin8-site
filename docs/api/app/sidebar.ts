import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "category",
      label: "policy",
      link: {
        type: "doc",
        id: "api/app/sentin-8-app",
      },
      items: [
        {
          type: "doc",
          id: "api/app/policy-list-attributes",
          label: "policy_list_attributes",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/app/policy-put-attribute",
          label: "policy_put_attribute",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/app/policy-delete-attribute",
          label: "policy_delete_attribute",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/app/policy-list-sets",
          label: "policy_list_sets",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/app/policy-mode-disable",
          label: "policy_mode_disable",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/app/policy-mode-enforce",
          label: "policy_mode_enforce",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/app/policy-mode-shadow",
          label: "policy_mode_shadow",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/app/policy-get-set",
          label: "policy_get_set",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/app/policy-put-set",
          label: "policy_put_set",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/app/policy-delete-set",
          label: "policy_delete_set",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/app/policy-test-set",
          label: "policy_test_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/app/policy-list-relations",
          label: "policy_list_relations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/app/policy-put-relation",
          label: "policy_put_relation",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/app/policy-delete-relation",
          label: "policy_delete_relation",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/app/policy-check-relation",
          label: "policy_check_relation",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "app",
      link: {
        type: "doc",
        id: "api/app/sentin-8-app",
      },
      items: [
        {
          type: "doc",
          id: "api/app/uninstall-instance",
          label: "`POST /v1/admin/instances/uninstall` — uninstall an app instance.\nBody: `{ 'instance_id': 'uuid' }`. Deletes the instance if it belongs\nto the caller's org/env (RLS-enforced).",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/app/instance-get",
          label: "`GET /v1/app/admin/instances/{id}` — instance admin detail.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/app/instance-domain",
          label: "`PUT /v1/app/admin/instances/{id}/domain` — update custom domain (with DNS TXT validation).",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/app/instance-env-vars",
          label: "`PUT /v1/app/admin/instances/{id}/env-vars` — update env var secret references.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/app/instance-env-vars-resolve",
          label: "`GET /v1/app/admin/instances/{id}/env-vars/resolve` — resolve the\ninstance's stored env-vars secret reference through the shared\n`sentin8-secrets` resolver chain ( story 34.2.5). Returns the\nresolved value once; never logged. Requires the instances:admin scope.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/app/instance-feature-flags",
          label: "`PUT /v1/app/admin/instances/{id}/feature-flags` — update feature flags.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/app/instance-oauth",
          label: "`GET /v1/app/admin/instances/{id}/oauth-client` — get OAuth client (DCR summary).",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/app/instance-status",
          label: "`PUT /v1/app/admin/instances/{id}/status` — update instance status.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/app/instances-customer-mode",
          label: "`GET /v1/app/instances/customer-mode?env_id=…` — enumerate the\ncustomer-mode (`allow_signup`) instances installed in an env (auth\nDESIGN invariant 12: the owner-API replacement for auth's retired\ndirect read of `sys.app_instances`).",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/app/runtime-context",
          label: "Stories , , -34 — `GET /v1/app/runtime/context`.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/app/setup-create",
          label: "`POST /v1/app/setup` — create an app instance (atomic).",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/app/setup-status",
          label: "`GET /v1/app/setup/{instanceId}/status` — provisioning status.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/app/store-list",
          label: "List published store listings visible to the caller (RLS-scoped).\n`?category=` filters to listings carrying that category (APP-3).",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/app/store-create",
          label: "`POST /v1/app/store/listings` — create a store listing.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/app/store-get",
          label: "`GET /v1/app/store/listings/{id}` — listing detail.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/app/store-update",
          label: "`PUT /v1/app/store/listings/{id}` — update a listing (catalog admin).",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/app/store-archive",
          label: "Story — `DELETE /v1/app/store/listings/{id}` — archive a listing (soft delete).\nSets `status = 'archived'` so the listing is hidden from the public store but retained for audit.\n`DELETE /v1/app/store/listings/{id}` — archive a listing (soft delete).",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/app/execute-internal-step",
          label: "`POST /v1/internal/steps/execute` — App step handler called by Flow (proxy-back).",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "admin-ui",
      items: [
        {
          type: "doc",
          id: "api/app/get-admin-ui",
          label: "`GET /v1/admin/ui/{page}` — RFW page definition for the requested page.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/app/get-admin-data",
          label: "`GET /v1/admin/{resource}` — returns a JSON array of admin data rows.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "meta",
      items: [
        {
          type: "doc",
          id: "api/app/health",
          label: "`GET /v1/health` — liveness probe.",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
