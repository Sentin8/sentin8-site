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
          label: "policy_list_attributes",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/policy-put-attribute",
          label: "policy_put_attribute",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/cron/policy-delete-attribute",
          label: "policy_delete_attribute",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/cron/policy-list-sets",
          label: "policy_list_sets",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/policy-mode-disable",
          label: "policy_mode_disable",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/policy-mode-enforce",
          label: "policy_mode_enforce",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/policy-mode-shadow",
          label: "policy_mode_shadow",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/policy-get-set",
          label: "policy_get_set",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/policy-put-set",
          label: "policy_put_set",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/cron/policy-delete-set",
          label: "policy_delete_set",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/cron/policy-test-set",
          label: "policy_test_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/policy-list-relations",
          label: "policy_list_relations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/policy-put-relation",
          label: "policy_put_relation",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/cron/policy-delete-relation",
          label: "policy_delete_relation",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/cron/policy-check-relation",
          label: "policy_check_relation",
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
          label: "`GET /v1/dlq`\nList dlq.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/dlq-get",
          label: "`GET /v1/dlq/{id}` — DLQ item detail.\nFetch dlq.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/dlq-republish",
          label: "`POST /v1/dlq/{id}/republish` — republish a DLQ item as a new pending\njob and delete the DLQ row.\nHandle republish dlq.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/job-list",
          label: "`GET /v1/jobs`\nList jobs.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/job-get",
          label: "`GET /v1/jobs/{id}` — job detail.\nFetch job.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/job-retry",
          label: "`POST /v1/jobs/{id}/retry` — reset a failed job to `pending` with\n`next_attempt_at = now`; the ticker drains it on the next tick\n.\nRetry job.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/schedule-list",
          label: "`GET /v1/schedules`\nList schedules.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/schedule-create",
          label: "`POST /v1/schedules`\nCreate schedule.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/schedule-get",
          label: "`GET /v1/schedules/{id}` — schedule detail.\nFetch schedule.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/schedule-delete",
          label: "`DELETE /v1/schedules/{id}`\nDelete schedule.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/cron/schedule-update",
          label: "Update schedule status.",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api/cron/delete-schedule-alias",
          label: "`POST /v1/schedules/{id}/delete` — RFW renderer alias of\n`DELETE /v1/schedules/{id}` (same operation, same gates).",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/schedule-pause",
          label: "`POST /v1/schedules/{id}/pause`\nPause schedule.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/cron/schedule-resume",
          label: "`POST /v1/schedules/{id}/resume`\nResume schedule.",
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
          label: "Fetch admin ui.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/cron/get-admin-data",
          label: "`GET /v1/admin/{resource}` — returns a JSON array of admin data rows.\nSECURITY: `target_env_id` is REQUIRED — no fallback to the token's env_id.\nThe caller must explicitly specify which env they are administering.\nRLS context is set before querying to enforce tenant isolation.\nFetch admin data.",
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
          label: "`GET /v1/health` — status, ticker heartbeat, active schedule count.",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
