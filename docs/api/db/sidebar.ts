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
          label: "policy_list_attributes",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/policy-put-attribute",
          label: "policy_put_attribute",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/db/policy-delete-attribute",
          label: "policy_delete_attribute",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/db/policy-delete-attribute-path",
          label: "policy_delete_attribute_path",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-list-decisions",
          label: "policy_list_decisions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/policy-list-sets",
          label: "policy_list_sets",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/policy-create-set",
          label: "policy_create_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-mode-disable",
          label: "policy_mode_disable",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-mode-enforce",
          label: "policy_mode_enforce",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-mode-shadow",
          label: "policy_mode_shadow",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-get-set",
          label: "policy_get_set",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/policy-put-set",
          label: "policy_put_set",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/db/policy-delete-set",
          label: "policy_delete_set",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/db/policy-save-set",
          label: "policy_save_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-test-set",
          label: "policy_test_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-flip-set",
          label: "policy_flip_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/policy-list-relations",
          label: "policy_list_relations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/policy-put-relation",
          label: "policy_put_relation",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/db/policy-delete-relation",
          label: "policy_delete_relation",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/db/policy-check-relation",
          label: "policy_check_relation",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/policy-delete-relation-path",
          label: "policy_delete_relation_path",
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
          label: "`GET /v1/audit` — DDL audit log (Stories).\nHandle audit log.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/data-delete",
          label: "Delete it.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/data-insert",
          label: "`POST /v1/data/insert` — insert rows with mandatory system columns.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/data-query",
          label: "`POST /v1/data/query` — query rows with filters, sorts, pagination.\nSoft-deleted rows (`deleted_at IS NOT NULL`) are excluded.\nHandle query.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/data-update",
          label: "Update it.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/posture-get",
          label: "`GET /v1/posture` — RLS drift detection (Stories).\nHandle posture.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/table-list",
          label: "`GET /v1/tables` — list active tables for the resolved env.\nList tables.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/table-create",
          label: "`POST /v1/tables` — create a table with mandatory system columns + RLS.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/table-get",
          label: "`GET /v1/tables/{id}` — get table metadata. Env-scoped + authenticated\n; a foreign-env id 404s.\nFetch table.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/table-alter",
          label: "Handle alter table.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/table-archive",
          label: "`POST /v1/tables/{id}/archive` — mark a table as archived (Stories).\nEnv-scoped; registry update, audit row, and event commit together.\nArchive table.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/table-drop",
          label: "`POST /v1/tables/{id}/drop` — pending-delete then drop (Stories).\nEnv-scoped; registry status, physical DROP, audit row, and event commit\ntogether — a failed DROP rolls the registry status back.\nHandle drop table.",
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
          label: "GET handler for the literal `/v1/admin/tables` route (the POST alias\nshares the path; without an explicit GET registration axum answers 405).\nFetch admin data for tables.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/admin-create-table",
          label: "`POST /v1/admin/tables` — create-table form submission (RFW renderer\nonly supports POST). Delegates to the main create handler.\nHandle admin create table.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/admin-archive-table",
          label: "`POST /v1/admin/tables/{id}/archive` — archive row action.\nHandle admin archive table.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/admin-drop-table",
          label: "`POST /v1/admin/tables/{id}/drop` — drop row action.\nHandle admin drop table.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/db/get-admin-ui",
          label: "Fetch admin ui.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/db/get-admin-data",
          label: "`GET /v1/admin/{resource}` — returns a JSON array of admin data rows.\nRegistry-backed for `tables`, live posture findings for `posture`,\nrecent DDL audit entries for `audit`. Cross-env via `target_env_id`\nrequires `sentin8:sys:admin` (handlers::TargetEnvQuery validation applies).\nFetch admin data.",
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
          label: "Handle health.",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
