import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "category",
      label: "policy",
      link: {
        type: "doc",
        id: "api/sign/sentin-8-sign-server",
      },
      items: [
        {
          type: "doc",
          id: "api/sign/policy-list-attributes",
          label: "`GET /v1/admin/attributes`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/sign/policy-put-attribute",
          label: "`PUT /v1/admin/attributes`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/sign/policy-delete-attribute",
          label: "`DELETE /v1/admin/attributes`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/sign/policy-list-sets",
          label: "`GET /v1/admin/policy-sets`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/sign/policy-mode-disable",
          label: "`POST /v1/admin/policy-sets/disable`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/sign/policy-mode-enforce",
          label: "`POST /v1/admin/policy-sets/enforce`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/sign/policy-mode-shadow",
          label: "`POST /v1/admin/policy-sets/shadow`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/sign/policy-get-set",
          label: "`GET /v1/admin/policy-sets/{name}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/sign/policy-put-set",
          label: "`PUT /v1/admin/policy-sets/{name}`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/sign/policy-delete-set",
          label: "`DELETE /v1/admin/policy-sets/{name}`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/sign/policy-test-set",
          label: "`POST /v1/admin/policy-sets/{name}/test`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/sign/policy-list-relations",
          label: "`GET /v1/admin/relations`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/sign/policy-put-relation",
          label: "`PUT /v1/admin/relations`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/sign/policy-delete-relation",
          label: "`DELETE /v1/admin/relations`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/sign/policy-check-relation",
          label: "`GET /v1/admin/relations/check`",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "sign",
      link: {
        type: "doc",
        id: "api/sign/sentin-8-sign-server",
      },
      items: [
        {
          type: "doc",
          id: "api/sign/sign-request-list",
          label: "`GET /v1/requests`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/sign/sign-request-create",
          label: "`POST /v1/requests`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/sign/sign-request-get",
          label: "`GET /v1/requests/{id}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/sign/sign-request-approve",
          label: "`POST /v1/requests/{id}/approve`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/sign/sign-request-evidence",
          label: "`GET /v1/requests/{id}/evidence`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/sign/sign-request-view",
          label: "`POST /v1/requests/{id}/view`",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "internal",
      link: {
        type: "doc",
        id: "api/sign/sentin-8-sign-server",
      },
      items: [
        {
          type: "doc",
          id: "api/sign/sign-internal-schedules-run",
          label: "`POST /v1/internal/schedules/run`",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "admin-ui",
      link: {
        type: "doc",
        id: "api/sign/sentin-8-sign-server",
      },
      items: [
        {
          type: "doc",
          id: "api/sign/get-admin-data-requests",
          label: "`GET /v1/admin/requests`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/sign/admin-reopen-failed",
          label: "`POST /v1/admin/requests`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/sign/get-admin-ui",
          label: "`GET /v1/admin/ui/{page}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/sign/get-admin-data",
          label: "`GET /v1/admin/{resource}`",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "health",
      items: [
        {
          type: "doc",
          id: "api/sign/sign-health",
          label: "`GET /v1/health`",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
