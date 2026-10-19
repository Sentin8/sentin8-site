import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "category",
      label: "policy",
      link: {
        type: "doc",
        id: "api/cron/sentin-8-cron",
      },
      items: [
        {
          type: "doc",
          id: "api/cron/policy-list-attributes",
          label: "`GET /v1/admin/attributes`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/policy-put-attribute",
          label: "`PUT /v1/admin/attributes`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/cron/policy-delete-attribute",
          label: "`DELETE /v1/admin/attributes`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/cron/policy-list-sets",
          label: "`GET /v1/admin/policy-sets`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/policy-mode-disable",
          label: "`POST /v1/admin/policy-sets/disable`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/policy-mode-enforce",
          label: "`POST /v1/admin/policy-sets/enforce`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/policy-mode-shadow",
          label: "`POST /v1/admin/policy-sets/shadow`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/policy-get-set",
          label: "`GET /v1/admin/policy-sets/{name}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/policy-put-set",
          label: "`PUT /v1/admin/policy-sets/{name}`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/cron/policy-delete-set",
          label: "`DELETE /v1/admin/policy-sets/{name}`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/cron/policy-test-set",
          label: "`POST /v1/admin/policy-sets/{name}/test`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/policy-list-relations",
          label: "`GET /v1/admin/relations`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/policy-put-relation",
          label: "`PUT /v1/admin/relations`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/cron/policy-delete-relation",
          label: "`DELETE /v1/admin/relations`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/cron/policy-check-relation",
          label: "`GET /v1/admin/relations/check`",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "cron",
      link: {
        type: "doc",
        id: "api/cron/sentin-8-cron",
      },
      items: [
        {
          type: "doc",
          id: "api/cron/dlq-list",
          label: "`GET /v1/dlq`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/dlq-get",
          label: "`GET /v1/dlq/{id}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/dlq-republish",
          label: "`POST /v1/dlq/{id}/republish`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/job-list",
          label: "`GET /v1/jobs`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/job-get",
          label: "`GET /v1/jobs/{id}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/job-retry",
          label: "`POST /v1/jobs/{id}/retry`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/schedule-list",
          label: "`GET /v1/schedules`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/schedule-create",
          label: "`POST /v1/schedules`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/schedule-get",
          label: "`GET /v1/schedules/{id}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/schedule-delete",
          label: "`DELETE /v1/schedules/{id}`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/cron/schedule-update",
          label: "`PATCH /v1/schedules/{id}`",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/cron/delete-schedule-alias",
          label: "`POST /v1/schedules/{id}/delete`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/schedule-pause",
          label: "`POST /v1/schedules/{id}/pause`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/schedule-resume",
          label: "`POST /v1/schedules/{id}/resume`",
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
          id: "api/cron/get-admin-ui",
          label: "`GET /v1/admin/ui/{page}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/get-admin-data",
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
          id: "api/cron/health",
          label: "`GET /v1/health`",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
