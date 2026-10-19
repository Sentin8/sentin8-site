import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "category",
      label: "policy",
      link: {
        type: "doc",
        id: "api/flow/sentin-8-flow",
      },
      items: [
        {
          type: "doc",
          id: "api/flow/policy-list-attributes",
          label: "policy_list_attributes",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/flow/policy-put-attribute",
          label: "policy_put_attribute",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/flow/policy-delete-attribute",
          label: "policy_delete_attribute",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/flow/policy-list-sets",
          label: "policy_list_sets",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/flow/policy-mode-disable",
          label: "policy_mode_disable",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/flow/policy-mode-enforce",
          label: "policy_mode_enforce",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/flow/policy-mode-shadow",
          label: "policy_mode_shadow",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/flow/policy-get-set",
          label: "policy_get_set",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/flow/policy-put-set",
          label: "policy_put_set",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/flow/policy-delete-set",
          label: "policy_delete_set",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/flow/policy-test-set",
          label: "policy_test_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/flow/policy-list-relations",
          label: "policy_list_relations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/flow/policy-put-relation",
          label: "policy_put_relation",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/flow/policy-delete-relation",
          label: "policy_delete_relation",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/flow/policy-check-relation",
          label: "policy_check_relation",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "flow",
      link: {
        type: "doc",
        id: "api/flow/sentin-8-flow",
      },
      items: [
        {
          type: "doc",
          id: "api/flow/register-handler",
          label: "`POST /v1/handlers/register` — register a domain's step handler profile.\nRegister handler.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/flow/workflow-list",
          label: "`GET /v1/workflows`\nList workflows.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/flow/workflow-create",
          label: "`POST /v1/workflows` — create + start workflow.\nCreate workflow.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/flow/workflow-get",
          label: "`GET /v1/workflows/{id}`\nFetch workflow.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/flow/workflow-cancel",
          label: "`POST /v1/workflows/{id}/cancel`\nCancel workflow.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/flow/workflow-repair",
          label: "`POST /v1/workflows/{id}/repair` — rewind to a step and reprocess.\nRepair workflow.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/flow/workflow-resume",
          label: "`POST /v1/workflows/{id}/resume` — resume from waiting state (manual decision, async HTTP, schedule).\nResume workflow.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/flow/workflow-retry",
          label: "`POST /v1/workflows/{id}/retry` — retry a failed workflow from the failed step.\nRetry workflow.",
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
          id: "api/flow/get-admin-ui",
          label: "Fetch admin ui.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/flow/get-admin-data",
          label: "`GET /v1/admin/{resource}` — returns a JSON array of admin data rows.\nFetch admin data.",
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
          id: "api/flow/health",
          label: "Handle health.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "internal",
      items: [
        {
          type: "doc",
          id: "api/flow/internal-async-callback",
          label: "`POST /v1/internal/callbacks/async` — external callback to resume a waiting workflow.\nHandle internal async callback.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/flow/internal-schedule-run",
          label: "`POST /v1/internal/schedules/run` — Cron calls this to resume due scheduled workflows.\nHandle internal schedule run.",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
