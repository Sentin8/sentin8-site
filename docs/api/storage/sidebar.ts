import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "category",
      label: "policy",
      link: {
        type: "doc",
        id: "api/storage/sentin-8-storage",
      },
      items: [
        {
          type: "doc",
          id: "api/storage/policy-list-attributes",
          label: "policy_list_attributes",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/policy-put-attribute",
          label: "policy_put_attribute",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/storage/policy-delete-attribute",
          label: "policy_delete_attribute",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/storage/policy-list-sets",
          label: "policy_list_sets",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/policy-mode-disable",
          label: "policy_mode_disable",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/policy-mode-enforce",
          label: "policy_mode_enforce",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/policy-mode-shadow",
          label: "policy_mode_shadow",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/policy-get-set",
          label: "policy_get_set",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/policy-put-set",
          label: "policy_put_set",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/storage/policy-delete-set",
          label: "policy_delete_set",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/storage/policy-test-set",
          label: "policy_test_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/policy-list-relations",
          label: "policy_list_relations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/policy-put-relation",
          label: "policy_put_relation",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/storage/policy-delete-relation",
          label: "policy_delete_relation",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/storage/policy-check-relation",
          label: "policy_check_relation",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "storage",
      link: {
        type: "doc",
        id: "api/storage/sentin-8-storage",
      },
      items: [
        {
          type: "doc",
          id: "api/storage/public-read-env",
          label: "`GET /v1/public/env/{env_id}/objects/{*path}` — env-scoped public read.\nNo auth required. Only serves image extensions.\nHandle public read env.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/public-read",
          label: "`GET /v1/public/objects/{*path}` — platform-scoped public read for image assets.\nNo auth required. Only serves image extensions. Uses system env storage prefix.\nHandle public read.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/object-list",
          label: "`GET /v1/storage/objects` — list objects with optional prefix.\nList objects.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/object-download",
          label: "`GET /v1/storage/objects/{path}` — download an object.\nFetch object.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/object-upload",
          label: "`PUT /v1/storage/objects/{path}` — upload an object.\nHandle PUT object.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/storage/object-action",
          label: "`POST /v1/storage/objects/{*path}` — dispatch sign-read, sign-upload, copy, move.\nHandle object action.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/object-delete",
          label: "`DELETE /v1/storage/objects/{path}` — delete an object.\nDelete object.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/storage/object-head",
          label: "`HEAD /v1/storage/objects/{path}` — existence + size probe without\nreading the payload (the dedup fast path every\ncontent-addressed vertical uses before writing).\nHandle head object.",
          className: "api-method head",
        },
        {
          type: "doc",
          id: "api/storage/signed-serve",
          label: "`GET /v1/storage/signed/{token}` — serve object via signed URL.\nServe signed.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/signed-upload",
          label: "`PUT /v1/storage/signed/{token}` — store object via signed upload URL.\nHandle upload signed.",
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
          id: "api/storage/list-buckets",
          label: "`GET /v1/admin/buckets` — list buckets (top-level prefixes).\nThis is a dedicated handler because the route `/v1/admin/buckets` also\nhas a POST handler, so the catch-all `/v1/admin/{resource}` route is\nshadowed for GET requests.\nList buckets.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/create-bucket",
          label: "`POST /v1/admin/buckets` — create a bucket by placing a `.keep` marker\nobject at the bucket path. Returns an RFW redirect to the buckets list.\nCreate bucket.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/list-bucket-objects",
          label: "`GET /v1/admin/buckets/objects?bucket=name` — list objects in a bucket.\nList bucket objects.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/upload-file",
          label: "`POST /v1/admin/buckets/upload` — upload a file to a bucket.\nHandle upload file.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/delete-bucket",
          label: "`POST /v1/admin/buckets/{id}/delete` — delete a bucket and all its objects.\nDelete bucket.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/download-object",
          label: "`GET /v1/admin/buckets/{id}/download?object={name}` — download an object.\nReturns the raw bytes as a binary stream.\nHandle download object.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/generate-link",
          label: "`POST /v1/admin/buckets/{id}/link` — generate a signed read URL for an object.\nGenerate link.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/delete-object",
          label: "`POST /v1/admin/buckets/{id}/objects/{object}/delete` — delete a single object.\nDelete object.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/get-admin-ui",
          label: "Fetch admin ui.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/get-admin-data",
          label: "`GET /v1/admin/{resource}` — returns a JSON array of admin data rows.",
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
          id: "api/storage/health",
          label: "Handle health.",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
