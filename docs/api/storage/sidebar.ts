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
          label: "`GET /v1/admin/attributes`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/policy-put-attribute",
          label: "`PUT /v1/admin/attributes`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/storage/policy-delete-attribute",
          label: "`DELETE /v1/admin/attributes`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/storage/policy-list-sets",
          label: "`GET /v1/admin/policy-sets`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/policy-mode-disable",
          label: "`POST /v1/admin/policy-sets/disable`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/policy-mode-enforce",
          label: "`POST /v1/admin/policy-sets/enforce`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/policy-mode-shadow",
          label: "`POST /v1/admin/policy-sets/shadow`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/policy-get-set",
          label: "`GET /v1/admin/policy-sets/{name}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/policy-put-set",
          label: "`PUT /v1/admin/policy-sets/{name}`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/storage/policy-delete-set",
          label: "`DELETE /v1/admin/policy-sets/{name}`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/storage/policy-test-set",
          label: "`POST /v1/admin/policy-sets/{name}/test`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/policy-list-relations",
          label: "`GET /v1/admin/relations`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/policy-put-relation",
          label: "`PUT /v1/admin/relations`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/storage/policy-delete-relation",
          label: "`DELETE /v1/admin/relations`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/storage/policy-check-relation",
          label: "`GET /v1/admin/relations/check`",
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
          label: "`GET /v1/public/env/{env_id}/objects/{object_path}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/public-read",
          label: "`GET /v1/public/objects/{object_path}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/object-list",
          label: "`GET /v1/storage/objects`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/object-download",
          label: "`GET /v1/storage/objects/{object_path}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/object-upload",
          label: "`PUT /v1/storage/objects/{object_path}`",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/storage/object-action",
          label: "`POST /v1/storage/objects/{object_path}`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/object-delete",
          label: "`DELETE /v1/storage/objects/{object_path}`",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/storage/object-head",
          label: "`HEAD /v1/storage/objects/{object_path}`",
          className: "api-method head",
        },
        {
          type: "doc",
          id: "api/storage/signed-serve",
          label: "`GET /v1/storage/signed/{token}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/signed-upload",
          label: "`PUT /v1/storage/signed/{token}`",
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
          label: "`GET /v1/admin/buckets`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/create-bucket",
          label: "`POST /v1/admin/buckets`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/list-bucket-objects",
          label: "`GET /v1/admin/buckets/objects`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/upload-file",
          label: "`POST /v1/admin/buckets/upload`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/delete-bucket",
          label: "`POST /v1/admin/buckets/{id}/delete`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/download-object",
          label: "`GET /v1/admin/buckets/{id}/download`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/generate-link",
          label: "`POST /v1/admin/buckets/{id}/link`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/delete-object",
          label: "`POST /v1/admin/buckets/{id}/objects/{object}/delete`",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/storage/get-admin-ui",
          label: "`GET /v1/admin/ui/{page}`",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/storage/get-admin-data",
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
          id: "api/storage/health",
          label: "`GET /v1/health`",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
