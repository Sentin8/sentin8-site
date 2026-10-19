import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "category",
      label: "post",
      link: {
        type: "doc",
        id: "api/post/sentin-8-post",
      },
      items: [
        {
          type: "doc",
          id: "api/post/dlq-list",
          label: "`GET /v1/dlq` — list dead-lettered deliveries.\n`GET /v1/dlq` — list dead-letter queue entries.\nList dlq.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/post/message-replay",
          label: "`POST /v1/dlq/{id}/replay` — replay a dead-lettered delivery.\n`POST /v1/dlq/{id}/replay` — replay a DLQ entry.\nHandle replay dlq.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/post/gateway-list",
          label: "`GET /v1/gateways` — list gateway configs.\nList gateways.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/post/gateway-create",
          label: "`POST /v1/gateways` — create a gateway config.\n`POST /v1/gateways` — create a gateway config.\nCreate gateway.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/post/gateway-test",
          label: "`POST /v1/gateways/test` — send a test message through a gateway.\n`POST /v1/gateways/test` — test a gateway config.\nHandle test gateway.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/post/gateway-delete",
          label: "`DELETE /v1/gateways/{id}` — delete a gateway config.\n`DELETE /v1/gateways/{id}` — delete a gateway config.\nDelete gateway.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/post/gateway-delete",
          label: "`POST /v1/gateways/{id}/delete` — RFW alias of `DELETE /v1/gateways/{id}`.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/post/message-list",
          label: "List messages.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/post/message-get",
          label: "`GET /v1/messages/{id}` — message detail with all delivery attempts.\nFetch message.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/post/message-content",
          label: "`GET /v1/messages/{id}/content` — message content (subject + body only).\n`GET /v1/messages/{id}/content` — raw message content.\nFetch message content.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/post/message-mark-read",
          label: "`POST /v1/messages/{id}/read` — mark a message as read.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/post/message-replay",
          label: "`POST /v1/messages/{id}/replay` — RFW alias of `POST /v1/dlq/{id}/replay`.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/post/message-send",
          label: "`GET /v1/messages` — list messages in the caller's org/env.\nSend message.",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "policy",
      items: [
        {
          type: "doc",
          id: "api/post/list-attributes",
          label: "List attributes.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/post/put-attribute",
          label: "`PUT /v1/admin/attributes` — upsert one principal attribute.\nValues must be JSON scalars or arrays of scalars (Shield restricted\nexpressions cannot represent nested objects — 422 otherwise).\nHandle PUT attribute.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/post/delete-attribute",
          label: "Delete attribute.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/post/admin-delete-attribute-path",
          label: "`POST /v1/admin/attributes/{id}/delete` — row-action alias.\n`id` is `subject_id:attr_key` as emitted by the RFW list; splitn(2)\nkeeps any colons inside the attribute key.\nHandle admin delete attribute path.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/post/list-policy-decisions",
          label: "`GET /v1/admin/policy-decisions` — deny / would-deny feed for the UI\n. Reads the shared audit trail rows the runtime writes\n(`event->>'action' IN ('policy.deny','policy.would_deny')`).\nList policy decisions.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/post/list-policy-sets",
          label: "`GET /v1/admin/policy-sets` — list this service's policy sets.\nList policy sets.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/post/create-policy-set",
          label: "Create policy set.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/post/admin-disable-policy-set",
          label: "`POST /v1/admin/policy-sets/disable` — disable a set (no-match → deny for\nits actions; use `shadow` for pure observation-off).\nHandle admin disable policy set.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/post/admin-enforce-policy-set",
          label: "`POST /v1/admin/policy-sets/enforce` — promote a set to enforced.\nHandle admin enforce policy set.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/post/admin-shadow-policy-set",
          label: "`POST /v1/admin/policy-sets/shadow` — demote a set to shadow (rollback).\nHandle admin shadow policy set.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/post/get-policy-set",
          label: "`GET /v1/admin/policy-sets/{name}` — fetch one set.\nFetch policy set.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/post/put-policy-set",
          label: "`PUT /v1/admin/policy-sets/{name}` — create/update with write-time\nvalidation. Platform rows are returned read-only (400); tenant\nrows (or new rows) are validated then stored, starting in `shadow`.\nHandle PUT policy set.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/post/delete-policy-set",
          label: "`DELETE /v1/admin/policy-sets/{name}` — tenant sets only.\nDelete policy set.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/post/save-policy-set",
          label: "`POST /v1/admin/policy-sets/{name}/save` — PUT alias for the RFW renderer.\nHandle save policy set.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/post/test-policy-set",
          label: "`POST /v1/admin/policy-sets/{name}/test` — dry-run candidate policy text\nagainst a sample context; returns decision + trace WITHOUT storing.\nHandle test policy set.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/post/admin-path-action-policy-set",
          label: "`POST /v1/admin/policy-sets/{name}/{action}` — path-param row-action\ndispatcher (enforce | shadow | disable | delete). One route shape serves\nall four actions (axum's matchit router cannot register `{name}/delete`\nnext to `{name}/{action}` without a conflict).\nHandle admin path action policy set.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/post/list-relations",
          label: "`GET /v1/admin/relations` — list this service's relation tuples.\nList relations.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/post/put-relation",
          label: "`PUT /v1/admin/relations` — upsert one relation tuple. Tenant\ntuples carry `origin='tenant'`; the UNIQUE key dedupes re-writes.\nHandle PUT relation.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/post/delete-relation",
          label: "`DELETE /v1/admin/relations` — remove one relation tuple (tenant or\nplatform: env admins govern their env's graph; platform tuples are\nre-seeded by enroll on the next `vertical init`).\nDelete relation.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/post/check-relation",
          label: "Check relation.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/post/admin-delete-relation-path",
          label: "`POST /v1/admin/relations/{id}/delete` — row-action alias.\n`id` is the colon-joined tuple the RFW list emits\n(`subject_type:subject_id:relation:object_type:object_id`); parsed\nback-first (the last three segments are relation/object_type/object_id,\nthe first is subject_type, the middle rest is subject_id — tolerant of\ncolons inside subject ids).\nHandle admin delete relation path.",
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
          id: "api/post/get-admin-ui",
          label: "Fetch admin ui.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/post/get-admin-data",
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
          id: "api/post/health",
          label: "Handle health.",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
