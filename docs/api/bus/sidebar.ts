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
          label: "`POST /v1/ack`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/consume-list",
          label: "`POST /v1/consume`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/sse-handler",
          label: "`GET /v1/consume/sse`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/dlq-list",
          label: "`GET /v1/dlq`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/dlq-replay",
          label: "`POST /v1/dlq/replay`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/metrics-get",
          label: "`GET /v1/metrics`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/nack-send",
          label: "`POST /v1/nack`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/produce-send",
          label: "`POST /v1/produce`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/produce-batch",
          label: "`POST /v1/produce/batch`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/schedule-create",
          label: "`POST /v1/schedule`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/scheduled-list",
          label: "`GET /v1/scheduled`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/stream-list",
          label: "`GET /v1/streams`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/stream-lag",
          label: "`GET /v1/streams/{stream_family}/lag`",
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
          label: "`GET /v1/admin/attributes`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/policy-put-attribute",
          label: "`PUT /v1/admin/attributes`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/bus/policy-delete-attribute",
          label: "`DELETE /v1/admin/attributes`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/bus/policy-list-sets",
          label: "`GET /v1/admin/policy-sets`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/policy-mode-disable",
          label: "`POST /v1/admin/policy-sets/disable`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/policy-mode-enforce",
          label: "`POST /v1/admin/policy-sets/enforce`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/policy-mode-shadow",
          label: "`POST /v1/admin/policy-sets/shadow`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/policy-get-set",
          label: "`GET /v1/admin/policy-sets/{name}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/policy-put-set",
          label: "`PUT /v1/admin/policy-sets/{name}`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/bus/policy-delete-set",
          label: "`DELETE /v1/admin/policy-sets/{name}`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/bus/policy-test-set",
          label: "`POST /v1/admin/policy-sets/{name}/test`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/bus/policy-list-relations",
          label: "`GET /v1/admin/relations`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/policy-put-relation",
          label: "`PUT /v1/admin/relations`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/bus/policy-delete-relation",
          label: "`DELETE /v1/admin/relations`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/bus/policy-check-relation",
          label: "`GET /v1/admin/relations/check`",
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
          label: "`GET /v1/admin/ui/{page}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/bus/get-admin-data",
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
          id: "api/bus/health",
          label: "`GET /v1/health`",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
