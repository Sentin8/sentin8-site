import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "category",
      label: "policy",
      link: {
        type: "doc",
        id: "api/secrets/sentin-8-secrets-server",
      },
      items: [
        {
          type: "doc",
          id: "api/secrets/policy-list-attributes",
          label: "`GET /v1/admin/attributes`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/policy-put-attribute",
          label: "`PUT /v1/admin/attributes`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/secrets/policy-delete-attribute",
          label: "`DELETE /v1/admin/attributes`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/secrets/policy-list-sets",
          label: "`GET /v1/admin/policy-sets`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/policy-mode-disable",
          label: "`POST /v1/admin/policy-sets/disable`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/policy-mode-enforce",
          label: "`POST /v1/admin/policy-sets/enforce`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/policy-mode-shadow",
          label: "`POST /v1/admin/policy-sets/shadow`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/policy-get-set",
          label: "`GET /v1/admin/policy-sets/{name}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/policy-put-set",
          label: "`PUT /v1/admin/policy-sets/{name}`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/secrets/policy-delete-set",
          label: "`DELETE /v1/admin/policy-sets/{name}`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/secrets/policy-test-set",
          label: "`POST /v1/admin/policy-sets/{name}/test`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/policy-list-relations",
          label: "`GET /v1/admin/relations`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/policy-put-relation",
          label: "`PUT /v1/admin/relations`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/secrets/policy-delete-relation",
          label: "`DELETE /v1/admin/relations`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/secrets/policy-check-relation",
          label: "`GET /v1/admin/relations/check`",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "secrets",
      link: {
        type: "doc",
        id: "api/secrets/sentin-8-secrets-server",
      },
      items: [
        {
          type: "doc",
          id: "api/secrets/secrets-health",
          label: "`GET /v1/health`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/secrets-internal-schedules-run",
          label: "`POST /v1/internal/schedules/run`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/secret-list",
          label: "`GET /v1/secrets`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/secrets-maintenance-prune",
          label: "`POST /v1/secrets/maintenance/prune`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/secrets-maintenance-re-encrypt",
          label: "`POST /v1/secrets/maintenance/re-encrypt`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/secret-resolve",
          label: "`POST /v1/secrets/resolve`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/secret-get",
          label: "`GET /v1/secrets/{name}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/secret-upsert",
          label: "`PUT /v1/secrets/{name}`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/secrets/secret-delete",
          label: "`DELETE /v1/secrets/{name}`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/secrets/secret-history",
          label: "`GET /v1/secrets/{name}/history`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/secret-reads",
          label: "`GET /v1/secrets/{name}/reads`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/secret-reveal",
          label: "`GET /v1/secrets/{name}/reveal`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/secret-rotate",
          label: "`POST /v1/secrets/{name}/rotate`",
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
          id: "api/secrets/get-admin-data-secrets",
          label: "`GET /v1/admin/secrets`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/admin-put-secret",
          label: "`POST /v1/admin/secrets`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/admin-rotate-secret",
          label: "`POST /v1/admin/secrets/rotate`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/admin-disable-secret",
          label: "`POST /v1/admin/secrets/{name}/disable`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/admin-reveal-secret",
          label: "`POST /v1/admin/secrets/{name}/reveal`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/get-admin-ui",
          label: "`GET /v1/admin/ui/{page}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/get-admin-data",
          label: "`GET /v1/admin/{resource}`",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
