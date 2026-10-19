import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "category",
      label: "policy",
      link: {
        type: "doc",
        id: "api/func/sentin-8-func",
      },
      items: [
        {
          type: "doc",
          id: "api/func/policy-list-attributes",
          label: "policy_list_attributes",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/func/policy-put-attribute",
          label: "policy_put_attribute",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/func/policy-delete-attribute",
          label: "policy_delete_attribute",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/func/policy-list-sets",
          label: "policy_list_sets",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/func/policy-mode-disable",
          label: "policy_mode_disable",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/func/policy-mode-enforce",
          label: "policy_mode_enforce",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/func/policy-mode-shadow",
          label: "policy_mode_shadow",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/func/policy-get-set",
          label: "policy_get_set",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/func/policy-put-set",
          label: "policy_put_set",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/func/policy-delete-set",
          label: "policy_delete_set",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/func/policy-test-set",
          label: "policy_test_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/func/policy-list-relations",
          label: "policy_list_relations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/func/policy-put-relation",
          label: "policy_put_relation",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/func/policy-delete-relation",
          label: "policy_delete_relation",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/func/policy-check-relation",
          label: "policy_check_relation",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "func",
      link: {
        type: "doc",
        id: "api/func/sentin-8-func",
      },
      items: [
        {
          type: "doc",
          id: "api/func/module-list",
          label: "`GET /v1/modules`\nList it.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/func/module-upload",
          label: "`POST /v1/modules` — upload a new WASM module.\nHandle upload.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/func/execute-product",
          label: "`POST /v1/modules/product/{product_id}/execute` — execute a hook on the\nproduct's currently-ACTIVE version (the `latest` pointer; func DESIGN\n§4). The pinned-by-id route is the exact-version surface; this is the\nconvenience route for callers that track products, not versions.\nExecute on product.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/func/module-get",
          label: "`GET /v1/modules/{id}`\nFetch it.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/func/module-delete",
          label: "`DELETE /v1/modules/{id}`\nDelete it.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/func/module-activate",
          label: "`POST /v1/modules/{id}/activate`\nHandle activate.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/func/module-delete",
          label: "`POST /v1/modules/{id}/delete` — RFW alias of `DELETE /v1/modules/{id}`.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/func/module-execute",
          label: "`POST /v1/modules/{id}/execute`\nExecute it.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/func/module-validate",
          label: "`POST /v1/modules/{id}/validate` — re-validate the stored binary.\nValidate it.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/func/module-download",
          label: "`GET /v1/modules/{id}/wasm` — download the raw WASM binary from Storage.\nFetch wasm.",
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
          id: "api/func/get-admin-ui",
          label: "Fetch admin ui.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/func/get-admin-data",
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
          id: "api/func/health",
          label: "Handle health.",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
