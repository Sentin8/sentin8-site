import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "category",
      label: "policy",
      link: {
        type: "doc",
        id: "api/db/sentin-8-db",
      },
      items: [
        {
          type: "doc",
          id: "api/db/policy-list-attributes",
          label: "`GET /v1/admin/attributes`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/policy-put-attribute",
          label: "`PUT /v1/admin/attributes`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/db/policy-delete-attribute",
          label: "`DELETE /v1/admin/attributes`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/db/policy-delete-attribute-path",
          label: "`POST /v1/admin/attributes/{id}/delete`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-list-decisions",
          label: "`GET /v1/admin/policy-decisions`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/policy-list-sets",
          label: "`GET /v1/admin/policy-sets`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/policy-create-set",
          label: "`POST /v1/admin/policy-sets`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-mode-disable",
          label: "`POST /v1/admin/policy-sets/disable`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-mode-enforce",
          label: "`POST /v1/admin/policy-sets/enforce`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-mode-shadow",
          label: "`POST /v1/admin/policy-sets/shadow`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-get-set",
          label: "`GET /v1/admin/policy-sets/{name}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/policy-put-set",
          label: "`PUT /v1/admin/policy-sets/{name}`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/db/policy-delete-set",
          label: "`DELETE /v1/admin/policy-sets/{name}`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/db/policy-save-set",
          label: "`POST /v1/admin/policy-sets/{name}/save`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-test-set",
          label: "`POST /v1/admin/policy-sets/{name}/test`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-flip-set",
          label: "`POST /v1/admin/policy-sets/{name}/{action}`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-list-relations",
          label: "`GET /v1/admin/relations`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/policy-put-relation",
          label: "`PUT /v1/admin/relations`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/db/policy-delete-relation",
          label: "`DELETE /v1/admin/relations`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/db/policy-check-relation",
          label: "`GET /v1/admin/relations/check`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/policy-delete-relation-path",
          label: "`POST /v1/admin/relations/{id}/delete`",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "db",
      link: {
        type: "doc",
        id: "api/db/sentin-8-db",
      },
      items: [
        {
          type: "doc",
          id: "api/db/audit-list",
          label: "`GET /v1/audit`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/data-delete",
          label: "`POST /v1/data/delete`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/data-insert",
          label: "`POST /v1/data/insert`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/data-query",
          label: "`POST /v1/data/query`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/data-update",
          label: "`POST /v1/data/update`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/posture-get",
          label: "`GET /v1/posture`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/table-list",
          label: "`GET /v1/tables`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/table-create",
          label: "`POST /v1/tables`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/table-get",
          label: "`GET /v1/tables/{id}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/table-alter",
          label: "`POST /v1/tables/{id}/alter`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/table-archive",
          label: "`POST /v1/tables/{id}/archive`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/table-drop",
          label: "`POST /v1/tables/{id}/drop`",
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
          id: "api/db/get-admin-data-for-tables",
          label: "`GET /v1/admin/tables`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/admin-create-table",
          label: "`POST /v1/admin/tables`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/admin-archive-table",
          label: "`POST /v1/admin/tables/{id}/archive`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/admin-drop-table",
          label: "`POST /v1/admin/tables/{id}/drop`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/get-admin-ui",
          label: "`GET /v1/admin/ui/{page}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/get-admin-data",
          label: "`GET /v1/admin/{resource}`",
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
          id: "api/db/health",
          label: "`GET /v1/health`",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
