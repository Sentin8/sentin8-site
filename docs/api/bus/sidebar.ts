import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "category",
      label: "bus",
      link: {
        type: "doc",
        id: "api/bus/sentin-8-bus",
      },
      items: [
        {
          type: "doc",
          id: "api/bus/ack-send",
          label: "Handle ack.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/consume-list",
          label: "Handle consume.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/sse-handler",
          label: "Long-lived SSE consume (server → client one-way) — the direct-consumer\ntransport (bus DESIGN §4.3): the client receives every stream message\nas an SSE event and ACKs via `POST /v1/ack`.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/dlq-list",
          label: "List dlq.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/dlq-replay",
          label: "Handle replay dlq.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/metrics-get",
          label: "Handle metrics.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/nack-send",
          label: "Handle nack.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/produce-send",
          label: "Handle produce.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/produce-batch",
          label: "`POST /v1/produce/batch` — produce N events in one call (BUS-3, bus\nDESIGN §4.3 / README §7). Each row runs through the SAME single-produce\ncore (validation, rate limit, inbox persist, XADD, stamp, audit) — the\nbatch is a transport-level optimization, not a transaction: rows are\nindependent and a failed row does not roll back its siblings.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/schedule-create",
          label: "Handle schedule.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/scheduled-list",
          label: "List scheduled.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/stream-list",
          label: "List streams.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/stream-lag",
          label: "Handle stream lag.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "policy",
      items: [
        {
          type: "doc",
          id: "api/bus/policy-list-attributes",
          label: "policy_list_attributes",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/policy-put-attribute",
          label: "policy_put_attribute",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/bus/policy-delete-attribute",
          label: "policy_delete_attribute",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/bus/policy-list-sets",
          label: "policy_list_sets",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/policy-mode-disable",
          label: "policy_mode_disable",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/policy-mode-enforce",
          label: "policy_mode_enforce",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/policy-mode-shadow",
          label: "policy_mode_shadow",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/policy-get-set",
          label: "policy_get_set",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/policy-put-set",
          label: "policy_put_set",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/bus/policy-delete-set",
          label: "policy_delete_set",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/bus/policy-test-set",
          label: "policy_test_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/policy-list-relations",
          label: "policy_list_relations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/policy-put-relation",
          label: "policy_put_relation",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/bus/policy-delete-relation",
          label: "policy_delete_relation",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/bus/policy-check-relation",
          label: "policy_check_relation",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "admin-ui",
      items: [
        {
          type: "doc",
          id: "api/bus/get-admin-ui",
          label: "Fetch admin ui.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/get-admin-data",
          label: "Fetch admin data.",
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
          id: "api/bus/health",
          label: "Liveness (captain monitor payload).",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
