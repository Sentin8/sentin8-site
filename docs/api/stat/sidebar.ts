import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "category",
      label: "policy",
      link: {
        type: "doc",
        id: "api/stat/sentin-8-stat",
      },
      items: [
        {
          type: "doc",
          id: "api/stat/policy-list-attributes",
          label: "policy_list_attributes",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/policy-put-attribute",
          label: "policy_put_attribute",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/stat/policy-delete-attribute",
          label: "policy_delete_attribute",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/stat/policy-list-sets",
          label: "policy_list_sets",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/policy-mode-disable",
          label: "policy_mode_disable",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/policy-mode-enforce",
          label: "policy_mode_enforce",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/policy-mode-shadow",
          label: "policy_mode_shadow",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/policy-get-set",
          label: "policy_get_set",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/policy-put-set",
          label: "policy_put_set",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/stat/policy-delete-set",
          label: "policy_delete_set",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/stat/policy-test-set",
          label: "policy_test_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/policy-list-relations",
          label: "policy_list_relations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/policy-put-relation",
          label: "policy_put_relation",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/stat/policy-delete-relation",
          label: "policy_delete_relation",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/stat/policy-check-relation",
          label: "policy_check_relation",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "stat",
      link: {
        type: "doc",
        id: "api/stat/sentin-8-stat",
      },
      items: [
        {
          type: "doc",
          id: "api/stat/account-list",
          label: "`GET /v1/admin/accounts`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/account-create",
          label: "`POST /v1/admin/accounts`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/property-list",
          label: "`GET /v1/admin/properties`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/property-create",
          label: "`POST /v1/admin/properties`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/property-get",
          label: "`GET /v1/admin/properties/{id}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/property-update",
          label: "`PUT /v1/admin/properties/{id}`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/stat/property-delete",
          label: "`DELETE /v1/admin/properties/{id}`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/stat/alert-rule-list",
          label: "`GET /v1/admin/properties/{id}/alert-rules`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/alert-rule-create",
          label: "`POST /v1/admin/properties/{id}/alert-rules`\nCreate a per-property custom alert rule (stat README §7). The request\nis validated against the known rule types, comparators, and metric\nvocabulary (400 on unknown); the property must exist in the target\nenv (404). The INSERT runs in one explicit transaction with the RLS\ncontext set on the same connection (stat DESIGN §5).",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/alert-rule-delete",
          label: "`DELETE /v1/admin/properties/{id}/alert-rules/{rule_id}`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/stat/property-delete",
          label: "`POST /v1/admin/properties/{id}/delete` — RFW alias of\n`DELETE /v1/admin/properties/{id}`.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/property-reaggregate",
          label: "`POST /v1/admin/properties/{id}/reaggregate`\nDelete and rebuild the property's day-granularity `metrics` rollups over\na raw-events window (stat README §7). v1 reaggregates from `stat.events`\nONLY — a window reaching past the property's retention horizon is a 400\n(the spilled raw data lives in Storage archives; per stat DESIGN §4.3.6\nthe archive spill is the source-of-truth boundary and the Storage-archive\nreplay path is out of scope for this endpoint). The recomputation shares the\nbackground rollup's SQL via\n`crate::worker::rollups::reaggregate_property`.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/retention-set",
          label: "`PUT /v1/admin/properties/{id}/retention`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/stat/setting-get",
          label: "`GET /v1/admin/properties/{id}/settings`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/setting-update",
          label: "`PUT /v1/admin/properties/{id}/settings`",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "admin-ui",
      items: [
        {
          type: "doc",
          id: "api/stat/get-admin-ui",
          label: "Fetch admin ui.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/get-admin-data",
          label: "`GET /v1/admin/{resource}` — returns a JSON array of admin data rows.\nFetch admin data.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "data",
      items: [
        {
          type: "doc",
          id: "api/stat/create-funnel",
          label: "`POST /v1/data/funnels` — define a funnel.\nCreate funnel.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/get-funnel",
          label: "`GET /v1/data/funnels/{id}` — funnel report.\nFetch funnel.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/metrics",
          label: "`GET /v1/data/metrics` — server-telemetry time-series from\n`sentin8_stat_aggregate_metrics_daily`.\nHandle metrics.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/query",
          label: "`POST /v1/data/query` — arbitrary aggregate query (JSON DSL, aggregates only).\nHandle query.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/realtime",
          label: "`GET /v1/data/realtime` — real-time active users (last 5 min, in-memory).",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/list-reports",
          label: "`GET /v1/data/reports` — list available report templates.\nList reports.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/run-report",
          label: "`GET /v1/data/reports/{report_id}` — run a pre-canned report.\nRun report.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/retention",
          label: "`GET /v1/data/retention` — cohort retention (reads sessions aggregate).\nHandle retention.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/sessions",
          label: "`GET /v1/data/sessions` — session breakdown.\nHandle sessions.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/traffic",
          label: "`GET /v1/data/traffic` — TLS inter-service traffic matrix.",
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
          id: "api/stat/health",
          label: "Handle health.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/readiness",
          label: "Handle readiness.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "ingest",
      items: [
        {
          type: "doc",
          id: "api/stat/batch",
          label: "`POST /v1/m/batch` — server-side batch (M2M required, higher limits).\nHandle batch.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/pixel",
          label: "Handle pixel.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/stat/collect",
          label: "`POST /v1/m/collect` — batch ingest (max 100 events / 1 MiB).\nHandle collect.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/conversion",
          label: "`POST /v1/m/conversion`\nHandle conversion.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/event",
          label: "`POST /v1/m/event`\nHandle event.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/metric",
          label: "`POST /v1/m/metric` — server-only telemetry (requires `sentin8:stat:measure`).\nHandle metric.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/stat/pageview",
          label: "`POST /v1/m/pageview`\nHandle pageview.",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
